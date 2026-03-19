-- ═══════════════════════════════════════════════════════
-- Migration 002: Add UTM attribution columns
-- Run this in the Supabase SQL Editor after 001.
-- ═══════════════════════════════════════════════════════

-- Users — first-touch attribution
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Email captures — attribution at capture time
ALTER TABLE email_captures
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Contact submissions — attribution at submission time
ALTER TABLE contact_submissions
  ADD COLUMN IF NOT EXISTS utm_source   TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium   TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;
