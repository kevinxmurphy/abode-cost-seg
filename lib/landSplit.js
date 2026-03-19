// ═══════════════════════════════════════════════════════
// ABODE — Land/Improvement Split Ratios
// State and market-level defaults for land value as % of total assessed value.
// Used when county assessor data doesn't provide a direct land/improvement split.
//
// Sources: IRS Rev. Proc. 2002-19 guidance, ATTOM market data,
//          county assessor data analysis across top STR markets.
//
// PHASE 2: Replace with per-county lookup via BatchData/ATTOM API
//          for exact assessed land/improvement values.
// ═══════════════════════════════════════════════════════

/**
 * State-level default land ratios (land as % of total assessed value).
 * Based on median across all property types. STR markets tend to skew higher
 * due to desirable locations (coastal, mountain, urban).
 *
 * Range: 0.10 (10%) to 0.65 (65%)
 * National average: ~17–20%
 */
const STATE_LAND_RATIOS = {
  // High land value states (coastal, high demand)
  HI: 0.62, // Hawaii — land dominates, limited supply on islands
  CA: 0.42, // California — coastal/urban premium
  NY: 0.38, // New York — NYC metro pulls average up
  MA: 0.32, // Massachusetts — coastal + Boston metro
  WA: 0.30, // Washington — Seattle tech market + coastal
  OR: 0.28, // Oregon — Portland + coastal
  CT: 0.28, // Connecticut — NYC proximity
  NJ: 0.27, // New Jersey — NYC metro
  MD: 0.25, // Maryland — DC suburbs
  VA: 0.24, // Virginia — Northern VA + Beach markets
  FL: 0.24, // Florida — coastal premium
  CO: 0.24, // Colorado — mountain resort premium
  AZ: 0.22, // Arizona — Scottsdale/Sedona desirability
  UT: 0.22, // Utah — Park City ski market
  NV: 0.20, // Nevada — Las Vegas/Lake Tahoe
  TX: 0.20, // Texas — no income tax = land demand
  IL: 0.20, // Illinois — Chicago metro
  MN: 0.19, // Minnesota — Minneapolis + lakes
  WI: 0.18, // Wisconsin — lake country
  MI: 0.18, // Michigan — lake country + Petoskey
  GA: 0.18, // Georgia — Atlanta STR market
  NC: 0.18, // North Carolina — Asheville, Outer Banks
  SC: 0.18, // South Carolina — Hilton Head, Charleston
  TN: 0.17, // Tennessee — Nashville, Gatlinburg
  PA: 0.17, // Pennsylvania
  OH: 0.16, // Ohio
  IN: 0.16, // Indiana
  MO: 0.15, // Missouri — Branson, Lake of the Ozarks
  AR: 0.15, // Arkansas — Eureka Springs
  LA: 0.17, // Louisiana — New Orleans
  MS: 0.14, // Mississippi
  AL: 0.14, // Alabama
  KY: 0.15, // Kentucky
  WV: 0.13, // West Virginia
  OK: 0.15, // Oklahoma
  KS: 0.14, // Kansas
  NE: 0.14, // Nebraska
  SD: 0.14, // South Dakota
  ND: 0.13, // North Dakota
  MT: 0.16, // Montana — Big Sky resort market
  ID: 0.18, // Idaho — Sun Valley resort
  WY: 0.16, // Wyoming — Jackson Hole (very high land % actually — PHASE 2 refine)
  NM: 0.18, // New Mexico — Santa Fe desirability
  ME: 0.18, // Maine — Bar Harbor, coastal
  NH: 0.22, // New Hampshire — Lakes Region, ski
  VT: 0.20, // Vermont — ski country
  RI: 0.25, // Rhode Island — Newport coastal
  DE: 0.22, // Delaware — coastal
  DC: 0.45, // DC — urban land premium
  AK: 0.20, // Alaska
};

/**
 * Market-specific overrides for top STR cities.
 * These override the state default for properties in these markets.
 * Format: "City, ST" → ratio (case-insensitive city matching)
 */
