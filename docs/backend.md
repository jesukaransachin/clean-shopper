# Clean Shopper — Backend (local setup)

A small Express API in `server/`, backed by Supabase (hosted Postgres). Serves product data to `Home.jsx` and `BrowsePage.jsx`, and persists the cart, via `src/lib/api.js`.

## First-time setup

1. **Create a Supabase project** (you do this — I can't create cloud accounts/projects on your behalf). At [supabase.com](https://supabase.com), create a new project.
2. **Get your credentials**: Project Settings → API. You need the **Project URL** and the **service-role key** (not the anon/public key — the service-role key is required so the server can bypass RLS; see "Security" below).
3. **Set up env vars**:
   ```bash
   cp server/.env.example server/.env
   ```
   Fill in `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `server/.env`. This file is gitignored — never commit it.
4. **Run the schema**: open your Supabase project's SQL editor and run, in order:
   - `supabase/schema.sql` (catalog: brands, products, certifications). Before running it, confirm the `pgcrypto` extension is available:
     ```sql
     select gen_random_uuid();
     ```
     If that errors, run `create extension if not exists pgcrypto;` first.
   - `supabase/schema-cart.sql` (cart persistence: `shoppers`, `cart_items`) — run this *in addition to* `schema.sql`, not instead of it.
5. **Seed the catalog**:
   ```bash
   npm run seed
   ```
   Inserts ~27 products across Personal Care, Home Cleaning, and Baby Care into your Supabase project. (The cart starts empty per-browser — there's nothing to seed there.)
6. **Run the app**:
   ```bash
   npm run dev
   ```
   Runs the Vite frontend (`:5173`) and the Express API (`:3001`) together. Individually: `npm run dev:client` / `npm run dev:server`.

## Expected failure mode before setup

If you run `npm run dev:server` (or `npm run dev`) before step 3–4 above, the server exits immediately with:
```
Missing Supabase credentials.
Copy server/.env.example to server/.env and fill in your Supabase project's URL and service-role key (Project Settings → API).
```
This is intentional — a clear failure, not a silent broken start. The frontend will still run, but `Home.jsx`/`BrowsePage.jsx`/`CartPage.jsx` will show a "Couldn't load" state until the server is actually reachable.

If you've run `schema.sql` but not yet `schema-cart.sql`, cart requests will fail with a Postgres "relation does not exist" error surfaced as a 500 — run the second migration file.

## Scope (V1 cut)

6 tables are executed: `brands`, `products`, `certifications`, `product_certifications` (`supabase/schema.sql`), plus `shoppers` and `cart_items` (`supabase/schema-cart.sql`). The rest of `docs/database-schema.sql` (`ingredients`, `shopper_avoided_ingredients`, `shopper_trusted_brands`, `shopper_preferred_certifications`, `saved_products`, `research_*`, `comparisons`) is still just a proposal — nothing in the frontend has wired UI for those yet (the Browse page's save-to-list heart is in-memory-only React state, there's no ingredient-avoid matching). See `docs/database-schema.md` for the full rationale and the two documented deviations in the original 4-table cut (a `reason` column added directly to `products`, and alert-style badges stored as static certification rows rather than computed at query time) — `shoppers`/`cart_items` have no such deviations, executed exactly as originally documented.

## Anonymous identity (cart persistence)

No user accounts/auth in V1 (see `docs/database-schema.md` §1). The cart is scoped to an anonymous, per-browser identity instead:

- `src/lib/session.js` generates a random UUID on first visit and stores it in `localStorage` (`cleanShopperSessionToken`).
- Every cart request sends it as the `X-Session-Token` header.
- `server/middleware/session.js` resolves that token to a `shoppers` row, creating one on first use.

This means the cart persists across reloads on the same browser, but not across devices/browsers, and clearing site data resets it. If real accounts get added later, `shoppers` is exactly where an `email`/`auth_provider_id` column would go — nothing else in the schema needs to change.

## Security notes

- The service-role key lives only in `server/.env`, read server-side. It's never sent to the frontend.
- Row Level Security is intentionally left off on these tables for V1 — the Express server is the only thing that talks to Supabase (using the service-role key, which bypasses RLS anyway), and the frontend only ever talks to the Express server. This is a deliberate scope decision for a course-demo project with no user accounts, not an oversight.
- `X-Session-Token` is an opaque random UUID, not a secret credential — it's the cart's identity, not an auth token protecting sensitive data. Treat it accordingly (no encryption/signing beyond what's here).

## API

**Products**
- `GET /api/health` — liveness check.
- `GET /api/products` — all products. Optional `?category=Personal+Care|Home+Cleaning|Baby+Care`.
- `GET /api/products/:id` — a single product.

Response shape matches `ProductCard`'s props: `{ id, brand, name, category, price, priceCents, image, reason, badges }`, where `badges` is `[{ label, variant }]`. `priceCents` is the raw integer price, used for cart/total math instead of parsing the formatted `price` string.

**Cart** (all require an `X-Session-Token` header — 400 if missing)
- `GET /api/cart` — this shopper's cart: `[{ quantity, product }]`, `product` shaped like the products endpoint above.
- `POST /api/cart` — body `{ productId }`. Adds 1, or increments if the product is already in the cart.
- `PATCH /api/cart/:productId` — body `{ quantity }`. Sets the exact quantity; `quantity <= 0` removes the item.
- `DELETE /api/cart/:productId` — removes the item regardless of quantity.

## Known simplification: optimistic cart updates, no rollback

`src/lib/CartContext.jsx` updates local state immediately on every cart action (add/increment/decrement/remove) and fires the corresponding API call in the background. If that call fails, the error is logged to the console — the UI does not roll back or show an error toast. This keeps the stepper feeling instant, but means a failed persist is silently inconsistent between what's on screen and what's in the database until the next full reload (which refetches from the server and would correct it). Fine for a course demo; would need real reconciliation (optimistic-update rollback, retry, or a "sync failed" indicator) for production use.
