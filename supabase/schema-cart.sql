-- Clean Shopper — Cart persistence (incremental migration)
--
-- Adds the `shoppers` and `cart_items` tables from docs/database-schema.sql
-- (previously documented but not executed — only brands/products/
-- certifications/product_certifications were live before this). Run this
-- IN ADDITION to supabase/schema.sql, not instead of it — schema.sql
-- already ran and re-running it will error on tables that already exist.
--
-- No accounts/auth in V1 (see docs/database-schema.md §1): `shoppers` is
-- identified by an opaque `session_token` generated client-side and
-- stored in localStorage, not a login. The Express server resolves it to
-- a shopper row (creating one on first use) via
-- server/middleware/session.js.

CREATE TABLE shoppers (
  id            BIGSERIAL PRIMARY KEY,
  session_token UUID NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  id         BIGSERIAL PRIMARY KEY,
  shopper_id BIGINT NOT NULL REFERENCES shoppers(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  added_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shopper_id, product_id)
);

CREATE INDEX idx_cart_items_shopper_id ON cart_items(shopper_id);

-- RLS intentionally left off, same rationale as schema.sql: the Express
-- server (service-role key) is the only thing that talks to Supabase.
