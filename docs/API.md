# ShopPilot AI — REST API Documentation

Base URL: `http://localhost:8000/api`  
Interactive OpenAPI / Swagger UI: `http://localhost:8000/api/docs`

---

## 1. System Health

### `GET /health`
Returns system readiness, database connectivity, and configured status of Google Gemini and PayPal Sandbox.

**Response `200 OK`:**
```json
{
  "status": "healthy",
  "service": "ShopPilot AI",
  "version": "1.0.0",
  "database_connected": true,
  "ai_provider": {
    "name": "Google Gemini",
    "model": "gemini-2.5-flash",
    "configured": false
  },
  "paypal_sandbox": {
    "environment": "sandbox",
    "configured": true,
    "client_id_available": true
  }
}
```

---

## 2. Product Catalogue

### `GET /products`
List, search, filter, and sort catalogue products.

**Query Parameters:**
- `category` (string, optional): e.g. `"Headphones"`, `"Laptops"`.
- `brand` (string, optional): e.g. `"Sony"`, `"Apple"`.
- `min_price` (float, optional): minimum price filter.
- `max_price` (float, optional): maximum price filter.
- `currency` (string, default `"USD"`): `"USD"` or `"INR"`.
- `search` (string, optional): full-text search across name, brand, description, and features.
- `sort_by` (string, default `"relevance"`): `"relevance"` | `"price_asc"` | `"price_desc"` | `"rating"`.
- `limit` (int, default `20`, max `100`).
- `offset` (int, default `0`).

**Response `200 OK`:** Array of `ProductResponse` objects.

---

### `GET /products/{product_id}`
Retrieve a single product's verified specifications.

**Response `200 OK`:**
```json
{
  "id": "prod_sony_whch520",
  "name": "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones",
  "brand": "Sony",
  "category": "Headphones",
  "description": "Engineered for daily student life and hybrid work...",
  "price": 54.0,
  "price_inr": 4490.0,
  "currency": "USD",
  "image_url": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?...",
  "features": [
    "Up to 50 hours battery life (3-min quick charge gives 1.5 hours)",
    "Multipoint connection seamlessly switches between laptop and phone"
  ],
  "specifications": {
    "battery_life": "50 hours",
    "weight": "147 g",
    "connectivity": "Bluetooth 5.2",
    "noise_cancelling": "Passive Sound Isolation"
  },
  "is_in_stock": true,
  "stock_quantity": 42,
  "rating": 4.6,
  "review_count": 1420,
  "data_source": "ShopPilot Verified Catalogue"
}
```

---

### `POST /products/compare`
Compare 2 to 4 products side by side with spec matrix and price difference analysis.

**Request Body:**
```json
{
  "product_ids": [
    "prod_sony_whch520",
    "prod_boat_rockerz550",
    "prod_jbl_tune510bt"
  ]
}
```

**Response `200 OK`:**
```json
{
  "products": [...],
  "all_spec_keys": ["battery_life", "charging_port", "connectivity", "driver_size", "microphone", "noise_cancelling", "weight"],
  "spec_matrix": {
    "battery_life": {
      "prod_sony_whch520": "50 hours",
      "prod_boat_rockerz550": "20 hours",
      "prod_jbl_tune510bt": "40 hours"
    }
  },
  "price_differences": {
    "prod_boat_rockerz550": 0.0,
    "prod_jbl_tune510bt": 12.0,
    "prod_sony_whch520": 30.0
  },
  "best_value_product_id": "prod_boat_rockerz550",
  "ai_comparison_verdict": "Across these 3 products, the boAt Rockerz 550 delivers the most balanced performance and value per dollar."
}
```

---

## 3. AI Shopping Intelligence

### `POST /ai/query`
Interprets a natural-language shopping query, extracts structured requirements, queries the verified catalogue, executes deterministic ranking, and returns grounded explanations.

**Request Body:**
```json
{
  "query": "I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."
}
```

