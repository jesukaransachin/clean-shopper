-- Clean Shopper — Saved products persistence (incremental migration)
--
-- Adds the `saved_products` table anticipated in docs/database-schema.md
-- (previously proposed, not executed). Run this IN ADDITION to
-- schema.sql and schema-cart.sql, not instead of them.
--
-- Reuses the same anonymous `shoppers` identity as cart_items (see
-- schema-cart.sql) — no separate auth for saved products.

CREATE TABLE saved_products (
  id         BIGSERIAL PRIMARY KEY,
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  saved_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shopper_id, product_id)
);

CREATE INDEX idx_saved_products_shopper_id ON saved_products(shopper_id);

-- RLS intentionally left off, same rationale as schema.sql/schema-cart.sql:
-- the Express server (service-role key) is the only thing that talks to
-- Supabase.
