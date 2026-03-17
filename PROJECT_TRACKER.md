# ABODE — Project Tracker

> **Last updated:** 2026-03-16 (evening)
> **Product:** AI-powered cost segregation tool for STR investors
> **Stack:** Next.js 14 (App Router), Supabase, Google OAuth, Stripe
> **Stripe Product:** `prod_UA3MUq9l0I6QBL` / Price: `price_1TBjGFCym8zeLTTQ0Dkvi1Aa` ($481 one-time)
> **Production domain:** `abodecostseg.com`
> **Refund window:** 90 days (stored in `lib/config.js` as `REFUND_WINDOW_DAYS` — easy to change)

---

## 🎯 Critical Path to Revenue

```
[✅] Quiz funnel → [✅] Results gate → [✅] Detailed walkthrough
                                                    ↓
                                          [🔲] Stripe checkout ($481)
                                                    ↓
                                          [✅] Study wizard → [✅] Report engine
                                                    ↓
                                          [🔲] PDF delivery → [🔲] Email notification
                                                    ↓
                                          [🔲] Deploy to production domain
```

**Revenue blocker:** Stripe integration. Everything else is parallel prep.

---

## 🏗️ Work Streams

### WS-1: Quiz Funnel (Frontend) — ✅ COMPLETE
| Task | Status | Notes |
|------|--------|-------|
| Quiz flow (6 steps) | ✅ Done | Address autocomplete, Airbnb URL import, conditional steps, keyboard shortcuts |
| Light quiz results | ✅ Done | Estimate calc, street view, Airbnb card, standard vs cost seg comparison |
| Email/account gate | ✅ Done | Google Sign-In + email fallback, blurred tease, trust badges |
| Detailed walkthrough | ✅ Done | 8 category cards, single/multi-select, confirm-and-advance, baseline comparison |
| Airbnb caption analysis | ✅ Done | Keyword regex categorization, amenity extraction, cross-category mapping |
| Airbnb photo strips | ✅ Done | Room photos in matching category cards, lightbox, detected amenity badges |
| Form polish | ✅ Done | Larger fonts, iOS zoom prevention, skeleton shimmer loading |
| URL validation | ✅ Done | Airbnb URL format check, removed VRBO references |
| "With vs without" baseline | ✅ Done | Standard depreciation vs cost seg Year 1, delta line |
| Tax bracket highlight | ✅ Done | 32% "Most common" badge |
| SMS consent always visible | ✅ Done | Full TCPA language shown regardless of phone entry |
| Flat $481 study cost | ✅ Done | Replaced tiered pricing |

---

### WS-2: AI Image Analysis (Vision) — ✅ BUILT, NEEDS TESTING
| Task | Status | Notes |
|------|--------|-------|
| Caption-based categorization | ✅ Done | `categorizeImageByCaption()`, `extractAmenitiesFromCaption()` |
| Vision API route | ✅ Done | `app/api/vision/analyze/route.js` — Claude Sonnet via Anthropic API |
| Vision client hook | ✅ Done | `lib/useVisionAnalysis.js` — triggers, caches (sessionStorage 30min), maps to cost seg |
| Kitchen detection | ✅ Done | Granite/quartz/marble countertops, stainless appliances, tile backsplash, cabinetry quality |
| Bathroom detection | ✅ Done | Dual vanity, soaker tub, frameless shower, heated floors, rain shower, jetted tub |
| Flooring detection | ✅ Done | Hardwood, tile, LVP, carpet, marble, travertine, engineered hardwood |
| Outdoor detection | ✅ Done | Pool (saltwater/chlorine), hot tub, outdoor kitchen, fire pit, pergola, deck material |
| Interior detection | ✅ Done | Lighting type, fireplace, crown molding, built-ins, plantation shutters |
| Smart home detection | ✅ Done | Keypad locks, smart thermostat, security cameras, whole-home audio, home theater |
| Specialty detection | ✅ Done | Game room, home gym, sauna, wine cellar, bunk room |
| Pre-select walkthrough items | ✅ Done | `VISION_ITEM_MAP` (70+ mappings) auto-fills selections from vision results |
| Vision badges in photo strips | ✅ Done | "AI detected:" label, quality indicators (upgraded/premium/luxury), pulsing loading state |
| **E2E test with live Airbnb listing** | 🔲 Todo | Run full quiz flow with a real active Airbnb URL — validate photo pull, AI detection accuracy, pre-selection logic, estimate output |

