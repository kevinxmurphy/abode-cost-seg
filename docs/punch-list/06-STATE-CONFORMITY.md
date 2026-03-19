# 06 — State Tax Conformity Flags

**Priority:** P2 — Trust signal, CPA credibility
**Effort:** Small (1 hr)
**Files:** new `lib/stateConformity.js`, `components/quiz/QuizResults.js`, `lib/reportAssembler.js`

---

## The CPA's Take

> "Half my clients in California don't realize the state doesn't allow bonus
> depreciation. They see a $150K first-year deduction and think they're saving
> $150K × 37%. But California only allows the regular MACRS schedule — no bonus.
> A simple flag that says 'heads up, CA doesn't conform to federal bonus' would
> save a lot of confused phone calls to my office."

---

## Product Spec

### Results Page Banner

When the property is in a non-conforming state, show an **info banner** below
the tax savings estimate:

```
┌─────────────────────────────────────────────────────────┐
│  ⓘ California State Tax Note                           │
│                                                         │
│  California does not conform to federal bonus            │
│  depreciation. Your state return will use regular MACRS  │
│  schedules (no first-year bonus). Federal savings are    │
│  unaffected. Consult your CPA for CA-specific impact.   │
└─────────────────────────────────────────────────────────┘
```

### PDF Report Addition

Add a one-paragraph state conformity note to the Disclaimers section when applicable.

---

## Technical Spec

### New file: `lib/stateConformity.js`

```js
/**
 * State bonus depreciation conformity status.
 * "full" = state follows federal bonus depreciation
 * "none" = state does not allow bonus depreciation at all
 * "partial" = state allows some bonus but with modifications
 * "no-income-tax" = state has no income tax (non-issue)
 */
export const STATE_BONUS_CONFORMITY = {
  // No income tax states
  AK: "no-income-tax", FL: "no-income-tax", NV: "no-income-tax",
  NH: "no-income-tax", SD: "no-income-tax", TN: "no-income-tax",
  TX: "no-income-tax", WA: "no-income-tax", WY: "no-income-tax",

  // Non-conforming states (do NOT allow federal bonus)
  CA: "none",   // Uses pre-TCJA rules, no bonus
  NY: "none",   // Decoupled from federal bonus since 2003
  NJ: "none",   // Follows federal MACRS but not bonus
  PA: "none",   // Does not allow bonus depreciation
  MD: "none",   // Decoupled from federal bonus
  AR: "none",   // Does not conform to bonus

  // Partial conformity
  CT: "partial", // Allows 50% bonus max
  HI: "partial", // Allows bonus but with modifications
  IL: "partial", // No bonus for tax years starting after 2021 (check current)
  MN: "partial", // 80% addition required, spread over 5 years
  WI: "partial", // Requires addition of bonus, amortized over 5 years

  // Full conformity (most states) — default
  // AL, AZ, CO, DE, GA, ID, IN, IA, KS, KY, LA, ME, MA, MI,
  // MO, MT, NE, NM, NC, ND, OH, OK, OR, RI, SC, UT, VA, VT, WV, DC
};

/**
 * Get conformity status and message for a state.
 */
export function getStateConformity(stateCode) {
  const code = (stateCode || "").toUpperCase();
  const status = STATE_BONUS_CONFORMITY[code] || "full";

  const messages = {
    "no-income-tax": {
      status: "no-income-tax",
      message: `${code} has no state income tax. Bonus depreciation is a federal benefit only.`,
      severity: "info",
    },
    none: {
      status: "none",
      message: `${code} does not conform to federal bonus depreciation. Your state tax return will use regular MACRS depreciation schedules without first-year bonus. The cost segregation study still benefits your state return by accelerating depreciation into shorter recovery periods (5, 7, and 15-year vs. 27.5-year), but the large first-year bonus deduction applies only to your federal return.`,
      severity: "warning",
    },
    partial: {
      status: "partial",
      message: `${code} partially conforms to federal bonus depreciation with modifications. Your state tax savings may differ from federal. Consult your CPA for ${code}-specific treatment.`,
      severity: "info",
    },
    full: {
      status: "full",
      message: null, // No banner needed
      severity: null,
    },
  };

  return messages[status] || messages.full;
}
```

---

## Acceptance Criteria

- [ ] State conformity lookup covers all 50 states + DC
- [ ] Non-conforming states (CA, NY, NJ, PA, MD, AR) show warning banner
- [ ] Partial conformity states show info banner
- [ ] No-income-tax states show neutral info note
- [ ] Full conformity states show nothing (clean UI)
- [ ] PDF report includes state conformity note when applicable
- [ ] Banner does not appear until state is known (after address entry)
