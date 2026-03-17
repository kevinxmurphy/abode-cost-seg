// ═══════════════════════════════════════════════════════════════════════════
// ABODE — CSV Export Utilities
//
// Converts cost segregation study data into downloadable CSV files.
// Two export formats:
//   1. Depreciation Schedule — Full year-by-year depreciation per component
//   2. Component Register    — Asset register with classifications
//
// Exports:
//   generateDepreciationCSV, generateComponentCSV, downloadCSV
// ═══════════════════════════════════════════════════════════════════════════


// ─── Utility: Escape CSV value ───────────────────────────────────────────

/**
 * Escapes a value for safe inclusion in a CSV cell.
 * Wraps in double quotes if the value contains commas, quotes, or newlines.
 *
 * @param {*} value - The value to escape
 * @returns {string} CSV-safe string
 */
function escapeCSV(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}


/**
 * Formats a number as a dollar amount without the $ sign (for CSV).
 *
 * @param {number} amount
 * @returns {string}
 */
function fmtAmount(amount) {
  if (amount == null || isNaN(amount)) return "0";
  return Math.round(amount).toLocaleString("en-US");
}


/**
 * Formats a date string as MM/DD/YYYY for CSV.
 *
 * @param {string} dateStr
 * @returns {string}
 */
function fmtDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}


// ─── MACRS Depreciation Rate Tables ──────────────────────────────────────
// Duplicated here to avoid importing from reportEngine.js in client bundles.

const MACRS_RATES = {
  5: [20.00, 32.00, 19.20, 11.52, 11.52, 5.76],
  7: [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],
  15: [5.00, 9.50, 8.55, 7.70, 6.93, 6.23, 5.90, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 2.95],
};

const RESIDENTIAL_ANNUAL_RATE = 3.636;
const MAX_DEPR_YEARS = 28;


// ─── Depreciation CSV ────────────────────────────────────────────────────

/**
 * Generates a CSV string with the full depreciation schedule for every
 * component in the study. Includes bonus depreciation and year-by-year
 * MACRS deductions for up to 28 years.
 *
 * Columns:
 *   Asset Description, Date In Service, Cost Basis, Class Life, Method,
 *   Convention, Bonus Amount, Year 1 Deduction, Year 2 Deduction, ... Year 28 Deduction
 *
 * @param {object} studyData - The report data from assembleReport()
 * @returns {string} CSV content
 */
export function generateDepreciationCSV(studyData) {
  const exhibitE = studyData.exhibitE;
  if (!exhibitE || !exhibitE.schedules) {
    throw new Error("generateDepreciationCSV: exhibitE.schedules is required");
  }

  const { schedules } = exhibitE;

  // Build header row
  const headers = [
    "Asset Description",
    "Date In Service",
    "Cost Basis",
    "Class Life",
    "Method",
    "Convention",
    "Bonus Amount",
  ];

  for (let yr = 1; yr <= MAX_DEPR_YEARS; yr++) {
    headers.push(`Year ${yr} Deduction`);
  }

  const rows = [headers.map(escapeCSV).join(",")];

  for (const item of schedules) {
    // Determine the MACRS class for year-by-year calculations
    const classLife = parseFloat(item.gdsLife) || 27.5;
    const bonusAmount = item.bonusAmount || 0;
    const costBasis = item.amount || 0;
    const regularBasis = costBasis - bonusAmount;

    // Calculate year-by-year depreciation
    const yearDeductions = [];

    if (classLife === 27.5) {
      // Residential rental — straight-line, mid-month
      // Simplified: use standard 3.636% for years 2-27, year 1 from data
      yearDeductions.push(item.regularYr1 || 0);
      for (let yr = 2; yr <= MAX_DEPR_YEARS; yr++) {
        if (yr <= 27) {
          yearDeductions.push(Math.round(regularBasis * RESIDENTIAL_ANNUAL_RATE / 100));
        } else if (yr === 28) {
          // Remainder year
          const claimed = yearDeductions.reduce((sum, d) => sum + d, 0);
          const remainder = regularBasis - claimed;
          yearDeductions.push(Math.max(0, Math.round(remainder)));
        } else {
          yearDeductions.push(0);
        }
      }
    } else {
      // 5, 7, or 15-year property
      const rates = MACRS_RATES[classLife] || MACRS_RATES[5];
      for (let yr = 1; yr <= MAX_DEPR_YEARS; yr++) {
        if (yr <= rates.length) {
          yearDeductions.push(Math.round(regularBasis * rates[yr - 1] / 100));
        } else {
          yearDeductions.push(0);
        }
      }
    }

    // Build row
    const row = [
      escapeCSV(item.description),
      escapeCSV(fmtDate(item.dateInService)),
      fmtAmount(costBasis),
      escapeCSV(item.gdsLife),
      escapeCSV(item.method),
      escapeCSV(item.convention),
      fmtAmount(bonusAmount),
      ...yearDeductions.map(fmtAmount),
    ];

    rows.push(row.join(","));
  }

  // Add totals row
  const totals = ["TOTALS", "", "", "", "", "", ""];
  const totalBonus = schedules.reduce((sum, s) => sum + (s.bonusAmount || 0), 0);
  totals[6] = fmtAmount(totalBonus);

  // Sum each year column
  for (let yr = 0; yr < MAX_DEPR_YEARS; yr++) {
    let yearTotal = 0;
    for (const item of schedules) {
      const classLife = parseFloat(item.gdsLife) || 27.5;
      const regularBasis = (item.amount || 0) - (item.bonusAmount || 0);

      if (classLife === 27.5) {
        if (yr === 0) {
          yearTotal += item.regularYr1 || 0;
        } else if (yr < 27) {
          yearTotal += Math.round(regularBasis * RESIDENTIAL_ANNUAL_RATE / 100);
        }
      } else {
        const rates = MACRS_RATES[classLife] || MACRS_RATES[5];
        if (yr < rates.length) {
          yearTotal += Math.round(regularBasis * rates[yr] / 100);
        }
      }
    }
    totals.push(fmtAmount(yearTotal));
  }

  // Total cost basis
  const totalBasis = schedules.reduce((sum, s) => sum + (s.amount || 0), 0);
  totals[2] = fmtAmount(totalBasis);

  rows.push(totals.join(","));

  return rows.join("\n");
}