const MARKET_OVERRIDES = {
  // Hawaii markets
  "kailua-kona, hi": 0.68,
  "lahaina, hi": 0.72,
  "honolulu, hi": 0.70,
  "wailuku, hi": 0.65,

  // California coastal
  "malibu, ca": 0.65,
  "beverly hills, ca": 0.62,
  "santa barbara, ca": 0.58,
  "carmel, ca": 0.55,
  "monterey, ca": 0.52,
  "venice, ca": 0.55,
  "santa monica, ca": 0.55,
  "laguna beach, ca": 0.60,
  "palm springs, ca": 0.45,
  "palm desert, ca": 0.42,
  "la quinta, ca": 0.40,
  "south lake tahoe, ca": 0.38,
  "big bear lake, ca": 0.35,

  // Mountain resorts
  "park city, ut": 0.32,
  "vail, co": 0.40,
  "aspen, co": 0.50,
  "breckenridge, co": 0.32,
  "telluride, co": 0.38,
  "keystone, co": 0.28,
  "steamboat springs, co": 0.30,
  "jackson, wy": 0.42, // Jackson Hole
  "teton village, wy": 0.45,
  "sun valley, id": 0.35,
  "big sky, mt": 0.28,

  // Nashville — high growth
  "nashville, tn": 0.22,

  // Florida coastal
  "miami beach, fl": 0.40,
  "key west, fl": 0.55,
  "naples, fl": 0.35,
  "sarasota, fl": 0.30,
  "destin, fl": 0.32,
  "30a, fl": 0.35,
  "orlando, fl": 0.22,

  // Carolinas
  "asheville, nc": 0.20,
  "outer banks, nc": 0.35,
  "hilton head, sc": 0.30,
  "myrtle beach, sc": 0.25,
  "charleston, sc": 0.28,

  // Texas
  "austin, tx": 0.25,

  // Georgia
  "savannah, ga": 0.22,
  "blue ridge, ga": 0.22,

  // Northeast
  "bar harbor, me": 0.25,
  "kennebunkport, me": 0.28,
  "cape cod, ma": 0.40,
  "nantucket, ma": 0.55,
  "martha's vineyard, ma": 0.52,
  "newport, ri": 0.35,
  "mystic, ct": 0.28,

  // Mid-Atlantic
  "ocean city, md": 0.35,
  "rehoboth beach, de": 0.32,
  "virginia beach, va": 0.28,

  // New Mexico
  "santa fe, nm": 0.22,
  "taos, nm": 0.20,

  // Pacific Northwest
  "cannon beach, or": 0.35,
  "hood river, or": 0.28,
  "leavenworth, wa": 0.28,
  "port angeles, wa": 0.24,
};

/**
 * Get the estimated land ratio for a given state and city.
 * Returns a decimal (e.g. 0.22 = 22% land value).
 *
 * @param {string} stateCode - 2-letter state code (e.g. "CA")
 * @param {string} city - City name (optional, enables market overrides)
 * @returns {number} Land ratio as decimal
 */
export function getLandRatioForState(stateCode, city = "") {
  // Try city+state market override first (most specific)
  if (city && stateCode) {
    const marketKey = `${city.toLowerCase()}, ${stateCode.toLowerCase()}`;
    if (MARKET_OVERRIDES[marketKey] !== undefined) {
      return MARKET_OVERRIDES[marketKey];
    }

    // Partial city match for markets with common name variations
    for (const [key, ratio] of Object.entries(MARKET_OVERRIDES)) {
      const [mktCity, mktState] = key.split(", ");
      if (
        mktState === stateCode.toLowerCase() &&
        city.toLowerCase().includes(mktCity.split(" ")[0]) // match on first word of city
      ) {
        return ratio;
      }
    }
  }

  // Fall back to state default
  const stateKey = (stateCode || "").toUpperCase();
  return STATE_LAND_RATIOS[stateKey] ?? 0.17; // 17% national average fallback
}

/**
 * Split a total assessed value into land and improvement components.
 * Returns both as dollar amounts and the ratio used.
 *
 * @param {number} totalValue - Total assessed or purchase price
 * @param {string} stateCode - 2-letter state code
 * @param {string} city - City name for market override lookup
 * @returns {{ land: number, improvement: number, ratio: number, isEstimated: boolean }}
 */
export function splitLandImprovement(totalValue, stateCode, city = "") {
  const ratio = getLandRatioForState(stateCode, city);
  const land = Math.round(totalValue * ratio);
  const improvement = totalValue - land;
  return { land, improvement, ratio, isEstimated: true };
}

/**
 * Get a human-readable description of the land ratio source.
 * Used in the UI to explain where the split came from.
 *
 * @param {string} stateCode
 * @param {string} city
 * @returns {string}
 */
export function getLandRatioSource(stateCode, city = "") {
  if (city && stateCode) {
    const marketKey = `${city.toLowerCase()}, ${stateCode.toLowerCase()}`;
    if (MARKET_OVERRIDES[marketKey] !== undefined) {
      return `${city} market average`;
    }
  }
  const stateKey = (stateCode || "").toUpperCase();
  if (STATE_LAND_RATIOS[stateKey]) {
    return `${stateKey} state average`;
  }
  return "national average";
}

/**
 * Check if a property is in a high cost-of-living market where land
 * constitutes a large portion of property value (≥30%).
 *
 * @param {string} stateCode
 * @param {string} city
 * @returns {boolean}
 */
export function isHighCOLMarket(stateCode, city = "") {
  const ratio = getLandRatioForState(stateCode, city);
  return ratio >= 0.30;
}

/**
 * Get all state ratios (for debugging or admin display)
 */
export function getAllStateRatios() {
  return { ...STATE_LAND_RATIOS };
}
