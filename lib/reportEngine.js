// ═══════════════════════════════════════════════════════════════════════════
// ABODE — IRS-Grade Cost Segregation Report Engine
//
// Generates complete cost segregation study data from wizard inputs.
// All calculations follow IRS Publication 946, Rev. Proc. 87-56,
// TCJA Sec. 168(k), and OBBBA (2025) bonus depreciation rules.
//
// Exports:
//   MACRS_TABLES, getBonusRate, checkMidQuarter, BASE_ALLOCATIONS,
//   adjustAllocation, COMPONENT_MASTER_LIST, distributeWithinClass,
//   generateStudy, RECLASSIFICATION_GUARDRAILS
// ═══════════════════════════════════════════════════════════════════════════


// ─── MACRS Depreciation Tables (IRS Pub. 946, Tables A-1, A-1a, A-14a) ───

/**
 * MACRS depreciation rate tables by recovery period.
 * Rates expressed as percentages (e.g., 20.00 = 20%).
 *
 * - 5-year: 200% DB, half-year convention (Table A-1)
 * - 7-year: 200% DB, half-year convention (Table A-1)
 * - 15-year: 150% DB, half-year convention (Table A-1)
 * - 27.5-year: Straight-line, mid-month convention (Table A-6)
 *   Year 1 rate depends on the month placed in service.
 */
export const MACRS_TABLES = {
  fiveYear: [20.00, 32.00, 19.20, 11.52, 11.52, 5.76],

  sevenYear: [14.29, 24.49, 17.49, 12.49, 8.93, 8.92, 8.93, 4.46],

  fifteenYear: [
    5.00, 9.50, 8.55, 7.70, 6.93, 6.23, 5.90, 5.90,
    5.91, 5.90, 5.91, 5.90, 5.91, 5.90, 5.91, 2.95,
  ],

  /** 27.5-year residential rental (SL, mid-month). */
  residential: {
    /** Year 1 rate by month placed in service (1-indexed: Jan=1). */
    year1ByMonth: {
      1: 3.485,  // January
      2: 3.182,  // February
      3: 2.879,  // March
      4: 2.576,  // April
      5: 2.273,  // May
      6: 1.970,  // June
      7: 1.667,  // July
      8: 1.364,  // August
      9: 1.061,  // September
      10: 0.758, // October
      11: 0.455, // November
      12: 0.152, // December
    },
    /** Years 2 through 27 rate. */
    yearsMiddle: 3.636,
    /** Year 28 rate = remainder to reach 100%. Computed at runtime. */
  },
};


// ─── Bonus Depreciation Rates ────────────────────────────────────────────

/**
 * Returns the applicable bonus depreciation rate (0-1) based on when the
 * property was placed in service and when it was acquired.
 *
 * - Post-OBBBA (acquired after Jan 19, 2025): 100% bonus restored.
 * - TCJA Sec. 168(k) phase-down: 100% for 2022 and earlier, ramping
 *   down 20% per year through 2027.
 *
 * @param {string|Date} placedInServiceDate - Date placed in service (ISO string or Date)
 * @param {string|Date} [acquisitionDate]   - Date property was acquired (ISO string or Date)
 * @returns {number} Bonus rate as decimal (e.g., 1.0 = 100%)
 */
export function getBonusRate(placedInServiceDate, acquisitionDate) {
  const pisDate = new Date(placedInServiceDate);
  const acqDate = acquisitionDate ? new Date(acquisitionDate) : pisDate;
  const pisYear = pisDate.getFullYear();

  // OBBBA: property acquired after Jan 19, 2025 gets 100% bonus
  const obbbaThreshold = new Date("2025-01-20");
  if (acqDate >= obbbaThreshold) {
    return 1.0;
  }

  // TCJA phase-down by placed-in-service year
  if (pisYear <= 2022) return 1.0;
  if (pisYear === 2023) return 0.80;
  if (pisYear === 2024) return 0.60;
  if (pisYear === 2025) return 0.40;
  if (pisYear === 2026) return 0.20;
  return 0.0; // 2027+
}


// ─── Convention Check ────────────────────────────────────────────────────

/**
 * Checks whether the mid-quarter convention applies.
 * Under IRS rules, mid-quarter is required when more than 40% of the
 * aggregate basis of all property placed in service during the year is
 * placed in service in Q4 (Oct-Dec). For a single-property study this
 * simplifies to: was the property placed in service in Q4?
 *
 * @param {string|Date} placedInServiceDate
 * @returns {boolean} True if mid-quarter convention applies
 */
export function checkMidQuarter(placedInServiceDate) {
  const month = new Date(placedInServiceDate).getMonth(); // 0-indexed
  return month >= 9; // October (9), November (10), December (11)
}


// ─── Reclassification Guardrails ─────────────────────────────────────────

/**
 * IRS-defensible guardrail ranges for reclassification percentages.
 * - acceptable: typical range seen in professional studies
 * - warning: above this triggers a review warning
 * - hardCap: absolute maximum (allocation is clamped here)
 */
export const RECLASSIFICATION_GUARDRAILS = {
  totalReclass: { acceptable: [20, 35], warning: 35, hardCap: 45 },
  fiveYear:     { acceptable: [10, 25], warning: 25, hardCap: 30 },
  fifteenYear:  { acceptable: [5, 15],  warning: 18, hardCap: 22 },
  sevenYear:    { acceptable: [0, 2],   warning: 3,  hardCap: 5 },
};


// ─── Base Allocation Tables ──────────────────────────────────────────────

/**
 * Base allocation percentages by property type.
 * Each object maps MACRS class to percentage of depreciable basis.
 * Sum of all classes = 100%.
 */
export const BASE_ALLOCATIONS = {
  /** Single-family, furnished STR (most common Abode user) */
  "sfr-furnished": {
    fiveYear: 18,
    sevenYear: 0.5,
    fifteenYear: 10,
    building: 71.5,
  },

  /** Single-family, unfurnished (LTR or unfurnished MTR) */
  "sfr-unfurnished": {
    fiveYear: 12,
    sevenYear: 0.5,
    fifteenYear: 10,
    building: 77.5,
  },

  /** Condo or townhouse (less land improvement, shared structure) */
  "condo-townhouse": {
    fiveYear: 15,
    sevenYear: 0.5,
    fifteenYear: 5,
    building: 79.5,
  },

  /** Multi-unit (duplex, triplex, fourplex) */
  "multi-unit": {
    fiveYear: 19,
    sevenYear: 0.5,
    fifteenYear: 11,
    building: 69.5,
  },
};

