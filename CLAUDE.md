# Abode Cost Seg — Claude Code Context

## Stack
Next.js 14 App Router, CSS Modules + global tokens (`styles/`), Lucide React icons, Supabase (Postgres), Vercel hosting.

## Key Commands
- `npm run dev` — local dev server
- `git push origin main` — triggers Vercel auto-deploy (connected repo)
- `git config --global user.name/email` — must be set before first commit on a new machine

## Vercel / API Route Rules
- Free tier hard-kills functions at **10s**. Apify actor timeout must be ≤7s so AbortSignal fires cleanly at 8s.
- `vercel.json` sets `maxDuration: 10` for all `app/api/**` routes.
- Long-running Apify jobs use fire-and-poll: `/api/airbnb/start` returns `runId` immediately, client polls `/api/airbnb/poll`.

## Apify
- Actor IDs use `~` separator in API calls (not `/` as shown in Apify UI). e.g. `one-api~zillow-scrape-address-url-zpid`
- Actor registry and input builders live in `lib/apify.js`.

## Supabase
- Storage REST API requires BOTH headers: `Authorization: Bearer <service_role_key>` AND `apikey: <service_role_key>`. Missing either returns 403.
- All writes go through server routes using the service role key (bypasses RLS). RLS is a safety net only.
- Migration file: `supabase/migrations/001_initial_schema.sql` — run manually in Supabase SQL Editor.
- DB layer files all in `lib/db/` — never call Supabase directly from components.

## Realtor.com API (free, primary property data source)
- GraphQL: `https://www.realtor.com/frontdoor/graphql` — no API key needed
- Required headers: `rdc-client-name: rdc-x`, `rdc-client-version: 1.0.0`
- Autocomplete: `https://parser-external.geo.moveaws.com/suggest`

## Quiz Architecture
- **QuizShell** owns all state, async jobs, and navigation logic. QuizStep is a pure presenter — no fetching.
- Both `propertyAddressEntry` and `propertyAddressConfirm` steps write to the same `answers.propertyAddress` key via the `isAddressStep` flag in QuizShell.
- Step order: `propertyUse → propertyAddressEntry → airbnbUrl → propertyAddressConfirm → airbnbVerify → purchasePrice → purchaseYear`
- `airbnbJob` state `{ runId, status, listing }` is owned by QuizShell and passed as a prop to QuizStep.

## CSS Conventions
- All quiz component classes use `quiz-` prefix (e.g. `quiz-airbnb-card`, `quiz-address-wrapper`).
- Global design tokens in `styles/tokens.css`. Key vars: `--turq`, `--turq-bg`, `--turq-light`, `--turq-mid`, `--ink`, `--ink-mid`, `--dust`, `--surface`, `--border`.

## Deployment
- Domain: abodecostseg.com (GoDaddy) → Vercel via A record `76.76.21.21` + CNAME `www` → `cname.vercel-dns.com`
- Stripe webhook secret is endpoint-specific — regenerate in Stripe dashboard when domain/URL changes.
- Google OAuth authorized origins must include the live domain in Google Cloud Console.

## Gotchas
- Edit tool requires the file to have been Read in the current session first.
- `.env.local` is gitignored — never commit. Source of truth for all API keys.
- `kevinxmurphy@gmail.com` is used as a pre-prod placeholder in Abby escalation — swap before go-live.
