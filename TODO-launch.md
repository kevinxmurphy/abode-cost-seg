# Launch TODO — Env Vars Needed in Vercel

- [ ] `NEXT_PUBLIC_GTM_ID` — GTM container ID (e.g. `GTM-XXXXXXX`)
- [ ] `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key
- [ ] `NEXT_PUBLIC_POSTHOG_HOST` — optional, defaults to `https://us.i.posthog.com`
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` — Meta/Facebook Pixel ID
- [ ] `NEXT_PUBLIC_APP_URL` — Production URL (defaults to `https://www.abodecostseg.com`)
- [ ] Drop OG image at `public/og-image.png` (1200x630 PNG)

## Sentry Source Maps (env vars for Vercel build)

- [ ] `SENTRY_AUTH_TOKEN` — Sentry auth token (already configured in next.config.mjs)
- [ ] `SENTRY_ORG` — Sentry organization slug
- [ ] `SENTRY_PROJECT` — Sentry project slug

## Stripe Customer Portal

- [ ] Configure Customer Portal in Stripe Dashboard (Settings > Customer Portal)
  - Enable receipt/invoice access, payment method management
  - Billing portal endpoint is live at `/api/user/billing-portal`

## DB Migration Required

- [ ] Run `supabase/migrations/002_add_utm_columns.sql` in Supabase SQL Editor
  - Adds `utm_source`, `utm_medium`, `utm_campaign` to `users`, `email_captures`, `contact_submissions`
