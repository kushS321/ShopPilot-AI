import uuid
from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.app.models.order import Order, OrderItem, OrderStatus, PaymentRecord
from backend.app.schemas.cart import CartItemInput
from backend.app.services.cart_service import CartService

class OrderService:
    def __init__(self, db: Session):
        self.db = db
        self.cart_service = CartService(db)

    def create_order(self, guest_session_id: str, items: List[CartItemInput]) -> Order:
        if not guest_session_id:
            raise HTTPException(status_code=400, detail="guest_session_id is required")

        cart_val = self.cart_service.validate_and_calculate_cart(items)
        if not cart_val.is_valid:
            detail = "; ".join(cart_val.validation_errors) if cart_val.validation_errors else "Empty cart"
            raise HTTPException(status_code=400, detail=f"Cannot create order: {detail}")

        order_id = f"ord_{uuid.uuid4().hex[:12]}"
        order = Order(
            id=order_id,
            guest_session_id=guest_session_id,
            status=OrderStatus.PENDING.value,
            currency=cart_val.currency,
            subtotal=cart_val.subtotal,
            shipping_cost=cart_val.shipping_cost,
            tax_amount=cart_val.tax_amount,
            total_amount=cart_val.total_amount,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        self.db.add(order)

        for item in cart_val.items:
            order_item = OrderItem(
                id=f"item_{uuid.uuid4().hex[:12]}",
                order_id=order_id,
                product_id=item.product_id,
                product_name=item.product_name,
                unit_price=item.unit_price,
                quantity=item.quantity,
                line_total=item.line_total
            )
            self.db.add(order_item)

        self.db.commit()
        self.db.refresh(order)
        return order

    def get_order_by_id(self, order_id: str, guest_session_id: Optional[str] = None) -> Order:
        query = self.db.query(Order).filter(Order.id == order_id)
        if guest_session_id:
            query = query.filter(Order.guest_session_id == guest_session_id)
        order = query.first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found or access denied")
        return order

    def get_guest_orders(self, guest_session_id: str) -> List[Order]:
        if not guest_session_id:
            return []
        return self.db.query(Order).filter(Order.guest_session_id == guest_session_id).order_by(Order.created_at.desc()).all()

    def set_awaiting_approval(self, order_id: str, paypal_order_id: str) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order.paypal_order_id = paypal_order_id
        order.status = OrderStatus.AWAITING_PAYMENT_APPROVAL.value
        order.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(order)
        return order

    def mark_as_paid(
        self,
        order_id: str,
        paypal_capture_id: str,
        payer_email: Optional[str] = None,
        payer_name: Optional[str] = None,
        raw_response: Optional[str] = None
    ) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Idempotency check: already marked paid
        if order.status == OrderStatus.PAID.value:
            return order

        order.status = OrderStatus.PAID.value
        order.paypal_capture_id = paypal_capture_id
        order.payer_email = payer_email
        order.payer_name = payer_name
        order.paid_at = datetime.utcnow()
        order.updated_at = datetime.utcnow()

        # Audit payment record
        payment_record = PaymentRecord(
            id=f"pay_{uuid.uuid4().hex[:12]}",
            order_id=order.id,
            paypal_order_id=order.paypal_order_id or "unknown",
            paypal_capture_id=paypal_capture_id,
            amount=order.total_amount,
            currency=order.currency,
            status="COMPLETED",
            raw_response=raw_response,
            created_at=datetime.utcnow()
        )
        self.db.add(payment_record)

        self.db.commit()
        self.db.refresh(order)
        return order

    def mark_as_failed(self, order_id: str, reason: str) -> Order:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        order.status = OrderStatus.FAILED.value
        order.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(order)
        return order

