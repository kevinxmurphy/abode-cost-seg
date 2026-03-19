// ═══════════════════════════════════════════════════════
// Airbnb Image Analysis — Caption-based amenity detection
// Maps listing photos + captions to cost seg room categories
//
// PHASE 2: Replace caption matching with vision API for
// actual image recognition of fixtures, finishes, and amenities
// ═══════════════════════════════════════════════════════

import { PROPERTY_CATEGORIES } from "./propertyCategories";

// ─── Room Category Definitions ───
// Each category maps caption keywords → a display-friendly room label
// and links to one or more PROPERTY_CATEGORIES IDs for cost seg mapping

const ROOM_CATEGORIES = {
  kitchen: {
    label: "Kitchen",
    keywords: ["kitchen", "cooking", "stove", "oven", "refrigerator", "dishwasher", "pantry"],
    costSegIds: ["kitchen"],
    icon: "kitchen",
  },
  bedroom: {
    label: "Bedroom / Furniture",
    keywords: ["bedroom", "master", "guest bed", "bunk", "sleeping", "nursery", "kids room"],
    costSegIds: ["interior", "specialty"],
    icon: "bedroom",
  },
  bathroom: {
    label: "Bathroom",
    keywords: ["bathroom", "bath ", "bath,", "ensuite", "en-suite", "restroom", "vanity", "shower", "tub"],
    costSegIds: ["bathrooms"],
    icon: "bathroom",
  },
  outdoor: {
    label: "Outdoor / Land Improvements",
    keywords: [
      "pool", "backyard", "patio", "outdoor", "yard", "garden",
      "deck", "hot tub", "spa", "fire pit", "bbq", "grill",
      "pergola", "sun deck", "lounger", "terrace", "balcony",
    ],
    costSegIds: ["outdoor"],
    icon: "outdoor",
  },
  living: {
    label: "Living Area",
    keywords: ["living", "lounge", "sitting", "family room", "tv room", "den", "great room"],
    costSegIds: ["interior", "smart-home"],
    icon: "living",
  },
  general: {
    label: "General",
    keywords: [],
    costSegIds: [],
    icon: "general",
  },
};

// ─── Caption-Based Amenity Keywords ───
// Maps keywords found in captions to amenity display strings
// Each entry: { pattern, amenity, costSegCategory, costSegItem }

const CAPTION_AMENITY_PATTERNS = [
  // Kitchen
  { pattern: /granite|quartz|marble counter/i, amenity: "Premium countertops", costSegCategory: "kitchen", costSegItem: "countertops" },
  { pattern: /stainless steel/i, amenity: "Stainless steel appliances", costSegCategory: "kitchen", costSegItem: "appliances" },
  { pattern: /island/i, amenity: "Kitchen island", costSegCategory: "kitchen", costSegItem: "cabinetry" },
  { pattern: /backsplash|subway tile/i, amenity: "Tile backsplash", costSegCategory: "kitchen", costSegItem: "backsplash" },

  // Bathroom
  { pattern: /soaking tub|freestanding tub|clawfoot/i, amenity: "Soaking tub", costSegCategory: "bathrooms", costSegItem: "bath-features" },
  { pattern: /walk.?in shower|frameless glass/i, amenity: "Walk-in shower", costSegCategory: "bathrooms", costSegItem: "bath-features" },
  { pattern: /dual vanity|double vanity/i, amenity: "Dual vanity", costSegCategory: "bathrooms", costSegItem: "bath-features" },
  { pattern: /rain shower/i, amenity: "Rain showerhead", costSegCategory: "bathrooms", costSegItem: "bath-features" },

  // Outdoor
  { pattern: /pool/i, amenity: "Swimming pool", costSegCategory: "outdoor", costSegItem: "pool" },
  { pattern: /hot tub|jacuzzi/i, amenity: "Hot tub", costSegCategory: "outdoor", costSegItem: "pool-features" },
  { pattern: /fire pit|firepit/i, amenity: "Fire pit", costSegCategory: "outdoor", costSegItem: "outdoor-features" },
  { pattern: /outdoor kitchen|built.?in grill/i, amenity: "Outdoor kitchen", costSegCategory: "outdoor", costSegItem: "outdoor-features" },
  { pattern: /pergola/i, amenity: "Pergola", costSegCategory: "outdoor", costSegItem: "outdoor-features" },
  { pattern: /deck|patio/i, amenity: "Deck / patio", costSegCategory: "outdoor", costSegItem: "deck-patio" },
  { pattern: /landscap|garden/i, amenity: "Professional landscaping", costSegCategory: "outdoor", costSegItem: "landscaping" },
  { pattern: /fence|fencing/i, amenity: "Fencing", costSegCategory: "outdoor", costSegItem: "fencing" },

  // Living / Interior
  { pattern: /fireplace/i, amenity: "Fireplace", costSegCategory: "interior", costSegItem: "interior-features" },
  { pattern: /hardwood floor/i, amenity: "Hardwood flooring", costSegCategory: "flooring", costSegItem: "primary-flooring" },
  { pattern: /built.?in|shelving|bookcase/i, amenity: "Built-in shelving", costSegCategory: "interior", costSegItem: "interior-features" },

  // Smart Home
  { pattern: /smart|keypad|thermostat/i, amenity: "Smart home tech", costSegCategory: "smart-home", costSegItem: "smart-features" },
  { pattern: /home theater|projector|cinema/i, amenity: "Home theater", costSegCategory: "smart-home", costSegItem: "smart-features" },

  // Specialty
  { pattern: /game room|pool table|arcade|foosball/i, amenity: "Game room", costSegCategory: "specialty", costSegItem: "entertainment" },
  { pattern: /gym|fitness/i, amenity: "Home gym", costSegCategory: "specialty", costSegItem: "entertainment" },
  { pattern: /sauna|steam room/i, amenity: "Sauna / steam room", costSegCategory: "specialty", costSegItem: "entertainment" },
];


