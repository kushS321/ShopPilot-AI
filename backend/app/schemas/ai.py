from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from backend.app.schemas.product import ProductResponse

class ExtractedPreferences(BaseModel):
    category: Optional[str] = Field(None, description="Primary product category extracted from query")
    use_case: Optional[str] = Field(None, description="Target use case, e.g. college, gaming, gym, office")
    budget_min: Optional[float] = Field(None, description="Minimum budget")
    budget_max: Optional[float] = Field(None, description="Maximum budget in query currency")
    currency: str = Field("INR", description="Currency parsed from query, e.g. INR or USD")
    budget_max_usd: Optional[float] = Field(None, description="Normalized maximum budget in USD")
    priorities: List[str] = Field(default_factory=list, description="Priorities like battery life, comfort, mic quality")
    required_features: List[str] = Field(default_factory=list, description="Features explicitly required")
    preferred_brands: List[str] = Field(default_factory=list, description="Brands specifically requested")
    excluded_brands: List[str] = Field(default_factory=list, description="Brands user wants to avoid")
    strict_budget: bool = Field(True, description="Whether exceeding the budget is forbidden")
    query_summary: str = Field("", description="Crisp one-line summary of what the user is looking for")

class ExplainedProduct(BaseModel):
    product: ProductResponse
    match_score: int = Field(..., ge=0, le=100, description="Deterministic match score from 0 to 100")
    match_tier: str = Field(..., description="'Strong Match', 'Good Alternative', or 'Budget Exceeded Alternative'")
    why_recommended: str = Field(..., description="Fact-based explanation grounded in actual specifications")
    key_advantages: List[str] = Field(default_factory=list, description="Advantages matching user's specific priorities")
    trade_offs: List[str] = Field(default_factory=list, description="Honest trade-offs and limitations")
    score_breakdown: Dict[str, int] = Field(default_factory=dict, description="Detailed score component breakdown")

class AIQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000)
    session_id: Optional[str] = None
    existing_preferences: Optional[ExtractedPreferences] = None
    refinement_instruction: Optional[str] = None

class AIRecommendationResponse(BaseModel):
    query: str
    parsed_preferences: ExtractedPreferences
    recommendations: List[ExplainedProduct]
    total_matches: int
    conversational_response: str
    suggested_followups: List[str]
    is_fallback: bool = False
    comparison_summary: Optional[str] = None