// ─── Component CSV ───────────────────────────────────────────────────────

/**
 * Generates a CSV string with the component asset register from Exhibit C.
 *
 * Columns:
 *   Component, Category, MACRS Class, Asset Class, Qty, Unit,
 *   Cost Basis, % of Basis, Legal Reference
 *
 * @param {object} studyData - The report data from assembleReport()
 * @returns {string} CSV content
 */
export function generateComponentCSV(studyData) {
  const exhibitC = studyData.exhibitC;
  if (!exhibitC || !exhibitC.components) {
    throw new Error("generateComponentCSV: exhibitC.components is required");
  }

  const headers = [
    "Component",
    "Category",
    "MACRS Class",
    "Asset Class",
    "Qty",
    "Unit",
    "Cost Basis",
    "% of Basis",
    "Legal Reference",
  ];

  const rows = [headers.map(escapeCSV).join(",")];

  for (const comp of exhibitC.components) {
    // Derive asset class from MACRS class
    let assetClass = "";
    const macrsClass = comp.macrsClass || "";
    if (macrsClass.includes("5")) assetClass = "57.0";
    else if (macrsClass.includes("7")) assetClass = "00.11";
    else if (macrsClass.includes("15")) assetClass = "00.3";
    else if (macrsClass.includes("27.5")) assetClass = "N/A";

    const row = [
      escapeCSV(comp.component),
      escapeCSV(comp.category),
      escapeCSV(macrsClass),
      escapeCSV(assetClass),
      String(comp.qty || 1),
      escapeCSV(comp.unit || "allowance"),
      fmtAmount(comp.costBasis),
      comp.percentOfBasis != null
        ? `${(Math.round(comp.percentOfBasis * 10) / 10).toFixed(1)}%`
        : "0.0%",
      escapeCSV(comp.legalRef || ""),
    ];

    rows.push(row.join(","));
  }

  // Add subtotals by class
  rows.push(""); // blank row separator
  rows.push("SUMMARY BY RECOVERY CLASS");

  if (exhibitC.subtotalsByClass) {
    for (const sub of exhibitC.subtotalsByClass) {
      rows.push(
        [
          escapeCSV(sub.macrsClass),
          "",
          "",
          "",
          "",
          "",
          fmtAmount(sub.total),
          sub.percent != null ? `${sub.percent.toFixed(1)}%` : "",
          "",
        ].join(",")
      );
    }
  }

  // Grand total
  rows.push(
    [
      "GRAND TOTAL",
      "",
      "",
      "",
      "",
      "",
      fmtAmount(exhibitC.grandTotal),
      "100.0%",
      "",
    ].join(",")
  );

  return rows.join("\n");
}


// ─── Download Trigger ────────────────────────────────────────────────────

/**
 * Triggers a browser download of a CSV string as a file.
 * Client-side only — uses DOM APIs.
 *
 * @param {string} csvString - The CSV content
 * @param {string} filename  - The download filename (e.g. "depreciation.csv")
 */
export function downloadCSV(csvString, filename) {
  if (typeof window === "undefined") {
    throw new Error("downloadCSV can only be used in the browser");
  }

  // Add BOM for Excel compatibility with special characters
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "export.csv";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}
