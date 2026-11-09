from pydantic import BaseModel, Field
from typing import List, Optional

class CartItemInput(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1, le=50)

class CartValidationRequest(BaseModel):
    items: List[CartItemInput]
    currency: str = "USD"

class CartItemValidated(BaseModel):
    product_id: str
    product_name: str
    brand: str
    image_url: str
    unit_price: float
    price_inr: float
    quantity: int
    line_total: float
    is_in_stock: bool
    stock_quantity: int

class CartValidationResponse(BaseModel):
    items: List[CartItemValidated]
    item_count: int
    subtotal: float
    shipping_cost: float
    tax_amount: float
    total_amount: float
    currency: str = "USD"
    is_valid: bool
    validation_errors: List[str] = Field(default_factory=list)

