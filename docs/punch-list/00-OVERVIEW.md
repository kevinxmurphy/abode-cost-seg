# Abode Cost Seg — CPA Audit Punch List

## Context
Independent CPA review (25 years experience, real estate specialty) audited the
complete calculation engine against IRS authority and professional study standards.

**Current Grade: A-/A**
**Target Grade: A+**

The tool is solid — conservative, well-cited, IRS-defensible. These improvements
close the remaining gaps and unlock a meaningful revenue/conversion opportunity
via a "Confidence Mode" toggle.

---

## Priority Legend
- **P0** — Correctness issue (could produce wrong numbers)
- **P1** — High-impact feature (revenue or defensibility)
- **P2** — Nice-to-have (completeness, polish)

---

## Punch List Summary

| # | Item | Priority | Effort | File |
|---|------|----------|--------|------|
| 1 | **Confidence Mode Toggle** (Conservative vs Aggressive) | P1 | Medium | [01-CONFIDENCE-MODE.md](./01-CONFIDENCE-MODE.md) |
| 2 | **Land Value Override for High-COL Markets** | P1 | Small | [02-LAND-VALUE-OVERRIDE.md](./02-LAND-VALUE-OVERRIDE.md) |
| 3 | **Mid-Quarter Convention Rate Tables** | P0 | Small | [03-MID-QUARTER-FIX.md](./03-MID-QUARTER-FIX.md) |
| 4 | **481(a) Catch-Up: Include Bonus in PIS Year** | P1 | Small | [04-CATCHUP-BONUS.md](./04-CATCHUP-BONUS.md) |
| 5 | **Missing Components** (septic, dock, solar, generator, central vac) | P2 | Small | [05-MISSING-COMPONENTS.md](./05-MISSING-COMPONENTS.md) |
| 6 | **State Tax Conformity Flags** | P2 | Small | [06-STATE-CONFORMITY.md](./06-STATE-CONFORMITY.md) |
| 7 | **Recapture-on-Sale Impact Preview** | P2 | Medium | [07-RECAPTURE-PREVIEW.md](./07-RECAPTURE-PREVIEW.md) |
| 8 | **Estimate Engine Land Ratio Clamp Fix** | P0 | Tiny | [08-LAND-RATIO-CLAMP.md](./08-LAND-RATIO-CLAMP.md) |

---

## Implementation Order (recommended)
1. #8 — Land ratio clamp fix (5 min, correctness)
2. #3 — Mid-quarter convention (1 hr, correctness)
3. #2 — Land value override (2 hr, high user impact)
4. #1 — Confidence mode (4 hr, revenue unlock)
5. #4 — Catch-up bonus (1 hr, bigger deductions for catch-up users)
6. #5 — Missing components (1 hr, completeness)
7. #6 — State conformity flags (1 hr, trust signal)
8. #7 — Recapture preview (3 hr, planning value)