/**
 * Maps user-facing property type strings to BASE_ALLOCATIONS keys.
 * @param {string} propertyType - e.g., "Single Family", "Condo", "Townhouse"
 * @param {boolean} isFurnished
 * @returns {string} Key into BASE_ALLOCATIONS
 */
function resolveAllocationType(propertyType, isFurnished) {
  const t = (propertyType || "").toLowerCase();
  if (t.includes("condo") || t.includes("townhouse") || t.includes("town house")) {
    return "condo-townhouse";
  }
  if (t.includes("multi") || t.includes("duplex") || t.includes("triplex") || t.includes("fourplex")) {
    return "multi-unit";
  }
  // Default: SFR
  return isFurnished ? "sfr-furnished" : "sfr-unfurnished";
}


// ─── Wizard-Based Allocation Adjustments ─────────────────────────────────

/**
 * Adjusts the base allocation percentages based on detailed wizard answers.
 * Returns a new allocation object with guardrails applied.
 *
 * @param {{ fiveYear: number, sevenYear: number, fifteenYear: number, building: number }} baseAllocation
 *   Base percentages (summing to 100)
 * @param {object} wizardAnswers - Answers from the property detail wizard
 * @returns {{ fiveYear: number, sevenYear: number, fifteenYear: number, building: number, guardrailsApplied: boolean, guardrailWarnings: string[] }}
 */
export function adjustAllocation(baseAllocation, wizardAnswers) {
  if (!wizardAnswers || Object.keys(wizardAnswers).length === 0) {
    return {
      ...baseAllocation,
      guardrailsApplied: false,
      guardrailWarnings: [],
    };
  }

  const w = wizardAnswers;
  let adj5 = 0;
  let adj7 = 0;
  let adj15 = 0;

  // ── Kitchen quality adjustments (5-year) ──
  const kitchenTiers = { luxury: 2.0, premium: 1.0, mid: 0.0, standard: -0.5 };

  if (w.countertops) {
    const counterMap = { marble: "luxury", granite: "premium", quartz: "premium", concrete: "premium", "butcher-block": "mid", tile: "mid", laminate: "standard" };
    const tier = counterMap[w.countertops] || "mid";
    adj5 += kitchenTiers[tier] || 0;
  }
  if (w.cabinetry) {
    const cabMap = { custom: "luxury", "semi-custom": "premium", stock: "standard" };
    const tier = cabMap[w.cabinetry] || "mid";
    adj5 += kitchenTiers[tier] || 0;
  }
  if (w.appliances) {
    const appMap = { premium: "luxury", "mid-range": "premium", standard: "standard" };
    const tier = appMap[w.appliances] || "mid";
    adj5 += kitchenTiers[tier] || 0;
  }

  // ── Flooring adjustments (5-year) ──
  if (w["primary-flooring"]) {
    const floorAdj = {
      carpet: 1.5, lvp: 1.5, laminate: 1.0,          // easily removable = more 5yr
      hardwood: 0.5, "engineered": 0.5,               // attached but separable
      tile: -0.5, stone: -1.0,                        // adhered = less separable
    };
    adj5 += floorAdj[w["primary-flooring"]] || 0;
  }
  if (w["flooring-condition"] === "new") {
    adj5 += 0.5;
  }

  // ── Outdoor improvements (15-year) ──
  if (w.pool && w.pool !== "none") {
    const poolAdj = { saltwater: 3.0, chlorine: 2.5, plunge: 2.0 };
    adj15 += poolAdj[w.pool] || 2.0;
  }
  if (Array.isArray(w["pool-features"])) {
    adj15 += w["pool-features"].filter(f => f !== "none").length * 0.5;
  }

  if (w["deck-patio"] && w["deck-patio"] !== "none") {
    const deckAdj = { composite: 2.0, "wood-deck": 1.5, paver: 2.0, "concrete-patio": 1.0 };
    adj15 += deckAdj[w["deck-patio"]] || 1.0;
  }

  if (w.landscaping) {
    const landAdj = { professional: 2.0, moderate: 1.0, desert: 1.0, minimal: 0 };
    adj15 += landAdj[w.landscaping] || 0;
  }

  if (w.fencing && w.fencing !== "none") {
    const fenceAdj = { "block-wall": 1.5, "wrought-iron": 1.5, privacy: 1.0 };
    adj15 += fenceAdj[w.fencing] || 0.5;
  }

  // Driveway / parking (from outdoor-features or separate field)
  if (Array.isArray(w["outdoor-features"])) {
    const features = w["outdoor-features"].filter(f => f !== "none");
    if (features.includes("outdoor-kitchen")) adj15 += 1.5;
    if (features.includes("fire-pit")) adj15 += 1.0;
    if (features.includes("pergola")) adj15 += 1.5;
    if (features.includes("outdoor-shower")) adj15 += 0.5;
    if (features.includes("sport-court")) adj15 += 2.0;
    if (features.includes("playground")) adj15 += 0.5;
  }

  // ── Interior finishes (5-year) ──
  if (w.lighting) {
    const lightAdj = { designer: 1.5, recessed: 1.0, updated: 0.5, original: 0 };
    adj5 += lightAdj[w.lighting] || 0;
  }
  if (w["window-treatments"]) {
    const wtAdj = { motorized: 1.0, plantation: 0.7, custom: 0.5, standard: 0 };
    adj5 += wtAdj[w["window-treatments"]] || 0;
  }
  if (Array.isArray(w["interior-features"])) {
    const feats = w["interior-features"].filter(f => f !== "none");
    adj5 += feats.length * 0.4;
  }

  // ── Smart home & security (5-year) ──
  if (w.security && w.security !== "none") {
    const secAdj = { professional: 0.8, diy: 0.4, "cameras-only": 0.3 };
    adj5 += secAdj[w.security] || 0;
  }
  if (Array.isArray(w["smart-features"])) {
    adj5 += w["smart-features"].filter(f => f !== "none").length * 0.3;
  }

  // ── Specialty & amenities ──
  if (Array.isArray(w.entertainment)) {
    const ent = w.entertainment.filter(f => f !== "none");
    adj5 += ent.length * 0.5;
  }
  if (Array.isArray(w["unique-features"])) {
    const uniq = w["unique-features"].filter(f => f !== "none");
    // Most unique features are land improvements (15-year)
    adj15 += uniq.length * 0.8;
  }

  // ── Bathroom adjustments (5-year) ──
  if (w["bath-count-updated"]) {
    const bathAdj = { all: 1.5, most: 1.0, some: 0.5, none: 0 };
    adj5 += bathAdj[w["bath-count-updated"]] || 0;
  }
  if (w.fixtures) {
    const fixAdj = { luxury: 1.0, premium: 0.5, standard: 0 };
    adj5 += fixAdj[w.fixtures] || 0;
  }
  if (Array.isArray(w["bath-features"])) {
    adj5 += w["bath-features"].filter(f => f !== "none").length * 0.3;
  }

  // ── Age adjustments ──
  if (w._yearBuilt) {
    const age = new Date().getFullYear() - w._yearBuilt;
    if (age > 30) { adj5 += 1.5; adj15 += 1.0; }
    else if (age > 20) { adj5 += 1.0; adj15 += 0.5; }
    else if (age > 10) { adj5 += 0.5; }
    else if (age < 3) { adj5 -= 1.0; adj15 -= 0.5; }
  }

  // ── Furnished STR bonus ──
  if (w._isFurnished) {
    adj5 += 2.0;
  }

  // ── Apply adjustments ──
  let fiveYear = baseAllocation.fiveYear + adj5;
  let sevenYear = baseAllocation.sevenYear + adj7;
  let fifteenYear = baseAllocation.fifteenYear + adj15;

  // ── Guardrails ──
  const warnings = [];
  let guardrailsApplied = false;

  // Individual class caps
  if (fiveYear > RECLASSIFICATION_GUARDRAILS.fiveYear.warning) {
    warnings.push(`5-year allocation (${fiveYear.toFixed(1)}%) exceeds typical range. Capped at ${RECLASSIFICATION_GUARDRAILS.fiveYear.hardCap}%.`);
  }
  if (fiveYear > RECLASSIFICATION_GUARDRAILS.fiveYear.hardCap) {
    fiveYear = RECLASSIFICATION_GUARDRAILS.fiveYear.hardCap;
    guardrailsApplied = true;
  }

  if (sevenYear > RECLASSIFICATION_GUARDRAILS.sevenYear.warning) {
    warnings.push(`7-year allocation (${sevenYear.toFixed(1)}%) exceeds typical range. Capped at ${RECLASSIFICATION_GUARDRAILS.sevenYear.hardCap}%.`);
  }
  if (sevenYear > RECLASSIFICATION_GUARDRAILS.sevenYear.hardCap) {
    sevenYear = RECLASSIFICATION_GUARDRAILS.sevenYear.hardCap;
    guardrailsApplied = true;
  }

  if (fifteenYear > RECLASSIFICATION_GUARDRAILS.fifteenYear.warning) {
    warnings.push(`15-year allocation (${fifteenYear.toFixed(1)}%) exceeds typical range. Capped at ${RECLASSIFICATION_GUARDRAILS.fifteenYear.hardCap}%.`);
  }
  if (fifteenYear > RECLASSIFICATION_GUARDRAILS.fifteenYear.hardCap) {
    fifteenYear = RECLASSIFICATION_GUARDRAILS.fifteenYear.hardCap;
    guardrailsApplied = true;
  }

  // Ensure non-negative
  fiveYear = Math.max(0, fiveYear);
  sevenYear = Math.max(0, sevenYear);
  fifteenYear = Math.max(0, fifteenYear);

  // Total reclass check
  let totalReclass = fiveYear + sevenYear + fifteenYear;
  if (totalReclass > RECLASSIFICATION_GUARDRAILS.totalReclass.warning) {
    warnings.push(`Total reclassification (${totalReclass.toFixed(1)}%) exceeds typical range of ${RECLASSIFICATION_GUARDRAILS.totalReclass.acceptable[0]}-${RECLASSIFICATION_GUARDRAILS.totalReclass.acceptable[1]}%.`);
  }
  if (totalReclass > RECLASSIFICATION_GUARDRAILS.totalReclass.hardCap) {
    // Scale down proportionally to fit under the hard cap
    const scale = RECLASSIFICATION_GUARDRAILS.totalReclass.hardCap / totalReclass;
    fiveYear = fiveYear * scale;
    sevenYear = sevenYear * scale;
    fifteenYear = fifteenYear * scale;
    totalReclass = fiveYear + sevenYear + fifteenYear;
    guardrailsApplied = true;
    warnings.push(`Total reclassification scaled to ${RECLASSIFICATION_GUARDRAILS.totalReclass.hardCap}% hard cap.`);
  }

  // Building = remainder
  const building = 100 - fiveYear - sevenYear - fifteenYear;

  return {
    fiveYear: Math.round(fiveYear * 100) / 100,
    sevenYear: Math.round(sevenYear * 100) / 100,
    fifteenYear: Math.round(fifteenYear * 100) / 100,
    building: Math.round(building * 100) / 100,
    guardrailsApplied,
    guardrailWarnings: warnings,
  };
}


