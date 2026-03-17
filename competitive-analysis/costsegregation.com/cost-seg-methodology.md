# Cost Segregation Methodology & IRS Compliance Reference

> **Purpose:** This document serves as the foundational reference for building an AI-powered, audit-ready cost segregation engine for short-term rental (STR) residential properties. Feed this into Claude Code as context when building the backend calculation logic, report generation, and compliance layer.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Reverse-Engineered Math from CostSegregation.com](#reverse-engineered-math)
3. [IRS Legal Framework](#irs-legal-framework)
4. [MACRS Asset Classification Tables](#macrs-asset-classification-tables)
5. [Bonus Depreciation Rules (Current)](#bonus-depreciation-rules)
6. [STR-Specific Tax Rules & REP Status](#str-specific-tax-rules)
7. [Depreciable Basis Calculation](#depreciable-basis-calculation)
8. [Section 481(a) Look-Back Adjustment](#section-481a-look-back)
9. [Audit-Ready Report Requirements](#audit-ready-report-requirements)
10. [Calculation Engine Specification](#calculation-engine-specification)
11. [Form 4562 Mapping](#form-4562-mapping)
12. [Competitive Pricing & Positioning](#competitive-pricing)
13. [IRS Code References](#irs-code-references)

---

## 1. Executive Summary {#executive-summary}

Cost segregation is the process of reclassifying components of a building from the default 27.5-year residential depreciation schedule into shorter-lived asset categories (5-year, 7-year, 15-year), accelerating tax deductions. Combined with bonus depreciation (currently 100% for property placed in service after Jan 19, 2025 under OBBBA), this creates significant first-year deductions.

For STR properties specifically, the 7-day average rental rule under Treas. Reg. 1.469-1T(e)(3)(ii)(A) reclassifies the activity from "rental" to "business," enabling losses to offset ordinary W-2 income when material participation or Real Estate Professional (REP) status is established.

**Key Numbers:**
- Typical residential reclassification: 20-40% of depreciable basis moves to accelerated categories
- Average for standard residential: 25-35%
- High-end/luxury properties: up to 40%+
- With 100% bonus depreciation: entire reclassified amount deductible in year 1

---

## 2. Reverse-Engineered Math from CostSegregation.com {#reverse-engineered-math}

### Observed Behavior

Property: 52030 Avenida Villa, La Quinta, CA, USA
- Type: Single Family Home (Residential)
- Purchase Price: $337,000
- Building Sqft: 1,577
- Lot Sqft: 4,792
- 3 bed / 2 bath
- Construction Quality: High End
- Physical Condition: Excellent

**Data Points Captured:**

| Depreciable Tax Basis Input | Estimated First-Year Deduction | Ratio |
|---|---|---|
| $527,000 (user error - test value) | $146,500 | 27.8% |
| $306,754 (Zillow/county estimate) | $85,000 | 27.7% |

### Key Finding: Linear Percentage Model

CostSegregation.com applies a **~27.7% flat ratio** of the depreciable basis as the estimated first-year deduction for this property profile. The relationship is linear — change the basis, the deduction scales proportionally. This suggests:

1. Their model pre-calculates a **property-profile-based percentage** using the property features (construction quality, finishes, amenities, sqft, etc.)
2. That percentage is then multiplied against whatever depreciable basis the user enters
3. The percentage likely varies by property profile but is not dynamically recalculated on each basis change

### Implied Asset Allocation (Reverse-Engineered)

If ~27.7% of basis is the first-year deduction with 100% bonus depreciation, then ~27.7% of the property's depreciable basis is being reclassified to 5/7/15-year property. Approximate breakdown for this property type:

| Asset Category | % of Depreciable Basis | Recovery Period | Depreciation Method |
|---|---|---|---|
| Building Structure | ~72.3% | 27.5 years | Straight-line |
| Appliances & Equipment | ~6-8% | 5 years | 200% DB / Bonus |
| Flooring (Carpet, Vinyl, Laminate) | ~5-7% | 5 years | 200% DB / Bonus |
| Cabinetry & Built-in Fixtures | ~4-6% | 7 years | 200% DB / Bonus |
| Specialty Electrical/Plumbing | ~3-5% | 5-15 years | 200% DB / Bonus |
| Land Improvements (Fence, Landscaping, Patio) | ~3-5% | 15 years | 150% DB / Bonus |

### CostSegregation.com UX Flow (3-Step Wizard)

**Step 1: Property (Address Lookup → AI-Populated Review)**
- Single input: Property address (Google Places autocomplete)
- System auto-populates via API/AI lookup from county records
- User reviews and confirms across 4 accordion sections:
  - General Information (address, property profile, type, purchase price, purchase date, sqft, lot sqft, construction quality, physical condition + Google Street View image)
  - General Building (stories, basement, exterior wall type, roof type, garage type, garage spaces, solar panel system)
  - Interior Features (bedrooms, bathrooms, HVAC type, gas service, fire sprinklers, laundry hookups, flooring by room, appliances checklist, window treatments, ceiling fans, fully furnished flag, hot tub)
  - Exterior Features (exterior parking, landscaping, deck, patio, fence types with linear footage, swimming pool, boat dock)
- CTA: "Confirm" button per section

**Step 2: Tax Info**
- Tax Information section: Taxpayer name, tax return year, in service date, remove bonus depreciation checkbox, **STR/vacation rental flag**, ADS required flag
- Depreciable Tax Basis section: Single input with Form 4562 visual example, CPA invite option, formula shown (Purchase Price minus Land Value)

**Step 3: Report / Checkout**
- Shows estimated first-year deduction (large green number)
- Fee: flat $495 regardless of property value
- Billing + Stripe payment form
- KBKG subscription agreement checkbox

**Design Critique:**
- Asks for information that should be auto-populated from the address lookup (e.g., construction quality, flooring types could be better inferred)
- Depreciable tax basis is a friction point — most consumers don't know this number
- Dated, form-heavy UX — feels like filling out a tax return rather than getting a modern financial tool experience
- Trust relies heavily on KBKG brand name rather than UX transparency

---

## 3. IRS Legal Framework {#irs-legal-framework}

### Core Statute: IRC Section 168 — Accelerated Cost Recovery System (MACRS)

MACRS is the mandatory depreciation system for most tangible property placed in service after 1986. Key subsections:

- **§168(a):** General rule — depreciation deduction determined by applicable depreciation method, recovery period, and convention
- **§168(b):** Depreciation methods (200% declining balance for 3/5/7/10-year, 150% DB for 15/20-year, straight-line for 27.5/39-year)
- **§168(c):** Recovery periods by property class
- **§168(d):** Conventions (half-year for personal property, mid-month for real property)
- **§168(e):** Classification of property — defines what falls into each recovery period
- **§168(g):** Alternative Depreciation System (ADS) — required in specific circumstances
- **§168(k):** Bonus depreciation (additional first-year depreciation)

### Revenue Procedure 87-56

The master reference for asset classification. Contains Table of Class Lives and Recovery Periods with two key sections:
- **Table B-1:** Specific depreciable assets used in all business activities (not industry-specific)
- **Table B-2:** Depreciable assets used in specific industries

For residential rental properties, the relevant asset classes include:
- Asset Class 00.11: Office furniture, fixtures (7-year GDS, 10-year ADS)
- Asset Class 00.12: Information systems (computers, peripherals) (5-year GDS, 5-year ADS)
- Asset Class 57.0: Distributive trades and services (general purpose, 5-year GDS)

---

## 4. MACRS Asset Classification Tables {#macrs-asset-classification-tables}

### For Residential STR Properties — Complete Classification

#### 5-Year Property (§168(e)(3)(B))
Personal property and certain improvements with short useful lives.

| Component | Examples | Typical % of Basis |
|---|---|---|
| Appliances | Refrigerator, oven/range, microwave, dishwasher, washer, dryer, garbage disposal, exhaust hood | 5-8% |
| Flooring (removable) | Carpet, vinyl tile (VCT/LVT), laminate (floating), area rugs | 5-8% |
| Window Treatments | Blinds, curtains, drapes, shutters | 1-2% |
| Furniture (if furnished) | Beds, dressers, tables, chairs, sofas, desks, bookshelves | 3-8% |
| Electronics/Equipment | TVs, sound systems, security cameras, smart home devices | 1-2% |
| Decorative Items | Artwork, mirrors, light fixtures (non-structural), ceiling fans | 1-2% |
| Small Specialty Items | Hot tub (portable), fire pit (portable), outdoor furniture | 1-2% |

#### 7-Year Property
Fixtures and property not classified elsewhere.

| Component | Examples | Typical % of Basis |
|---|---|---|
| Cabinetry | Kitchen cabinets, bathroom vanities, built-in shelving | 4-7% |
| Specialized Fixtures | Built-in safe, specialty lighting systems | 0.5-1% |
| Office Equipment | If home office present | 0.5-1% |

#### 15-Year Property (Land Improvements — §168(e)(3)(C))
Improvements to the land, not the building.

| Component | Examples | Typical % of Basis |
|---|---|---|
| Fencing | Wood fence, vinyl fence, wrought iron fence, chain link fence, concrete/masonry wall | 1-3% |
| Landscaping | Trees, shrubs, hardscaping, irrigation systems, outdoor lighting | 1-3% |
| Paving | Driveway, sidewalks, patios (concrete/stone), parking areas | 1-3% |
| Outdoor Structures | Deck (if not attached to structure), pergola, gazebo, retaining walls | 1-2% |
| Swimming Pool | In-ground pool (considered land improvement) | 2-4% |
| Boat Dock | If applicable | 1-2% |

#### 27.5-Year Property (Residential Rental Building — §168(c)(1))
The building structure and permanent structural components.

| Component | Examples | Typical % of Basis |
|---|---|---|
| Building Shell | Foundation, framing, exterior walls, roof structure | 60-80% |
| Permanent Systems | Central HVAC (ducted), plumbing rough-in, electrical wiring, insulation | Included in structure |
| Structural Flooring | Hard tile (ceramic/porcelain), hardwood (nailed down), sealed concrete | Included in structure |
| Permanent Features | Built-in fireplace, permanent stairs, load-bearing walls | Included in structure |

### Percentage Adjustment Factors

The ~27.7% baseline from CostSegregation.com shifts based on property characteristics:

**Factors that INCREASE the reclassification percentage (toward 35-40%+):**
- Fully furnished property (adds 3-8% from furniture alone)
- High-end appliance package (Sub-Zero, Viking, etc.)
- Extensive landscaping and hardscaping
- Swimming pool
- Multiple fencing types with significant linear footage
- Luxury flooring (more removable/replaceable types)
- Smart home automation systems
- Hot tub, outdoor kitchen, fire features
- Solar panel system (5-year property with ITC)

**Factors that DECREASE the reclassification percentage (toward 20-25%):**
- Basic/standard finishes
- Minimal landscaping
- No pool, no deck/patio
- Standard appliances
- Unfurnished property
- Hard tile and hardwood throughout (structural = 27.5-year)
- Minimal exterior improvements

---

## 5. Bonus Depreciation Rules (Current) {#bonus-depreciation-rules}

### Section 168(k) — As Amended by OBBBA (January 19, 2025)

**Current Status (2025-2029):** 100% bonus depreciation permanently restored for qualified property acquired and placed in service after January 19, 2025.

**Original TCJA Phase-Down (now superseded for new acquisitions):**

| Tax Year | Bonus % (Original TCJA) | Bonus % (Post-OBBBA, new acquisitions) |
|---|---|---|
| 2022 | 100% | 100% |
| 2023 | 80% | 80% (already past) |
| 2024 | 60% | 60% (already past) |
| 2025 | 40% | **100%** (if acquired after Jan 19, 2025) |
| 2026 | 20% | **100%** |
| 2027+ | 0% | **100%** (through at least 2029) |

**Transition Rules:**
- Property under binding contract BEFORE Jan 20, 2025: original phase-down applies
- Property acquired AFTER Jan 19, 2025: 100% bonus depreciation

**What Qualifies for Bonus Depreciation:**
- All MACRS property with recovery period of 20 years or less (5-year, 7-year, 15-year)
- Must be NEW to the taxpayer (used property qualifies post-TCJA)
- Must be placed in service during the tax year

**What Does NOT Qualify:**
- 27.5-year residential rental property (the building itself)
- 39-year nonresidential real property
- Land (never depreciable)
- Property where taxpayer elects out of bonus depreciation

### Calculation Engine Logic for Bonus Depreciation

```
For each reclassified component:
  IF bonus_depreciation_elected AND recovery_period <= 20 years:
    year_1_depreciation = component_basis * bonus_percentage
    remaining_basis = component_basis - year_1_depreciation
    // Remaining basis depreciated over recovery period using applicable method
  ELSE:
    // Standard MACRS depreciation tables apply
```

---

## 6. STR-Specific Tax Rules & REP Status {#str-specific-tax-rules}

### The 7-Day Rule — Treas. Reg. 1.469-1T(e)(3)(ii)(A)

**Critical Classification:** If the average period of customer use is 7 days or less, the activity is NOT a "rental activity" for passive loss purposes under IRC §469.

**Impact:** Reclassifies STR income/loss from passive to potentially active, allowing:
- Losses to offset ordinary income (W-2, business income)
- No $25,000 passive loss limitation cap
- Full deductibility of cost segregation-generated losses IF material participation is met

### Material Participation Tests — IRC §469(h)

The taxpayer must satisfy ANY ONE of seven tests:

1. **500+ hours** in the activity during the year
2. **100+ hours** AND more than any other individual
3. **Significant participation** in multiple activities totaling 500+ hours
4. Taxpayer's participation constitutes substantially all participation
5. Material participation in any 5 of the prior 10 years
6. Personal service activity with material participation in any 3 prior years
7. Facts and circumstances (100-500 hours, regular/continuous/substantial)

**For STR owners who clean, manage, maintain:** Tests 1 and 2 are most commonly met. Activities that count:
- Guest check-in/check-out management
- Property cleaning and turnover
- Maintenance and repairs
- Landscaping and exterior upkeep
- Guest communication and booking management
- Purchasing supplies and furnishings
- Financial management and bookkeeping for the property
- Marketing and listing management

### Real Estate Professional (REP) Status — IRC §469(c)(7)

**Three Requirements (ALL must be met):**

1. **750-Hour Test:** More than 750 hours of services in real property trades or businesses during the tax year

2. **More-Than-Half Test:** More than 50% of ALL personal services performed during the tax year are in real property trades or businesses

3. **Material Participation Test:** Must materially participate in EACH rental activity being treated as non-passive (can elect to aggregate all rental activities as a single activity under IRC §469(c)(7)(A))

**Qualifying Real Property Trades or Businesses (11 categories):**
Development, redevelopment, construction, reconstruction, acquisition, conversion, rental, operation, management, leasing, brokerage

**Key Rules:**
- Each spouse tested independently (cannot combine hours)
- Hours aggregated across ALL real property activities
- W-2 employment counts against the more-than-half test (makes it hard for full-time W-2 employees)
- Documentation essential: contemporaneous time logs with dates, hours, descriptions, property ID

**Impact on Cost Segregation:**
- With REP status: ALL rental losses (including cost seg accelerated depreciation) fully deductible against ordinary income with NO cap
- Without REP status but with STR material participation: Still deductible against ordinary income due to 7-day rule
- Without either: Subject to passive loss rules, $25,000 limitation (phased out at AGI >$100K)

### Decision Tree for the Calculation Engine

```
IF average_rental_period <= 7 days:
  activity_type = "BUSINESS" (not rental under §469)
  IF material_participation_met:
    loss_treatment = "FULLY_DEDUCTIBLE_AGAINST_ORDINARY_INCOME"
  ELSE:
    loss_treatment = "PASSIVE" (standard passive rules apply)
ELSE IF average_rental_period <= 30 days AND significant_personal_services:
  activity_type = "BUSINESS"
  // Same material participation analysis
ELSE:
  activity_type = "RENTAL"
  IF rep_status:
    loss_treatment = "FULLY_DEDUCTIBLE_AGAINST_ORDINARY_INCOME"
  ELSE IF agi <= 150000:
    loss_treatment = "PASSIVE_WITH_25K_ALLOWANCE"
  ELSE:
    loss_treatment = "PASSIVE_SUSPENDED"
```

---

## 7. Depreciable Basis Calculation {#depreciable-basis-calculation}

### Formula

```
Depreciable Basis = Purchase Price + Capital Improvements - Land Value
```

### Land Value Determination Methods (Ranked by IRS Defensibility)

1. **Professional Appraisal** — Most defensible, MAI or SRA designated appraiser ($500-$2,000)
2. **County Tax Assessor Ratio** — Most practical for automation
   ```
   land_ratio = assessed_land_value / total_assessed_value
   land_value = purchase_price * land_ratio
   depreciable_basis = purchase_price - land_value
   ```
3. **Comparable Land Sales** — Raw land sales in same area, price per sqft applied to lot
4. **Allocation in Purchase Agreement** — If specified in closing documents

### Automated Approach (for our tool)

**Primary:** Pull assessed land value and improvement value from county records via ATTOM or BatchData API. These APIs explicitly provide the land/improvement split.

**Calculation:**
```javascript
const assessedLandValue = apiResponse.assessment.landValue;        // e.g., $62,000
const assessedImprovementValue = apiResponse.assessment.improvementValue; // e.g., $275,000
const totalAssessed = assessedLandValue + assessedImprovementValue;      // e.g., $337,000
const landRatio = assessedLandValue / totalAssessed;                      // e.g., 18.4%

const purchasePrice = userInput.purchasePrice;                            // e.g., $337,000
const estimatedLandValue = purchasePrice * landRatio;                     // e.g., $62,008
const depreciableBasis = purchasePrice - estimatedLandValue;              // e.g., $274,992
```

**User Override:** Always allow user to override with their own land value (from appraisal, closing docs, or CPA input).

---

## 8. Section 481(a) Look-Back Adjustment {#section-481a-look-back}

### When It Applies

Properties placed in service in prior years that were depreciated using default 27.5-year straight-line. Cost segregation study identifies components that should have been in shorter-lived categories from the start.

### Calculation

```
481a_adjustment = cumulative_depreciation_that_should_have_been_claimed
                  - cumulative_depreciation_actually_claimed
                  (on reclassified components, for all prior years)
```

### Filing Mechanism

- **Form 3115** (Application for Change in Accounting Method)
- Filed with current-year tax return
- **No amendment of prior returns required**
- Automatic consent procedure (no IRS pre-approval needed)
- Entire catch-up amount recognized in the year of filing

### Example Calculation for Our Engine

```javascript
function calculate481aAdjustment(property) {
  const yearsInService = currentTaxYear - property.inServiceYear;
  const reclassifiedComponents = costSegStudy.components.filter(c => c.recoveryPeriod < 27.5);

  let shouldHaveClaimed = 0;
  let actuallyClaimed = 0;

  for (const component of reclassifiedComponents) {
    // What should have been claimed under correct classification
    for (let year = 0; year < yearsInService; year++) {
      shouldHaveClaimed += calculateMACRS(component.basis, component.recoveryPeriod, year);
    }

    // What was actually claimed under 27.5-year straight-line
    const annualStraightLine = component.basis / 27.5;
    actuallyClaimed += annualStraightLine * yearsInService;
  }

  return shouldHaveClaimed - actuallyClaimed; // This is the 481(a) adjustment
}
```

---

## 9. Audit-Ready Report Requirements {#audit-ready-report-requirements}

### IRS Publication 5653 (2025) — 13 Principal Elements

The IRS Cost Segregation Audit Techniques Guide defines 13 elements that constitute a quality study. Our report MUST address all 13:

1. **Qualified Professionals:** Report must document credentials and expertise of preparer. For AI-generated reports, this means: engineering methodology documented, professional review layer, credentials of reviewing engineer/CPA.

2. **Methodology Description:** Detailed explanation of the approach. For our tool: "Residual Estimation Method with AI-Enhanced Component Identification, cross-referenced against IRS Rev. Proc. 87-56 asset classifications and validated against regional construction cost databases."

3. **Construction Documentation:** Property photos (from Airbnb listing, user upload, or Street View), county assessor records, purchase documents. Acknowledge limitations vs. physical site inspection.

4. **Asset Identification:** Every reclassified component listed with clear nomenclature.

5. **Asset Classification:** Each component mapped to specific Rev. Proc. 87-56 asset class with justification.

6. **Cost Allocation:** Dollar amounts allocated to each component with methodology explanation (RCNLD — Replacement Cost New Less Depreciation, or percentage-of-cost method).

7. **Documentation Organization:** All supporting documents organized and referenced.

8. **Residual Estimation:** Clear documentation of what constitutes the residual (27.5-year building structure) vs. reclassified components.

9. **Sampling Methodology:** If using statistical models, document population, stratification, sample size, precision. For our tool: document the training data and model validation.

10. **Personal vs. Real Property Distinction:** Clear separation with legal basis for each classification.

11. **Component Breakdown:** Percentage and dollar allocation to each MACRS class.

12. **Reconciliation to Total Cost:** All allocations must sum to 100% of depreciable basis.

13. **Tax Code Compliance:** Demonstrate compliance with IRC §168, Rev. Proc. 87-56, and applicable regulations.

### Report Output Structure (Recommended)

```
COST SEGREGATION STUDY REPORT
============================

1. Executive Summary
   - Property identification
   - Estimated first-year deduction
   - Total reclassified amount and percentage
   - Methodology used

2. Property Description
   - Address, type, square footage
   - Construction details
   - Photos and documentation sources

3. Taxpayer Information
   - Entity name
   - Tax year
   - In-service date
   - STR/REP status determination

4. Depreciable Basis Calculation
   - Purchase price
   - Land value determination method and amount
   - Capital improvements (if any)
   - Final depreciable basis

5. Asset Classification Detail
   - Table: Component | Description | MACRS Class | Recovery Period | Allocated Cost | Depreciation Method
   - For EACH reclassified component

6. Cost Allocation Summary
   - By MACRS class (5-year, 7-year, 15-year, 27.5-year)
   - Percentages and dollar amounts
   - Reconciliation to total depreciable basis (must = 100%)

7. Depreciation Schedule
   - Year-by-year depreciation for each class
   - With and without bonus depreciation scenarios
   - 5-year projection minimum

8. First-Year Deduction Calculation
   - Bonus depreciation amounts by class
   - Standard MACRS amounts for non-bonus property
   - Total first-year deduction

9. Section 481(a) Adjustment (if applicable)
   - Catch-up depreciation calculation
   - Form 3115 filing instructions

10. Tax Impact Analysis
    - Estimated tax savings at user's marginal rate
    - STR activity classification determination
    - Material participation / REP status impact

11. Methodology Statement
    - Detailed description of approach
    - Data sources used
    - Limitations and disclaimers
    - Professional review statement

12. Appendices
    - Property photos
    - County assessor records
    - Supporting documentation
    - IRS code references
```

---

## 10. Calculation Engine Specification {#calculation-engine-specification}

### Core Algorithm

```typescript
interface CostSegStudy {
  property: PropertyDetails;
  taxInfo: TaxInformation;
  components: AssetComponent[];
  summary: StudySummary;
}

interface AssetComponent {
  id: string;
  name: string;                    // e.g., "Kitchen Appliances"
  description: string;             // e.g., "Refrigerator, oven/range, dishwasher, microwave"
  macrsClass: 5 | 7 | 15 | 27.5;
  revProc8756Class: string;        // e.g., "00.11" or "57.0"
  allocatedCost: number;
  allocationMethod: 'RCNLD' | 'PERCENTAGE' | 'ACTUAL_COST';
  bonusEligible: boolean;
  depreciationMethod: 'GDS_200DB' | 'GDS_150DB' | 'GDS_SL' | 'ADS_SL';
  convention: 'HALF_YEAR' | 'MID_MONTH' | 'MID_QUARTER';
}

function calculateStudy(input: StudyInput): CostSegStudy {
  // Step 1: Determine depreciable basis
  const depreciableBasis = input.purchasePrice - input.landValue + input.capitalImprovements;

  // Step 2: Identify and classify components based on property features
  const components = classifyComponents(input.propertyFeatures, depreciableBasis);

  // Step 3: Allocate costs to each component
  const allocatedComponents = allocateCosts(components, depreciableBasis);

  // Step 4: Calculate depreciation for each component
  const depreciationSchedule = calculateDepreciation(allocatedComponents, input.taxInfo);

  // Step 5: Apply bonus depreciation if elected
  const withBonus = applyBonusDepreciation(depreciationSchedule, input.taxInfo);

  // Step 6: Calculate 481(a) if look-back applicable
  const adjustment481a = input.taxInfo.inServiceYear < input.taxInfo.taxYear
    ? calculate481aAdjustment(allocatedComponents, input.taxInfo)
    : null;

  // Step 7: Generate summary
  return assembleFinalStudy(withBonus, adjustment481a, input);
}
```

### Component Classification Logic

```typescript
function classifyComponents(features: PropertyFeatures, basis: number): AssetComponent[] {
  const components: AssetComponent[] = [];

  // --- 5-YEAR PROPERTY ---

  // Appliances (based on checklist)
  if (features.appliances) {
    const applianceList = [];
    if (features.appliances.refrigerator) applianceList.push('Refrigerator');
    if (features.appliances.ovenRange) applianceList.push('Oven/Range');
    if (features.appliances.microwave) applianceList.push('Microwave');
    if (features.appliances.dishwasher) applianceList.push('Dishwasher');
    if (features.appliances.exhaustHood) applianceList.push('Exhaust Hood');
    if (features.appliances.garbageDisposal) applianceList.push('Garbage Disposal');

    if (applianceList.length > 0) {
      components.push({
        name: 'Kitchen Appliances',
        description: applianceList.join(', '),
        macrsClass: 5,
        revProc8756Class: '57.0',
        bonusEligible: true,
        allocationPercentage: calculateAppliancePercentage(features.constructionQuality, applianceList.length)
      });
    }
  }

  // Flooring (by room, based on type)
  const removableFlooringRooms = getRemovableFlooringRooms(features.flooring);
  // Carpet, vinyl, laminate (floating) = 5-year personal property
  // Hard tile, hardwood (nailed) = 27.5-year structural

  if (removableFlooringRooms.length > 0) {
    components.push({
      name: 'Removable Flooring',
      description: removableFlooringRooms.map(r => `${r.room}: ${r.type}`).join('; '),
      macrsClass: 5,
      bonusEligible: true,
      allocationPercentage: calculateFlooringPercentage(removableFlooringRooms, features.buildingSqft)
    });
  }

  // Furniture (if fully furnished STR)
  if (features.fullyFurnished) {
    components.push({
      name: 'Furniture & Furnishings',
      description: 'Beds, dressers, tables, chairs, sofas, linens, decorative items',
      macrsClass: 5,
      bonusEligible: true,
      allocationPercentage: calculateFurniturePercentage(features.constructionQuality, features.bedrooms)
    });
  }

  // Window Treatments
  if (features.windowTreatments && features.windowTreatments !== 'N/A') {
    components.push({
      name: 'Window Treatments',
      macrsClass: 5,
      bonusEligible: true,
      allocationPercentage: 0.01 // ~1% of basis
    });
  }

  // Ceiling Fans
  if (features.ceilingFans > 0) {
    components.push({
      name: 'Ceiling Fans',
      macrsClass: 5,
      bonusEligible: true,
      allocationPercentage: 0.005 * features.ceilingFans
    });
  }

  // Hot Tub (portable)
  if (features.hotTub) {
    components.push({
      name: 'Hot Tub',
      macrsClass: 5,
      bonusEligible: true,
      allocationPercentage: 0.02
    });
  }

  // --- 7-YEAR PROPERTY ---

  // Cabinetry
  components.push({
    name: 'Cabinetry & Built-in Storage',
    description: 'Kitchen cabinets, bathroom vanities, built-in shelving',
    macrsClass: 7,
    bonusEligible: true,
    allocationPercentage: calculateCabinetryPercentage(features.constructionQuality)
  });

  // --- 15-YEAR PROPERTY (Land Improvements) ---

  // Fencing
  const totalFenceFt = (features.exterior.concreteMasonryWallFt || 0)
    + (features.exterior.chainlinkFenceFt || 0)
    + (features.exterior.woodFenceFt || 0)
    + (features.exterior.wroughtIronFenceFt || 0)
    + (features.exterior.vinylFenceFt || 0);

  if (totalFenceFt > 0) {
    components.push({
      name: 'Fencing',
      macrsClass: 15,
      bonusEligible: true,
      allocationPercentage: calculateFencingPercentage(features.exterior, totalFenceFt)
    });
  }

  // Landscaping
  if (features.exterior.landscaping) {
    components.push({
      name: 'Landscaping & Irrigation',
      macrsClass: 15,
      bonusEligible: true,
      allocationPercentage: 0.02
    });
  }

  // Deck / Patio
  if (features.exterior.deck || features.exterior.patio) {
    components.push({
      name: 'Deck/Patio',
      macrsClass: 15,
      bonusEligible: true,
      allocationPercentage: 0.02
    });
  }

  // Exterior Parking
  if (features.exterior.parkingSpaces > 0) {
    components.push({
      name: 'Exterior Paving & Parking',
      macrsClass: 15,
      bonusEligible: true,
      allocationPercentage: 0.01 * features.exterior.parkingSpaces
    });
  }

  // Swimming Pool
  if (features.exterior.swimmingPool && features.exterior.swimmingPool !== 'N/A') {
    components.push({
      name: 'Swimming Pool',
      macrsClass: 15,
      bonusEligible: true,
      allocationPercentage: 0.03
    });
  }

  // --- 27.5-YEAR (Residual) ---
  // Everything not classified above = building structure
  const reclassifiedTotal = components.reduce((sum, c) => sum + c.allocationPercentage, 0);
  components.push({
    name: 'Building Structure (Residual)',
    macrsClass: 27.5,
    bonusEligible: false,
    allocationPercentage: 1 - reclassifiedTotal
  });

  return components;
}
```

### MACRS Depreciation Tables (Built-In)

```typescript
// GDS 200% Declining Balance, Half-Year Convention
const MACRS_RATES = {
  5: [0.2000, 0.3200, 0.1920, 0.1152, 0.1152, 0.0576],
  7: [0.1429, 0.2449, 0.1749, 0.1249, 0.0893, 0.0892, 0.0893, 0.0446],
  15: [0.0500, 0.0950, 0.0855, 0.0770, 0.0693, 0.0623, 0.0590, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0590, 0.0591, 0.0295],
  27.5: Array.from({length: 28}, (_, i) => {
    if (i === 0) return 0.03636 * (monthFactor); // Mid-month convention
    if (i === 27) return 0.03636 * (1 - monthFactor);
    return 0.03636;
  })
};
```

---

## 11. Form 4562 Mapping {#form-4562-mapping}

### How Cost Segregation Results Map to Form 4562

**Part III — MACRS Depreciation (Don't Include Listed Property)**

| Line | Description | What Goes Here |
|---|---|---|
| Line 19a | 3-year property | Rarely used in residential cost seg |
| Line 19b | 5-year property | Total basis of all 5-year components (appliances, flooring, furniture, etc.) |
| Line 19c | 7-year property | Total basis of all 7-year components (cabinetry, fixtures) |
| Line 19d | 10-year property | Rarely used in residential |
| Line 19e | 15-year property | Total basis of all 15-year land improvements |
| Line 19f | 20-year property | Rarely used in residential |
| Line 19g | 25-year property | Rarely used |
| Line 19h | Residential rental property (27.5-yr) | Residual building structure basis |
| Line 19i | Nonresidential real property (39-yr) | N/A for residential STR |

**Part II — Special Depreciation Allowance (Bonus)**

| Line | Description |
|---|---|
| Line 14 | Special depreciation allowance for qualified property | Total bonus depreciation claimed on all eligible components |

**Column Details for Each Line:**
- Column (a): Classification of property
- Column (b): Month and year placed in service
- Column (c): Basis for depreciation (business/investment use only)
- Column (d): Recovery period
- Column (e): Convention (HY = half-year, MM = mid-month)
- Column (f): Method (200 DB, 150 DB, S/L)
- Column (g): Depreciation deduction

---

## 12. Competitive Pricing & Positioning {#competitive-pricing}

### Market Pricing Tiers

| Tier | Price Range | Players | Methodology |
|---|---|---|---|
| Free Calculators | $0 | KBKG, CSSI, BDO, various | Rough estimates only, not reports |
| Budget DIY | $495-$1,295 | CostSegregation.com, DIY Cost Seg, Cost Seg EZ | AI/software-generated, limited review |
| Mid-Market AI | $1,500-$4,000 | RentalWriteOff, SegTax, Onshore | AI + expert review, faster turnaround |
| Traditional Engineering | $5,000-$15,000 | CSSI, ETS, Madison SPECS | Full engineering study, site inspection |
| Enterprise/Complex | $15,000-$60,000+ | ETS, KBKG Pro Services | Large commercial, multi-site portfolios |

### Competitive Advantages to Build

1. **Speed:** Real-time report generation (minutes vs. weeks)
2. **Data automation:** Auto-populate from county records + Airbnb listing + photos
3. **STR specialization:** Purpose-built for short-term rental owners
4. **Price point:** $200-$500 range undercuts traditional, competes with KBKG
5. **Vision AI:** Photo-based component identification (unique differentiator)
6. **Audit guarantee:** Back the report with professional review + audit support
7. **REP/material participation guidance:** Built-in tax strategy advisory

---

## 13. IRS Code References {#irs-code-references}

### Internal Revenue Code Sections
- **IRC §168** — Accelerated Cost Recovery System (MACRS)
- **IRC §168(b)** — Depreciation methods
- **IRC §168(c)** — Recovery periods
- **IRC §168(e)** — Classification of property
- **IRC §168(g)** — Alternative Depreciation System
- **IRC §168(k)** — Bonus depreciation / additional first-year depreciation
- **IRC §179** — Section 179 expensing election
- **IRC §469** — Passive activity loss limitations
- **IRC §469(c)(7)** — Real Estate Professional status
- **IRC §469(h)** — Material participation tests
- **IRC §481(a)** — Adjustments required by changes in method of accounting

### Treasury Regulations
- **Treas. Reg. 1.469-1T(e)(3)(ii)(A)** — 7-day rental rule (STR exception)
- **Treas. Reg. 1.469-9** — Material participation standards
- **Treas. Reg. 1.168(k)-1** — Bonus depreciation rules

### Revenue Procedures
- **Rev. Proc. 87-56** — Table of Class Lives and Recovery Periods
- **Rev. Proc. 2011-42** — Statistical sampling standards for cost seg
- **Rev. Proc. 2022-14** — Automatic changes in accounting method (Form 3115 procedures)

### IRS Publications
- **Publication 946** — How To Depreciate Property
- **Publication 527** — Residential Rental Property
- **Publication 5653** — Cost Segregation Audit Techniques Guide (2025 edition)

### IRS Forms
- **Form 4562** — Depreciation and Amortization
- **Form 3115** — Application for Change in Accounting Method

---

## 14. STR Furnishings & Personal Property — Complete Classification {#str-furnishings}

### The Key Question: What's Depreciable in a Short-Term Rental?

Short answer: nearly everything the guest touches. STR properties are uniquely advantageous for cost segregation because they contain far more depreciable personal property than traditional long-term rentals.

### Does It Matter If Items Came With the Home or Were Purchased Separately?

**Items included in home purchase price:** Must be separated from the real estate in the purchase price allocation. The furniture/personal property portion is NOT part of the 27.5-year building basis — it's classified as 5-year or 7-year property with its own depreciation schedule. A cost segregation study handles this allocation. The placed-in-service date = the purchase/closing date.

**Items purchased separately after acquisition:** Each item gets its own placed-in-service date (when available for guest use, not when purchased). Depreciation begins independently. These do NOT require a cost segregation study — they're tracked as individual assets on their own depreciation schedules.

**Both receive the same MACRS classification.** The only difference is timing and documentation method.

### Complete STR Furnishings Classification Table

#### 5-Year Property (§168(e)(3)(B)) — MACRS GDS

| Category | Items | Notes |
|---|---|---|
| **Living Room Furniture** | Sofas, sectionals, armchairs, coffee tables, end tables, TV stands, bookshelves | All removable/freestanding furniture |
| **Bedroom Furniture** | Bed frames, mattresses, dressers, nightstands, desks, mirrors (freestanding) | Per bedroom |
| **Dining Furniture** | Dining table, chairs, bar stools, buffet/sideboard | |
| **Electronics** | TVs, streaming devices, sound systems/speakers, gaming consoles, Bluetooth speakers | Per room if applicable |
| **Smart Home Devices** | Smart locks, Ring/Nest doorbell, smart thermostat, smart plugs, voice assistants (Echo/Google Home) | 5-year as computer/equipment |
| **Kitchen Appliances (Major)** | Refrigerator, oven/range, dishwasher, microwave, exhaust hood, garbage disposal | If freestanding; built-in may be 27.5-year |
| **Kitchen Appliances (Small)** | Coffee maker, toaster, blender, Instant Pot, stand mixer, waffle maker | If >$2,500 per item; otherwise de minimis |
| **Area Rugs** | Decorative/area rugs (NOT wall-to-wall carpet — that's also 5-year but classified differently in cost seg) | Removable = personal property |
| **Wall Art & Decor** | Framed artwork, prints, photographs, decorative mirrors, wall hangings, sculptures, vases | 5-year personal property |
| **Lighting (Removable)** | Floor lamps, table lamps, decorative string lights | NOT permanently installed fixtures (those are 27.5-year) |
| **Window Treatments** | Curtains, drapes, blinds, shutters (removable) | |
| **Ceiling Fans** | Removable ceiling fans | Borderline — if hardwired, may argue 27.5-year |
| **Outdoor Furniture** | Patio sets, loungers, outdoor dining, umbrellas, outdoor cushions | |
| **Hot Tub (Portable)** | Freestanding/plug-in hot tubs | If built-in/permanent = 15-year land improvement |
| **Grill/Outdoor Kitchen** | Freestanding grills, smokers, portable outdoor kitchen components | Permanent outdoor kitchen = 15-year |
| **Fire Pit (Portable)** | Freestanding propane or wood fire pits | Permanent/built-in = 15-year |
| **Cleaning Equipment** | Vacuums, robot vacuums, steam cleaners, carpet cleaners | |
| **Washer/Dryer** | Freestanding laundry appliances | |
| **Security Cameras** | Ring cameras, Wyze, Blink (freestanding/wireless) | |
| **Garage Items** | Shelving (freestanding), storage systems, workbench | |

#### 7-Year Property

| Category | Items | Notes |
|---|---|---|
| **Office Furniture** | Desks used as office, office chairs, file cabinets | If property has dedicated office/workspace |
| **Cabinetry** | Kitchen cabinets, bathroom vanities (built-in) | Sometimes argued as 27.5-year; 7-year is defensible position |

#### Expensed Immediately (NOT Depreciated — Operating Supplies)

| Category | Items | Rationale |
|---|---|---|
| **Linens** | Sheets, pillowcases, duvet covers, mattress protectors | Consumable supplies — short useful life, replaced regularly |
| **Towels** | Bath towels, hand towels, washcloths, beach towels | Consumable supplies |
| **Kitchen Consumables** | Utensils, pots/pans (basic sets), dishes, glassware, mugs, wine glasses, cutting boards, cooking tools | Typically <$2,500 per set; expensed as supplies |
| **Cleaning Supplies** | Soaps, detergents, paper products, garbage bags | Current-year expense |
| **Guest Amenities** | Welcome baskets, toiletries, coffee/tea, snacks | Current-year expense |

### De Minimis Safe Harbor Election

**Threshold:** $2,500 per item/invoice line item (for taxpayers without Applicable Financial Statements)

**How to use it:** Any tangible property item costing $2,500 or less can be **expensed immediately** in the year of purchase rather than depreciated. This eliminates the need to track the asset on a depreciation schedule.

**Strategic application for STR owners:**

Items that typically fall UNDER $2,500 (expense immediately):
- Individual pieces of art/decor
- Individual small appliances (coffee makers, toasters)
- Smart home devices ($50-$300 each)
- Individual lamps and lighting
- Smaller area rugs
- Individual pieces of outdoor furniture
- Vacuum cleaners
- Individual kitchen equipment

Items that typically EXCEED $2,500 (must depreciate or use Section 179):
- Bedroom furniture sets
- Sectional sofas / living room sets
- Large TVs (65"+)
- Major appliances (refrigerator, range)
- Patio furniture sets
- Hot tubs

**Election requirement:** Must be made annually on the tax return. Include statement with Form 4562.

### Section 179 vs. Bonus Depreciation for Separate STR Purchases

| Method | Section 179 | Bonus Depreciation (168(k)) |
|---|---|---|
| **Annual limit** | $1,220,000 (2024), indexed | No limit |
| **Phase-out** | Begins at $3,050,000 in total purchases | No phase-out |
| **Rate (current)** | 100% | 100% (post-OBBBA, acquired after 1/19/2025) |
| **State conformity** | Most states conform | Many states DO NOT conform (CA, NY, etc.) |
| **Taxpayer choice** | Can select which assets | All-or-nothing per asset class |
| **Listed property** | Subject to business use % | Subject to business use % |
| **Net income limit** | Cannot create/increase a loss | CAN create a loss |

**CPA Strategy:** In states that don't conform to bonus depreciation (California, New York), use **Section 179 instead** — most states allow 179 without add-back, achieving the same immediate deduction without state tax consequences.

---

## 15. Edge Cases, Exceptions & Disqualifiers {#edge-cases}

### THINGS THAT CAN HURT OR ELIMINATE THE STUDY

#### A. Personal Use Rules — IRC §280A (The Vacation Home Trap)

**The Rule:** A property is a "residence" if the taxpayer uses it for personal purposes for more than the GREATER of (1) 14 days or (2) 10% of the days it is rented at fair rental value.

**Impact on Cost Seg:** If personal use exceeds this threshold, rental deductions (including cost seg depreciation) are LIMITED to rental income. Excess losses CANNOT offset other income, even with material participation or REP status. Cost segregation becomes nearly useless because the accelerated depreciation just gets suspended.

**Critical for STR owners:** Many STR owners use their property personally for a few weeks per year. If the property is rented 200 days, the personal use limit is 20 days (10%). Going to 21 days of personal use triggers §280A limitations.

**The "Augusta Rule" carve-out:** If rented for 14 days or fewer per year, income is tax-free but no rental deductions allowed. Not relevant for active STR operators.

**For our tool:** MUST ask about personal use days and calculate whether §280A applies. This is a hard disqualifier that many competitors don't flag.

#### B. At-Risk Rules — IRC §465

**The Rule:** Deductions are limited to the amount the taxpayer has "at risk" — generally their cash investment plus recourse debt.

**The gotcha:** Non-recourse financing does NOT increase at-risk basis, except for "qualified nonrecourse financing" secured solely by real property from qualified lenders.

**Example:** Investor puts 20% down ($100K) on a $500K property with non-recourse financing. Cost seg generates $140K in deductions. Only $100K is allowed — $40K is suspended until at-risk basis increases.

**For our tool:** Ask about financing type. Flag if non-recourse debt could limit deductions.

#### C. Excess Business Loss Limitation — IRC §461(l)

**Current thresholds (extended through 2028):**
- Single: $305,000 (2024, indexed annually)
- MFJ: $610,000 (2024, indexed annually)

**How it works:** Even if all passive activity / material participation tests are met, total business losses exceeding this cap are deferred as NOLs (subject to 80% of taxable income limitation in future years).

**Cost seg impact:** A $500K cost seg deduction for a single filer can only offset $305K of income in year 1. The remaining $195K carries forward.

**For our tool:** Calculate whether the estimated deduction exceeds the §461(l) cap based on filing status. Show the actual year-1 benefit vs. the theoretical full deduction.

#### D. Depreciation Recapture on Sale — IRC §1245 and §1250

**The delayed tax bill most investors don't understand:**

| Asset Type | Recapture Rule | Tax Rate |
|---|---|---|
| 5-year, 7-year personal property | IRC §1245 — ALL depreciation recaptured as ordinary income | Up to 37% federal |
| 15-year land improvements | IRC §1250 — Unrecaptured §1250 gain | Up to 25% federal |
| 27.5-year building | IRC §1250 — Unrecaptured §1250 gain | Up to 25% federal |

**The math reality:** Cost seg reclassifies components FROM 27.5-year (25% max recapture) TO 5/7-year (37% ordinary recapture). The immediate deduction saves at 37%, but recapture on sale also costs 37%. **The net benefit is the time value of money** — getting the deduction now vs. paying later.

**1031 Exchange escape:** A like-kind exchange defers ALL recapture (both §1245 and §1250). Investors planning to 1031 exchange get the full cost seg benefit with no recapture tax on the exchange.

**For our tool:** MUST show recapture projections. Show scenarios: sell outright vs. 1031 exchange. Include time-value-of-money calculation.

#### E. State Tax Non-Conformity

**States that do NOT conform to federal bonus depreciation (major ones):**

| State | Bonus Dep. | §179 Limit | Impact |
|---|---|---|---|
| **California** | NOT allowed (100% add-back) | $25,000 max | Federal saves $X, CA adds back ~13.3% × bonus amount |
| **New York** | NOT allowed | Higher limit | Requires IT-399 adjustment |
| **Massachusetts** | NOT allowed | Varies | Add-back required |
| **Connecticut** | NOT allowed | Varies | Add-back required |
| **New Jersey** | Partially conforms | Varies | Check current rules |
| **Pennsylvania** | NOT allowed | Varies | Add-back required |

**For our tool:** Ask for state of residence. Calculate BOTH federal and state impact. In non-conforming states, show the net benefit (federal savings minus state add-back tax). Recommend Section 179 as alternative where states conform to 179 but not bonus.

#### F. Related Party Acquisitions — IRC §267 / §168(k)(2)(E)(ii)

**Bonus depreciation is DISALLOWED on property acquired from a related party.** Related parties include family members, >50% commonly owned entities, etc.

Standard MACRS still applies (5/7/15-year lives) — just no bonus. This significantly reduces the first-year benefit.

**For our tool:** Ask if property was acquired from a related party. Adjust calculation to remove bonus if so.

#### G. Mid-Quarter Convention Trap

**Trigger:** If more than 40% of all depreciable property placed in service during the tax year is placed in service in the last 3 months (Q4), the mid-quarter convention applies INSTEAD of the half-year convention.

**Impact:** First-year depreciation drops significantly for assets placed in Q4. For a 5-year property placed in service in Q4 under mid-quarter: only 5% first-year rate vs. 20% under half-year.

**Cost seg relevance:** Most cost seg studies are done late in the year. If the property was placed in service in Q4 AND represents >40% of the year's depreciable property, mid-quarter convention reduces the benefit.

**For our tool:** Calculate whether mid-quarter applies based on placed-in-service date and other assets.

#### H. Net Investment Income Tax (NIIT) — 3.8% Surtax

**Key finding:** Cost seg depreciation reduces taxable income but does NOT reduce net investment income for NIIT purposes UNLESS the taxpayer has REP status.

**With REP:** Rental income reclassified as active business income → escapes NIIT entirely.
**Without REP:** Even with 7-day STR exception + material participation, NIIT may still apply to rental income (this is a contested area — some CPAs argue the 7-day exception converts income to non-investment income for NIIT purposes).

**For our tool:** Flag NIIT exposure for high-income users. Note REP status as the clean path to NIIT avoidance.

### THINGS THAT CAN BENEFIT THE STUDY

#### I. Lookback Studies — Section 481(a) Catch-Up

Properties held for years without cost segregation can file Form 3115 to retroactively adopt cost seg and capture ALL missed depreciation from prior years in a single catch-up deduction. No amended returns required.

**Example:** Property held 7 years, never had cost seg. Cost seg identifies $200K in 5/7/15-year property. The §481(a) adjustment captures 7 years of missed accelerated depreciation in a single year.

**For our tool:** This is a MASSIVE value prop for existing owners. Calculate the lookback benefit. Show: "You've been overpaying taxes by approximately $X per year for Y years. Total catch-up available: $Z."

#### J. Capital Improvements & Renovations

Improvements placed in service AFTER the original purchase can be cost-segregated independently. A $50K kitchen renovation can be separated into 5-year (appliances), 7-year (cabinetry), and 27.5-year (structural) components.

**Qualified Improvement Property (QIP):** Interior improvements to non-residential buildings get 15-year life + bonus eligibility. For residential, improvements are classified by their specific nature (appliances = 5-year, etc.).

**For our tool:** Add an optional "Have you made major improvements?" section. Capture improvement details and dates for separate cost seg analysis.

#### K. 1031 Exchange Interaction

Properties acquired via like-kind exchange can be cost-segregated, but only the **excess basis** (cash added above carryover basis) qualifies for bonus depreciation. The carryover basis uses standard MACRS without bonus.

**Recapture deferral:** A 1031 exchange defers ALL depreciation recapture, making cost seg + future 1031 the optimal strategy (accelerate deductions now, never pay recapture if you keep exchanging).

**For our tool:** Ask if property was acquired via 1031. If so, separate carryover basis from excess basis in the calculation.

#### L. Partial Asset Disposition — Treas. Reg. 1.168(i)-8

When a component identified in a cost seg study is replaced before its recovery period ends, a **partial disposition election** allows the remaining undepreciated basis to be written off immediately in the year of replacement.

**Example:** Cost seg identified $30K in HVAC (7-year). After 3 years, HVAC is replaced. Remaining basis ~$10K can be deducted entirely in year of replacement, plus the new HVAC gets its own 5/7-year depreciation.

**For our tool:** Flag this benefit for properties with known upcoming replacements or recent renovations.

---

## 16. IRS-Recognized Cost Allocation Methodologies {#allocation-methodologies}

### Ranked by Defensibility (Highest to Lowest)

#### 1. Detailed Cost Approach (Engineering-Based)
Uses actual construction cost records (invoices, contracts, change orders) to allocate costs to specific components. The "gold standard" — highest IRS defensibility. Requires access to construction documentation.

**Software implementation:** Database of construction costs linked to component mapping. "Squeeze" algorithm adjusts all allocations proportionally to reconcile to total purchase price.

#### 2. Residual Estimation Method
Start with total building cost, allocate specific known costs to identified personal property and land improvements, and the residual = building structure (27.5-year).

**This is what most software tools use** (including CostSegregation.com). Defensible when supported by industry cost databases and property-specific analysis.

#### 3. Replacement Cost New Less Depreciation (RCNLD)

Step-by-step:
1. Determine the current replacement cost of each component using cost databases (RSMeans, Marshall & Swift)
2. Apply physical depreciation based on age and condition
3. The result = the component's contribution to the property's total value
4. Allocate the purchase price proportionally

**Cost databases for our tool:**
- **RSMeans (Gordian):** Industry standard construction cost data. API available. Covers labor + materials by component, by region.
- **Marshall & Swift (CoreLogic):** Replacement cost calculator. Used by appraisers and cost seg firms.
- **National Construction Estimator:** Published annually, covers residential and commercial.

#### 4. Survey/Interview Method
Interviews with builders, contractors, or property managers to estimate component costs. Supplementary method — strengthens other approaches.

#### 5. Rule-of-Thumb / Template Approaches
Using standard percentages by property type (e.g., "all single-family homes are 28% personal property"). **IRS explicitly flags this as deficient.** Our tool must NOT rely solely on template percentages — they must be adjusted by property-specific features.

### Audit-Safe Approach for Our AI Tool

Use a **hybrid Residual Estimation + RCNLD approach:**
1. Pull property features from APIs and photos
2. Look up regional construction costs from cost databases for each identified component
3. Apply depreciation for age/condition
4. Allocate purchase price proportionally based on RCNLD values
5. Residual = building structure
6. Document the methodology clearly in the report

This is defensible because it's property-specific (not template), uses recognized cost data, and follows IRS-accepted residual estimation methodology.

---

## 17. Depreciation Calculation Deep-Dive {#depreciation-deep-dive}

### Convention Rules (Critical for Accuracy)

| Convention | When It Applies | Impact |
|---|---|---|
| **Half-Year** | Default for all personal property (5/7/15-year) | First year: half of annual depreciation. Last year: remaining half. |
| **Mid-Month** | All real property (27.5-year, 39-year) | First year: depreciation from month placed in service through December. Last year: remaining. |
| **Mid-Quarter** | Triggered when >40% of personal property placed in service in Q4 | Each quarter has different first-year percentage. Q4 placements get much less. |

### Mid-Quarter Convention Trigger Check

```typescript
function checkMidQuarterConvention(assetsPlacedInService: Asset[]): boolean {
  const totalBasis = assetsPlacedInService.reduce((sum, a) => sum + a.basis, 0);
  const q4Basis = assetsPlacedInService
    .filter(a => getQuarter(a.placedInServiceDate) === 4)
    .reduce((sum, a) => sum + a.basis, 0);

  return (q4Basis / totalBasis) > 0.40; // If >40% in Q4, mid-quarter applies
}

// Mid-quarter first-year rates for 5-year property:
const MID_QUARTER_5YR = {
  Q1: 0.3500,  // Placed in service in Q1
  Q2: 0.2500,  // Placed in service in Q2
  Q3: 0.1500,  // Placed in service in Q3
  Q4: 0.0500   // Placed in service in Q4 — drastically reduced!
};
```

### ADS (Alternative Depreciation System) Recovery Periods

ADS is required for:
- Property used predominantly outside the U.S.
- Tax-exempt use property
- Property financed with tax-exempt bonds
- Electing real property trades or businesses (to qualify for business interest deduction under §163(j))

| Property Type | GDS Period | ADS Period |
|---|---|---|
| 5-year personal property | 5 years | 9 or 12 years |
| 7-year property | 7 years | 12 years |
| 15-year land improvements | 15 years | 20 years |
| Residential rental building | 27.5 years | 30 years |

**For STR owners:** ADS is generally NOT required unless the property is in an electing real property trade or business under §163(j). Our tool should ask but default to GDS.

### Bonus Depreciation Interaction with MACRS

```
Year 1 Depreciation = Bonus Amount + Regular MACRS on Remaining Basis

Example (5-year property, $100,000 basis, 100% bonus):
  Bonus: $100,000 × 100% = $100,000
  Remaining basis: $0
  Total Year 1: $100,000

Example (5-year property, $100,000 basis, 60% bonus - 2024 rate for pre-OBBBA):
  Bonus: $100,000 × 60% = $60,000
  Remaining basis: $40,000
  Regular MACRS Year 1 (half-year): $40,000 × 20% = $8,000
  Total Year 1: $68,000
```

---

## Updated IRS Code References {#updated-references}

### Additional Code Sections (from edge case research)
- **IRC §280A** — Disallowance of certain expenses in connection with business use of home / vacation properties
- **IRC §465** — At-risk limitations
- **IRC §461(l)** — Excess business loss limitation
- **IRC §1245** — Gain from dispositions of certain depreciable property (ordinary income recapture)
- **IRC §1250** — Gain from dispositions of certain depreciable realty (unrecaptured gain)
- **IRC §267** — Related party transaction rules
- **IRC §1031** — Like-kind exchange rules
- **IRC §163(j)** — Business interest limitation (triggers ADS requirement)
- **IRC §179** — Section 179 expensing election

### Additional Treasury Regulations
- **Treas. Reg. 1.168(i)-8** — Partial disposition of MACRS property
- **Treas. Reg. 1.263(a)-1(f)** — De minimis safe harbor for tangible property
- **Treas. Reg. 1.168(d)-1** — Applicable conventions (half-year, mid-quarter, mid-month)

---

> **Document Version:** 2.0
> **Last Updated:** March 14, 2026
> **Data Sources:** IRS.gov publications, CostSegregation.com reverse engineering session, industry research, extensive web research on edge cases, IRS audit techniques, and CPA-level considerations
> **Next Steps:** Feed this document into Claude Code as context for backend calculation engine development
