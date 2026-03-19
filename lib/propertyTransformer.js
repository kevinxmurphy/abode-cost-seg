// ═══════════════════════════════════════════════════════
// ABODE — Property Data Transformer
// Normalizes raw Zillow scraper output → unified PropertyData model
// All cost seg calculations consume this model downstream
// ═══════════════════════════════════════════════════════

import { getLandRatioForState } from "./landSplit.js";

/**
 * Transform raw Zillow details scraper output into our PropertyData model.
 * Field mapping based on confirmed mido_99/zillow-details-scraper output.
 *
 * @param {object} raw - Raw Zillow scraper result
 * @param {object} addressComponents - From Google Places: { address, city, state, zip, county }
 * @returns {PropertyData}
 */
export function transformZillowData(raw, addressComponents = {}) {
  if (!raw) return null;

  // ─── Core property facts ─────────────────────────────────────────────────
  const beds = safeInt(raw.bedrooms ?? raw.beds);
  const baths = safeFloat(raw.bathrooms ?? raw.baths);
  const sqft = safeInt(raw.livingArea ?? raw.sqft ?? raw.finishedSqFt);
  const lotSqft = safeInt(raw.lotSize ?? raw.lotAreaSqFt);
  const yearBuilt = safeInt(raw.yearBuilt);
  const zpid = String(raw.zpid || "");
  const parcelId = raw.parcelId || raw.apn || "";
  const countyFIPS = raw.countyFIPS || "";

  // ─── Property type normalization ──────────────────────────────────────────
  const propertyType = normalizePropertyType(
    raw.homeType ?? raw.propertyType ?? raw.homeSubType ?? ""
  );

  // ─── Valuation data ───────────────────────────────────────────────────────
  const zestimate = safeInt(raw.zestimate);
  const rentZestimate = safeInt(raw.rentZestimate);
  const lastSoldPrice = safeInt(raw.lastSoldPrice ?? raw.price);
  const lastSoldDate = raw.dateSold ?? raw.lastSoldDate ?? null;

  // ─── Tax / assessor data ──────────────────────────────────────────────────
  // Zillow provides taxAssessedValue (total) but not always the land/improvement split.
  // We get the best available data and fall back to state defaults.
  const taxAssessedTotal = safeInt(raw.taxAssessedValue ?? raw.taxAssessmentYear);
  const taxAnnualAmount = safeInt(raw.taxAnnualAmount ?? raw.annualTax);
  const taxHistory = Array.isArray(raw.taxHistory) ? raw.taxHistory : [];
  const priceHistory = Array.isArray(raw.priceHistory) ? raw.priceHistory : [];

  // ─── Land/improvement split ───────────────────────────────────────────────
  // Zillow details scraper sometimes returns assessedLandValue and assessedImprovementValue
  // in the resoFacts or directly. Fall back to state-based estimate if missing.
  const assessedLandRaw = safeInt(
    raw.assessedLandValue ??
    raw.resoFacts?.taxAnnualAmountLand ??
    raw.landValue ??
    0
  );
  const assessedImprovementRaw = safeInt(
    raw.assessedImprovementValue ??
    raw.resoFacts?.taxAnnualAmountImprovement ??
    raw.improvementValue ??
    0
  );

  let assessedLand = assessedLandRaw;
  let assessedImprovement = assessedImprovementRaw;

  // If we have total but no split, derive from state defaults
  if (taxAssessedTotal > 0 && assessedLand === 0 && assessedImprovement === 0) {
    const state = addressComponents.state || raw.state || "";
    const landRatio = getLandRatioForState(state, addressComponents.city || "");
    assessedLand = Math.round(taxAssessedTotal * landRatio);
    assessedImprovement = taxAssessedTotal - assessedLand;
  }

  // If we still have no assessed data, use zestimate/lastSoldPrice with state defaults
  const referenceValue = taxAssessedTotal || zestimate || lastSoldPrice || 0;
  if (assessedLand === 0 && referenceValue > 0) {
    const state = addressComponents.state || "";
    const landRatio = getLandRatioForState(state, addressComponents.city || "");
    assessedLand = Math.round(referenceValue * landRatio);
    assessedImprovement = referenceValue - assessedLand;
  }

  // ─── Structural details from resoFacts ───────────────────────────────────
  const resoFacts = raw.resoFacts || {};
  const structuralDetails = {
    roofType: resoFacts.roofType || resoFacts.roof || null,
    flooring: resoFacts.flooring || null,
    heating: resoFacts.heating || null,
    cooling: resoFacts.cooling || null,
    appliances: resoFacts.appliances || null,
    garageSpaces: safeInt(resoFacts.garageSpaces || resoFacts.parkingCapacity),
    hasPool: Boolean(
      resoFacts.hasPrivatePool ||
      resoFacts.poolFeatures ||
      (raw.description || "").toLowerCase().includes("pool")
    ),
    hasGarage: Boolean(resoFacts.parkingFeatures || resoFacts.garageSpaces > 0),
    stories: safeInt(resoFacts.stories || resoFacts.levels),
    rooms: safeInt(resoFacts.roomCount || resoFacts.totalRooms),
    fireplaces: safeInt(resoFacts.fireplaces),
    description: raw.description || "",
  };

  // ─── Data quality flags ───────────────────────────────────────────────────
  const dataQuality = {
    hasAssessedSplit: assessedLandRaw > 0 || assessedImprovementRaw > 0,
    splitIsEstimated: assessedLandRaw === 0,
    hasZestimate: zestimate > 0,
    hasLastSalePrice: lastSoldPrice > 0,
    hasStructuralDetails: Object.values(structuralDetails).some(
      (v) => v !== null && v !== false && v !== 0
    ),
    confidence: computeConfidenceScore({
      beds, baths, sqft, yearBuilt, zpid, taxAssessedTotal,
      assessedLandRaw, zestimate, lastSoldPrice,
    }),
  };

  // ─── Assembled PropertyData model ────────────────────────────────────────
  return {
    // Identity
    zpid,
    parcelId,
    countyFIPS,
    source: "zillow",

    // Address (from Google Places components, enriched by Zillow if available)
    address: addressComponents.address || raw.address || "",
    city: addressComponents.city || raw.city || "",
    state: addressComponents.state || raw.state || "",
    stateFull: addressComponents.stateFull || "",
    zip: addressComponents.zip || raw.zipcode || "",
    county: addressComponents.county || "",
    fullAddress: addressComponents.fullAddress || raw.streetAddress || "",

    // Physical characteristics
    beds,
    baths,
    sqft,
    lotSqft,
    yearBuilt,
    propertyType,
    stories: structuralDetails.stories,

    // Valuation
    zestimate,
    rentZestimate,
    lastSoldPrice,
    lastSoldDate,
    taxAssessedTotal,
    taxAnnualAmount,

    // Land/improvement split (critical for cost seg)
    assessedLand,
    assessedImprovement,

    // Historical data (for context on sale timing, appreciation)
    taxHistory: normalizeTaxHistory(taxHistory),
    priceHistory: normalizePriceHistory(priceHistory),

    // Structural details (map to IRS depreciation categories)
    structural: structuralDetails,

    // Data quality
    quality: dataQuality,

    // Raw data preserved for debugging
    _raw: raw,
  };
}

