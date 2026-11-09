# ShopPilot AI — Automated & End-to-End Testing Report

## 1. Test Summary

| Test Domain | Runner | Total Tests | Passed | Failed | Status |
|:---|:---|:---:|:---:|:---:|:---:|
| **Backend API & Data Flow** | Pytest + HTTPX | 22 | 22 | 0 | **PASS** |
| **Frontend UI & Components** | Vitest + React Testing Library | 2 | 2 | 0 | **PASS** |
| **Frontend Production Build** | TypeScript (`tsc`) + Vite | 1 | 1 | 0 | **PASS** |
| **Database Seeding & Schema** | SQLAlchemy + SQLite | 1 | 1 | 0 | **PASS** |

---

## 2. Backend Automated Test Suite (`backend/tests/`)

Ran via command:
```bash
PYTHONPATH=. .venv/bin/pytest backend/tests -v
```

### Verified Test Results

```
backend/tests/test_ai.py::test_ai_query_user_example PASSED              [  4%]
backend/tests/test_ai.py::test_ai_refinement PASSED                      [  9%]
backend/tests/test_cart.py::test_cart_authoritative_calculation PASSED   [ 13%]
backend/tests/test_cart.py::test_cart_under_free_shipping_threshold PASSED [ 18%]
backend/tests/test_cart.py::test_cart_rejects_invalid_quantity PASSED    [ 22%]
backend/tests/test_cart.py::test_cart_rejects_nonexistent_product PASSED [ 27%]
backend/tests/test_catalogue.py::test_health_check PASSED                [ 31%]
backend/tests/test_catalogue.py::test_list_products PASSED               [ 36%]
backend/tests/test_catalogue.py::test_filter_products_by_category PASSED [ 40%]
backend/tests/test_catalogue.py::test_filter_products_by_price_inr PASSED [ 45%]
backend/tests/test_catalogue.py::test_search_products PASSED             [ 50%]
backend/tests/test_catalogue.py::test_get_product_detail PASSED          [ 54%]
backend/tests/test_catalogue.py::test_get_nonexistent_product PASSED     [ 59%]
backend/tests/test_catalogue.py::test_product_comparison PASSED          [ 63%]
backend/tests/test_catalogue.py::test_product_comparison_invalid_count PASSED [ 68%]
backend/tests/test_orders.py::test_create_order_lifecycle PASSED         [ 72%]
backend/tests/test_orders.py::test_guest_order_history PASSED            [ 77%]
backend/tests/test_payments.py::test_paypal_config_endpoint PASSED       [ 81%]
backend/tests/test_payments.py::test_create_paypal_order_unconfigured_error PASSED [ 86%]
backend/tests/test_payments.py::test_paypal_capture_verification_logic PASSED [ 90%]
backend/tests/test_ranking.py::test_deterministic_ranking_satisfies_hard_budget PASSED [ 95%]
backend/tests/test_ranking.py::test_score_components_breakdown PASSED    [100%]

======================= 22 passed, 20 warnings in 0.24s ========================
```

---

## 3. Specific Critical Test Coverage

### A. Canonical Prompt Verification (`test_ai_query_user_example`)
- Evaluates the user's specific requirement:
  *"I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."*
- Confirms:
  1. Category is identified as `Headphones`.
  2. Budget max is identified as `₹5,000` (INR).
  3. Priorities parsed include battery life, comfort, microphone quality, and value for money.
  4. Top recommendation (`Sony WH-CH520`) is strictly <= ₹5,000, has score >= 80, and is labeled `Strong Match`.
  5. Any product exceeding ₹5,000 is categorized as `Budget Exceeded Alternative`.

### B. Price Security & Cart Revalidation (`test_cart.py`)
- Confirms client prices are ignored; all calculations derive from database records.
- Line items are priced with decimal safety.
- Free shipping threshold ($50.00) verified.
- Rejection of negative/zero quantities (`HTTP 422`).
- Rejection of non-existent or tampered product IDs.

### C. Server-Side Payment Verification & Tamper Resistance (`test_payments.py`)
- **Tampered Amount Attack Test:** An attacker modifying the capture payload to $0.01 is rejected with `Amount mismatch`.
- **Currency Mismatch Attack Test:** Payment captured in EUR for a USD order is rejected with `Currency mismatch`.
- **Custom ID Mismatch Attack Test:** Unrelated PayPal order captured for another internal order is rejected with `Security mismatch`.
- **Credential Failure Test:** Missing credentials return clear `HTTP 503` explaining `.env` configuration instead of crashing or generating fake success.

---

## 4. Frontend Component Test Suite (`frontend/src/test/`)

Ran via command:
```bash
npm test
```

### Verified Test Results
```
 ✓ src/test/PromptHero.test.tsx (1 test) 28ms
 ✓ src/test/ProductCard.test.tsx (1 test) 48ms

 Test Files  2 passed (2)
      Tests  2 passed (2)
   Start at  00:04:03
   Duration  741ms
```

---

## 5. Production Build Verification

Ran via command:
```bash
npm run build
```

### Verified Result
```
vite v6.4.6 building for production...
dist/index.html                   0.97 kB │ gzip:  0.53 kB
dist/assets/index-B_t9Fbph.css   28.04 kB │ gzip:  5.59 kB
dist/assets/index-CCWT0ozJ.js   232.45 kB │ gzip: 67.77 kB
✓ built in 1.53s
```
Zero TypeScript compiler errors, zero bundling warnings.

