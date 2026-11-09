import re
import json
import logging
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from backend.app.config import settings
from backend.app.models.product import Product
from backend.app.schemas.ai import (
    ExtractedPreferences,
    ExplainedProduct,
    AIRecommendationResponse,
    AIQueryRequest,
)
from backend.app.services.catalogue_service import CatalogueService
from backend.app.services.ranking_service import DeterministicRankingEngine

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self, db: Session):
        self.db = db
        self.catalogue_service = CatalogueService(db)

    def extract_preferences(self, query: str, existing_prefs: Optional[ExtractedPreferences] = None) -> tuple[ExtractedPreferences, bool]:
        """
        Interprets natural language request. Attempts Gemini API if configured,
        or uses deterministic natural-language parsing with honest fallback flag.
        """
        if settings.GEMINI_API_KEY:
            try:
                from google import genai
                from google.genai import types

                client = genai.Client(api_key=settings.GEMINI_API_KEY)
                prompt = f"""
                You are the precision requirement parser for ShopPilot AI shopping agent.
                Analyze the user query: "{query}"

                Return ONLY a valid JSON object matching this schema:
                {{
                    "category": "Headphones" | "Laptops" | "Smartwatches" | "Keyboards & Mice" | null,
                    "use_case": string or null (e.g., "college", "programming", "gym"),
                    "budget_min": number or null,
                    "budget_max": number or null,
                    "currency": "INR" or "USD",
                    "priorities": ["battery life", "comfort", "microphone quality", ...],
                    "required_features": [...],
                    "preferred_brands": [...],
                    "excluded_brands": [...],
                    "strict_budget": boolean,
                    "query_summary": "one clear summary sentence"
                }}
                """
                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=0.1
                    )
                )
                if response.text:
                    parsed_json = json.loads(response.text)
                    return ExtractedPreferences(**parsed_json), False
            except Exception as e:
                logger.warning(f"Gemini API interpretation failed or timed out: {e}. Falling back to deterministic NLP parser.")

        # Deterministic Rule-Based NLP Parser (Grounded Fallback)
        return self._deterministic_extract(query, existing_prefs), True

    def _deterministic_extract(self, query: str, existing_prefs: Optional[ExtractedPreferences] = None) -> ExtractedPreferences:
        q_lower = query.lower()
        
        # 1. Budget & Currency Extraction
        currency = "INR"
        budget_max = None
        budget_min = None
        
        if "$" in query or "usd" in q_lower or "dollars" in q_lower:
            currency = "USD"
            usd_match = re.search(r'(?:under|below|less than|\$)\s*(\d+(?:\.\d+)?)', q_lower)
            if usd_match:
                budget_max = float(usd_match.group(1))
        else:
            # INR patterns (e.g. ₹5,000, 5000 rs, 5k, under 5000)
            inr_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,2}(?:,\d{3})+|\d+)\s*(?:k|thousand)?', q_lower)
            # Special check for 'under 5,000' or 'under 5000' or '5k'
            k_match = re.search(r'(\d+)\s*k\b', q_lower)
            if k_match:
                budget_max = float(k_match.group(1)) * 1000
                currency = "INR"
            else:
                num_match = re.search(r'(?:under|below|less than|max|budget)\s*(?:₹|rs\.?|inr)?\s*(\d[\d,]*)', q_lower)
                if num_match:
                    clean_num = num_match.group(1).replace(",", "")
                    budget_max = float(clean_num)
                    currency = "INR"
                elif "5,000" in query or "5000" in query:
                    budget_max = 5000.0
                    currency = "INR"

        # 2. Category Detection
        category = None
        if any(w in q_lower for w in ["headphone", "headphones", "earbuds", "earphone", "audio", "headset", "soundcore"]):
            category = "Headphones"
        elif any(w in q_lower for w in ["laptop", "notebook", "macbook", "computer", "pc"]):
            category = "Laptops"
        elif any(w in q_lower for w in ["watch", "smartwatch", "fitness", "band"]):
            category = "Smartwatches"
        elif any(w in q_lower for w in ["mouse", "keyboard", "trackpad", "keychron", "mx master"]):
            category = "Keyboards & Mice"

        # 3. Use Case Detection
        use_case = None
        if any(w in q_lower for w in ["college", "student", "study", "university", "campus", "lecture"]):
            use_case = "college & study"
        elif any(w in q_lower for w in ["office", "work", "meeting", "wfh", "zoom", "teams"]):
            use_case = "office & calls"
        elif any(w in q_lower for w in ["gym", "workout", "running", "sports"]):
            use_case = "sports & workouts"
        elif any(w in q_lower for w in ["gaming", "game", "esports"]):
            use_case = "gaming"

        # 4. Priorities
        priorities = []
        if "battery" in q_lower:
            priorities.append("battery life")
        if "comfort" in q_lower or "light" in q_lower or "wear" in q_lower:
            priorities.append("comfort")
        if "mic" in q_lower or "call" in q_lower or "voice" in q_lower:
            priorities.append("microphone quality")
        if "value" in q_lower or "budget" in q_lower or "cheap" in q_lower or "affordable" in q_lower:
            priorities.append("value for money")
        if "anc" in q_lower or "noise" in q_lower:
            priorities.append("active noise cancellation")

        # 5. Brand mentions
        preferred_brands = []
        all_brands = ["Sony", "boAt", "JBL", "Anker", "Sennheiser", "Apple", "Logitech", "Lenovo", "Samsung", "OnePlus"]
        for b in all_brands:
            if b.lower() in q_lower:
                preferred_brands.append(b)

        # Merge with existing preferences if refining
        if existing_prefs:
            category = category or existing_prefs.category
            use_case = use_case or existing_prefs.use_case
            budget_max = budget_max if budget_max is not None else existing_prefs.budget_max
            currency = currency or existing_prefs.currency
            merged_priorities = list(set(priorities + existing_prefs.priorities))
            priorities = merged_priorities
            if not preferred_brands:
                preferred_brands = existing_prefs.preferred_brands

        summary = f"{category or 'Tech products'} for {use_case or 'daily life'}"
        if budget_max:
            summary += f" under {currency} {budget_max:,.0f}"

        return ExtractedPreferences(
            category=category,
            use_case=use_case,
            budget_min=budget_min,
            budget_max=budget_max,
            currency=currency,
            budget_max_usd=budget_max * settings.INR_TO_USD_RATE if (budget_max and currency == "INR") else budget_max,
            priorities=priorities,
            required_features=[],
            preferred_brands=preferred_brands,
            excluded_brands=[],
            strict_budget=True,
            query_summary=summary
        )

    def process_recommendation_request(self, req: AIQueryRequest) -> AIRecommendationResponse:
        """
        Coordinates full pipeline: natural language parse -> catalogue retrieval ->
        deterministic scoring -> grounded explanations -> structured response.
        """
        prefs, is_fallback = self.extract_preferences(req.query, req.existing_preferences)

        # Retrieve candidates from authoritative DB
        all_products = self.catalogue_service.get_products(
            category=prefs.category,
            limit=50
        )

        if not all_products and prefs.category:
            # Fallback search without category constraint
            all_products = self.catalogue_service.get_products(limit=50)

        # Apply deterministic ranking engine
        ranked_products = DeterministicRankingEngine.rank_products(all_products, prefs)

        # Build natural language narrative grounded in catalogue data
        strong_matches = [r for r in ranked_products if r.match_tier == "Strong Match"]
        alternatives = [r for r in ranked_products if r.match_tier != "Strong Match"]

        if strong_matches:
            top_pick = strong_matches[0]
            narrative = (
                f"Based on your requirements for **{prefs.query_summary}**, "
                f"I ranked **{top_pick.product.name}** as your #1 match ({top_pick.match_score}/100). "
                f"It delivers {top_pick.product.specifications.get('battery_life', 'long battery life')}, "
                f"weighs only {top_pick.product.specifications.get('weight', 'lightweight')}, "
                f"and is verified in our catalogue at {prefs.currency} {top_pick.product.price_inr:,.0f} "
                f"(${top_pick.product.price:.2f}), safely within your budget."
            )
        elif ranked_products:
            top_pick = ranked_products[0]
            narrative = (
                f"I evaluated products matching '{req.query}'. "
                f"The closest option is the **{top_pick.product.name}** ({top_pick.match_score}/100), "
                f"priced at {prefs.currency} {top_pick.product.price_inr:,.0f} (${top_pick.product.price:.2f})."
            )
        else:
            narrative = "No products found matching these exact criteria in the verified catalogue."

        # Suggested follow-ups
        followups = [
            "Show me cheaper alternatives under ₹3,000",
            "Compare top 2 wireless headphones",
            "Prioritize Active Noise Cancellation (ANC)",
            "Which one has the best microphone for online classes?"
        ]

        return AIRecommendationResponse(
            query=req.query,
            parsed_preferences=prefs,
            recommendations=ranked_products[:6], # Top 6 recommendations
            total_matches=len(ranked_products),
            conversational_response=narrative,
            suggested_followups=followups,
            is_fallback=is_fallback,
            comparison_summary=f"Compared {len(ranked_products)} products across battery life, comfort, microphone specs, and verified pricing."
        )

# Type alias helper
Tuple_Extracted = tuple[ExtractedPreferences, bool]

