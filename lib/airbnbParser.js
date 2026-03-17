// ═══════════════════════════════════════════════════════
// Airbnb Listing Parser — Extract cost seg data from Apify JSON
// Maps Airbnb amenities → IRS depreciation categories
// ═══════════════════════════════════════════════════════

/**
 * Parse an Airbnb URL and extract the room ID.
 * Supports: airbnb.com/rooms/12345, airbnb.com/rooms/12345?params, etc.
 * @returns {string|null} room ID or null if invalid
 */
export function parseAirbnbUrl(url) {
  if (!url) return null;
  const trimmed = url.trim();

  // Match /rooms/{id} pattern
  const match = trimmed.match(/airbnb\.com\/rooms\/(\d+)/i);
  if (match) return match[1];

  // Also accept just a numeric ID
  if (/^\d{5,}$/.test(trimmed)) return trimmed;

  return null;
}

/**
 * Validate whether a string looks like an Airbnb URL or room ID
 */
export function isValidAirbnbInput(input) {
  return parseAirbnbUrl(input) !== null;
}

/**
 * Extract structured property data from Apify Airbnb JSON
 * @param {Object} listing — single Apify listing object
 * @returns {Object} structured data for our funnel
 */
export function extractPropertyData(listing) {
  if (!listing) return null;

  const sub = listing.subDescription || {};
  const items = sub.items || [];

  // Parse "4 bedrooms", "7 beds", "2 baths", "12 guests" from subDescription
  const specs = parseSpecs(items);

  // Location
  const locParts = (listing.locationSubtitle || "").split(",").map((s) => s.trim());
  const city = listing.location || locParts[0] || "";
  const state = locParts[1] || "";
  const country = locParts[2] || "";

  // Property type mapping
  const propertyType = mapPropertyType(listing.propertyType || listing.roomType || "");

  // Rating & reviews
  const rating = listing.rating || {};

  // Images — categorized by caption
  const images = categorizeImages(listing.images || []);

  // Amenities → our cost seg categories
  // Pass title + description as extra signal sources so "EPIC Pool/Yard" in a title still triggers pool detection
  const titleSignals = [listing.title || "", listing.name || "", listing.description || ""].join(" | ");
  const amenityMapping = mapAmenitiesToCategories(listing.amenities || [], titleSignals);

  // Description parsing for additional detail hints
  const descriptionHints = parseDescription(listing.description || "");

  return {
    // Identity
    airbnbId: listing.id,
    title: cleanTitle(listing.title || ""),
    url: listing.url,

    // Hero image
    thumbnail: listing.thumbnail,

    // Specs
    bedrooms: specs.bedrooms,
    beds: specs.beds,
    baths: specs.baths,
    guests: specs.guests,
    propertyType,

    // Location
    city,
    state: mapStateAbbr(state),
    stateFull: state,
    country,
    coordinates: listing.coordinates || null,

    // Social proof
    rating: rating.guestSatisfaction || 0,
    reviewCount: rating.reviewsCount || 0,
    isSuperhost: listing.host?.isSuperHost || false,
    hostName: listing.host?.name || "",

    // Images by room/area
    images,
    allImages: (listing.images || []).map((img) => ({
      url: img.imageUrl,
      caption: img.caption || "",
    })),

    // Cost seg enrichment — amenities mapped to our 8 categories
    categoryEnrichment: amenityMapping,

    // Additional hints from description
    descriptionHints,

    // Raw amenity list for reference
    amenitySummary: flattenAmenities(listing.amenities || []),
  };
}

// ─── Spec Parsing ───

function parseSpecs(items) {
  const specs = { bedrooms: 0, beds: 0, baths: 0, guests: 0 };
  for (const item of items) {
    const s = (item || "").toLowerCase();
    const bedroomMatch = s.match(/(\d+)\s*bedroom/);
    const bedMatch = s.match(/(\d+)\s*bed(?!room)/);
    const bathMatch = s.match(/([\d.]+)\s*bath/);
    const guestMatch = s.match(/(\d+)\s*guest/);
    if (bedroomMatch) specs.bedrooms = parseInt(bedroomMatch[1]);
    if (bedMatch) specs.beds = parseInt(bedMatch[1]);
    if (bathMatch) specs.baths = parseFloat(bathMatch[1]);
    if (guestMatch) specs.guests = parseInt(guestMatch[1]);
  }
  return specs;
}

// ─── Property Type Mapping ───