/**
 * Categorize an image into a room type based on its caption text.
 * Returns a category ID from ROOM_CATEGORIES (kitchen, bedroom, etc.).
 *
 * @param {string} caption — image caption from Airbnb listing
 * @returns {string} category ID (e.g., "kitchen", "bathroom", "general")
 */
export function categorizeImageByCaption(caption) {
  if (!caption || typeof caption !== "string") return "general";

  const lower = caption.toLowerCase().trim();
  if (!lower) return "general";

  // Check each category's keywords in priority order
  // (kitchen, bathroom, outdoor are highest priority for cost seg)
  const priorityOrder = ["kitchen", "bathroom", "outdoor", "bedroom", "living"];

  for (const catId of priorityOrder) {
    const cat = ROOM_CATEGORIES[catId];
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return catId;
    }
  }

  return "general";
}


/**
 * Extract amenity strings from an image caption using keyword matching.
 * Returns an array of human-readable amenity names detected in the caption.
 *
 * PHASE 2: Replace with vision API call that analyzes the actual image pixels
 * to detect fixtures, materials, and finishes.
 *
 * @param {string} caption — image caption text
 * @returns {Array<{amenity: string, costSegCategory: string, costSegItem: string}>}
 */
export function extractAmenitiesFromCaption(caption) {
  if (!caption || typeof caption !== "string") return [];

  const detected = [];
  const seenAmenities = new Set();

  for (const entry of CAPTION_AMENITY_PATTERNS) {
    if (entry.pattern.test(caption) && !seenAmenities.has(entry.amenity)) {
      seenAmenities.add(entry.amenity);
      detected.push({
        amenity: entry.amenity,
        costSegCategory: entry.costSegCategory,
        costSegItem: entry.costSegItem,
      });
    }
  }

  return detected;
}


/**
 * Map an array of Airbnb amenity strings to our PROPERTY_CATEGORIES IDs.
 * This bridges the Airbnb amenity vocabulary to cost seg category language.
 *
 * @param {string[]} amenities — array of amenity strings (e.g., ["Pool", "Hot tub"])
 * @returns {Object} map of costSegCategoryId → array of matched amenity strings
 */