// ─── Component Master List ───────────────────────────────────────────────

/**
 * Full component registry with IRS asset class references and legal citations.
 * Each entry represents a reclassifiable building component per Rev. Proc. 87-56
 * and the Hospital Corp. of America v. Commissioner framework.
 *
 * @type {Array<{
 *   id: string,
 *   name: string,
 *   category: string,
 *   macrsClass: number,
 *   assetClass: string,
 *   legalCitation: string,
 *   description: string,
 *   typicalPercentRange: [number, number],
 *   weight: number
 * }>}
 */
export const COMPONENT_MASTER_LIST = [
  // ── 5-Year Personal Property (Sec. 1245, Asset Class 57.0) ──────────

  {
    id: "kitchen-cabinets",
    name: "Kitchen Cabinets",
    category: "kitchen",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Whiteco Industries v. Commissioner",
    description: "Removable cabinetry not permanently affixed to the building structure",
    typicalPercentRange: [1.5, 4.0],
    weight: 3.0,
  },
  {
    id: "countertops",
    name: "Countertops",
    category: "kitchen",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Whiteco Industries v. Commissioner",
    description: "Kitchen and bathroom countertop surfaces (granite, quartz, marble, laminate)",
    typicalPercentRange: [0.8, 2.5],
    weight: 2.0,
  },
  {
    id: "appliances",
    name: "Appliances",
    category: "kitchen",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1245 personal property",
    description: "Refrigerator, range/oven, dishwasher, microwave, disposal, range hood",
    typicalPercentRange: [1.0, 3.0],
    weight: 2.5,
  },
  {
    id: "flooring-non-permanent",
    name: "Flooring (Non-Permanent)",
    category: "flooring",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Hospital Corp. of America v. Commissioner",
    description: "Carpet, LVP, laminate, vinyl — flooring not permanently adhered to structure",
    typicalPercentRange: [1.5, 4.0],
    weight: 3.0,
  },
  {
    id: "wall-coverings",
    name: "Wall Coverings & Window Treatments",
    category: "interior",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1245 personal property",
    description: "Blinds, shutters, drapes, removable wall coverings, accent paneling",
    typicalPercentRange: [0.3, 1.5],
    weight: 1.0,
  },
  {
    id: "special-lighting",
    name: "Decorative & Special-Purpose Lighting",
    category: "interior",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; decorative fixtures as personal property",
    description: "Chandeliers, pendant lights, track lighting, under-cabinet lighting, recessed cans with decorative trim",
    typicalPercentRange: [0.3, 1.5],
    weight: 1.0,
  },
  {
    id: "ceiling-fans",
    name: "Ceiling Fans",
    category: "interior",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; removable fixtures",
    description: "Ceiling-mounted fans with or without integrated light kits",
    typicalPercentRange: [0.1, 0.5],
    weight: 0.4,
  },
  {
    id: "plumbing-pp",
    name: "Plumbing Serving Personal Property",
    category: "kitchen",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1.48-1(e)(2)",
    description: "Supply and drain lines dedicated to removable appliances (ice makers, disposals, dishwashers)",
    typicalPercentRange: [0.2, 0.8],
    weight: 0.5,
  },
  {
    id: "electrical-pp",
    name: "Electrical Serving Personal Property",
    category: "kitchen",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1.48-1(e)(2)",
    description: "Dedicated circuits for appliances, HVAC equipment, and removable fixtures",
    typicalPercentRange: [0.3, 1.0],
    weight: 0.6,
  },
  {
    id: "data-comms",
    name: "Data, TV & Communications Wiring",
    category: "interior",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1245 personal property",
    description: "Coaxial, Cat5/6 ethernet, fiber, structured wiring panels, TV jacks",
    typicalPercentRange: [0.2, 0.8],
    weight: 0.5,
  },
  {
    id: "shelving-closets",
    name: "Shelving & Closet Systems",
    category: "interior",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; removable storage systems",
    description: "Built-in shelving, custom closet organizers, pantry systems",
    typicalPercentRange: [0.2, 0.8],
    weight: 0.5,
  },
  {
    id: "ornamental",
    name: "Ornamental Items & Decorative Millwork",
    category: "interior",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Whiteco Industries",
    description: "Crown molding, wainscoting, chair rails, decorative columns, mantels",
    typicalPercentRange: [0.2, 1.0],
    weight: 0.6,
  },
  {
    id: "str-furnishings",
    name: "STR Furnishings & Equipment",
    category: "specialty",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1245 tangible personal property",
    description: "Furniture, beds, linens, kitchenware, TVs, game equipment, gym equipment — all furnishings for STR operation",
    typicalPercentRange: [1.0, 5.0],
    weight: 3.0,
  },
  {
    id: "bathroom-fixtures",
    name: "Bathroom Fixtures & Accessories",
    category: "bathroom",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; removable fixtures",
    description: "Vanities, mirrors, towel bars, toilet accessories, medicine cabinets, shower doors",
    typicalPercentRange: [0.5, 2.0],
    weight: 1.2,
  },
  {
    id: "security-system",
    name: "Security & Smart Home Systems",
    category: "specialty",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1245 personal property",
    description: "Alarm panels, cameras, smart locks, thermostats, home automation controllers",
    typicalPercentRange: [0.2, 1.0],
    weight: 0.6,
  },
  {
    id: "hvac-equipment",
    name: "HVAC Equipment",
    category: "systems",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; Sec. 1245 when serving specific equipment",
    description: "Condensing units, air handlers, mini-splits, thermostats — equipment portion only",
    typicalPercentRange: [0.5, 2.0],
    weight: 1.5,
  },
  {
    id: "water-heater",
    name: "Water Heater",
    category: "systems",
    macrsClass: 5,
    assetClass: "57.0",
    legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; removable equipment",
    description: "Tank or tankless water heater units",
    typicalPercentRange: [0.2, 0.8],
    weight: 0.5,
  },

  // ── 7-Year Property (Sec. 1245, Asset Class 00.11/57.0) ────────────

  {
    id: "office-cabinets",
    name: "Office / Built-In Cabinetry",
    category: "interior",
    macrsClass: 7,
    assetClass: "00.11",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.11; office furniture and fixtures",
    description: "Permanent built-in office cabinets, desks, and workstation millwork",
    typicalPercentRange: [0.05, 0.3],
    weight: 0.3,
  },
  {
    id: "break-room-sink",
    name: "Break Room / Utility Sink",
    category: "kitchen",
    macrsClass: 7,
    assetClass: "00.11",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.11; ancillary building fixtures",
    description: "Utility sinks, wet bars, and break room plumbing fixtures",
    typicalPercentRange: [0.05, 0.2],
    weight: 0.2,
  },
  {
    id: "telephone-wiring",
    name: "Telephone & Legacy Wiring",
    category: "systems",
    macrsClass: 7,
    assetClass: "00.11",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.11; telephone distribution equipment",
    description: "Telephone wiring, jacks, distribution panels, and legacy comm systems",
    typicalPercentRange: [0.05, 0.3],
    weight: 0.2,
  },

  // ── 15-Year Land Improvements (Sec. 1250, Asset Class 00.3) ────────

  {
    id: "pool-hot-tub",
    name: "Swimming Pool & Hot Tub",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "In-ground or above-ground pool, hot tub, spa, pool equipment, decking around pool",
    typicalPercentRange: [1.0, 5.0],
    weight: 4.0,
  },
  {
    id: "deck-patio-pergola",
    name: "Deck, Patio & Pergola",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Wood or composite decks, concrete/paver patios, pergolas, covered outdoor structures",
    typicalPercentRange: [0.5, 3.0],
    weight: 2.5,
  },
  {
    id: "landscaping",
    name: "Landscaping",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Trees, shrubs, sod, mulch, decorative rock, flower beds, xeriscape, irrigation heads",
    typicalPercentRange: [0.5, 3.0],
    weight: 2.0,
  },
  {
    id: "fencing",
    name: "Fencing",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Privacy fence, wrought iron, block walls, gates, posts",
    typicalPercentRange: [0.3, 2.0],
    weight: 1.5,
  },
  {
    id: "driveway-parking",
    name: "Driveway & Parking Areas",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Concrete, asphalt, or paver driveway, parking pads, turnarounds",
    typicalPercentRange: [0.3, 1.5],
    weight: 1.2,
  },
  {
    id: "sidewalks",
    name: "Sidewalks & Walkways",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Concrete, flagstone, or paver walkways, stepping stones, entry paths",
    typicalPercentRange: [0.1, 0.8],
    weight: 0.6,
  },
  {
    id: "exterior-lighting",
    name: "Exterior & Landscape Lighting",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; site lighting",
    description: "Path lights, uplights, security flood lights, string lights on permanent posts",
    typicalPercentRange: [0.1, 0.8],
    weight: 0.6,
  },
  {
    id: "storm-drainage",
    name: "Storm Drainage & Grading",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "French drains, catch basins, swales, grading, drainage pipes",
    typicalPercentRange: [0.1, 0.5],
    weight: 0.4,
  },
  {
    id: "retaining-walls",
    name: "Retaining Walls",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Block, stone, timber, or poured concrete retaining walls",
    typicalPercentRange: [0.1, 1.0],
    weight: 0.6,
  },
  {
    id: "irrigation",
    name: "Irrigation System",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Sprinkler system, drip irrigation, controllers, valves, backflow preventer",
    typicalPercentRange: [0.1, 0.8],
    weight: 0.5,
  },
  {
    id: "carport",
    name: "Carport / Detached Garage",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; detached site improvement",
    description: "Carport structure, detached garage (if not integrated into building envelope)",
    typicalPercentRange: [0.2, 1.5],
    weight: 0.8,
  },
  {
    id: "outdoor-kitchen-firepit",
    name: "Outdoor Kitchen & Fire Pit",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
    description: "Built-in grill, outdoor counters, fire pit, fireplace, pizza oven",
    typicalPercentRange: [0.3, 2.0],
    weight: 1.5,
  },
  {
    id: "exterior-electrical",
    name: "Exterior Electrical & EV Charging",
    category: "outdoor",
    macrsClass: 15,
    assetClass: "00.3",
    legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; site electrical",
    description: "Exterior electrical panels, EV charging stations, outdoor outlet posts",
    typicalPercentRange: [0.1, 0.5],
    weight: 0.4,
  },
];