function mapPropertyType(airbnbType) {
  const t = airbnbType.toLowerCase();
  if (t.includes("villa") || t.includes("house") || t.includes("home") || t.includes("bungalow")) return "Single Family";
  if (t.includes("condo") || t.includes("apartment")) return "Condo";
  if (t.includes("townhouse") || t.includes("townhome")) return "Townhouse";
  if (t.includes("cabin") || t.includes("cottage") || t.includes("chalet")) return "Cabin";
  if (t.includes("loft") || t.includes("studio")) return "Condo";
  return "Single Family";
}

// ─── Image Categorization ───

const IMAGE_CATEGORIES = {
  kitchen: ["kitchen", "cooking", "stove", "oven", "refrigerator", "dining"],
  bathroom: ["bathroom", "bath ", "vanity", "shower", "tub", "ensuite", "restroom", "toilet"],
  bedroom: ["bedroom", "bed ", "master bed", "guest bed", "bunk", "sleeping"],
  living: ["living room", "lounge", "sitting", "family room", "fireplace", "tv room"],
  outdoor: ["backyard", "pool", "patio", "deck", "outdoor", "garden", "yard", "hot tub", "spa", "fire pit", "bbq", "grill", "pergola", "sun deck", "lounger"],
  exterior: ["front", "entrance", "exterior", "driveway", "parking", "street"],
  laundry: ["laundry", "washer", "dryer"],
};

function categorizeImages(images) {
  const categorized = {};
  for (const [cat] of Object.entries(IMAGE_CATEGORIES)) {
    categorized[cat] = [];
  }
  categorized.other = [];

  for (const img of images) {
    const caption = (img.caption || "").toLowerCase();
    let matched = false;
    for (const [cat, keywords] of Object.entries(IMAGE_CATEGORIES)) {
      if (keywords.some((kw) => caption.includes(kw))) {
        categorized[cat].push({ url: img.imageUrl, caption: img.caption || "" });
        matched = true;
        break;
      }
    }
    if (!matched) {
      categorized.other.push({ url: img.imageUrl, caption: img.caption || "" });
    }
  }

  return categorized;
}

// ─── Amenity → Cost Seg Category Mapping ───
// This is the money mapping — Airbnb amenities → our 8 IRS categories