export function mapAmenitiesToCostSegCategories(amenities) {
  if (!Array.isArray(amenities) || amenities.length === 0) return {};

  const validCategoryIds = new Set(PROPERTY_CATEGORIES.map((c) => c.id));
  const mapping = {};

  for (const amenity of amenities) {
    if (!amenity || typeof amenity !== "string") continue;

    // Check each caption pattern for a match
    for (const entry of CAPTION_AMENITY_PATTERNS) {
      if (entry.pattern.test(amenity) && validCategoryIds.has(entry.costSegCategory)) {
        if (!mapping[entry.costSegCategory]) {
          mapping[entry.costSegCategory] = [];
        }
        if (!mapping[entry.costSegCategory].includes(entry.amenity)) {
          mapping[entry.costSegCategory].push(entry.amenity);
        }
        break; // One match per amenity is enough
      }
    }
  }

  return mapping;
}


/**
 * Build room card data by combining images + enrichment data.
 * This is the main orchestrator that produces the data structure
 * consumed by AirbnbAmenityDetection component.
 *
 * Each room card includes:
 * - id: unique key
 * - category: room category ID
 * - label: human-readable room name (e.g., "Kitchen", "Master Bathroom")
 * - images: array of {caption, imageUrl}
 * - amenities: array of {name, source, confidence, costSegCategory, costSegItem}
 * - costSegCategories: linked PROPERTY_CATEGORIES IDs
 *
 * @param {Array<{caption: string, imageUrl: string}>} images — listing photos
 * @param {Object|null} enrichment — parsed airbnbEnrichment (category-level data)
 * @returns {Array<Object>} room card data ready for rendering
 */
export function buildRoomCards(images, enrichment) {
  if (!Array.isArray(images) || images.length === 0) return [];

  // Step 1: Group images by detected room category
  const groups = {};

  for (const img of images) {
    if (!img || !img.imageUrl) continue;

    const catId = categorizeImageByCaption(img.caption);

    if (!groups[catId]) {
      groups[catId] = {
        images: [],
        captionAmenities: [],
      };
    }

    groups[catId].images.push({
      caption: img.caption || "",
      imageUrl: img.imageUrl,
    });

    // Extract amenities from this image's caption
    const detected = extractAmenitiesFromCaption(img.caption);
    for (const d of detected) {
      if (!groups[catId].captionAmenities.find((a) => a.amenity === d.amenity)) {
        groups[catId].captionAmenities.push(d);
      }
    }
  }

  // Step 2: Build enrichment amenity lookup keyed by cost seg category
  const enrichmentByCostSeg = buildEnrichmentLookup(enrichment);

  // Step 3: Assemble final room cards
  const cards = [];
  const categoryOrder = ["kitchen", "bathroom", "bedroom", "outdoor", "living", "general"];

  for (const catId of categoryOrder) {
    const group = groups[catId];
    if (!group) continue;

    const roomDef = ROOM_CATEGORIES[catId];
    const amenities = [];
    const seenNames = new Set();

    // Add enrichment-sourced amenities first (higher confidence)
    for (const costSegId of roomDef.costSegIds) {
      const enrichmentItems = enrichmentByCostSeg[costSegId] || [];
      for (const item of enrichmentItems) {
        if (!seenNames.has(item.name)) {
          seenNames.add(item.name);
          amenities.push({
            name: item.name,
            source: "api",
            confidence: "high",
            costSegCategory: costSegId,
            costSegItem: item.costSegItem || null,
          });
        }
      }
    }

    // Add caption-detected amenities (medium confidence)
    for (const ca of group.captionAmenities) {
      if (!seenNames.has(ca.amenity)) {
        seenNames.add(ca.amenity);
        amenities.push({
          name: ca.amenity,
          source: "caption",
          confidence: "medium",
          costSegCategory: ca.costSegCategory,
          costSegItem: ca.costSegItem,
        });
      }
    }

    // Derive a more specific label from the first image's caption
    const specificLabel = deriveRoomLabel(catId, group.images[0]?.caption || "");

    cards.push({
      id: `room-${catId}-${cards.length}`,
      category: catId,
      label: specificLabel,
      images: group.images,
      amenities,
      costSegCategories: roomDef.costSegIds,
    });
  }

  return cards;
}


// ─── Internal Helpers ───

/**
 * Convert enrichment object (keyed by item ID, e.g. { pool: "saltwater", "bath-features": ["soaking-tub"] })
 * into a lookup keyed by cost seg category ID with human-readable names.
 */
