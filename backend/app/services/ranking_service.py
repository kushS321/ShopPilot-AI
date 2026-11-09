from typing import List, Dict, Any, Tuple
from backend.app.models.product import Product
from backend.app.schemas.ai import ExtractedPreferences, ExplainedProduct
from backend.app.schemas.product import ProductResponse

class DeterministicRankingEngine:
    """
    Documented deterministic ranking algorithm that scores products grounded strictly
    in authoritative catalogue specs, hard constraints, priorities, and verified ratings.
    """

    @staticmethod
    def score_product(product: Product, prefs: ExtractedPreferences) -> Tuple[int, str, Dict[str, int], List[str], List[str]]:
        category_score = 0
        budget_score = 0
        feature_score = 0
        brand_score = 0
        quality_score = 0

        advantages = []
        trade_offs = []

        # 1. Category Matching (Max 25 pts)
        if prefs.category:
            pref_cat = prefs.category.lower()
            prod_cat = product.category.lower()
            if pref_cat in prod_cat or prod_cat in pref_cat:
                category_score = 25
            elif any(w in prod_cat for w in pref_cat.split()):
                category_score = 15
        else:
            category_score = 20 # General search

        # 2. Budget Scoring & Hard Constraints (Max 25 pts)
        currency = prefs.currency.upper()
        product_price = product.price_inr if currency == "INR" else product.price
        budget_exceeded = False

        if prefs.budget_max is not None and prefs.budget_max > 0:
            if product_price <= prefs.budget_max:
                # Full marks if within budget
                savings_ratio = (prefs.budget_max - product_price) / prefs.budget_max
                budget_score = 25
                if savings_ratio > 0.3:
                    advantages.append(f"Substantial value: priced at {currency} {product_price:,.0f}, well below your {currency} {prefs.budget_max:,.0f} limit")
                else:
                    advantages.append(f"Comfortably within your {currency} {prefs.budget_max:,.0f} budget at {currency} {product_price:,.0f}")
            else:
                budget_exceeded = True
                excess_pct = (product_price - prefs.budget_max) / prefs.budget_max
                budget_score = max(0, int(25 - (excess_pct * 40)))
                trade_offs.append(f"Exceeds target budget of {currency} {prefs.budget_max:,.0f} by {currency} {(product_price - prefs.budget_max):,.0f} (+{excess_pct*100:.0f}%)")
        else:
            budget_score = 20

        # 3. Feature & Specification Alignment (Max 30 pts)
        specs_lower = {k.lower(): str(v).lower() for k, v in (product.specifications or {}).items()}
        features_lower = " ".join([f.lower() for f in (product.features or [])] + [product.description.lower()])

        matched_priorities = 0
        total_priorities = max(len(prefs.priorities), 1)

        for prio in prefs.priorities:
            prio_clean = prio.lower().strip()
            # Battery Life
            if "battery" in prio_clean:
                bat_spec = specs_lower.get("battery_life", "")
                if any(x in bat_spec for x in ["40", "50", "60", "70", "300"]):
                    feature_score += 10
                    matched_priorities += 1
                    advantages.append(f"Exceptional battery life: {product.specifications.get('battery_life', 'High capacity')}")
                elif "20" in bat_spec or "30" in bat_spec:
                    feature_score += 7
                    matched_priorities += 1
                    advantages.append(f"Solid battery life: {product.specifications.get('battery_life')}")
                else:
                    trade_offs.append(f"Moderate battery endurance: {product.specifications.get('battery_life', 'Standard')}")

            # Comfort & Weight
            elif "comfort" in prio_clean or "weight" in prio_clean:
                weight_spec = specs_lower.get("weight", "")
                if any(x in weight_spec for x in ["147", "160", "27 g", "5.3 g"]):
                    feature_score += 10
                    matched_priorities += 1
                    advantages.append(f"Ultra-lightweight ergonomic build: {product.specifications.get('weight')}")
                elif "earcup" in features_lower or "cushion" in features_lower:
                    feature_score += 8
                    matched_priorities += 1
                    advantages.append("Padded ergonomic cushions designed for long study sessions")
                else:
                    feature_score += 5

            # Microphone Quality & Calls
            elif "mic" in prio_clean or "call" in prio_clean:
                mic_spec = specs_lower.get("microphone", "")
                if "beamforming" in mic_spec or "voice capture" in mic_spec or "ai call" in mic_spec or "dual mic" in mic_spec:
                    feature_score += 10
                    matched_priorities += 1
                    advantages.append(f"Optimized microphone: {product.specifications.get('microphone')}")
                else:
                    feature_score += 5
                    trade_offs.append("Basic microphone suitable for casual calls, but lacks multi-mic noise reduction")

            # Value for Money
            elif "value" in prio_clean or "cheap" in prio_clean or "affordable" in prio_clean:
                if product_price < 3500 and currency == "INR":
                    feature_score += 10
                    matched_priorities += 1
                    advantages.append("High price-to-performance ratio for students")
                elif product_price <= 5000 and currency == "INR":
                    feature_score += 8
                    matched_priorities += 1
                else:
                    feature_score += 4

            # Noise Cancelling / ANC
            elif "noise" in prio_clean or "anc" in prio_clean:
                anc_spec = specs_lower.get("noise_cancelling", "")
                if "active" in anc_spec or "hybrid" in anc_spec:
                    feature_score += 10
                    matched_priorities += 1
                    advantages.append(f"Active noise cancellation: {product.specifications.get('noise_cancelling')}")
                else:
                    trade_offs.append("Passive sound isolation only (No Active Noise Cancellation)")

        # Normalization for feature score
        if not prefs.priorities:
            feature_score = 22
        else:
            feature_score = min(30, max(5, feature_score))

        # 4. Brand Preference (Max 10 pts)
        if prefs.excluded_brands:
            if any(product.brand.lower() == b.lower() for b in prefs.excluded_brands):
                brand_score = -50
                trade_offs.append(f"Brand {product.brand} was listed in your exclusions")
        if prefs.preferred_brands:
            if any(product.brand.lower() == b.lower() for b in prefs.preferred_brands):
                brand_score = 10
                advantages.append(f"Matches your brand preference for {product.brand}")
            else:
                brand_score = 5
        else:
            brand_score = 8

        # 5. Verified Quality & Ratings (Max 10 pts)
        rating = product.rating or 4.0
        quality_score = min(10, int((rating / 5.0) * 10))

        # Total Calculation
        total_score = category_score + budget_score + feature_score + brand_score + quality_score
        total_score = max(0, min(100, total_score))

        # Tier Assignment
        if budget_exceeded:
            tier = "Budget Exceeded Alternative"
            total_score = min(74, total_score) # Cap score if it breaks hard budget
        elif total_score >= 82:
            tier = "Strong Match"
        elif total_score >= 65:
            tier = "Good Alternative"
        else:
            tier = "Partial Match"

        score_breakdown = {
            "category": category_score,
            "budget": budget_score,
            "features_and_specs": feature_score,
            "brand": max(0, brand_score),
            "quality_rating": quality_score
        }

        return total_score, tier, score_breakdown, advantages, trade_offs

    @classmethod
    def rank_products(cls, products: List[Product], prefs: ExtractedPreferences) -> List[ExplainedProduct]:
        results = []
        for p in products:
            score, tier, breakdown, advantages, trade_offs = cls.score_product(p, prefs)
            
            # Grounded reason explanation
            if tier == "Strong Match":
                why = f"Directly satisfies your requirements for {prefs.use_case or 'daily use'} with strong specs ({p.specifications.get('battery_life', 'long battery')}, {p.specifications.get('weight', 'ergonomic design')}) within budget."
            elif tier == "Budget Exceeded Alternative":
                currency = prefs.currency.upper()
                price_val = p.price_inr if currency == "INR" else p.price
                why = f"Offers higher-tier features such as {p.specifications.get('noise_cancelling', 'premium audio')} at {currency} {price_val:,.0f}, slightly above your specified limit."
            else:
                why = f"Solid option with {p.specifications.get('battery_life', 'good battery')}, though with minor trade-offs in features or form factor."

            explained = ExplainedProduct(
                product=ProductResponse.model_validate(p),
                match_score=score,
                match_tier=tier,
                why_recommended=why,
                key_advantages=advantages[:3],
                trade_offs=trade_offs[:2],
                score_breakdown=breakdown
            )
            results.append(explained)

        # Sort strictly by match score descending
        results.sort(key=lambda x: x.match_score, reverse=True)
        return results