const AMENITY_MAPPINGS = {
  // Kitchen
  kitchen: {
    category: "kitchen",
    matches: [
      { pattern: /stainless steel|viking|wolf|sub-zero|thermador/i, item: "appliances", value: "premium" },
      { pattern: /ge |kitchenaid|bosch|ge profile|whirlpool/i, item: "appliances", value: "mid-range" },
      { pattern: /kitchen|cooking basics|refrigerator|microwave|dishwasher|stove|oven/i, item: "appliances", value: "standard" },
      { pattern: /coffee maker|keurig|espresso/i, item: "_amenity", value: "coffee-station" },
      { pattern: /wine glasses|bar/i, item: "_amenity", value: "wet-bar" },
    ],
  },
  // Bathrooms
  bathrooms: {
    category: "bathrooms",
    matches: [
      { pattern: /bathtub|soaking|soaker|freestanding tub/i, item: "bath-features", value: "soaking-tub", multi: true },
      { pattern: /walk.?in shower|rain shower|frameless/i, item: "bath-features", value: "walk-in-shower", multi: true },
      { pattern: /dual vanity|double vanity/i, item: "bath-features", value: "dual-vanity", multi: true },
      { pattern: /heated floor/i, item: "bath-features", value: "heated-floors", multi: true },
      { pattern: /hair dryer|body soap|shampoo/i, item: "_amenity", value: "stocked-bathroom" },
    ],
  },
  // Outdoor & Land
  outdoor: {
    category: "outdoor",
    matches: [
      { pattern: /private.*pool|outdoor pool|heated pool|lap pool/i, item: "pool", value: "chlorine" },
      { pattern: /saltwater pool/i, item: "pool", value: "saltwater" },
      { pattern: /hot tub|jacuzzi|spa/i, item: "pool-features", value: "hot-tub", multi: true },
      { pattern: /pool.*heated|heated.*pool/i, item: "pool-features", value: "heated", multi: true },
      { pattern: /fire pit|firepit/i, item: "outdoor-features", value: "fire-pit", multi: true },
      { pattern: /outdoor kitchen/i, item: "outdoor-features", value: "outdoor-kitchen", multi: true },
      { pattern: /bbq|grill|barbecue/i, item: "outdoor-features", value: "outdoor-kitchen", multi: true },
      { pattern: /pergola|covered patio/i, item: "outdoor-features", value: "pergola", multi: true },
      { pattern: /outdoor shower/i, item: "outdoor-features", value: "outdoor-shower", multi: true },
      { pattern: /patio|balcony|deck/i, item: "deck-patio", value: "paver" },
      { pattern: /outdoor furniture|sun lounger|outdoor dining/i, item: "_amenity", value: "outdoor-furniture" },
      { pattern: /fully fenced|backyard.*fenced/i, item: "fencing", value: "privacy" },
      { pattern: /garden view|landscap/i, item: "landscaping", value: "professional" },
    ],
  },
  // HVAC & Systems
  hvac: {
    category: "hvac-systems",
    matches: [
      { pattern: /central air|central ac/i, item: "hvac-type", value: "central-new" },
      { pattern: /mini.?split|ductless/i, item: "hvac-type", value: "mini-split" },
      { pattern: /central heat/i, item: "_amenity", value: "central-heating" },
      { pattern: /ceiling fan|portable fan/i, item: "_amenity", value: "fans" },
      { pattern: /ev charger/i, item: "energy-features", value: "ev-charger", multi: true },
      { pattern: /solar/i, item: "energy-features", value: "solar", multi: true },
    ],
  },
  // Interior Finishes
  interior: {
    category: "interior",
    matches: [
      { pattern: /indoor fireplace|gas fireplace|electric fireplace/i, item: "interior-features", value: "fireplace", multi: true },
      { pattern: /room.?darkening|blackout/i, item: "window-treatments", value: "custom" },
      { pattern: /built.?in|shelving/i, item: "interior-features", value: "built-in-shelving", multi: true },
      { pattern: /closet system|walk.?in closet|wardrobe/i, item: "interior-features", value: "closet-system", multi: true },
    ],
  },
  // Smart Home & Security
  smartHome: {
    category: "smart-home",
    matches: [
      { pattern: /security camera|surveillance|exterior.*camera/i, item: "security", value: "professional" },
      { pattern: /smoke alarm|carbon monoxide|fire extinguisher/i, item: "_amenity", value: "safety" },
      { pattern: /keypad|smart lock|keyless/i, item: "smart-features", value: "smart-locks", multi: true },
      { pattern: /smart thermostat|nest|ecobee/i, item: "smart-features", value: "smart-thermostat", multi: true },
      { pattern: /whole.?home audio|sonos|speaker system/i, item: "smart-features", value: "whole-home-audio", multi: true },
      { pattern: /smart light/i, item: "smart-features", value: "smart-lighting", multi: true },
      { pattern: /home theater|projector/i, item: "smart-features", value: "home-theater", multi: true },
      { pattern: /ethernet|fast wifi|wifi/i, item: "_amenity", value: "connectivity" },
      { pattern: /noise.*monitor|decibel/i, item: "_amenity", value: "noise-monitor" },
    ],
  },
  // Specialty & Amenities
  specialty: {
    category: "specialty",
    matches: [
      { pattern: /life size game|game room|arcade|pool table|foosball/i, item: "entertainment", value: "game-room", multi: true },
      { pattern: /gym|fitness/i, item: "entertainment", value: "home-gym", multi: true },
      { pattern: /wine cellar|wine room/i, item: "entertainment", value: "wine-cellar", multi: true },
      { pattern: /sauna|steam room/i, item: "entertainment", value: "sauna-steam", multi: true },
      { pattern: /bunk/i, item: "entertainment", value: "bunk-room", multi: true },
      { pattern: /golf sim/i, item: "unique-features", value: "golf-sim", multi: true },
      { pattern: /outdoor movie|projector.*outdoor/i, item: "unique-features", value: "outdoor-movie", multi: true },
      { pattern: /boat dock/i, item: "unique-features", value: "boat-dock", multi: true },
      { pattern: /putting green/i, item: "unique-features", value: "putting-green", multi: true },
      { pattern: /elevator|lift/i, item: "unique-features", value: "elevator", multi: true },
    ],
  },
};

function mapAmenitiesToCategories(amenityGroups, extraSignalText = "") {
  const result = {};

  // Flatten all amenity titles into a single searchable list
  const allTitles = [];
  for (const group of amenityGroups) {
    for (const val of (group.values || [])) {
      if (val.available !== false) {
        allTitles.push(val.title || "");
        if (val.subtitle) allTitles.push(val.subtitle);
      }
    }
  }

  // Include listing title + description as additional signal sources
  const allText = [allTitles.join(" | "), extraSignalText].filter(Boolean).join(" | ");

  // Run each mapping group
  for (const [, group] of Object.entries(AMENITY_MAPPINGS)) {
    for (const mapping of group.matches) {
      if (mapping.pattern.test(allText)) {
        if (mapping.item.startsWith("_")) continue; // Skip non-category items

        if (mapping.multi) {
          // Multi-select: accumulate values in an array
          if (!result[mapping.item]) result[mapping.item] = [];
          if (!result[mapping.item].includes(mapping.value)) {
            result[mapping.item].push(mapping.value);
          }
        } else {
          // Single-select: higher-tier value wins
          const existing = result[mapping.item];
          if (!existing || shouldUpgrade(existing, mapping.value)) {
            result[mapping.item] = mapping.value;
          }
        }
      }
    }
  }

  return result;
}

