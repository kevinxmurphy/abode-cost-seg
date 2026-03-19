-- ═══════════════════════════════════════════════════════
-- ABODE — Email/Password Auth + Billing Schema Updates
-- Run in the Supabase SQL Editor after 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════

-- 1. Make google_id nullable — email/password users won't have one
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

-- 2. Add password hash for email/password auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Add Stripe customer ID for billing portal + saved payment methods
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- 4. Add password reset token (short-lived, single-use)
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;

-- 5. Track auth method so the account page knows whether to show password change
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_method TEXT NOT NULL DEFAULT 'google';
-- Valid values: 'google' | 'email'

-- 6. Replace the NOT NULL unique constraint on google_id with a partial unique index
--    so multiple email users can all have NULL google_id without conflicting.
--    (In Postgres, NULLs in a unique column don't conflict with each other,
--     so this is mostly defensive — ensures google_ids that exist are unique.)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id_notnull
  ON users(google_id)
  WHERE google_id IS NOT NULL;
