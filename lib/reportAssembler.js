// ═══════════════════════════════════════════════════════════════════════════
// ABODE — Cost Segregation Report Assembler
//
// Assembles the complete report data structure from generateStudy() output
// and legal citation text. Produces structured content for all report
// sections, ready for PDF rendering.
//
// Exports:
//   assembleReport, generatePropertyNarrative, generateExecutiveLetter,
//   formatCurrency, formatPercent, getApplicableJustifications
// ═══════════════════════════════════════════════════════════════════════════

import {
  LEGAL_FRAMEWORK,
  BONUS_DEPRECIATION_TEXT,
  COMPONENT_JUSTIFICATIONS,
  METHODOLOGY_TEXT,
  MATERIAL_PARTICIPATION_TEXT,
  LIMITING_CONDITIONS,
  CERTIFICATION_TEXT,
  DISCLAIMERS,
} from "./legalCitations.js";

import { MACRS_TABLES, COMPONENT_MASTER_LIST } from "./reportEngine.js";
import { getStateConformity, hasStateBonusIssue } from "./stateConformity.js";
import { calculateRecapturePreview } from "./recaptureCalculator.js";


// ─── Utility: Currency Formatting ────────────────────────────────────────

/**
 * Formats a numeric amount as US currency string.
 *
 * @param {number} amount - The dollar amount to format
 * @returns {string} Formatted string, e.g. "$123,456" or "($5,000)" for negatives
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return "$0";
  const abs = Math.abs(Math.round(amount));
  const formatted = "$" + abs.toLocaleString("en-US");
  return amount < 0 ? `(${formatted})` : formatted;
}


// ─── Utility: Percent Formatting ─────────────────────────────────────────

/**
 * Formats a numeric value as a percentage string.
 *
 * @param {number} value - The percentage value (e.g. 28.5 for 28.5%)
 * @returns {string} Formatted string, e.g. "28.5%"
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return "0.0%";
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
}


// ─── Category-to-Justification Key Mapping ───────────────────────────────

/**
 * Maps component IDs and categories from the COMPONENT_MASTER_LIST
 * to their corresponding COMPONENT_JUSTIFICATIONS key.
 * @type {Record<string, string>}
 */
const COMPONENT_TO_JUSTIFICATION = {
  "kitchen-cabinets": "cabinetsCounters",
  countertops: "cabinetsCounters",
  "shelving-closets": "cabinetsCounters",
  appliances: "appliances",
  "flooring-non-permanent": "floorCoverings",
  "wall-coverings": "wallCoveringsBlinds",
  "special-lighting": "specialLighting",
  "ceiling-fans": "ceilingFans",
  "plumbing-pp": "plumbingPersonalProperty",
  "electrical-pp": "electricalPersonalProperty",
  "data-comms": "dataCommSystems",
  "security-system": "dataCommSystems",
  ornamental: "ornamentalItems",
  "str-furnishings": "furnishingsSTR",
  "bathroom-fixtures": "plumbingPersonalProperty",
  "hvac-equipment": "electricalPersonalProperty",
  "water-heater": "plumbingPersonalProperty",
  "office-cabinets": "cabinetsCounters",
  "break-room-sink": "plumbingPersonalProperty",
  "telephone-wiring": "dataCommSystems",
  "pool-hot-tub": "swimmingPoolHotTub",
  "deck-patio-pergola": "deckPatioStructures",
  landscaping: "landscaping",
  fencing: "fencing",
  "driveway-parking": "drivewayParking",
  sidewalks: "sidewalksPathways",
  "exterior-lighting": "exteriorLighting",
  "storm-drainage": "irrigationDrainage",
  "retaining-walls": "landscaping",
  irrigation: "irrigationDrainage",
  carport: "deckPatioStructures",
  "outdoor-kitchen-firepit": "outdoorKitchenFirePit",
  "exterior-electrical": "electricalPersonalProperty",
  "solar-equipment": "electricalPersonalProperty",
  generator: "electricalPersonalProperty",
  "central-vacuum": "appliances",
  "septic-system": "irrigationDrainage",
  "dock-seawall": "deckPatioStructures",
  "well-system": "irrigationDrainage",
};


// ─── Applicable Justifications ───────────────────────────────────────────

/**
 * Returns only the legal justification sections that apply to the
 * property's identified components. Each justification is included
 * at most once, even if multiple components map to the same key.
 *
 * @param {Array<{ componentId: string, macrsClass: number }>} components
 *   Flat array of all components from the study's allocation classes.
 * @returns {Array<{
 *   title: string,
 *   macrsClass: string,
 *   assetClass: string,
 *   ircSection: string,
 *   justification: string,
 *   citations: string[],
 *   applicability: string
 * }>}
 */
export function getApplicableJustifications(components) {
  if (!Array.isArray(components) || components.length === 0) return [];

  const seenKeys = new Set();
  const justifications = [];

  // Always include the general land improvements justification if any 15-year present
  const has15Year = components.some(c => c.macrsClass === 15);
  if (has15Year && COMPONENT_JUSTIFICATIONS.landImprovements) {
    seenKeys.add("landImprovements");
    justifications.push({ ...COMPONENT_JUSTIFICATIONS.landImprovements });
  }

  for (const comp of components) {
    const key = COMPONENT_TO_JUSTIFICATION[comp.componentId];
    if (!key || seenKeys.has(key)) continue;
    if (!COMPONENT_JUSTIFICATIONS[key]) continue;

    seenKeys.add(key);
    justifications.push({ ...COMPONENT_JUSTIFICATIONS[key] });
  }

  return justifications;
}


// ─── Property Narrative Generator ────────────────────────────────────────

/**
 * Creates a professional narrative description of the property suitable
 * for inclusion in a cost segregation study report.
 *
 * @param {object} property - The property object from generateStudy() output
 * @param {string} property.propertyAddress
 * @param {string} property.propertyType
 * @param {number} property.sqft
 * @param {number} property.beds
 * @param {number} property.baths
 * @param {number} property.yearBuilt
 * @param {boolean} property.isFurnished
 * @param {string} property.placedInServiceDate
 * @param {string[]} [amenities] - Optional list of amenities from wizard inputs
 * @returns {string} Two- to three-paragraph narrative description
 */
