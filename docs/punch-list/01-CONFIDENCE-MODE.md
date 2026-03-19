# 01 — Confidence Mode Toggle (Conservative vs Aggressive)

**Priority:** P1 — Revenue unlock
**Effort:** Medium (4 hrs)
**Files:** `lib/reportEngine.js`, `lib/estimateEngine.js`, `components/quiz/QuizResults.js`, `components/quiz/RunningEstimate.js`

---

## The CPA's Take

> "Your base allocations are on the conservative end of the professional range.
> That's defensible and safe — but some of my clients are more risk-tolerant.
> They've got good CPAs, they document everything, and they want to maximize
> year-one deductions. There's legitimate room to push harder within IRS bounds."

The current base allocations (e.g., SFR Furnished at 28.5% total reclass) sit
at the **low-to-mid range** of what professional studies produce. Industry data
shows 25-40% is common for residential STRs. The tool can safely offer a
higher-confidence tier without crossing into audit-bait territory.

---

## Product Spec

### User-Facing Name: "Study Approach"

Two options presented after the quiz, before results:

| Mode | Label | Description |
|------|-------|-------------|
| **Standard** (default) | "IRS-Conservative" | Current behavior. Lower reclassification %. Safest under audit. Best for risk-averse owners or those without a dedicated CPA. |
| **Maximized** | "Maximize Deductions" | Higher reclassification % within IRS-defensible range. Matches what top-tier engineering firms produce. Best for owners with experienced CPAs who want maximum year-one savings. |

**Important UX notes:**
- Default is ALWAYS Standard. User must actively opt in to Maximized.
- Maximized mode should show a brief disclaimer: "These allocations are within IRS-defensible ranges and supported by the same legal authorities. Higher reclassification percentages are common in professional engineering-based studies. Consult your CPA."
- Both modes use the same legal citations, same component list, same MACRS tables. Only the allocation percentages change.

---

## Technical Spec

### New: `AGGRESSIVE_ALLOCATIONS` table in `reportEngine.js`

```js
export const AGGRESSIVE_ALLOCATIONS = {
  "sfr-furnished": {
    fiveYear: 24,       // was 18 — pushes toward top of 10-25% acceptable range
    sevenYear: 1.0,     // was 0.5
    fifteenYear: 13,    // was 10 — more outdoor/site recognition
    building: 62,       // was 71.5
  },
  "sfr-unfurnished": {
    fiveYear: 17,       // was 12
    sevenYear: 1.0,     // was 0.5
    fifteenYear: 13,    // was 10
    building: 69,       // was 77.5
  },
  "condo-townhouse": {
    fiveYear: 20,       // was 15
    sevenYear: 1.0,     // was 0.5
    fifteenYear: 7,     // was 5 — condos have less land improvement but still some
    building: 72,       // was 79.5
  },
  "multi-unit": {
    fiveYear: 25,       // was 19 — more units = more personal property per unit
    sevenYear: 1.0,     // was 0.5
    fifteenYear: 14,    // was 11
    building: 60,       // was 69.5
  },
};
```

**Rationale for each bump:**
- **5-year increase (4-6 pts):** Furnished STRs have significant personal property. Professional studies routinely allocate 20-28% to 5-year for well-appointed STRs. The increase recognizes more kitchen value, higher-end finishes, and more furnishings.
- **7-year increase (0.5 pts):** Marginal — most residential has minimal 7-year. This is a rounding adjustment.
- **15-year increase (2-3 pts):** Recognizes that many STRs have significant outdoor amenities (pools, landscaping, outdoor living) that conservative mode underweights.
- **Total reclass in Maximized mode:** 38% (SFR furnished), 31% (unfurnished), 28% (condo), 40% (multi). All within the 45% hard cap guardrail.

### Guardrail adjustment for Maximized mode

The guardrail warning thresholds should shift up slightly:

```js
export const AGGRESSIVE_GUARDRAILS = {
  totalReclass: { acceptable: [25, 42], warning: 42, hardCap: 50 },
  fiveYear:     { acceptable: [15, 30], warning: 30, hardCap: 35 },
  fifteenYear:  { acceptable: [7, 20],  warning: 22, hardCap: 25 },
  sevenYear:    { acceptable: [0, 3],   warning: 4,  hardCap: 6 },
};
```

### `generateStudy()` changes

Add `confidenceMode` parameter (default `"standard"`):

```js
export function generateStudy(inputs) {
  const {
    confidenceMode = "standard", // "standard" | "maximized"
    ...rest
  } = inputs;

  const allocTable = confidenceMode === "maximized"
    ? AGGRESSIVE_ALLOCATIONS
    : BASE_ALLOCATIONS;

  const guardrails = confidenceMode === "maximized"
    ? AGGRESSIVE_GUARDRAILS
    : RECLASSIFICATION_GUARDRAILS;

  // ... rest of function uses allocTable and guardrails
}
```

### `calculateEstimate()` changes

Add optional `confidenceMode` parameter. In maximized mode, `getReclassPercent` returns higher base rates:

```js
function getReclassPercent(propertyType, yearBuilt, confidenceMode = "standard") {
  // ... existing logic for base
  if (confidenceMode === "maximized") {
    base += 0.06; // 6 percentage points higher
  }
  return Math.max(0.12, Math.min(base, confidenceMode === "maximized" ? 0.42 : 0.35));
}
```

### Report & PDF changes

- Study metadata should include `confidenceMode` field
- Executive summary should note the approach used
- No change to legal citations (same authorities support both tiers)

---

## Acceptance Criteria

- [ ] User can toggle between Standard and Maximized before seeing results
- [ ] Default is always Standard
- [ ] Maximized shows appropriate disclaimer
- [ ] RunningEstimate widget updates live when mode toggles
- [ ] Guardrails still prevent unreasonable results in Maximized mode
- [ ] PDF report includes study approach notation
- [ ] Both modes produce reconciled output (allocated = adjusted basis)
- [ ] No change to MACRS tables, bonus rates, or legal citations

---

## Revenue Impact

If 30% of users opt into Maximized mode and see 25-40% higher first-year
deductions, this is a strong conversion driver. The "what if" comparison
between modes could be shown as a teaser before purchase.