---

### WS-3: Authentication & Accounts — ✅ COMPLETE
| Task | Status | Notes |
|------|--------|-------|
| Google OAuth flow | ✅ Done | Real GIS integration, server-side token verification |
| Supabase user upsert | ✅ Done | `upsertUser()` on Google auth, userId in session |
| Session cookies | ✅ Done | Base64-encoded, HttpOnly, 30-day expiry |
| NavBar login/account | ✅ Done | Avatar dropdown, My Properties, Dashboard, logout |
| Property persistence | ✅ Done | Saves to Supabase via `/api/properties`, localStorage fallback |
| Dashboard | ✅ Done | Fetches from DB, summary stats, property cards with estimate |
| Login/Signup pages | ✅ Done | Google OAuth real, email/password form (stub backend) |
| JWT session signing | 🔲 Launch | Replace base64 with HS256 JWT before production |
| Google API key lockdown | 🔲 Launch | Restrict to server IPs + Places/Street View APIs |

---

### WS-4: Payment (Stripe) — 🔄 NEXT UP
| Task | Status | Notes |
|------|--------|-------|
| Stripe product + price | ✅ Done | `prod_UA3MUq9l0I6QBL` / `price_1TBjGFCym8zeLTTQ0Dkvi1Aa` |
| Add Stripe env vars to `.env.local` | ✅ Done | Dual-mode setup: live + test keys in `.env.local`, active keys swap via `${}` references |
| `stripe` server SDK install | 🔲 Dev | `npm i stripe` |
| `@stripe/stripe-js` client install | 🔲 Dev | `npm i @stripe/stripe-js` |
| `/api/checkout/session` route | 🔲 Dev | Create Stripe Checkout session with price ID |
| Checkout trigger button | 🔲 Dev | Replace `alert("coming soon")` in PropertyDetailsContent |
| `/api/webhooks/stripe` route | 🔲 Dev | Handle `checkout.session.completed` |
| Stripe webhook setup | ✅ Done | Live webhook created in Workbench; test-mode webhook + Stripe CLI for local dev |
| Success page | 🔲 Dev | Post-payment confirmation + redirect to study |
| Property status update | 🔲 Dev | Mark property as "purchased" in Supabase |

---

### WS-5: Post-Purchase Study
| Task | Status | Notes |
|------|--------|-------|
| Study wizard UI | ✅ Done | 8-page wizard, `StudyWizard.js` (500+ lines) |
| Report engine (MACRS) | ✅ Done | `reportEngine.js` — IRS-compliant depreciation calcs |
| Report assembler | ✅ Done | `reportAssembler.js` — assembles full study |
| Study viewer | ✅ Done | Asset breakdown, bonus depreciation, tax savings display |
| Trigger from payment | 🔲 Dev | Blocked by WS-4 (Stripe) |
| PDF generation | 🔲 Dev | `@react-pdf/renderer` — branded report with cover, asset table, depreciation schedule |
| CSV depreciation export | 🔲 Dev | Year-by-year schedule for tax software import (ProConnect, UltraTax, Lacerte) |

---

### WS-6: Email & SMS (Transactional) — 🔄 IN PROGRESS
| Task | Status | Notes |
|------|--------|-------|
| Email capture to Supabase | ✅ Done | `/api/email-captures` route, `captureEmail()` |
| Phone + SMS consent capture | ✅ Done | UI captures phone + consent checkbox |
| Provider decision | ✅ Decided | SendGrid (email) + Twilio (SMS) |
| Twilio account setup | 🔲 **Kevin** | Create account at twilio.com, get Account SID + Auth Token + phone number |
| SendGrid account + API key | 🔲 **Kevin** | Create at sendgrid.com, verify sender domain, get API key |
| Welcome email | 🔲 Dev | Triggered on account creation — brand intro + "your estimate is waiting" |
| Estimate delivery email | 🔲 Dev | Sends estimate summary + link to resume walkthrough |
| Purchase confirmation email | 🔲 Dev | Triggered by Stripe webhook, includes study ETA |
| Study complete email | 🔲 Dev | Delivers PDF download link |
| Nurture sequence (3 emails) | 🔲 Dev | Non-purchasers: Day 2 (urgency), Day 7 (ROI), Day 14 (final offer) |
| SMS: study complete | 🔲 Dev | "Your cost seg study is ready — [link]" |
| SMS: purchase receipt | 🔲 Dev | Order confirmation with study start notice |
| Unsubscribe handling | 🔲 Dev | SendGrid one-click unsubscribe, TCPA opt-out for SMS |
| Email domain verification | 🔲 **Kevin** | Add SendGrid DNS records to `abodecostseg.com` in GoDaddy — DKIM, SPF, DMARC |

