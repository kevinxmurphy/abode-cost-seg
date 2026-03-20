// Property detail categories for Tier 2 detailed walkthrough
// Each category maps to IRS cost segregation asset classes
// Pre-populated based on property age, price, type, and region

export const PROPERTY_CATEGORIES = [
  {
    id: "kitchen",
    name: "Kitchen",
    icon: "🍳",
    description: "Countertops, cabinetry, appliances, and finishes",
    depreciationNote: "Most kitchen components are 5-year or 7-year property",
    items: [
      {
        id: "countertops",
        label: "Countertops",
        type: "select",
        options: [
          { value: "granite", label: "Granite", tier: "premium" },
          { value: "quartz", label: "Quartz / Engineered Stone", tier: "premium" },
          { value: "marble", label: "Marble", tier: "luxury" },
          { value: "butcher-block", label: "Butcher Block", tier: "mid" },
          { value: "laminate", label: "Laminate / Formica", tier: "standard" },
          { value: "tile", label: "Tile", tier: "mid" },
          { value: "concrete", label: "Concrete", tier: "premium" },
        ],
        assetLife: "5-year",
      },
      {
        id: "cabinetry",
        label: "Cabinetry",
        type: "select",
        options: [
          { value: "custom", label: "Custom Built", tier: "luxury" },
          { value: "semi-custom", label: "Semi-Custom", tier: "premium" },
          { value: "stock", label: "Stock / Builder Grade", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "appliances",
        label: "Appliances",
        type: "select",
        options: [
          { value: "premium", label: "Premium (Sub-Zero, Wolf, Viking)", tier: "luxury" },
          { value: "mid-range", label: "Mid-Range (KitchenAid, Bosch, GE Profile)", tier: "premium" },
          { value: "standard", label: "Standard / Builder Grade", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "backsplash",
        label: "Backsplash",
        type: "select",
        options: [
          { value: "tile", label: "Tile (subway, mosaic, etc.)", tier: "mid" },
          { value: "stone", label: "Natural Stone / Marble", tier: "premium" },
          { value: "glass", label: "Glass", tier: "premium" },
          { value: "none", label: "None / Paint", tier: "standard" },
        ],
        assetLife: "5-year",
      },
    ],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    icon: "🚿",
    description: "Fixtures, tile, vanities, and specialty features",
    depreciationNote: "Bathroom fixtures and finishes are 5-year personal property",
    items: [
      {
        id: "bath-count-updated",
        label: "How many bathrooms have been updated?",
        type: "select",
        options: [
          { value: "all", label: "All bathrooms", tier: "premium" },
          { value: "most", label: "Most (primary + guest)", tier: "mid" },
          { value: "some", label: "Just the primary bath", tier: "mid" },
          { value: "none", label: "None — all original", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "fixtures",
        label: "Fixture Quality",
        type: "select",
        options: [
          { value: "luxury", label: "Designer / Luxury (Kohler Artist, Brizo)", tier: "luxury" },
          { value: "premium", label: "Premium (Kohler, Moen, Delta high-end)", tier: "premium" },
          { value: "standard", label: "Standard / Builder Grade", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "bath-features",
        label: "Special Features",
        type: "multi",
        options: [
          { value: "soaking-tub", label: "Soaking / Freestanding Tub" },
          { value: "walk-in-shower", label: "Walk-in Shower (frameless glass)" },
          { value: "dual-vanity", label: "Dual Vanity" },
          { value: "heated-floors", label: "Heated Floors" },
          { value: "rain-shower", label: "Rain Showerhead" },
        ],
        assetLife: "5-year",
      },
    ],
  },
  {
    id: "flooring",
    name: "Flooring",
    icon: "🪵",
    description: "Materials throughout the home",
    depreciationNote: "Flooring is typically 5-year property when identified separately",
    items: [
      {
        id: "primary-flooring",
        label: "Primary Flooring (most of the home)",
        type: "select",
        options: [
          { value: "hardwood", label: "Hardwood", tier: "premium" },
          { value: "engineered", label: "Engineered Hardwood", tier: "mid" },
          { value: "lvp", label: "Luxury Vinyl Plank (LVP)", tier: "mid" },
          { value: "tile", label: "Tile / Porcelain", tier: "premium" },
          { value: "stone", label: "Natural Stone (travertine, slate)", tier: "luxury" },
          { value: "carpet", label: "Carpet", tier: "standard" },
          { value: "laminate", label: "Laminate", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "flooring-condition",
        label: "Flooring Condition",
        type: "select",
        options: [
          { value: "new", label: "Replaced / Installed new", tier: "premium" },
          { value: "good", label: "Original but good condition", tier: "mid" },
          { value: "worn", label: "Showing wear / needs replacement", tier: "standard" },
        ],
        assetLife: "5-year",
      },
    ],
  },
  {
    id: "outdoor",
    name: "Outdoor & Land",
    icon: "🌴",
    description: "Pool, deck, landscaping, fencing, sport courts, and outdoor living",
    depreciationNote: "Land improvements are 15-year property — significant for bonus depreciation",
    items: [
      {
        id: "pool",
        label: "Pool",
        type: "select",
        options: [
          { value: "saltwater", label: "Saltwater Pool", tier: "premium" },
          { value: "chlorine", label: "Chlorine Pool", tier: "mid" },
          { value: "plunge", label: "Plunge / Cocktail Pool", tier: "premium" },
          { value: "none", label: "No Pool", tier: "none" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
      {
        id: "pool-features",
        label: "Pool Features",
        type: "multi",
        showWhen: { field: "pool", notValue: "none" },
        options: [
          { value: "heated", label: "Heated Pool (heater + pump — separate depreciable assets)" },
          { value: "pool-heater-gas", label: "Gas Pool Heater" },
          { value: "pool-heater-heat-pump", label: "Heat Pump Pool Heater" },
          { value: "hot-tub", label: "Hot Tub / Spa" },
          { value: "waterfall", label: "Water Feature / Waterfall" },
          { value: "pool-lighting", label: "Pool Lighting (LED / fiber optic)" },
          { value: "auto-cover", label: "Automatic Cover" },
          { value: "infinity-edge", label: "Infinity / Negative Edge" },
          { value: "sun-shelf", label: "Sun Shelf / Tanning Ledge" },
        ],
        assetLife: "15-year",
      },
      {
        id: "deck-patio",
        label: "Deck / Patio",
        type: "select",
        options: [
          { value: "composite", label: "Composite Deck (Trex, TimberTech)", tier: "premium" },
          { value: "wood-deck", label: "Wood Deck", tier: "mid" },
          { value: "paver", label: "Paver Patio / Stone", tier: "premium" },
          { value: "concrete-patio", label: "Concrete Patio", tier: "standard" },
          { value: "none", label: "None / Minimal", tier: "none" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
      {
        id: "outdoor-features",
        label: "Outdoor Amenities",
        type: "multi",
        options: [
          { value: "outdoor-kitchen", label: "Outdoor Kitchen / Built-in Grill" },
          { value: "fire-pit", label: "Fire Pit / Outdoor Fireplace" },
          { value: "pergola", label: "Pergola / Covered Patio / Gazebo" },
          { value: "outdoor-shower", label: "Outdoor Shower" },
          { value: "sport-court", label: "Sport Court (basketball, pickleball, tennis)" },
          { value: "playground", label: "Play Structure / Playground" },
          { value: "driveway", label: "Paved Driveway / Parking Pad" },
          { value: "cabana", label: "Cabana / Pool House" },
          { value: "putting-green-outdoor", label: "Putting Green" },
          { value: "rv-hookup", label: "RV Hookup / Pad" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
      {
        id: "landscaping",
        label: "Landscaping",
        type: "select",
        options: [
          { value: "professional", label: "Professional / Designed Landscaping", tier: "premium" },
          { value: "moderate", label: "Well-Maintained Yard", tier: "mid" },
          { value: "desert", label: "Desert / Xeriscape", tier: "mid" },
          { value: "minimal", label: "Minimal / Basic", tier: "standard" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
      {
        id: "fencing",
        label: "Fencing",
        type: "select",
        options: [
          { value: "privacy", label: "Privacy Fence (wood, vinyl, composite)", tier: "mid" },
          { value: "wrought-iron", label: "Wrought Iron / Aluminum", tier: "premium" },
          { value: "block-wall", label: "Block Wall / Masonry", tier: "premium" },
          { value: "none", label: "No Fencing", tier: "none" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
      {
        id: "waterfront",
        label: "Waterfront Features",
        type: "multi",
        options: [
          { value: "dock", label: "Dock / Pier" },
          { value: "seawall", label: "Seawall / Bulkhead" },
          { value: "boat-lift", label: "Boat Lift" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
      {
        id: "water-system",
        label: "Water / Septic",
        type: "multi",
        options: [
          { value: "septic", label: "Septic system" },
          { value: "well", label: "Private well" },
        ],
        assetLife: "15-year",
        excludePropertyTypes: ["Condo"],
      },
    ],
  },
  {
    id: "hvac-systems",
    name: "HVAC & Systems",
    icon: "❄️",
    description: "Heating, cooling, water heater, electrical, and solar",
    depreciationNote: "HVAC and mechanical systems are 5-year or 7-year property",
    items: [
      {
        id: "hvac-type",
        label: "HVAC System",
        type: "select",
        options: [
          { value: "central-new", label: "Central AC/Heat — replaced or newer", tier: "premium" },
          { value: "central-original", label: "Central AC/Heat — original", tier: "mid" },
          { value: "mini-split", label: "Mini-Split / Ductless System", tier: "premium" },
          { value: "window", label: "Window Units / Space Heaters", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "water-heater",
        label: "Water Heater",
        type: "select",
        options: [
          { value: "tankless", label: "Tankless / On-Demand", tier: "premium" },
          { value: "tank-new", label: "Tank — newer / replaced", tier: "mid" },
          { value: "tank-original", label: "Tank — original", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "energy-features",
        label: "Energy & Electrical",
        type: "multi",
        options: [
          { value: "solar", label: "Solar Panels (owned, not leased)" },
          { value: "ev-charger", label: "EV Charger" },
          { value: "generator", label: "Whole-Home Generator" },
          { value: "updated-panel", label: "Updated Electrical Panel (200A+)" },
          { value: "battery-storage", label: "Battery Storage System (Tesla Powerwall, etc.)" },
        ],
        assetLife: "5-year",
      },
      {
        id: "roofing",
        label: "Roofing",
        type: "select",
        options: [
          { value: "metal", label: "Metal / Standing Seam", tier: "premium" },
          { value: "tile-concrete", label: "Concrete / Clay Tile", tier: "premium" },
          { value: "tile-slate", label: "Slate", tier: "luxury" },
          { value: "architectural-shingle", label: "Architectural Shingles (30-year)", tier: "mid" },
          { value: "standard-shingle", label: "Standard 3-Tab Shingles", tier: "standard" },
          { value: "flat-tpo", label: "Flat / TPO / EPDM", tier: "mid" },
        ],
        assetLife: "27.5-year",
      },
    ],
  },
  {
    id: "interior",
    name: "Interior Finishes",
    icon: "💡",
    description: "Lighting, molding, window treatments, and built-ins",
    depreciationNote: "Decorative finishes and fixtures are 5-year personal property",
    items: [
      {
        id: "lighting",
        label: "Lighting",
        type: "select",
        options: [
          { value: "designer", label: "Designer / Statement Fixtures", tier: "luxury" },
          { value: "recessed", label: "Recessed + Upgraded Fixtures", tier: "premium" },
          { value: "updated", label: "Updated but Standard", tier: "mid" },
          { value: "original", label: "Original / Basic", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "molding-trim",
        label: "Molding & Trim",
        type: "select",
        options: [
          { value: "crown-extensive", label: "Crown Molding + Wainscoting", tier: "premium" },
          { value: "crown-basic", label: "Crown Molding (basic)", tier: "mid" },
          { value: "none", label: "Standard / No Special Trim", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "window-treatments",
        label: "Window Treatments",
        type: "select",
        options: [
          { value: "plantation", label: "Plantation Shutters", tier: "premium" },
          { value: "motorized", label: "Motorized Blinds / Shades", tier: "luxury" },
          { value: "custom", label: "Custom Drapes / Curtains", tier: "mid" },
          { value: "standard", label: "Standard Blinds", tier: "standard" },
        ],
        assetLife: "5-year",
      },
      {
        id: "interior-features",
        label: "Built-In Features",
        type: "multi",
        options: [
          { value: "fireplace", label: "Fireplace (gas or electric)" },
          { value: "built-in-shelving", label: "Built-In Shelving / Library" },
          { value: "closet-system", label: "Custom Closet Systems" },
          { value: "accent-wall", label: "Accent Walls (stone, shiplap, etc.)" },
        ],
        assetLife: "5-year",
      },
    ],
  },
  {
    id: "smart-home",
    name: "Smart Home & Security",
    icon: "📱",
    description: "Automation, cameras, locks, and connected systems",
    depreciationNote: "Technology and security systems are 5-year property",
    items: [
      {
        id: "security",
        label: "Security System",
        type: "select",
        options: [
          { value: "professional", label: "Professionally Monitored (ADT, Vivint, Ring Pro)", tier: "premium" },
          { value: "diy", label: "DIY System (Ring, SimpliSafe)", tier: "mid" },
          { value: "cameras-only", label: "Cameras Only", tier: "mid" },
          { value: "none", label: "None", tier: "none" },
        ],
        assetLife: "5-year",
      },
      {
        id: "smart-features",
        label: "Smart Home Features",
        type: "multi",
        options: [
          { value: "smart-locks", label: "Smart Locks (keypad / app-controlled)" },
          { value: "smart-thermostat", label: "Smart Thermostat (Nest, Ecobee)" },
          { value: "whole-home-audio", label: "Whole-Home Audio System" },
          { value: "smart-lighting", label: "Smart Lighting (Lutron, Hue)" },
          { value: "home-theater", label: "Dedicated Home Theater / AV System" },
        ],
        assetLife: "5-year",
      },
    ],
  },
  {
    id: "specialty",
    name: "Specialty & Amenities",
    icon: "🎮",
    description: "Game rooms, gyms, unique features that make your STR stand out",
    depreciationNote: "Equipment and specialty items are 5-year or 7-year property",
    items: [
      {
        id: "entertainment",
        label: "Entertainment & Recreation",
        type: "multi",
        options: [
          { value: "game-room", label: "Game Room (pool table, arcade, foosball, etc.)" },
          { value: "home-gym", label: "Home Gym / Fitness Equipment" },
          { value: "wine-cellar", label: "Wine Cellar / Wet Bar" },
          { value: "sauna-steam", label: "Sauna / Steam Room" },
          { value: "bunk-room", label: "Bunk Room (custom built-ins)" },
          { value: "theater-room", label: "Dedicated Theater / Media Room" },
          { value: "recording-studio", label: "Recording Studio / Music Room" },
          { value: "craft-room", label: "Craft Room / Artist Studio" },
          { value: "ski-gear-room", label: "Ski / Gear / Equipment Storage Room" },
          { value: "arcade-room", label: "Dedicated Arcade Room" },
        ],
        assetLife: "5-year",
      },
      {
        id: "unique-features",
        label: "Unique / Premium Features",
        type: "multi",
        options: [
          { value: "elevator", label: "Elevator / Lift" },
          { value: "golf-sim", label: "Golf Simulator" },
          { value: "outdoor-movie", label: "Outdoor Movie Screen / Projector" },
          { value: "boat-dock", label: "Boat Dock / Lift" },
          { value: "putting-green", label: "Putting Green" },
          { value: "shooting-range", label: "Indoor Shooting Range" },
          { value: "car-lift", label: "Car Lift / Show Garage" },
          { value: "pottery-kiln", label: "Pottery Kiln / Art Studio Equipment" },
          { value: "commercial-kitchen", label: "Commercial-Grade Kitchen" },
          { value: "atv-garage", label: "ATV / Toy Barn / Detached Garage" },
        ],
        assetLife: "15-year",
      },
    ],
  },
];

// ─── Pre-population Engine ───
// Returns best-guess defaults based on property characteristics

const REGION_MAP = {
  AZ: "desert", CA: "coastal", CO: "mountain", FL: "coastal", HI: "coastal",
  NC: "mountain", NM: "desert", SC: "coastal", TN: "inland", TX: "inland",
  UT: "mountain", NV: "desert",
};

function getPriceTier(price) {
  if (price >= 1500000) return "luxury";
  if (price >= 750000) return "premium";
  if (price >= 400000) return "mid";
  return "standard";
}

function getAgeTier(yearBuilt) {
  if (yearBuilt >= 2020) return "new";
  if (yearBuilt >= 2010) return "modern";
  if (yearBuilt >= 2000) return "recent";
  if (yearBuilt >= 1990) return "aging";
  return "older";
}

export function getPropertyDefaults(propertyData) {
  const {
    propertyType = "Single Family",
    yearBuilt = 2010,
    purchasePrice = 500000,
    state = "",
  } = propertyData;

  const priceTier = getPriceTier(purchasePrice);
  const ageTier = getAgeTier(yearBuilt);
  const region = REGION_MAP[state] || "inland";
  const isCondo = propertyType === "Condo";

  const defaults = {};

  // Kitchen
  if (priceTier === "luxury") {
    defaults.countertops = "quartz";
    defaults.cabinetry = "custom";
    defaults.appliances = "premium";
    defaults.backsplash = "stone";
  } else if (priceTier === "premium") {
    defaults.countertops = "granite";
    defaults.cabinetry = "semi-custom";
    defaults.appliances = "mid-range";
    defaults.backsplash = "tile";
  } else if (priceTier === "mid") {
    defaults.countertops = "granite";
    defaults.cabinetry = "stock";
    defaults.appliances = "standard";
    defaults.backsplash = "tile";
  } else {
    defaults.countertops = "laminate";
    defaults.cabinetry = "stock";
    defaults.appliances = "standard";
    defaults.backsplash = "none";
  }

  // Bathrooms
  if (priceTier === "luxury" || priceTier === "premium") {
    defaults["bath-count-updated"] = "all";
    defaults.fixtures = priceTier === "luxury" ? "luxury" : "premium";
    defaults["bath-features"] = ["walk-in-shower", "dual-vanity"];
  } else {
    defaults["bath-count-updated"] = ageTier === "new" || ageTier === "modern" ? "all" : "some";
    defaults.fixtures = "standard";
    defaults["bath-features"] = [];
  }

  // Flooring
  if (priceTier === "luxury") {
    defaults["primary-flooring"] = "hardwood";
    defaults["flooring-condition"] = ageTier === "new" ? "new" : "good";
  } else if (priceTier === "premium") {
    defaults["primary-flooring"] = region === "desert" || region === "coastal" ? "tile" : "hardwood";
    defaults["flooring-condition"] = ageTier === "new" || ageTier === "modern" ? "new" : "good";
  } else {
    defaults["primary-flooring"] = ageTier === "new" || ageTier === "modern" ? "lvp" : "carpet";
    defaults["flooring-condition"] = ageTier === "new" ? "new" : ageTier === "aging" || ageTier === "older" ? "worn" : "good";
  }

  // Outdoor & Land (skip most for condos)
  if (isCondo) {
    defaults.pool = "none";
    defaults["pool-features"] = [];
    defaults["deck-patio"] = "none";
    defaults["outdoor-features"] = [];
    defaults.landscaping = "minimal";
    defaults.fencing = "none";
  } else {
    // Pool — regional bias
    if (region === "desert" || region === "coastal") {
      defaults.pool = priceTier === "luxury" || priceTier === "premium" ? "saltwater" : priceTier === "mid" ? "chlorine" : "none";
    } else if (region === "mountain") {
      defaults.pool = priceTier === "luxury" ? "plunge" : "none";
    } else {
      defaults.pool = priceTier === "luxury" || priceTier === "premium" ? "chlorine" : "none";
    }

    defaults["pool-features"] = defaults.pool !== "none" ? ["heated"] : [];

    // Deck
    if (region === "mountain") {
      defaults["deck-patio"] = priceTier === "luxury" || priceTier === "premium" ? "composite" : "wood-deck";
    } else if (region === "desert") {
      defaults["deck-patio"] = priceTier === "luxury" || priceTier === "premium" ? "paver" : "concrete-patio";
    } else {
      defaults["deck-patio"] = priceTier === "luxury" ? "composite" : priceTier === "premium" ? "paver" : "concrete-patio";
    }

    // Outdoor features
    defaults["outdoor-features"] = [];
    if (priceTier === "luxury") defaults["outdoor-features"].push("outdoor-kitchen", "fire-pit", "pergola");
    else if (priceTier === "premium") defaults["outdoor-features"].push("fire-pit");

    // Landscaping
    if (region === "desert") {
      defaults.landscaping = priceTier === "luxury" || priceTier === "premium" ? "desert" : "minimal";
    } else {
      defaults.landscaping = priceTier === "luxury" ? "professional" : priceTier === "premium" ? "moderate" : "minimal";
    }

    // Fencing
    defaults.fencing = priceTier === "luxury" ? "block-wall" : priceTier === "premium" || priceTier === "mid" ? "privacy" : "none";

    // Waterfront — default empty, user must select
    defaults.waterfront = [];

    // Water / Septic — default empty, user must select
    defaults["water-system"] = [];
  }

  // HVAC
  if (ageTier === "new" || ageTier === "modern") {
    defaults["hvac-type"] = "central-new";
  } else {
    defaults["hvac-type"] = "central-original";
  }
  defaults["water-heater"] = priceTier === "luxury" || priceTier === "premium" ? "tankless" : ageTier === "new" ? "tank-new" : "tank-original";
  defaults["energy-features"] = [];
  if (region === "desert" || region === "coastal") {
    if (priceTier === "luxury" || priceTier === "premium") defaults["energy-features"].push("solar");
  }

  // Interior
  if (priceTier === "luxury") {
    defaults.lighting = "designer";
    defaults["molding-trim"] = "crown-extensive";
    defaults["window-treatments"] = "plantation";
    defaults["interior-features"] = ["fireplace", "built-in-shelving", "closet-system"];
  } else if (priceTier === "premium") {
    defaults.lighting = "recessed";
    defaults["molding-trim"] = "crown-basic";
    defaults["window-treatments"] = "custom";
    defaults["interior-features"] = ["fireplace"];
  } else {
    defaults.lighting = ageTier === "new" || ageTier === "modern" ? "updated" : "original";
    defaults["molding-trim"] = "none";
    defaults["window-treatments"] = "standard";
    defaults["interior-features"] = [];
  }

  // Smart Home
  defaults.security = priceTier === "luxury" || priceTier === "premium" ? "professional" : "diy";
  defaults["smart-features"] = ["smart-locks", "smart-thermostat"]; // Almost all STRs have these
  if (priceTier === "luxury") defaults["smart-features"].push("whole-home-audio");

  // Specialty
  defaults.entertainment = [];
  defaults["unique-features"] = [];
  if (priceTier === "luxury") {
    defaults.entertainment = ["game-room"];
  }

  return defaults;
}

// ─── Estimate Contribution Calculator ───
// Returns the estimated depreciation contribution from property detail selections

const TIER_VALUES = { luxury: 1.0, premium: 0.7, mid: 0.4, standard: 0.15, none: 0 };

export function calculateDetailContribution(categoryId, selections, purchasePrice) {
  const category = PROPERTY_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) return 0;

  let score = 0;
  let itemCount = 0;

  for (const item of category.items) {
    const val = selections[item.id];
    if (!val) continue;

    if (item.type === "select") {
      const opt = item.options.find((o) => o.value === val);
      if (opt && opt.tier) {
        score += TIER_VALUES[opt.tier] || 0;
        itemCount++;
      }
    } else if (item.type === "multi" && Array.isArray(val)) {
      const nonNone = val.filter((v) => v !== "none");
      score += nonNone.length * 0.3;
      if (nonNone.length > 0) itemCount++;
    }
  }

  if (itemCount === 0) return 0;

  // Normalize score and convert to dollar contribution
  const avgScore = score / itemCount;

  // Each category has a base contribution percentage of the depreciable basis
  const CATEGORY_WEIGHTS = {
    kitchen: 0.04,
    bathrooms: 0.035,
    flooring: 0.03,
    outdoor: 0.06,
    "hvac-systems": 0.035,
    interior: 0.025,
    "smart-home": 0.015,
    specialty: 0.02,
  };

  const weight = CATEGORY_WEIGHTS[categoryId] || 0.02;
  const depreciableBasis = purchasePrice * 0.83; // rough 17% land assumption for this calc

  return Math.round(depreciableBasis * weight * avgScore);
}

// ─── Total reclassification from all categories ───
export function calculateTotalReclass(allSelections, purchasePrice) {
  let total = 0;
  for (const cat of PROPERTY_CATEGORIES) {
    total += calculateDetailContribution(cat.id, allSelections, purchasePrice);
  }
  return total;
}
