// ═══════════════════════════════════════════════════════
// ABODE — Estimate Calculation Engine
// Used by RunningEstimate widget, QuizResults, and PropertyDetailsContent
//
// Key outputs:
//   - 27.5-year standard depreciation (baseline)
//   - Cost seg accelerated first-year deduction
//   - Year 1 tax savings at user's bracket (default 32%)
//   - Conservative / likely / optimistic ranges
// ═══════════════════════════════════════════════════════

// Bonus depreciation rates by purchase year
const BONUS_RATES = {
  "2025-post": 1.0,
  "2025-pre": 0.4,
  "2024": 0.6,
  "2023": 0.8,
  "2022-earlier": 1.0, // catch-up via 3115
};

// Reclassification % varies by property type and age
// Older properties tend to have more reclassifiable components
function getReclassPercent(propertyType, yearBuilt) {
  const age = new Date().getFullYear() - (yearBuilt || 2010);
  const type = (propertyType || "").toLowerCase();

  // Base rates by property type
  let base = 0.20; // default
  if (type.includes("condo") || type.includes("townhouse")) {
    base = 0.15; // less land improvement, shared structure
  } else if (type.includes("multi")) {
    base = 0.22; // more components per unit
  }

  // Age adjustment: older homes = more reclassifiable (renovations, upgrades)
  if (age > 30) base += 0.04;
  else if (age > 20) base += 0.03;
  else if (age > 10) base += 0.02;
  // Newer builds have less reclassifiable (builder-grade, fewer improvements)
  else if (age < 3) base -= 0.02;

  return Math.max(0.12, Math.min(base, 0.35));
}

/**
 * Calculate estimated first-year deduction from quiz answers (partial or complete).
 * Returns null if not enough data (need at minimum purchase price).
 *
 * @param {object} answers - Quiz answers with:
 *   - purchasePrice (number|string)
 *   - purchaseYear (string key from BONUS_RATES)
 *   - propertyAddress.propertyDetails.assessedLand
 *   - propertyAddress.propertyDetails.assessedImprovement
 *   - propertyAddress.propertyDetails.yearBuilt
 *   - propertyAddress.propertyDetails.propertyType
 *   - taxBracket (optional, 0-100)
 */
export function calculateEstimate(answers) {
  // Need at least a purchase price to calculate anything meaningful
  const purchasePrice = parsePurchasePrice(answers.purchasePrice);
  if (!purchasePrice || purchasePrice < 50000) return null;

  // Tax bracket — default 32% (most common for STR investors in $300K-$2M range)
  const bracket = answers.taxBracket
    ? parseInt(answers.taxBracket) / 100
    : 0.32;

  // Bonus rate — default to 60% (2024 is most common)
  const bonusRate = BONUS_RATES[answers.purchaseYear] || 0.6;
  const isCatchUp = answers.purchaseYear === "2022-earlier";

  // ─── Land ratio from user override, assessed values, or default ─────
  let landRatio = 0.17; // national average for STR markets
  let landRatioSource = "default";
  const addressData = answers.propertyAddress;

  // User-provided land value override takes highest precedence
  if (answers.landValueOverride && answers.landValueOverride > 0) {
    landRatio = answers.landValueOverride / purchasePrice;
    landRatio = Math.max(0.05, Math.min(landRatio, 0.80));
    landRatioSource = "user";
  } else if (addressData && addressData.propertyDetails) {
    const pd = addressData.propertyDetails;
    if (pd.assessedLand > 0 && pd.assessedImprovement > 0) {
      const totalAssessed = pd.assessedLand + pd.assessedImprovement;
      landRatio = pd.assessedLand / totalAssessed;
      landRatio = Math.max(0.05, Math.min(landRatio, 0.80));
      landRatioSource = "county";
    }
  }

  // ─── Property characteristics ──────────────────────────────────────────
  const yearBuilt = addressData?.propertyDetails?.yearBuilt || 0;
  const propertyType = addressData?.propertyDetails?.propertyType || "";
  const reclassPercent = getReclassPercent(propertyType, yearBuilt);

  // ─── Core calculations ─────────────────────────────────────────────────
  const depreciableBasis = purchasePrice * (1 - landRatio);

  // 27.5-year STANDARD depreciation (the baseline everyone gets without cost seg)
  const standardAnnualDeduction = depreciableBasis / 27.5;
  const standardAnnualSavings = standardAnnualDeduction * bracket;

  // Cost seg ACCELERATED depreciation
  const accelerated = depreciableBasis * reclassPercent;
  const bonusDeduction = accelerated * bonusRate;
  const regularFirstYear = accelerated * 0.08; // first-year MACRS on accelerated portion
  const remainingStructure = depreciableBasis - accelerated;
  const structureFirstYear = remainingStructure / 27.5; // 27.5yr on remaining
  const firstYearDeduction = regularFirstYear + bonusDeduction + structureFirstYear;
  const firstYearSavings = firstYearDeduction * bracket;

  // ─── The "wow" comparison ──────────────────────────────────────────────
  // "Without cost seg: $X/year. With cost seg: $Y in Year 1."
  const yearOneMultiplier = standardAnnualDeduction > 0
    ? firstYearDeduction / standardAnnualDeduction
    : 0;

  // Land ratio warning flags for UI
  const isHighLandRatio = landRatio > 0.50;
  const isLowLandRatio = landRatio < 0.10;

  return {
    // Deduction ranges (conservative to optimistic)
    conservative: Math.round(firstYearDeduction * 0.75),
    likely: Math.round(firstYearDeduction),
    optimistic: Math.round(firstYearDeduction * 1.3),

    // Primary deduction figure
    firstYearDeduction: Math.round(firstYearDeduction),

    // ─── 27.5-year baseline comparison ─────────────────────────────────
    standardAnnualDeduction: Math.round(standardAnnualDeduction),
    standardAnnualSavings: Math.round(standardAnnualSavings),
    firstYearSavings: Math.round(firstYearSavings),
    yearOneMultiplier: Math.round(yearOneMultiplier * 10) / 10, // e.g., 8.2x

    // Building blocks
    depreciableBasis: Math.round(depreciableBasis),
    purchasePrice,
    landRatio: Math.round(landRatio * 100),
    landRatioSource,
    reclassPercent: Math.round(reclassPercent * 100),
    acceleratedAmount: Math.round(accelerated),
    bonusRate: Math.round(bonusRate * 100),
    bracket: Math.round(bracket * 100),
    isCatchUp,
    isHighLandRatio,
    isLowLandRatio,
  };
}

export function parsePurchasePrice(val) {
  if (!val) return 0;
  if (typeof val === "number") return val;
  return parseInt(String(val).replace(/\D/g, ""), 10) || 0;
}