---

### WS-7: Marketing Pages — ✅ COMPLETE
| Task | Status | Notes |
|------|--------|-------|
| Landing page hero | ✅ Done | |
| Landing page sections | ✅ Done | |
| How It Works | ✅ Done | |
| Pricing section | ✅ Done | $481 flat rate |
| Learn / blog | ✅ Done | 221+ SEO articles |
| Sample study | ✅ Done | Full demo layout |
| Privacy / Terms / Disclaimers | ✅ Done | Placeholder — needs real legal language (WS-11) |

---

### WS-8: Infrastructure & Deployment — 🔄 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| Supabase tables | ✅ Done | users, email_captures, properties |
| API routes | ✅ Done | Places, Street View, Property, Airbnb, Auth, Properties, Email, Vision |
| Server caching (in-memory) | ✅ Done | 24h TTL |
| Client caching (localStorage) | ✅ Done | 7d TTL |
| JWT session signing | 🔲 Launch | Replace base64 with HS256 JWT |
| Google API key lockdown | 🔲 Launch | Restrict to server IPs + Places/Street View |
| Rate limiting on API routes | 🔲 Dev | Protect vision, property lookup, and checkout routes from abuse |
| CORS / CSP security headers | 🔲 Dev | Add `next.config.js` security headers |
| GitHub repo setup | 🔲 **Kevin** | Create private repo, push codebase, set up `.gitignore` for `.env.local` |
| Vercel account + project | 🔲 **Kevin** | Connect GitHub repo to Vercel, configure project |
| Vercel environment variables | 🔲 **Kevin** | Add all `.env.local` vars to Vercel dashboard (production) |
| GoDaddy domain purchase | ✅ Done | `abodecostseg.com` purchased |
| DNS → Vercel | 🔲 **Kevin** | Point GoDaddy nameservers or A/CNAME records to Vercel |
| SSL certificate | 🔲 Auto | Vercel provisions automatically once domain is connected |
| Production smoke test | 🔲 Dev | Full E2E run on live domain post-deploy |

---

### WS-9: QA & End-to-End Testing — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| E2E quiz flow — happy path | 🔲 Dev | Real address → Airbnb URL → results → gate → walkthrough |
| E2E quiz flow — no Airbnb URL | 🔲 Dev | Manual-only path through walkthrough |
| AI vision accuracy review | 🔲 Dev | Test 3-5 real listings, document detection accuracy, tune mappings |
| Mobile QA (iOS Safari) | 🔲 Dev | Quiz, gate, walkthrough, dashboard — full flow on iPhone |
| Mobile QA (Android Chrome) | 🔲 Dev | Same flow on Android |
| Google OAuth on mobile | 🔲 Dev | GIS popup behavior on mobile browsers |
| Stripe checkout flow | 🔲 Dev | Test mode → confirm session creation, webhook firing, property status update |
| Edge cases | 🔲 Dev | Bad Airbnb URL, property not found, API timeout, partial data fallbacks |
| Cross-browser (Firefox, Safari) | 🔲 Dev | Layout and auth flow |
| Dashboard with 0 properties | 🔲 Dev | Empty state UX |
| Dashboard with purchased property | 🔲 Dev | Confirm study unlock and PDF access |
| **Kevin: test walk-through session** | 🔲 **Kevin** | Kevin to run full quiz with a real STR property he knows well — gut-check the estimate accuracy and UX |

