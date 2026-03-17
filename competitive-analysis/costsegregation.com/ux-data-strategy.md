# UX & Data Collection Strategy: AI-First Cost Segregation for STRs

> **Purpose:** Implementation spec for the user journey, data collection pipeline, API integrations, and streamlined UX. Feed this into Claude Code alongside cost-seg-methodology.md when building the Next.js frontend and data layer.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [CostSegregation.com Critique & Lessons](#competitor-critique)
3. [Proposed User Journey](#proposed-user-journey)
4. [Data Collection Tiers](#data-collection-tiers)
5. [API Integration Spec](#api-integration-spec)
6. [Airbnb Integration Strategy](#airbnb-integration)
7. [Vision AI Pipeline](#vision-ai-pipeline)
8. [Property Feature Collection UX](#property-feature-collection)
9. [Tax Situation Assessment UX](#tax-situation-assessment)
10. [Trust-Building Strategy](#trust-building)
11. [Report Delivery UX](#report-delivery)
12. [Technical Architecture (Next.js)](#technical-architecture)
13. [Competitive Landscape Summary](#competitive-landscape)
14. [Implementation Phases](#implementation-phases)

---

## 1. Executive Summary {#executive-summary}

We're building an AI-first cost segregation tool specifically for short-term rental owners. The goal: property owner enters their address (and optionally their Airbnb link), we auto-populate everything we can from public data + listing data + photo analysis, ask only the questions we must, and deliver an audit-ready report in minutes for ~$200-$500.

**Key differentiators vs. CostSegregation.com ($495, KBKG):**
- Auto-populate 80%+ of property data (they ask for too much manually)
- Airbnb listing integration (unique — no competitor does this)
- Vision AI photo analysis for component identification (SegTax uses LiDAR; we use photos)
- STR-specific guidance (REP status, material participation, 7-day rule)
- Modern, conversational UX vs. tax-form feel
- Real-time results (not "pay first, see later")

---

## 2. CostSegregation.com Critique & Lessons {#competitor-critique}

### What They Do Well
- 3-step wizard is simple conceptually (Property → Tax Info → Report)
- AI-powered auto-population from address is the right pattern
- Visual Form 4562 example to explain depreciable basis is smart
- "Invite a collaborator" (CPA) is a good trust mechanism
- Flat $495 pricing is clear and accessible

### What's Broken
1. **Asks questions it should already know.** After collecting the address and pulling county data, it still asks for construction quality, flooring types, appliance inventory, etc. Much of this can be inferred from property photos, Airbnb listing data, or price-point/neighborhood analysis.

2. **Depreciable basis is a massive friction point.** Most STR owners don't know this number. They show a Form 4562 example, but the average Airbnb host has never seen Form 4562. Should calculate this automatically from county land/improvement split.

3. **Dated UI feels like a tax form.** Accordion sections with 40+ fields. No progressive disclosure based on what matters. No explanation of why each field impacts the calculation.

4. **No STR-specific intelligence.** The "Is this a short-term rental?" checkbox is buried. No guidance on REP status, material participation, or how STR classification changes the tax outcome.

5. **Trust relies entirely on KBKG brand.** Without knowing KBKG is a major CPA firm, the $495 report feels like a random online calculator. No methodology transparency, no confidence scoring, no audit guarantee prominently featured.

6. **Results shown only at checkout.** You don't see your estimated deduction until you're on the payment page. Creates a "bait" feel. Should show a running estimate as data is collected.

7. **No photo/visual analysis.** Asks for flooring type per room via dropdowns. A photo of each room would be faster and more accurate.

### Design Principles for Our Build

| CostSeg.com Pattern | Our Improvement |
|---|---|
| Form-heavy data collection | Conversational, progressive disclosure |
| Manual feature entry | Auto-detect from photos + listings |
| Hidden results until payment | Running estimate visible throughout |
| Generic residential tool | STR-specific with REP/MP guidance |
| Brand-dependent trust | Methodology transparency + audit guarantee |
| Single address input | Address + optional Airbnb link |
| Static percentage model | Dynamic, feature-weighted calculation |

---

## 3. Proposed User Journey {#proposed-user-journey}

### Flow Overview (5 Screens)

```
Screen 1: Property Lookup (30 seconds)
  ↓
Screen 2: Quick Confirm (60 seconds)
  ↓
Screen 3: Your Rental Details (90 seconds)
  ↓
Screen 4: Tax Situation (60 seconds)
  ↓
Screen 5: Your Report (instant)
```

**Total time: ~4 minutes**

### Screen 1: Property Lookup

**Goal:** Identify the property and pull all available public data.

**Inputs (maximum 2 fields):**
1. **Property Address** — Google Places autocomplete (required)
2. **Airbnb/VRBO Listing URL** — Optional, with explanation: "We'll pull your amenities, photos, and property details to save you time"

**Behind the scenes (parallel API calls):**
- Google Geocoding → lat/long, formatted address
- ATTOM or BatchData → property characteristics (sqft, lot, beds, baths, year built, construction type, assessed values, land/improvement split)
- Google Street View → exterior photo
- If Airbnb URL provided → scrape/API pull for amenities, photos, description, property type

**UX:**
- Loading state with progress indicators: "Finding your property... Pulling county records... Analyzing listing data..."
- Show Google Street View image when available for visual confirmation
- Display: "Is this your property?" with address + photo

### Screen 2: Quick Confirm

**Goal:** Verify auto-populated data, fill gaps, show running estimate.

**Auto-populated (editable):**
- Property type: Single Family Home
- Bedrooms: 3 | Bathrooms: 2
- Square footage: 1,577 | Lot: 4,792 sqft
- Year built: 2005
- Purchase price: $337,000 (from county records or user input)
- Purchase date: 03/12/2018

**Only ask if NOT available from APIs:**
- Purchase price (if not in county records)
- Purchase date (if not in county records)

**Running estimate widget (top of screen, persistent):**
```
┌──────────────────────────────────────┐
│  Estimated First-Year Deduction      │
│  ~$85,000 - $95,000                  │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░ 65% complete     │
│  More details = more accurate        │
└──────────────────────────────────────┘
```

### Screen 3: Your Rental Details

**Goal:** Collect property-specific features that drive the cost seg allocation. Use smart defaults and photo analysis to minimize manual input.

**Section A: Interior (smart card layout, not form fields)**

Instead of 12 flooring dropdowns, present it as:

```
"What best describes your property's style?"

[Modern/Updated]  [Traditional]  [Luxury/High-End]  [Basic/Standard]

Based on your selection and listing photos, here's what we've identified:
```

Then show editable cards:

```
┌─────────────────────┐  ┌─────────────────────┐
│ 🏠 Flooring          │  │ 🍳 Kitchen           │
│ Living: Laminate ✓   │  │ Appliances: 6/6 ✓   │
│ Bedrooms: Carpet ✓   │  │ Quality: High-End    │
│ Kitchen: Vinyl ✓     │  │ [Edit details]       │
│ Baths: Tile ✓        │  │                      │
│ [Edit details]       │  │                      │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐  ┌─────────────────────┐
│ ❄️ Climate           │  │ 🛋️ Furnishings       │
│ HVAC: Central ✓      │  │ Fully Furnished ✓    │
│ Gas Service: Yes ✓   │  │ Window Treatments ✓  │
│ [Edit details]       │  │ Ceiling Fans: 4      │
│                      │  │ Hot Tub: No          │
│                      │  │ [Edit details]       │
└─────────────────────┘  └─────────────────────┘
```

**Section B: Exterior**

```
┌─────────────────────┐  ┌─────────────────────┐
│ 🏊 Outdoor Features  │  │ 🚗 Parking & Access  │
│ Pool: Yes (In-ground)│  │ Garage: 2-car ✓      │
│ Patio: Yes ✓         │  │ Driveway: Concrete   │
│ Deck: No             │  │ Ext. Parking: 2      │
│ Landscaping: Yes ✓   │  │                      │
│ [Edit details]       │  │                      │
└─────────────────────┘  └─────────────────────┘

┌─────────────────────┐
│ 🏗️ Fencing           │
│ Wood: ~120 ft        │
│ Vinyl: 0 ft          │
│ Block/Masonry: ~80ft │
│ [Edit details]       │
└─────────────────────┘
```

**Photo Upload (Optional Accelerator):**
"Upload 5-10 photos of your property for a more accurate assessment"
- Or: "We found 24 photos from your Airbnb listing. Analyzing now..."
- Vision AI runs in background, updates component cards with findings
- Shows confidence indicators: "High confidence" / "Please verify"

### Screen 4: Tax Situation

**Goal:** Collect the tax-specific info needed for the calculation. Guide the user through concepts they may not understand.

**Smart question flow (conversational, not form):**

```
Q1: "What tax year is this study for?"
    [2025] [2024] [2023] [Other]

Q2: "When did you start renting this property?"
    [Same as purchase date: 03/12/2018]  [Different date: ___]

Q3: "What's your approximate tax bracket?"
    → Helper: "Not sure? What's your approximate household income?"
    [Under $100K → 22%]
    [$100K - $200K → 24%]
    [$200K - $400K → 32%]
    [$400K - $550K → 35%]
    [$550K+ → 37%]
    → Shows: "At the 32% bracket, your estimated tax savings would be ~$27,200"

Q4: "Do you actively manage this rental? (cleaning, guest communication, maintenance)"
    [Yes, I manage it myself] → triggers material participation assessment
    [I use a property manager] → different treatment
    [I do some, manager does some] → ask for hours

Q5: (If self-managed) "Do you spend more than 100 hours per year on this property?"
    [Yes, easily] [About that] [Probably not]
    → If yes: "Great — this likely qualifies your losses as fully deductible against your regular income"

Q6: "Do you work in real estate as your primary profession?"
    [Yes] → REP status assessment
    [No] → Skip REP, rely on STR material participation

Q7: "Do you know your property's depreciable basis?"
    [Yes: $___] [No, help me figure it out]
    → If no: Auto-calculate from county assessor data:
      "Based on county records, your land is assessed at $62,000 and improvements at $275,000.
       Using this ratio, your estimated depreciable basis is $274,992.
       [Use this estimate] [Enter my own number] [Ask my CPA]"
```

### Screen 5: Your Report

**Goal:** Show results immediately, build trust, then offer the paid report.

**Free Preview (always shown):**
```
┌──────────────────────────────────────────────┐
│                                               │
│  Your Estimated First-Year Deduction          │
│                                               │
│  $85,000                                      │
│                                               │
│  Estimated Tax Savings: $27,200               │
│  (at your 32% bracket)                        │
│                                               │
│  ┌────────────────────────────────────┐       │
│  │ Breakdown:                         │       │
│  │ • 5-year property: $48,200 (18%)   │       │
│  │ • 7-year property: $14,700 (5%)    │       │
│  │ • 15-year property: $22,100 (8%)   │       │
│  │ • Building (27.5-yr): $221,000(69%)│       │
│  └────────────────────────────────────┘       │
│                                               │
│  [Get Your Audit-Ready Report — $299]         │
│  Includes: Full study, Form 4562 data,        │
│  Section 481(a) catch-up calculation,         │
│  audit support guarantee                      │
│                                               │
└──────────────────────────────────────────────┘
```

**Paid Report Includes:**
- Full audit-ready cost segregation study (PDF)
- Component-level detail with IRS asset classifications
- Depreciation schedule (5-year projection)
- Form 4562 line-item mapping
- Section 481(a) adjustment calculation (if applicable)
- REP/material participation documentation guidance
- Audit support guarantee
- Excel export for CPA

---

## 4. Data Collection Tiers {#data-collection-tiers}

### Tier 1: Auto-Populated (Zero User Effort)

From address lookup + county records API:

| Data Point | Source | API |
|---|---|---|
| Property address (formatted) | Google Geocoding | Google Maps |
| Latitude/longitude | Google Geocoding | Google Maps |
| Bedrooms | County assessor | ATTOM / BatchData |
| Bathrooms | County assessor | ATTOM / BatchData |
| Building sqft | County assessor | ATTOM / BatchData |
| Lot sqft | County assessor | ATTOM / BatchData |
| Year built | County assessor | ATTOM / BatchData |
| Stories | County assessor | ATTOM / BatchData |
| Property type | County assessor | ATTOM / BatchData |
| Construction type | County assessor | ATTOM / BatchData |
| Roof type | County assessor | ATTOM / BatchData |
| Heating/cooling type | County assessor | ATTOM / BatchData |
| Garage type & spaces | County assessor | ATTOM / BatchData |
| Basement | County assessor | ATTOM / BatchData |
| Assessed land value | County assessor | ATTOM / BatchData |
| Assessed improvement value | County assessor | ATTOM / BatchData |
| Last sale price | County assessor | ATTOM / BatchData |
| Last sale date | County assessor | ATTOM / BatchData |
| Exterior photo | Google Street View | Google Maps |
| Pool (Y/N) | County assessor or satellite | ATTOM / BatchData |
| Fireplace | County assessor | ATTOM / BatchData |

### Tier 2: From Airbnb/VRBO Listing (If URL Provided)

| Data Point | Where on Listing | Use in Cost Seg |
|---|---|---|
| Property type confirmation | Listing header | Validate county data |
| Bedrooms/bathrooms | Listing details | Validate county data |
| Amenities list | Amenities section | Map to asset components |
| - Kitchen appliances | "Kitchen and dining" | 5-year property identification |
| - Washer/dryer | "Home essentials" | 5-year property |
| - Hot tub | "Outdoor" | 5-year property |
| - Pool | "Outdoor" | 15-year property |
| - Outdoor dining/BBQ | "Outdoor" | 5-year property (portable) or 15-year |
| - EV charger | "Parking" | 5-year property |
| - Gym/exercise equipment | "Entertainment" | 5-year property |
| Fully furnished confirmation | Listing existence | Furniture allocation |
| Property description | Description | Construction quality signals |
| Interior photos | Photo gallery | Vision AI analysis (Tier 3) |
| Listing price per night | Pricing | Quality tier proxy |

### Tier 3: From Vision AI Photo Analysis (If Photos Available)

| Data Point | Photo Source | Confidence Level |
|---|---|---|
| Flooring types by room | Interior photos | High (85%+) |
| Countertop material | Kitchen photos | High (80%+) |
| Cabinet quality/style | Kitchen/bath photos | Medium-High (75%+) |
| Appliance brand tier | Kitchen photos | Medium (70%+) |
| Fixture quality | Bath/kitchen photos | Medium (65%+) |
| Window treatment type | Room photos | Medium (70%+) |
| Construction quality assessment | All photos | Medium (65%+) |
| Exterior wall material | Exterior photos | High (85%+) |
| Roof material | Aerial/exterior | Medium (70%+) |
| Deck/patio presence & material | Exterior/outdoor | High (80%+) |
| Fencing type | Exterior photos | High (80%+) |
| Landscaping presence | Exterior photos | High (85%+) |

### Tier 4: Must Ask User

| Data Point | Why We Can't Auto-Detect | UX Approach |
|---|---|---|
| Purchase price (if not in records) | May differ from assessed/last sale | Pre-fill with last sale, let them edit |
| Purchase date (if not in records) | May not be available | Pre-fill with last sale date |
| Tax year for study | User choice | Default to current year |
| Tax bracket / income range | Private financial info | Guided range selector with helpers |
| STR management involvement | Personal behavior | Simple Yes/No + hours estimate |
| REP status indicators | Professional classification | Guided questions |
| Depreciable basis override | If user has CPA-provided number | Auto-calc with override option |
| Capital improvements since purchase | Not in public records | Optional: "Have you made major renovations?" |

---

## 5. API Integration Spec {#api-integration-spec}

### Primary: BatchData API (MVP Recommendation)

**Why:** Lowest cost ($0.01/call, $500/month base), 240+ assessor fields, daily updates, modern REST API.

**Key Endpoints:**

```typescript
// Property lookup by address
POST https://api.batchdata.com/api/v1/property/lookup
{
  "requests": [{
    "address": {
      "street": "52030 Avenida Villa",
      "city": "La Quinta",
      "state": "CA",
      "zip": "92253"
    }
  }]
}

// Response includes:
// - propertyType, bedrooms, bathrooms, buildingArea, lotArea
// - yearBuilt, stories, construction, roofType, heating, cooling
// - garage, pool, fireplace, basement
// - assessedLandValue, assessedImprovementValue, assessedTotalValue
// - lastSalePrice, lastSaleDate
// - taxAmount, taxYear
```

**Documentation:** https://developer.batchdata.com/docs/batchdata/welcome-to-batchdata

**Pricing:**
- Lite: $500/month (20K records)
- Growth: $2,000/month (100K records)
- Scale: $5,000/month (750K records)

### Secondary: ATTOM Data (Phase 2 Enhancement)

**Why:** Deeper data, 150M+ properties, includes permits and construction detail.

**Key Endpoints:**

```typescript
// Property detail
GET https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail
?address1=52030+Avenida+Villa
&address2=La+Quinta,+CA+92253

// Expanded profile (includes building features)
GET https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/expandedprofile
```

**Documentation:** https://api.developer.attomdata.com/docs

### Google Maps APIs

```typescript
// Geocoding
const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`;

// Street View (static image)
const streetViewUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&key=${API_KEY}`;

// Pricing: ~$5 per 1,000 geocoding requests, ~$7 per 1,000 Street View
```

### Airbnb Data via AirDNA (Phase 2)

```typescript
// Property-level data
GET https://api.airdna.co/v1/market/property_list
?access_token=${TOKEN}
&city_id=12345
&property_type=entire_home
```

**Documentation:** https://apidocs.airdna.co/
**Pricing:** Custom enterprise quotes, discounts at 5K+ calls/month

---

## 6. Airbnb Integration Strategy {#airbnb-integration}

### Option A: User Provides Listing URL (MVP)

**Flow:**
1. User pastes Airbnb listing URL
2. Backend extracts listing ID from URL
3. Fetch publicly visible data:
   - Property type, bedrooms, bathrooms, guest count
   - Amenities list (structured data)
   - Description text
   - Photo URLs (public CDN links)
4. Parse amenities into cost seg categories
5. Run Vision AI on photos

**Amenity-to-Asset Mapping:**

```typescript
const AIRBNB_AMENITY_MAP = {
  // 5-year property signals
  'Kitchen': { component: 'kitchen_appliances', macrsClass: 5 },
  'Refrigerator': { component: 'refrigerator', macrsClass: 5 },
  'Dishwasher': { component: 'dishwasher', macrsClass: 5 },
  'Oven': { component: 'oven_range', macrsClass: 5 },
  'Microwave': { component: 'microwave', macrsClass: 5 },
  'Washer': { component: 'washer', macrsClass: 5 },
  'Dryer': { component: 'dryer', macrsClass: 5 },
  'Hot tub': { component: 'hot_tub', macrsClass: 5 },
  'TV': { component: 'electronics', macrsClass: 5 },
  'EV charger': { component: 'ev_charger', macrsClass: 5 },
  'Exercise equipment': { component: 'exercise_equipment', macrsClass: 5 },
  'Outdoor furniture': { component: 'outdoor_furniture', macrsClass: 5 },
  'BBQ grill': { component: 'grill', macrsClass: 5 },
  'Outdoor dining area': { component: 'outdoor_dining', macrsClass: 5 },
  'Fire pit': { component: 'fire_pit', macrsClass: 5 },
  'Sound system': { component: 'electronics', macrsClass: 5 },
  'Game console': { component: 'electronics', macrsClass: 5 },

  // 15-year property signals
  'Pool': { component: 'swimming_pool', macrsClass: 15 },
  'Private pool': { component: 'swimming_pool', macrsClass: 15 },
  'Shared pool': { component: 'swimming_pool', macrsClass: 15, note: 'allocation_needed' },
  'Patio or balcony': { component: 'patio', macrsClass: 15 },
  'Garden or backyard': { component: 'landscaping', macrsClass: 15 },

  // Furnishing signals (5-year)
  'Essentials': { signals: 'furnished' },
  'Hangers': { signals: 'furnished' },
  'Bed linens': { signals: 'furnished' },
  'Extra pillows and blankets': { signals: 'furnished' },
};
```

### Option B: Airbnb Host API Connection (Phase 3)

- Requires Airbnb Preferred Partner status (currently not accepting new partners)
- Alternative: Build integration with property management systems (Guesty, Hostaway, etc.) which DO have APIs
- These PMS platforms often have richer property data than Airbnb itself

### Legal Considerations

- Publicly visible Airbnb listing data is generally accessible (HiQ v. LinkedIn precedent)
- Use AirDNA for market data rather than scraping
- User-initiated data sharing (they paste their own URL) is safest legally
- Never store Airbnb credentials or login on behalf of users

---

## 7. Vision AI Pipeline {#vision-ai-pipeline}

### Architecture

```
Photos In → Preprocessing → Claude Vision API → Structured Output → Component Mapping → Cost Allocation
```

### Prompt Engineering for Property Analysis

```typescript
const VISION_ANALYSIS_PROMPT = `
Analyze this property photo for cost segregation purposes. Identify and classify
the following components visible in the image:

1. FLOORING: Type (hardwood, laminate, vinyl/LVT, carpet, ceramic tile, porcelain tile,
   natural stone, concrete, other). Condition (new, good, fair, worn).

2. APPLIANCES: Brand tier (luxury/premium, mid-range, builder-grade, N/A).
   Specific items visible (refrigerator, range, dishwasher, microwave, etc.)

3. COUNTERTOPS: Material (granite, quartz, marble, laminate, butcher block, concrete, tile, other)

4. CABINETRY: Style (custom, semi-custom, stock/builder-grade). Material (wood, MDF/laminate, thermofoil)
   Condition (new, good, fair, dated)

5. FIXTURES: Quality tier (luxury, mid-range, basic) for visible light fixtures, plumbing fixtures, hardware

6. WINDOW TREATMENTS: Type (blinds, curtains/drapes, shutters, shades, none visible)

7. OVERALL QUALITY ASSESSMENT: Rate construction quality from 1-5:
   1=Basic/Builder-grade, 2=Standard, 3=Updated/Modern, 4=High-End, 5=Luxury

Return as structured JSON:
{
  "room_type": "kitchen|bedroom|bathroom|living_room|exterior|other",
  "flooring": { "type": "", "condition": "", "classification": "5_year|27.5_year" },
  "appliances": [{ "item": "", "brand_tier": "", "classification": "5_year" }],
  "countertops": { "material": "", "classification": "27.5_year" },
  "cabinetry": { "style": "", "material": "", "classification": "7_year" },
  "fixtures": { "quality_tier": "", "items": [], "classification": "5_year|27.5_year" },
  "window_treatments": { "type": "", "classification": "5_year" },
  "quality_score": 1-5,
  "confidence": 0.0-1.0,
  "notes": ""
}
`;
```

### Photo Requirements (Guidance for Users)

Minimum for accurate analysis (show as a checklist):
- [ ] Kitchen (full view showing counters, cabinets, appliances)
- [ ] Living room (showing flooring, windows)
- [ ] Master bedroom (showing flooring, windows)
- [ ] Master bathroom (showing fixtures, flooring, countertop)
- [ ] Exterior front (showing wall material, roof, landscaping)
- [ ] Exterior back (showing patio/deck, yard, pool if applicable)
- [ ] Any special features (hot tub, outdoor kitchen, etc.)

**From Airbnb listings:** Typically 15-30 photos available, covering most of these areas. Run all through Vision AI in parallel.

### Cost Estimation

- Claude Vision API: ~$0.01-0.03 per image analysis (depending on resolution)
- Average listing: 20 photos × $0.02 = $0.40 per property for full analysis
- Negligible cost — can be included in all tiers

---

## 8. Property Feature Collection UX {#property-feature-collection}

### Design Philosophy: Card-Based, Not Form-Based

Replace CostSegregation.com's 40+ form fields with:

1. **Auto-populated smart cards** showing what we already know
2. **Confidence indicators** showing where we need user verification
3. **Expand-to-edit** pattern (collapsed by default, expand only if user wants to change)
4. **Running estimate** that updates as cards are confirmed/edited

### Component Card Structure

```tsx
interface PropertyCard {
  title: string;           // "Kitchen Appliances"
  icon: string;            // Emoji or icon
  autoDetected: boolean;   // From API or Vision AI
  confidence: number;      // 0-1
  items: CardItem[];       // Individual components
  macrsClass: number;      // 5, 7, 15, or 27.5
  estimatedValue: number;  // Dollar allocation
  needsVerification: boolean;
}

// Example card data:
{
  title: "Kitchen Appliances",
  icon: "🍳",
  autoDetected: true,
  confidence: 0.85,
  items: [
    { name: "Refrigerator", detected: true, source: "airbnb_amenities" },
    { name: "Oven/Range", detected: true, source: "airbnb_amenities" },
    { name: "Dishwasher", detected: true, source: "airbnb_amenities" },
    { name: "Microwave", detected: true, source: "vision_ai", confidence: 0.78 },
    { name: "Exhaust Hood", detected: true, source: "vision_ai", confidence: 0.72 },
    { name: "Garbage Disposal", detected: false, source: "not_detected" }
  ],
  macrsClass: 5,
  estimatedValue: 18400,
  needsVerification: false
}
```

### Progressive Disclosure of Complexity

**Level 1 (Default):** Show summary cards with auto-populated data. User just confirms.

**Level 2 (On edit):** Expand card to show individual items with toggle switches.

**Level 3 (Expert mode):** Full form with all dropdowns, manual percentage overrides, custom items. For CPAs and power users.

---

## 9. Tax Situation Assessment UX {#tax-situation-assessment}

### Conversational Flow (Not a Form)

Use a chat-like or wizard-like interface that guides the user through tax concepts:

```
┌────────────────────────────────────────────────┐
│ Let's figure out your tax situation             │
│                                                 │
│ This helps us calculate your actual savings     │
│ and determine if your losses are fully          │
│ deductible against your income.                 │
│                                                 │
│ ┌──────────────────────────────────────┐       │
│ │ What tax year is this study for?     │       │
│ │                                      │       │
│ │ [2025]  [2024]  [2023]  [Other]     │       │
│ └──────────────────────────────────────┘       │
│                                                 │
│ ℹ️ Tip: Most owners do a study for the         │
│ current tax year. If your property was          │
│ purchased in a prior year, we'll calculate      │
│ your catch-up depreciation too.                 │
└────────────────────────────────────────────────┘
```

### Tax Bracket Helper

Instead of asking "what's your tax bracket?" (most people don't know), ask:

```
"What's your approximate annual household income?"

[ Under $50K    ]  → 12% bracket
[ $50K - $100K  ]  → 22% bracket
[ $100K - $200K ]  → 24% bracket
[ $200K - $400K ]  → 32-35% bracket
[ $400K+        ]  → 35-37% bracket
[ I'd rather not say ] → Use 24% default with disclosure
```

Then show: "At your tax bracket, this study could save you approximately **$XX,XXX** in taxes this year."

### Material Participation Quick Assessment

```
"Do you actively manage your short-term rental?"

[Yes, I handle everything]
  → "About how many hours per year?"
    [100+] → ✅ "You likely qualify for full deduction of losses"
    [50-100] → ⚠️ "You may qualify — track your hours carefully"
    [Under 50] → ℹ️ "A property manager's hours may help"

[I use a property manager for most things]
  → "Do you handle any of these yourself?"
    [ ] Guest communication
    [ ] Purchasing supplies/furnishings
    [ ] Financial management
    [ ] Maintenance coordination
    [ ] Listing management
  → Calculate approximate hours from selections

[Mix of both]
  → Similar breakdown
```

### REP Status Quick Screen

```
"Is real estate your primary profession?"

[No, I have a W-2 job / other business]
  → Skip REP assessment
  → Rely on STR material participation (7-day rule)

[Yes, I work primarily in real estate]
  → "Do you spend 750+ hours per year in real estate activities?"
    [Yes] → "Does real estate take more than half your working time?"
      [Yes] → ✅ REP status likely qualifies
      [No] → ⚠️ More-than-half test may not be met
    [No] → REP status not applicable
```

---

## 10. Trust-Building Strategy {#trust-building}

### Trust Signals Throughout the Journey

| Screen | Trust Signal |
|---|---|
| Landing page | "Methodology meets IRS Publication 5653 standards" |
| Property lookup | "Verified data from [County Name] Assessor's Office" |
| Feature cards | Confidence indicators + data source attribution |
| Tax section | "This guidance is based on IRC §469 and Treas. Reg. 1.469-1T" |
| Results | Methodology statement, IRS code references |
| Report | Full audit-ready documentation with professional review note |

### Audit Guarantee Positioning

```
"Your report meets the 13 principal elements required by the IRS
Cost Segregation Audit Techniques Guide (Publication 5653, 2025 edition).

If your cost segregation deductions are questioned in an audit,
we'll provide support documentation and methodology defense at no additional cost."
```

### Professional Review Layer

For audit-ready credibility, the report should include:

1. **AI-Generated Analysis** — Transparent about being AI-powered
2. **Engineering Methodology Statement** — Documents the residual estimation approach
3. **Professional Review Certification** — "Reviewed by [Name], [Credential]" (partner with ASCSP-certified professionals or licensed engineers for review)
4. **IRS Code Citations** — Every classification backed by specific code reference

### CPA Partnership Channel

Offer white-label version for CPAs:
- CPA signs up, gets wholesale pricing (40-50% discount)
- Runs studies under their own brand
- CPA provides the "professional review" layer
- Recurring revenue model for the business

---

## 11. Report Delivery UX {#report-delivery}

### Free Tier (Always Available)

- Estimated first-year deduction (range)
- High-level breakdown by MACRS class (percentages only)
- Tax savings estimate at user's bracket
- STR activity classification determination
- "Get your full report" CTA

### Paid Report ($199-$499 tiered)

**Tier 1 — Estimate Report ($199):**
- Detailed component breakdown with dollar allocations
- Depreciation schedule (5-year projection)
- Tax savings analysis
- STR classification and guidance
- Methodology statement
- Disclaimer: "Estimate — consult CPA for final filing"

**Tier 2 — Audit-Ready Study ($399):**
- Everything in Tier 1, plus:
- Full IRS-compliant cost segregation study
- Form 4562 line-item mapping
- Section 481(a) catch-up calculation
- Professional review certification
- Audit support guarantee
- Excel export for CPA
- PDF report with all supporting documentation

**Tier 3 — Premium + CPA Review ($599):**
- Everything in Tier 2, plus:
- Human CPA review of the study
- 30-minute consultation call
- Form 3115 preparation assistance
- Priority audit support

### Report Format

- **PDF** — Primary deliverable, professionally formatted
- **Excel** — Component detail, depreciation schedules for CPA import
- **JSON/CSV** — API export for tax software integration (future)
- **Web dashboard** — Interactive version accessible in their account

---

## 12. Technical Architecture (Next.js) {#technical-architecture}

### Stack

```
Frontend:  Next.js 14+ (App Router)
UI:        Tailwind CSS + shadcn/ui
State:     Zustand or React Context (for multi-step wizard state)
Backend:   Next.js API Routes / Server Actions
Database:  PostgreSQL (Supabase or Neon) + Prisma ORM
Auth:      NextAuth.js or Clerk
Payments:  Stripe
PDF Gen:   React-PDF or Puppeteer
AI:        Anthropic Claude API (Vision + Text)
APIs:      BatchData, Google Maps, AirDNA (Phase 2)
Hosting:   Vercel
```

### Data Model (Simplified)

```prisma
model Project {
  id                String   @id @default(cuid())
  userId            String
  status            ProjectStatus @default(DRAFT)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  // Property
  address           String
  lat               Float?
  lng               Float?
  propertyType      String?
  bedrooms          Int?
  bathrooms         Float?
  buildingSqft      Int?
  lotSqft           Int?
  yearBuilt         Int?
  stories           Int?
  constructionQuality String?

  // Financial
  purchasePrice     Decimal?
  purchaseDate      DateTime?
  assessedLandValue Decimal?
  assessedImprovementValue Decimal?
  depreciableBasis  Decimal?
  landValueMethod   String?  // 'assessor_ratio' | 'appraisal' | 'user_override'

  // Tax
  taxYear           Int?
  inServiceDate     DateTime?
  taxBracket        Decimal?
  isSTR             Boolean @default(true)
  materialParticipation Boolean?
  repStatus         Boolean?
  bonusDepreciation Boolean @default(true)
  adsRequired       Boolean @default(false)

  // Airbnb
  airbnbUrl         String?
  airbnbAmenities   Json?

  // Results
  components        Component[]
  estimatedDeduction Decimal?
  reportUrl         String?
  paidTier          String?

  // Data Sources
  dataSources       Json?  // Track what came from which API
}

model Component {
  id                String  @id @default(cuid())
  projectId         String
  project           Project @relation(fields: [projectId], references: [id])

  name              String
  description       String?
  macrsClass        Float   // 5, 7, 15, 27.5
  revProcClass      String?
  allocatedCost     Decimal
  allocationPercent Float
  allocationMethod  String  // 'RCNLD' | 'PERCENTAGE' | 'VISION_AI' | 'USER_INPUT'
  bonusEligible     Boolean
  depreciationMethod String
  convention        String

  // Detection metadata
  detectedBy        String?  // 'api' | 'airbnb' | 'vision_ai' | 'user'
  confidence        Float?
  photoSource       String?
}
```

### API Route Structure

```
/api/
  /property/
    lookup.ts          → BatchData + Google Geocoding
    street-view.ts     → Google Street View image
  /airbnb/
    parse-listing.ts   → Extract listing data from URL
  /vision/
    analyze-photos.ts  → Claude Vision API batch analysis
  /calculation/
    estimate.ts        → Quick estimate (free tier)
    full-study.ts      → Complete cost seg calculation
    depreciation.ts    → MACRS depreciation schedule
    section-481a.ts    → Catch-up depreciation calc
  /report/
    generate-pdf.ts    → Generate audit-ready PDF
    generate-excel.ts  → Excel export for CPAs
  /payment/
    checkout.ts        → Stripe checkout session
    webhook.ts         → Stripe webhook handler
```

---

## 13. Competitive Landscape Summary {#competitive-landscape}

### Market Map

| Company | Price | Speed | Methodology | STR Focus | AI-Powered |
|---|---|---|---|---|---|
| **CostSegregation.com (KBKG)** | $495 | ~15 min | AI + templates | Generic | Partial |
| **CSSI** | $5K-$15K | 6 weeks | Engineering | No | No |
| **Engineered Tax Services** | $3K-$12K | Weeks | Engineering | No | No |
| **Madison SPECS** | Custom | Weeks | Engineering | No | No |
| **Onshore (fka SPRX)** | Custom | Days | AI + expert review | No | Yes |
| **SegTax** | ~1/3 traditional | Hours | LiDAR + AI + review | No | Yes |
| **RentalWriteOff** | $75-$250 | Fast | AI + photo analysis | Yes (STR) | Yes |
| **DIY Cost Seg** | $495-$1,295 | Minutes | Software | No | Partial |
| **Our Tool** | $199-$599 | Minutes | AI + Vision + Review | **Yes (STR-first)** | **Yes** |

### Our Competitive Moat

1. **STR-first:** Only tool purpose-built for Airbnb/VRBO owners with listing integration
2. **Data automation:** 80%+ auto-populated vs. competitors asking 40+ manual fields
3. **Vision AI:** Photo-based component identification (no competitors except SegTax's LiDAR)
4. **Speed:** Real-time results, full report in minutes
5. **Price:** $199-$599 range undercuts traditional, competitive with DIY
6. **Transparency:** Running estimate + methodology disclosure builds trust without brand reliance
7. **CPA channel:** White-label for referral revenue

---

## 14. Implementation Phases {#implementation-phases}

### Phase 1: MVP (Weeks 1-6)

**Goal:** Working tool that produces estimate reports for STR properties.

- Next.js app with 5-screen wizard flow
- BatchData API integration (property data)
- Google Maps integration (geocoding + Street View)
- Core calculation engine (MACRS tables, bonus depreciation, component classification)
- Basic component cards (property features from API data)
- Tax situation assessment (conversational flow)
- Free estimate report (web-based)
- Stripe payment integration
- PDF report generation (Tier 1)

### Phase 2: Intelligence Layer (Weeks 7-10)

**Goal:** Add AI-powered data enrichment and audit-ready reports.

- Airbnb listing URL parsing and amenity extraction
- Claude Vision API integration for photo analysis
- Smart card UI with confidence indicators
- Section 481(a) catch-up calculator
- Form 4562 mapping in report
- Excel export for CPAs
- Audit-ready report (Tier 2)

### Phase 3: Growth & Trust (Weeks 11-16)

**Goal:** Build trust mechanisms and CPA channel.

- Professional review partnership (ASCSP-certified reviewer)
- Audit support guarantee program
- CPA white-label portal
- AirDNA integration for market data
- ATTOM API for enhanced property data
- User accounts and project history
- Premium tier with CPA review (Tier 3)

### Phase 4: Scale (Ongoing)

- Multiple property / portfolio support
- Property management system integrations (Guesty, Hostaway)
- Tax software integrations
- Mobile app (photo capture workflow)
- Referral program
- Content marketing / SEO for "cost segregation for Airbnb"

---

> **Document Version:** 1.0
> **Last Updated:** March 14, 2026
> **Companion Document:** cost-seg-methodology.md (IRS rules, math model, audit requirements)
> **Next Steps:** Feed both documents into Claude Code for Next.js implementation
