from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
from backend.app.schemas.cart import CartItemInput

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product_name: str
    unit_price: float
    quantity: int
    line_total: float

    model_config = ConfigDict(from_attributes=True)

class OrderCreateRequest(BaseModel):
    guest_session_id: str
    items: List[CartItemInput]
    shipping_details: Optional[Dict[str, Any]] = None

class OrderResponse(BaseModel):
    id: str
    guest_session_id: str
    status: str
    currency: str
    subtotal: float
    shipping_cost: float
    tax_amount: float
    total_amount: float
    paypal_order_id: Optional[str] = None
    paypal_capture_id: Optional[str] = None
    payer_email: Optional[str] = None
    payer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    paid_at: Optional[datetime] = None
    items: List[OrderItemResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