---

### WS-10: Code Review & Optimization — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| Architecture review | 🔲 Dev | Review component structure, API route patterns, data flow |
| Dead code removal | 🔲 Dev | Audit stubs, unused imports, commented blocks |
| Bundle size audit | 🔲 Dev | `next build` output — identify heavy deps, lazy-load where possible |
| API error handling audit | 🔲 Dev | Ensure all external API calls have proper try/catch + user-facing fallbacks |
| Supabase query optimization | 🔲 Dev | Review indexes, check for N+1 patterns |
| Secret/env var audit | 🔲 Dev | Confirm no secrets exposed to client-side bundle |
| Console.log cleanup | 🔲 Dev | Remove debug logs before production |
| Accessibility pass | 🔲 Dev | Focus states, aria labels, color contrast on key flows |

---

### WS-11: Legal & Compliance — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| Privacy Policy | 🔲 **Kevin** | Replace placeholder — must cover Google OAuth data, Supabase storage, Stripe, cookies, SMS consent. Consider Termly or attorney. |
| Terms of Service | 🔲 **Kevin** | Replace placeholder — define scope of service, no tax advice disclaimer, refund policy |
| Disclaimer language | 🔲 **Kevin** | "Not a substitute for professional tax advice" — needs to be prominent on results and study pages |
| Cookie consent banner | 🔲 Dev | Required before analytics/pixels fire — GDPR/CCPA. Recommend CookieYes or Osano (free tier). |
| TCPA compliance review | 🔲 **Kevin** | SMS consent language already in UI — confirm with attorney or TCPA checklist |
| GDPR data deletion | 🔲 Dev | Account deletion endpoint — removes user + properties from Supabase |
| Refund policy | ✅ Decided | 90-day full refund. Value stored in `REFUND_WINDOW_DAYS` in `lib/config.js` — surfaced in ToS and success page. |
| Financial disclaimer on estimates | 🔲 Dev | "Estimates are indicative only. Final study values may vary." — ensure visible on results |

---

### WS-12: Analytics, Tracking & Marketing Tags — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| PostHog account setup | 🔲 **Kevin** | Create account at posthog.com (free tier covers early stage), get project API key |
| PostHog install | 🔲 Dev | `npm i posthog-js`, wrap app in PostHogProvider |
| Core funnel events | 🔲 Dev | `quiz_started`, `quiz_completed`, `results_viewed`, `gate_shown`, `gate_converted`, `walkthrough_started`, `walkthrough_completed`, `checkout_initiated`, `purchase_completed` |
| Property events | 🔲 Dev | `property_added`, `airbnb_url_submitted`, `vision_analysis_triggered`, `vision_analysis_complete` |
| Identify on auth | 🔲 Dev | `posthog.identify(userId, { email, name })` on Google sign-in |
| Funnel dashboard in PostHog | 🔲 Dev | Build conversion funnel view: quiz → gate → walkthrough → checkout |
| Google Tag Manager | 🔲 **Kevin** | Create GTM account + container — decision: GTM vs direct tag installs |
| Google Analytics 4 | 🔲 Dev | Add GA4 via GTM or direct — configure e-commerce events for Stripe purchase |
| Meta Pixel | 🔲 **Kevin** | Create Meta Business account if not already done, get Pixel ID |
| Meta Pixel install | 🔲 Dev | Install via GTM — fire `PageView`, `Lead` (on gate conversion), `Purchase` (on Stripe complete) |
| Google Ads tag | 🔲 **Kevin** | Get Google Ads account conversion tag — fire on purchase |
| LinkedIn Insight Tag | 🔲 **Kevin** | Optional — only if targeting STR investors on LinkedIn |
| UTM parameter handling | 🔲 Dev | Capture UTMs from URL on landing, persist to sessionStorage, pass to Supabase on account creation |
| Attribution reporting | 🔲 Dev | Log `utm_source`, `utm_medium`, `utm_campaign` on email_captures and users tables |

---

