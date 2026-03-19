# 04 — 481(a) Catch-Up: Include Bonus in PIS Year

**Priority:** P1 — Bigger deductions for catch-up users
**Effort:** Small (1 hr)
**Files:** `lib/reportEngine.js`

---

## The CPA's Take

> "Your catch-up calculation is conservative — you only compare straight-line
> 27.5yr vs. segregated regular MACRS. But under Rev. Proc. 2022-14 (formerly
> 2015-13), the 481(a) adjustment should reflect what the taxpayer SHOULD have
> claimed under the new method, including bonus depreciation that was available
> in the placed-in-service year. If a client put a property in service in 2021
> (100% bonus era) and never did a cost seg, the catch-up should include the
> bonus they missed. This is where the BIGGEST deductions come from for
> catch-up clients — we're talking potentially 6-figure adjustments."

---

## Current Behavior

`calculateCatchUp()` at `reportEngine.js:1049-1114`:
- Old method: 27.5yr SL on entire depreciable basis
- New method: MACRS rates for each class (5yr, 7yr, 15yr, 27.5yr) — **no bonus**
- Adjustment = new total - old total

## Proposed Behavior

Add bonus depreciation to the **year 1 only** of the "new method" calculation:

```js
function calculateCatchUp(depreciableBasis, allocPercents, monthPlaced, yearPlaced, currentYear, acquisitionDate) {
  // ... existing setup ...

  // Determine what bonus rate WOULD HAVE applied in the PIS year
  const catchUpBonusRate = getBonusRate(
    new Date(yearPlaced, monthPlaced - 1, 15),
    acquisitionDate || new Date(yearPlaced, monthPlaced - 1, 15)
  );

  for (let i = 0; i < yearsHeld; i++) {
    const yr = yearPlaced + i;

    // Year 1 includes bonus on the reclassified property
    const fiveBonus = i === 0 ? Math.round(fiveAmt * catchUpBonusRate) : 0;
    const sevenBonus = i === 0 ? Math.round(sevenAmt * catchUpBonusRate) : 0;
    const fifteenBonus = i === 0 ? Math.round(fifteenAmt * catchUpBonusRate) : 0;

    const fiveRemaining = fiveAmt - (i === 0 ? fiveBonus : 0);
    const sevenRemaining = sevenAmt - (i === 0 ? sevenBonus : 0);
    const fifteenRemaining = fifteenAmt - (i === 0 ? fifteenBonus : 0);

    const fiveYr = fiveBonus + (i < fiveSched.length ? Math.round(fiveRemaining * fiveSched[i] / 100) : 0);
    const sevenYr = sevenBonus + (i < sevenSched.length ? Math.round(sevenRemaining * sevenSched[i] / 100) : 0);
    const fifteenYr = fifteenBonus + (i < fifteenSched.length ? Math.round(fifteenRemaining * fifteenSched[i] / 100) : 0);
    // building schedule unchanged (no bonus on 27.5yr property)
    // ...
  }
}
```

### Impact Example

**Property placed in service July 2021, catch-up filed in 2026:**

| | Old Method (27.5yr SL) | New Method (no bonus) | New Method (with bonus) |
|---|---|---|---|
| $800K depreciable basis, 28% reclass | | | |
| Year 1 (2021) old | $14,545 | | |
| Year 1 (2021) new w/o bonus | | $39,200 | |
| Year 1 (2021) new w/ bonus | | | $237,600 |
| 5-year total (2021-2025) | $72,727 | $173,600 | $263,040 |
| **481(a) adjustment** | — | **$100,873** | **$190,313** |

The bonus-inclusive catch-up is **nearly 2x larger**. This is the correct
treatment and matches what top-tier CPA firms compute.

---

## Confidence Mode Interaction

- **Standard mode:** Include bonus in catch-up (this is the correct computation, not aggressive)
- **Maximized mode:** Same treatment (bonus inclusion is a matter of correctness, not aggressiveness)

Both modes should include bonus. The conservative version without bonus can be
shown as an alternative scenario if desired, but the primary catch-up number
should include it.

---

## Report Narrative Addition

Add to the Form 3115 section of the report:

> "The Section 481(a) adjustment includes the bonus depreciation that would have
> been allowable under IRC §168(k) in the year the property was placed in service.
> Under Rev. Proc. 2022-14, the §481(a) adjustment captures the cumulative
> difference between depreciation actually claimed and depreciation allowable
> under the new method for all prior years, including any bonus depreciation
> that would have been available."

---

## Acceptance Criteria

- [ ] `calculateCatchUp()` accepts `acquisitionDate` parameter
- [ ] Bonus rate computed for the original PIS year using `getBonusRate()`
- [ ] Year 1 of new method includes bonus on 5yr, 7yr, 15yr amounts
- [ ] Remaining basis after bonus runs through regular MACRS schedule
- [ ] Building (27.5yr) portion unchanged (never eligible for bonus)
- [ ] 481(a) adjustment = new method total (with bonus) - old method total
- [ ] Report narrative updated to explain bonus inclusion
- [ ] Year-by-year catch-up table shows bonus separately in year 1
