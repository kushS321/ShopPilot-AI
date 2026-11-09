# ShopPilot AI — Video Demonstration Script (< 3 Minutes)

**Target Duration:** 2 minutes 45 seconds  
**Presenter:** Founder / Developer  

---

### [00:00 – 00:25] The Problem & Introduction
- **Visual:** Screen opens on ShopPilot AI landing page. Warm ivory background, editorial typography, headline: *"Find what fits your life."*
- **Audio / Voiceover:**  
  *"Today, buying electronics online requires opening ten tabs, decoding contradictory reviews, and calculating shipping fees in your head.  
  Welcome to **ShopPilot AI** — an AI-powered shopping agent that combines natural-language intelligence with authoritative product verification and official PayPal Developer Sandbox checkout."*

---

### [00:25 – 01:05] Natural-Language Intent & Grounded AI Intelligence
- **Visual:** Presenter clicks the canonical starter prompt or types:  
  *"I need wireless headphones for college under ₹5,000. Battery life, comfort, microphone quality, and value for money are my priorities."*  
  Clicks **Find Products**.
- **Visual:** Instant transition to Assistant Workspace. The UI highlights the structured extracted requirements:
  - Category: `Headphones`
  - Budget Limit: `₹5,000`
  - Priorities: `Battery Life`, `Comfort`, `Microphone Quality`, `Value for Money`
- **Audio / Voiceover:**  
  *"Notice what happens under the hood. ShopPilot doesn't let the LLM hallucinate fake products or prices. Instead, it extracts the user's hard constraints, queries our verified catalogue database, and runs a deterministic 100-point ranking engine.  
  Our #1 recommendation is the **Sony WH-CH520** at 96% Match. The system explains exactly why: 50-hour battery life, 147g lightweight build, and verified catalogue price of ₹4,490 ($54.00) — safely within our budget."*

---

### [01:05 – 01:40] Technical Comparison & Trade-off Transparency
- **Visual:** Presenter selects the **Compare** scale icon on the **Sony WH-CH520** and the **boAt Rockerz 550**. Clicks **Compare (2)** pill in the navbar.
- **Visual:** The side-by-side **Comparison Matrix** opens, detailing battery life (50h vs 20h), driver size (30mm vs 50mm), weight (147g vs 245g), and price difference.
- **Audio / Voiceover:**  
  *"Shoppers want clarity, not blind faith. With one click, ShopPilot loads an authoritative comparison matrix directly from our backend. It highlights genuine trade-offs: the boAt gives punchier 50mm bass drivers for less money, while the Sony delivers two-and-a-half times the battery life and multipoint pairing."*

---

### [01:40 – 02:15] Server-Authoritative Cart & PayPal Sandbox Checkout
- **Visual:** Presenter clicks **Add to Cart** directly from the matrix. The slide-over Cart Drawer appears showing line items, authoritative subtotal, free shipping ($0.00), and 5% tax.
- **Visual:** Presenter clicks **Checkout with PayPal**.
- **Audio / Voiceover:**  
  *"When the user proceeds to checkout, backend security takes over. We never trust client-side prices or LLM estimates. Our backend recalculates line items, enforces inventory locks, and stages an official PayPal Orders v2 resource.  
  The official PayPal JavaScript SDK renders the Smart Payment Buttons. When the user approves in the PayPal Sandbox dialog, our server executes the capture directly with PayPal's API, verifying the amount, currency, and custom order association."*

---

### [02:15 – 02:45] Verified Order Confirmation & Conclusion
- **Visual:** The screen transitions to the **Order Confirmation Receipt**. Shows green checkmark, verified Order ID, PayPal capture ID, itemized receipt, and printable invoice.
- **Audio / Voiceover:**  
  *"And here is our verified payment confirmation. The order is permanently recorded with full auditability.  
  ShopPilot AI demonstrates how modern commerce should feel: conversational, grounded in authoritative data, and powered by seamless PayPal checkout.  
  Thank you."*

