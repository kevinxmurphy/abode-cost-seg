// ═══════════════════════════════════════════════════════
// ABODE — Address Normalization & Zillow URL Builder
// Converts Google Places formatted_address → Zillow URL slug
// ═══════════════════════════════════════════════════════

// USPS street type abbreviations — full word → abbreviated
const STREET_TYPE_MAP = {
  "alley": "Aly", "aly": "Aly",
  "avenue": "Ave", "ave": "Ave",
  "boulevard": "Blvd", "blvd": "Blvd",
  "bypass": "Byp",
  "causeway": "Cswy",
  "circle": "Cir", "cir": "Cir",
  "commons": "Cmns",
  "court": "Ct", "ct": "Ct",
  "cove": "Cv",
  "creek": "Crk",
  "crossing": "Xing",
  "dale": "Dl",
  "drive": "Dr", "dr": "Dr",
  "estate": "Est", "estates": "Ests",
  "expressway": "Expy", "expy": "Expy",
  "extension": "Ext",
  "freeway": "Fwy", "fwy": "Fwy",
  "grove": "Grv",
  "harbor": "Hbr",
  "heights": "Hts",
  "highway": "Hwy", "hwy": "Hwy",
  "hill": "Hl",
  "hollow": "Holw",
  "island": "Is",
  "junction": "Jct",
  "knoll": "Knl",
  "lake": "Lk",
  "lane": "Ln", "ln": "Ln",
  "loop": "Loop",
  "manor": "Mnr",
  "meadow": "Mdw", "meadows": "Mdws",
  "mill": "Ml", "mills": "Mls",
  "mount": "Mt",
  "mountain": "Mtn",
  "parkway": "Pkwy", "pkwy": "Pkwy",
  "pass": "Pass",
  "path": "Path",
  "pike": "Pike",
  "place": "Pl", "pl": "Pl",
  "plain": "Pln", "plains": "Plns",
  "plaza": "Plz",
  "point": "Pt",
  "ridge": "Rdg",
  "road": "Rd", "rd": "Rd",
  "route": "Rte",
  "row": "Row",
  "run": "Run",
  "shoal": "Shl",
  "shore": "Shr", "shores": "Shrs",
  "spring": "Spg", "springs": "Spgs",
  "square": "Sq",
  "street": "St", "st": "St",
  "summit": "Smt",
  "terrace": "Ter", "ter": "Ter",
  "trace": "Trce",
  "trail": "Trl", "trl": "Trl",
  "tunnel": "Tunl",
  "turnpike": "Tpke",
  "valley": "Vly",
  "view": "Vw",
  "village": "Vlg",
  "vista": "Vis",
  "walk": "Walk",
  "wall": "Wall",
  "way": "Way",
};

// Cardinal direction abbreviations
const DIRECTION_MAP = {
  "north": "N", "n": "N",
  "south": "S", "s": "S",
  "east": "E", "e": "E",
  "west": "W", "w": "W",
  "northeast": "NE", "ne": "NE",
  "northwest": "NW", "nw": "NW",
  "southeast": "SE", "se": "SE",
  "southwest": "SW", "sw": "SW",
};

// Unit designators to strip from address (they don't appear in Zillow URLs)
const UNIT_PATTERN = /\s+(apt|apartment|unit|suite|ste|#|no|number|fl|floor)\s*[\w-]+\s*$/i;

/**
 * Normalize a street address string to match Zillow's URL format.
 * Strips unit numbers, abbreviates street types and cardinal directions.
 *
 * @param {string} street - e.g. "17826 North Bailey Drive Apt 2B"
 * @returns {string} - e.g. "17826-N-Bailey-Dr"
 */
export function normalizeStreet(street) {
  if (!street) return "";

  // Strip unit/apt/suite designators
  const noUnit = street.replace(UNIT_PATTERN, "").trim();

  const words = noUnit.split(/\s+/);
  const normalized = words.map((word, idx) => {
    const clean = word.toLowerCase().replace(/[.,]/g, "");

    // Try street type abbreviation
    if (STREET_TYPE_MAP[clean]) return STREET_TYPE_MAP[clean];

    // Try cardinal direction — only at start (after house number) or at end (e.g. "Bailey Dr N")
    if (DIRECTION_MAP[clean]) {
      const isAfterNumber = idx === 0 || (idx === 1 && /^\d+/.test(words[0]));
      const isLast = idx === words.length - 1;
      if (isAfterNumber || isLast) return DIRECTION_MAP[clean];
    }

    return word;
  });

  return normalized.join(" ");
}

/**
 * Build a Zillow search URL from address components.
 * Google Places returns addresses in USPS abbreviated form already (Dr, Ave, etc.)
 * so normalization is mostly about format, not abbreviation.
 *
 * @param {object} components - { address, city, state, zip }
 * @returns {string|null} Zillow URL or null if insufficient data
 */
export function buildZillowSearchUrl({ address, city, state, zip }) {
  if (!address || !city || !state) return null;

  const streetNorm = normalizeStreet(address);
  const parts = [streetNorm, city, state, zip].filter(Boolean);
  const slug = parts.join(" ")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9-]/g, "");

  return `https://www.zillow.com/homes/${slug}_rb/`;
}