### WS-13: Brand & Creative Assets — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| Favicon + app icons | 🔲 **Kevin** | Need logo files (SVG + PNG). Dev will generate `/public/favicon.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` |
| Open Graph image | 🔲 Dev | 1200×630 branded OG image for social sharing — used when quiz link is shared on Facebook/Twitter/iMessage |
| Social share meta tags | 🔲 Dev | `og:title`, `og:description`, `og:image`, `twitter:card` on all key pages |
| Logo file formats | 🔲 **Kevin** | Provide: SVG (primary), PNG on white (for PDF), PNG on dark (for dark NavBar states) |
| Brand color / font confirmation | 🔲 **Kevin** | Confirm final hex values and DM Sans weights are locked |
| Email header template | 🔲 Dev | Branded HTML email header with logo — used in all transactional emails |
| PDF report cover design | 🔲 Dev | Branded cover page for cost seg study PDF — uses logo + property address + Abode brand |
| Explainer video (onsite) | 🔲 Post-launch | AI-animated walkthrough of cost seg concept + Abode solution. Target: hero or "How It Works". 60-90 sec. Kevin to commission when ready. |
| Testimonials / social proof | 🔲 **Kevin** | Need 2-3 early user quotes or beta tester feedback before launch. Placeholder copy ok at first. |
| Trust badges | 🔲 Dev | "IRS Section 168", "MACRS compliant", "Secure checkout via Stripe" — some already in UI, audit for completeness |

---

### WS-14: SEO & Search Discovery — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| `robots.txt` | 🔲 Dev | Block `/api/*`, `/dashboard`, `/quiz/results` from crawl |
| `sitemap.xml` | 🔲 Dev | Auto-generate from Next.js — include all blog/learn pages, marketing pages |
| Google Search Console setup | 🔲 **Kevin** | Verify `abodecostseg.com` ownership via DNS TXT record in GoDaddy, submit sitemap |
| Bing Webmaster Tools | 🔲 **Kevin** | Lower priority but worth 10 minutes — import from GSC |
| Meta title + description audit | 🔲 Dev | All marketing pages and blog have unique, keyword-rich meta tags |
| Canonical URLs | 🔲 Dev | Ensure no duplicate content issues across blog/learn pagination |
| Schema markup | 🔲 Dev | `FAQPage` schema on landing, `SoftwareApplication` schema, `Review` schema when testimonials exist |
| Core Web Vitals baseline | 🔲 Dev | Run PageSpeed Insights post-deploy, fix any LCP/CLS issues |
| Internal linking audit | 🔲 Dev | Blog articles should link to quiz CTA, learn pages link to each other |
| Google Business Profile | 🔲 **Kevin** | Create if operating as a local/national business — helps trust signals |

---

### WS-15: Post-Launch Marketing Setup — 🔄 PLAN READY, SETUP NEEDED
| Task | Status | Notes |
|------|--------|-------|
| **Google Ads** | | |
| Google Ads account | 🔲 **Kevin** | Create or confirm account exists |
| Keyword research | 🔲 **Kevin** | Target: "cost segregation STR", "short term rental tax depreciation", "cost seg study", "bonus depreciation rental property" |
| Search campaign setup | 🔲 **Kevin** | Start with exact/phrase match, $30-50/day test budget |
| Landing page for paid traffic | 🔲 Dev | Consider dedicated `/lp/cost-seg-study` page optimized for paid — no NavBar distraction, single CTA |
| Conversion tracking in Google Ads | 🔲 Dev | Fire on `purchase_completed` event via GTM |
| **Meta Ads** | | |
| Meta Business account | 🔲 **Kevin** | Confirm setup, add Pixel to account |
| Audience setup | 🔲 **Kevin** | Custom audience: STR investors, Airbnb hosts; Lookalike from email list |
| Creative assets | 🔲 **Kevin** | Need 2-3 ad creatives: image-based (property + "$23,400 back") + short video (if explainer exists) |
| Meta campaign | 🔲 **Kevin** | Test $20-30/day awareness → retargeting funnel |
| **Organic / Community** | | |
| BiggerPockets presence | 🔲 **Kevin** | Post in STR forums — "built a cost seg tool for STR investors, looking for beta feedback" |
| STR Facebook groups | 🔲 **Kevin** | Target: "Airbnb Hosting", "STR Investors", "Short Term Rental Investors" — share estimate tool |
| Twitter/X presence | 🔲 **Kevin** | 5-10 posts around launch: "what is cost seg", "how much STR owners leave on the table", tool demo |
| Reddit | 🔲 **Kevin** | r/airbnb, r/realestateinvesting — educational post linking to tool |
| CPA referral partner outreach | 🔲 **Kevin** | Target 10-20 CPAs who serve STR clients — referral fee model. Build referral landing page + simple partner portal. High LTV channel. |
| CPA white-label (future) | 🔲 Demand-gated | No dev until first CPA inbound proves demand. Scaffolding not built. First inquiry → scoping session → build. |
| STR property manager outreach | 🔲 **Kevin** | Property managers with 10+ client properties — bulk/partnership pricing discussion |
| **Email Marketing** | | |
| Email list platform | 🔲 **Kevin** | Decision: use SendGrid for marketing emails too, or separate tool (Loops, Beehiiv, ConvertKit)? |
| Lead magnet | 🔲 Dev | Free "STR Cost Seg Estimate" is the lead magnet — ensure quiz CTA is framed as such in ads |
| Launch announcement email | 🔲 **Kevin** | To any existing contacts / beta list — "Abode is live" |

