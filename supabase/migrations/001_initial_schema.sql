-- ═══════════════════════════════════════════════════════
-- ABODE — Initial Database Schema
-- Run this entire file in the Supabase SQL Editor.
-- Project: https://jzxlppkaxasvjkxiritx.supabase.co
-- ═══════════════════════════════════════════════════════

-- ─── updated_at trigger (shared) ─────────────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ═══════════════════════════════════════════════════════
-- USERS
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id       TEXT UNIQUE NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  picture_url     TEXT,
  phone           TEXT,
  tax_bracket     INT,                    -- 22 | 24 | 32 | 35 | 37
  property_count  TEXT,                   -- "1" | "2-3" | "4-10" | "10+"
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- PROPERTIES
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS properties (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Address
  address               TEXT NOT NULL,
  city                  TEXT,
  state                 TEXT,
  zip                   TEXT,
  latitude              DECIMAL(10,7),
  longitude             DECIMAL(10,7),

  -- Property facts (from Realtor.com / Zillow)
  property_type         TEXT,             -- "Single Family" | "Condo" | "Townhouse" | "Multi-unit"
  year_built            INT,
  sqft                  INT,
  lot_sqft              INT,
  beds                  NUMERIC(4,1),
  baths                 NUMERIC(4,1),
  is_furnished          BOOLEAN DEFAULT TRUE,

  -- Assessed values (county assessor — for land/building split)
  assessed_land         NUMERIC(12,2),
  assessed_improvement  NUMERIC(12,2),
  land_value            NUMERIC(12,2),    -- May differ from assessed_land

  -- Sale history
  last_sold_price       NUMERIC(12,2),
  last_sold_date        DATE,
  zpid                  TEXT,             -- Zillow property ID

  -- Quiz answers
  property_use          TEXT,             -- "STR" | "MTR" | "LTR"
  purchase_price        NUMERIC(12,2) NOT NULL,
  purchase_year         TEXT,             -- "2025-post" | "2025-pre" | "2024" | "2023" | "2022-earlier"
  placed_in_service     DATE,
  closing_costs         NUMERIC(12,2),

  -- Owner / entity
  owner_name            TEXT,
  owner_entity          TEXT,

  -- Airbnb enrichment
  airbnb_id             TEXT,
  airbnb_title          TEXT,
  airbnb_data           JSONB,            -- Full Airbnb listing blob

  -- Raw API data (Realtor.com / Zillow)
  property_data         JSONB,            -- Cached raw lookup response

  -- Workflow state
  step                  TEXT NOT NULL DEFAULT 'results',   -- "results" | "details" | "purchased"
  study_status          TEXT NOT NULL DEFAULT 'estimate',  -- "estimate" | "processing" | "complete"
  details_url           TEXT,

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(user_id, address)
);

CREATE OR REPLACE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- ESTIMATES
-- One per property. Updated if the user recalculates.
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS estimates (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id               UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id                   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Primary outputs
  first_year_deduction      NUMERIC(12,2),
  first_year_savings        NUMERIC(12,2),
  conservative              NUMERIC(12,2),
  likely                    NUMERIC(12,2),
  optimistic                NUMERIC(12,2),

  -- Baseline comparison (27.5-yr standard)
  standard_annual_deduction NUMERIC(12,2),
  standard_annual_savings   NUMERIC(12,2),
  year_one_multiplier       NUMERIC(5,2),

  -- Building blocks
  depreciable_basis         NUMERIC(12,2),
  purchase_price            NUMERIC(12,2),
  land_ratio                INT,          -- percentage e.g. 17
  land_ratio_source         TEXT,         -- "county" | "default"
  reclass_percent           INT,          -- percentage e.g. 22
  accelerated_amount        NUMERIC(12,2),
  bonus_rate                INT,          -- percentage e.g. 60
  bracket                   INT,          -- percentage e.g. 32
  is_catch_up               BOOLEAN DEFAULT FALSE,

  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE(property_id)
);

CREATE OR REPLACE TRIGGER trg_estimates_updated_at
  BEFORE UPDATE ON estimates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- STUDIES
