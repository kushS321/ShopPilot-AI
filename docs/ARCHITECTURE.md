# ShopPilot AI — System Architecture & Technical Design

## 1. Executive Overview

**ShopPilot AI** is a production-grade, responsive AI shopping agent. It solves the core problem of online purchasing friction by translating complex natural-language consumer intent into authoritative product discoveries, deterministic rankings, structured technical comparisons, and verified PayPal Developer Sandbox checkout transactions.

The architecture strictly decouples **generative natural-language intelligence** from **authoritative commerce state**. The LLM is used to understand user intent and explain technical tradeoffs, but never to invent inventory records, generate hallucinated specifications, or calculate transaction totals.

```
+-----------------------------------------------------------------------------------+
|                                  USER / BROWSER                                    |
|   (Vite + React 18 + TypeScript + Tailwind CSS + @paypal/react-paypal-js)         |
+-----------------------------------------------------------------------------------+
       |                                       |                                |
       | 1. Natural Language Intent            | 3. Add to Cart / Session       | 5. PayPal Sandbox
       v                                       v                                |    Smart Buttons
+----------------------------------------------------------------------------+  |
|                             FASTAPI BACKEND                                |  |
|                                                                            |  |
|  +--------------------+   +-----------------------+   +-----------------+  |  |
|  |   AI Router        |   |   Cart & Order Router |   | Payments Router |  |  |
|  +--------------------+   +-----------------------+   +-----------------+  |  |
+----------------------------------------------------------------------------+  |
       |                               |                        |               |
       | 2. Structured Parse           | 4. Authoritative       | 6. Server-Side|
       v                               |    Recalculation       |    Orders v2  |
+-------------------------+            v                        v               v
| Google Gemini API       |    +---------------+        +--------------------------+
| (with Deterministic     |    | SQLite /      |        | Official PayPal Sandbox  |
|  Fallback Parser)       |    | PostgreSQL DB |        | API (OAuth2 + Capture)   |
+-------------------------+    +---------------+        +--------------------------+
```

---

## 2. Core Architectural Pillars

### A. Ground-Truth Data Boundary
- **No Hallucinated Commerce Data:** Product IDs, specifications, images, and prices exist only in the verified relational database.
- **Authoritative Monetary Calculation:** The frontend never supplies prices to order endpoints. The backend calculates line totals, shipping tiers, taxes, and final payable amounts using decimal-safe rounding (`ROUND_HALF_UP`).

### B. Two-Tier AI Intelligence Architecture
1. **Intent Extraction & Schema Normalization:**
   - User queries (e.g., *"I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."*) are parsed into structured `ExtractedPreferences` models via official Google Gemini API (`google-genai` SDK).
   - If offline or unconfigured, an intelligent deterministic regex & rule-based parser extracts constraints without failing, tagging `is_fallback: true` for auditability.
2. **Deterministic Ranking Engine (`DeterministicRankingEngine`):**
   - Applies hard constraints first (e.g. products exceeding maximum budget are penalized and labeled `Budget Exceeded Alternative`).
   - Computes grounded match scores (0 to 100) combining category alignment (25 pts), budget fit (25 pts), specification alignment (30 pts), brand preference (10 pts), and verified rating (10 pts).

### C. Official PayPal Orders v2 Workflow
The payment lifecycle follows PayPal's recommended secure merchant server-side integration:

1. **Cart Review:** The user inspects verified cart items and authoritative totals.
2. **Order Staging (`POST /api/orders`):** Backend validates real-time inventory and pricing, creates a pending internal order (`ord_...`), and locks the payable amount.
3. **PayPal Order Generation (`POST /api/payments/paypal/create-order`):** Backend requests a PayPal Sandbox Order resource (`/v2/checkout/orders`) with intent `CAPTURE` and embeds the internal order ID as `custom_id`.
4. **Client-Side Approval:** The official PayPal JavaScript SDK button launches PayPal's Sandbox login and approval dialog.
5. **Server-Side Capture (`POST /api/payments/paypal/capture-order`):** Upon client approval callback, the backend executes `/v2/checkout/orders/{id}/capture` directly using its authenticated Bearer token.
6. **Authoritative Verification (`_validate_capture_payload`):**
   - Confirms PayPal order status is `COMPLETED`.
   - Confirms capture status is `COMPLETED`.
   - Verifies capture currency matches order currency (`USD`).
   - Verifies capture monetary value matches the locked internal total within 0.01 tolerance.
   - Verifies `custom_id` matches the internal order ID.
