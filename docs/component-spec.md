# Clean Shopper Component Specification
**Source documents read:** `CLAUDE.md`, `docs/design-system.md`, `src/index.css` (see note below on `tailwind.config.js`)
**Version:** 1.0

---

## A note on tokens before you read this

The task that produced this document asked for visual structure written in Tailwind classes referencing a `tailwind.config.js` token theme (`bg-primary`, `text-h3`, `p-lg`, etc.). **This project doesn't use Tailwind** — there's no `tailwind.config.js` and Tailwind isn't a dependency (confirmed against `package.json`). Styling here is plain CSS with a small set of CSS custom properties defined once in `src/index.css` and documented in `docs/design-system.md`.

So this spec uses the tokens that actually exist instead of inventing Tailwind class names that would silently not work if pasted into this codebase:

| What the task asked for | What this project actually has |
|---|---|
| `bg-primary`, `text-primary` (Tailwind color classes) | `var(--brand-primary)`, `var(--text-primary)` (CSS custom properties, fully defined) |
| `text-h3`, `text-body` (Tailwind type-scale classes) | No custom properties yet — literal px values per `design-system.md`'s documented type scale (`12/14/16/20/25/31/39px`). **Gap**: not yet tokenized in code; see Appendix. |
| `p-lg`, `gap-md` (Tailwind spacing scale) | No custom properties yet — literal px values per `design-system.md`'s documented spacing scale (`4/8/12/16/24/32/48/64px`). **Gap**: not yet tokenized in code; see Appendix. |
| `rounded-lg`, `shadow-sm` | Literal `border-radius` values (16px cards, 999px pills, 12px medium, 8px small). No shadows are used anywhere in the current design system — flat, border-based elevation only (`var(--border-default)`), consistent with the "confidence over clutter" principle. Don't introduce `box-shadow` without updating `design-system.md` first. |

Every color value below is a `var(--token-name)` — none are hardcoded. Spacing/type values are literal px numbers because that's genuinely what's in the code today; flagging that honestly is more useful than pretending a token doesn't exist.

**Implementation status** is called out per component: some of the eight requested already exist in the codebase, some don't yet. Specs for non-existent components are proposals consistent with the existing visual language, not documentation of shipped code.

---

## 1. ProductCard
**Status:** ✅ Implemented — `src/components/ProductCard.jsx`

**Purpose:** Displays a single researched product with its safety badges and cart action, either standalone in a grid or embedded inline in a chat response.

### Props
| Prop | Type | Required | Notes |
|---|---|---|---|
| `image` | `string` (URL) | No | Falls back to a text placeholder if omitted |
| `brand` | `string` | No | Rendered only if present |
| `name` | `string` | **Yes** | Also used to build the image `alt` text and the Add-to-Cart `aria-label` |
| `price` | `string` | No | Pre-formatted (e.g. `"$12.99"`) — component does no currency formatting |
| `badges` | `{ label: string, variant: 'verified' \| 'alert' \| 'trusted' }[]` | No | Defaults to `[]`; renders 0+ `SafetyBadge`s in a wrapping row |
| `reason` | `string` | No | The "why recommended" line; omitted if not passed |
| `onAddToCart` | `() => void` | No | Called when quantity goes from 0 → 1 (first "Add to Cart" click) |
| `quantity` | `number` | No | Defaults to `0`. `0` renders the "Add to Cart" button; `>0` renders a `Stepper` in its place |
| `onIncrement` / `onDecrement` | `() => void` | No | Called by the `Stepper` once `quantity > 0`. Decrementing from `1` is expected to remove the item (handled by the cart state, not this component) |
| `saved` | `boolean` | No | Defaults to `false`. Added for the Browse page's "Save to List" toggle |
| `onToggleSave` | `() => void` | No | If omitted, the save button doesn't render at all (e.g. it's absent on Home's sample cards, present on Browse's) |

**Note:** the cart quantity/stepper behavior was added alongside the Cart feature (`src/lib/CartContext.jsx`, `src/features/cart/CartPage.jsx`) and a new `Stepper` component (`src/components/Stepper.jsx`) — not yet formally specced in this document with its own section. Backfill if it needs a second design pass.

