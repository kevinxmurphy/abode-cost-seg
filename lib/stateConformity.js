// ═══════════════════════════════════════════════════════
// ABODE — State Bonus Depreciation Conformity
//
// Tracks which states conform to federal bonus depreciation.
// Used to flag non-conforming states in the UI and reports.
//
// Sources: Bloomberg Tax state conformity charts, state
//          revenue department publications (as of 2025).
//
// PHASE 2: Add state-specific MACRS modification details
// ═══════════════════════════════════════════════════════

/**
 * State bonus depreciation conformity status.
 * "full"          = state follows federal bonus depreciation
 * "none"          = state does not allow bonus depreciation at all
 * "partial"       = state allows some bonus but with modifications
 * "no-income-tax" = state has no income tax (non-issue)
 */
const STATE_BONUS_CONFORMITY = {
  // No income tax states
  AK: "no-income-tax",
  FL: "no-income-tax",
  NV: "no-income-tax",
  NH: "no-income-tax", // taxes interest/dividends only
  SD: "no-income-tax",
  TN: "no-income-tax",
  TX: "no-income-tax",
  WA: "no-income-tax",
  WY: "no-income-tax",

  // Non-conforming states (do NOT allow federal bonus)
  CA: "none",
  NY: "none",
  NJ: "none",
  PA: "none",
  MD: "none",
  AR: "none",

  // Partial conformity (allow with modifications)
  CT: "partial",
  HI: "partial",
  IL: "partial",
  MN: "partial",
  WI: "partial",

  // All other states default to "full" conformity
};

/**
 * Get conformity status and user-facing message for a state.
 *
 * @param {string} stateCode - 2-letter state code
 * @returns {{ status: string, message: string|null, severity: string|null }}
 */
export function getStateConformity(stateCode) {
  const code = (stateCode || "").toUpperCase();
  const status = STATE_BONUS_CONFORMITY[code] || "full";

  switch (status) {
    case "no-income-tax":
      return {
        status,
        message: `${code} has no state income tax. Bonus depreciation is a federal benefit only.`,
        severity: "info",
      };
    case "none":
      return {
        status,
        message: `${code} does not conform to federal bonus depreciation. Your state return will use regular MACRS depreciation schedules without first-year bonus. The cost segregation study still benefits your state return by accelerating depreciation into shorter recovery periods (5, 7, and 15-year vs. 27.5-year), but the large first-year bonus deduction applies only to your federal return. Consult your CPA for ${code}-specific impact.`,
        severity: "warning",
      };
    case "partial":
      return {
        status,
        message: `${code} partially conforms to federal bonus depreciation with modifications. Your state tax savings may differ from federal. Consult your CPA for ${code}-specific treatment.`,
        severity: "info",
      };
    default:
      return {
        status: "full",
        message: null,
        severity: null,
      };
  }
}

/**
 * Quick check: does this state have a bonus depreciation issue?
 *
 * @param {string} stateCode
 * @returns {boolean} True if the state does NOT fully conform
 */
export function hasStateBonusIssue(stateCode) {
  const { status } = getStateConformity(stateCode);
  return status === "none" || status === "partial";
}