-- Full cost seg study. Created after payment (Stripe).
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS studies (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id             UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id                 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  status                  TEXT NOT NULL DEFAULT 'draft', -- "draft" | "generating" | "complete" | "failed"
  study_type              TEXT,                          -- "standard" | "catch-up"

  -- Wizard inputs (raw user selections from 8-category wizard)
  wizard_answers          JSONB,
  material_participation  JSONB,    -- { hours, usesPropertyManager }
  renovations             JSONB,    -- Array of post-purchase improvements
  attestation             JSONB,    -- { name, agreed, noTaxAdvice, signedAt }

  -- Calculation outputs
  study_data              JSONB,    -- Full output of generateStudy()
  report_data             JSONB,    -- Full output of assembleReport()

  -- Denormalized summary fields (for dashboard display — avoids parsing JSONB)
  depreciable_basis       NUMERIC(12,2),
  five_year_amount        NUMERIC(12,2),
  seven_year_amount       NUMERIC(12,2),
  fifteen_year_amount     NUMERIC(12,2),
  building_amount         NUMERIC(12,2),
  total_reclass_percent   DECIMAL(5,2),
  first_year_deduction    NUMERIC(12,2),
  bonus_rate              DECIMAL(5,2),
  section_481a_adjustment NUMERIC(12,2),  -- NULL if not catch-up
  estimated_tax_savings   NUMERIC(12,2),

  -- Payment (Stripe)
  payment_status          TEXT NOT NULL DEFAULT 'unpaid', -- "unpaid" | "paid" | "refunded"
  payment_id              TEXT,     -- Stripe payment intent ID
  payment_amount          INT,      -- In cents
  paid_at                 TIMESTAMPTZ,

  -- Delivery (Supabase Storage paths)
  pdf_url                 TEXT,
  excel_url               TEXT,
  form_3115_url           TEXT,     -- Only for catch-up studies

  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at            TIMESTAMPTZ
);

CREATE OR REPLACE TRIGGER trg_studies_updated_at
  BEFORE UPDATE ON studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- PHOTOS
-- Property photos attached to a study.
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS photos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id      UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  storage_path  TEXT NOT NULL,    -- Supabase Storage path
  category      TEXT,             -- "kitchen" | "bathroom" | "exterior" | "flooring" | etc.
  caption       TEXT,
  source        TEXT DEFAULT 'upload', -- "upload" | "airbnb" | "realtor"
  original_url  TEXT,             -- Source URL if pulled from a listing
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- EMAIL CAPTURES
-- Pre-auth email collection (quiz gate, newsletter, etc.)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS email_captures (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL,
  source           TEXT,    -- "quiz-gate" | "newsletter" | "contact" | "signup"
  property_address TEXT,    -- Address being analyzed when captured
  quiz_data        JSONB,   -- Snapshot of quiz answers at capture time
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- CONTACT SUBMISSIONS
-- Contact form and callback requests.
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS contact_submissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT,
  email      TEXT NOT NULL,
  phone      TEXT,
  message    TEXT,
  source     TEXT,  -- "contact-page" | "cpa-inquiry" | "callback-request"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════
-- API CACHE
-- Persistent server-side cache replacing in-memory Node.js map.
-- Survives serverless cold starts and deploys.
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS api_cache (
  cache_key   TEXT PRIMARY KEY,
  cache_type  TEXT NOT NULL,   -- "property" | "airbnb" | "places"
  data        JSONB NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_properties_user_id  ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_property  ON estimates(property_id);
CREATE INDEX IF NOT EXISTS idx_estimates_user      ON estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_studies_property    ON studies(property_id);
CREATE INDEX IF NOT EXISTS idx_studies_user        ON studies(user_id);
CREATE INDEX IF NOT EXISTS idx_photos_study        ON photos(study_id);
CREATE INDEX IF NOT EXISTS idx_email_captures_email ON email_captures(email);
CREATE INDEX IF NOT EXISTS idx_api_cache_expires   ON api_cache(expires_at);

-- ─── Row Level Security ───────────────────────────────
-- All writes go through server API routes using the service role key,
-- which bypasses RLS. RLS is a safety net for direct client access.

ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties         ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates          ENABLE ROW LEVEL SECURITY;
ALTER TABLE studies            ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_captures     ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_cache          ENABLE ROW LEVEL SECURITY;

-- api_cache: publicly readable (safe — no PII)
CREATE POLICY "api_cache_read_all" ON api_cache FOR SELECT USING (true);

-- email_captures: anyone can insert (quiz gate), no reads
CREATE POLICY "email_captures_insert" ON email_captures FOR INSERT WITH CHECK (true);

-- contact_submissions: anyone can insert (contact form), no reads
CREATE POLICY "contact_insert" ON contact_submissions FOR INSERT WITH CHECK (true);

-- ─── Supabase Storage Buckets ────────────────────────
-- Create these manually in the Supabase dashboard under Storage:
--
--   study-photos   — Public read, authenticated write
--   study-reports  — Private (owner + admin read only)
--   study-exports  — Private (owner + admin read only)