7. **Order Transition:** The internal order status updates to `PAID`, stores capture references, and writes an auditable `PaymentRecord`.

---

## 3. Component Directory Structure

```
shoppilot-ai/
├── backend/
│   ├── app/
│   │   ├── config.py           # Pydantic Settings & environment bindings
│   │   ├── database.py         # SQLAlchemy engine, sessionmaker & Base
│   │   ├── main.py             # FastAPI entrypoint, CORS, exception handlers
│   │   ├── models/
│   │   │   ├── product.py      # Product catalogue model
│   │   │   └── order.py        # Order, OrderItem, PaymentRecord models
│   │   ├── schemas/
│   │   │   ├── product.py      # Product schemas & comparison request/response
│   │   │   ├── ai.py           # Natural-language parse & recommendation schemas
│   │   │   ├── cart.py         # Cart validation & item input schemas
│   │   │   ├── order.py        # Internal order lifecycle schemas
│   │   │   └── payment.py      # PayPal order & capture schemas
│   │   ├── services/
│   │   │   ├── catalogue_service.py # DB product query & comparison matrix
│   │   │   ├── ranking_service.py   # Deterministic 100-point scoring engine
│   │   │   ├── ai_service.py        # Gemini SDK client + fallback extractor
│   │   │   ├── cart_service.py      # Server-side pricing & tax recalculation
│   │   │   ├── order_service.py     # State transitions & guest session security
│   │   │   └── paypal_service.py    # Official PayPal Orders v2 API client
│   │   ├── routers/
│   │   │   ├── health.py       # Health check & provider readiness
│   │   │   ├── products.py     # Catalogue browsing & comparison endpoints
│   │   │   ├── ai.py           # Natural language recommendation endpoints
│   │   │   ├── cart.py         # Cart validation endpoints
│   │   │   ├── orders.py       # Order creation & guest history
│   │   │   └── payments.py     # PayPal create & capture endpoints
│   │   └── seed_data/
│   │       ├── seed.py         # Reproducible DB seeder
│   │       └── products.json   # Curated multi-category catalogue
│   ├── tests/                  # 22 automated Pytest unit & integration tests
│   ├── requirements.txt
│   └── pytest.ini
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx             # Brand header, sandbox status, cart trigger
│   │   │   ├── PromptHero.tsx         # Natural-language request composer & starter prompts
│   │   │   ├── AssistantWorkspace.tsx # Extracted preferences & narrative summary
│   │   │   ├── ProductCard.tsx        # High-res cards, match scores, trade-offs
│   │   │   ├── ProductDetailModal.tsx # Full spec sheet & radar breakdown
│   │   │   ├── ComparisonMatrix.tsx   # Side-by-side comparison of 2-4 products
│   │   │   ├── CartDrawer.tsx         # Slide-out cart with authoritative price breakdown
│   │   │   ├── PayPalCheckoutModal.tsx# Official PayPal JS SDK buttons integration
│   │   │   ├── OrderConfirmationModal.tsx # Verified receipt & capture reference
│   │   │   ├── OrdersModal.tsx        # Guest order history viewer
│   │   │   └── Footer.tsx             # Editorial footer & sandbox notice
│   │   ├── context/
│   │   │   ├── CartContext.tsx        # Guest cart persistence & server sync
│   │   │   ├── ComparisonContext.tsx  # Product tray comparison state
│   │   │   └── AIContext.tsx          # Active recommendation session state
│   │   ├── services/
│   │   │   └── api.ts                 # Typed HTTP client
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript data models
│   │   ├── App.tsx                    # Main responsive layout coordinator
│   │   ├── main.tsx                   # React root with providers
│   │   └── index.css                  # Tailored typography, ivory theme tokens
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── docs/                       # Complete documentation deliverables
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── TESTING.md
│   ├── PROJECT_STATUS.md
│   ├── DEMO_SCRIPT.md
│   └── DEVPOST_SUBMISSION.md
├── .env.example
├── .gitignore
├── LICENSE                     # MIT Open Source License
└── README.md
```