// ─── Component Distribution ──────────────────────────────────────────────

/**
 * Distributes a dollar total for a MACRS class across individual components
 * using weighted allocation. Weights are adjusted based on wizard answers
 * when available.
 *
 * @param {number} classTotal   - Total dollar amount for this MACRS class
 * @param {number} macrsClass   - 5, 7, or 15
 * @param {object} wizardAnswers - Wizard answers for weight adjustments
 * @returns {Array<{
 *   componentId: string, name: string, category: string,
 *   macrsClass: number, assetClass: string, legalCitation: string,
 *   quantity: number, unit: string, costBasis: number, percentOfBasis: number
 * }>}
 */
export function distributeWithinClass(classTotal, macrsClass, wizardAnswers) {
  const components = COMPONENT_MASTER_LIST.filter(c => c.macrsClass === macrsClass);
  if (components.length === 0 || classTotal <= 0) return [];

  const w = wizardAnswers || {};

  // Build adjusted weights per component
  const weightedComponents = components.map(comp => {
    let weight = comp.weight;

    // Adjust weights based on wizard answers
    switch (comp.id) {
      case "kitchen-cabinets":
        if (w.cabinetry === "custom") weight *= 1.8;
        else if (w.cabinetry === "semi-custom") weight *= 1.3;
        else if (w.cabinetry === "stock") weight *= 0.7;
        break;

      case "countertops":
        if (w.countertops === "marble" || w.countertops === "quartz") weight *= 1.6;
        else if (w.countertops === "granite" || w.countertops === "concrete") weight *= 1.3;
        else if (w.countertops === "laminate") weight *= 0.6;
        break;

      case "appliances":
        if (w.appliances === "premium") weight *= 2.0;
        else if (w.appliances === "mid-range") weight *= 1.3;
        else if (w.appliances === "standard") weight *= 0.7;
        break;

      case "flooring-non-permanent":
        if (w["primary-flooring"] === "carpet" || w["primary-flooring"] === "lvp" || w["primary-flooring"] === "laminate") {
          weight *= 1.8;
        } else if (w["primary-flooring"] === "tile" || w["primary-flooring"] === "stone") {
          weight *= 0.4; // adhered flooring = less personal property
        }
        if (w["flooring-condition"] === "new") weight *= 1.3;
        break;

      case "wall-coverings":
        if (w["window-treatments"] === "plantation" || w["window-treatments"] === "motorized") weight *= 1.8;
        else if (w["window-treatments"] === "custom") weight *= 1.3;
        break;

      case "special-lighting":
        if (w.lighting === "designer") weight *= 2.0;
        else if (w.lighting === "recessed") weight *= 1.4;
        break;

      case "str-furnishings":
        if (w._isFurnished) weight *= 2.0;
        else weight *= 0.1; // unfurnished = minimal furnishing allocation
        break;

      case "bathroom-fixtures":
        if (w["bath-count-updated"] === "all") weight *= 1.5;
        else if (w["bath-count-updated"] === "none") weight *= 0.5;
        if (w.fixtures === "luxury") weight *= 1.6;
        break;

      case "security-system":
        if (w.security === "professional") weight *= 1.8;
        else if (w.security === "none") weight *= 0.1;
        break;

      case "hvac-equipment":
        if (w["hvac-type"] === "mini-split") weight *= 1.5;
        else if (w["hvac-type"] === "central-new") weight *= 1.3;
        else if (w["hvac-type"] === "window") weight *= 0.5;
        break;

      case "water-heater":
        if (w["water-heater"] === "tankless") weight *= 1.5;
        else if (w["water-heater"] === "tank-original") weight *= 0.6;
        break;

      // 15-year components
      case "pool-hot-tub":
        if (w.pool === "none" || !w.pool) weight *= 0.05;
        else if (w.pool === "saltwater") weight *= 1.5;
        if (Array.isArray(w["pool-features"]) && w["pool-features"].includes("hot-tub")) weight *= 1.3;
        break;

      case "deck-patio-pergola":
        if (w["deck-patio"] === "none" || !w["deck-patio"]) weight *= 0.1;
        else if (w["deck-patio"] === "composite" || w["deck-patio"] === "paver") weight *= 1.5;
        if (Array.isArray(w["outdoor-features"]) && w["outdoor-features"].includes("pergola")) weight *= 1.4;
        break;

      case "landscaping":
        if (w.landscaping === "professional") weight *= 1.8;
        else if (w.landscaping === "minimal") weight *= 0.4;
        break;

      case "fencing":
        if (w.fencing === "none" || !w.fencing) weight *= 0.05;
        else if (w.fencing === "block-wall") weight *= 1.5;
        break;

      case "outdoor-kitchen-firepit":
        if (Array.isArray(w["outdoor-features"])) {
          const has = (f) => w["outdoor-features"].includes(f);
          if (has("outdoor-kitchen") && has("fire-pit")) weight *= 2.0;
          else if (has("outdoor-kitchen") || has("fire-pit")) weight *= 1.5;
          else weight *= 0.1;
        } else {
          weight *= 0.1;
        }
        break;

      // For components with no specific wizard answer, keep default weight
      default:
        break;
    }

    return { ...comp, adjustedWeight: Math.max(weight, 0.01) };
  });

  // Calculate total weight and distribute
  const totalWeight = weightedComponents.reduce((sum, c) => sum + c.adjustedWeight, 0);

  // First pass: compute raw allocations
  const rawAllocations = weightedComponents.map(comp => {
    const rawAmount = (comp.adjustedWeight / totalWeight) * classTotal;
    return {
      componentId: comp.id,
      name: comp.name,
      category: comp.category,
      macrsClass: comp.macrsClass,
      assetClass: comp.assetClass,
      legalCitation: comp.legalCitation,
      quantity: 1,
      unit: "allowance",
      costBasis: Math.round(rawAmount),
      percentOfBasis: 0, // filled in later with full-basis context
    };
  });

  // Reconcile rounding: adjust largest component to absorb difference
  const allocatedSum = rawAllocations.reduce((s, c) => s + c.costBasis, 0);
  const diff = classTotal - allocatedSum;
  if (diff !== 0 && rawAllocations.length > 0) {
    // Find the component with the largest allocation
    let maxIdx = 0;
    for (let i = 1; i < rawAllocations.length; i++) {
      if (rawAllocations[i].costBasis > rawAllocations[maxIdx].costBasis) maxIdx = i;
    }
    rawAllocations[maxIdx].costBasis += diff;
  }

  // Filter out zero-dollar components
  return rawAllocations.filter(c => c.costBasis > 0);
}


