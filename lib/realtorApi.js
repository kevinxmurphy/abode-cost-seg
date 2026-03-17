// ═══════════════════════════════════════════════════════
// ABODE — Realtor.com GraphQL API Client
// FREE, no API key required, no Apify credits.
// Returns rich property data: beds, baths, sqft, year built,
// lot size, tax history with actual land/building split,
// full price/sale history, and more.
//
// Uses Realtor.com's public frontdoor GraphQL endpoint
// with their standard rdc-x client headers.
// ═══════════════════════════════════════════════════════

const REALTOR_GRAPHQL = "https://www.realtor.com/frontdoor/graphql";
const REALTOR_AUTOCOMPLETE = "https://parser-external.geo.moveaws.com/suggest";

const HEADERS = {
  "Content-Type": "application/json",
  "rdc-client-name": "rdc-x",
  "rdc-client-version": "1.0.0",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

// ─── Address → Realtor Property ID ──────────────────────────────────────────

/**
 * Look up a Realtor.com property ID (mpr_id) from an address string.
 * Uses Realtor's public autocomplete endpoint — free, fast, reliable.
 *
 * @param {string} addressQuery - e.g. "80761 Canyon Trl Indio CA 92201"
 * @returns {Promise<{ propertyId: string, address: object }|null>}
 */
export async function lookupRealtorPropertyId(addressQuery) {
  if (!addressQuery || addressQuery.length < 5) return null;

  try {
    const url = new URL(REALTOR_AUTOCOMPLETE);
    url.searchParams.set("input", addressQuery);
    url.searchParams.set("client_id", "rdc-x");
    url.searchParams.set("limit", "1");
    url.searchParams.set("area_types", "address");

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": HEADERS["User-Agent"] },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const results = data.autocomplete || [];

    if (results.length === 0) return null;

    const best = results[0];
    const propertyId = best.mpr_id;

    if (!propertyId) return null;

    return {
      propertyId: String(propertyId),
      line: best.line || "",
      city: best.city || "",
      state: best.state_code || "",
      zip: best.postal_code || "",
      fullAddress: (best.full_address || [])[0] || "",
      lat: best.centroid?.lat ?? null,
      lng: best.centroid?.lon ?? null,
      propStatus: best.prop_status || [],
    };
  } catch {
    return null;
  }
}

// ─── Full Property Details ───────────────────────────────────────────────────

/**
 * Fetch full property details from Realtor.com GraphQL API.
 * Returns beds, baths, sqft, lot size, year built, type,
 * tax history with land/building split, and price history.
 *
 * @param {string} propertyId - Realtor.com mpr_id
 * @returns {Promise<RealtorPropertyData|null>}
 */
export async function fetchRealtorPropertyDetails(propertyId) {
  if (!propertyId) return null;

  const query = `query GetHome($property_id: ID!) {
    home(property_id: $property_id) {
      description {
        beds
        baths
        sqft
        lot_sqft
        year_built
        type
        stories
        garage
      }
      location {
        street_view_url
        address {
          line
          city
          state_code
          postal_code
          coordinate {
            lat
            lon
          }
        }
      }
      tax_history {
        year
        assessment {
          total
          land
          building
        }
        tax
      }
      property_history {
        date
        price
        event_name
        source_name
      }
    }
  }`;

  try {
    const response = await fetch(REALTOR_GRAPHQL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        operationName: "GetHome",
        variables: { property_id: propertyId },
        query,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const home = data?.data?.home;

    if (!home) return null;

    return transformRealtorData(home, propertyId);
  } catch {
    return null;
  }
}

// ─── Data Transformation ────────────────────────────────────────────────────

/**
 * Transform Realtor.com response into our PropertyData-compatible model.
 *
 * @param {object} home - Realtor.com home object
 * @param {string} propertyId
 * @returns {object}
 */
function transformRealtorData(home, propertyId) {
  const desc = home.description || {};
  const loc = home.location?.address || {};
  const coord = loc.coordinate || {};
  const taxHistory = home.tax_history || [];
  const priceHistory = home.property_history || [];

  // ─── Physical characteristics ──────────────────────────────────────────
  const beds = desc.beds || 0;
  const baths = desc.baths || 0;
  const sqft = desc.sqft || 0;
  const lotSqft = desc.lot_sqft || 0;
  const yearBuilt = desc.year_built || 0;
  const stories = desc.stories || 0;
  const garage = desc.garage || 0;
  const propertyType = normalizeRealtorPropertyType(desc.type || "");

  // ─── Tax assessment — ACTUAL land/building split ───────────────────────
  // Use most recent year with assessment data
  const latestTax = taxHistory.find(t => t.assessment?.total > 0) || {};
  const assessedTotal = latestTax.assessment?.total || 0;
  const assessedLand = latestTax.assessment?.land || 0;
  const assessedImprovement = latestTax.assessment?.building || 0;
  const taxAnnualAmount = latestTax.tax || 0;

  // ─── Sale history ────────────────────────────────────────────────────────
  // Find the most recent "Sold" event
  const soldEvents = priceHistory.filter(
    e => e.event_name === "Sold" && e.price > 0
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  const lastSale = soldEvents[0] || null;
  const previousSale = soldEvents[1] || null;

  // ─── Normalized tax history ─────────────────────────────────────────────
  const normalizedTaxHistory = taxHistory
    .filter(t => t.assessment?.total > 0)
    .map(t => ({
      year: t.year,
      total: t.assessment.total,
      land: t.assessment.land || 0,
      building: t.assessment.building || 0,
      tax: t.tax || 0,
    }))
    .sort((a, b) => b.year - a.year)
    .slice(0, 15);

  // ─── Normalized price history ──────────────────────────────────────────
  const normalizedPriceHistory = priceHistory
    .filter(e => e.price > 1000) // Filter out $0 and tiny placeholder prices
    .map(e => ({
      date: e.date,
      price: e.price,
      event: e.event_name,
      source: e.source_name || "",
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 15);

  return {
    // Identity
    realtorPropertyId: propertyId,
    source: "realtor",

    // Address + coordinates
    address: loc.line || "",
    city: loc.city || "",
    state: loc.state_code || "",
    zip: loc.postal_code || "",
    fullAddress: `${loc.line || ""}, ${loc.city || ""}, ${loc.state_code || ""} ${loc.postal_code || ""}`.trim(),
    lat: coord.lat || null,
    lon: coord.lon || null,

    // Physical
    beds,
    baths,
    sqft,
    lotSqft,
    yearBuilt,
    propertyType,
    stories,
    garage,

    // Tax assessment (ACTUAL land/building split from county assessor)
    assessedTotal,
    assessedLand,
    assessedImprovement,
    taxAnnualAmount,

    // Sale history
    lastSoldPrice: lastSale?.price || 0,
    lastSoldDate: lastSale?.date || null,
    previousSoldPrice: previousSale?.price || 0,
    previousSoldDate: previousSale?.date || null,

    // Historical data
    taxHistory: normalizedTaxHistory,
    priceHistory: normalizedPriceHistory,

    // Data quality
    quality: {
      hasAssessedSplit: assessedLand > 0 && assessedImprovement > 0,
      splitIsEstimated: false, // This is ACTUAL county data
      hasLastSalePrice: lastSale?.price > 0,
      hasTaxHistory: normalizedTaxHistory.length > 0,
      confidence: computeRealtorConfidence({
        beds, baths, sqft, lotSqft, yearBuilt,
        assessedLand, assessedImprovement, lastSale,
      }),
    },
  };
}

// ─── Property type normalization ──────────────────────────────────────────

function normalizeRealtorPropertyType(type) {
  const map = {
    "single_family": "Single Family",
    "condo": "Condo",
    "townhome": "Townhouse",
    "townhouse": "Townhouse",
    "multi_family": "Multi-Family",
    "apartment": "Apartment",
    "mobile": "Mobile Home",
    "land": "Land",
    "farm": "Farm",
  };
  return map[type?.toLowerCase()] || type || "Single Family";
}

// ─── Confidence scoring ─────────────────────────────────────────────────

function computeRealtorConfidence({ beds, baths, sqft, lotSqft, yearBuilt, assessedLand, assessedImprovement, lastSale }) {
  let score = 0;
  let maxScore = 0;

  const check = (value, points) => {
    maxScore += points;
    if (value && value > 0) score += points;
  };

  check(beds, 10);
  check(baths, 10);
  check(sqft, 15);
  check(lotSqft, 10);
  check(yearBuilt, 15);
  check(assessedLand, 15);     // Huge: actual land split
  check(assessedImprovement, 15);
  check(lastSale?.price, 10);

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}
