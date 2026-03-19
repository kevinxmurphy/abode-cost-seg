-- ═══════════════════════════════════════════════════════
-- ABODE — Email Auth Migration
-- Run in Supabase SQL Editor after 001_initial_schema.sql
-- ═══════════════════════════════════════════════════════

-- Make google_id nullable (email/password users won't have one)
ALTER TABLE users ALTER COLUMN google_id DROP NOT NULL;

-- Auth provider tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider TEXT NOT NULL DEFAULT 'google';

-- Email/password auth
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Password reset
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ;

-- Stripe customer ID (for saved payment methods / customer portal)
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;

-- Index for reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(password_reset_token)
  WHERE password_reset_token IS NOT NULL;

-- Index for stripe customer lookups
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;
