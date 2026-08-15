---
name: accessibility-check
description: Audits a page or component for WCAG 2.1 AA accessibility compliance and fixes issues found. Use whenever a new page, route, or significant new component is built or substantially changed in this project — run it before considering the work done, not just when explicitly asked about accessibility.
---

## Accessibility Compliance Check

Run this after building or substantially changing a page/component, before calling the work finished. Check the following against the actual rendered output (use the browser preview when one is running) and against the source.

### 1. Color contrast
- Text vs. its background: normal text needs ≥4.5:1, large text (≥24px, or ≥18.66px bold) needs ≥3:1.
- Compute against the actual CSS variables in `src/index.css` (`--brand-primary`, `--text-secondary`, `--accent-verified`, `--accent-alert`, etc.) rather than assuming — new tokens or new pairings need their own check.
- Non-text UI (button borders, focus rings, icon-only controls) needs ≥3:1 against adjacent colors.

### 2. Color is never the only signal
- Any status/badge/alert that uses color must also carry an icon or text label (this project's `Badge` component does this — verified/alert/trusted each have distinct wording, not just color).
- Don't introduce a new status indicator that relies on color alone (e.g. a red vs. green dot with no label).

### 3. Semantic structure & landmarks
- One `<h1>` per page; heading levels don't skip (h2 → h3, not h2 → h4).
- Use `<header>`, `<nav>`, `<main>`, `<footer>` landmarks; `<main>` should carry `id="main-content"` as the skip-link target (see `Header.jsx`).
- Interactive-looking elements (nav items, tabs, toggles) must be real `<button>` or `<a>` elements — never `<span>`/`<div>` with a click handler and no keyboard path.

### 4. Keyboard access
- Everything clickable must be reachable and operable via Tab/Enter/Space, in a sensible order.
- Every focusable element needs a visible focus indicator (this project's default is a 2px `--brand-primary-dark` outline — reuse it, don't strip `outline` without replacing it).
- New pages should keep the "Skip to main content" link working (it's rendered once in `Header.jsx`; don't duplicate or remove it).

### 5. Forms & inputs
- Every input needs a visible `<label>` or an `aria-label`/`aria-labelledby` if the label is visually implicit (search/composer fields).
- Error and helper text must be programmatically associated (`aria-describedby`), not just visually nearby.

### 6. Images & icons
- Meaningful images need real `alt` text (e.g. the logo: `alt="Clean Shopper"`).
- Purely decorative icons/glyphs (checkmarks, warning symbols inside badges, etc.) need `aria-hidden="true"` so screen readers don't announce redundant symbol names.

### 7. Dynamic content
- Content that updates without navigation (chat responses streaming in, cart count changing, comparison results loading) needs an appropriate `aria-live` region so screen reader users aren't left silent.

## Process

1. Read the new/changed component(s) and their CSS.
2. Check each section above against them — note concrete pass/fail, not vague impressions.
3. Fix what fails directly in the code (don't just report — this project's convention is to fix inline, then summarize what changed).
4. If a preview server is running, verify visually: tab through the new UI and screenshot focus states, confirm nothing regressed.
5. Summarize findings in the same format used previously: what passed, what failed, what was fixed — keep it concise.