**Response `200 OK`:**
```json
{
  "query": "I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities.",
  "parsed_preferences": {
    "category": "Headphones",
    "use_case": "college & study",
    "budget_min": null,
    "budget_max": 5000.0,
    "currency": "INR",
    "budget_max_usd": 60.0,
    "priorities": ["battery life", "comfort", "microphone quality", "value for money"],
    "required_features": [],
    "preferred_brands": [],
    "excluded_brands": [],
    "strict_budget": true,
    "query_summary": "Headphones for college & study under INR 5,000"
  },
  "recommendations": [
    {
      "product": { ... },
      "match_score": 96,
      "match_tier": "Strong Match",
      "why_recommended": "Directly satisfies your requirements for college & study with strong specs (50 hours, 147 g) within budget.",
      "key_advantages": [
        "Substantial value: priced at INR 4,490, well below your INR 5,000 limit",
        "Exceptional battery life: 50 hours",
        "Ultra-lightweight ergonomic build: 147 g"
      ],
      "trade_offs": [
        "Passive sound isolation only (No Active Noise Cancellation)"
      ],
      "score_breakdown": {
        "category": 25,
        "budget": 25,
        "features_and_specs": 28,
        "brand": 8,
        "quality_rating": 10
      }
    }
  ],
  "total_matches": 6,
  "conversational_response": "Based on your requirements for **Headphones for college & study under INR 5,000**, I ranked **Sony WH-CH520 Wireless On-Ear Bluetooth Headphones** as your #1 match (96/100)...",
  "suggested_followups": [
    "Show me cheaper alternatives under ₹3,000",
    "Compare top 2 wireless headphones",
    "Prioritize Active Noise Cancellation (ANC)",
    "Which one has the best microphone for online classes?"
  ],
  "is_fallback": false
}
```

---

## 4. Shopping Cart & Authoritative Pricing

### `POST /cart/validate`
Authoritatively recalculates subtotal, shipping, and taxes from database records. Never trusts client prices.

**Request Body:**
```json
{
  "items": [
    { "product_id": "prod_sony_whch520", "quantity": 1 }
  ],
  "currency": "USD"
}
```

**Response `200 OK`:**
```json
{
  "items": [
    {
      "product_id": "prod_sony_whch520",
      "product_name": "Sony WH-CH520 Wireless On-Ear Bluetooth Headphones",
      "brand": "Sony",
      "image_url": "https://...",
      "unit_price": 54.0,
      "price_inr": 4490.0,
      "quantity": 1,
      "line_total": 54.0,
      "is_in_stock": true,
      "stock_quantity": 42
    }
  ],
  "item_count": 1,
  "subtotal": 54.0,
  "shipping_cost": 0.0,
  "tax_amount": 2.7,
  "total_amount": 56.7,
  "currency": "USD",
  "is_valid": true,
  "validation_errors": []
}
```

---

## 5. Orders Lifecycle

### `POST /orders`
Creates an internal order in `PENDING` status for a guest session.

**Request Body:**
```json
{
  "guest_session_id": "guest_abc123_1715000000",
  "items": [
    { "product_id": "prod_sony_whch520", "quantity": 1 }
  ]
}
```

**Response `200 OK`:**
```json
{
  "id": "ord_8f7b2c9a10de",
  "guest_session_id": "guest_abc123_1715000000",
  "status": "PENDING",
  "currency": "USD",
  "subtotal": 54.0,
  "shipping_cost": 0.0,
  "tax_amount": 2.7,
  "total_amount": 56.7,
  "created_at": "2026-11-09T18:40:00",
  "updated_at": "2026-11-09T18:40:00",
  "items": [...]
}
```

---

## 6. PayPal Sandbox Checkout

### `GET /payments/paypal/config`
Retrieves public client ID and environment for frontend PayPal SDK initialization.

**Response `200 OK`:**
```json
{
  "client_id": "AbCdEfGhIj...",
  "environment": "sandbox",
  "currency": "USD",
  "is_configured": true
}
```

---

### `POST /payments/paypal/create-order`
Creates an official PayPal Orders v2 resource tied to the internal order.

**Request Body:**
```json
{
  "order_id": "ord_8f7b2c9a10de",
  "guest_session_id": "guest_abc123_1715000000"
}
```

**Response `200 OK`:**
```json
{
  "order_id": "ord_8f7b2c9a10de",
  "paypal_order_id": "7AB12345678901234",
  "status": "CREATED",
  "currency": "USD",
  "amount": 56.7,
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=7AB12345678901234"
}
```

---

### `POST /payments/paypal/capture-order`
Executes server-side payment capture and validates order association, currency, amount, and capture completion.

**Request Body:**
```json
{
  "order_id": "ord_8f7b2c9a10de",
  "paypal_order_id": "7AB12345678901234",
  "guest_session_id": "guest_abc123_1715000000"
}
```

**Response `200 OK`:**
```json
{
  "success": true,
  "status": "COMPLETED",
  "order_id": "ord_8f7b2c9a10de",
  "paypal_order_id": "7AB12345678901234",
  "paypal_capture_id": "9XY98765432109876",
  "payer_email": "sb-student@personal.example.com",
  "payer_name": "Student Buyer",
  "total_amount": 56.7,
  "currency": "USD",
  "message": "Payment successfully verified and order marked as paid."
}
```

