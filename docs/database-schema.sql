-- Clean Shopper — Database Schema
-- Proposed schema, not yet run against a real database. See
-- docs/database-schema.md for the rationale behind each table.
-- Written for PostgreSQL.

-- ============================================================
-- Identity (anonymous — no accounts/auth in V1, see schema doc §1)
-- ============================================================

CREATE TABLE shoppers (
  id            BIGSERIAL PRIMARY KEY,
  session_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Catalog
-- ============================================================

CREATE TABLE brands (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE products (
  id          BIGSERIAL PRIMARY KEY,
  brand_id    BIGINT NOT NULL REFERENCES brands(id),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL, -- e.g. 'Personal Care', 'Home Cleaning', 'Baby Care', 'Pantry'
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  image_url   TEXT,
  source_url  TEXT, -- where the research came from, if applicable
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_brand_id ON products(brand_id);
CREATE INDEX idx_products_category ON products(category);

CREATE TABLE ingredients (
  id   BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE product_ingredients (
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, ingredient_id)
);

CREATE INDEX idx_product_ingredients_ingredient_id ON product_ingredients(ingredient_id);

-- Closed vocabulary — matches SafetyBadge's verified/trusted variants.
-- Don't add rows casually; component-spec.md §2 treats this as a
-- deliberately small, reserved set.
CREATE TABLE certifications (
  id    BIGSERIAL PRIMARY KEY,
  label TEXT NOT NULL UNIQUE, -- e.g. 'EWG Verified', 'USDA Organic', 'B Corp'
  description TEXT
);

CREATE TABLE product_certifications (
  product_id       BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  certification_id BIGINT NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, certification_id)
);

CREATE INDEX idx_product_certifications_certification_id ON product_certifications(certification_id);

-- ============================================================
-- Shopper preferences (per project-context.md §4: avoided ingredients,
-- trusted brands, preferred certifications)
-- ============================================================

CREATE TABLE shopper_avoided_ingredients (
  shopper_id    BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  ingredient_id BIGINT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (shopper_id, ingredient_id)
);

CREATE TABLE shopper_trusted_brands (
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  brand_id   BIGINT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (shopper_id, brand_id)
);

CREATE TABLE shopper_preferred_certifications (
  shopper_id       BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  certification_id BIGINT NOT NULL REFERENCES certifications(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (shopper_id, certification_id)
);

-- ============================================================
-- Cart & saved products
-- ============================================================

CREATE TABLE cart_items (
  id         BIGSERIAL PRIMARY KEY,
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shopper_id, product_id)
);

-- Browse page's "Save to List" toggle (ProductCard's saved/onToggleSave
-- props) — currently in-memory React state only; this is where it'd
-- actually persist.
CREATE TABLE saved_products (
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (shopper_id, product_id)
);

-- ============================================================
-- Research & comparison
-- ============================================================

CREATE TABLE research_queries (
  id         BIGSERIAL PRIMARY KEY,
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_queries_shopper_id ON research_queries(shopper_id);

-- One row per product recommended in response to a query, with the
-- reasoning text shown in ProductCard's `reason` prop.
CREATE TABLE research_results (
  id         BIGSERIAL PRIMARY KEY,
  query_id   BIGINT NOT NULL REFERENCES research_queries(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reasoning  TEXT NOT NULL, -- e.g. "Matches your preference for fragrance-free, plant-based formulas."
  rank       INTEGER NOT NULL, -- display order within this query's results
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_research_results_query_id ON research_results(query_id);

CREATE TABLE comparisons (
  id         BIGSERIAL PRIMARY KEY,
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comparison_items (
  comparison_id BIGINT NOT NULL REFERENCES comparisons(id) ON DELETE CASCADE,
  product_id    BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL, -- left-to-right display order
  PRIMARY KEY (comparison_id, product_id)
);