---

### WS-16: Monitoring, Alerting & Operations — 🔲 PRE-LAUNCH
| Task | Status | Notes |
|------|--------|-------|
| Error monitoring | 🔲 Dev | Sentry — install `@sentry/nextjs`, configure DSN, alert on new errors |
| Uptime monitoring | 🔲 **Kevin** | BetterUptime or UptimeRobot (free) — ping every 5 min, email/SMS on downtime |
| Stripe payment alerts | 🔲 **Kevin** | Enable Stripe email notifications for successful payments + failed charges |
| Supabase alerts | 🔲 **Kevin** | Enable Supabase email alerts for DB approaching limits |
| API cost monitoring | 🔲 **Kevin** | Set spend alerts on: Anthropic (Vision), Google Maps, Apify, Stripe |
| Daily/weekly ops email | 🔲 Dev | Optional: cron job → Supabase query → SendGrid summary email (new signups, conversions, revenue) |
| Log aggregation | 🔲 Dev | Vercel logs cover most cases — ensure critical API errors are logged with context |
| Stripe dispute handling | 🔲 **Kevin** | Read Stripe's dispute process, set up notification — important for $481 ticket |
| Backup / data export | 🔲 **Kevin** | Supabase auto-backups — confirm enabled on project settings |

---

## 📋 Sprint Priorities

### Sprint 1 (Current) — Revenue Unlock
1. ~~Login / My Account in NavBar~~ ✅
2. ~~AI image analysis (Vision API)~~ ✅ Built
3. 🔲 **E2E test with real Airbnb listing** (validate full quiz → walkthrough flow)
4. 🔲 **Stripe checkout integration** (Kevin adds env vars first)
5. 🔲 Connect payment → study wizard trigger

### Sprint 2 — Delivery & Compliance
6. PDF report generation (`@react-pdf/renderer`)
7. CSV depreciation export
8. Cookie consent banner (required before analytics fire)
9. Privacy Policy + Terms of Service (real legal language — Kevin)
10. Financial disclaimer on results/study pages
11. GDPR account deletion endpoint

### Sprint 3 — Deploy & Track
12. Rate limiting + security headers
13. JWT session signing
14. GitHub repo + Vercel setup (Kevin)
15. GoDaddy domain → Vercel DNS (Kevin)
16. PostHog install + core funnel events
17. Google Tag Manager + GA4
18. Meta Pixel
19. `robots.txt` + `sitemap.xml`
20. Google Search Console (Kevin)
21. Sentry error monitoring

### Sprint 4 — Brand & Polish
22. Favicon + app icons (need logo from Kevin)
23. OG image + social meta tags
24. Email template design
25. PDF report cover design
26. Explainer video — post-launch, AI-animated (Kevin commissions when ready)
27. Testimonials / social proof (Kevin)
28. Mobile QA pass (full E2E on iOS + Android)
29. Cross-browser QA
30. Core Web Vitals + bundle audit

