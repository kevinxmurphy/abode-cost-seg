# 02 — Land Value Override for High-COL Markets

**Priority:** P1 — High user impact, trust signal
**Effort:** Small (2 hrs)
**Files:** `lib/estimateEngine.js`, `lib/reportEngine.js`, `lib/landSplit.js`, `components/quiz/QuizShell.js`, `components/quiz/QuizResults.js`

---

## The CPA's Take

> "In Hawaii, coastal California, Jackson Hole — the land is 50-70% of purchase
> price. Your state/market defaults are good approximations, but a client who
> bought a $1.2M Maui condo where the county shows 68% land should be able to
> use that actual number. Overstating depreciable basis is an audit risk. And
> understating it leaves money on the table in low-land markets. Give the user
> the choice — show them what you calculated, but let them adjust."

---

## Product Spec

### When this triggers

After property address confirmation, if the property is in a **high-COL market**
(defined as any market where the default land ratio exceeds 30%), show a
**Land Value Verification** card.

For ALL properties, show the land/improvement split on the results page with
an edit option.

### UX Flow

**On Results Page — Land Value Card:**

```
┌─────────────────────────────────────────────────┐
│  Land / Improvement Split                       │
│                                                 │
│  Purchase Price:          $850,000               │
│  Land Value:              $340,000  (40%)   [✏️] │
│  Depreciable Basis:       $510,000               │
│                                                 │
│  Source: Palm Springs, CA market average          │
│                                                 │
│  ⓘ This split affects your depreciable basis.   │
│    Use your county tax assessor ratio, a recent  │
│    appraisal, or our market estimate.            │
└─────────────────────────────────────────────────┘
```

**On Edit (pencil icon click):**

```
┌─────────────────────────────────────────────────┐
│  Adjust Land Value                              │
│                                                 │
│  ○ Use Abode estimate (40% — Palm Springs avg)  │
│  ○ Use county assessor ratio                    │
│     Land assessed: $____  Improvement: $____    │
│  ○ Enter custom land value                      │
│     Land value: $________                       │
│                                                 │
│  ⚠ Land ratios above 60% or below 10% are      │
│    unusual. Double-check with your CPA.         │
│                                                 │
│  [Update Estimate]                              │
└─────────────────────────────────────────────────┘
```

### High-COL Market Flag

Properties in these markets get an **amber info banner** on first results load:

> "Properties in [Palm Springs, CA] typically have higher land values (40% avg).
> This reduces your depreciable basis. If you have a recent appraisal or county
> assessment showing a different split, you can adjust this for a more accurate
> estimate."

**Trigger threshold:** `landRatio >= 0.30` from any source.

---

## Technical Spec

### `estimateEngine.js` changes

Remove the hard clamp at 45% — replace with a soft warning:

```js
// BEFORE (line 81):
landRatio = Math.max(0.08, Math.min(landRatio, 0.45));

// AFTER:
landRatio = Math.max(0.05, Math.min(landRatio, 0.75));
// Warning flag instead of clamp
const landRatioWarning = landRatio > 0.55
  ? "high" : landRatio < 0.10 ? "low" : null;
```

Return `landRatioWarning` in the estimate output so the UI can display it.

### New field: `answers.landValueOverride`

If set, this takes precedence over all other land value sources:

```js
// In calculateEstimate():
if (answers.landValueOverride && answers.landValueOverride > 0) {
  landRatio = answers.landValueOverride / purchasePrice;
  landRatioSource = "user";
}
```

### `generateStudy()` changes

Accept optional `landValueSource` field in inputs to track provenance:

```js
landValueSource: "county" | "market-estimate" | "user-override" | "appraisal"
```

Include in study metadata and report narrative.

### Report narrative adjustment

When `landValueSource === "user-override"`, add to the land value section:

> "The land value used in this study ($X, representing Y% of the purchase price)
> was provided by the property owner. This value should be supportable by
> independent evidence such as a county tax assessment, comparable land sales,
> or a qualified appraisal."

### `landSplit.js` changes

Add a new export for high-COL detection:

```js
export function isHighCOLMarket(stateCode, city = "") {
  const ratio = getLandRatioForState(stateCode, city);
  return ratio >= 0.30;
}
```

---

## Acceptance Criteria

- [ ] Results page shows land/improvement split with source label
- [ ] Pencil icon opens edit modal with three options
- [ ] User-entered land value persists and recalculates all downstream numbers
- [ ] High-COL markets (≥30% land) show amber info banner
- [ ] Extreme ratios (>55% or <10%) show warning text
- [ ] Estimate engine no longer hard-clamps at 45%
- [ ] Report PDF notes land value source (estimate vs user-provided)
- [ ] Study reconciliation still passes after override

---

## Why This Matters

A $1M property in Lahaina, HI with the tool's 72% land ratio has a $280K
depreciable basis. If the actual county ratio is 65%, that's $350K — a $70K
difference in basis, which at 28% reclass and 100% bonus = **$19,600 more
in first-year deductions**. The user MUST have this control.

Conversely, a property in a low-land market (rural Tennessee at 17%) where the
county shows only 12% land gets a higher depreciable basis and bigger deductions.
Letting users input the real number helps in both directions.
