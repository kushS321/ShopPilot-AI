def test_cart_authoritative_calculation(client):
    payload = {
        "items": [
            {"product_id": "prod_sony_whch520", "quantity": 1}, # $54.00
            {"product_id": "prod_boat_rockerz550", "quantity": 2} # $24.00 * 2 = $48.00
        ]
    }
    response = client.post("/api/cart/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["item_count"] == 3
    
    # Authoritative calculation: 54.00 + 48.00 = 102.00
    assert data["subtotal"] == 102.00
    # Over $50 -> shipping free
    assert data["shipping_cost"] == 0.00
    # Tax: 102.00 * 0.05 = 5.10
    assert data["tax_amount"] == 5.10
    # Total: 102.00 + 5.10 = 107.10
    assert data["total_amount"] == 107.10

def test_cart_under_free_shipping_threshold(client):
    payload = {
        "items": [
            {"product_id": "prod_boat_rockerz550", "quantity": 1} # $24.00
        ]
    }
    response = client.post("/api/cart/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["subtotal"] == 24.00
    # Under $50 -> shipping $5.00
    assert data["shipping_cost"] == 5.00
    assert data["tax_amount"] == 1.20
    assert data["total_amount"] == 30.20

def test_cart_rejects_invalid_quantity(client):
    payload = {
        "items": [
            {"product_id": "prod_sony_whch520", "quantity": 0}
        ]
    }
    response = client.post("/api/cart/validate", json=payload)
    assert response.status_code == 422 # Pydantic ge=1 validation

def test_cart_rejects_nonexistent_product(client):
    payload = {
        "items": [
            {"product_id": "invalid_fake_id", "quantity": 1}
        ]
    }
    response = client.post("/api/cart/validate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert len(data["validation_errors"]) > 0
    assert "was not found" in data["validation_errors"][0]