/**
 * Transform raw Airbnb scraper output into our AirbnbData model.
 * Delegates to airbnbParser.js for the heavy lifting — this just adapts
 * the Apify tri_angle actor output format.
 *
 * @param {object} raw - Raw Airbnb scraper result
 * @returns {AirbnbData}
 */
export function transformAirbnbData(raw) {
  if (!raw) return null;

  // tri_angle/airbnb-rooms-urls-scraper output structure
  const rating = raw.rating?.guestSatisfaction ??
    raw.rating?.overall ??
    raw.guestSatisfaction ??
    raw.starRating ??
    0;

  const reviewCount = raw.rating?.reviewsCount ??
    raw.reviewsCount ??
    raw.numberOfReviews ??
    0;

  const bedrooms = safeInt(
    raw.subDescription?.items?.find(i => i.includes("bedroom"))?.match(/\d+/)?.[0] ??
    raw.bedrooms ??
    raw.numberOfBedrooms ??
    0
  );

  const baths = safeFloat(
    raw.subDescription?.items?.find(i => i.includes("bath"))?.match(/[\d.]+/)?.[0] ??
    raw.bathrooms ??
    raw.numberOfBathrooms ??
    0
  );

  const guests = safeInt(
    raw.subDescription?.items?.find(i => i.includes("guest"))?.match(/\d+/)?.[0] ??
    raw.personCapacity ??
    raw.maxGuestCapacity ??
    0
  );

  // Amenities — raw categories array
  const amenities = raw.amenities || [];

  // Build amenity summary: category titles and key amenities
  const amenitySummary = buildAmenitySummary(amenities);

  // Images — normalize from whatever field the actor uses to { imageUrl, caption } objects
  // tri_angle actor may use: photos, images, pictures — each with varied sub-shapes
  const rawImageSource = raw.photos || raw.images || raw.pictures || [];
  const processedImages = rawImageSource.map((img) => {
    if (typeof img === "string") return { imageUrl: img, caption: "" };
    return {
      imageUrl: img.large || img.picture || img.imageUrl || img.url || img.src || "",
      caption: img.caption || img.alt || "",
    };
  }).filter((img) => img.imageUrl);

  // Thumbnail — actor may use thumbnail, primaryPhoto, coverPhoto, or first image
  const thumbnail =
    raw.thumbnail ||
    raw.primaryPhoto?.large ||
    raw.coverPhoto?.large ||
    raw.mainPhoto?.large ||
    processedImages[0]?.imageUrl ||
    "";

  return {
    airbnbId: String(raw.id || raw.roomId || ""),
    title: raw.name || raw.title || "",
    thumbnail,
    images: processedImages,
    allImages: processedImages,
    url: raw.url || `https://www.airbnb.com/rooms/${raw.id || ""}`,
    propertyType: raw.propertyType || raw.roomType || "Short-term rental",
    rating: safeFloat(rating),
    reviewCount: safeInt(reviewCount),
    isSuperhost: Boolean(raw.host?.isSuperHost || raw.isSuperhost),
    bedrooms,
    baths,
    guests,
    city: raw.location || raw.city || "",
    state: "",
    amenitySummary,
    amenities: buildAmenityList(amenities),
    categoryEnrichment: buildCategoryEnrichment(amenities),
    _raw: raw,
  };
}

