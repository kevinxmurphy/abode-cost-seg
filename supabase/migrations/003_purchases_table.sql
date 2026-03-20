-- ═══════════════════════════════════════════════════════
-- ABODE — Migration 003: Purchases audit table
-- Run this in the Supabase SQL Editor after 001 + 002.
-- ═══════════════════════════════════════════════════════

-- ─── Purchases audit table ─────────────────────────────
-- Logs every Stripe checkout.session.completed event.
-- The `studies` table is the source of truth for study payment state;
-- this table is an immutable audit trail for financial reporting.

CREATE TABLE IF NOT EXISTS purchases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id           UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- Stripe fields
  stripe_session_id     TEXT NOT NULL,
  stripe_payment_intent TEXT,
  amount_total          INT,           -- In cents (e.g. 48100 = $481.00)
  currency              TEXT DEFAULT 'usd',
  customer_email        TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user    ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_session ON purchases(stripe_session_id);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- ─── Add unique constraint on studies.property_id ──────
-- Allows the webhook to use upsert (onConflict: "property_id")
-- so duplicate webhook firings don't create duplicate studies.
-- Note: only applies when property_id is NOT NULL.
CREATE UNIQUE INDEX IF NOT EXISTS idx_studies_property_unique
  ON studies(property_id)
  WHERE property_id IS NOT NULL;