### Sprint 5 — Growth Engine
31. Google Ads campaign (Kevin)
32. Meta Ads campaign (Kevin)
33. Nurture email sequence (3 emails)
34. SMS notifications (Twilio — Kevin setup)
35. UTM tracking + attribution in Supabase
36. Dedicated paid landing page
37. Community outreach — BiggerPockets, STR Facebook groups (Kevin)
38. CPA referral partner outreach (Kevin)
39. A/B test: gate placement

---

## ❓ Open Questions & Decisions Needed From Kevin

### Decisions Blocking Dev Work
| # | Question | Decision |
|---|----------|----------|
| 1 | **Production domain name?** | ✅ `abodecostseg.com` |
| 2 | **Domain purchased on GoDaddy?** | ✅ `abodecostseg.com` purchased — DNS to Vercel pending (post-deploy) |
| 3 | **Explainer video approach?** | ✅ Post-launch — AI-animated walkthrough of cost seg + solution |
| 4 | **Refund policy?** | ✅ 90-day refund window — stored as `REFUND_WINDOW_DAYS` variable in `lib/config.js` |
| 5 | **Email marketing platform for nurture sequences?** | 🔲 Open — SendGrid for transactional; decision pending for marketing sequences (Loops/ConvertKit/SendGrid) |
| 6 | **Google Ads budget on launch?** | 🔲 Open — recommend $30-50/day to start |
| 7 | **CPA referral / white-label model?** | ✅ Both — referral fee program now; white-label scaffolding only if/when demand proven. No white-label dev until first CPA inquiry. |

### Kevin Action Items (Roughly In Order)
| Priority | Task |
|----------|------|
| 🔴 Now | **Run E2E test** — pick a real STR listing you know, run the full quiz → walkthrough flow, gut-check estimate accuracy and UX |
| ✅ Done | Stripe env vars added — dual-mode (test/live) in `.env.local` |
| 🔴 Now | Create Twilio account — get Account SID, Auth Token, phone number |
| 🔴 Now | Create SendGrid account — verify sender domain, get API key |
| 🟠 Soon | Create GitHub private repo + push codebase |
| 🟠 Soon | Create Vercel account + connect GitHub repo |
| ✅ Done | Domain `abodecostseg.com` purchased on GoDaddy |
| 🟠 Soon | Create PostHog account — get project API key |
| 🟡 Pre-launch | Draft or purchase Privacy Policy + Terms of Service (Termly ~$30/mo or attorney) |
| 🟡 Pre-launch | Create Google Tag Manager account + container |
| 🟡 Pre-launch | Set up Meta Business account + create Pixel |
| 🟡 Pre-launch | Verify domain in Google Search Console (DNS TXT via GoDaddy) |
| 🟡 Pre-launch | Set up Sentry account — get DSN |
| 🟡 Pre-launch | Set up UptimeRobot (free) for uptime monitoring |
| 🟡 Pre-launch | Provide logo files: SVG + PNG variants |
| 🟡 Pre-launch | Confirm brand colors / font weights are final |
| 🟡 Pre-launch | Decide on and produce/commission explainer video |
| 🟡 Pre-launch | Collect 2-3 testimonials or beta tester quotes |
| 🔵 Post-launch | Set up Google Ads campaign |
| 🔵 Post-launch | Set up Meta Ads campaign |
| 🔵 Post-launch | Begin community outreach (BiggerPockets, STR Facebook groups) |
| 🔵 Post-launch | Begin CPA referral partner outreach |

---

## 🔑 Environment Variables

```env
# ✅ Already configured
GOOGLE_PLACES_API_KEY=...
GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
APIFY_API_TOKEN=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...              # ✅ Claude Vision image analysis

# ✅ Sprint 1 — Stripe configured (dual-mode setup)
STRIPE_LIVE_SECRET_KEY=sk_live_...           # Live keys stored
STRIPE_LIVE_PUBLISHABLE_KEY=pk_live_...      # Live keys stored
STRIPE_LIVE_WEBHOOK_SECRET=whsec_...         # Live webhook stored
STRIPE_TEST_SECRET_KEY=sk_test_...           # 🔲 Kevin paste test keys
STRIPE_TEST_PUBLISHABLE_KEY=pk_test_...      # 🔲 Kevin paste test keys
STRIPE_TEST_WEBHOOK_SECRET=whsec_...         # 🔲 Kevin paste test webhook secret
# Active keys point to TEST or LIVE via ${} references — swap one word to go live

# 🔲 Sprint 2 — Kevin setting up
SENDGRID_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

# 🔲 Sprint 3 — Analytics / Monitoring
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=...

# 🔲 Sprint 3 — Security
JWT_SECRET=...                     # Random 256-bit secret for HS256 session signing
```

