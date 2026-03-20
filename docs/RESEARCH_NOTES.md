# Abode — Research & Customer Insights Notes

> **Status:** Research topics queued for follow-up. Initial automated research was interrupted (rate limit).
> **Created:** 2026-03-20
> **Priority:** Inform marketing, positioning, and content strategy before launch.

---

## 1. STR Airbnb Cost Segregation Research

**Goal:** Understand how cost seg applies specifically to short-term rental properties on Airbnb/VRBO.

### Key Questions
- What percentage of STR investors are aware of cost segregation?
- What is the average cost seg study price for STR properties? (Abode: $481 flat — competitive positioning)
- How do STR-specific components (furnishings, smart locks, game rooms) affect reclassification rates?
- What are typical reclassification percentages for STR properties vs. LTR?
- How does the 7-day rule (Treas. Reg. §1.469-1T) intersect with cost seg for STR owners?

### Content Angles
- "Cost Segregation for Airbnb Hosts: What You Need to Know"
- "How STR Investors Save $15K–$50K in Year One with Cost Seg"
- "Airbnb Tax Deductions Most Hosts Miss"
- Case study template: before/after cost seg for a real STR property

### Competitive Research
- Who are the main cost seg providers targeting STR investors?
- Pricing comparison: traditional engineering firms ($5K–$15K) vs. Abode ($481)
- What marketing channels do competitors use? (BiggerPockets, Facebook groups, CPA referrals)

---

## 2. STR Investor Demographics & Psychographics

**Goal:** Build detailed buyer personas for Abode's target customer.

### Key Demographics to Validate
- **Income range:** $150K–$500K+ household income (32%–37% tax bracket)
- **Age range:** 30–55 (tech-comfortable, active investors)
- **Property count:** 1–5 STR properties (sweet spot for self-service tool)
- **Geographic hotspots:** FL, AZ, TN (Nashville), SC (Charleston), CO (mountain), HI, NC (Asheville)
- **Platform usage:** Airbnb-primary vs. VRBO vs. multi-platform

### Psychographic Segments
1. **The Optimizer** — Already knows about depreciation, wants the cheapest/fastest study
2. **The Accidental Landlord** — Bought a vacation home, started renting on Airbnb, doesn't know about cost seg
3. **The Portfolio Builder** — 3+ properties, already has a CPA, needs to justify the study to their accountant
4. **The CPA-Referred** — CPA told them to get a cost seg study, price-shopping

### Research Sources
- BiggerPockets STR forums (member demographics, common questions)
- Airbnb host community surveys
- AirDNA market reports (property counts, revenue data by market)
- STR Facebook group demographics (group sizes, engagement patterns)

---

## 3. STR Tax Loophole — Material Participation

**Goal:** Develop authoritative content around the "STR tax loophole" that drives organic search traffic.

### Key Topics
- **The 7-day exception:** Treas. Reg. §1.469-1T(e)(3)(ii)(A) — average rental period ≤7 days
- **Material participation tests:** The 7 tests under IRC §469(h) and Temp. Reg. §1.469-5T
- **STR + cost seg combo:** How material participation unlocks cost seg deductions against W-2 income
- **Common misconceptions:** "You need 750 hours" (false — any of the 7 tests works)
- **Documentation requirements:** Activity logs, time tracking, what the IRS wants to see

### Content Strategy
- **SEO target keywords:** "STR tax loophole", "short term rental tax deduction", "material participation STR", "airbnb tax loophole", "cost segregation short term rental"
- **Blog articles:** Deep-dive educational content (already have 221+ articles in `lib/blogData.js` — validate these topics are covered)
- **Lead magnet angle:** "Free STR Tax Savings Calculator" → quiz funnel → cost seg study
- **CPA education:** One-pager for CPAs explaining the STR exception + cost seg combo

### Legal/Compliance Notes
- All content must include disclaimer: "Not tax advice. Consult your CPA."
- Material participation determination is taxpayer-specific — Abode cannot make this determination
- The study itself is valid regardless of material participation status (passive vs. active)

---

## 4. STR Content Marketing & Distribution Channels

**Goal:** Identify highest-ROI channels for reaching STR investors pre-launch.

### Organic Channels (Free)
| Channel | Audience Size | Effort | Expected ROI |
|---------|--------------|--------|-------------|
| BiggerPockets forums | 2M+ members | Medium | High — direct access to active investors |
| STR Facebook groups | 50K–200K per group | Low | Medium — need to avoid being salesy |
| Reddit (r/airbnb, r/realestateinvesting) | 500K+ combined | Low | Medium — educational posts only |
| Twitter/X (real estate finance) | Niche but engaged | Medium | Low-Medium |
| YouTube (STR tax content) | Growing fast | High | High long-term (SEO + authority) |

### Paid Channels
| Channel | CPA Estimate | Notes |
|---------|-------------|-------|
| Google Ads (search) | $15–$40/click | High intent — "cost segregation study" |
| Meta/Instagram Ads | $5–$15/lead | Visual, targeting STR interest groups |
| BiggerPockets Ads | Premium but targeted | Direct access to investor audience |

### Partnership Channels
- **CPA referral network:** Build a referral program (% of study fee per referral)
- **STR property managers:** Bulk pricing for clients with 10+ properties
- **STR coaching programs:** Partner with STR coaching courses (Sean Rakidzich, Robuilt, etc.)
- **Real estate agents in STR markets:** Referral for new buyers

### Content Calendar Priorities (Pre-Launch)
1. 5 blog articles targeting "cost segregation + STR" keywords
2. 3 social media post templates for BiggerPockets / Facebook
3. 1 CPA one-pager (PDF) for referral partners
4. Email sequence for lead nurture (3 emails over 14 days)

---

## 5. Customer Insights — Open Questions

### Pricing Validation
- Is $481 perceived as "too cheap" (credibility concern) or "perfect" (accessibility)?
- Would a tiered model work? (e.g., $481 self-service, $997 with CPA review, $1,997 with engineering site visit)
- Refund rate expectation at $481 price point?

### UX / Product Questions
- Do users trust an AI-generated study for IRS purposes?
- What percentage of users will share the study with their CPA?
- Should Abode offer a "CPA review add-on" for credibility?
- Is the quiz → estimate → walkthrough → purchase flow too long? (5+ steps before checkout)

### Post-Purchase Retention
- What's the repeat purchase potential? (New property = new study)
- Should Abode offer an annual "depreciation review" subscription?
- Can Abode upsell recapture analysis when a property is sold?

---

## Action Items

| # | Action | Owner | Priority |
|---|--------|-------|----------|
| 1 | Re-run competitive analysis on STR cost seg providers | Dev | High |
| 2 | Validate buyer personas with 5 STR investor interviews | Kevin | High |
| 3 | Audit existing 221 blog articles for STR tax keyword coverage | Dev | Medium |
| 4 | Draft CPA referral one-pager | Dev + Kevin | Medium |
| 5 | Set up BiggerPockets account + first educational post | Kevin | High |
| 6 | Research STR coaching program partnership opportunities | Kevin | Medium |
| 7 | Price sensitivity survey (5–10 STR investors) | Kevin | Medium |
| 8 | Google Ads keyword research + CPC estimates | Dev | Medium |
| 9 | Create "STR Tax Savings Calculator" lead magnet concept | Dev | Low |
| 10 | Draft 3-email nurture sequence copy | Dev | Medium |