const TIER_RANK = { luxury: 4, premium: 3, saltwater: 3, "central-new": 3, professional: 3, "mid-range": 2, chlorine: 2, mid: 2, standard: 1 };

function shouldUpgrade(existing, incoming) {
  return (TIER_RANK[incoming] || 0) > (TIER_RANK[existing] || 0);
}

// ─── Description Parsing ───

function parseDescription(desc) {
  const hints = [];
  const lower = desc.toLowerCase();

  if (/tiled floor|tile floor|porcelain floor/i.test(lower)) hints.push({ category: "flooring", hint: "tile", item: "primary-flooring", value: "tile" });
  if (/hardwood floor/i.test(lower)) hints.push({ category: "flooring", hint: "hardwood", item: "primary-flooring", value: "hardwood" });
  if (/lvp|vinyl plank|luxury vinyl/i.test(lower)) hints.push({ category: "flooring", hint: "lvp", item: "primary-flooring", value: "lvp" });
  if (/granite counter|quartz counter|marble counter/i.test(lower)) hints.push({ category: "kitchen", hint: "premium counters" });
  if (/memory foam|king.?size|california king/i.test(lower)) hints.push({ category: "specialty", hint: "premium bedding" });
  if (/4k|hdtv|roku|smart tv|apple tv|netflix/i.test(lower)) hints.push({ category: "smart-home", hint: "entertainment system" });
  if (/desert.*landscap|palm tree|lush green/i.test(lower)) hints.push({ category: "outdoor", hint: "professional landscaping", item: "landscaping", value: "professional" });

  return hints;
}

// ─── Helpers ───

function cleanTitle(title) {
  // Remove unicode decorative characters like 𖤓
  return title.replace(/[\u{10000}-\u{10FFFF}]/gu, "").replace(/\s+/g, " ").trim();
}

function flattenAmenities(amenityGroups) {
  const list = [];
  for (const group of amenityGroups) {
    for (const val of (group.values || [])) {
      if (val.available !== false) {
        list.push(val.title);
      }
    }
  }
  return list;
}

// State name → abbreviation mapping (common STR states)
const STATE_ABBRS = {
  "california": "CA", "arizona": "AZ", "florida": "FL", "texas": "TX",
  "tennessee": "TN", "colorado": "CO", "utah": "UT", "hawaii": "HI",
  "north carolina": "NC", "south carolina": "SC", "georgia": "GA",
  "new mexico": "NM", "nevada": "NV", "oregon": "OR", "washington": "WA",
  "michigan": "MI", "maine": "ME", "virginia": "VA", "missouri": "MO",
  "arkansas": "AR", "new york": "NY", "montana": "MT", "idaho": "ID",
  "wyoming": "WY", "vermont": "VT", "new hampshire": "NH",
  "united states": "",
};

function mapStateAbbr(stateStr) {
  if (!stateStr) return "";
  const s = stateStr.trim();
  // Already an abbreviation
  if (s.length === 2 && s === s.toUpperCase()) return s;
  return STATE_ABBRS[s.toLowerCase()] || s;
}

/**
 * Merge Airbnb enrichment into Tier 2 category defaults.
 * Airbnb data takes priority over price-tier heuristics since it's actual data.
 * @param {Object} heuristicDefaults — from getPropertyDefaults()
 * @param {Object} airbnbEnrichment — from extractPropertyData().categoryEnrichment
 * @param {Array} descriptionHints — from extractPropertyData().descriptionHints
 * @returns {Object} merged defaults
 */
export function mergeAirbnbDefaults(heuristicDefaults, airbnbEnrichment, descriptionHints = []) {
  const merged = { ...heuristicDefaults };

  // Airbnb enrichment overrides heuristics
  for (const [key, value] of Object.entries(airbnbEnrichment || {})) {
    if (Array.isArray(value)) {
      // Multi-select: union with existing
      const existing = Array.isArray(merged[key]) ? merged[key] : [];
      merged[key] = [...new Set([...existing, ...value])];
    } else {
      merged[key] = value;
    }
  }

  // Description hints fill gaps (don't override existing)
  for (const hint of descriptionHints) {
    if (hint.item && hint.value && !merged[hint.item]) {
      merged[hint.item] = hint.value;
    }
  }

  return merged;
}
