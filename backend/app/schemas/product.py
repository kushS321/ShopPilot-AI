from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional, Any
from datetime import datetime

class ProductBase(BaseModel):
    id: str
    name: str
    brand: str
    category: str
    description: str
    price: float
    price_inr: float
    currency: str = "USD"
    image_url: str
    features: List[str] = Field(default_factory=list)
    specifications: Dict[str, Any] = Field(default_factory=dict)
    is_in_stock: bool = True
    stock_quantity: int = 25
    rating: float = 4.5
    review_count: int = 0
    data_source: str = "ShopPilot Verified Catalogue"

class ProductResponse(ProductBase):
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ProductFilterParams(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    search: Optional[str] = None
    sort_by: Optional[str] = "relevance"
    limit: int = 20
    offset: int = 0

class ProductComparisonRequest(BaseModel):
    product_ids: List[str] = Field(..., min_length=2, max_length=4)

class ProductComparisonResponse(BaseModel):
    products: List[ProductResponse]
    all_spec_keys: List[str]
    spec_matrix: Dict[str, Dict[str, Any]]
    price_differences: Dict[str, float]
    ai_comparison_verdict: Optional[str] = None
    best_value_product_id: Optional[str] = None
