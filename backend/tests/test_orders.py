def test_create_order_lifecycle(client):
    payload = {
        "guest_session_id": "sess_test_123",
        "items": [
            {"product_id": "prod_sony_whch520", "quantity": 1}
        ]
    }
    response = client.post("/api/orders", json=payload)
    assert response.status_code == 200
    order = response.json()
    assert order["id"].startswith("ord_")
    assert order["status"] == "PENDING"
    assert order["total_amount"] == 56.70 # 54 + 0 ship + 2.70 tax
    assert len(order["items"]) == 1
    assert order["items"][0]["product_id"] == "prod_sony_whch520"

    # Fetch order by ID with same guest session
    order_id = order["id"]
    get_resp = client.get(f"/api/orders/{order_id}?guest_session_id=sess_test_123")
    assert get_resp.status_code == 200
    assert get_resp.json()["id"] == order_id

    # Denied with different guest session
    bad_resp = client.get(f"/api/orders/{order_id}?guest_session_id=unauthorized_guest")
    assert bad_resp.status_code == 404

def test_guest_order_history(client):
    session_id = "sess_history_test"
    # Create two orders
    client.post("/api/orders", json={
        "guest_session_id": session_id,
        "items": [{"product_id": "prod_boat_rockerz550", "quantity": 1}]
    })
    client.post("/api/orders", json={
        "guest_session_id": session_id,
        "items": [{"product_id": "prod_jbl_tune510bt", "quantity": 1}]
    })

    resp = client.get(f"/api/orders/history/guest?guest_session_id={session_id}")
    assert resp.status_code == 200
    orders = resp.json()
    assert len(orders) >= 2