### Stripe IDs
- **Product:** `prod_UA3MUq9l0I6QBL`
- **Price:** `price_1TBjGFCym8zeLTTQ0Dkvi1Aa` ($481 one-time)

---

## 📁 Key File Reference

| Area | Files |
|------|-------|
| Quiz entry | `app/quiz/page.js`, `components/quiz/QuizShell.js`, `components/quiz/QuizStep.js` |
| Quiz data | `lib/quizData.js` |
| Results | `components/quiz/QuizResults.js` |
| Detailed walkthrough | `components/quiz/PropertyDetailsContent.js`, `components/quiz/PropertyDetailCards.js` |
| Image analysis (caption) | `lib/airbnbImageAnalysis.js`, `lib/airbnbParser.js` |
| Image analysis (vision) | `app/api/vision/analyze/route.js`, `lib/useVisionAnalysis.js` |
| Categories | `lib/propertyCategories.js` |
| Estimate engine | `lib/estimateEngine.js` |
| Report engine | `lib/reportEngine.js`, `lib/reportAssembler.js` |
| Study wizard | `components/quiz/StudyWizard.js`, `components/quiz/StudyWizardPage.js` |
| Auth | `lib/auth.js`, `app/api/auth/google/route.js`, `app/api/auth/session/route.js` |
| DB | `lib/db/users.js`, `lib/db/emailCaptures.js`, `lib/supabase.js` |
| Stubs | `lib/stubs.js` (payment, PDF/Excel downloads) |
| Property store | `lib/propertyStore.js` (localStorage), `app/api/properties/route.js` (Supabase) |
| NavBar | `components/ui/NavBar.js` |
| Dashboard | `components/app/DashboardContent.js` |
| Styles | `styles/components/quiz.css`, `styles/components/nav.css`, `styles/components/app-shell.css` |

---

## 📝 Session Notes

### Session 2026-03-16 (PM — Planning & Decisions)
- Built NavBar login/account (avatar dropdown, mobile menu, real logout)
- Built property persistence (`lib/propertyStore.js` + Supabase)
- Built full AI vision analysis pipeline (API route + client hook + 70+ item mappings)
- Created and expanded full project tracker (WS-1 through WS-16)
- **Decisions locked today:**
  - Production domain: `abodecostseg.com`
  - Refund window: 90 days → `REFUND_WINDOW_DAYS` in `lib/config.js`
  - Explainer video: post-launch, AI-animated walkthrough
  - CPA model: referral fee now; white-label only if demand proven — no dev until first real inquiry
  - Email marketing platform: still open (SendGrid vs Loops/ConvertKit)
  - Google Ads daily budget: still open ($30-50/day recommended)
- **Kevin action tomorrow:**
  1. E2E test — run full quiz with a real STR listing you know well
  2. Add Stripe env vars to `.env.local` to unblock payment sprint
  3. Confirm `abodecostseg.com` is purchased in GoDaddy
- **Next dev session:** Wire Stripe checkout → payment → study unlock; `lib/config.js` with `REFUND_WINDOW_DAYS`; JWT session signing

### Session 2026-03-16 (Late PM — Stripe Setup)
- Stripe test mode enabled in dashboard
- Dual-mode `.env.local` setup: `STRIPE_LIVE_*` + `STRIPE_TEST_*` keys, active keys swap via `${}` references
- Live webhook created in Workbench (new UI); Stripe CLI documented for local dev
- **Kevin still needs to:** Paste `sk_test_...`, `pk_test_...`, and test-mode `whsec_...` into `.env.local`
- **Next dev session:** Wire Stripe checkout with `price_1TBjGFCym8zeLTTQ0Dkvi1Aa`, test with `4242 4242 4242 4242`