// ─── Year-By-Year Depreciation Schedule ──────────────────────────────────

/**
 * Builds a full year-by-year MACRS depreciation schedule.
 *
 * @param {number} amount        - Cost basis for this class
 * @param {number[]} rateTable   - MACRS rate table (percentages)
 * @param {number} bonusRate     - Bonus depreciation rate (0-1)
 * @returns {{ bonus: number, regularSchedule: number[], regularYr1: number }}
 */
function buildClassSchedule(amount, rateTable, bonusRate) {
  const bonus = Math.round(amount * bonusRate);
  const remaining = amount - bonus;

  const regularSchedule = rateTable.map(rate => Math.round(remaining * rate / 100));

  // Reconcile rounding on regular schedule
  const scheduledTotal = regularSchedule.reduce((s, v) => s + v, 0);
  const schedDiff = remaining - scheduledTotal;
  if (schedDiff !== 0 && regularSchedule.length > 0) {
    regularSchedule[0] += schedDiff;
  }

  return {
    bonus,
    regularSchedule,
    regularYr1: regularSchedule[0] || 0,
  };
}

/**
 * Builds the 27.5-year residential building schedule.
 *
 * @param {number} amount       - Building (27.5yr) cost basis
 * @param {number} monthPlaced  - Month placed in service (1-12)
 * @returns {number[]} Array of 28 annual depreciation amounts
 */