function buildEnrichmentLookup(enrichment) {
  if (!enrichment || typeof enrichment !== "object") return {};

  const lookup = {};

  // Build a reverse map: item ID → { categoryId, item definition }
  const itemToCategoryMap = {};
  for (const cat of PROPERTY_CATEGORIES) {
    for (const item of cat.items) {
      itemToCategoryMap[item.id] = { categoryId: cat.id, item };
    }
  }

  for (const [itemId, value] of Object.entries(enrichment)) {
    const mapping = itemToCategoryMap[itemId];
    if (!mapping) continue;

    const { categoryId, item } = mapping;
    if (!lookup[categoryId]) lookup[categoryId] = [];

    if (Array.isArray(value)) {
      // Multi-select values
      for (const v of value) {
        const opt = item.options?.find((o) => o.value === v);
        const displayName = opt?.label || formatItemValue(v);
        lookup[categoryId].push({
          name: displayName,
          costSegItem: itemId,
        });
      }
    } else if (typeof value === "string" && value !== "none") {
      // Single-select value
      const opt = item.options?.find((o) => o.value === value);
      const displayName = opt?.label || formatItemValue(value);
      lookup[categoryId].push({
        name: `${item.label}: ${displayName}`,
        costSegItem: itemId,
      });
    }
  }

  return lookup;
}

/**
 * Format a raw item value into a display-friendly string.
 * e.g., "hot-tub" → "Hot Tub"
 */
