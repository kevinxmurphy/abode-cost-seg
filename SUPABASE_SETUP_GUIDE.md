# Abode — Supabase Integration Context

> Paste this into your Supabase setup session so it has full context on the data models, auth flow, and touchpoints.

---

## Project Stack
- **Next.js 14** (App Router), plain JS (no TypeScript)
- **Auth**: Currently Google Identity Services with cookie-based sessions (`abode_session` cookie, base64, httpOnly, 30-day maxAge)
- **Auth files**: `lib/auth.js`, `app/api/auth/google/route.js`, `app/api/auth/session/route.js`
- **Env vars already in `.env.local`**: `GOOGLE_PLACES_API_KEY`, `APIFY_API_TOKEN`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

## What Needs Supabase

### 1. Database Tables

#### `users`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
email           text UNIQUE NOT NULL
name            text
google_id       text UNIQUE
phone           text
tax_bracket     integer          -- 22, 24, 32, 35, 37
property_count  text             -- "1", "2-3", "4-10", "10+"
avatar_url      text
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

#### `properties`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id) ON DELETE CASCADE
address             text NOT NULL
city                text
state               text
zip                 text
property_type       text             -- "Single Family", "Condo", "Townhouse", "Multi-unit"
year_built          integer
sqft                integer
beds                text
baths               text
lot_sqft            integer
purchase_price      integer NOT NULL
purchase_year       text             -- "2025-post", "2025-pre", "2024", "2023", "2022-earlier"
placed_in_service   date
assessed_land       integer
assessed_improvement integer
land_value          integer
closing_costs       integer
owner_name          text
owner_entity        text
is_furnished        boolean DEFAULT true
latitude            decimal
longitude           decimal
airbnb_id           text
airbnb_title        text
airbnb_data         jsonb            -- Full Airbnb enrichment blob
property_data       jsonb            -- Realtor.com / Apify raw data cache
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

#### `studies`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES users(id) ON DELETE CASCADE
property_id         uuid REFERENCES properties(id) ON DELETE CASCADE
status              text DEFAULT 'draft'  -- draft, generating, complete, failed
study_type          text             -- "standard" or "catch-up"

-- Wizard inputs (the raw user selections)
wizard_answers      jsonb            -- All property detail selections from the 8 categories
material_participation jsonb         -- { hours, usesPropertyManager }
renovations         jsonb            -- Array of post-purchase improvements
attestation         jsonb            -- { name, agreed, noTaxAdvice, signedAt }

-- Calculation outputs (from generateStudy())
study_data          jsonb            -- Full output of generateStudy() from lib/reportEngine.js

-- Report content (from assembleReport())
report_data         jsonb            -- Full output of assembleReport() from lib/reportAssembler.js

-- Key summary fields (denormalized for dashboard display)
depreciable_basis       integer
five_year_amount        integer
seven_year_amount       integer
fifteen_year_amount     integer
building_amount         integer
total_reclass_percent   decimal
first_year_deduction    integer
bonus_rate              decimal
section_481a_adjustment integer      -- NULL if not catch-up
estimated_tax_savings   integer      -- At user's bracket

-- Payment
payment_status      text DEFAULT 'unpaid'  -- unpaid, paid, refunded
payment_id          text             -- Stripe payment intent ID
payment_amount      integer          -- In cents
paid_at             timestamptz

-- Delivery
pdf_url             text             -- Supabase Storage path
excel_url           text             -- Depreciation schedule CSV/XLSX
form_3115_url       text             -- Form 3115 worksheet PDF (if catch-up)

created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
completed_at        timestamptz
```

#### `photos`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
study_id        uuid REFERENCES studies(id) ON DELETE CASCADE
user_id         uuid REFERENCES users(id) ON DELETE CASCADE
storage_path    text NOT NULL       -- Supabase Storage path
category        text                -- "kitchen", "bathroom", "exterior", "flooring", etc.
caption         text
source          text DEFAULT 'upload'  -- "upload", "airbnb", "realtor"
original_url    text                -- Original URL if from listing
created_at      timestamptz DEFAULT now()
```

#### `email_captures`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
email           text NOT NULL
source          text                -- "quiz-gate", "newsletter", "contact", "signup"
property_address text               -- If captured during quiz flow
quiz_data       jsonb               -- Snapshot of quiz answers at capture
created_at      timestamptz DEFAULT now()
```

#### `contact_submissions`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name            text
email           text NOT NULL
phone           text
message         text
source          text                -- "contact-page", "cpa-inquiry", "callback-request"
created_at      timestamptz DEFAULT now()
```

### 2. Supabase Storage Buckets

- **`study-photos`** — User-uploaded property photos. Public read, authenticated write.
- **`study-reports`** — Generated PDF reports. Authenticated read only (owner + admin).
- **`study-exports`** — Excel/CSV depreciation schedules, Form 3115 worksheets. Authenticated read only.

### 3. Row Level Security (RLS) Policies

