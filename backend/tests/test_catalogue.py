def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database_connected"] is True
    assert "paypal_sandbox" in data

def test_list_products(client):
    response = client.get("/api/products")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert any(p["id"] == "prod_sony_whch520" for p in products)

def test_filter_products_by_category(client):
    response = client.get("/api/products?category=Headphones")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert all(p["category"] == "Headphones" for p in products)

def test_filter_products_by_price_inr(client):
    response = client.get("/api/products?currency=INR&max_price=3000")
    assert response.status_code == 200
    products = response.json()
    assert len(products) > 0
    assert all(p["price_inr"] <= 3000 for p in products)

def test_search_products(client):
    response = client.get("/api/products?search=Sony")
    assert response.status_code == 200
    products = response.json()
    assert len(products) >= 1
    assert any("Sony" in p["name"] for p in products)

def test_get_product_detail(client):
    response = client.get("/api/products/prod_sony_whch520")
    assert response.status_code == 200
    product = response.json()
    assert product["name"] == "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones"
    assert product["brand"] == "Sony"
    assert "battery_life" in product["specifications"]

def test_get_nonexistent_product(client):
    response = client.get("/api/products/non_existent_id")
    assert response.status_code == 404

def test_product_comparison(client):
    payload = {
        "product_ids": ["prod_sony_whch520", "prod_boat_rockerz550", "prod_jbl_tune510bt"]
    }
    response = client.post("/api/products/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["products"]) == 3
    assert "battery_life" in data["all_spec_keys"]
    assert "spec_matrix" in data
    assert "price_differences" in data
    assert data["best_value_product_id"] is not None

def test_product_comparison_invalid_count(client):
    payload = {"product_ids": ["prod_sony_whch520"]}
    response = client.post("/api/products/compare", json=payload)
    assert response.status_code == 422 # Min length is 2

