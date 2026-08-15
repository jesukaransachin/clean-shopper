# Clean Shopper — Database Schema
**Status:** Partially executed. 7 tables are live in Supabase: `brands`, `products`, `certifications`, `product_certifications` (`supabase/schema.sql`, includes two deviations from this document, noted in §6 below), `shoppers` and `cart_items` (`supabase/schema-cart.sql`, executed as originally documented here — no deviations), and `saved_products` (`supabase/schema-saved-products.sql`, executed as originally documented here — no deviations). See `docs/backend.md` for setup. Everything else on this page (`ingredients`, `shopper_avoided_ingredients`, `shopper_trusted_brands`, `shopper_preferred_certifications`, `research_*`, `comparisons`) is still **proposed and unexecuted** — revisit as those features get real frontend UI.
**Assumes:** PostgreSQL syntax (`SERIAL`, `TIMESTAMPTZ`, etc.). Confirmed: the executed subset runs on Supabase (hosted Postgres) — see `docs/backend.md`.
**Source:** `docs/project-context.md` (V1 feature scope) and `docs/component-spec.md` (what the UI actually needs to render — badges, reasoning text, saved state).

---

## 1. Key design decision: no user accounts, but persistence is required

`project-context.md`'s Open Questions §1 flags this directly: the brief excludes user accounts/authentication from V1, but also requires the cart (and, per the brief, preferences) to persist across sessions. Those two constraints only work together one way: **anonymous, device-scoped identity instead of accounts.**

`shoppers` holds an opaque `session_token` — a random ID generated client-side (or by the backend on first visit) and stored in the browser (`localStorage` or a long-lived cookie), not tied to a login. Everything else (cart, saved products, preferences) hangs off `shoppers.id`. If accounts get added later, this table is exactly where an `email`/`auth_provider_id` column would go — the rest of the schema doesn't need to change.

## 2. Entities

### Identity
- **`shoppers`** — one row per anonymous browser/device. `session_token` is the thing actually stored client-side; `id` is the internal FK target.

### Catalog
- **`brands`** — normalized instead of a free-text field on `products`, so "trusted brand" preferences can reference a real row instead of matching strings.
- **`products`** — the catalog. Maps directly to `ProductCard`'s props (`brand`, `name`, `price`, `image`).
- **`ingredients`** — normalized ingredient names, referenced both by what's in a product and by what a shopper wants to avoid.
- **`product_ingredients`** — join table: which ingredients are in which product.
- **`certifications`** — lookup table for the closed badge vocabulary (`EWG Verified`, `USDA Organic`, `B Corp`, ...) — matches `SafetyBadge`'s `verified`/`trusted` variants.
- **`product_certifications`** — join table: which certifications a product actually holds.

### Shopper data
- **`shopper_avoided_ingredients`** — a shopper's avoid-list.
- **`shopper_trusted_brands`** — a shopper's trusted-brand list.
- **`shopper_preferred_certifications`** — which certifications matter to this shopper (used to rank/explain recommendations, per the brief's "applied to every subsequent recommendation").
- **`cart_items`** — the persistent cart.
- **`saved_products`** — the Browse page's "Save to List" heart toggle (`ProductCard`'s `saved`/`onToggleSave` props). Executed and persisted via `server/routes/savedProducts.js` and `src/lib/SavedProductsContext.jsx`, same anonymous-shopper pattern as `cart_items`.

### Research & comparison
- **`research_queries`** / **`research_results`** — logs what a shopper asked for and what was recommended, with the reasoning text shown in `ProductCard`'s `reason` prop and a rank. This is also where the brief's success metrics ("weekly active users," "frequency of returning to add or compare products") would actually get computed from.
- **`comparisons`** / **`comparison_items`** — a named, timestamped set of products a shopper compared side by side.

## 3. A modeling decision worth calling out: alert badges aren't stored

`ProductCard`'s "⚠ Contains Sulfates" alert badge (see `docs/component-spec.md` §2, `SafetyBadge`'s `alert` variant) is **not** a stored fact about a product — it's the result of comparing `product_ingredients` against that specific shopper's `shopper_avoided_ingredients` at query time. The same product shows no alert badge to a shopper with a different avoid-list. Storing it as static data would mean re-computing it on every preference change anyway, so it's just a query:

```sql
-- Ingredients in this product that this shopper has marked as avoided
SELECT i.name
FROM product_ingredients pi
JOIN ingredients i ON i.id = pi.ingredient_id
JOIN shopper_avoided_ingredients sai
  ON sai.ingredient_id = pi.ingredient_id
 AND sai.shopper_id = $1
WHERE pi.product_id = $2;
```

Certification badges (`verified`/`trusted` variants), by contrast, genuinely are static facts about a product — those are stored in `product_certifications`.

## 4. What's deliberately not in this schema

- **No payment/checkout tables** — explicitly out of scope for V1 per the brief.
- **No retailer/inventory tables** — no direct retailer integrations in V1.
- **No user/auth tables** — see §1.
- **No barcode field on `products`** — barcode scanning is explicitly out of scope for V1.

## 5. Open items

- `project-context.md` Open Questions §4 ("How are trusted brands and avoided ingredients matched against newly researched products — exact match, category-level, or fuzzy matching?") is still unresolved and directly affects this schema: right now `product_ingredients`/`shopper_avoided_ingredients` assume **exact ingredient-name matching**. If fuzzy/category matching is needed later, `ingredients` would likely need a parent-category column or a synonym table — not built here since the matching strategy isn't decided yet. (Moot for now — neither table is executed yet.)

## 6. V1 execution: what's live vs. still proposed, and why

`brands`, `products`, `certifications`, `product_certifications`, `shoppers`, `cart_items`, and `saved_products` are executed (in Supabase — see `docs/backend.md`). The cart and the Browse page's "Save to List" heart are both real: `server/routes/cart.js` and `server/routes/savedProducts.js` persist them, scoped to the anonymous `shoppers.session_token` from `src/lib/session.js` (a client-generated UUID in localStorage, not a login). Still nothing wired for the rest: there's no ingredient-avoid-matching UI at all, and no preferences UI. Standing up `ingredients`/`research_*`/etc. now would mean building tables with no code path that ever reads or writes them — revisit each as its corresponding feature gets built.

**Note:** `shoppers`/`cart_items` were executed via `supabase/schema-cart.sql` exactly as originally documented in §1/§2 above — no deviations, unlike the two below for the original 4-table cut.

Two deliberate deviations in the executed version (`supabase/schema.sql`) from what's documented above:

1. **`products.reason` is a plain column**, not derived from `research_results.reasoning`. §2's "Research & comparison" design ties reasoning text to a per-query research flow, but no real research/chat flow exists yet — the catalog is static for V1, so a direct column is simpler and matches what `ProductCard`'s `reason` prop actually needs today. Revisit when `research_queries`/`research_results` get built for real.
2. **Alert-style badges are stored as static `certifications` rows** (e.g. "Contains Sulfates," "Contains Fragrance"), not computed per-shopper as §3 above describes. §3's design is still the *correct* long-term one — it just needs `shoppers` + `ingredients` + `shopper_avoided_ingredients` to exist first, none of which do yet. The executed `certifications` table also gained a `variant` column (`'verified' | 'trusted' | 'alert'`) directly on each row, so the API doesn't need a hardcoded label→variant lookup in application code.
