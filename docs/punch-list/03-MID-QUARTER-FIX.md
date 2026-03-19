# 03 — Mid-Quarter Convention Rate Tables

**Priority:** P0 — Correctness
**Effort:** Small (1 hr)
**Files:** `lib/reportEngine.js`

---

## The CPA's Take

> "You correctly detect mid-quarter convention for Q4 placements, but you're
> still applying half-year rate tables. That overstates the non-bonus MACRS
> deduction in year 1 for October-December PIS dates. With 100% bonus post-
> OBBBA this is moot — but for 2023 and 2024 placements (60-80% bonus),
> the remaining 20-40% runs through regular MACRS, and you need the right
> first-year rate."

---

## The Bug

`reportEngine.js:1222-1224` calls `buildClassSchedule()` with `MACRS_TABLES.fiveYear`,
etc. — these are **half-year convention** tables. When `checkMidQuarter()` returns
true, the year-1 rate should be lower (property treated as placed in service at
the midpoint of Q4 = Nov 15, getting only 1.5 months of depreciation in year 1
instead of 6 months).

---

## Technical Spec

### Add mid-quarter rate tables to `MACRS_TABLES`

Per IRS Pub 946, Table A-2 (mid-quarter, Q4):

```js
export const MACRS_TABLES_MID_QUARTER_Q4 = {
  fiveYear:  [5.00, 38.00, 22.80, 13.68, 10.94, 9.58],
  sevenYear: [3.57, 27.55, 19.68, 14.06, 10.04, 7.18, 7.18, 10.74],
  fifteenYear: [
    1.25, 9.88, 8.89, 8.00, 7.20, 6.48, 5.90, 5.90,
    5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 4.46,
  ],
};
```

### Modify `generateStudy()` to use correct table

```js
const useMidQuarter = checkMidQuarter(pisDate);
const convention = useMidQuarter ? "mid-quarter" : "half-year";

const fiveYearTable = useMidQuarter
  ? MACRS_TABLES_MID_QUARTER_Q4.fiveYear
  : MACRS_TABLES.fiveYear;
// ... same for 7-year and 15-year
```

### Impact Analysis

- **Post-OBBBA (100% bonus):** Zero impact — bonus takes 100%, regular schedule = $0
- **2024 PIS (60% bonus), Q4:** The remaining 40% uses mid-quarter rates.
  On a $100K 5-year allocation: half-year gives $8,000 year-1 regular MACRS;
  mid-quarter Q4 gives $2,000. That's a $6,000 overstatement per $100K.
- **2023 PIS (80% bonus), Q4:** 20% remainder affected. Smaller but still wrong.

---

## Acceptance Criteria

- [ ] Mid-quarter Q4 tables added matching IRS Pub 946 Table A-2
- [ ] `generateStudy()` selects correct table based on convention
- [ ] Year-by-year schedule reflects correct rates for Q4 PIS dates
- [ ] Half-year convention properties unaffected
- [ ] 100% bonus properties unaffected (bonus = full amount, regular = $0)
- [ ] `buildClassSchedule()` accepts the appropriate rate table parameter

---

## Note on Q1-Q3 Mid-Quarter

Technically, mid-quarter can apply to ANY quarter if >40% of all property placed
in service that year falls in Q4. For a single-property study, only Q4 PIS
triggers this. If Abode later supports multi-property portfolios, Q1-Q3 mid-quarter
tables would also be needed. For now, Q4-only is correct.
