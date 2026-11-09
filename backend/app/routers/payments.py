import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.schemas.payment import (
    PayPalClientConfigResponse,
    CreatePayPalOrderRequest,
    CreatePayPalOrderResponse,
    CapturePayPalOrderRequest,
    CapturePayPalOrderResponse,
)
from backend.app.services.order_service import OrderService
from backend.app.services.paypal_service import PayPalService

router = APIRouter(prefix="/payments", tags=["Payments"])

@router.get("/paypal/config", response_model=PayPalClientConfigResponse)
def get_paypal_config():
    paypal_svc = PayPalService()
    return PayPalClientConfigResponse(
        client_id=settings.PAYPAL_CLIENT_ID if paypal_svc.is_configured() else None,
        environment=settings.PAYPAL_ENVIRONMENT,
        currency=settings.DEFAULT_CURRENCY,
        is_configured=paypal_svc.is_configured()
    )

@router.post("/paypal/create-order", response_model=CreatePayPalOrderResponse)
async def create_paypal_order(
    req: CreatePayPalOrderRequest,
    db: Session = Depends(get_db)
):
    order_service = OrderService(db)
    paypal_service = PayPalService()

    # Authoritative internal order lookup and session verification
    order = order_service.get_order_by_id(req.order_id, req.guest_session_id)

    if order.status == "PAID":
        raise HTTPException(status_code=400, detail="Order has already been paid.")

    # Call PayPal Sandbox API
    paypal_order_data = await paypal_service.create_paypal_order(order)
    paypal_order_id = paypal_order_data.get("id")

    if not paypal_order_id:
        raise HTTPException(status_code=502, detail="PayPal failed to generate an order ID.")

    # Update internal state to AWAITING_PAYMENT_APPROVAL
    order_service.set_awaiting_approval(order.id, paypal_order_id)

    approval_url = None
    for link in paypal_order_data.get("links", []):
        if link.get("rel") == "approve":
            approval_url = link.get("href")
            break

    return CreatePayPalOrderResponse(
        order_id=order.id,
        paypal_order_id=paypal_order_id,
        status="CREATED",
        currency=order.currency,
        amount=order.total_amount,
        approval_url=approval_url
    )

@router.post("/paypal/capture-order", response_model=CapturePayPalOrderResponse)
async def capture_paypal_order(
    req: CapturePayPalOrderRequest,
    db: Session = Depends(get_db)
):
    order_service = OrderService(db)
    paypal_service = PayPalService()

    order = order_service.get_order_by_id(req.order_id, req.guest_session_id)

    # Server-side capture call to PayPal Orders API
    success, capture_data, validation_msg = await paypal_service.capture_paypal_order(
        req.paypal_order_id,
        order
    )

    if not success:
        order_service.mark_as_failed(order.id, validation_msg)
        raise HTTPException(status_code=400, detail=f"Payment capture failed: {validation_msg}")

    # Extract capture details
    capture_id = None
    payer_email = None
    payer_name = None

    try:
        units = capture_data.get("purchase_units", [])
        if units:
            payments = units[0].get("payments", {})
            captures = payments.get("captures", [])
            if captures:
                capture_id = captures[0].get("id")

        payer = capture_data.get("payer", {})
        payer_email = payer.get("email_address")
        name_info = payer.get("name", {})
        payer_name = f"{name_info.get('given_name', '')} {name_info.get('surname', '')}".strip() or None
    except Exception:
        pass

    # Update internal order to PAID
    order_service.mark_as_paid(
        order_id=order.id,
        paypal_capture_id=capture_id or f"cap_{req.paypal_order_id}",
        payer_email=payer_email,
        payer_name=payer_name,
        raw_response=json.dumps(capture_data)
    )

    return CapturePayPalOrderResponse(
        success=True,
        status="COMPLETED",
        order_id=order.id,
        paypal_order_id=req.paypal_order_id,
        paypal_capture_id=capture_id,
        payer_email=payer_email,
        payer_name=payer_name,
        total_amount=order.total_amount,
        currency=order.currency,
        message="Payment successfully verified and order marked as paid."
    )

