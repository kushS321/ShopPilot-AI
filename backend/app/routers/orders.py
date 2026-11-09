from fastapi import APIRouter, Depends, Query, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.database import get_db
from backend.app.schemas.order import OrderCreateRequest, OrderResponse
from backend.app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("", response_model=OrderResponse)
def create_order(req: OrderCreateRequest, db: Session = Depends(get_db)):
    service = OrderService(db)
    return service.create_order(req.guest_session_id, req.items)

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(
    order_id: str,
    guest_session_id: Optional[str] = Query(None),
    x_guest_session: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    session_id = guest_session_id or x_guest_session
    service = OrderService(db)
    return service.get_order_by_id(order_id, session_id)

@router.get("/history/guest", response_model=List[OrderResponse])
def get_guest_order_history(
    guest_session_id: str = Query(...),
    db: Session = Depends(get_db)
):
    service = OrderService(db)
    return service.get_guest_orders(guest_session_id)