/**
 * Build a Zillow homedetails URL directly from ZPID.
 * Used as the final step when ZPID is known.
 *
 * @param {string|number} zpid
 * @returns {string}
 */
export function buildZillowUrlFromZpid(zpid) {
  return `https://www.zillow.com/homedetails/${zpid}_zpid/`;
}

/**
 * Parse Google Places address_components array into our normalized address model.
 * Handles the variance in Google's component types across different address formats.
 *
 * @param {Array} components - Google Places address_components
 * @returns {object|null}
 */
export function parseGooglePlacesComponents(components) {
  if (!components || !Array.isArray(components)) return null;

  const get = (type) => {
    const c = components.find(c => c.types.includes(type));
    return c ? c.short_name : "";
  };
  const getLong = (type) => {
    const c = components.find(c => c.types.includes(type));
    return c ? c.long_name : "";
  };

  const streetNumber = getLong("street_number");
  const route = getLong("route");
  const subpremise = getLong("subpremise"); // unit/apt number from Places API

  // City: try locality first, then sublocality, then neighborhood (for dense urban)
  const city =
    getLong("locality") ||
    getLong("sublocality_level_1") ||
    getLong("sublocality") ||
    getLong("neighborhood") ||
    getLong("administrative_area_level_3");

  const county = getLong("administrative_area_level_2").replace(/ County$/i, "");
  const stateShort = get("administrative_area_level_1");   // "CA"
  const stateFull = getLong("administrative_area_level_1"); // "California"
  const zip = getLong("postal_code");
  const country = get("country"); // "US"

  const streetAddress = [streetNumber, route].filter(Boolean).join(" ");
  const fullAddress = [
    streetAddress,
    subpremise ? `#${subpremise}` : null,
    city,
    `${stateShort} ${zip}`.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    address: streetAddress,       // "17826 Bailey Dr" (no unit — used for Zillow lookup)
    addressWithUnit: fullAddress.split(", ")[0], // includes unit if present
    city,
    county,
    state: stateShort,
    stateFull,
    zip,
    country,
    fullAddress,
  };
}

/**
 * Extracts a clean address string for Zillow from a Google Places result.
 * Strips the ", USA" suffix that Google adds.
 *
 * @param {string} formatted - Google's formatted_address
 * @returns {string}
 */
export function cleanGoogleAddress(formatted) {
  return (formatted || "").replace(/,\s*USA\s*$/i, "").trim();
}

/**
 * Confidence check: can we reliably construct a Zillow URL from this address?
 * Returns false for PO boxes, rural routes, or insufficient data.
 *
 * @param {object} parsed - result of parseGooglePlacesComponents
 * @returns {boolean}
 */
export function isZillowLookupViable({ address, city, state, zip }) {
  if (!address || !city || !state || !zip) return false;
  // PO Boxes don't have Zillow listings
  if (/^p\.?o\.?\s+box/i.test(address)) return false;
  // Rural routes (less common in STR markets)
  if (/^r\.?r\.?\s+\d/i.test(address)) return false;
  // Highway addresses (commercial, not residential)
  if (/^hwy\s+\d|^highway\s+\d/i.test(address)) return false;
  return true;
}

/**
 * Look up a Zillow ZPID using Zillow's public autocomplete endpoint.
 * This is FREE — no API key or Apify credits needed.
 * Returns the ZPID for the best-matching address.
 *
 * @param {string} addressQuery - Full address string (e.g. "17826 Bailey Dr Torrance CA 90504")
 * @returns {Promise<{ zpid: string, display: string }|null>}
 */
export async function lookupZpidFromZillow(addressQuery) {
  if (!addressQuery || addressQuery.length < 5) return null;

  try {
    const query = encodeURIComponent(addressQuery);
    const url = `https://www.zillowstatic.com/autocomplete/v3/suggestions?q=${query}&resultTypes=allAddress`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Abode/1.0)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) return null;

    // First result is the best match
    const best = results[0];
    const zpid = best.metaData?.zpid;

    if (!zpid) return null;

    return {
      zpid: String(zpid),
      display: best.display || "",
    };
  } catch {
    return null;
  }
}
