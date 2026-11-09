import httpx
import json
import base64
import logging
from typing import Optional, Dict, Any, Tuple
from fastapi import HTTPException
from backend.app.config import settings
from backend.app.models.order import Order

logger = logging.getLogger(__name__)

class PayPalService:
    def __init__(self):
        self.base_url = settings.PAYPAL_BASE_URL.rstrip('/')
        self.client_id = settings.PAYPAL_CLIENT_ID
        self.client_secret = settings.PAYPAL_CLIENT_SECRET
        self._cached_token: Optional[str] = None

    def is_configured(self) -> bool:
        if not self.client_id or not self.client_secret:
            return False
        if any(ph in self.client_id.lower() for ph in ["your_", "placeholder", "here"]):
            return False
        return True

    async def get_access_token(self) -> str:
        """
        Authenticates with PayPal OAuth2 endpoint using client credentials.
        """
        if not self.is_configured():
            raise HTTPException(
                status_code=503,
                detail="PayPal Sandbox credentials (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET) are not configured. Please add them to .env."
            )

        auth_str = f"{self.client_id}:{self.client_secret}"
        encoded_auth = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

        headers = {
            "Authorization": f"Basic {encoded_auth}",
            "Content-Type": "application/x-www-form-urlencoded"
        }
        data = {"grant_type": "client_credentials"}

        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v1/oauth2/token",
                    headers=headers,
                    data=data
                )
                if response.status_code != 200:
                    logger.error(f"PayPal OAuth failed ({response.status_code}): {response.text}")
                    raise HTTPException(
                        status_code=502,
                        detail=f"PayPal Sandbox authentication failed: HTTP {response.status_code}"
                    )
                token_data = response.json()
                self._cached_token = token_data.get("access_token")
                return self._cached_token
            except httpx.RequestError as exc:
                logger.error(f"PayPal connection error: {exc}")
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to reach PayPal Sandbox server: {str(exc)}"
                )

    async def create_paypal_order(self, order: Order) -> Dict[str, Any]:
        """
        Creates an authoritative PayPal Orders v2 resource tied to the internal order.
        """
        token = await self.get_access_token()

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "PayPal-Request-Id": f"create_{order.id}"
        }

        # Build items for breakdown
        items_payload = []
        for item in order.items:
            items_payload.append({
                "name": item.product_name[:120],
                "quantity": str(item.quantity),
                "unit_amount": {
                    "currency_code": order.currency,
                    "value": f"{item.unit_price:.2f}"
                }
            })

        order_payload = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "reference_id": f"ref_{order.id}",
                    "custom_id": order.id,
                    "description": f"ShopPilot AI Order {order.id}",
                    "amount": {
                        "currency_code": order.currency,
                        "value": f"{order.total_amount:.2f}",
                        "breakdown": {
                            "item_total": {
                                "currency_code": order.currency,
                                "value": f"{order.subtotal:.2f}"
                            },
                            "shipping": {
                                "currency_code": order.currency,
                                "value": f"{order.shipping_cost:.2f}"
                            },
                            "tax_total": {
                                "currency_code": order.currency,
                                "value": f"{order.tax_amount:.2f}"
                            }
                        }
                    },
                    "items": items_payload
                }
            ],
            "application_context": {
                "brand_name": "ShopPilot AI",
                "landing_page": "NO_PREFERENCE",
                "user_action": "PAY_NOW",
                "return_url": "http://localhost:5173/checkout/complete",
                "cancel_url": "http://localhost:5173/checkout/cancel"
            }
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v2/checkout/orders",
                    headers=headers,
                    json=order_payload
                )
                if response.status_code not in (200, 201):
                    logger.error(f"PayPal create order failed: {response.status_code} - {response.text}")
                    raise HTTPException(
                        status_code=502,
                        detail=f"PayPal order creation failed: {response.text}"
                    )
                return response.json()
            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=503,
                    detail=f"Network error connecting to PayPal: {str(exc)}"
                )

    async def capture_paypal_order(self, paypal_order_id: str, expected_order: Order) -> Tuple[bool, Dict[str, Any], str]:
        """
        Executes server-side capture and authoritatively validates amount, currency,
        order association, and status.
        """
        token = await self.get_access_token()

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "PayPal-Request-Id": f"capture_{expected_order.id}_{paypal_order_id}"
        }

        async with httpx.AsyncClient(timeout=25.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/v2/checkout/orders/{paypal_order_id}/capture",
                    headers=headers
                )
                
                # Check for idempotent already captured response
                if response.status_code == 422:
                    error_data = response.json()
                    issues = error_data.get("details", [])
                    if any(i.get("issue") == "ORDER_ALREADY_CAPTURED" for i in issues):
                        # Fetch the order details to verify
                        return await self.verify_existing_capture(paypal_order_id, expected_order)

                if response.status_code not in (200, 201):
                    logger.error(f"PayPal capture failed: {response.status_code} - {response.text}")
                    return False, response.json() if response.headers.get("content-type") == "application/json" else {}, f"Capture failed: HTTP {response.status_code}"

                capture_data = response.json()
                is_valid, validation_msg = self._validate_capture_payload(capture_data, expected_order)
                return is_valid, capture_data, validation_msg

            except httpx.RequestError as exc:
                raise HTTPException(
                    status_code=503,
                    detail=f"Network error communicating with PayPal: {str(exc)}"
                )

    def _validate_capture_payload(self, capture_data: Dict[str, Any], order: Order) -> Tuple[bool, str]:
        """
        Performs authoritative security checks on the captured payment data.
        """
        order_status = capture_data.get("status")
        if order_status != "COMPLETED":
            return False, f"PayPal Order status is '{order_status}', expected 'COMPLETED'"

        purchase_units = capture_data.get("purchase_units", [])
        if not purchase_units:
            return False, "No purchase units returned by PayPal"

        unit = purchase_units[0]
        custom_id = unit.get("custom_id")
        if custom_id and custom_id != order.id:
            return False, f"Security mismatch: PayPal custom_id '{custom_id}' does not match internal order '{order.id}'"

        payments = unit.get("payments", {})
        captures = payments.get("captures", [])
        if not captures:
            return False, "No capture record present in PayPal response"

        primary_capture = captures[0]
        capture_status = primary_capture.get("status")
        if capture_status != "COMPLETED":
            return False, f"PayPal capture status is '{capture_status}', expected 'COMPLETED'"

        amount_info = primary_capture.get("amount", {})
        captured_val_str = amount_info.get("value")
        captured_curr = amount_info.get("currency_code")

        if captured_curr != order.currency:
            return False, f"Currency mismatch: expected {order.currency}, received {captured_curr}"

        try:
            captured_val = float(captured_val_str)
            if abs(captured_val - order.total_amount) > 0.01:
                return False, f"Amount mismatch: expected {order.total_amount:.2f}, captured {captured_val:.2f}"
        except (ValueError, TypeError):
            return False, f"Invalid capture amount format: '{captured_val_str}'"

        return True, "Payment verified successfully"

    async def verify_existing_capture(self, paypal_order_id: str, order: Order) -> Tuple[bool, Dict[str, Any], str]:
        """
        Retrieves existing order details from PayPal Orders API when idempotently re-queried.
        """
        token = await self.get_access_token()
        headers = {"Authorization": f"Bearer {token}"}
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(f"{self.base_url}/v2/checkout/orders/{paypal_order_id}", headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                is_valid, msg = self._validate_capture_payload(data, order)
                return is_valid, data, msg
            return False, {}, "Could not verify existing capture"
