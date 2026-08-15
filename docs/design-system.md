# Clean Shopper Design System
**Inspired by:** myntra.com (bold color-blocking, pill-shaped badges/CTAs, confident uppercase nav, generous product photography, clean white base with heavy whitespace)
**Adapted for:** Clean Shopper's positioning — trustworthy, non-toxic, ingredient-transparent, conversational
**Version:** 1.0

---

## 1. Design Principles

1. **Confidence over clutter** — Myntra earns attention through bold color blocks and typography, not density. Clean Shopper borrows the same restraint: one strong accent per screen, lots of white space, no visual noise competing with ingredient/safety information.
2. **Trust is the hero, not hype** — Where Myntra's color-blocking sells excitement (sales, drops), Clean Shopper's color-blocking sells *confidence* (verified, safe, recommended). Same visual technique, different emotional target.
3. **Conversational-first, not grid-first** — Myntra is a browse-and-grid commerce site. Clean Shopper's primary surface is a chat interface with product cards and comparisons embedded in it — components need to work inline in a conversation, not just in a page grid.

---

## 2. Color Palette

Myntra uses a vivid magenta/orange gradient mark against pure white, with a saturated accent (green banner) used sparingly for promotions. Clean Shopper keeps the same *structure* — neutral base, one confident brand gradient, one high-saturation accent reserved for a single purpose — but shifts the palette toward "clean/natural/verified" rather than "fashion/sale."