export function generatePropertyNarrative(property, amenities) {
  const {
    propertyAddress = "the subject property",
    propertyType = "residential",
    sqft = 0,
    beds = 0,
    baths = 0,
    yearBuilt = 0,
    isFurnished = true,
    placedInServiceDate = "",
  } = property || {};

  const typeLabel = (propertyType || "residential").toLowerCase();
  const pisFormatted = placedInServiceDate
    ? new Date(placedInServiceDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "the date of acquisition";

  // Paragraph 1: Physical description
  let p1 = `The subject property is located at ${propertyAddress}. `;
  p1 += `The property is a ${typeLabel} residence`;
  if (yearBuilt > 0) {
    p1 += ` originally constructed in ${yearBuilt}`;
  }
  if (sqft > 0) {
    p1 += `, comprising approximately ${sqft.toLocaleString("en-US")} square feet of gross living area`;
  }
  if (beds > 0 || baths > 0) {
    const parts = [];
    if (beds > 0) parts.push(`${beds} bedroom${beds !== 1 ? "s" : ""}`);
    if (baths > 0) parts.push(`${baths} bathroom${baths !== 1 ? "s" : ""}`);
    p1 += `. The residence contains ${parts.join(" and ")}`;
  }
  p1 += ".";

  // Paragraph 2: Use and status
  let p2 = `The property was placed in service as a rental property on ${pisFormatted}. `;
  if (isFurnished) {
    p2 +=
      "The property is fully furnished and equipped for use as a short-term rental, " +
      "with all furnishings, fixtures, equipment, and guest amenities in place at the " +
      "time the property was placed in service.";
  } else {
    p2 +=
      "The property is operated as an unfurnished or minimally furnished rental property. " +
      "Personal property items identified in this study are limited to permanently installed " +
      "fixtures, equipment, and building components that qualify for reclassification.";
  }

  // Paragraph 3: Amenities (if provided)
  let p3 = "";
  if (Array.isArray(amenities) && amenities.length > 0) {
    p3 =
      "Notable property amenities and features relevant to this cost segregation study include: " +
      amenities.join(", ") +
      ". Each of these features has been individually evaluated and classified in accordance " +
      "with the applicable provisions of the Internal Revenue Code and Treasury Regulations.";
  }

  return [p1, p2, p3].filter(Boolean).join("\n\n");
}


// ─── Executive Summary Letter Generator ──────────────────────────────────

/**
 * Creates the executive summary letter text addressed to the property owner.
 *
 * @param {object} studyData - The complete output of generateStudy()
 * @param {string} ownerName - The property owner's name
 * @returns {string} Formatted letter text suitable for the executive summary
 */
export function generateExecutiveLetter(studyData, ownerName) {
  const { property, basis, allocation, depreciation, savings, catchUp, meta } = studyData;
  const name = ownerName || property.ownerName || "Property Owner";
  const dateStr = meta.studyDate
    ? new Date(meta.studyDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  const pisFormatted = new Date(property.placedInServiceDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const bonusPct = Math.round(depreciation.bonusRate * 100);

  let letter = "";

  letter += `${dateStr}\n\n`;
  letter += `Dear ${name},\n\n`;

  letter +=
    `We are pleased to present the enclosed Cost Segregation Study for the property located at ` +
    `${property.propertyAddress}. This study was prepared in accordance with the engineering-based ` +
    `methodology recognized by the Internal Revenue Service in the Cost Segregation Audit Techniques Guide ` +
    `and identifies building components eligible for accelerated depreciation under the Modified Accelerated ` +
    `Cost Recovery System (MACRS).\n\n`;

  letter +=
    `The property was placed in service on ${pisFormatted} with a total acquisition price of ` +
    `${formatCurrency(basis.purchasePrice)}. After allocation of ${formatCurrency(basis.landValue)} ` +
    `to non-depreciable land (${formatPercent(basis.landRatio)} of purchase price)`;
  if (basis.closingCosts > 0) {
    letter += ` and the addition of ${formatCurrency(basis.closingCosts)} in capitalized closing costs`;
  }
  letter += `, the adjusted depreciable basis of the property is ${formatCurrency(basis.adjustedBasis)}.\n\n`;

  letter +=
    `Our analysis identified ${formatCurrency(allocation.totalReclassAmount)} ` +
    `(${formatPercent(allocation.totalReclass)} of the depreciable basis) in building components ` +
    `eligible for reclassification from the default 27.5-year recovery period to shorter MACRS ` +
    `recovery periods of 5, 7, and 15 years. `;
  if (bonusPct === 100) {
    letter +=
      `Under current law, these reclassified components qualify for 100% first-year bonus ` +
      `depreciation under IRC Section 168(k), as amended by the One Big Beautiful Bill Act of 2025.\n\n`;
  } else if (bonusPct > 0) {
    letter +=
      `Based on the placed-in-service date, these reclassified components qualify for ${bonusPct}% ` +
      `first-year bonus depreciation under IRC Section 168(k).\n\n`;
  } else {
    letter += `Bonus depreciation is not available for the placed-in-service year.\n\n`;
  }

  letter +=
    `The total first-year depreciation deduction resulting from this study is ` +
    `${formatCurrency(depreciation.totalFirstYearDeduction)}. `;
  letter +=
    `At a marginal federal tax rate of ${savings.bracket}%, this translates to an estimated ` +
    `first-year tax savings of approximately ${formatCurrency(savings.firstYearSavings)}.\n\n`;

  if (catchUp && catchUp.adjustment > 0) {
    letter +=
      `Because the property was placed in service in a prior tax year, a Section 481(a) adjustment ` +
      `of ${formatCurrency(catchUp.adjustment)} is available through the filing of IRS Form 3115 ` +
      `(Application for Change in Accounting Method). This adjustment represents the cumulative ` +
      `depreciation that would have been claimed had cost segregation been applied from the date the ` +
      `property was originally placed in service, less the depreciation actually claimed under the ` +
      `27.5-year straight-line method. This catch-up adjustment is claimed entirely in the current ` +
      `tax year and does not require amending prior-year returns.\n\n`;
  }

  if (savings.passiveWarning) {
    letter +=
      `Please note that the ability to use these depreciation deductions to offset non-passive income ` +
      `(such as wages, salary, or business income) depends on the taxpayer's material participation ` +
      `in the rental activity. For short-term rental properties, the seven-day exception under ` +
      `Treasury Regulation Section 1.469-1T(e)(3)(ii)(A) may apply, treating the activity as non-passive ` +
      `if the taxpayer materially participates. We recommend reviewing the Material Participation section ` +
      `of this report with your tax advisor.\n\n`;
  }

  letter +=
    `We recommend that you share this study with your CPA or tax preparer to ensure proper ` +
    `reporting on your federal income tax return. The detailed schedules, legal citations, and ` +
    `supporting documentation included in this report are designed to withstand IRS examination.\n\n`;

  letter += `Respectfully,\n`;
  letter += `Abode Cost Segregation`;

  return letter;
}


// ─── Table of Contents Builder ───────────────────────────────────────────

/**
 * Builds a table of contents array. Page numbers are placeholder values
 * to be updated by the PDF renderer after pagination.
 *
 * @param {object} studyData - The complete output of generateStudy()
 * @param {boolean} hasPhotographs - Whether the report includes photographs
 * @returns {Array<{ section: string, title: string, page: number }>}
 */
function buildTableOfContents(studyData, hasPhotographs, hasStateConformityIssue = false) {
  let sectionNum = 1;
  const toc = [];

  const add = (title) => {
    toc.push({ section: String(sectionNum), title, page: 0 });
    sectionNum++;
  };

  add("Executive Summary");
  add("Property Description");
  add("Methodology");
  add("Quality Study Elements");
  add("Engineering Procedures");
  add("Certification");
  add("Tax Classification Under IRC Section 168");
  add("Bonus Depreciation");
  add("Component Justifications");
  add("Material Participation & Passive Activity Analysis");
  add("Limiting Conditions & Assumptions");

  if (hasPhotographs) {
    add("Photographs");
  }

  // Exhibits
  toc.push({ section: "A", title: "Exhibit A — Schedule of Reconciled Costs", page: 0 });
  toc.push({ section: "B", title: "Exhibit B — Indirect Costs Allocation", page: 0 });
  toc.push({ section: "C", title: "Exhibit C — Component Cost Determination", page: 0 });
  toc.push({ section: "D", title: "Exhibit D — Adjusted Depreciable Basis Reconciliation", page: 0 });
  toc.push({ section: "E", title: "Exhibit E — Depreciation Report", page: 0 });

  if (studyData.catchUp) {
    toc.push({ section: "F", title: "Exhibit F — Form 3115 Data Worksheet", page: 0 });
  }

  // Addenda (conditional)
  if (hasStateConformityIssue) {
    toc.push({ section: "G", title: "State Tax Conformity Note", page: 0 });
  }
  toc.push({ section: "H", title: "Recapture-on-Sale Impact Preview", page: 0 });

  return toc;
}


// ─── Recovery Class Reference Table ──────────────────────────────────────

/**
 * Standard MACRS recovery class reference table used in the
 * Tax Classification section of the report.
 *
 * @returns {Array<{ name: string, assetClass: string, method: string, life: string, ircSection: string }>}
 */
function buildRecoveryClassTable() {
  return [
    {
      name: "5-Year Personal Property",
      assetClass: "57.0 — Distributive Trades & Services",
      method: "200% DB switching to SL",
      life: "5 years",
      ircSection: "IRC §168(e)(1); Rev. Proc. 87-56",
    },
    {
      name: "7-Year Property",
      assetClass: "00.11 — Office Furniture, Fixtures & Equipment",
      method: "200% DB switching to SL",
      life: "7 years",
      ircSection: "IRC §168(e)(1); Rev. Proc. 87-56",
    },
    {
      name: "15-Year Land Improvements",
      assetClass: "00.3 — Land Improvements",
      method: "150% DB switching to SL",
      life: "15 years",
      ircSection: "IRC §168(e)(1); Rev. Proc. 87-56",
    },
    {
      name: "27.5-Year Residential Rental Property",
      assetClass: "N/A — Residential Rental Property",
      method: "Straight-line",
      life: "27.5 years",
      ircSection: "IRC §168(c)(1); IRC §168(b)(3)",
    },
  ];
}


// ─── Quality Elements Builder ────────────────────────────────────────────

/**
 * Returns the 13 IRS ATG quality elements with descriptions of how
 * each element is addressed in this study.
 *
 * @returns {Array<{ element: string, description: string, howAddressed: string }>}
 */
function buildQualityElements() {
  return [
    {
      element: "1. Preparation by Qualified Individual",
      description:
        "The study must be prepared by an individual with expertise and experience in cost segregation.",
      howAddressed:
        "This study was prepared using engineering-based analysis algorithms developed in consultation with cost segregation professionals, tax attorneys, and licensed professional engineers with experience in real property component identification and classification.",
    },
    {
      element: "2. Detailed Description of Methodology",
      description:
        "The study must include a detailed description of the methodology used to identify and classify components.",
      howAddressed:
        "The engineering cost estimate and modeling methodology is fully described in the Methodology section, including data sources, analytical procedures, and classification criteria.",
    },
    {
      element: "3. Use of Appropriate Documentation",
      description:
        "The study must rely on appropriate documentation, including building plans, specifications, and cost records.",
      howAddressed:
        "This study relies on property-specific data obtained from multiple independent sources, including public records, listing services, and owner-provided information, cross-referenced and validated for accuracy.",
    },
    {
      element: "4. Interviews and Discussions",
      description:
        "The preparer should conduct interviews with appropriate personnel regarding the property.",
      howAddressed:
        "Property-specific information was obtained from the property owner regarding renovations, improvements, condition, and use through the property detail questionnaire.",
    },
    {
      element: "5. Property Tour or Inspection Equivalent",
      description:
        "A physical inspection of the property or equivalent review should be conducted.",
      howAddressed:
        "This study incorporates a comprehensive analysis based on listing photographs, satellite imagery, street-level imagery, and owner-provided information, providing a thorough assessment of the property's components and condition.",
    },
    {
      element: "6. Application of Law",
      description:
        "Component classifications must be based on applicable tax law, regulations, and case law.",
      howAddressed:
        "All component classifications are based on the Internal Revenue Code, Treasury Regulations, Revenue Rulings, Revenue Procedures, and Tax Court decisions as cited throughout this report.",
    },
    {
      element: "7. Determination of Unit Costs",
      description:
        "Component costs must be determined using appropriate cost estimation techniques.",
      howAddressed:
        "Component costs are determined using recognized construction cost databases, regional cost indices, and engineering estimates appropriate for the property type, age, quality, and location.",
    },
    {
      element: "8. Identification of Section 1245 Personal Property",
      description:
        "All personal property components must be individually identified and classified.",
      howAddressed:
        "All Section 1245 personal property components have been individually identified, classified, and supported with legal authority in the Component Justifications section and Exhibit C.",
    },
    {
      element: "9. Identification of Land Improvements",
      description:
        "All land improvements must be individually identified and classified.",
      howAddressed:
        "All land improvements have been individually identified, classified, and supported with legal authority in the Component Justifications section and Exhibit C.",
    },
    {
      element: "10. Identification of Section 1250 Structural Components",
      description:
        "Components that do not qualify for reclassification must be identified and remain at 27.5 years.",
      howAddressed:
        "Components that do not qualify for reclassification have been identified and remain classified as 27.5-year residential rental property, comprising the building allocation shown in the schedules.",
    },
    {
      element: "11. Reconciliation of Total Allocated Costs",
      description:
        "The total of all component costs must reconcile to the depreciable basis.",
      howAddressed:
        "The total of all component costs allocated in this study reconciles to the adjusted depreciable basis of the property, as demonstrated in Exhibit D.",
    },
    {
      element: "12. Treatment of Indirect Costs",
      description:
        "The study must explain how indirect costs are allocated among components.",
      howAddressed:
        "Indirect costs, including closing costs, have been allocated proportionally among the identified components based on their relative direct costs, as shown in Exhibit B.",
    },
    {
      element: "13. Overall Accuracy and Consistency",
      description:
        "The study must demonstrate internal consistency and reasonableness.",
      howAddressed:
        "The results have been reviewed for internal consistency, reasonableness compared to industry benchmarks, and compliance with applicable tax law. Reclassification guardrails ensure allocations fall within IRS-defensible ranges.",
    },
  ];
}


// ─── Engineering Procedures List ─────────────────────────────────────────

/**
 * Returns the 10-step engineering procedure list.
 *
 * @returns {string[]}
 */
function buildEngineeringProcedures() {
  return [
    "Property Data Collection: Comprehensive property data was collected from public records, listing services, and owner-provided information, including building characteristics, age, size, construction type, features, and improvements.",
    "Building Component Identification: Each building component was identified and categorized based on its function, construction material, method of attachment, and relationship to the building structure.",
    "Component Classification Analysis: Each identified component was analyzed under the applicable legal framework to determine its proper MACRS asset class, recovery period, and depreciation method.",
    "Cost Estimation: The replacement cost of each component was estimated using recognized construction cost databases, adjusted for regional cost differences, property quality tier, and component age and condition.",
    "Depreciation Basis Allocation: The depreciable basis of the property (purchase price less allocated land value) was allocated among the identified components based on their relative replacement costs.",
    "Land Value Determination: The land value was determined using the most reliable available data, including county tax assessor records, comparable land sales, and residual analysis.",
    "Indirect Cost Allocation: Indirect costs were allocated proportionally among identified components based on their relative direct costs.",
    "Bonus Depreciation Analysis: Each reclassified component was evaluated for eligibility for bonus depreciation under IRC Section 168(k) based on the property's placed-in-service date.",
    "Quality Assurance Review: The completed study was reviewed for accuracy, internal consistency, compliance with applicable law, and reasonableness compared to industry benchmarks for properties of similar type and value.",
    "Report Preparation: The results were compiled into this comprehensive report with supporting schedules, legal citations, and documentation sufficient to support the claimed depreciation deductions upon IRS examination.",
  ];
}


// ─── Summary Table Builder ───────────────────────────────────────────────

/**
 * Builds the executive summary depreciation table.
 *
 * @param {object} studyData - The complete output of generateStudy()
 * @returns {Array<{ description: string, dateInService: string, method: string, life: string, totalCosts: number }>}
 */
function buildSummaryTable(studyData) {
  const { property, allocation } = studyData;
  const pis = property.placedInServiceDate;
  const rows = [];

  if (allocation.fiveYear.amount > 0) {
    rows.push({
      description: "5-Year Personal Property (Section 1245)",
      dateInService: pis,
      method: "200% DB / SL",
      life: "5 years",
      totalCosts: allocation.fiveYear.amount,
    });
  }

  if (allocation.sevenYear.amount > 0) {
    rows.push({
      description: "7-Year Property (Section 1245)",
      dateInService: pis,
      method: "200% DB / SL",
      life: "7 years",
      totalCosts: allocation.sevenYear.amount,
    });
  }

  if (allocation.fifteenYear.amount > 0) {
    rows.push({
      description: "15-Year Land Improvements (Section 1250)",
      dateInService: pis,
      method: "150% DB / SL",
      life: "15 years",
      totalCosts: allocation.fifteenYear.amount,
    });
  }

  rows.push({
    description: "27.5-Year Building (Section 1250)",
    dateInService: pis,
    method: "Straight-Line",
    life: "27.5 years",
    totalCosts: allocation.building.amount,
  });

  return rows;
}


// ─── Exhibit Builders ────────────────────────────────────────────────────

/**
 * Builds Exhibit A: Schedule of Reconciled Costs.
 *
 * @param {object} studyData
 * @returns {object}
 */
function buildExhibitA(studyData) {
  const { basis } = studyData;
  const reconciliation = [
    { description: "Purchase Price", amount: basis.purchasePrice },
    { description: "Less: Allocated Land Value", amount: -basis.landValue },
    { description: "Depreciable Basis", amount: basis.depreciableBasis },
  ];
  if (basis.closingCosts > 0) {
    reconciliation.push({
      description: "Plus: Capitalized Closing Costs",
      amount: basis.closingCosts,
    });
  }
  reconciliation.push({
    description: "Adjusted Depreciable Basis",
    amount: basis.adjustedBasis,
  });

  return {
    acquisitionPrice: basis.purchasePrice,
    landValue: basis.landValue,
    depreciableBasis: basis.depreciableBasis,
    closingCosts: basis.closingCosts,
    adjustedBasis: basis.adjustedBasis,
    reconciliation,
  };
}

/**
 * Builds Exhibit B: Indirect Costs Allocation.
 * Closing costs are allocated proportionally across asset classes based on
 * their share of the depreciable basis.
 *
 * @param {object} studyData
 * @returns {object}
 */
function buildExhibitB(studyData) {
  const { basis, allocation } = studyData;
  const closingCosts = basis.closingCosts || 0;

  if (closingCosts === 0) {
    return {
      totalClosingCosts: 0,
      segregationRatio: 0,
      allocations: [],
      note: "No closing costs were capitalized for this property. Indirect cost allocation is not applicable.",
    };
  }

  const totalBasis = basis.depreciableBasis;
  if (totalBasis <= 0) {
    return {
      totalClosingCosts: closingCosts,
      segregationRatio: 0,
      allocations: [],
      note: "Depreciable basis is zero. Closing costs cannot be allocated.",
    };
  }

  const segregationRatio = closingCosts / totalBasis;

  const classes = [
    { assetClass: "5-Year Personal Property", basisAmount: allocation.fiveYear.amount },
    { assetClass: "7-Year Property", basisAmount: allocation.sevenYear.amount },
    { assetClass: "15-Year Land Improvements", basisAmount: allocation.fifteenYear.amount },
    { assetClass: "27.5-Year Building", basisAmount: allocation.building.amount },
  ];

  const allocations = classes
    .filter((c) => c.basisAmount > 0)
    .map((c) => ({
      assetClass: c.assetClass,
      amount: Math.round(c.basisAmount * segregationRatio),
    }));

  // Reconcile rounding
  const allocatedTotal = allocations.reduce((s, a) => s + a.amount, 0);
  const diff = closingCosts - allocatedTotal;
  if (diff !== 0 && allocations.length > 0) {
    allocations[allocations.length - 1].amount += diff;
  }

  return {
    totalClosingCosts: closingCosts,
    segregationRatio: Math.round(segregationRatio * 10000) / 100,
    allocations,
    note: null,
  };
}

/**
 * Builds Exhibit C: Component Cost Determination (asset register).
 *
 * @param {object} studyData
 * @returns {object}
 */
function buildExhibitC(studyData) {
  const { allocation, basis } = studyData;
  const allComponents = [
    ...(allocation.fiveYear.components || []),
    ...(allocation.sevenYear.components || []),
    ...(allocation.fifteenYear.components || []),
  ];

  const components = allComponents.map((c) => ({
    component: c.name,
    category: c.category,
    macrsClass: `${c.macrsClass}-year`,
    qty: c.quantity || 1,
    unit: c.unit || "allowance",
    costBasis: c.costBasis,
    percentOfBasis: c.percentOfBasis,
    legalRef: c.legalCitation,
  }));

  // Subtotals by class
  const classMap = {};
  for (const c of allComponents) {
    const key = `${c.macrsClass}-year`;
    if (!classMap[key]) classMap[key] = { macrsClass: key, total: 0 };
    classMap[key].total += c.costBasis;
  }

  // Add building
  classMap["27.5-year"] = {
    macrsClass: "27.5-year",
    total: allocation.building.amount,
  };

  const subtotalsByClass = Object.values(classMap).map((entry) => ({
    macrsClass: entry.macrsClass,
    total: entry.total,
    percent:
      basis.adjustedBasis > 0
        ? Math.round((entry.total / basis.adjustedBasis) * 10000) / 100
        : 0,
  }));

  return {
    components,
    subtotalsByClass,
    grandTotal: basis.adjustedBasis,
    methodologyNote:
      "Component costs are determined using recognized construction cost databases, " +
      "regional cost indices, and engineering estimates. Costs are allocated proportionally based on weighted " +
      "component analysis, with the total reconciling to the adjusted depreciable basis of the property.",
  };
}

/**
 * Builds Exhibit D: Adjusted Depreciable Basis Reconciliation.
 *
 * @param {object} studyData
 * @returns {object}
 */
function buildExhibitD(studyData) {
  const { basis, allocation, reconciliation } = studyData;
  const steps = [
    { step: 1, description: "Total Acquisition Price", amount: basis.purchasePrice },
    { step: 2, description: "Less: Allocated Land Value", amount: -basis.landValue },
    { step: 3, description: "Depreciable Basis", amount: basis.depreciableBasis },
  ];

  if (basis.closingCosts > 0) {
    steps.push({
      step: 4,
      description: "Plus: Capitalized Closing Costs",
      amount: basis.closingCosts,
    });
    steps.push({
      step: 5,
      description: "Adjusted Depreciable Basis",
      amount: basis.adjustedBasis,
    });
  } else {
    steps.push({
      step: 4,
      description: "Adjusted Depreciable Basis (no closing costs)",
      amount: basis.adjustedBasis,
    });
  }

  const nextStep = steps.length + 1;
  steps.push({
    step: nextStep,
    description: "5-Year Personal Property Allocation",
    amount: allocation.fiveYear.amount,
  });
  steps.push({
    step: nextStep + 1,
    description: "7-Year Property Allocation",
    amount: allocation.sevenYear.amount,
  });
  steps.push({
    step: nextStep + 2,
    description: "15-Year Land Improvements Allocation",
    amount: allocation.fifteenYear.amount,
  });
  steps.push({
    step: nextStep + 3,
    description: "27.5-Year Building Allocation",
    amount: allocation.building.amount,
  });
  steps.push({
    step: nextStep + 4,
    description: "Total Allocated (should equal Adjusted Depreciable Basis)",
    amount: reconciliation.totalAllocated,
  });
  steps.push({
    step: nextStep + 5,
    description: "Reconciliation Difference",
    amount: reconciliation.difference,
  });

  return {
    steps,
    isReconciled: reconciliation.isReconciled,
  };
}

/**
 * Builds Exhibit E: Depreciation Report with full schedules and year-by-year detail.
 *
 * @param {object} studyData
 * @returns {object}
 */
function buildExhibitE(studyData) {
  const { property, allocation, depreciation, catchUp } = studyData;
  const pis = property.placedInServiceDate;
  const bonusRate = depreciation.bonusRate;

  const schedules = [];

  // 5-year schedule entries
  if (allocation.fiveYear.amount > 0) {
    for (const comp of allocation.fiveYear.components) {
      const bonus = Math.round(comp.costBasis * bonusRate);
      const regularBasis = comp.costBasis - bonus;
      const regularYr1 = regularBasis > 0 ? Math.round(regularBasis * MACRS_TABLES.fiveYear[0] / 100) : 0;

      schedules.push({
        description: comp.name,
        dateInService: pis,
        amount: comp.costBasis,
        assetClass: "57.0",
        gdsLife: "5 years",
        adsLife: "9 years",
        method: "200% DB/SL",
        ircSection: "IRC §168(e); Rev. Proc. 87-56",
        convention: depreciation.convention,
        bonusAmount: bonus,
        regularYr1,
        section481a: catchUp ? Math.round((comp.costBasis / allocation.fiveYear.amount) * (catchUp.adjustment > 0 ? catchUp.adjustment : 0) * (allocation.fiveYear.amount / (allocation.fiveYear.amount + allocation.sevenYear.amount + allocation.fifteenYear.amount + allocation.building.amount))) : 0,
        currentYear: bonus + regularYr1,
        accumulated: bonus + regularYr1,
      });
    }
  }

  // 7-year schedule entries
  if (allocation.sevenYear.amount > 0) {
    for (const comp of allocation.sevenYear.components) {
      const bonus = Math.round(comp.costBasis * bonusRate);
      const regularBasis = comp.costBasis - bonus;
      const regularYr1 = regularBasis > 0 ? Math.round(regularBasis * MACRS_TABLES.sevenYear[0] / 100) : 0;

      schedules.push({
        description: comp.name,
        dateInService: pis,
        amount: comp.costBasis,
        assetClass: "00.11",
        gdsLife: "7 years",
        adsLife: "10 years",
        method: "200% DB/SL",
        ircSection: "IRC §168(e); Rev. Proc. 87-56",
        convention: depreciation.convention,
        bonusAmount: bonus,
        regularYr1,
        section481a: 0,
        currentYear: bonus + regularYr1,
        accumulated: bonus + regularYr1,
      });
    }
  }

  // 15-year schedule entries
  if (allocation.fifteenYear.amount > 0) {
    for (const comp of allocation.fifteenYear.components) {
      const bonus = Math.round(comp.costBasis * bonusRate);
      const regularBasis = comp.costBasis - bonus;
      const regularYr1 = regularBasis > 0 ? Math.round(regularBasis * MACRS_TABLES.fifteenYear[0] / 100) : 0;

      schedules.push({
        description: comp.name,
        dateInService: pis,
        amount: comp.costBasis,
        assetClass: "00.3",
        gdsLife: "15 years",
        adsLife: "20 years",
        method: "150% DB/SL",
        ircSection: "IRC §168(e); Rev. Proc. 87-56",
        convention: depreciation.convention,
        bonusAmount: bonus,
        regularYr1,
        section481a: 0,
        currentYear: bonus + regularYr1,
        accumulated: bonus + regularYr1,
      });
    }
  }

  // 27.5-year building entry
  schedules.push({
    description: "Building Structure (Section 1250 Property)",
    dateInService: pis,
    amount: allocation.building.amount,
    assetClass: "N/A",
    gdsLife: "27.5 years",
    adsLife: "30 years",
    method: "Straight-Line",
    ircSection: "IRC §168(c)(1); IRC §168(b)(3)",
    convention: "mid-month",
    bonusAmount: 0,
    regularYr1: depreciation.building.yr1,
    section481a: 0,
    currentYear: depreciation.building.yr1,
    accumulated: depreciation.building.yr1,
  });

  // Summary
  const summary = {
    totalBasis: studyData.basis.adjustedBasis,
    totalBonus:
      depreciation.fiveYear.bonus +
      depreciation.sevenYear.bonus +
      depreciation.fifteenYear.bonus,
    totalRegularYr1:
      depreciation.fiveYear.regularYr1 +
      depreciation.sevenYear.regularYr1 +
      depreciation.fifteenYear.regularYr1 +
      depreciation.building.yr1,
    totalFirstYear: depreciation.totalFirstYearDeduction,
    section481aTotal: catchUp ? catchUp.adjustment : 0,
  };

  return {
    schedules,
    summary,
    yearByYear: depreciation.yearByYearSchedule,
  };
}

/**
 * Builds Exhibit F: Form 3115 Data Worksheet (catch-up properties only).
 *
 * @param {object} studyData
 * @param {object} wizardInputs
 * @returns {object|null}
 */
function buildExhibitF(studyData, wizardInputs) {
  const { catchUp, property } = studyData;
  if (!catchUp || catchUp.adjustment <= 0) return null;

  const ownerName = wizardInputs?.ownerName || property.ownerName || "";
  const ownerEntity = wizardInputs?.ownerEntity || property.ownerEntity || "";

  // Parse address components (best-effort)
  const address = property.propertyAddress || "";

  return {
    applicantInfo: {
      name: ownerEntity || ownerName,
      entity: ownerEntity || "Individual",
      ein: "[To be provided by taxpayer]",
      address,
    },
    dcn: "7",
    oldMethod:
      "Straight-line depreciation over 27.5 years for entire depreciable basis of residential rental property under IRC Section 168(b)(3), using the mid-month convention.",
    newMethod:
      "MACRS depreciation with cost segregation — reclassified components depreciated over 5-year, 7-year, and 15-year recovery periods using the applicable depreciation method and convention, with bonus depreciation under IRC Section 168(k) applied to qualifying property.",
    adjustment481a: {
      yearByYear: catchUp.yearByYear,
      netAdjustment: catchUp.adjustment,
    },
    instructions:
      "File IRS Form 3115 (Application for Change in Accounting Method) with the taxpayer's federal income tax return for the year of change. The Section 481(a) adjustment is reported as a positive adjustment (increase in depreciation) on Line 25 of Form 3115. The designated change number (DCN) for this change is 7. The entire Section 481(a) adjustment is taken into account in the year of change (it is not spread over multiple years) because the adjustment is a net negative amount (i.e., it results in an increase in depreciation). No user fee is required for filing Form 3115 under the automatic consent procedures of Revenue Procedure 2015-13 (as modified). The taxpayer should attach a copy of this cost segregation study to the Form 3115 filing.",
  };
}


// ─── Material Participation Section Builder ──────────────────────────────

/**
 * Builds the material participation analysis section.
 *
 * @param {object} studyData
 * @param {object} wizardInputs
 * @returns {object}
 */
function buildMaterialParticipation(studyData, wizardInputs) {
  const { property, savings } = studyData;
  const participates = property.materialParticipation;

  let participationStatus;
  if (participates) {
    participationStatus =
      "Based on information provided by the property owner, the owner materially participates " +
      "in the short-term rental activity. Assuming the seven-day exception under Treasury " +
      "Regulation Section 1.469-1T(e)(3)(ii)(A) applies, the depreciation deductions generated " +
      "by this study may be used to offset non-passive income, including wages, salary, and " +
      "business income, in the current tax year.";
  } else {
    participationStatus =
      "Based on information provided, the property owner's material participation status has not " +
      "been confirmed. If the owner does not materially participate in the short-term rental activity, " +
      "the depreciation deductions generated by this study will be classified as passive activity losses " +
      "under IRC Section 469 and may only offset passive activity income in the current tax year. " +
      "Suspended passive losses carry forward indefinitely under IRC Section 469(b).";
  }

  let recommendations;
  if (participates) {
    recommendations =
      "The property owner should maintain contemporaneous records of all hours spent on the " +
      "short-term rental activity to support the material participation claim. " +
      MATERIAL_PARTICIPATION_TEXT.documentationRecommendations;
  } else {
    recommendations =
      "The property owner should evaluate whether material participation can be achieved through " +
      "any of the seven tests described above. If material participation is achievable, the owner " +
      "should begin maintaining contemporaneous activity logs immediately. " +
      MATERIAL_PARTICIPATION_TEXT.warningText;
  }

  return {
    strException: MATERIAL_PARTICIPATION_TEXT.strException,
    participationStatus,
    implications: MATERIAL_PARTICIPATION_TEXT.passiveActivityImplications,
    recommendations,
  };
}


// ─── State Tax Conformity Builder ────────────────────────────────────────

/**
 * Builds state tax conformity data for the report.
 * Returns null for full-conformity states (no note needed).
 */
function buildStateConformity(stateCode) {
  if (!stateCode || !hasStateBonusIssue(stateCode)) return null;

  const conformity = getStateConformity(stateCode);
  return {
    stateCode: stateCode.toUpperCase(),
    status: conformity.status,
    message: conformity.message,
    severity: conformity.severity,
    reportNote:
      conformity.status === "none"
        ? `State Tax Note: ${stateCode.toUpperCase()} does not conform to federal bonus depreciation under IRC §168(k). ` +
          `The first-year bonus deduction shown in this study applies to the federal return only. ` +
          `For state tax purposes, the reclassified components will be depreciated using regular MACRS schedules ` +
          `over their respective 5-year, 7-year, and 15-year recovery periods. The cost segregation study still ` +
          `provides a meaningful state tax benefit through accelerated (but not bonus) depreciation. ` +
          `Consult a CPA licensed in ${stateCode.toUpperCase()} for precise state impact calculations.`
        : `State Tax Note: ${stateCode.toUpperCase()} partially conforms to federal bonus depreciation with modifications. ` +
          `The federal savings shown in this study are unaffected, but state-level savings may differ. ` +
          `Consult a CPA licensed in ${stateCode.toUpperCase()} for state-specific treatment.`,
  };
}


// ─── Recapture Preview Builder ──────────────────────────────────────────

/**
 * Builds recapture-on-sale preview data at 5-year and 10-year holding periods.
 */
function buildRecapturePreview(studyData) {
  try {
    const fiveYear = calculateRecapturePreview(studyData, 5);
    const tenYear = calculateRecapturePreview(studyData, 10);

    return {
      scenarios: [fiveYear, tenYear],
      disclaimer:
        "This recapture preview is a simplified estimate for planning purposes only. " +
        "Actual recapture depends on the sale price, holding period, whether a §1031 exchange " +
        "is utilized, installment sale treatment, and the taxpayer's individual tax situation " +
        "at the time of sale. Cost segregation creates a timing advantage — accelerating " +
        "deductions to earlier years has significant time value of money benefits even after " +
        "accounting for eventual recapture. Consult your CPA before making disposition decisions.",
    };
  } catch {
    return null;
  }
}


// ─── Main Report Assembler ───────────────────────────────────────────────

/**
 * Assembles the complete cost segregation report data structure from the
 * output of generateStudy() and supplemental wizard inputs.
 *
 * This function produces the full structured content for all report sections,
 * ready for rendering to PDF by a separate PDF generation module.
 *
 * @param {object} studyData - The complete output of generateStudy()
 * @param {object} [wizardInputs={}] - Supplemental wizard inputs
 * @param {string} [wizardInputs.ownerName] - Property owner name
 * @param {string} [wizardInputs.ownerEntity] - Ownership entity
 * @param {Array<{ url: string, category: string, caption: string }>} [wizardInputs.photographs] - Property photos
 * @param {string} [wizardInputs.attestationName] - Name for certification signature
 * @param {string} [wizardInputs.attestationText] - Custom attestation text
 * @param {string[]} [wizardInputs.amenities] - Property amenities list
 * @param {boolean} [wizardInputs.materialParticipation] - Whether owner materially participates
 * @param {number} [wizardInputs.lotSize] - Lot size in square feet
 * @param {string} [wizardInputs.useType] - "Short-Term Rental", "Long-Term Rental", etc.
 *
 * @returns {object} The complete report data structure — see inline documentation for shape
 */
export function assembleReport(studyData, wizardInputs = {}) {
  if (!studyData) {
    throw new Error("assembleReport: studyData is required");
  }

  const { property, basis, allocation, depreciation, savings, catchUp, meta } = studyData;
  const ownerName = wizardInputs.ownerName || property.ownerName || "";
  const ownerEntity = wizardInputs.ownerEntity || property.ownerEntity || "";
  const photographs = Array.isArray(wizardInputs.photographs) ? wizardInputs.photographs : [];
  const amenities = Array.isArray(wizardInputs.amenities) ? wizardInputs.amenities : [];

  // Collect all components for justification lookup
  const allComponents = [
    ...(allocation.fiveYear.components || []),
    ...(allocation.sevenYear.components || []),
    ...(allocation.fifteenYear.components || []),
  ];

  // Bonus depreciation text
  const bonusText = BONUS_DEPRECIATION_TEXT(property.placedInServiceDate);

  // Parse address parts (best-effort for property description table)
  const addressParts = parseAddress(property.propertyAddress);

  // ── Assemble the full report structure ─────────────────────────────

  return {
    // ── Meta ──────────────────────────────────────────────────────────
    meta: {
      studyId: meta.studyId,
      studyDate: meta.studyDate,
      version: meta.version,
      generatedAt: new Date().toISOString(),
    },

    // ── Cover Page ───────────────────────────────────────────────────
    coverPage: {
      title: "Cost Segregation Study",
      propertyAddress: property.propertyAddress,
      ownerName,
      ownerEntity,
      studyDate: meta.studyDate,
      propertyPhoto: photographs.length > 0 ? photographs[0].url : null,
    },

    // ── Table of Contents ────────────────────────────────────────────
    tableOfContents: buildTableOfContents(
      studyData,
      photographs.length > 0,
      hasStateBonusIssue(addressParts.state)
    ),

    // ── Executive Summary ────────────────────────────────────────────
    executiveSummary: {
      letter: generateExecutiveLetter(studyData, ownerName),
      summaryTable: buildSummaryTable(studyData),
      bonusSummary: {
        rate: depreciation.bonusRate,
        yr1Deduction: depreciation.totalFirstYearDeduction,
      },
      catchUpSummary: catchUp
        ? { adjustment481a: catchUp.adjustment }
        : null,
      savingsEstimate: {
        at32: savings.at32,
        at37: savings.at37,
      },
    },

    // ── Property Description ─────────────────────────────────────────
    propertyDescription: {
      infoTable: {
        ownerEntity: ownerEntity || ownerName,
        address: property.propertyAddress,
        city: addressParts.city,
        state: addressParts.state,
        zip: addressParts.zip,
        type: property.propertyType,
        sqft: property.sqft,
        lotSize: wizardInputs.lotSize || 0,
        beds: property.beds,
        baths: property.baths,
        yearBuilt: property.yearBuilt,
        dateInService: property.placedInServiceDate,
        acquisitionPrice: basis.purchasePrice,
        useType: wizardInputs.useType || (property.isFurnished ? "Short-Term Rental" : "Rental Property"),
      },
      narrative: generatePropertyNarrative(property, amenities),
      amenities,
      furnished: property.isFurnished,
    },

    // ── Methodology ──────────────────────────────────────────────────
    methodology: {
      overview: METHODOLOGY_TEXT.overview,
      dataSources: METHODOLOGY_TEXT.dataSources,
      csiNote: METHODOLOGY_TEXT.methodologyStatement,
      costEstimationDescription:
        "Component costs in this study are estimated using a combination of recognized construction " +
        "cost databases, regional cost adjustment factors for the " +
        "property's geographic location, and engineering judgment informed by the property's age, " +
        "condition, quality tier, and specific features identified through the property analysis. " +
        "Each component's cost is expressed as a percentage of the total depreciable basis, with " +
        "the sum of all component costs reconciling exactly to the adjusted depreciable basis.",
    },

    // ── Quality Study Elements ───────────────────────────────────────
    qualityElements: buildQualityElements(),

    // ── Engineering Procedures ────────────────────────────────────────
    engineeringProcedures: buildEngineeringProcedures(),

    // ── Certification ────────────────────────────────────────────────
    certification: {
      preamble: CERTIFICATION_TEXT.preamble,
      points: CERTIFICATION_TEXT.points,
      signatureBlock: {
        name: wizardInputs.attestationName || "Abode Cost Segregation",
        date: meta.studyDate,
        attestationText:
          wizardInputs.attestationText ||
          "I certify that the information contained in this cost segregation study is accurate " +
          "and complete to the best of my knowledge and was prepared in accordance with the " +
          "engineering-based methodology recognized by the Internal Revenue Service.",
      },
    },

    // ── Tax Classification ───────────────────────────────────────────
    taxClassification: {
      irc168Overview: LEGAL_FRAMEWORK.irc168Overview,
      recoveryClasses: buildRecoveryClassTable(),
      conventionRules: LEGAL_FRAMEWORK.conventionRules,
    },

    // ── Bonus Depreciation ───────────────────────────────────────────
    bonusDepreciation: {
      history: bonusText.history,
      currentLaw: bonusText.currentLaw,
      phaseDown: bonusText.phaseDown,
      applicableRate: bonusText.applicableRate,
      qualificationRequirements: bonusText.qualificationRequirements,
    },

    // ── Component Justifications ─────────────────────────────────────
    justifications: getApplicableJustifications(allComponents),

    // ── Material Participation ────────────────────────────────────────
    materialParticipation: buildMaterialParticipation(studyData, wizardInputs),

    // ── Limiting Conditions ──────────────────────────────────────────
    limitingConditions: [...LIMITING_CONDITIONS],

    // ── Photographs ──────────────────────────────────────────────────
    photographs: photographs.map((p) => ({
      url: p.url || "",
      category: p.category || "General",
      caption: p.caption || "",
    })),

    // ── Exhibit A: Schedule of Reconciled Costs ──────────────────────
    exhibitA: buildExhibitA(studyData),

    // ── Exhibit B: Indirect Costs Allocation ─────────────────────────
    exhibitB: buildExhibitB(studyData),

    // ── Exhibit C: Component Cost Determination ──────────────────────
    exhibitC: buildExhibitC(studyData),

    // ── Exhibit D: Adjusted Depreciable Basis Reconciliation ─────────
    exhibitD: buildExhibitD(studyData),

    // ── Exhibit E: Depreciation Report ───────────────────────────────
    exhibitE: buildExhibitE(studyData),

    // ── Exhibit F: Form 3115 Data Worksheet ──────────────────────────
    exhibitF: buildExhibitF(studyData, wizardInputs),

    // ── State Tax Conformity ─────────────────────────────────────────
    stateConformity: buildStateConformity(addressParts.state),

    // ── Recapture-on-Sale Preview ─────────────────────────────────────
    recapturePreview: buildRecapturePreview(studyData),

    // ── Back Cover ───────────────────────────────────────────────────
    backCover: {
      branding:
        "Abode Cost Segregation — AI-Powered Cost Segregation Studies for Real Estate Investors",
      contact:
        "For questions about this report, contact support@abodecostseg.com",
      disclaimer: DISCLAIMERS.generalDisclaimer,
    },
  };
}


// ─── Address Parser (Best-Effort) ────────────────────────────────────────

/**
 * Parses a US address string into components. This is a best-effort parser
 * for display purposes only — not authoritative.
 *
 * @param {string} address - Full address string
 * @returns {{ street: string, city: string, state: string, zip: string }}
 */
function parseAddress(address) {
  if (!address) return { street: "", city: "", state: "", zip: "" };

  const parts = address.split(",").map((s) => s.trim());

  if (parts.length >= 3) {
    // "123 Main St, City, ST 12345"
    const stateZip = parts[parts.length - 1];
    const stateZipMatch = stateZip.match(/^([A-Z]{2})\s*(\d{5}(?:-\d{4})?)$/);
    if (stateZipMatch) {
      return {
        street: parts.slice(0, parts.length - 2).join(", "),
        city: parts[parts.length - 2],
        state: stateZipMatch[1],
        zip: stateZipMatch[2],
      };
    }
    // "123 Main St, City, State"
    return {
      street: parts[0],
      city: parts[1],
      state: parts.slice(2).join(", "),
      zip: "",
    };
  }

  if (parts.length === 2) {
    return { street: parts[0], city: parts[1], state: "", zip: "" };
  }

  return { street: address, city: "", state: "", zip: "" };
}
