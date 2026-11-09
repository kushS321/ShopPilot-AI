import pytest
from unittest.mock import AsyncMock, patch
from backend.app.services.paypal_service import PayPalService
from backend.app.models.order import Order

def test_paypal_config_endpoint(client):
    response = client.get("/api/payments/paypal/config")
    assert response.status_code == 200
    data = response.json()
    assert "environment" in data
    assert data["environment"] == "sandbox"
    assert "is_configured" in data

def test_create_paypal_order_unconfigured_error(client):
    """
    Without PayPal credentials configured in test env, must cleanly return 503
    with clear error message instead of crashing or generating fake success.
    """
    # Create an order first
    order_resp = client.post("/api/orders", json={
        "guest_session_id": "sess_pay_test",
        "items": [{"product_id": "prod_sony_whch520", "quantity": 1}]
    })
    order_id = order_resp.json()["id"]

    # Attempt to create PayPal order
    response = client.post("/api/payments/paypal/create-order", json={
        "order_id": order_id,
        "guest_session_id": "sess_pay_test"
    })
    # Should cleanly report credentials missing
    assert response.status_code == 503
    assert "PayPal Sandbox credentials" in response.json()["detail"]

@pytest.mark.asyncio
async def test_paypal_capture_verification_logic():
    """
    Directly unit tests the server-side payment verification algorithm in PayPalService.
    """
    service = PayPalService()
    dummy_order = Order(
        id="ord_test_999",
        total_amount=56.70,
        currency="USD"
    )

    # 1. Valid capture payload
    valid_payload = {
        "status": "COMPLETED",
        "purchase_units": [{
            "custom_id": "ord_test_999",
            "payments": {
                "captures": [{
                    "id": "CAP_12345",
                    "status": "COMPLETED",
                    "amount": {"currency_code": "USD", "value": "56.70"}
                }]
            }
        }]
    }
    is_valid, msg = service._validate_capture_payload(valid_payload, dummy_order)
    assert is_valid is True
    assert msg == "Payment verified successfully"

    # 2. Tampered / mismatched amount attack
    tampered_amount_payload = {
        "status": "COMPLETED",
        "purchase_units": [{
            "custom_id": "ord_test_999",
            "payments": {
                "captures": [{
                    "id": "CAP_12345",
                    "status": "COMPLETED",
                    "amount": {"currency_code": "USD", "value": "0.01"} # attacker tries 1 cent!
                }]
            }
        }]
    }
    is_valid, msg = service._validate_capture_payload(tampered_amount_payload, dummy_order)
    assert is_valid is False
    assert "Amount mismatch" in msg

    # 3. Currency mismatch attack
    mismatched_curr_payload = {
        "status": "COMPLETED",
        "purchase_units": [{
            "custom_id": "ord_test_999",
            "payments": {
                "captures": [{
                    "id": "CAP_12345",
                    "status": "COMPLETED",
                    "amount": {"currency_code": "EUR", "value": "56.70"}
                }]
            }
        }]
    }
    is_valid, msg = service._validate_capture_payload(mismatched_curr_payload, dummy_order)
    assert is_valid is False
    assert "Currency mismatch" in msg

    # 4. Custom ID / order association mismatch
    mismatched_id_payload = {
        "status": "COMPLETED",
        "purchase_units": [{
            "custom_id": "ord_different_victim",
            "payments": {
                "captures": [{
                    "id": "CAP_12345",
                    "status": "COMPLETED",
                    "amount": {"currency_code": "USD", "value": "56.70"}
                }]
            }
        }]
    }
    is_valid, msg = service._validate_capture_payload(mismatched_id_payload, dummy_order)
    assert is_valid is False
    assert "Security mismatch" in msg

