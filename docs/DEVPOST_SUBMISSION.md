# ShopPilot AI — Product Submission

## 1. Project Tagline
**Precision AI Shopping Agent grounded in verified catalogue specifications and official PayPal Sandbox checkout.**

---

## 2. Inspiration
Modern eCommerce is plagued by cognitive overload. When shopping for electronics, consumers are forced to parse dozens of tabs, navigate sponsored listings, and decode marketing jargon. While LLMs excel at understanding natural language, generic AI shopping bots often hallucinate non-existent products, misquote prices, or slap an unverified payment button at the end of a chat.

We built **ShopPilot AI** to prove that conversational AI and high-integrity financial systems can work together seamlessly. ShopPilot interprets nuanced requirements, enforces strict hard constraints, deterministically ranks verified products from a database, explains trade-offs with complete honesty, and completes purchases through the official **PayPal Developer Sandbox Orders v2 API**.

---

## 3. What It Does
- **Natural-Language Requirement Extraction:** A user types a conversational request like:
  *"I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."*
  ShopPilot extracts categories, budgets, and priorities without tedious questionnaires.
- **Authoritative Database Search & Grounded Scoring:** Queries a real relational database and executes a documented 100-point deterministic ranking engine. Hard budget limits are strictly enforced.
- **Specification-Grounded Explanations:** Explains *why* a product matches, highlighting verified battery life, weight, or driver size, while honestly pointing out trade-offs (e.g. passive isolation vs ANC).
- **Side-by-Side Comparison Matrix:** Compares 2 to 4 products across normalized technical specifications with dynamic price delta calculations and an AI value verdict.
- **Server-Authoritative Cart & Pricing:** Decimal-safe recalculation of subtotal, shipping tiers, and taxes on the backend. No frontend or LLM-generated prices are ever trusted.
- **Official PayPal Sandbox Checkout:** Server-side order creation (`/v2/checkout/orders`), official JavaScript SDK Smart Buttons, server-side capture (`/v2/checkout/orders/{id}/capture`), and strict capture verification.
- **Verified Order Lifecycle & Receipts:** Auditable order states (`PENDING` -> `AWAITING_PAYMENT_APPROVAL` -> `PAID`), guest session protection, and printable verified receipts with PayPal capture references.

---

## 4. How We Built It
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, `@paypal/react-paypal-js`. Designed with an editorial, human-crafted warm ivory visual identity (`#FBFBF9`), ink typography, and cobalt blue accents.
- **Backend:** Python, FastAPI, Pydantic v2, SQLAlchemy, SQLite (with PostgreSQL compatibility).
- **AI Intelligence:** Official Google Gemini API (`google-genai` SDK) for structured requirement parsing, paired with an intelligent deterministic rule-based NLP fallback engine that guarantees reliability even when offline.
- **Payments:** Official PayPal Orders v2 REST API (OAuth2 client credentials flow, server-side order staging, server-side capture, and cryptographic validation).
- **Testing:** 22 backend automated unit/integration tests (`pytest` + `httpx`) and frontend component tests (`vitest` + React Testing Library).

---

## 5. Challenges We Overcame
1. **Preventing LLM Hallucinations in Commerce:** We established a strict architectural boundary. The LLM only interprets intent and generates conversational summaries based on retrieved database records; it is forbidden from inventing product attributes or calculating financial totals.
2. **Server-Authoritative Payment Security:** Client callbacks can never be trusted as proof of payment. We implemented server-side capture verification that validates order association (`custom_id`), currency (`USD`), capture amount tolerance, and capture status before transitioning orders to `PAID`.
3. **Graceful Fallback Mode:** To make the application instantly testable without requiring immediate cloud credentials, we built an intelligent deterministic NLP engine that extracts budget and priorities directly, ensuring the demo never crashes.

---

## 6. Accomplishments We're Proud Of
- 100% test pass rate across 22 backend test suites and frontend component suites.
- Production bundle compiled with zero TypeScript errors or warnings.
- Fully realized, distinctive user interface that avoids generic AI SaaS templates.
- Complete end-to-end flow from natural-language query to verified PayPal Sandbox receipt.

---

## 7. What We Learned
Integrating payment infrastructure with AI agents requires treating the LLM as an *advisor* and the backend database/payment gateway as the *authoritative source of truth*. Designing for this separation creates a trustworthy, auditable commerce platform.

---

## 8. What's Next for ShopPilot AI
- Real-time merchant catalogue ingestion via webhook integrations.
- Multi-currency live currency conversion rates via PayPal exchange APIs.
- Collaborative shopping sessions allowing roommates or family members to compare products together.

