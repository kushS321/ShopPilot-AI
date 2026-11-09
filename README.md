# ShopPilot AI — Precision AI Shopping Agent

> *A production-quality, responsive AI shopping agent that translates natural-language intent into grounded product discoveries, deterministic rankings, side-by-side technical comparisons, and verified PayPal Developer Sandbox checkout.*

[![Tests](https://img.shields.io/badge/Tests-22%2F22%20Passing-emerald)](docs/TESTING.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PayPal](https://img.shields.io/badge/PayPal-Sandbox%20Orders%20v2-00457C)](https://developer.paypal.com)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev)

---

## 1. Project Overview

Finding the right tech gadget online often requires wading through dozens of contradictory reviews, sponsored listings, and fragmented specifications. **ShopPilot AI** solves this problem by acting as an intelligent shopping workspace.

A user asks in plain English:
> *"I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."*

ShopPilot AI:
1. **Interprets Intent:** Extracts categories, hard budget limits, and user priorities.
2. **Searches Authoritative Catalogue:** Queries a verified relational database—never hallucinating products or specs.
3. **Ranks Deterministically:** Applies a documented 100-point scoring algorithm that enforces hard budget constraints.
4. **Explains Trade-offs:** Grounded summaries highlighting genuine advantages and limitations (e.g. passive isolation vs. ANC).
5. **Compares Confidently:** Side-by-side comparison matrix of 2 to 4 products across technical attributes.
6. **Validates Cart:** Backend authoritatively recalculates subtotal, shipping, and taxes with decimal safety.
7. **Completes Checkout via PayPal Sandbox:** Uses the official PayPal JavaScript SDK and server-side Orders v2 capture API.

---

## 2. Distinctive Visual Identity

Designed with an editorial aesthetic:
- **Warm Ivory / Off-White Canvas:** `#FBFBF9` and `#F6F5F0` providing high readability and generous whitespace.
- **Deep Ink Typography:** `#0F172A` and `#1E293B` with refined sans-serif (`Inter`) and editorial display serif (`Newsreader`).
- **Deep Cobalt Accent:** `#1E40AF` and `#2563EB` replacing generic purple SaaS gradients.
- **Structured Workspace:** Card layouts with crisp borders, subtle shadows, and intentional information hierarchy.

---

## 3. Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, `@paypal/react-paypal-js`.
- **Backend:** Python 3.11+, FastAPI, Pydantic v2, SQLAlchemy 2.0, Uvicorn, HTTPX.
- **AI Intelligence:** Google Gemini API (`google-genai` SDK) with structured Pydantic schema validation, backed by an intelligent deterministic rule-based NLP fallback engine.
- **Database:** SQLite (local development default) with PostgreSQL deployment compatibility.
- **Payments:** Official PayPal Orders v2 REST API (OAuth2 client credentials flow, server-side capture, amount & currency cryptographic validation).
- **Testing:** Pytest & HTTPX for backend tests; Vitest & React Testing Library for frontend tests.

---

## 4. Local Development Setup (macOS / Linux)

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### Step 1: Clone and Set Up Workspace
```bash
# Navigate to project root
cd shoppilot-ai

# Set up environment variables
cp .env.example .env
```

### Step 2: Backend Setup
```bash
# Create and activate Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Initialize database and seed catalogue
PYTHONPATH=. python3 backend/app/seed_data/seed.py

# Start FastAPI backend server
PYTHONPATH=. uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Backend Swagger API documentation will be available at:* `http://localhost:8000/api/docs`

### Step 3: Frontend Setup
In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
*Frontend application will be available at:* `http://localhost:5173`

---

## 5. Configuring PayPal Sandbox & Gemini API

Edit the `.env` file in the project root:

```env
# 1. PayPal Developer Sandbox (Required for interactive smart button popups)
# Obtain from https://developer.paypal.com/dashboard/applications/sandbox
PAYPAL_CLIENT_ID="your_sandbox_client_id_here"
PAYPAL_CLIENT_SECRET="your_sandbox_client_secret_here"
PAYPAL_ENVIRONMENT="sandbox"

# 2. Google Gemini API (Optional: intelligent deterministic parser active if empty)
# Obtain from https://aistudio.google.com/
GEMINI_API_KEY="your_gemini_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
```

> **Note on Zero-Configuration Mode:**  
> If `GEMINI_API_KEY` is omitted, ShopPilot's built-in deterministic NLP engine handles parsing transparently, marking responses with `is_fallback: true`.  
> If PayPal credentials are omitted, the backend and frontend clearly report the sandbox configuration instructions without breaking other features.

---

## 6. Running Automated Tests

### Backend Test Suite (Pytest)
```bash
source .venv/bin/activate
PYTHONPATH=. pytest backend/tests -v
```
*Expected: 22/22 tests passing (catalogue, deterministic ranking, AI parsing, cart pricing, order lifecycle, payment tampering prevention).*

### Frontend Test Suite (Vitest)
```bash
cd frontend
npm test
```
*Expected: All component and integration tests passing.*

### Production Build Verification
```bash
cd frontend
npm run build
```
*Expected: Zero TypeScript errors; production bundle built cleanly into `frontend/dist/`.*

---

## 7. Payment Security & Architecture

ShopPilot AI enforces the following security standards:
1. **Zero Client-Trust Pricing:** All line totals, subtotals, shipping tiers ($0 over $50), and tax amounts (5%) are computed authoritatively on the server.
2. **Server-Side PayPal Capture:** Client approvals only initiate server-side capture (`/v2/checkout/orders/{id}/capture`). Browser callbacks are never accepted as proof of payment.
3. **Cryptographic Validation:** The backend validates:
   - Status is `COMPLETED`.
   - Captured amount matches the internal order total within 0.01 tolerance.
   - Captured currency matches internal order currency (`USD`).
   - Custom ID matches the internal order ID.
4. **Idempotency & Duplicate Prevention:** Repeat capture requests for already paid orders are handled idempotently without duplicate charges or state corruption.
5. **Session Isolation:** Guest orders are protected by cryptographic session tokens.

---

## 8. Documentation Index

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — Comprehensive technical design, data flows, and component roles.
- [docs/API.md](docs/API.md) — Detailed REST API reference with sample request/response payloads.
- [docs/TESTING.md](docs/TESTING.md) — Full automated testing report and verified execution evidence.
- [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md) — Feature compliance matrix and verification audit.
- [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md) — Concise 3-minute video presentation script.
- [docs/DEVPOST_SUBMISSION.md](docs/DEVPOST_SUBMISSION.md) — Comprehensive product submission narrative.

---

## 9. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