### Visual structure
- Root: `<article class="product-card">` — `border: 1px solid var(--border-default)`, `border-radius: 16px`, `background: var(--surface-base)`, `overflow: hidden`
- Image area: fixed `140px` height, `background: linear-gradient(135deg, var(--surface-subtle), var(--surface-sunken))`, image `object-fit: cover`, `position: relative` (anchors the save button)
- Save button (only when `onToggleSave` is passed): absolute-positioned, `top: 8px; right: 8px`, `28px` circle, `background: var(--surface-base)`, icon-only (♡ unsaved / ♥ saved), `aria-pressed` + a descriptive `aria-label` since there's no visible text label
- Body: `padding: 16px`
  - Brand: `font-size: 11px`, `font-weight: 600`, uppercase, `letter-spacing: 0.04em`, `color: var(--text-secondary)`
  - Name: `<h3>`, `font-size: 14px`, `font-weight: 600`
  - Badges row: `display: flex`, `flex-wrap: wrap`, `gap: 6px`
  - Reason: `background: var(--surface-subtle)`, `border-radius: 8px`, `padding: 8px 10px`, `font-size: 12px`, `color: var(--text-secondary)`
  - Footer: `display: flex`, `justify-content: space-between`, price `font-weight: 700 / 15px / var(--text-primary)`

