from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.schemas.cart import (
    CartValidationRequest,
    CartValidationResponse,
)
from backend.app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.post("/validate", response_model=CartValidationResponse)
def validate_cart(req: CartValidationRequest, db: Session = Depends(get_db)):
    service = CartService(db)
    return service.validate_and_calculate_cart(req.items, currency=req.currency)