function buildResidentialSchedule(amount, monthPlaced) {
  const yr1Rate = MACRS_TABLES.residential.year1ByMonth[monthPlaced] || MACRS_TABLES.residential.year1ByMonth[1];
  const midRate = MACRS_TABLES.residential.yearsMiddle;

  const schedule = [];
  schedule.push(Math.round(amount * yr1Rate / 100)); // Year 1

  for (let y = 2; y <= 27; y++) {
    schedule.push(Math.round(amount * midRate / 100));
  }

  // Year 28: remainder
  const accumulated = schedule.reduce((s, v) => s + v, 0);
  const yr28 = amount - accumulated;
  if (yr28 > 0) {
    schedule.push(yr28);
  }

  return schedule;
}


// ─── 481(a) Catch-Up Calculation ─────────────────────────────────────────

/**
 * Calculates the Sec. 481(a) adjustment for properties placed in service
 * in prior years where cost segregation was not originally applied.
 *
 * @param {number} depreciableBasis
 * @param {{ fiveYear: number, sevenYear: number, fifteenYear: number, building: number }} allocPercents
 * @param {number} monthPlaced       - Month originally placed in service (1-12)
 * @param {number} yearPlaced        - Year originally placed in service
 * @param {number} currentYear       - Year the catch-up is being claimed
 * @returns {null|{ oldMethodTotal: number, newMethodTotal: number, adjustment: number, yearByYear: Array }}
 */
