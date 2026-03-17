# UX Onboarding & Data Collection Decision Framework
## AI-First Cost Segregation Tool for Short-Term Rentals

> **Purpose:** Design decision document for the onboarding workflow. Contains A/B/C options for each critical UX choice, trade-off analysis, and implementation specs ready to hand to engineering. Feed this to Claude Code alongside the methodology and strategy docs.

---

## Table of Contents

1. [The Core UX Problem](#the-problem)
2. [Decision 1: Primary Input Modality](#decision-1)
3. [Decision 2: Property Feature Collection Method](#decision-2)
4. [Decision 3: Tax Situation Assessment Flow](#decision-3)
5. [Decision 4: Results Revelation Strategy](#decision-4)
6. [Decision 5: Trust Architecture](#decision-5)
7. [The Recommended Architecture](#recommended-architecture)
8. [Component Specs & Implementation Guide](#component-specs)
9. [Cost & Complexity Matrix](#cost-matrix)

---

## 1. The Core UX Problem {#the-problem}

We need to collect ~60 data points across property characteristics, tax situation, and financial details to produce an audit-ready cost segregation report. CostSegregation.com does this with a 40+ field form across 4 accordion sections. It looks like the IRS built it.

**Our constraints:**
- Input: ~60 data points needed
- Output: Audit-ready report that CPAs and the IRS respect
- User: STR owner who may not know tax terminology
- Time target: Under 5 minutes for data collection
- The data fidelity must be HIGH — this drives real tax filings

**The paradox:** We need maximum data accuracy with minimum user friction. The answer isn't fewer questions — it's smarter collection methods.

**What we can auto-populate (Tier 1 — zero user effort):** ~25 data points from address lookup + county APIs
**What we can infer (Tier 2 — from Airbnb listing + photos):** ~20 data points
**What we MUST ask (Tier 3 — user-only knowledge):** ~15 data points

That means the user should only have to actively answer ~15 questions. Everything else is verify/confirm.

---

## 2. Decision 1: Primary Input Modality {#decision-1}

How does the user primarily interact with the tool during onboarding?

### Option A: Conversational AI Walkthrough (Chat-Style)

**How it works:** One question at a time, chat bubble UI. AI asks questions in plain English, interprets answers, asks follow-ups based on context. Think Lemonade Insurance's "Maya" chatbot meets TurboTax's interview flow.

```
┌─────────────────────────────────────────┐
│ 🏠 CostSeg AI                          │
│                                         │
│ Hey Kevin! Let's figure out your        │
│ tax savings. What's the address of      │
│ your short-term rental?                 │
│                                         │
│         ┌─────────────────────────┐     │
│         │ 52030 Avenida Villa,    │     │
│         │ La Quinta, CA           │     │
│         └─────────────────────────┘     │
│                                         │
│ Got it! I found your property.          │
│ 3 bed / 2 bath, 1,577 sqft,           │
│ built in 2005. Sound right?            │
│                                         │
│     [Yes, that's it]  [Not quite]      │
│                                         │
│ Do you have an Airbnb listing?         │
│ If so, paste the URL and I'll pull     │
│ your amenities and photos              │
│ automatically.                          │
│                                         │
│ [Paste Airbnb URL]  [No listing]       │
│ [I use VRBO]        [Skip this]        │
└─────────────────────────────────────────┘
```

**Pros:**
- Lowest cognitive load — one thing at a time
- Natural language means no jargon confusion
- AI can explain concepts inline ("Your depreciable basis is basically what the building is worth minus the land — I calculated it as $274,992 from your county records")
- Branching logic feels natural (not "skip to question 47")
- 30-40% higher completion rates than traditional forms (industry data)
- Mobile-first friendly

**Cons:**
- Slower for power users / CPAs who know what they want
- Harder to go back and change previous answers
- Can feel patronizing for sophisticated users
- Long chat histories become unwieldy
- Engineering complexity: conversation state management, NLU, edge case handling

**Build complexity:** Medium-High
**API cost per session:** ~$0.05-0.15 (LLM calls for conversation management)
**Time to build:** 3-4 weeks
**Best for:** First-time STR owners, non-tax-savvy users

---

### Option B: Smart Card Wizard (Progressive Disclosure)

**How it works:** 4-5 screen wizard with smart cards that show auto-populated data. User confirms/edits cards rather than filling forms. Each screen focuses on one theme. Running estimate updates in real-time.

```
┌─────────────────────────────────────────────────┐
│ Step 2 of 5: Your Property Details              │
│ ━━━━━━━━━━━━━━━━━━━━━━●━━━━━━━━━━━━━━━━━━━━━━  │
│                                                  │
│  Est. Deduction: ~$82,000-$95,000  ▓▓▓▓▓▓░░     │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │ 🍳 Kitchen       │  │ 🛋️ Furnishings   │     │
│  │ Appliances: 6/6  │  │ Fully Furnished  │     │
│  │ Quality: High ✓  │  │ Window Treats ✓  │     │
│  │ ✅ Confirmed     │  │ Fans: 4          │     │
│  │ [Edit]           │  │ ✅ Confirmed     │     │
│  └──────────────────┘  │ [Edit]           │     │
│                         └──────────────────┘     │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │ 🏠 Flooring      │  │ ❄️ Climate       │     │
│  │ Living: Laminate  │  │ Central HVAC ✓   │     │
│  │ Beds: Carpet     │  │ Gas Service ✓    │     │
│  │ Kitchen: Vinyl   │  │                  │     │
│  │ ⚠️ Please verify │  │ ✅ Confirmed     │     │
│  │ [Edit]           │  │ [Edit]           │     │
│  └──────────────────┘  └──────────────────┘     │
│                                                  │
│  ┌──────────────────┐  ┌──────────────────┐     │
│  │ 🏊 Outdoor       │  │ 🚗 Garage        │     │
│  │ Pool: Yes        │  │ Attached, 2-car  │     │
│  │ Patio: Yes       │  │ Ext. Parking: 2  │     │
│  │ Fencing: ~200ft  │  │                  │     │
│  │ ⚠️ Please verify │  │ ✅ Confirmed     │     │
│  │ [Edit]           │  │ [Edit]           │     │
│  └──────────────────┘  └──────────────────┘     │
│                                                  │
│              [Continue →]                        │
└─────────────────────────────────────────────────┘
```

**Pros:**
- Visual overview — user sees everything at a glance
- Confirm/edit pattern is fast (tap to confirm, expand to edit)
- Confidence indicators (✅ confirmed, ⚠️ please verify) show data quality
- Power users can scan and confirm in seconds
- Running estimate creates engagement dopamine
- Familiar wizard pattern (TurboTax, Rocket Mortgage)
- Easy to go back and change things

**Cons:**
- More visual design complexity
- Requires good card/component design system
- Can still feel overwhelming on mobile (lots of cards on small screen)
- Less personality than conversational
- Doesn't explain concepts as naturally

**Build complexity:** Medium
**API cost per session:** ~$0.02-0.05 (API calls for data, minimal LLM)
**Time to build:** 2-3 weeks
**Best for:** Experienced investors, CPAs, power users

---

### Option C: Guided Video Walkthrough (Camera-First)

**How it works:** User does a phone-camera walkthrough of their property while AI guides them through voice prompts. "Show me your kitchen... Great, I can see stainless steel appliances, granite countertops, and laminate flooring. Now show me the living room..." Video/photos are processed by Vision AI to extract property features.

```
┌─────────────────────────────────────────┐
│  📹 Property Walkthrough                │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    [LIVE CAMERA VIEW]           │   │
│  │                                 │   │
│  │    🎤 "Now show me your         │   │
│  │     kitchen counters and        │   │
│  │     appliances"                 │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Detected so far:                       │
│  ✅ Living room: Laminate flooring      │
│  ✅ Living room: Ceiling fan            │
│  ✅ Kitchen: Stainless appliances       │
│  🔄 Analyzing kitchen counters...       │
│                                         │
│  Rooms completed: 3/7                   │
│  ━━━━━━━━━━━●━━━━━━━━━━━━━━━           │
│                                         │
│  [Pause] [Skip Room] [I'm Done]        │
└─────────────────────────────────────────┘
```

**Pros:**
- Highest data fidelity — seeing is believing
- Most engaging and novel experience (massive differentiation)
- Captures data that no form can (actual condition, quality, finishes)
- Builds trust: "we actually looked at your property"
- Natural and low-cognitive — just walk around your house
- Creates photo/video documentation for audit defense
- Could enable real-time voice Q&A during walkthrough

**Cons:**
- Highest technical complexity (real-time vision + voice + state management)
- Requires good lighting, steady camera, decent phone
- Not everyone wants to film inside their home
- Privacy concerns (strangers seeing inside your property)
- Processing cost per session: $1-5 (significant vision AI costs at scale)
- Doesn't work for properties the owner isn't physically at
- Can't be done on desktop
- Longest time to build (6-8 weeks for quality experience)

**Build complexity:** Very High
**API cost per session:** $1-5 (heavy Vision AI + real-time processing)
**Time to build:** 6-8 weeks
**Best for:** Tech-savvy users, luxury properties, maximum accuracy tier

---

### Decision 1 Recommendation

**Build Option B (Smart Card Wizard) as the primary flow.** It's the best balance of speed, accuracy, and buildability. Then layer in elements of A and C:

- Add a **conversational AI helper** (sidebar chat or floating assistant) that users can ask questions to at any point during the wizard. "What's a depreciable basis?" → AI explains in plain language.
- Add **photo upload** as an optional accelerator on the property details screen. Drop in Airbnb photos or take new ones → Vision AI auto-populates the feature cards.
- Save the **full video walkthrough** for a Premium tier or Phase 2 feature.

---

## 3. Decision 2: Property Feature Collection Method {#decision-2}

Once we have the address and basic property data, how do we collect the detailed features (flooring types, appliances, finishes, exterior features)?

### Option A: Airbnb URL Auto-Extraction + Photo AI

**How it works:** User pastes their Airbnb/VRBO listing URL. System extracts amenities list and all listing photos. Vision AI analyzes photos to identify flooring types, appliance quality, finishes, outdoor features. Results populate smart cards for user verification.

```
User pastes: airbnb.com/rooms/12345678

System extracts:
├── Amenities (structured data)
│   ├── Kitchen: Refrigerator, Oven, Dishwasher, Microwave ✅
│   ├── Essentials: Washer, Dryer, Iron ✅
│   ├── Outdoor: Pool, Patio, BBQ grill ✅
│   └── Entertainment: TV, Sound system ✅
│
├── Photos (24 images) → Vision AI
│   ├── Kitchen: Granite counters, stainless appliances, vinyl flooring (85% confidence)
│   ├── Living room: Laminate flooring, ceiling fan, blinds (90% confidence)
│   ├── Master bed: Carpet, blackout curtains (88% confidence)
│   ├── Master bath: Tile flooring, granite vanity (82% confidence)
│   ├── Exterior: Stucco walls, tile roof, concrete patio (91% confidence)
│   └── Pool area: In-ground pool, block fencing, landscaped (87% confidence)
│
└── Combined result → Smart cards pre-populated with confidence indicators
```

**Pros:**
- Fastest user experience (paste URL, wait 30 seconds, verify)
- 80%+ of property features identified automatically
- Zero manual data entry for most features
- Airbnb photos are usually high-quality and comprehensive
- Photo evidence supports audit documentation
- Users already have their listing URL readily available

**Cons:**
- Requires Airbnb URL (not all STR owners list on Airbnb)
- Vision AI confidence varies by photo quality and angle
- Some features not visible in photos (gas service, fire sprinklers, laundry hookups)
- Airbnb amenity taxonomy doesn't map 1:1 to cost seg categories
- Legal considerations around scraping listing data (mitigated by user-initiated sharing)
- VRBO/other platforms have different data structures

**Build complexity:** Medium
**API cost per property:** ~$0.50 (photo analysis) + $0.01 (listing scrape)
**Time to build:** 2-3 weeks
**Accuracy:** 75-85% of features correctly identified

---

### Option B: Style-Based Quick Assessment

**How it works:** Instead of asking about every individual feature, ask 3-4 high-level "style" questions that proxy for dozens of individual features. Use property value, location, and style tier to apply baseline allocations, then let users refine.

```
"Which best describes your property's overall style?"

┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│             │ │             │ │             │ │             │
│  [photo of  │ │  [photo of  │ │  [photo of  │ │  [photo of  │
│   basic     │ │   standard  │ │   modern/   │ │   luxury    │
│   rental]   │ │   rental]   │ │   updated]  │ │   rental]   │
│             │ │             │ │             │ │             │
│  Basic/     │ │  Standard   │ │  Modern/    │ │  Luxury/    │
│  Builder    │ │  Updated    │ │  High-End   │ │  Designer   │
│  Grade      │ │             │ │             │ │             │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘

"Is your property fully furnished for guests?"
[Yes, everything included]  [Partially]  [Unfurnished]

"What's your outdoor situation?"
[Pool + landscaped yard]  [Patio/deck, no pool]  [Minimal outdoor]  [N/A]
```

Then the system applies a template-percentage model adjusted by these style tiers, location, and property value.

**Pros:**
- Fastest possible data collection (3-4 questions, 30 seconds)
- Lowest cognitive load
- Works without photos or listing URL
- Good enough for estimate-tier reports
- No Vision AI costs

**Cons:**
- Lowest accuracy — relies on self-reported "style" assessment
- Template-based approach is what the IRS flags as deficient
- Not sufficient for audit-ready reports (our target)
- Misses specific features that significantly affect allocation (pool = 3-4% alone)
- Users may over- or under-estimate their property quality
- Doesn't create documentation trail for audit defense

**Build complexity:** Low
**API cost per property:** ~$0.01
**Time to build:** 1 week
**Accuracy:** 60-70% (insufficient for audit-ready)

---

### Option C: Hybrid — URL + Style + Targeted Questions

**How it works:** Combine the best of A and B. Start with Airbnb URL if available, layer in style assessment, then ask ONLY the targeted questions that couldn't be answered by the first two methods.

```
Flow:
1. "Do you have an Airbnb listing?" → If yes, paste URL → auto-extract
2. "Which best describes your style?" → Quick visual selector (refines AI confidence)
3. Smart cards appear with data from URL + style + county records
4. System identifies GAPS — features it couldn't determine
5. Asks ONLY the gap questions:
   "We couldn't tell from your photos:
   - Do you have gas service? [Yes] [No]
   - Fire sprinklers? [Yes] [No]
   - What type of laundry hookups? [Full] [Stackable] [None]
   - Approximate fencing: [None] [Under 100ft] [100-200ft] [200ft+]"
```

**Pros:**
- Best accuracy achievable without physical inspection
- Minimum questions asked (only gaps)
- Works with or without Airbnb URL (falls back gracefully)
- Style assessment catches Vision AI misses
- Targeted gap questions feel purposeful, not random
- Creates strong documentation trail
- Adaptable — as Vision AI improves, gap questions decrease

**Cons:**
- Most complex logic (three data sources merging + gap analysis)
- Requires good fallback UX when no URL is provided
- Need to handle disagreements between sources (Vision AI says tile, county records say carpet)
- Build time is highest of the three options

**Build complexity:** Medium-High
**API cost per property:** ~$0.50 with URL, ~$0.05 without
**Time to build:** 3-4 weeks
**Accuracy:** 85-95%

---

### Decision 2 Recommendation

**Build Option C (Hybrid)** with graceful degradation:

1. **Best path (with Airbnb URL):** URL extraction + Vision AI + county data + style assessment + gap questions. ~95% accuracy.
2. **Good path (without URL, with photos):** User uploads 5-10 photos + county data + style assessment + gap questions. ~85% accuracy.
3. **Basic path (no photos):** County data + style assessment + full feature questionnaire. ~75% accuracy. Flag in report that photo-based assessment would improve accuracy.

---

## 4. Decision 3: Tax Situation Assessment Flow {#decision-3}

The tax questions are where most users get confused. How do we collect tax bracket, filing status, material participation, REP status, and depreciable basis without making people feel like they're doing their taxes?

### Option A: "Tell Me About Yourself" Conversational

**How it works:** Natural language questions that don't use tax jargon. AI translates answers into tax parameters behind the scenes.

```
"What do you do for work?"
→ [I have a regular job (W-2)]
→ [I'm self-employed]
→ [I work in real estate]        ← triggers REP assessment
→ [I'm retired]
→ [Other]

"About how much does your household earn per year?"
→ Visual slider from $50K to $500K+ with tax bracket shown in real-time
→ "At your income level, your estimated tax savings would be ~$27,000"

"Do you manage the rental yourself?"
→ [Yes, I handle most things]    ← triggers material participation
→ [I use a property manager]
→ [Mix of both]

(If self-managed):
"About how many hours per year do you spend on this property?
Think about cleaning, guest communication, maintenance, supplies,
bookkeeping, and listing management."
→ [Slider: 50 → 100 → 250 → 500+ hours]
→ "At 250+ hours, your losses are likely fully deductible
    against your regular income. That's a significant advantage."

"Do you use this property personally? Like vacation stays?"
→ [No, it's rental only]
→ [Yes, a few days per year]     ← check §280A threshold
→ [Yes, several weeks per year]  ← WARNING flag
```

**Pros:**
- No tax jargon — maximum accessibility
- AI handles the translation to tax parameters
- Context-sensitive: only asks relevant follow-ups
- Educates user along the way
- Catches edge cases naturally (§280A personal use, at-risk)

**Cons:**
- CPAs may find it too simplified
- Ambiguous answers harder to process ("I sort of manage it")
- More LLM calls for interpretation
- Risk of misclassification if user misunderstands question

---

### Option B: Two-Track (Simple vs. Expert)

**How it works:** Offer two paths upfront. "I'm new to this" gets the conversational flow. "I know my numbers" gets a compact form with tax terminology.

```
"How would you like to provide your tax details?"

┌─────────────────────────┐  ┌─────────────────────────┐
│  🎓 Guide Me            │  │  📊 I Know My Numbers   │
│                         │  │                         │
│  We'll walk through     │  │  Quick form with tax    │
│  a few simple           │  │  terminology you're     │
│  questions about your   │  │  familiar with.         │
│  situation.             │  │  ~60 seconds.           │
│  ~2 minutes.            │  │                         │
│  [Start Guided]         │  │  [Go to Form]           │
└─────────────────────────┘  └─────────────────────────┘
```

Expert form:
```
Tax Year: [2025 ▾]           Filing Status: [MFJ ▾]
Marginal Rate: [32% ▾]      In-Service Date: [03/12/2018 📅]
Depreciable Basis: [$274,992] (auto-calculated, editable)
Activity Type: [STR <7 day avg ▾]
Material Participation: [Yes — 500+ hrs ▾]
REP Status: [No ▾]
Personal Use Days: [0]
Bonus Dep: [Elect 100% ▾]
§461(l) Cap Applies: [Auto-calculated]

[Calculate →]
```

**Pros:**
- Respects both audiences
- CPAs can fly through the expert form in 30 seconds
- Guided path handles edge cases more carefully
- Expert form doubles as a "CPA review" screen
- Reduces frustration for knowledgeable users

**Cons:**
- Two flows to build and maintain
- Users might choose wrong path ("I know my numbers" but actually don't)
- More QA surface area
- Navigation/switching between paths needs careful UX

---

### Option C: Smart Defaults with Progressive Reveal

**How it works:** Show a single screen with auto-calculated defaults for everything. Only expand details when the user wants to override. Most users just confirm. Power users click "customize" to reveal the full form.

```
┌──────────────────────────────────────────────────┐
│  Your Tax Situation (auto-calculated)            │
│                                                   │
│  Tax Year: 2025                    [Change]      │
│  Filing Status: Married Filing Jointly [Change]  │
│  Estimated Tax Bracket: 32%        [Change]      │
│  Depreciable Basis: $274,992       [Change]      │
│    ℹ️ Calculated from county assessor records     │
│  STR Activity: Qualifies as business [Learn more]│
│  Bonus Depreciation: 100% elected  [Change]      │
│                                                   │
│  ⚠️ We need a few things from you:              │
│                                                   │
│  Do you manage this property yourself?           │
│  [Yes] [No] [Partially]                         │
│                                                   │
│  About how many hours per year?                  │
│  [●━━━━━━━━━━━━━] 200 hours                     │
│                                                   │
│  Personal use days per year?                     │
│  [0] [1-7] [8-14] [15+]                        │
│  ⚠️ 15+ days may limit your deductions          │
│                                                   │
│  ──── Advanced Options ────                      │
│  [Show: ADS, §179 election, state overrides]     │
│                                                   │
│  [Calculate My Deduction →]                      │
└──────────────────────────────────────────────────┘
```

**Pros:**
- Single screen, minimal decisions
- Smart defaults mean most users just confirm
- Progressive reveal keeps it clean for beginners
- Advanced options available for CPAs without cluttering main flow
- Edge case warnings shown inline (§280A personal use flag)
- Fastest path for users who accept defaults

**Cons:**
- Users may accept incorrect defaults without understanding them
- Less educational than conversational approach
- Requires very good default logic (wrong defaults = wrong reports)
- "Change" buttons could lead to confusion if they expose complex sub-forms

---

### Decision 3 Recommendation

**Build Option C (Smart Defaults) as the base screen, with Option A's conversational helper available as an overlay/modal for any field the user doesn't understand.** User clicks "Change" on a field → gets a mini-conversational explanation + input, not a raw form field.

For CPAs specifically: add a "CPA View" toggle that shows all raw tax parameters in a compact table — the expert form from Option B.

---

## 5. Decision 4: Results Revelation Strategy {#decision-4}

When and how do we show the estimated deduction?

### Option A: Progressive Build-Up (Running Estimate)

**How it works:** Show a running estimate from the moment we have the address. It starts as a wide range and narrows as more data is collected. The number updates live as the user confirms each section.

```
After address: "Your estimated first-year deduction: $50,000 - $120,000"
After features: "Your estimated first-year deduction: $75,000 - $95,000"
After tax info: "Your estimated first-year deduction: $85,000"
               "Estimated tax savings at 32%: $27,200"
```

**Pros:**
- Creates engagement and anticipation throughout
- User sees the impact of their data in real-time
- Motivates completion ("I want to see the final number")
- Transparent — user understands what drives the calculation
- Running estimate is a key differentiator vs. competitors who hide results behind paywall

**Cons:**
- Number changing can feel unstable/unreliable
- If estimate goes DOWN as data refines, user feels loss aversion
- Requires real-time calculation engine (more complex)
- Premature numbers could be misleading

---

### Option B: Reveal Moment (Big Number Drop)

**How it works:** Collect all data first, then reveal the results on a dedicated results screen with animation and impact. Like a game show reveal.

```
[All data collected]

"Calculating your tax savings..."
[3-second loading animation with property image]

┌────────────────────────────────────────┐
│                                        │
│   Your Estimated First-Year            │
│   Tax Deduction                        │
│                                        │
│   $85,000                              │
│   [counter animation from $0 to $85K] │
│                                        │
│   That's $27,200 back in your          │
│   pocket at your 32% tax bracket.      │
│                                        │
│   ┌──────────────────────────────┐    │
│   │ Breakdown:                   │    │
│   │ ████████████░░░  5-yr: $48K  │    │
│   │ ████░░░░░░░░░░░  7-yr: $15K  │    │
│   │ ██████░░░░░░░░░ 15-yr: $22K  │    │
│   └──────────────────────────────┘    │
│                                        │
│  [Get Your Full Report — $299]         │
│  [Share with my CPA]                   │
│  [Adjust my inputs]                    │
└────────────────────────────────────────┘
```

**Pros:**
- Maximum emotional impact
- Creates a "moment" that's shareable/memorable
- Number feels definitive and trustworthy
- Great for conversion to paid report
- Simpler engineering (calculate once, display once)

**Cons:**
- User doesn't see value until the end (higher drop-off during collection)
- No motivation signal during data entry
- Feels more like a black box

---

### Option C: Hybrid — Range During, Precise at End

**How it works:** Show a confidence range during collection that narrows as data comes in. Then at the end, reveal the precise number with the full animation.

```
During collection:
┌─────────────────────────────────────┐
│ Est. Savings: $22K - $30K           │
│ ▓▓▓▓▓▓▓▓▓▓░░░░░ 65% refined       │
│ More details = more accurate        │
└─────────────────────────────────────┘

Final reveal:
"Based on everything you've told us..."
[Animation]
"$27,200 in estimated tax savings this year"
```

**Pros:**
- Engagement during collection (range keeps users motivated)
- Precise reveal at end creates the "moment"
- Range communicates uncertainty honestly
- Final precise number feels earned/trustworthy
- Best balance of engagement + impact

**Cons:**
- More complex UI (range component + reveal animation)
- Must manage expectations if final number lands at bottom of range

---

### Decision 4 Recommendation

**Option C (Hybrid).** The range during collection keeps users engaged and motivated. The final precise reveal creates the conversion moment. This is unique in the market — CostSegregation.com hides results behind the paywall; we show a narrowing range throughout.

---

## 6. Decision 5: Trust Architecture {#decision-5}

How do we build trust without relying on a brand name like KBKG/KPMG?

### Option A: Methodology Transparency

Show the user exactly how the calculation works at every step. Full open-book approach.

```
For each component card:
┌─────────────────────────────────────────┐
│ 🍳 Kitchen Appliances                  │
│ Allocated: $18,400 (6% of basis)        │
│                                         │
│ Why this amount?                        │
│ Based on RSMeans construction cost      │
│ data for your region (Riverside County, │
│ CA), a standard kitchen appliance       │
│ package in a high-end residential       │
│ property has a replacement cost of      │
│ approximately $22,000. Adjusted for     │
│ 8 years of physical depreciation        │
│ (condition: excellent), the current     │
│ contributory value is $18,400.          │
│                                         │
│ IRS Classification: 5-year property     │
│ Rev. Proc. 87-56, Asset Class 57.0     │
│ Depreciation: 200% DB, Half-Year Conv. │
│ Bonus: 100% (post-OBBBA acquisition)   │
└─────────────────────────────────────────┘
```

**Trust signal:** "We show our work. Every number is backed by data."

---

### Option B: Professional Review Layer

Partner with licensed engineers or ASCSP-certified professionals who review every report. The human credential becomes the trust signal.

```
┌─────────────────────────────────────────┐
│ Your report was reviewed by:            │
│                                         │
│ [Photo] Sarah Chen, PE, CCSP            │
│ Licensed Professional Engineer          │
│ Certified Cost Segregation Professional │
│ 15 years experience, 2,000+ studies     │
│                                         │
│ "I've reviewed this study and confirm   │
│ the methodology and classifications     │
│ comply with IRS Publication 5653        │
│ standards."                             │
│                                         │
│ Audit Support: Included at no charge    │
└─────────────────────────────────────────┘
```

**Trust signal:** "A real professional stands behind this."

---

### Option C: Comparative Validation

Show how the results compare to industry benchmarks and similar properties.

```
┌─────────────────────────────────────────┐
│ How your study compares:                │
│                                         │
│ Your reclassification: 27.7%            │
│ Similar properties in your area: 25-32% │
│ National avg (SFH residential): 23-30%  │
│ ✅ Your results are within normal range │
│                                         │
│ Properties like yours typically see:    │
│ • $75K - $95K first-year deductions     │
│ • Your result: $85,000 ✅              │
│                                         │
│ Based on 12,847 studies analyzed        │
└─────────────────────────────────────────┘
```

**Trust signal:** "Your numbers are consistent with what others see."

---

### Decision 5 Recommendation

**All three. Layer them.** This is a "defense in depth" approach to trust:

1. **Methodology transparency** (Option A) → embedded in every component card. Power users and CPAs can drill into exactly how each number was derived.

2. **Professional review** (Option B) → Required for audit-ready tier. Partner with 2-3 ASCSP-certified reviewers. Their credential is the trust backbone.

3. **Comparative validation** (Option C) → Shown on the results screen. Normalizes the result and reduces "is this too good to be true?" anxiety.

---

## CONFIRMED DECISIONS (Kevin — March 14, 2026)

| Decision | Choice | Key Nuances |
|---|---|---|
| **1. Primary Modality** | **B: Smart Card Wizard** | Video walkthrough (C) as premium upgrade — prepaid, requires on-location. Not at launch. |
| **2. Feature Collection** | **C: Hybrid** | Airbnb for amenities/style. MLS API + county assessor for hard data (price, sqft, HVAC, roof). User overrides available on everything. |
| **3. Tax Assessment** | **C: Smart Defaults** | With conversational helper overlay for confusing fields. |
| **4. Results Revelation** | **C: Hybrid Range → Reveal** | **CRITICAL: Anti-reverse-engineering protections required.** Must obfuscate calculation methodology in client-side code. Block bots and synthetic users from completing the flow. |
| **5. Trust Architecture** | **Layered (all three)** | Professional review is an UPGRADE service, NOT launch. Legal positioning: "AI-powered tool to assist in cost segregation analysis" — NOT the preparer of record. Reduces audit liability. |

---

## ADDENDUM A: Anti-Reverse-Engineering & Bot Protection {#anti-re}

### Why This Matters

Our competitive advantage is the calculation model — the property-specific percentage allocations, the component weighting logic, and the RCNLD-derived cost tables. Competitors (including CostSegregation.com) could run properties through our tool to reverse-engineer our methodology, just as we did to them. We need to prevent this.

### Client-Side Protection

**1. Server-Side Calculation Only**
All calculation logic runs on the backend. The client NEVER receives:
- Allocation percentages
- Component weighting formulas
- RCNLD cost tables or lookup data
- The breakdown between asset classes (until after payment)
- Raw API responses from BatchData/MLS

The client receives only: the running estimate range (during collection) and the final summary number (on results screen). The detailed breakdown is gated behind payment.

```typescript
// WRONG — exposes calculation logic
const deduction = basis * 0.277; // Don't do this client-side

// RIGHT — server-side API call returns only the result
const response = await fetch('/api/calculation/estimate', {
  method: 'POST',
  body: JSON.stringify({ projectId }),
});
const { lowRange, highRange } = response.json();
// Client never sees the internal math
```

**2. Obfuscated Response Payloads**
API responses should NOT return field names that reveal methodology:

```typescript
// WRONG
{ allocationPercentage: 0.277, rcnldValue: 18400, macrsClass: 5 }

// RIGHT (opaque until report is generated)
{ estimateId: "est_xK9m2", range: [75000, 95000], confidence: 0.82 }
```

**3. Rate Limiting & Fingerprinting**

```typescript
// middleware.ts — Rate limiting per user session
const LIMITS = {
  estimatesPerHour: 5,          // Max 5 property lookups per hour
  estimatesPerDay: 15,          // Max 15 per day
  estimatesPerAccount: 50,      // Max 50 per account (lifetime free tier)
};

// Device fingerprinting (FingerprintJS)
// Track: browser fingerprint, IP, session patterns
// Flag: rapid sequential lookups, systematic address variation
```

### Bot & Synthetic User Protection

**1. Invisible CAPTCHA (Cloudflare Turnstile)**
- Placed on Screen 1 (Property Lookup) — invisible to real users
- Blocks automated submissions
- Free tier covers high volume
- Does NOT interrupt the user flow

**2. Behavioral Analysis**

```typescript
interface SessionBehavior {
  timeOnScreen: number[];       // Time spent per screen (bots are fast)
  mouseMovement: boolean;       // Bots don't move mice naturally
  scrollPatterns: boolean;      // Bots don't scroll
  fieldInteractionOrder: string[]; // Natural vs. programmatic
  deviceFingerprint: string;
  ipReputation: number;         // Via Cloudflare/MaxMind
}

function isSuspicious(behavior: SessionBehavior): boolean {
  // Too fast: total time < 60 seconds for full flow
  if (sum(behavior.timeOnScreen) < 60000) return true;
  // No mouse movement
  if (!behavior.mouseMovement) return true;
  // Same IP doing >3 lookups in 10 minutes
  if (behavior.ipReputation < 0.5) return true;
  return false;
}
```

**3. Progressive Gating**
- Screen 1-2: Free, minimal friction
- Screen 3-4: Requires account (email verification)
- Screen 5 (results): Requires verified email + passes behavioral check
- Detailed breakdown: Requires payment

This means a bot can get an address lookup, but CANNOT get the estimate without creating a verified account. And the detailed methodology is never exposed without payment.

**4. Honeypot Fields**
Include invisible form fields that bots will fill but humans won't. Any submission with honeypot data filled = bot.

### Data Access Separation

```
Free tier (no account):     Property confirmation only (no estimate)
Free tier (verified email): Running range estimate (no breakdown)
Paid tier ($199):           Summary breakdown by MACRS class
Paid tier ($399):           Full component detail + methodology
```

This ensures that even if someone pays $199, they get a summary that doesn't reveal the underlying percentage model. The $399 tier shows component detail, but by that point they've paid — and the methodology statement describes the approach in general terms, not the specific weighting formulas.

---

## ADDENDUM B: MLS Data Integration {#mls-integration}

### Why MLS Data Matters

MLS listings contain property details that neither county assessor records nor Airbnb listings capture well: HVAC type, roof material, flooring descriptions, lot features, garage details, year of last renovation, and seller-provided property condition notes. This is the richest pre-sale data source available.

### MLS API Options

**Option 1: Spark/Bridge API (RESO Standard)**
- RESTified MLS data following RESO Data Dictionary standard
- 250+ MLS feeds available
- Requires MLS board membership or partnership
- Pricing: varies by MLS, typically $500-2,000/month per MLS feed

**Option 2: Zillow / Redfin / Realtor.com Public Data**
- Property details pages contain significant MLS-derived data
- Accessible via scraping (user-initiated, paste URL)
- Includes: property details, price history, tax history, photos
- Legal: public data, user-initiated sharing model

**Option 3: ATTOM Data Solutions**
- Aggregates MLS + county + deed data
- 155M+ properties
- Includes: extended building characteristics, permits, construction detail
- Pricing: $2,000-5,000/month

**Option 4: BatchData (Already Using)**
- Already includes assessor data with HVAC, roof, construction type
- 240+ assessor fields per property
- May be sufficient without separate MLS integration for MVP

### Recommended Approach

**Phase 1 (MVP):** BatchData only — it covers 80% of what MLS provides for our purposes. The key fields we need (sqft, beds/baths, year built, construction type, HVAC, roof, garage, pool, assessed values) are all in BatchData from county assessor records.

**Phase 2:** Add Zillow URL paste option alongside Airbnb URL. Extract: property details, Zestimate, tax history, price history, photos. This fills gaps BatchData misses.

**Phase 3:** Direct MLS API (Spark/Bridge) for properties where we need the full listing detail. This is the premium data source for maximum accuracy.

### Data Priority Matrix

| Data Point | BatchData (County) | Airbnb Listing | MLS/Zillow | User Must Provide |
|---|---|---|---|---|
| Address | ✅ | ✅ | ✅ | - |
| Beds/Baths | ✅ | ✅ | ✅ | - |
| Sqft (building) | ✅ | - | ✅ | - |
| Sqft (lot) | ✅ | - | ✅ | - |
| Year built | ✅ | - | ✅ | - |
| Purchase price | ✅ (last sale) | - | ✅ | Override available |
| Purchase date | ✅ (last sale) | - | ✅ | Override available |
| Assessed land value | ✅ | - | - | - |
| Assessed improvement value | ✅ | - | - | - |
| Construction type | ✅ | - | ✅ | - |
| HVAC type | ✅ | - | ✅ | Verify |
| Roof type | ✅ | - | ✅ | - |
| Garage type/spaces | ✅ | - | ✅ | - |
| Pool | ✅ | ✅ | ✅ | - |
| Flooring by room | - | Via photos | ✅ (sometimes) | Verify |
| Appliances | - | ✅ (amenities) | ✅ (sometimes) | Verify |
| Furniture status | - | ✅ (implied) | - | Confirm |
| Fencing type/footage | - | Via photos | - | User input |
| Landscaping | - | ✅ (photos) | - | Verify |
| Exterior features | - | ✅ (photos) | ✅ | Verify |
| Tax bracket | - | - | - | ✅ Required |
| Personal use days | - | - | - | ✅ Required |
| Material participation | - | - | - | ✅ Required |
| In-service date | - | - | - | ✅ Required (default from purchase) |

---

## ADDENDUM C: Legal Positioning & Liability Framework {#legal-positioning}

### Core Legal Position

**We are NOT the preparer of the cost segregation study. We are an AI-powered tool that ASSISTS property owners and their tax professionals in generating cost segregation analysis.**

### Disclaimers (Required Throughout)

**Results Screen:**
> "This analysis is generated by AI technology and is provided for informational and planning purposes. It is not a substitute for a professional cost segregation study prepared by a licensed engineer or CPA. Consult your tax professional before filing. [Company] is not a CPA firm, engineering firm, or tax preparer."

**Report Footer:**
> "AI-Assisted Cost Segregation Analysis — This report was generated using automated property data analysis and IRS-recognized methodologies. While we strive for accuracy, this analysis should be reviewed by a qualified tax professional before being used for tax filing purposes. [Company] does not provide tax advice and assumes no liability for tax positions taken based on this analysis."

**Terms of Service Key Provisions:**
- Tool provides analysis, not advice
- User is responsible for verifying accuracy
- User should consult their CPA/tax professional
- No guarantee of specific tax outcomes
- Audit support is informational, not legal representation

### Liability Mitigation by Tier

| Tier | Price | Positioning | Liability |
|---|---|---|---|
| Free Estimate | $0 | "Quick estimate for planning purposes" | Lowest — clearly labeled as estimate |
| Report ($199) | $199 | "AI-generated analysis to share with your CPA" | Low — framed as CPA input document |
| Audit-Ready ($399) | $399 | "Comprehensive analysis following IRS methodology" | Medium — stronger claims require stronger disclaimers |
| Premium + Review ($599) | $599 | "Professional-reviewed analysis with consultation" | Shared — reviewing professional carries their own E&O |

### The Professional Review Upgrade Path

At launch, we do NOT include professional review. The upgrade path:

**Phase 1 (Launch):** AI-only analysis with clear "AI-assisted tool" positioning. Strong disclaimers. Low liability.

**Phase 2 (Post-Validation):** Partner with 2-3 ASCSP-certified professionals or PEs. They review reports for a per-report fee ($50-100 to us, we charge $200 premium). Their name, credentials, and review statement appear on the report. They carry their own E&O insurance.

**Phase 3 (Scale):** Build a network of reviewing professionals. Create a marketplace model where CPAs can both white-label our tool AND serve as reviewers for other users' reports.

### Video Walkthrough as Premium Upgrade

**Positioning:** "Get the most accurate analysis possible with a guided property walkthrough"
**Price:** $149 add-on (on top of any report tier)
**Requirements:**
- Must be prepaid before walkthrough begins
- User must be physically at the property
- Walkthrough captured via mobile app (WebRTC)
- AI guides the walkthrough with voice prompts
- Photos/video stored as documentation for potential audit defense
- Processing time: same session, results updated in real-time

**Why prepaid:** The walkthrough consumes significant compute (real-time Vision AI + voice processing) and the user's time. Prepayment ensures commitment and covers the higher API cost ($3-5 per session).

---

## 7. The Recommended Architecture {#recommended-architecture}

### Complete User Journey (Combining All Decisions)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│  SCREEN 1: PROPERTY LOOKUP (~30 seconds)                 │
│  ├─ Address input (Google Places autocomplete)           │
│  ├─ Optional: Airbnb/VRBO listing URL                   │
│  └─ CTA: "Find My Property"                             │
│      ↓                                                   │
│  [Background: BatchData API + Google Street View +       │
│   Airbnb scrape + Vision AI on listing photos]           │
│      ↓                                                   │
│  SCREEN 2: CONFIRM PROPERTY (~30 seconds)                │
│  ├─ Street View photo + "Is this your property?"         │
│  ├─ Auto-populated basics: 3bd/2ba, 1,577sqft, etc.     │
│  ├─ Purchase price + date (editable)                     │
│  ├─ Running estimate range appears: "$50K - $120K"       │
│  └─ CTA: "That's My Property"                           │
│      ↓                                                   │
│  SCREEN 3: PROPERTY DETAILS (~90 seconds)                │
│  ├─ Smart cards with auto-populated features             │
│  │   ├─ From Airbnb: amenities, photos analyzed          │
│  │   ├─ From county: structure, garage, pool             │
│  │   └─ Confidence indicators on each card               │
│  ├─ Gap questions (only what couldn't be auto-detected)  │
│  ├─ Style tier selector (refines allocations)            │
│  ├─ Running estimate narrows: "$75K - $95K"              │
│  ├─ AI helper available for any question                 │
│  └─ CTA: "Continue"                                     │
│      ↓                                                   │
│  SCREEN 4: TAX SITUATION (~60 seconds)                   │
│  ├─ Smart defaults with progressive reveal               │
│  ├─ Conversational helper for confusing fields           │
│  ├─ Key questions: income range, self-manage?, hours,    │
│  │   personal use days, REP status                       │
│  ├─ Edge case warnings inline (§280A, at-risk, etc.)     │
│  ├─ Depreciable basis auto-calculated (with override)    │
│  ├─ Running estimate refines: "$82K - $88K"              │
│  └─ CTA: "Calculate My Savings"                         │
│      ↓                                                   │
│  SCREEN 5: RESULTS (~instant)                            │
│  ├─ Animated reveal: "$85,000 first-year deduction"      │
│  ├─ Tax savings at their bracket: "$27,200"              │
│  ├─ Breakdown by MACRS class (visual chart)              │
│  ├─ Comparative validation ("within normal range")       │
│  ├─ Edge case flags if applicable                        │
│  ├─ Methodology transparency (expandable)                │
│  ├─ Free: estimate + summary                             │
│  ├─ Paid tiers:                                          │
│  │   ├─ $199: Detailed report (PDF + Excel)              │
│  │   ├─ $399: Audit-ready study + professional review    │
│  │   └─ $599: Premium + CPA consultation                 │
│  └─ CTAs: "Get Report" / "Share with CPA" / "Adjust"    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Time Budget: ~3.5 minutes total

| Screen | User Time | Behind-the-Scenes |
|---|---|---|
| 1. Property Lookup | 15 sec (type address) | BatchData, Google, Airbnb (parallel) |
| 2. Confirm Property | 15 sec (verify + edit price) | Pre-computed from Screen 1 |
| 3. Property Details | 90 sec (confirm cards, answer gaps) | Vision AI results displayed |
| 4. Tax Situation | 60 sec (confirm defaults, answer 4-5 Qs) | Real-time calc updates |
| 5. Results | Instant reveal | Final calculation |
| **Total** | **~3.5 minutes** | |

---

## 8. Component Specs & Implementation Guide {#component-specs}

### Running Estimate Widget

```tsx
// Persistent component — fixed position during Screens 2-4
interface RunningEstimate {
  lowRange: number;      // Lower bound
  highRange: number;     // Upper bound
  confidence: number;    // 0-1, displayed as progress bar
  breakdown: {
    fiveYear: number;
    sevenYear: number;
    fifteenYear: number;
    building: number;
  };
  taxSavings: {
    amount: number;
    bracket: number;
  };
}

// Visual: Sticky header bar
// Animates range narrowing with each data point confirmed
// Confidence bar fills as screens complete
// Tax savings shown in parenthetical
```

### Smart Card Component

```tsx
interface SmartCard {
  title: string;           // "Kitchen Appliances"
  icon: string;            // Emoji
  status: 'confirmed' | 'needs_verification' | 'missing';
  confidence: number;      // 0-1
  dataSources: string[];   // ['county_records', 'airbnb', 'vision_ai']
  items: {
    name: string;
    value: string;
    detected: boolean;
    source: string;
    confidence: number;
  }[];
  macrsClass: number;
  estimatedAllocation: number;
  isExpanded: boolean;     // Toggle detail view
}

// States:
// ✅ Confirmed (green check) — user or high-confidence auto
// ⚠️ Needs verification (amber) — medium confidence or conflicting sources
// ❓ Missing (gray) — couldn't determine, needs user input
// Each card expandable to show individual items + edit controls
```

### Conversational AI Helper

```tsx
// Floating chat icon (bottom-right)
// Expands to a mini-chat interface
// Context-aware: knows which screen user is on, which field they're looking at

interface AIHelper {
  context: {
    currentScreen: number;
    currentField?: string;
    propertyData: PropertyData;
    taxData: TaxData;
  };
  systemPrompt: string;
  // Pre-loaded with cost seg knowledge + user's property data
  // Can answer: "What's a depreciable basis?"
  // Can advise: "Based on your situation, you likely qualify for full deduction"
  // Can flag: "Your personal use of 20 days may trigger §280A limitations"
}
```

### Vision AI Photo Processor

```tsx
// Backend service — processes photos from Airbnb or user upload
interface VisionAnalysis {
  photos: {
    url: string;
    roomType: 'kitchen' | 'bedroom' | 'bathroom' | 'living' | 'exterior' | 'pool' | 'other';
    detectedFeatures: {
      feature: string;      // "laminate_flooring"
      category: string;     // "flooring"
      macrsClass: number;   // 5
      confidence: number;   // 0.87
      boundingBox?: [number, number, number, number]; // for highlighting
    }[];
    qualityTier: 1 | 2 | 3 | 4 | 5;
    condition: 'new' | 'excellent' | 'good' | 'fair' | 'worn';
  }[];
  summary: {
    overallQuality: number;
    totalFeaturesDetected: number;
    highConfidenceCount: number;
    gapAreas: string[];    // Features that need user input
  };
}

// Processing pipeline:
// 1. Classify room type (kitchen, bedroom, etc.)
// 2. Detect features per room (flooring, counters, fixtures, etc.)
// 3. Assess quality tier and condition
// 4. Map to MACRS classifications
// 5. Flag low-confidence items for user verification
// 6. Generate gap list (what photos didn't show)
```

### Edge Case Warning System

```tsx
// Inline warnings that appear during tax assessment

interface EdgeCaseWarning {
  type: 'disqualifier' | 'limiter' | 'benefit' | 'info';
  code: string;           // '280A' | '465' | '461L' | '1245_RECAPTURE' | etc.
  title: string;          // "Personal Use May Limit Your Deductions"
  message: string;        // Plain-english explanation
  impact: string;         // "This could reduce your deduction by up to 100%"
  action: string;         // "Reduce personal use to under 14 days"
  severity: 'critical' | 'warning' | 'info';
  learnMoreUrl?: string;
}

// Triggers:
// §280A: personalUseDays > max(14, rentalDays * 0.10)
// §465: atRiskBasis < estimatedDeduction
// §461(l): estimatedLoss > excessBusinessLossThreshold
// State non-conformity: state in ['CA', 'NY', 'MA', 'CT', 'PA']
// Related party: isRelatedPartyPurchase === true
// Mid-quarter: q4BasisPercent > 0.40
```

---

## 9. Cost & Complexity Matrix {#cost-matrix}

### Per-Session API Costs

| Component | Cost per Property | Required? |
|---|---|---|
| BatchData (property lookup) | $0.01-0.05 | Yes |
| Google Geocoding | $0.005 | Yes |
| Google Street View | $0.007 | Yes |
| Airbnb listing scrape | $0.00 (own scraper) | Optional |
| Claude Vision API (20 photos) | $0.40-0.60 | Optional |
| Claude conversation helper | $0.05-0.15 | Yes (minimal calls) |
| Calculation engine | $0.00 (local) | Yes |
| PDF report generation | $0.00 (local) | Yes |
| **Total (full pipeline)** | **~$0.50-0.85** | |
| **Total (no photos)** | **~$0.07-0.25** | |

**At $299-$399 per report: 98-99.8% gross margin on data costs.**

### Build Effort by Component

| Component | Effort | Priority | Phase |
|---|---|---|---|
| Multi-step wizard framework | 1 week | P0 | 1 |
| BatchData API integration | 3 days | P0 | 1 |
| Google Maps integration | 2 days | P0 | 1 |
| Smart card UI components | 1 week | P0 | 1 |
| Running estimate widget | 3 days | P0 | 1 |
| Calculation engine (server-side only) | 2 weeks | P0 | 1 |
| Tax situation flow | 1 week | P0 | 1 |
| Results / reveal screen | 3 days | P0 | 1 |
| Stripe payment integration | 2 days | P0 | 1 |
| PDF report generation | 1 week | P0 | 1 |
| Bot protection (Turnstile + behavioral) | 3 days | P0 | 1 |
| Rate limiting + progressive gating | 2 days | P0 | 1 |
| Auth (email verification + account) | 3 days | P0 | 1 |
| Legal disclaimers + ToS | 1 day | P0 | 1 |
| **Phase 1 Total** | **~7 weeks** | | |
| Airbnb URL parsing + amenity mapping | 3 days | P1 | 2 |
| Zillow URL parsing (property + tax data) | 3 days | P1 | 2 |
| Vision AI photo analysis | 1 week | P1 | 2 |
| Conversational AI helper | 1 week | P1 | 2 |
| Gap question logic | 3 days | P1 | 2 |
| Edge case warning system | 3 days | P1 | 2 |
| Anti-RE payload obfuscation | 2 days | P1 | 2 |
| Device fingerprinting (FingerprintJS) | 2 days | P1 | 2 |
| Excel CPA export | 2 days | P1 | 2 |
| **Phase 2 Total** | **~5 weeks** | | |
| Video walkthrough (prepaid premium) | 3 weeks | P2 | 3 |
| Real-time voice guidance | 2 weeks | P2 | 3 |
| Professional review portal + matching | 1 week | P2 | 3 |
| CPA white-label dashboard | 2 weeks | P2 | 3 |
| MLS API integration (Spark/Bridge) | 1 week | P2 | 3 |
| **Phase 3 Total** | **~9 weeks** | | |

### Technology Stack Requirements

```
Phase 1 (MVP):
├── Next.js 14+ (App Router)
├── Tailwind CSS + shadcn/ui + Framer Motion (animations)
├── Zustand (wizard state management)
├── BatchData API (property data)
├── Google Maps APIs (geocoding, Street View)
├── Stripe (payments)
├── React-PDF or Puppeteer (report generation)
├── PostgreSQL + Prisma (data layer)
├── Vercel (hosting)
├── Claude API (calculation validation + helper chat)
├── Cloudflare Turnstile (invisible CAPTCHA)
├── NextAuth.js or Clerk (auth + email verification)
├── Upstash Redis (rate limiting + session tracking)
└── All calculation logic in API routes (NEVER client-side)

Phase 2 (Intelligence Layer):
├── Claude Vision API (photo analysis)
├── Cheerio or Playwright (Airbnb + Zillow listing parsing)
├── Advanced Framer Motion (running estimate animations)
├── Resend or SendGrid (email delivery)
├── xlsx.js (Excel export)
├── FingerprintJS Pro (device fingerprinting)
└── Server-side payload obfuscation layer

Phase 3 (Premium):
├── WebRTC or Daily.co (live video walkthrough)
├── Claude Voice API (real-time voice guidance)
├── Admin dashboard (professional review portal + matching)
├── Multi-tenant auth (CPA white-label)
└── Spark/Bridge MLS API (direct MLS data access)
```

---

> **Document Version:** 1.0
> **Last Updated:** March 14, 2026
> **Companion Documents:** cost-seg-methodology.md, ux-data-strategy.md
> **Next Steps:** Make decisions on A/B/C options, then feed all three documents into Claude Code for implementation.
