# 5 AI Prompts — ThirtyOne Lab (Reference: PRD v1.1)

Each prompt can be copied directly into your AI tool of choice (e.g. Claude, v0, Bolt, Lovable) to generate that component separately. Ordered in a logical build sequence.

---

## Prompt 1 — Homepage & Navigation Redesign

**Goal:** Redesign the ThirtyOne Lab Official homepage to look professional and suitable for presenting to B2B prospects (schools, sports clubs, corporate clients), without losing the existing brand identity.

**Input:**
- Existing site: visual catalog (lookbook) with design cards organized by Edition (2026 / World Cup 2026) and category (Material, Neck, Name Set, Sponsor, Size Chart)
- Brand identity: red/black color palette, Bebas Neue heading font
- Existing pain point: navigation has too many buttons at the same level (choice overload, especially on mobile)

**Layout:**
- Header with simplified navigation — clarify the hierarchy between "Edition" (primary tier) and "Category" (supporting reference)
- "How It Works" section near the header — 3 visual steps: (1) Choose/Design → (2) Configure Order (Quantity & Customization) → (3) Send to WhatsApp for Quotation & Order
- Mobile-first — reduce the number of competing buttons on first view

**Features:**
- Responsive navigation that doesn't overload on small screens
- The How It Works section should let a first-time visitor understand within seconds that this is a custom-order shop (not ready stock)
- Preserve the existing design card structure (no data restructuring)

**Output:**
- Static HTML/CSS (site is hosted on GitHub Pages, no backend/server/database)
- Design must stay on-brand — red/black, Bebas Neue for headings

---

## Prompt 2 — Design Catalog with Reference Numbers

**Goal:** Add a reference number system to every catalog design card so customers can easily refer to a design when chatting on WhatsApp or using the Quote Builder.

**Input:**
- Existing image files are already numbered (e.g. `Jersey (0110).jpg`) — no data restructuring needed
- Existing design cards open a pop-up (lightbox) with an "Order via WhatsApp" button

**Layout:**
- Reference number (format: "Design #0110") displayed clearly on the catalog card AND inside the lightbox
- Keep the existing grid/card structure — only add the number label, don't redesign the whole catalog system

**Features:**
- Reference number auto-derived from the existing image filename
- Direct link from the card/lightbox to the Quote Builder (carries the design number pre-filled — see Prompt 3)

**Output:**
- A reusable design card component that displays the reference number consistently across grid & lightbox

---

## Prompt 3 — Quote Builder (7-Step Flow)

**Goal:** Build a Quote Builder module that guides customers through choosing a design + customization options in a structured way, WITHOUT displaying any pricing at any stage.

**Input:**
- Config list of options (see Prompt 5 for JSON structure): Material, Cutting, Sleeve, Neck/Collar, and Quantity Tiers
- Minimum quantity: 5 pieces (temporary placeholder — this value must come from config, not be hardcoded, since the official policy hasn't been finalized)

**Layout:**
- One-step-at-a-time flow (wizard-style), mobile-friendly:
  1. Choose Design Source — "Use Catalog Design" (code auto-filled) OR "Custom Design" (label: "Custom Design — to be discussed on WhatsApp")
  2. Set Quantity (minimum per config)
  3. Choose Material
  4. Choose Cutting Type
  5. Choose Sleeve Type
  6. Choose Neck/Collar Type
  7. "Your Selection Summary" screen — display all choices (Design, Quantity, Material, Cutting, Sleeve, Neck/Collar) for final review

**Features:**
- NO pricing displayed at any stage (final decision by the shop owner) — any internal pricing logic must not be visible or accessible in the UI or in network requests visible to the customer
- Progress indicator (steps 1-7) so customers know how many steps remain
- Basic validation (can't proceed without selecting an option at each step)
- [Optional, not required for Phase 1] "Add Another Design?" button on the summary screen to loop back to Step 1

**Output:**
- Customer's selected data (design, quantity, material, cutting, sleeve, neck) ready to feed into Prompt 4 (WhatsApp message generator) — not submitted to a server, goes straight to generating the WhatsApp message

---

## Prompt 4 — Automatic WhatsApp Message Generator

**Goal:** Generate a pre-filled message that auto-opens in the customer's WhatsApp (using the existing wa.me link pattern), based on the choices from the Quote Builder — with no pricing included.

**Input:**
- Customer's selection data from the Quote Builder (Prompt 3): Design, Quantity, Material, Cutting, Sleeve, Neck/Collar
- Existing message format (ref. PRD 6.4):

  ```
  Hi ThirtyOne Lab! I'm interested in ordering:
  
  Design: #0110
  Quantity: 20 pieces
  Material: Interlock 160GSM
  Cutting: Normal Cutting
  Sleeve: Short Sleeve
  Neck/Collar: Collar Button (Polo)

  Could I get a quotation for this order?
  ```

**Layout:**
- "Send to WhatsApp" button on the Selection Summary screen (end of Prompt 3)

**Features:**
- Generate a wa.me link with pre-filled text (URL-encoded) matching the format above
- For "Custom Design", replace the Design line with "Custom Design — to be discussed on WhatsApp"
- For multi-design orders (ref. PRD 6.5): each Quote Builder submission = one separate message; no automatic aggregation logic needed in the system (shop owner aggregates manually on WhatsApp)

**Output:**
- A wa.me link that opens directly into the customer's WhatsApp with a message ready to send (just tap "Send" in WhatsApp)

---

## Prompt 5 — Config Data Structure (Admin-Editable, No Backend)

**Goal:** Provide a single configuration file (JSON), separate from the display code, to hold all lists & pricing so a developer can easily update it without touching the main HTML/CSS structure.

**Input:**
- Data source: Price_Matrix.xlsx (all values for quantity tiers, material, cutting, sleeve, neck/collar, name set, size surcharges — ref. PRD Section 7)
- Note: updates remain MANUAL by the developer for Phase 1 (not a self-service admin panel — that would need a new backend, considered Phase 2)

**Layout:**
- A single `config.json` file (or similar) with a clear structure per category: quantityTiers, materials, cuttings, sleeves, necks, nameSet, sizeCharges, minimumOrderQuantity

**Features:**
- Every item has a display label + price value (even though price is NOT shown in the customer UI, it remains an internal reference/quick guide for the shop owner)
- `minimumOrderQuantity` as a separate, easily changeable field (not hardcoded) — current placeholder: 5 pieces, to be updated once the official policy is set (ref. PRD 10.2)
- Structure should be readable enough that a developer can edit it directly without risk of breaking the display logic

**Output:**
- A complete `config.json` file that becomes the single source of truth for all lists/pricing, consumed by the Quote Builder (Prompt 3) to populate the options

---

*Full reference: ThirtyOneLab_PRD_v1.1.docx*
