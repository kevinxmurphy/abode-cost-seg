# 07 — Recapture-on-Sale Impact Preview

**Priority:** P2 — Planning value
**Effort:** Medium (3 hrs)
**Files:** new `lib/recaptureCalculator.js`, `components/quiz/QuizResults.js`, `lib/reportAssembler.js`

---

## The CPA's Take

> "Every client who does a cost seg asks me: 'what happens when I sell?' They
> need to understand that accelerating depreciation means more recapture.
> Right now your tool shows the upside without the eventual downside. A simple
> recapture preview — even just a ballpark — would set the right expectations
> and build trust. It also positions you as more sophisticated than competitors
> who only talk about year-one savings."

---

## Product Spec

### Results Page — "What if I sell?" Expandable Section

Collapsed by default. When expanded:

```
┌─────────────────────────────────────────────────────────┐
│  📊 Sale Impact Preview                                │
│                                                         │
│  If you sell after 5 years at the purchase price:       │
│                                                         │
│  Without cost seg:                                      │
│    Total depreciation claimed:    $72,727                │
│    §1250 recapture (25% rate):    $18,182                │
│    Net tax benefit over 5 years:  $70,363                │
│                                                         │
│  With cost seg:                                         │
│    Total depreciation claimed:    $263,040               │
│    §1245 recapture (ordinary):    $52,608 *              │
│    §1250 recapture (25% rate):    $52,608                │
│    Net tax benefit over 5 years:  $136,528               │
│                                                         │
│  * §1245 recapture on 5yr/7yr/15yr property is taxed    │
│    as ordinary income. §1250 recapture on building is   │
│    taxed at max 25%.                                     │
│                                                         │
│  ⓘ This is a simplified preview. Actual recapture       │
│    depends on sale price, holding period, and tax        │
│    situation. Consult your CPA before selling.           │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Spec

### New file: `lib/recaptureCalculator.js`

```js
/**
 * Calculates simplified recapture impact at various holding periods.
 *
 * §1245 recapture: personal property depreciation recaptured as ordinary income
 * §1250 recapture: building depreciation recaptured at max 25% (unrecaptured §1250 gain)
 *
 * Simplifying assumptions:
 * - Sale at purchase price (no gain/loss on property itself)
 * - All depreciation is recaptured (conservative assumption)
 * - Federal rates only
 */
export function calculateRecapturePreview(studyData, holdingYears = 5) {
  const { depreciation, allocation, savings, basis } = studyData;
  const bracket = savings.bracket / 100;
  const schedule = depreciation.yearByYearSchedule;

  // Sum depreciation claimed through holding period
  let totalFiveYr = 0, totalSevenYr = 0, totalFifteenYr = 0, totalBuilding = 0;
  for (let i = 0; i < holdingYears && i < schedule.length; i++) {
    totalFiveYr += schedule[i].fiveYr;
    totalSevenYr += schedule[i].sevenYr;
    totalFifteenYr += schedule[i].fifteenYr;
    totalBuilding += schedule[i].building;
  }

  const totalPersonalProperty = totalFiveYr + totalSevenYr + totalFifteenYr;
  const totalAll = totalPersonalProperty + totalBuilding;

  // Tax benefit from depreciation over holding period
  const taxBenefitFromDeductions = Math.round(totalAll * bracket);

  // Recapture taxes on sale
  const section1245Recapture = Math.round(totalPersonalProperty * bracket); // ordinary rate
  const section1250Recapture = Math.round(totalBuilding * 0.25); // max 25% rate
  const totalRecaptureTax = section1245Recapture + section1250Recapture;

  // Net benefit = tax saved from deductions - recapture tax on sale
  const netBenefit = taxBenefitFromDeductions - totalRecaptureTax;

  // Compare to straight-line only
  const annualSL = basis.adjustedBasis / 27.5;
  const totalSLDeductions = Math.round(annualSL * holdingYears);
  const slTaxBenefit = Math.round(totalSLDeductions * bracket);
  const slRecapture = Math.round(totalSLDeductions * 0.25);
  const slNetBenefit = slTaxBenefit - slRecapture;

  return {
    holdingYears,
    withCostSeg: {
      totalDepreciation: totalAll,
      section1245Amount: totalPersonalProperty,
      section1250Amount: totalBuilding,
      taxBenefitFromDeductions,
      section1245Recapture,
      section1250Recapture,
      totalRecaptureTax,
      netBenefit,
    },
    withoutCostSeg: {
      totalDepreciation: totalSLDeductions,
      section1250Amount: totalSLDeductions,
      taxBenefit: slTaxBenefit,
      recaptureTax: slRecapture,
      netBenefit: slNetBenefit,
    },
    advantage: netBenefit - slNetBenefit,
  };
}
```

---

## Key Nuance: Time Value of Money

The recapture preview should note that cost seg creates a **timing** advantage
even if total lifetime tax is similar. Getting $80K in deductions in year 1
(invested or deployed) vs. spreading $80K over 27.5 years has enormous time
value. Consider adding a simple note:

> "Cost segregation accelerates when you claim deductions, creating significant
> time value. A dollar saved today is worth more than a dollar saved in 10 years."

---

## Acceptance Criteria

- [ ] Recapture calculator produces correct §1245 vs §1250 split
- [ ] Results shown at 5-year and 10-year holding periods
- [ ] Comparison to straight-line-only scenario included
- [ ] Net advantage calculation accounts for rate differential (ordinary vs 25%)
- [ ] Disclaimer that this is simplified (doesn't account for gain on sale, 1031, etc.)
- [ ] Section collapsed by default (doesn't scare users)
- [ ] PDF report includes recapture awareness section (brief)
