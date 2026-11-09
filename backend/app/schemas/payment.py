from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class PayPalClientConfigResponse(BaseModel):
    client_id: Optional[str]
    environment: str
    currency: str
    is_configured: bool

class CreatePayPalOrderRequest(BaseModel):
    order_id: str
    guest_session_id: str

class CreatePayPalOrderResponse(BaseModel):
    order_id: str
    paypal_order_id: str
    status: str
    currency: str
    amount: float
    approval_url: Optional[str] = None

class CapturePayPalOrderRequest(BaseModel):
    order_id: str
    paypal_order_id: str
    guest_session_id: str

class CapturePayPalOrderResponse(BaseModel):
    success: bool
    status: str
    order_id: str
    paypal_order_id: str
    paypal_capture_id: Optional[str] = None
    payer_email: Optional[str] = None
    payer_name: Optional[str] = None
    total_amount: float
    currency: str
    message: str