// ─── Property type normalization ──────────────────────────────────────────────

const PROPERTY_TYPE_MAP = {
  "single_family": "Single Family",
  "singlefamily": "Single Family",
  "single family": "Single Family",
  "condo": "Condo",
  "condominium": "Condo",
  "townhouse": "Townhouse",
  "townhome": "Townhouse",
  "multi_family": "Multi-Family",
  "multifamily": "Multi-Family",
  "duplex": "Multi-Family",
  "triplex": "Multi-Family",
  "apartment": "Apartment",
  "mobile_home": "Mobile Home",
  "mobilehome": "Mobile Home",
  "lot_land": "Land",
  "land": "Land",
  "manufactured": "Mobile Home",
};

function normalizePropertyType(raw) {
  if (!raw) return "Single Family";
  const key = raw.toLowerCase().replace(/[\s_-]+/g, "").replace(/[^a-z]/g, "");
  // Try various normalization keys
  for (const [pattern, normalized] of Object.entries(PROPERTY_TYPE_MAP)) {
    if (key.includes(pattern.replace(/[\s_-]/g, ""))) return normalized;
  }
  // Title-case the raw value as fallback
  return raw.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Tax/price history normalization ─────────────────────────────────────────

function normalizeTaxHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory
    .map(entry => ({
      year: safeInt(entry.time ? new Date(entry.time * 1000).getFullYear() : entry.year),
      taxPaid: safeInt(entry.taxPaid ?? entry.value),
      assessment: safeInt(entry.value ?? entry.assessedValue),
    }))
    .filter(e => e.year > 0)
    .sort((a, b) => b.year - a.year)
    .slice(0, 10); // Keep last 10 years
}

function normalizePriceHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory
    .map(entry => ({
      date: entry.time ? new Date(entry.time * 1000).toISOString().split("T")[0] : entry.date,
      price: safeInt(entry.price ?? entry.value),
      event: entry.event || entry.changeReason || "unknown",
    }))
    .filter(e => e.price > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10);
}

// ─── Airbnb amenity processing ────────────────────────────────────────────────

function buildAmenityList(amenities) {
  const all = [];
  if (!Array.isArray(amenities)) return all;
  for (const group of amenities) {
    if (Array.isArray(group.values)) {
      for (const item of group.values) {
        if (item.available !== false) {
          all.push(item.title || item);
        }
      }
    }
  }
  return all;
}

function buildAmenitySummary(amenities) {
  if (!Array.isArray(amenities)) return {};
  const summary = {};
  for (const group of amenities) {
    const title = group.title || "Other";
    const available = (group.values || [])
      .filter(v => v.available !== false)
      .map(v => v.title || v);
    if (available.length > 0) {
      summary[title] = available;
    }
  }
  return summary;
}

// Map Airbnb amenities to IRS depreciation categories
// These feed into the cost seg component breakdown
const COST_SEG_AMENITY_CATEGORIES = {
  "5yr": [
    "pool", "hot tub", "spa", "sauna", "appliance",
    "washer", "dryer", "dishwasher", "refrigerator",
    "television", "tv", "entertainment", "outdoor kitchen",
    "bbq", "grill", "fire pit", "fire table",
    "outdoor furniture", "sun lounger",
  ],
  "15yr": [
    "patio", "deck", "balcony", "driveway", "parking",
    "walkway", "sidewalk", "landscape", "fence",
    "outdoor lighting", "outdoor shower",
  ],
  "7yr": [
    "carpet", "flooring", "window covering", "blind",
    "shade", "curtain", "ceiling fan",
  ],
};

function buildCategoryEnrichment(amenities) {
  const allAmenities = buildAmenityList(amenities);
  const enrichment = { "5yr": [], "7yr": [], "15yr": [] };

  for (const amenity of allAmenities) {
    const lower = amenity.toLowerCase();
    for (const [category, keywords] of Object.entries(COST_SEG_AMENITY_CATEGORIES)) {
      if (keywords.some(kw => lower.includes(kw))) {
        enrichment[category].push(amenity);
        break; // Each amenity maps to one category
      }
    }
  }

  return enrichment;
}

// ─── Data quality scoring ─────────────────────────────────────────────────────

function computeConfidenceScore({
  beds, baths, sqft, yearBuilt, zpid,
  taxAssessedTotal, assessedLandRaw, zestimate, lastSoldPrice,
}) {
  let score = 0;
  let maxScore = 0;

  const check = (value, points) => {
    maxScore += points;
    if (value && value > 0) score += points;
  };

  check(beds, 10);
  check(baths, 10);
  check(sqft, 15);
  check(yearBuilt, 15);
  check(zpid, 5);
  check(taxAssessedTotal, 20);
  check(assessedLandRaw, 10); // Bonus for actual split data
  check(zestimate, 10);
  check(lastSoldPrice, 5);

  return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
}

// ─── Type helpers ─────────────────────────────────────────────────────────────

function safeInt(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseInt(val, 10);
  return isNaN(n) ? 0 : n;
}

function safeFloat(val) {
  if (val === null || val === undefined || val === "") return 0;
  const n = parseFloat(val);
  return isNaN(n) ? 0 : n;
}