function calculateCatchUp(depreciableBasis, allocPercents, monthPlaced, yearPlaced, currentYear) {
  const yearsHeld = currentYear - yearPlaced;
  if (yearsHeld < 1) return null;

  // Old method: entire depreciable basis on 27.5-year SL
  const oldSchedule = buildResidentialSchedule(depreciableBasis, monthPlaced);
  let oldMethodTotal = 0;
  for (let i = 0; i < yearsHeld && i < oldSchedule.length; i++) {
    oldMethodTotal += oldSchedule[i];
  }

  // New method: what SHOULD have been claimed with cost seg
  const fiveAmt = Math.round(depreciableBasis * allocPercents.fiveYear / 100);
  const sevenAmt = Math.round(depreciableBasis * allocPercents.sevenYear / 100);
  const fifteenAmt = Math.round(depreciableBasis * allocPercents.fifteenYear / 100);
  const buildingAmt = depreciableBasis - fiveAmt - sevenAmt - fifteenAmt;

  const fiveSched = MACRS_TABLES.fiveYear;
  const sevenSched = MACRS_TABLES.sevenYear;
  const fifteenSched = MACRS_TABLES.fifteenYear;
  const buildingSched = buildResidentialSchedule(buildingAmt, monthPlaced);

  let newMethodTotal = 0;
  const yearByYear = [];

  for (let i = 0; i < yearsHeld; i++) {
    const yr = yearPlaced + i;
    const fiveYr = i < fiveSched.length ? Math.round(fiveAmt * fiveSched[i] / 100) : 0;
    const sevenYr = i < sevenSched.length ? Math.round(sevenAmt * sevenSched[i] / 100) : 0;
    const fifteenYr = i < fifteenSched.length ? Math.round(fifteenAmt * fifteenSched[i] / 100) : 0;
    const bldg = i < buildingSched.length ? buildingSched[i] : 0;
    const newTotal = fiveYr + sevenYr + fifteenYr + bldg;
    const oldAmt = i < oldSchedule.length ? oldSchedule[i] : 0;

    newMethodTotal += newTotal;

    yearByYear.push({
      year: yr,
      oldMethod: oldAmt,
      newMethod: newTotal,
      cumOld: yearByYear.length > 0
        ? yearByYear[yearByYear.length - 1].cumOld + oldAmt
        : oldAmt,
      cumNew: yearByYear.length > 0
        ? yearByYear[yearByYear.length - 1].cumNew + newTotal
        : newTotal,
    });
  }

  // Fix cumulative — recalculate cleanly
  let runOld = 0;
  let runNew = 0;
  for (const row of yearByYear) {
    runOld += row.oldMethod;
    runNew += row.newMethod;
    row.cumOld = runOld;
    row.cumNew = runNew;
  }

  return {
    oldMethodTotal,
    newMethodTotal,
    adjustment: newMethodTotal - oldMethodTotal,
    yearByYear,
  };
}


// ─── Main Study Generator ────────────────────────────────────────────────

/**
 * Generates a complete cost segregation study data structure.
 *
 * @param {object} inputs
 * @param {number}  inputs.purchasePrice       - Total acquisition price
 * @param {number}  [inputs.closingCosts=0]    - Closing costs added to basis
 * @param {number}  inputs.landValue           - Allocated land value (not depreciable)
 * @param {string|Date} inputs.placedInServiceDate - Date property was placed in service
 * @param {string|Date} [inputs.acquisitionDate]   - Date property was acquired (defaults to PIS date)
 * @param {string}  [inputs.ownerName]         - Property owner name
 * @param {string}  [inputs.ownerEntity]       - Ownership entity (LLC, trust, etc.)
 * @param {string}  [inputs.propertyAddress]   - Full property address
 * @param {string}  [inputs.propertyType]      - "Single Family", "Condo", "Townhouse", "Multi-Unit"
 * @param {number}  [inputs.sqft]              - Square footage
 * @param {number}  [inputs.beds]              - Bedroom count
 * @param {number}  [inputs.baths]             - Bathroom count
 * @param {number}  [inputs.yearBuilt]         - Year the structure was built
 * @param {boolean} [inputs.isFurnished=true]  - Whether property is furnished (STR default)
 * @param {boolean} [inputs.materialParticipation=false] - Whether owner materially participates
 * @param {object}  [inputs.wizardAnswers={}]  - Detailed property wizard answers
 * @param {number}  [inputs.taxBracket=32]     - Marginal federal tax bracket (percent, e.g. 32)
 *
 * @returns {object} Complete study data — see JSDoc at bottom for full shape
 */