### States
- **Default:** as above.
- **Hover:** no card-level hover defined today (only the Add to Cart button and badges-free rows elsewhere have hover states) — if adding one, use `var(--surface-subtle)` background per the pattern established in Feature List rows, not a shadow.
- **Loading:** not implemented. Needed once real search results stream in — recommend a skeleton using `var(--surface-subtle)`/`var(--surface-sunken)` blocks matching the image/text layout, not a spinner (spinners aren't used anywhere in this design system).
- **Empty:** not applicable to a single card — see `EmptyState` for "no results."
- **Error:** not implemented. An image `onError` fallback to the existing placeholder span exists implicitly (if `image` is falsy) but there's no handling for a broken/404 image URL yet — currently it would just render a broken image icon. **Bug to fix**, not a spec gap.

### Usage rules
- Use for any single product result — search results, cart contents, comparison columns.
- Do **not** use for a product *reference* inside chat prose (e.g. "I found the Aura Home cleaner") — that's just a text mention; only instantiate the card when the product is being presented as an actionable result.
- Multiple badges are expected and fine (see Aura Home example: EWG Verified + B Corp). Don't collapse multiple certifications into one badge.

---

## 2. SafetyBadge
**Status:** ✅ Implemented — `src/components/Badge.jsx` (named `Badge` in code; spec uses the requested name `SafetyBadge` since that's what it functionally is — every current usage is a safety/trust signal)

**Purpose:** Communicates a single trust or safety signal (certification, warning, or trusted-brand flag) as a small, scannable pill — never decorative.

### Props
| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `'verified' \| 'alert' \| 'trusted'` | No | Defaults to `'trusted'` |
| `children` | `ReactNode` (label text) | **Yes** | The visible label — must always carry the full meaning on its own (icon is `aria-hidden`) |

### Visual structure
- `display: inline-flex`, `align-items: center`, `gap: 3px`
- `padding: 3px 9px`, `border-radius: 999px` (pill)
- `font-size: 11px`, `font-weight: 600`, uppercase, `letter-spacing: 0.02em`
- **verified:** `background: var(--accent-verified)`, `color: var(--text-inverse)`, icon `✓`
- **alert:** `background: var(--accent-alert)`, `color: var(--text-inverse)`, icon `⚠`
- **trusted:** `background: transparent`, `border: 1px solid var(--brand-primary)`, `color: var(--text-primary)`, no icon

### States
- **Default:** only state — badges are non-interactive, static labels. No hover/focus/loading/empty/error apply.

### Usage rules
- `--accent-verified` green is reserved *exclusively* for this component's verified state — per `design-system.md` §2, it must never appear as decoration elsewhere, or the "green = data-backed claim" signal breaks.
- Never rely on `variant` color alone — the label text must independently convey verified/warning/trusted (already true of every existing usage: "EWG Verified", "Contains Sulfates", "Trusted Brand").
- Don't invent a fourth variant without updating `design-system.md` §4 first — the badge vocabulary is deliberately closed so users learn to trust it at a glance.

---

## 3. SearchBar
**Status:** ✅ Implemented — `src/components/SearchBar.jsx`, built with Tailwind utility classes. Used on both `Home.jsx` (replacing its former inline chat-composer markup) and `BrowsePage.jsx`. Two spec values (20px left padding, 14px font) have no matching Tailwind token — see the comment at the top of the file. Not wired to a real search/research backend — there isn't one yet; `onSubmit` receives the current value and the caller decides what to do with it.

**Purpose:** Freeform entry point for describing what the user is looking for, submitted to start a research/chat turn.

### Props
| Prop | Type | Required | Notes |
|---|---|---|---|
| `value` | `string` | **Yes** | Controlled input |
| `onChange` | `(value: string) => void` | **Yes** | |
| `onSubmit` | `() => void` | **Yes** | |
| `placeholder` | `string` | No | Defaults to `"e.g. a fragrance-free all-purpose cleaner"` (existing copy) |
| `isLoading` | `boolean` | No | Defaults to `false`; see States |
| `ariaLabel` | `string` | No | Defaults to `"Describe what you're looking for"` (existing pattern — the visible placeholder isn't a substitute for a real accessible name) |

### Visual structure
- Root: `display: flex`, `gap: 12px`, `background: var(--surface-subtle)`, `border: 1px solid var(--border-default)`, `border-radius: 999px`, `padding: 6px 6px 6px 20px` (matches existing `.chat-composer`)
- Input: `flex: 1`, no border, `background: transparent`, `font-size: 14px`, `color: var(--text-primary)`; placeholder `color: var(--text-secondary)`
- Submit button: existing primary button styling (pill, `var(--brand-primary)` fill) — see `Button` spec below

### States
- **Default:** as above.
- **Hover:** not defined on the input itself; the submit button uses the standard button hover (`var(--brand-primary-dark)`).
- **Loading:** not implemented. Recommend disabling the input and swapping the submit button label (e.g. "Searching…") rather than an overlay spinner, consistent with this design system avoiding spinners.
- **Empty:** N/A — empty is just the default unfilled state, not a distinct visual state.
- **Error:** not implemented. Needed for e.g. a failed research request — recommend an inline message below the bar in `var(--accent-alert)` text, not a red border (red borders aren't part of the current form-error vocabulary anywhere in the system yet — this would be a new pattern worth adding to `design-system.md` when built).

### Usage rules
- One `SearchBar` per screen, in the hero position — it's the primary entry point, not a persistent nav-bar search (the nav bar itself has no search field currently; don't add one without updating `NavBar`'s spec, since `design-system.md` §4 explicitly scoped nav to logo + 4 category links).
- Don't use for structured filtering (price range, category) — that's `CategoryTag` territory, not freeform text.

---

## 4. CategoryTag
**Status:** ✅ Implemented — `src/components/CategoryTag.jsx`, built with Tailwind utility classes against `tailwind.config.js` tokens (built after Tailwind was wired in, unlike the CSS-custom-property components above). Two spec values (3px/9px padding, 11px font) have no matching token and use Tailwind arbitrary values rather than rounding — see the comment at the top of the file. Used on the Browse page (`src/features/browse/BrowsePage.jsx`) for category filtering.

**Purpose:** A selectable filter/category chip (e.g. filtering research results or cart items by "Cleaning," "Personal Care," "Pantry").

### Props
| Prop | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | **Yes** | |
| `selected` | `boolean` | No | Defaults to `false` |
| `onToggle` | `() => void` | **Yes** | |
| `disabled` | `boolean` | No | Defaults to `false` |

### Visual structure
Modeled directly on `SafetyBadge`'s `trusted` variant so the two pill families read as siblings, with a selected state added:
- `display: inline-flex`, `align-items: center`, `padding: 3px 9px` (same as `SafetyBadge` — a tag is a badge that can be toggled, not a different scale)
- `border-radius: 999px`, `font-size: 11px`, `font-weight: 600`
- **Unselected:** `background: transparent`, `border: 1px solid var(--border-default)`, `color: var(--text-secondary)`
- **Selected:** `background: var(--brand-primary)`, `border: 1px solid var(--brand-primary)`, `color: var(--text-inverse)`

### States
- **Default (unselected):** as above.
- **Hover:** `border-color: var(--brand-primary)`, `color: var(--text-primary)` — signals interactivity without full commit to selected styling.
- **Selected:** as above (functions as this component's "active" state).
- **Disabled:** `color: var(--text-secondary)` at reduced opacity (`0.5`), `border-color: var(--border-default)`, `cursor: not-allowed`, no hover change.
- **Loading / Empty / Error:** not applicable — this is a stateless toggle control.

### Usage rules
- Use only for multi-select or single-select *filtering*, not for status/certification display — that distinction is what separates this from `SafetyBadge`. If it's showing a fact about a product ("Verified"), it's a `SafetyBadge`. If it's something the user can click to change what they see, it's a `CategoryTag`.
- Must always be a real `<button>`, never a `<span>`/`<div>` with a click handler — this project's accessibility convention (see `accessibility-check` skill) requires every interactive-looking element to be keyboard-operable.

---

## 5. NavBar
**Status:** ✅ Implemented — `src/components/Header.jsx` (named `Header` in code)

**Purpose:** Persistent top-level navigation: brand identity plus the four primary sections of the app.

### Props
Currently **none** — `Header` takes no props; nav items are a hardcoded `NAV_ITEMS` array in the component. If this needs to vary per screen (e.g. highlighting the active section), it will need an `activeItem` prop — not implemented today.

| Prop (proposed) | Type | Required | Notes |
|---|---|---|---|
| `activeItem` | `'Research' \| 'Preferences' \| 'Cart' \| 'Compare'` | No | Not implemented — nav currently has no active/current-page indication at all. **Gap.** |

### Visual structure
- Root: `<header>`, `display: flex`, `align-items: center`, `justify-content: space-between`, `padding: 16px 32px`, `border-bottom: 1px solid var(--border-default)`
- Logo: `height: 32px` (full `logo.svg` lockup, not the mark alone)
- Nav: `<nav aria-label="Primary">`, `display: flex`, `gap: 28px`, items are real `<button>`s (not links — there's no routing yet)
- Nav item text: `font-size: 13px`, `font-weight: 600`, uppercase, `letter-spacing: 0.04em`, `color: var(--text-primary)`

### States
- **Default:** as above.
- **Hover (nav item):** `color: var(--brand-primary)`
- **Focus-visible (nav item):** `outline: 2px solid var(--brand-primary-dark)`, `outline-offset: 2px`
- **Active/current page:** not implemented — see Gap above.
- **Loading / Empty / Error:** not applicable to a static nav shell.

### Usage rules
- One `NavBar` per page, always at the very top, immediately after the skip-link (`Header` renders both together — don't separate them, the skip-link's `href="#main-content"` depends on every page having that landmark id, see `accessibility-check`).
- Don't add a mega-menu or nested category depth — `design-system.md` §7 explicitly rejected that pattern as inconsistent with this app's narrower scope.

---

## 6. Button (primary and secondary variants)
**Status:** ⚠️ Partially implemented — global styles exist in `src/index.css` (applies to every `<button>` by default = primary), plus a size override (`.product-add-button`). **There is no dedicated `Button` component** — every button in the app is a bare `<button>` element styled by the global tag selector or a one-off class. Secondary variant is documented in `design-system.md` §4 but has no CSS implementation anywhere in the codebase yet.

### Props (proposed, if extracted into a real component)
| Prop | Type | Required | Notes |
|---|---|---|---|
| `variant` | `'primary' \| 'secondary'` | No | Defaults to `'primary'` |
| `children` | `ReactNode` | **Yes** | |
| `onClick` | `() => void` | No | |
| `type` | `'button' \| 'submit'` | No | Defaults to `'button'` |
| `disabled` | `boolean` | No | Defaults to `false` — no disabled styling exists today; **gap** |

### Visual structure
- Shared: `border-radius: 999px` (pill), `padding: 0.7em 1.4em`, `font-size: 0.9em`, `font-weight: 600`, `border: none`
- **Primary** (implemented, global default): `background: var(--brand-primary)`, `color: var(--text-inverse)`
- **Secondary** (documented, not implemented): per `design-system.md` §4, should be `background: transparent`, `border: 1px solid var(--brand-primary)` (outline), `color: var(--brand-primary)` — **this needs to actually be built**; right now every button in the app is visually primary, including ones that arguably shouldn't be (there is no secondary button anywhere in the shipped UI yet).

### States
- **Default:** as above.
- **Hover:** primary → `background: var(--brand-primary-dark)`. Secondary → not defined; recommend `background: var(--surface-subtle)` to stay consistent with the hover treatment used elsewhere (Feature List rows, nav items don't get a background fill though — needs a decision, flagging rather than guessing).
- **Focus-visible:** `outline: 2px solid var(--brand-primary-dark)`, `outline-offset: 2px` (implemented, applies to all buttons today).
- **Loading:** not implemented anywhere. No disabled/loading button state exists in the codebase.
- **Disabled:** not implemented. **Gap** — needed before Cart/Preferences actions ship, since actions like "Add to Cart" will need a disabled state once real async behavior exists.
- **Empty / Error:** not applicable to a button.

### Usage rules
- Primary: one clear primary action per view/card (e.g. "Ask Clean Shopper," "Add to Cart"). Don't use primary for more than one competing action in the same component.
- Secondary: reserved for de-emphasized actions alongside a primary one (e.g. "Compare" next to "Add to Cart") — **not yet used anywhere**, so the first real usage should also be the first implementation.
- Destructive variant is documented (`design-system.md` §4: `--accent-alert` outline, "Remove from cart") but similarly unimplemented — don't build it improvised; follow that spec when the Cart feature needs it.

---

## 7. InputField
**Status:** 🚧 Proposed — no generic text-input component exists. The only text input in the app today is the hardcoded one inside `SearchBar`'s precedent markup.

**Purpose:** General-purpose labeled text input for forms outside the search bar — e.g. entering an ingredient to avoid in Preferences.

### Props
| Prop | Type | Required | Notes |
|---|---|---|---|
| `label` | `string` | **Yes** | Always visible — this system has no precedent for placeholder-as-label, and that pattern fails accessibility guidance already established in this project |
| `value` | `string` | **Yes** | |
| `onChange` | `(value: string) => void` | **Yes** | |
| `placeholder` | `string` | No | |
| `helperText` | `string` | No | |
| `errorText` | `string` | No | Presence implies error state |
| `required` | `boolean` | No | Defaults to `false` |

### Visual structure
- Label: `font-size: 12px`, `font-weight: 600`, `color: var(--text-secondary)`, positioned above the input (not floating/inline — no floating-label pattern exists anywhere in this system)
- Input: `background: var(--surface-sunken)` (per `design-system.md` §2, `--surface-sunken` is explicitly reserved for "Inputs, dividers" — this is the one existing token clue for how this component should look), `border: 1px solid var(--border-default)`, `border-radius: 8px` (using the "small" radius tier, distinct from the 999px pill used by `SearchBar`, since a labeled form field is a different visual register than the freeform hero search), `padding: 10px 14px`, `font-size: 14px`, `color: var(--text-primary)`
- Helper/error text: `font-size: 12px`, positioned below the input

### States
- **Default:** as above.
- **Focus:** `border-color: var(--brand-primary)` (recommended — no existing input focus precedent to follow exactly, since `SearchBar`'s input suppresses its own border in favor of the pill container's border; a standalone field needs its own focus treatment)
- **Error:** `border-color: var(--accent-alert)`, `errorText` rendered in `var(--accent-alert)` — this is a genuinely new pattern; `--accent-alert` is currently reserved in `design-system.md` §2 for "Ingredient warnings, avoided ingredient flags" specifically. Using it for form validation errors too is a reasonable extension (same "something's wrong" meaning) but **should be confirmed against `design-system.md` before building**, since §2 currently scopes it narrowly.
- **Disabled:** not implemented/specified — recommend `background: var(--surface-base)`, `color: var(--text-secondary)`, `cursor: not-allowed`.
- **Loading / Empty:** not applicable to a single field.

### Usage rules
- Use for any discrete labeled form value (Preferences screen: avoided ingredients, trusted brands). Don't use for the hero search — that's `SearchBar`, which is deliberately unlabeled/placeholder-driven since it's a single obvious freeform action, not a form field.

---

## 8. EmptyState
**Status:** ✅ Implemented — `src/components/EmptyState.jsx`, built with Tailwind utility classes. First use: Browse page's "No products in this category yet." message when a filter matches zero products. Two spec values (16px/700 title, 13px description) have no matching Tailwind token — see the comment at the top of the file.

**Purpose:** Communicates "nothing here yet" for any list/grid that can legitimately be empty (empty cart, no search results, no saved preferences, comparison with fewer than 2 products selected).

### Props
| Prop | Type | Required | Notes |
|---|---|---|---|
| `title` | `string` | **Yes** | e.g. "Your cart is empty" |
| `description` | `string` | No | One line, e.g. "Products you add will show up here." |
| `actionLabel` | `string` | No | If provided with `onAction`, renders a primary `Button` |
| `onAction` | `() => void` | No | |

### Visual structure
- Root: centered column, `text-align: center`, generous vertical padding (`64px` per the spacing scale's top tier used elsewhere for hero sections — see `.hero` in `Home.css` using `96px`; `EmptyState` is a secondary moment, not a hero, so the next tier down, `64px`, is more appropriate) — **not yet a token, literal value**
- Title: `font-size: 16px`, `font-weight: 700`, `color: var(--text-primary)` (matches the weight/size used for `.product-name` and `.feature-row-text h3` — this system's convention for a small-headline moment)
- Description: `font-size: 13px`, `color: var(--text-secondary)`, `margin-top: 4px`
- Action button: standard primary `Button`, `margin-top: 16px`
- No icon/illustration system exists in this app yet (per `design-system.md` §6, icons are "simple line icons, 2px stroke" but none have been built) — **do not** invent a custom illustration for this without a design pass; ship text-only first.

### States
This component *is* a state (of its parent list), so it doesn't have nested states in the usual sense — but:
- **Default (no action):** title + description only, no button.
- **With action:** title + description + primary `Button`.
- **Loading:** not this component's job — a loading grid/list should show a skeleton (see `ProductCard`'s Loading gap) instead of `EmptyState`; don't show "no results" while a request is still in flight.

### Usage rules
- Only render after a request/computation has genuinely completed with zero results — never as a default/initial placeholder before the user has done anything (e.g. don't show `EmptyState` for "Cart" on first load before distinguishing "genuinely empty" from "haven't checked yet," though today the app has no async state at all so this distinction is currently moot — flagging it now since it'll matter the moment Cart becomes real).
- Copy should stay specific to the context ("Your cart is empty," not a generic "Nothing here") — matches this system's existing tone of specific, plain-language copy (see `ProductCard`'s reason lines).

---

## Appendix: Token gaps found while writing this spec

These aren't blockers, but should be fixed before this spec is used to build a lot more UI, otherwise every new component keeps hand-copying literal px values instead of referencing a source of truth:

1. **Spacing isn't tokenized in code.** `design-system.md` §5 documents a `4/8/12/16/24/32/48/64` scale, but `src/index.css` has no `--space-*` custom properties — every component's CSS file just writes the literal px number. Recommend adding `--space-1` through `--space-8` to `:root` and migrating existing CSS to reference them.
2. **Typography isn't tokenized in code.** Same issue for the `12/14/16/20/25/31/39px` type scale in `design-system.md` §3 — no `--text-*` custom properties exist. Recommend `--text-xs` through `--text-display` (or similar) in `:root`.
3. **No elevation/shadow tokens** — confirmed intentional (flat, border-based design per §1 "confidence over clutter"), not a gap, but worth stating explicitly here so nobody adds `box-shadow` ad hoc later.
4. **Secondary and destructive button variants are documented but unbuilt.** First real usage (likely Cart) should build them per `design-system.md` §4 rather than improvising new styles.
5. **No focus/error/disabled convention exists for form inputs** — this spec's `InputField` proposes one, but it hasn't been validated against a real built form yet, since Preferences hasn't been built.

---
*Component spec v1.0 — written against the actual `src/index.css` custom properties and `docs/design-system.md`, not Tailwind (see note at top). Update as `SearchBar`, `CategoryTag`, `Button`, `InputField`, and `EmptyState` move from proposed to implemented.*