function formatItemValue(value) {
  if (!value) return "";
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Derive a more specific room label from the caption text.
 * e.g., "Master bathroom with dual vanity" → "Master Bathroom"
 *       "Kitchen" → "Kitchen"
 */
function deriveRoomLabel(categoryId, caption) {
  const base = ROOM_CATEGORIES[categoryId]?.label || "Room";
  if (!caption) return base;

  const lower = caption.toLowerCase();

  // Try to extract a more specific label
  if (categoryId === "bathroom") {
    if (/master|primary/i.test(lower)) return "Master Bathroom";
    if (/guest/i.test(lower)) return "Guest Bathroom";
    if (/half/i.test(lower)) return "Half Bathroom";
    if (/en.?suite/i.test(lower)) return "En-Suite Bathroom";
    return "Bathroom";
  }

  if (categoryId === "bedroom") {
    if (/master|primary/i.test(lower)) return "Master Bedroom";
    if (/guest/i.test(lower)) return "Guest Bedroom";
    if (/bunk/i.test(lower)) return "Bunk Room";
    if (/kids|child/i.test(lower)) return "Kids Room";
    return "Bedroom";
  }

  if (categoryId === "outdoor") {
    if (/pool/i.test(lower)) return "Pool Area";
    if (/patio|deck/i.test(lower)) return "Patio / Deck";
    if (/backyard|yard/i.test(lower)) return "Backyard";
    if (/garden/i.test(lower)) return "Garden";
    return "Outdoor Area";
  }

  if (categoryId === "living") {
    if (/family/i.test(lower)) return "Family Room";
    if (/den/i.test(lower)) return "Den";
    return "Living Area";
  }

  return base;
}


// ─── Vision API Room Type → ROOM_CATEGORIES mapping ───
const VISION_ROOM_TYPE_MAP = {
  kitchen: "kitchen",
  bathroom: "bathroom",
  bedroom: "bedroom",
  living: "living",
  outdoor: "outdoor",
  laundry: "general",
  hallway: "general",
  other: "general",
};

// ─── Vision detection item → amenity display name ───
const VISION_ITEM_LABEL_MAP = {
  "granite": "Granite countertops",
  "quartz": "Quartz countertops",
  "marble": "Marble countertops",
  "laminate": "Laminate countertops",
  "stainless-steel": "Stainless steel appliances",
  "commercial-grade": "Commercial-grade appliances",
  "soaking-tub": "Soaking tub",
  "walk-in-shower": "Walk-in shower",
  "frameless-glass": "Frameless glass shower",
  "dual-vanity": "Dual vanity",
  "rain-shower": "Rain showerhead",
  "heated-floors": "Heated floors",
  "jetted-tub": "Jetted tub",
  "pool": "Swimming pool",
  "hot-tub": "Hot tub",
  "deck-patio": "Deck / patio",
  "outdoor-kitchen": "Outdoor kitchen",
  "built-in-grill": "Built-in grill",
  "fire-pit": "Fire pit",
  "pergola": "Pergola / covered patio",
  "hardwood": "Hardwood flooring",
  "engineered-hardwood": "Engineered hardwood flooring",
  "tile": "Tile flooring",
  "lvp": "Luxury vinyl plank flooring",
  "marble-floor": "Marble flooring",
  "fireplace": "Fireplace",
  "crown-molding": "Crown molding",
  "built-in-shelving": "Built-in shelving",
  "plantation-shutters": "Plantation shutters",
  "motorized-blinds": "Motorized blinds",
  "keypad-locks": "Smart lock / keypad",
  "security-cameras": "Security cameras",
  "smart-thermostat": "Smart thermostat",
  "whole-home-audio": "Whole-home audio",
  "home-theater": "Home theater",
  "game-room": "Game room",
  "home-gym": "Home gym",
  "wine-cellar": "Wine cellar",
  "sauna": "Sauna",
};

// Vision detection category → cost seg category
const VISION_CATEGORY_MAP = {
  kitchen: "kitchen",
  bathrooms: "bathrooms",
  flooring: "flooring",
  outdoor: "outdoor",
  hvac: "hvac",
  interior: "interior",
  "smart-home": "smart-home",
  specialty: "specialty",
};


/**
 * Merge Claude Vision API results into existing room cards.
 * Vision results add AI-detected amenities with "vision" source and
 * refine room categorization using the model's room_type output.
 *
 * @param {Array<Object>} roomCards — from buildRoomCards()
 * @param {Array<Object>} visionResults — from /api/vision/analyze response.results
 *   Each item: { imageUrl, caption, room_type, detections: [{item, label, category, quality, confidence}] }
 * @returns {Array<Object>} updated room cards with vision-detected amenities merged in
 */
export function mergeVisionIntoRoomCards(roomCards, visionResults) {
  if (!Array.isArray(visionResults) || visionResults.length === 0) return roomCards;
  if (!Array.isArray(roomCards) || roomCards.length === 0) return roomCards;

  // Build a lookup: imageUrl → vision result
  const visionByUrl = {};
  for (const result of visionResults) {
    if (result.imageUrl) {
      visionByUrl[result.imageUrl] = result;
    }
  }

  // Deep-clone cards so we don't mutate the originals
  const updatedCards = roomCards.map((card) => ({
    ...card,
    amenities: [...card.amenities],
    images: [...card.images],
  }));

  // For each vision result, find which card contains this image and merge detections
  for (const result of visionResults) {
    if (!result.imageUrl || !Array.isArray(result.detections)) continue;

    const card = updatedCards.find((c) =>
      c.images.some((img) => img.imageUrl === result.imageUrl)
    );

    if (!card) continue;

    const seenNames = new Set(card.amenities.map((a) => a.name));

    for (const detection of result.detections) {
      if (!detection.item || detection.confidence < 0.5) continue;

      const displayName =
        VISION_ITEM_LABEL_MAP[detection.item] ||
        detection.label ||
        formatItemValue(detection.item);

      if (seenNames.has(displayName)) continue;
      seenNames.add(displayName);

      const costSegCategory = VISION_CATEGORY_MAP[detection.category] || detection.category || null;

      card.amenities.push({
        name: displayName,
        source: "vision",
        confidence: detection.confidence >= 0.85 ? "high" : "medium",
        quality: detection.quality || null,
        costSegCategory,
        costSegItem: detection.item,
      });
    }
  }

  return updatedCards;
}


/**
 * Get the confidence level label and description for display.
 * @param {"high"|"medium"|"low"} level
 * @returns {{label: string, description: string}}
 */
export function getConfidenceInfo(level) {
  switch (level) {
    case "high":
      return {
        label: "High",
        description: "Confirmed from listing amenity data",
      };
    case "medium":
      return {
        label: "Medium",
        description: "Detected from photo caption",
      };
    case "low":
      // PHASE 2: This level will be used for vision API inferences
      return {
        label: "Low",
        description: "AI-inferred from image analysis",
      };
    default:
      return {
        label: "Unknown",
        description: "",
      };
  }
}
