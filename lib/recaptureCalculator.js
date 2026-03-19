// ═══════════════════════════════════════════════════════
// ABODE — Recapture-on-Sale Impact Preview
//
// Calculates simplified depreciation recapture estimates
// for display as a planning tool. Shows the trade-off
// between accelerated deductions and eventual recapture.
//
// NOTE: This is a SIMPLIFIED preview. Actual recapture
// depends on sale price, holding period, 1031 exchanges,
// installment sales, and individual tax situation.
// ═══════════════════════════════════════════════════════

/**
 * Calculate a simplified recapture impact preview comparing
 * cost seg vs. straight-line depreciation at various holding periods.
 *
 * Assumptions:
 * - Sale at original purchase price (no gain/loss on property)
 * - All depreciation is recaptured (conservative)
 * - §1245 recapture taxed at taxpayer's ordinary rate
 * - §1250 (unrecaptured) recapture taxed at max 25%
 *
 * @param {object} studyData - Output from generateStudy()
 * @param {number} holdingYears - Holding period to analyze (default 5)
 * @returns {object} Recapture comparison data
 */
export function calculateRecapturePreview(studyData, holdingYears = 5) {
  const { depreciation, basis, savings } = studyData;
  const bracket = savings.bracket / 100;
  const schedule = depreciation.yearByYearSchedule;

  // Sum depreciation by class through holding period
  let totalFiveYr = 0;
  let totalSevenYr = 0;
  let totalFifteenYr = 0;
  let totalBuilding = 0;

  for (let i = 0; i < holdingYears && i < schedule.length; i++) {
    totalFiveYr += schedule[i].fiveYr;
    totalSevenYr += schedule[i].sevenYr;
    totalFifteenYr += schedule[i].fifteenYr;
    totalBuilding += schedule[i].building;
  }

  const totalPersonalProperty = totalFiveYr + totalSevenYr + totalFifteenYr;
  const totalAllDeductions = totalPersonalProperty + totalBuilding;

  // Tax benefit from deductions over holding period
  const taxBenefitFromDeductions = Math.round(totalAllDeductions * bracket);

  // Recapture taxes on sale
  // §1245: personal property depreciation recaptured at ordinary rate
  const section1245Recapture = Math.round(totalPersonalProperty * bracket);
  // §1250: building depreciation recaptured at max 25%
  const section1250Recapture = Math.round(totalBuilding * 0.25);
  const totalRecaptureTax = section1245Recapture + section1250Recapture;

  // Net benefit = tax saved minus recapture
  const netBenefit = taxBenefitFromDeductions - totalRecaptureTax;

  // Compare to straight-line only (no cost seg)
  const annualSL = basis.adjustedBasis / 27.5;
  const totalSLDeductions = Math.round(
    Math.min(annualSL * holdingYears, basis.adjustedBasis)
  );
  const slTaxBenefit = Math.round(totalSLDeductions * bracket);
  const slRecapture = Math.round(totalSLDeductions * 0.25);
  const slNetBenefit = slTaxBenefit - slRecapture;

  return {
    holdingYears,
    withCostSeg: {
      totalDepreciation: totalAllDeductions,
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
    timeValueNote:
      "Cost segregation accelerates when you claim deductions, creating significant " +
      "time value. A dollar saved today is worth more than a dollar saved in 10 years. " +
      "The net advantage above does not account for the time value of money, which " +
      "further favors cost segregation.",
  };
}

/**
 * Generate recapture previews at standard holding periods.
 *
 * @param {object} studyData - Output from generateStudy()
 * @returns {Array<object>} Array of recapture previews at 3, 5, 7, and 10 years
 */
export function generateRecaptureScenarios(studyData) {
  return [3, 5, 7, 10].map(years => calculateRecapturePreview(studyData, years));
}
