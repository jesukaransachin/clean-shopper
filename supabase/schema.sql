-- Clean Shopper — Supabase schema (V1 cut)
--
-- Executes a 4-table subset of docs/database-schema.sql — brands, products,
-- certifications, product_certifications. The rest of that doc (shoppers,
-- ingredients, cart_items, saved_products, research_*, comparisons, etc.)
-- is intentionally NOT executed here: nothing in the frontend has wired UI
-- for those yet (cart is a no-op button, save-to-list is in-memory-only,
-- there's no ingredient-avoid matching). Revisit as those features get
-- built. See docs/database-schema.md for the full rationale and the
-- deviations noted below.
--
-- Before running this: in the Supabase SQL editor, run
--   select gen_random_uuid();
-- to confirm the pgcrypto extension is available (Supabase enables it by
-- default, but verify rather than assume). If it errors, run:
--   create extension if not exists pgcrypto;
-- first.

CREATE TABLE brands (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- Deviation from docs/database-schema.sql: adds a `reason` column directly
-- on products. The original schema ties reasoning text to
-- research_results.reasoning (per research query), but no real research
-- flow exists yet — the catalog is static for V1, so a plain column here
-- is simpler and matches what ProductCard's `reason` prop actually needs.
CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  brand_id    BIGINT NOT NULL REFERENCES brands(id),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL, -- 'Personal Care' | 'Home Cleaning' | 'Baby Care' (no 'Pantry' in V1)
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  image_url   TEXT,
  reason      TEXT, -- see deviation note above
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);

-- Deviation from docs/database-schema.sql: this table is documented there
-- as a closed vocabulary for genuine certifications (EWG Verified, USDA
-- Organic, B Corp, Trusted Brand). For V1 it also holds alert-style flags
-- ("Contains Sulfates", "Contains Fragrance") as static rows, even though
-- database-schema.md §3 correctly describes those as things that SHOULD be
-- computed by diffing a shopper's avoid-list against ingredients at query
-- time. That computation needs shoppers + ingredients +
-- shopper_avoided_ingredients, none of which exist yet. Known V1
-- compromise — revisit when preferences get built.
CREATE TABLE certifications (
  id    BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE,
  variant TEXT NOT NULL CHECK (variant IN ('verified', 'trusted', 'alert')),
  description TEXT
);

CREATE TABLE product_certifications (
  product_id       BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  certification_id BIGINT NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, certification_id)
);

CREATE INDEX idx_product_certifications_certification_id ON product_certifications(certification_id);

-- Row Level Security intentionally left off for V1: the Express server
-- uses the service-role key (bypasses RLS) and the frontend never talks to
-- Supabase directly. Intentional scope decision, not a gap — see
-- docs/backend.md.
