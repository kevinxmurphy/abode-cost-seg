# 08 — Estimate Engine Land Ratio Clamp Fix

**Priority:** P0 — Correctness (5-minute fix)
**Effort:** Tiny
**Files:** `lib/estimateEngine.js`

---

## The Bug

`estimateEngine.js:81` clamps the county assessor land ratio to 8-45%:

```js
landRatio = Math.max(0.08, Math.min(landRatio, 0.45));
```

This means a Hawaii property where the county assessor shows 68% land gets
silently clamped to 45%, **overstating the depreciable basis by 23 percentage
points** in the quick estimate.

For a $1M property in Lahaina:
- Actual: 68% land → $320K depreciable basis
- Clamped: 45% land → $550K depreciable basis
- **Overstatement: $230K in depreciable basis → ~$64K inflated deduction**

This sets incorrect expectations before the user even sees the full study.

---

## The Fix

Widen the clamp to match reality, add a warning flag:

```js
// BEFORE:
landRatio = Math.max(0.08, Math.min(landRatio, 0.45));

// AFTER:
landRatio = Math.max(0.05, Math.min(landRatio, 0.80));
const isHighLandRatio = landRatio > 0.50;
const isLowLandRatio = landRatio < 0.10;
```

Return `isHighLandRatio` and `isLowLandRatio` in the estimate output object
so the UI can surface a note like "High land value detected — your depreciable
basis may be lower than typical."

---

## Acceptance Criteria

- [ ] Clamp widened to 5%-80% (from 8%-45%)
- [ ] `isHighLandRatio` flag returned when ratio > 50%
- [ ] `isLowLandRatio` flag returned when ratio < 10%
- [ ] RunningEstimate widget shows contextual note for flagged properties
- [ ] No change to full report engine (already uses unclamped values)