| Token | Hex | Usage |
|---|---|---|
| `--brand-primary` | `#2F6B4F` | Primary brand green — logo, primary buttons, links |
| `--brand-primary-dark` | `#1F4A36` | Hover/pressed states, headers on dark surfaces |
| `--brand-gradient-start` | `#2F6B4F` | Wordmark/logo gradient start (mirrors Myntra's two-tone mark) |
| `--brand-gradient-end` | `#E08A3C` | Wordmark/logo gradient end — warm amber, evokes "natural/earthy" |
| `--accent-verified` | `#1B7F5C` | Reserved *only* for "Verified / Clean Certified" badges — never decorative |
| `--accent-alert` | `#C0392B` | Ingredient warnings, "avoided ingredient" flags |
| `--surface-base` | `#FFFFFF` | Page/app background |
| `--surface-subtle` | `#F7F5F0` | Card backgrounds, chat bubble (agent) background — warm off-white, not cold gray |
| `--surface-sunken` | `#EFEBE2` | Input fields, dividers |
| `--text-primary` | `#1A1A17` | Body text, headings |
| `--text-secondary` | `#5C5A52` | Metadata, timestamps, secondary labels |
| `--text-inverse` | `#FFFFFF` | Text on brand-primary or dark surfaces |
| `--border-default` | `#E4E0D6` | Card borders, dividers |

Rule carried directly from Myntra: **saturated color is a signal, not decoration.** Green banners on Myntra mean "active promotion." On Clean Shopper, `--accent-verified` green means "this claim is backed by data" and must never appear elsewhere — so a user learns to trust it at a glance.

---

## 3. Typography

Myntra pairs a heavy, condensed display weight for banners/promos with a clean geometric sans for UI chrome (nav, search, body). Clean Shopper follows the same two-tier system, using widely available web-safe/Google fonts:

| Role | Font | Weight | Example use |
|---|---|---|---|
| Display / Hero | Inter | 800 (Extrabold) | Landing hero, comparison headline ("Best Match: Brand X") |
| Headings | Inter | 700 (Bold) | Section headers, card titles |
| Body | Inter | 400–500 | Chat messages, product descriptions |
| Labels / Badges | Inter | 600, uppercase, letter-spacing 0.04em | Nav items, certification badges — mirrors Myntra's uppercase nav (MEN / WOMEN / BEAUTY) |
| Numerals / Price | Inter (tabular nums) | 700 | Prices, match scores |

Base size 16px, scale ratio 1.25 (Major Third):
`12 / 14 / 16 / 20 / 25 / 31 / 39px`

---

## 4. Components

### Buttons
- **Primary:** solid `--brand-primary`, white text, fully rounded (pill), matches Myntra's rounded CTA style (`Her >`, `Him >` pill links).
- **Secondary:** outline `--brand-primary`, transparent fill.
- **Destructive:** `--accent-alert` outline, used only for "Remove from cart" / "Avoid this ingredient."

### Badges (direct borrow from Myntra's offer-pill pattern)
Pill-shaped, small-caps label + icon. Kept deliberately small/quiet (11px text, 3px/9px padding, 1px border on the outline variant) so a card with several certifications doesn't visually shout — the badge should read as a quick scan-able tag, not a headline:
- `✓ EWG Verified` — `--accent-verified` background, white text
- `⚠ Contains avoided ingredient` — `--accent-alert` background, white text
- `Trusted Brand` — `--brand-primary` 1px outline, `--text-primary` text
- Icon glyphs are `aria-hidden` — the text label alone must always carry the meaning

### Product Card
Modeled on Myntra's product tile: image-forward, name + brand truncated to 2 lines, price row, action button. Supports **multiple badges** (a product can carry several certifications at once, e.g. EWG Verified + B Corp) rendered as a wrapping row of small pills rather than one dominant badge. Adds a Clean Shopper-specific **"Why recommended" reasoning line** beneath the badges — Myntra has no equivalent, since this is the core trust-building surface unique to Clean Shopper.

### Chat Bubbles
- Agent bubble: `--surface-subtle` background, rounded 16px corners, product cards can be embedded inline.
- User bubble: `--brand-primary` background at 10% opacity tint, right-aligned.

### Feature List
Compact single-column rows (icon + title + one-line description), not cards — chosen over a card grid specifically to keep secondary/explainer content from competing with the hero and chat composer above it for vertical space. Each row:
- 36px rounded-square icon tile, `--surface-subtle` background, `--brand-primary` icon color
- Icon is decorative and `aria-hidden` — title + description alone carry the meaning
- Row background lightens to `--surface-subtle` on hover as the only affordance (rows are not currently interactive/clickable)
- Descriptions trimmed to one line; this pattern only works if copy stays terse — if a description needs two sentences, it belongs in a card instead

Superseded the original 2×2 card-grid version of this section (kept as Variant A in `features-section-variants.html` for reference) once the card grid was found to take up too much screen space above the fold.

### Navigation
Top nav mirrors Myntra's structure — logo left, primary categories center (uppercase, medium weight), search bar prominent, profile/cart-equivalent icons right. For Clean Shopper: categories become **Research / Preferences / Cart / Compare** instead of Men/Women/Kids/Home/Beauty.

---

## 5. Layout & Spacing

- Base spacing unit: **8px**, scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- Max content width: 1200px, matching Myntra's contained (non-edge-to-edge) layout
- Generous card padding (16–24px) and whitespace between sections — Myntra's density comes from imagery, not tight spacing; Clean Shopper follows suit so ingredient/reasoning text has room to breathe

---

## 6. Iconography & Imagery

- Icons: simple line icons, 2px stroke, rounded caps (consistent with Myntra's minimal icon set for profile/wishlist/bag)
- Product imagery: clean, well-lit, neutral background — no lifestyle photography needed for V1 given the conversational/research-first use case (unlike Myntra's lifestyle-heavy hero banners)
- Certification badge icons: small, monochrome-in-context (colored only via badge background, not icon itself) to keep the badge system legible at a glance

---

## 7. What We Deliberately Did *Not* Borrow

- Myntra's dense mega-nav and category depth — Clean Shopper's scope is narrower (research/preferences/cart/compare), so no mega-menu needed.
- High-frequency promotional banners/countdown urgency — inconsistent with a "considered purchase, verified information" trust positioning.
- Magenta/pink brand color — visually strong but reads as fashion/retail rather than clean/wellness; replaced with green/amber.

---
*Design system v1.0 — inspired by myntra.com's structural patterns (color-blocking, pill badges, uppercase nav, image-forward cards), reinterpreted for Clean Shopper's trust-first, conversational positioning. Update as UI is built and validated.*
