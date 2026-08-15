# Clean Shopper — Test Cases: Browse & Cart

**Scope:** `src/features/browse/BrowsePage.jsx` (the app's landing page) and `src/features/cart/CartPage.jsx`, plus the shared state they depend on (`src/lib/CartContext.jsx`, `src/lib/SavedProductsContext.jsx`, `src/lib/useProducts.js`) and the components they render (`ProductCard`, `CategoryTag`, `SearchBar`, `Stepper`, `EmptyState`, `Header`).

**Out of scope:** Preferences and Compare (not built), Checkout (explicitly a no-op — see BC-CT-014), a dedicated accessibility audit (see the `accessibility-check` skill instead — a few core a11y expectations are still asserted here as acceptance criteria since they're load-bearing for these two pages specifically).

**How to use this doc:** No automated test suite exists yet (no test framework is installed — see `package.json`). These are manual/QA test cases, written to be automatable later without rewriting them if `Vitest`/`Playwright`/etc. gets added. Each has an ID, preconditions, steps, and an expected result; **Acceptance Criteria** blocks summarize the pass/fail bar for a feature area as a whole.

---

## 1. Browse Page

### 1.1 Landing & initial load

**Acceptance Criteria**
- Given a user opens the app with no prior session, when the page finishes loading, then they land directly on Browse (no separate Home page exists) with the search bar, all four category pills, and the full product grid visible.
- Given the catalog request is in flight, when the user is looking at the page, then they see a plain-text loading message, never a blank screen or a layout shift once data arrives.
- Given the catalog request fails, when the user is looking at the page, then they see an `EmptyState` explaining the failure, never a raw error or a crash.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BR-001 | App loads directly into Browse | Fresh browser, no session token in `localStorage` | 1. Navigate to the app's root URL | The Browse page renders as the first thing shown — search bar, "All"/"Personal Care"/"Home Cleaning"/"Baby Care" pills, and a product grid. No Home page exists to land on instead. |
| BR-002 | Loading state renders before data arrives | Throttle network or add artificial delay to `/api/products` | 1. Load the app | "Loading products…" text is shown centered in the content area. No product cards, no empty-state message, no spinner (this design system doesn't use spinners). |
| BR-003 | Error state on failed catalog fetch | Stop the local Express server (or block `/api/products`) | 1. Load the app | `EmptyState` renders with title "Couldn't load products." and description "Check that the API server is running and try again." No console-uncaught exception, no blank page. |
| BR-004 | Clicking the header logo returns to Browse from anywhere | On Cart page | 1. Click the "Clean Shopper home" logo button in the header | The app navigates back to Browse, preserving cart/saved state (not a full reload). |
| BR-005 | "Research" nav item opens Browse | On Cart page | 1. Click "Research" in the header nav | Browse renders. `aria-current="page"` is set on "Research" while on Browse, and removed while on Cart. |

---

### 1.2 Category filtering

**Acceptance Criteria**
- Given the user selects a category pill, when the request completes, then only products in that category are shown, fetched via a real `GET /api/products?category=...` request — never a client-side filter of an already-fetched list.
- Given a category is selected, when the user looks at the pill row, then exactly one pill shows the selected visual state at a time (`aria-pressed="true"`, filled `brand-primary` background) — selection is single-select, not multi-select.
- Given a category filter has zero matching products, when the response returns, then a category-specific `EmptyState` is shown, distinct from the "no search results" empty state.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BR-010 | Default filter is "All" | Fresh page load | 1. Load the page | The "All" pill is visually selected (`aria-pressed="true"`) and the full unfiltered catalog is shown. |
| BR-011 | Selecting a category filters the grid | Catalog has products in Personal Care, Home Cleaning, and Baby Care | 1. Click the "Home Cleaning" pill | A `GET /api/products?category=Home+Cleaning` request fires. Only Home Cleaning products render. The "Home Cleaning" pill becomes selected; "All" and the others become unselected. |
| BR-012 | Switching categories re-fetches, doesn't just re-filter | Any category selected | 1. Click "Personal Care", note the network request<br>2. Click "Baby Care" | A **new** `GET /api/products?category=Baby+Care` request fires each time — not a single upfront fetch of everything filtered in the browser. |
| BR-013 | Returning to "All" clears the category filter | A specific category selected | 1. Click "All" | Full catalog re-fetches with no `category` param. "All" becomes the selected pill. |
| BR-014 | Category with zero products shows the category-empty state | A category temporarily has no seeded products (or mock a 0-length response) | 1. Select that category | `EmptyState` renders with title "No products in this category yet." — **not** the "No matches found" search-empty message, since `submittedQuery` is empty. |
| BR-015 | Category pill keyboard operability | Any state | 1. Tab to a `CategoryTag` pill<br>2. Press Enter/Space | The pill activates identically to a mouse click (it's a real `<button>`, per `docs/component-spec.md` §4's requirement). Focus-visible outline is shown while focused via keyboard. |
| BR-016 | Disabled category pill (if ever used) does nothing | A pill rendered with `disabled` | 1. Attempt to click it | No `onToggle` fires, pill shows reduced-opacity styling, cursor is `not-allowed`. *(No current caller passes `disabled`, but the prop exists — test if/when one does.)* |

---

### 1.3 Search ("Ask Clean Shopper")

**Acceptance Criteria**
- Given the user types into the search box, when they haven't yet submitted, then no request fires — search is submit-triggered, not live-as-typed.
- Given the user submits a search term, when the request completes, then the grid shows only products whose **name or brand** case-insensitively contains the term, via a real `GET /api/products?search=...` request.
- Given a search returns zero results, when the response completes, then a search-specific `EmptyState` names the actual submitted term in its description.
- Given a search term and a category filter are both active, when either changes, then both are sent together in the same request (`?category=...&search=...`) and results satisfy both conditions (AND, not OR).

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BR-020 | Typing alone does not trigger a search | Fresh Browse page | 1. Type "lemon" into the search box<br>2. Do not press Enter or click the submit button | No new `/api/products?search=...` request fires. Grid is unchanged. |
| BR-021 | Submitting via the button triggers a real search | Fresh Browse page | 1. Type "lemon"<br>2. Click "Ask Clean Shopper" | `GET /api/products?search=lemon` fires. Grid updates to only products whose name or brand contains "lemon" (case-insensitive). |
| BR-022 | Submitting via Enter key triggers the same search | Fresh Browse page | 1. Type "soap"<br>2. Press Enter while focused in the input | Same result as clicking the submit button — the input is inside a real `<form>`, Enter submits it. |
| BR-023 | Search matches brand, not just product name | Catalog contains a brand named e.g. "Willow Bath Co." | 1. Search "willow" | Every product from that brand appears, even if "willow" isn't in the product name itself. |
| BR-024 | Search is case-insensitive | Any catalog | 1. Search "LEMON" (or "Lemon", "lEmOn") | Same results as searching "lemon". |
| BR-025 | Zero-result search shows the search-empty state with the term named | Search for a nonsense string, e.g. "zzqqxx" | 1. Submit that search | `EmptyState` renders: title "No matches found.", description includes the literal submitted term: `Nothing matched "zzqqxx". Try a different brand or product name.` |
| BR-026 | Clearing the search term and resubmitting restores the full list (within the active category) | A search is currently narrowing results | 1. Clear the input text<br>2. Submit (Enter or button click) | Request fires with an empty/absent `search` param. Full catalog (respecting any active category) returns. |
| BR-027 | Search combines with an active category filter | "Home Cleaning" category selected | 1. Search "soap" | `GET /api/products?category=Home+Cleaning&search=soap` fires. Only Home Cleaning products matching "soap" appear — a product matching "soap" in a different category must **not** appear. |
| BR-028 | Changing category while a search term is submitted keeps the search active | A search is submitted, e.g. "soap" | 1. Click a different category pill | New request includes both the newly selected category **and** the still-active `search=soap` param. |
| BR-029 | Search box `aria-label` exists independent of placeholder | Any state | 1. Inspect the input's accessible name | Accessible name is "Describe what you're looking for" (or equivalent explicit `aria-label`) — not reliant on the placeholder text alone, since placeholders aren't read by all assistive tech the same way as labels. |

---

### 1.4 Product cards: Save to List

**Acceptance Criteria**
- Given a product is unsaved, when the user clicks its save (heart) button, then it's marked saved immediately (optimistic) and persisted server-side under the current anonymous session.
- Given a product is saved, when the user navigates away (in-app) and returns, or reloads the page entirely, then it still shows as saved.
- Given the save toggle fails server-side, when the failure happens, then it's logged to the console but the UI does not roll back (documented simplification — see `SavedProductsContext.jsx`).

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BR-030 | Saving a product flips its visual/accessible state immediately | Product is unsaved | 1. Click the heart icon on a product card | Button's accessible name changes from `Save {name} to your list` to `Remove {name} from your list`; `aria-pressed` flips `false → true`; icon changes ♡ → ♥ (both `aria-hidden`, decorative only). |
| BR-031 | Saving persists server-side | Product is unsaved | 1. Save a product<br>2. Inspect network requests | `POST /api/saved-products` fires with `{ productId }` and the current session's `X-Session-Token` header. |
| BR-032 | Unsaving reverses the state | Product is currently saved | 1. Click its heart icon again | Reverts to `Save {name} to your list` / `aria-pressed="false"` / ♡. `DELETE /api/saved-products/:productId` fires. |
| BR-033 | Saved state survives in-app navigation | A product is saved | 1. Navigate to Cart<br>2. Navigate back to Browse (Research nav or logo) | The product still shows as saved — no full reload occurred, and the state didn't reset (this was a real bug, fixed by moving from local component state to `SavedProductsContext`). |
| BR-034 | Saved state survives a full page reload | A product is saved | 1. Hard-reload the browser | On reload, `GET /api/saved-products` re-fetches from the server using the session token in `localStorage`; the product still shows saved once the fetch completes. |
| BR-035 | Save state is per-anonymous-session, not global | Two different browsers/session tokens | 1. Save a product in browser/session A<br>2. Open the app in browser/session B (different `localStorage`, e.g. private window) | Session B does **not** see the product as saved — saved state is scoped to `X-Session-Token`, not shared globally. |
| BR-036 | Save button only renders when `onToggleSave` is passed | N/A (regression guard) | 1. Inspect any `ProductCard` on Browse | Save button is present on every Browse card (Browse always passes `onToggleSave`). No card is silently missing the control. |
| BR-037 | Save button has a real accessible label at all times | Any state | 1. Inspect the save button's `aria-label` | Always a descriptive string naming the product and the action ("Save X to your list" / "Remove X from your list") — never relies on the icon glyph alone (icon is `aria-hidden`). |

---

### 1.5 Product cards: Add to Cart / Stepper

**Acceptance Criteria**
- Given a product with quantity 0, when the user clicks "Add to Cart", then the button is replaced by a quantity `Stepper` starting at 1, and the product is persisted to the cart.
- Given a product already has quantity ≥ 1 (via the `Stepper`), when the user decrements to 0, then the `Stepper` is replaced back by the "Add to Cart" button.
- Given multiple products are in the cart simultaneously, when one is changed, then the others' displayed quantities are unaffected.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BR-040 | Add to Cart transitions the card to a Stepper | Product has quantity 0 (not in cart) | 1. Click "Add to Cart" | Button is replaced by a `Stepper` showing quantity `1`. `POST /api/cart` fires with `{ productId }`. |
| BR-041 | Incrementing via the Stepper increases quantity | Product already at quantity ≥ 1 | 1. Click the `+` button | Quantity increments by 1 in the UI immediately; `PATCH /api/cart/:productId` fires with the new quantity. |
| BR-042 | Decrementing via the Stepper decreases quantity | Product at quantity ≥ 2 | 1. Click the `−` button | Quantity decrements by 1; same `PATCH` pattern as increment. |
| BR-043 | Decrementing from 1 to 0 reverts to the Add to Cart button | Product at quantity 1 | 1. Click `−` | Stepper is replaced back by "Add to Cart". `DELETE /api/cart/:productId` fires (quantity ≤ 0 triggers a full removal, per `CartContext.changeQuantity`). |
| BR-044 | Stepper buttons have descriptive accessible labels | Product at any quantity ≥ 1 | 1. Inspect the `−`/`+` buttons | `aria-label`s read "Decrease quantity of {name}" / "Increase quantity of {name}" — not just "−"/"+". |
| BR-045 | Quantity display announces changes to assistive tech | Product at any quantity ≥ 1 | 1. Inspect the quantity number span | Has `aria-live="polite"` so screen readers announce quantity changes without needing focus to move. |
| BR-046 | Cart state is independent per product | Two or more products in cart at different quantities | 1. Increment one product's Stepper | Only that product's displayed quantity changes; every other product's Stepper/quantity is unaffected. |
| BR-047 | Cart quantity set on Browse is reflected immediately in the header's Cart badge | Cart empty | 1. Add a product to cart from Browse | Header's "Cart" nav item immediately shows an item-count badge and updated accessible name ("Cart, 1 item") without needing a page navigation or reload. |

---

### 1.6 Product cards: content & badges

**Acceptance Criteria**
- Given a product has one or more certifications, when its card renders, then every badge shows as its own pill (badges are never collapsed into one).
- Given a product has no image, when its card renders, then a text placeholder is shown, not a broken image icon.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BR-050 | Multiple badges render as separate pills | A product has 2+ certifications (e.g. EWG Verified + B Corp) | 1. View that card | Both badges render as distinct pills in a wrapping row — not merged into a single badge. |
| BR-051 | Badge variants render distinct visual/semantic treatment | Catalog includes verified, alert, and trusted-brand products | 1. View one of each | `verified` → green fill, ✓ icon, "EWG Verified"-style label. `alert` → red fill, ⚠ icon, "Contains X" label. `trusted` → outlined, no icon, "Trusted Brand" label. |
| BR-052 | Badge icon is decorative only | Any badge | 1. Inspect the icon element | `aria-hidden="true"` on the icon; the visible text label alone conveys the full meaning (per `component-spec.md` §2). |
| BR-053 | Missing product image shows a text placeholder | A product with no `image` value (or simulate one) | 1. View that card | "No image available" text renders in the image area instead of a broken `<img>`. |
| BR-054 | "Why recommended" reason line renders when present | Product has a `reason` value | 1. View that card | Reason text renders in its own callout below the badges. |
| BR-055 | Reason line is omitted (not an empty box) when absent | Product has no `reason` value | 1. View that card | No empty/placeholder box renders where the reason would be — the element is conditionally not rendered at all. |

---

## 2. Cart Page

### 2.1 Empty, loading, and error states

**Acceptance Criteria**
- Given the cart has zero items, when the page renders, then a specific "Your cart is empty" message with a "Browse products" action is shown — never a blank list.
- Given the cart is still fetching, when the page renders, then a loading message is shown, not a false "empty" state (this distinction matters — see BC-CT-004).
- Given the cart fetch fails, when the page renders, then an error `EmptyState` is shown, not a silent empty cart.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BC-CT-001 | Genuinely empty cart shows the empty state with an action | No items ever added this session | 1. Navigate to Cart | `EmptyState`: title "Your cart is empty.", description "Products you add will show up here.", action button "Browse products". |
| BC-CT-002 | "Browse products" action navigates to Browse | On the empty-cart state | 1. Click "Browse products" | App navigates to Browse (`onNavigate('browse')`). |
| BC-CT-003 | Loading state renders before the fetch completes | Throttle `/api/cart` | 1. Navigate to Cart while the request is in flight | "Your Cart" heading renders immediately, with "Loading cart…" text below it — not the empty-state message. |
| BC-CT-004 | Loading is never mistaken for "genuinely empty" | Same as BC-CT-003 | 1. Observe the page during the loading window | `EmptyState`'s "Your cart is empty" message must **not** appear until `status === 'ready'` confirms zero items — it must not appear merely because `items` starts as `[]` during loading. |
| BC-CT-005 | Error state on failed cart fetch | Stop the Express server, then load Cart | 1. Navigate to Cart | `EmptyState`: title "Couldn't load your cart.", description "Check that the API server is running and try again." No crash. |

---

### 2.2 Cart contents, quantities, and totals

**Acceptance Criteria**
- Given one or more items are in the cart, when the page renders, then each line item shows image, brand, name, per-unit price, a working `Stepper`, an accurate line total (`priceCents × quantity`), and a Remove control.
- Given any quantity changes (increment, decrement, or removal), when the change completes, then Subtotal, Tax, and Total recompute correctly and immediately in the UI.
- Given Tax is a fixed 8% placeholder rate, when Subtotal changes, then Tax is `round(subtotal × 0.08)` and Total is `subtotal + tax`, exactly.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BC-CT-010 | Cart with items renders all expected fields per line | 1+ items in cart | 1. Navigate to Cart | Each line shows: thumbnail image, brand (if present), name, `"{price} each"`, a `Stepper` at the correct quantity, a line total, and a "Remove" link. |
| BC-CT-011 | Line total equals unit price × quantity | An item at quantity 3, priced $8.49 | 1. View its line total | Line total reads `$25.47` (`849 × 3` cents formatted), not the unit price. |
| BC-CT-012 | Incrementing from Cart updates that line's total and the summary | Item at quantity 1 | 1. Click `+` on its Stepper | Line total updates immediately; Subtotal/Tax/Total below also update to reflect the new quantity — all without a page reload. |
| BC-CT-013 | Decrementing from Cart updates totals the same way | Item at quantity ≥ 2 | 1. Click `−` | Quantity, line total, and summary all decrease correctly. |
| BC-CT-014 | Decrementing an item to 0 removes it from the list entirely | Item at quantity 1 | 1. Click `−` | The line item disappears from the list (not shown at quantity 0). If it was the last item, the page falls through to the empty-cart state (BC-CT-001). |
| BC-CT-015 | Remove link removes the item regardless of quantity | Item at quantity 3+ | 1. Click "Remove" | Item is deleted from the cart immediately, regardless of its quantity — not just decremented by one. `DELETE /api/cart/:productId` fires. |
| BC-CT-016 | Remove link has a descriptive accessible label | Any item | 1. Inspect its Remove button | `aria-label="Remove {product name} from cart"` — not just "Remove" with no context, since multiple Remove links exist on the page. |
| BC-CT-017 | Subtotal is the sum of all line totals | Multiple items at various quantities | 1. Manually sum each line's total<br>2. Compare to the displayed Subtotal | They match exactly. |
| BC-CT-018 | Tax is exactly 8% of Subtotal, rounded | Any non-zero Subtotal, e.g. $12.99 | 1. Compute `round(1299 × 0.08)` = 104 cents<br>2. Compare to displayed Tax | Tax reads `$1.04`. Label reads "Tax (8%)". |
| BC-CT-019 | Total equals Subtotal + Tax | Any cart state | 1. Add displayed Subtotal + Tax<br>2. Compare to displayed Total | They match exactly, no separate rounding drift. |
| BC-CT-020 | Removing the only item in the cart falls through to the empty state | Exactly one item in cart | 1. Click "Remove" (or decrement to 0) | Page immediately shows the empty-cart `EmptyState` (BC-CT-001) — no intermediate broken/blank render. |

---

### 2.3 Persistence & cross-page consistency

**Acceptance Criteria**
- Given items are added to the cart from Browse, when the user opens Cart, then those exact items/quantities appear — the two pages read from one shared `CartContext`, not independent state.
- Given a cart has items, when the user reloads the browser entirely, then the same items/quantities reappear, fetched fresh from the server via the session token.
- Given a cart mutation's background API call fails, when it fails, then the UI does not roll back or show an error (documented, deliberate simplification) — this is worth explicitly re-verifying whenever `CartContext` changes, since it's easy to "fix" accidentally in a way that contradicts the documented design.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BC-CT-030 | Items added on Browse appear on Cart without extra action | Empty cart | 1. Add 2 different products from Browse<br>2. Navigate to Cart | Both products appear with quantity 1 each — same state, no separate fetch/sync step needed by the user. |
| BC-CT-031 | Quantity changes made on Cart reflect back on Browse | Item in cart at quantity 1 | 1. On Cart, increment to quantity 2<br>2. Navigate to Browse | That product's card on Browse shows its `Stepper` at quantity 2, not the stale "Add to Cart" button or quantity 1. |
| BC-CT-032 | Cart persists across a full page reload | 1+ items in cart | 1. Hard-reload the browser | `GET /api/cart` re-fetches using the session token from `localStorage`; the same items/quantities reappear once loading completes. |
| BC-CT-033 | Cart is per-anonymous-session, not global | Two different sessions (e.g. one normal window, one private window) | 1. Add items in session A<br>2. Open the app in session B | Session B's cart is empty (or whatever it independently had) — session A's items do not leak across. |
| BC-CT-034 | A failed background persist doesn't roll back the optimistic UI change | Simulate a failing `PATCH /api/cart/:id` (e.g. block the request) | 1. Increment a Stepper while the request is blocked | The UI still shows the incremented quantity (optimistic update already applied) even though the persist failed; the failure is only logged to the console — no error toast, no revert. *(This is intentional per `CartContext.jsx`'s documented design — confirm it stays true, don't "fix" it as a bug without discussing scope first.)* |

---

### 2.4 Checkout (explicitly out of scope)

**Acceptance Criteria**
- Given the user clicks "Checkout," when the click happens, then nothing observable occurs — no navigation, no charge, no error, no console exception. This is a deliberate no-op, not a bug, per `docs/project-context.md`'s V1 scope.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| BC-CT-040 | Checkout button is present but inert | Cart has 1+ items | 1. Click "Checkout" | No navigation occurs, no request fires, no console error. Button remains visible and clickable again immediately (not disabled, not stuck in a loading state). |
| BC-CT-041 | Checkout button only renders when the cart has items | Empty cart | 1. Observe the empty-cart state | No "Checkout" button exists on the empty-cart render (it's inside the items-present branch only). |

---

## 3. Cross-cutting integration cases

**Acceptance Criteria**
- Given Save-to-List and Cart are independent features, when one is toggled, then the other is entirely unaffected — saving a product never adds it to the cart, and adding to cart never marks it saved.
- Given both features share the same anonymous-session mechanism, when a new session token is generated (e.g. cleared `localStorage`), then both cart and saved products reset together, consistently — never one persisting while the other resets.

| ID | Title | Preconditions | Steps | Expected Result |
|---|---|---|---|---|
| INT-001 | Saving a product does not add it to the cart | Product unsaved and not in cart | 1. Click its save (heart) button only | Card still shows "Add to Cart" (quantity 0) — save and cart are fully independent actions/state. |
| INT-002 | Adding to cart does not mark a product as saved | Product not saved, not in cart | 1. Click "Add to Cart" only | Save button still shows unsaved (♡, `aria-pressed="false"`). |
| INT-003 | Clearing `localStorage` starts a fresh session for both cart and saved products | Existing session with cart items and saved products | 1. Clear `localStorage`<br>2. Reload the app | A new session token is generated; both cart and saved products come back empty — neither carries over from the old session. |
| INT-004 | Same session token is used for both cart and saved-products requests | Any state | 1. Inspect the `X-Session-Token` header on `/api/cart` and `/api/saved-products` requests | Identical token value on both — one shared anonymous identity (`src/lib/session.js`), not two separate ones. |
| INT-005 | A product saved and added to cart shows both states simultaneously, correctly | Product unsaved, not in cart | 1. Save it<br>2. Add it to cart | Card shows both: heart filled (♥, saved) **and** a `Stepper` at quantity 1 (in cart) at the same time, each control reflecting its own independent state. |

---

## Appendix: what's intentionally *not* tested here

- **Checkout/payment flow** — no real implementation exists (see BC-CT-040/041 for the no-op contract, which *is* tested).
- **Preferences and Compare nav items** — unimplemented (`item.page: null` in `Header.jsx`); clicking them is inert by design, not a bug to chase here.
- **Ingredient-avoid matching** (the logic behind `alert`-variant badges) — currently static seed data, not computed; see `docs/database-schema.md` §3.
- **Deep accessibility audit** (contrast ratios, full keyboard-trap testing, screen-reader transcripts) — use the `accessibility-check` skill; this doc only asserts the handful of a11y behaviors that are functionally load-bearing for Browse/Cart specifically.