export function generateStudy(inputs) {
  const {
    purchasePrice,
    closingCosts = 0,
    landValue,
    placedInServiceDate,
    acquisitionDate,
    ownerName = "",
    ownerEntity = "",
    propertyAddress = "",
    propertyType = "Single Family",
    sqft = 0,
    beds = 0,
    baths = 0,
    yearBuilt = 2010,
    isFurnished = true,
    materialParticipation = false,
    wizardAnswers = {},
    taxBracket = 32,
  } = inputs;

  const pisDate = new Date(placedInServiceDate);
  const acqDate = acquisitionDate ? new Date(acquisitionDate) : pisDate;
  const pisYear = pisDate.getFullYear();
  const pisMonth = pisDate.getMonth() + 1; // 1-indexed
  const currentYear = new Date().getFullYear();

  // ── Basis Calculation ──────────────────────────────────────────────
  const land = Math.round(landValue || 0);
  const landRatio = purchasePrice > 0 ? land / purchasePrice : 0;
  const depreciableBasis = purchasePrice - land;
  const adjustedBasis = depreciableBasis + Math.round(closingCosts);

  // ── Resolve allocation type and get base percentages ───────────────
  const allocType = resolveAllocationType(propertyType, isFurnished);
  const baseAlloc = BASE_ALLOCATIONS[allocType];

  // Inject hidden fields for adjustment logic
  const enrichedAnswers = {
    ...wizardAnswers,
    _yearBuilt: yearBuilt,
    _isFurnished: isFurnished,
  };

  // ── Adjust allocation ──────────────────────────────────────────────
  const adjusted = adjustAllocation(baseAlloc, enrichedAnswers);

  // ── Dollar amounts per class (computed from adjustedBasis) ─────────
  const fiveYearAmt = Math.round(adjustedBasis * adjusted.fiveYear / 100);
  const sevenYearAmt = Math.round(adjustedBasis * adjusted.sevenYear / 100);
  const fifteenYearAmt = Math.round(adjustedBasis * adjusted.fifteenYear / 100);
  // Building = exact remainder to guarantee reconciliation
  const buildingAmt = adjustedBasis - fiveYearAmt - sevenYearAmt - fifteenYearAmt;

  const totalReclassPercent = adjusted.fiveYear + adjusted.sevenYear + adjusted.fifteenYear;
  const totalReclassAmount = fiveYearAmt + sevenYearAmt + fifteenYearAmt;

  // ── Component Distribution ─────────────────────────────────────────
  const fiveYearComponents = distributeWithinClass(fiveYearAmt, 5, enrichedAnswers);
  const sevenYearComponents = distributeWithinClass(sevenYearAmt, 7, enrichedAnswers);
  const fifteenYearComponents = distributeWithinClass(fifteenYearAmt, 15, enrichedAnswers);

  // Stamp percentOfBasis on each component
  const stampPercent = (components) => {
    for (const c of components) {
      c.percentOfBasis = adjustedBasis > 0
        ? Math.round((c.costBasis / adjustedBasis) * 10000) / 100 // two decimal places
        : 0;
    }
  };
  stampPercent(fiveYearComponents);
  stampPercent(sevenYearComponents);
  stampPercent(fifteenYearComponents);

  // ── Depreciation Schedules ─────────────────────────────────────────
  const bonusRate = getBonusRate(pisDate, acqDate);
  const isCatchUp = pisYear < currentYear;
  const convention = checkMidQuarter(pisDate) ? "mid-quarter" : "half-year";

  const fiveYearSched = buildClassSchedule(fiveYearAmt, MACRS_TABLES.fiveYear, bonusRate);
  const sevenYearSched = buildClassSchedule(sevenYearAmt, MACRS_TABLES.sevenYear, bonusRate);
  const fifteenYearSched = buildClassSchedule(fifteenYearAmt, MACRS_TABLES.fifteenYear, bonusRate);
  const buildingSchedule = buildResidentialSchedule(buildingAmt, pisMonth);

  // Total first-year deduction
  const totalFirstYearDeduction =
    fiveYearSched.bonus + fiveYearSched.regularYr1 +
    sevenYearSched.bonus + sevenYearSched.regularYr1 +
    fifteenYearSched.bonus + fifteenYearSched.regularYr1 +
    (buildingSchedule[0] || 0);

  // ── Year-by-Year Schedule (up to 28 years) ─────────────────────────
  const maxYears = 28;
  const yearByYearSchedule = [];
  let accumulated = 0;

  for (let i = 0; i < maxYears; i++) {
    const yr = pisYear + i;
    const fiveYr = (i === 0 ? fiveYearSched.bonus : 0) +
      (i < fiveYearSched.regularSchedule.length ? fiveYearSched.regularSchedule[i] : 0);
    const sevenYr = (i === 0 ? sevenYearSched.bonus : 0) +
      (i < sevenYearSched.regularSchedule.length ? sevenYearSched.regularSchedule[i] : 0);
    const fifteenYr = (i === 0 ? fifteenYearSched.bonus : 0) +
      (i < fifteenYearSched.regularSchedule.length ? fifteenYearSched.regularSchedule[i] : 0);
    const bldg = i < buildingSchedule.length ? buildingSchedule[i] : 0;
    const total = fiveYr + sevenYr + fifteenYr + bldg;
    accumulated += total;

    yearByYearSchedule.push({
      year: yr,
      fiveYr,
      sevenYr,
      fifteenYr,
      building: bldg,
      total,
      accumulated,
    });
  }

  // ── Tax Savings ────────────────────────────────────────────────────
  const bracket = (taxBracket || 32) / 100;
  const firstYearSavings = Math.round(totalFirstYearDeduction * bracket);
  const passiveWarning = !materialParticipation;

  // ── 481(a) Catch-Up ────────────────────────────────────────────────
  let catchUp = null;
  if (isCatchUp && pisYear < currentYear) {
    catchUp = calculateCatchUp(
      adjustedBasis,
      adjusted,
      pisMonth,
      pisYear,
      currentYear
    );
  }

  // ── Reconciliation ─────────────────────────────────────────────────
  const totalAllocated = fiveYearAmt + sevenYearAmt + fifteenYearAmt + buildingAmt;
  const difference = adjustedBasis - totalAllocated;

  // ── Study ID ───────────────────────────────────────────────────────
  const studyId = `ABD-${pisYear}-${Date.now().toString(36).toUpperCase()}`;

  // ── Assemble Return Object ─────────────────────────────────────────
  return {
    property: {
      ownerName,
      ownerEntity,
      propertyAddress,
      propertyType,
      sqft,
      beds,
      baths,
      yearBuilt,
      isFurnished,
      materialParticipation,
      placedInServiceDate: pisDate.toISOString().split("T")[0],
      acquisitionDate: acqDate.toISOString().split("T")[0],
    },

    basis: {
      purchasePrice: Math.round(purchasePrice),
      landValue: land,
      landRatio: Math.round(landRatio * 10000) / 100, // percent, 2 decimals
      depreciableBasis,
      closingCosts: Math.round(closingCosts),
      adjustedBasis,
    },

    allocation: {
      fiveYear: {
        percent: adjusted.fiveYear,
        amount: fiveYearAmt,
        components: fiveYearComponents,
      },
      sevenYear: {
        percent: adjusted.sevenYear,
        amount: sevenYearAmt,
        components: sevenYearComponents,
      },
      fifteenYear: {
        percent: adjusted.fifteenYear,
        amount: fifteenYearAmt,
        components: fifteenYearComponents,
      },
      building: {
        percent: adjusted.building,
        amount: buildingAmt,
      },
      totalReclass: Math.round(totalReclassPercent * 100) / 100,
      totalReclassAmount,
      guardrailsApplied: adjusted.guardrailsApplied,
      guardrailWarnings: adjusted.guardrailWarnings,
    },

    depreciation: {
      bonusRate,
      convention,
      isCatchUp,
      fiveYear: {
        bonus: fiveYearSched.bonus,
        regularYr1: fiveYearSched.regularYr1,
        total: fiveYearSched.bonus + fiveYearSched.regularYr1,
      },
      sevenYear: {
        bonus: sevenYearSched.bonus,
        regularYr1: sevenYearSched.regularYr1,
        total: sevenYearSched.bonus + sevenYearSched.regularYr1,
      },
      fifteenYear: {
        bonus: fifteenYearSched.bonus,
        regularYr1: fifteenYearSched.regularYr1,
        total: fifteenYearSched.bonus + fifteenYearSched.regularYr1,
      },
      building: {
        yr1: buildingSchedule[0] || 0,
      },
      totalFirstYearDeduction,
      yearByYearSchedule,
    },

    savings: {
      bracket: Math.round(bracket * 100),
      firstYearSavings,
      at24: Math.round(totalFirstYearDeduction * 0.24),
      at32: Math.round(totalFirstYearDeduction * 0.32),
      at37: Math.round(totalFirstYearDeduction * 0.37),
      passiveWarning,
      materialParticipation: {
        status: materialParticipation,
        note: materialParticipation
          ? "Owner materially participates — depreciation offsets active income (STR exception under Sec. 469)."
          : "Owner does not materially participate — depreciation limited to passive income unless STR material participation exception applies.",
      },
    },

    catchUp,

    reconciliation: {
      adjustedBasis,
      totalAllocated,
      difference,
      isReconciled: difference === 0,
    },

    meta: {
      studyDate: new Date().toISOString().split("T")[0],
      studyId,
      version: "1.0.0",
    },
  };
}