```sql
-- Users can only read/update their own row
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Properties: user can CRUD their own
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties owner" ON properties FOR ALL USING (auth.uid() = user_id);

-- Studies: user can read/create their own
ALTER TABLE studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Studies owner" ON studies FOR ALL USING (auth.uid() = user_id);

-- Photos: user can CRUD their own
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photos owner" ON photos FOR ALL USING (auth.uid() = user_id);

-- Email captures: insert only (no auth required), read for admin
ALTER TABLE email_captures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Email captures insert" ON email_captures FOR INSERT WITH CHECK (true);

-- Contact submissions: insert only (no auth required)
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Contact insert" ON contact_submissions FOR INSERT WITH CHECK (true);
```

### 4. Auth Migration

Current auth uses Google Identity Services with a manual cookie. Migrate to Supabase Auth:

**Current flow** (`lib/auth.js`):
1. Google Sign-In button loads `accounts.google.com/gsi/client`
2. Credential posted to `/api/auth/google` → decodes JWT → sets `abode_session` cookie
3. `/api/auth/session` GET returns user from cookie, DELETE clears it

**Target flow** (Supabase Auth):
1. Use `@supabase/supabase-js` client with `signInWithOAuth({ provider: 'google' })` or `signInWithIdToken()` for the existing GIS flow
2. Supabase handles session tokens automatically
3. Server-side: use `@supabase/ssr` for cookie-based session in App Router

**Files to update**:
- `lib/auth.js` — Replace with Supabase client helpers
- `app/api/auth/google/route.js` — Replace with Supabase signInWithIdToken
- `app/api/auth/session/route.js` — Replace with Supabase getSession
- `components/ui/NavBar.js` — Uses auth state for logged-in UI
- `components/quiz/QuizResults.js` — Google Sign-In gate
- `app/login/page.js`, `app/signup/page.js` — Auth pages

### 5. Code Touchpoints — Where Stubs Need Replacing

All stubs are in `lib/stubs.js` and marked with `// STUB:` comments:

| Stub | File | What it does now | What Supabase replaces |
|------|------|-----------------|----------------------|
| `login()` | `lib/stubs.js` | Returns `MOCK_USER` | `supabase.auth.signInWithOAuth()` |
| `signup()` | `lib/stubs.js` | Returns `MOCK_USER` | `supabase.auth.signUp()` |
| `logout()` | `lib/stubs.js` | Returns null | `supabase.auth.signOut()` |
| `captureEmail()` | `lib/stubs.js` | console.log | `supabase.from('email_captures').insert()` |
| `downloadStudy()` | `lib/stubs.js` | alert() | Supabase Storage download |
| Session storage | `StudyWizardPage.js` | `sessionStorage.setItem('abode_latest_study')` | `supabase.from('studies').insert()` |
| Dashboard data | `components/app/DashboardContent.js` | Uses `MOCK_PROPERTIES` | `supabase.from('properties').select()` |

### 6. Data Flow: Quiz → Study → Payment → Delivery

```
1. User completes quiz → quiz answers in sessionStorage
2. User signs in (Google) → Supabase Auth session created
3. Sign-in gate unlocked → quiz data saved to `properties` table
4. User clicks "Complete My Study" → enters /quiz/study wizard
5. Wizard collects detailed inputs → stored in component state
6. User clicks "Generate My Study — $481" →
   a. Create `studies` row with status='draft', wizard_answers, etc.
   b. Call generateStudy() + assembleReport() (client-side)
   c. Update studies row with study_data, report_data, status='complete'
   d. Redirect to Stripe checkout with study_id in metadata
7. Stripe webhook confirms payment →
   a. Update studies.payment_status='paid'
   b. Generate PDF (server-side) → upload to Supabase Storage
   c. Update studies.pdf_url
8. User redirected to /app/studies/[id] → fetches study + downloads PDF
```

### 7. Key Library Files (For Context)

- **`lib/reportEngine.js`** — `generateStudy(inputs)` → full study calculation (MACRS tables, component allocation, depreciation schedules, §481(a) catch-up). Output goes in `studies.study_data` jsonb column.
- **`lib/reportAssembler.js`** — `assembleReport(studyData, wizardInputs)` → structured report content for PDF generation. Output goes in `studies.report_data` jsonb column.
- **`lib/legalCitations.js`** — IRS legal citation text library (used by reportAssembler).
- **`lib/propertyCategories.js`** — 8 property detail categories with select/multi options.
- **`lib/propertyCache.js`** — Current in-memory + localStorage caching. Replace with Supabase for server-side cache.
- **`lib/realtorApi.js`** — Realtor.com GraphQL API client (no auth needed).
- **`lib/pricing.js`** — `STUDY_PRICE = 481` (single source of truth).

### 8. Environment Variables Needed

Add to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

Existing (keep):
```
GOOGLE_PLACES_API_KEY=...
APIFY_API_TOKEN=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

Future (not yet needed):
```
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
```

### 9. Packages to Install

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 10. Files to Create

- `lib/supabase/client.js` — Browser client (`createBrowserClient`)
- `lib/supabase/server.js` — Server client for API routes (`createServerClient` with cookies)
- `lib/supabase/middleware.js` — Session refresh middleware (optional but recommended)
- `middleware.js` — Next.js middleware for auth-gated routes (`/app/*`)
