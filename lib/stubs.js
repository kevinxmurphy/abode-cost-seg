// ═══════════════════════════════════════════════════════
// ABODE — Stub Data & Mock Functions
// All backend touchpoints are placeholders for Phase 1
// ═══════════════════════════════════════════════════════

// STUB: Auth — always returns mock logged-in user
export const MOCK_USER = {
  id: "usr_demo",
  name: "Kevin",
  email: "kevin@example.com",
  plan: "standard",
};

// STUB: Sample study data
export const MOCK_STUDY = {
  id: "std_demo_001",
  propertyAddress: "74001 Desert Rose Lane, La Quinta, CA",
  purchasePrice: 875000,
  closingDate: "2024-06-15",
  yearBuilt: 2018,
  propertyType: "Short-Term Rental",
  squareFootage: 2850,
  depreciableBasis: 726250,
  landValue: 148750,
  personalProperty5yr: 89430,
  personalProperty7yr: 22715,
  personalProperty15yr: 41280,
  section1250Property: 572825,
  firstYearDeduction: 61847,
  bonusDepreciationRate: 0.6,
  bonusDepreciationAmount: 92055,
  totalAcceleratedDeduction: 153902,
  estimatedTaxSavings: 56944,
  status: "complete",
  completedAt: "2024-07-02",
};

// STUB: Additional mock properties
export const MOCK_PROPERTIES = [
  {
    id: "prop_001",
    address: "74001 Desert Rose Lane, La Quinta, CA",
    purchasePrice: 875000,
    yearBuilt: 2018,
    propertyType: "Short-Term Rental",
    studyStatus: "complete",
    studyId: "std_demo_001",
  },
  {
    id: "prop_002",
    address: "1842 Sunset Canyon Dr, Scottsdale, AZ",
    purchasePrice: 1250000,
    yearBuilt: 2021,
    propertyType: "Short-Term Rental",
    studyStatus: "processing",
    studyId: "std_demo_002",
  },
  {
    id: "prop_003",
    address: "328 Mountain View Ct, Park City, UT",
    purchasePrice: 2100000,
    yearBuilt: 2015,
    propertyType: "Short-Term Rental",
    studyStatus: "pending",
    studyId: null,
  },
];

// STUB: Quiz result calculation
// Note: The enhanced calculation logic is now in QuizResults.js
// This stub remains for backward compatibility
export function calculateQuizEstimate(answers) {
  // PHASE 2: Replace with real AI-driven estimate
  const price = answers.purchasePrice || 500000;
  const bracket = answers.taxBracket || 0.32;

  const depreciableBasis = price * 0.83;
  const acceleratedPercent = 0.22;
  const bonusRate = 0.6;

  const accelerated = depreciableBasis * acceleratedPercent;
  const bonusDeduction = accelerated * bonusRate;
  const firstYearDeduction = accelerated * 0.08 + bonusDeduction;
  const estimatedSavings = firstYearDeduction * bracket;

  return {
    conservative: Math.round(estimatedSavings * 0.75),
    likely: Math.round(estimatedSavings),
    optimistic: Math.round(estimatedSavings * 1.3),
    firstYearDeduction: Math.round(firstYearDeduction),
    acceleratedAmount: Math.round(accelerated),
  };
}

// STUB: Auth functions
export function login() {
  // PHASE 2: Real auth (Supabase / Clerk / NextAuth)
  return MOCK_USER;
}

export function signup() {
  // PHASE 2: Real auth
  return MOCK_USER;
}

export function logout() {
  // PHASE 2: Real auth
  return null;
}

// Payment — redirects to Stripe Checkout
export async function initiateCheckout({ propertyAddress, propertyId } = {}) {
  // Track checkout initiation
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture("checkout_initiated", { propertyAddress, propertyId });
  }

  const res = await fetch("/api/checkout/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ propertyAddress, propertyId }),
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    throw new Error(data.error || "Failed to create checkout session");
  }
}

// Email capture — writes to Supabase email_captures table via API route
export async function captureEmail(email, { source = "unknown", propertyAddress = null, quizData = null } = {}) {
  try {
    // Attach UTM attribution if available
    let utmData = {};
    try {
      const raw = sessionStorage.getItem("abode_utm");
      if (raw) {
        const utms = JSON.parse(raw);
        utmData = {
          utmSource: utms.utm_source,
          utmMedium: utms.utm_medium,
          utmCampaign: utms.utm_campaign,
        };
      }
    } catch { /* ignore */ }

    const res = await fetch("/api/email-captures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source, propertyAddress, quizData, ...utmData }),
    });
    return res.ok ? { success: true } : { success: false };
  } catch {
    console.error("[captureEmail] failed");
    return { success: false };
  }
}

// STUB: PDF/Excel download
export function downloadStudy(studyId, format) {
  // PHASE 2: Real PDF/Excel generation
  alert(`${format.toUpperCase()} download coming soon`);
}

// STUB: Airbnb listing fetch via Apify
// PHASE 2: Replace with real Apify API call:
//   POST https://api.apify.com/v2/acts/{actorId}/runs?token={token}
//   Body: { "startUrls": [{ "url": "https://www.airbnb.com/rooms/{roomId}" }] }
export async function fetchAirbnbListing(roomId) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 1200));

  // Return mock data for Canyon Trail (room 27128234) or generic fallback
  const listing = MOCK_AIRBNB_LISTINGS[roomId] || MOCK_AIRBNB_LISTINGS["27128234"];
  return listing;
}

// Mock Airbnb listing data — Canyon Trail Resort, Indio CA
const MOCK_AIRBNB_LISTINGS = {
  "27128234": {
    id: "27128234",
    coordinates: { latitude: 33.7019, longitude: -116.255 },
    thumbnail: "https://a0.muscache.com/im/pictures/64372c5d-154f-455f-9d43-8e2884409e12.jpg",
    url: "https://www.airbnb.com/rooms/27128234",
    propertyType: "Entire villa",
    roomType: "Entire home/apt",
    personCapacity: 12,
    rating: {
      accuracy: 4.77, checking: 4.89, cleanliness: 4.7, communication: 4.82,
      location: 4.75, value: 4.63, guestSatisfaction: 4.75, reviewsCount: 167,
    },
    location: "Indio",
    host: {
      name: "Sarah & Kevin",
      isSuperHost: true,
      isVerified: true,
      ratingAverage: 4.76,
    },
    locationSubtitle: "Indio, California, United States",
    title: "\u{16924} Canyon Trail Resort \u{16924} EPIC Pool/Yard 4 Bedroom",
    subDescription: {
      title: "Entire villa in Indio, California",
      items: ["12 guests", "4 bedrooms", "7 beds", "2 baths"],
    },
    description: "Welcome to Canyon Trail Resort! A private oasis perfect for a relaxing family or group retreat. The backyard is a true desert escape with lush greenery, a huge pool, and a sauna. The tiled floors are warm and inviting. Enjoy the large 4k HiDef TV with Netflix. Cozy up to the blazing fireplace on cooler nights. The heated pool and spa (hot tub) are fabulous. We provide outdoor games for the whole family: bocce ball, badminton, mini disc golf giant jenga. Patio table with plenty of seating. The built in fire table. Master Bedroom King sized bed, 4k HDTV, ensuite, walk-in closet. Master ensuite has a dual vanity and a giant soaker tub. Guest bathrooms with dual vanity. Bedroom #4 has 2 twin bunks and a trundle. Smart Home with easy keyless entry.",
    images: [
      { caption: "Living room image 1", imageUrl: "https://a0.muscache.com/im/pictures/137f11aa-39d1-4ecb-993b-eea6a3da30c6.jpg", orientation: "LANDSCAPE" },
      { caption: "Entryway and Hall", imageUrl: "https://a0.muscache.com/im/pictures/7290633b-863f-4b2f-b8fd-2a871b86e5a0.jpg", orientation: "LANDSCAPE" },
      { caption: "Full kitchen image 1", imageUrl: "https://a0.muscache.com/im/pictures/8d153114-3f97-4fea-8fc5-40921bbc2e5f.jpg", orientation: "LANDSCAPE" },
      { caption: "Dining area", imageUrl: "https://a0.muscache.com/im/pictures/5f5e7e25-df31-4643-8db9-53475264f557.jpg", orientation: "LANDSCAPE" },
      { caption: "The Pink Cactus room, designed with rich warm desert hues on bright whites. Queen sized bed", imageUrl: "https://a0.muscache.com/im/pictures/32d91235-0663-4a99-bdf6-fb1f93af3bcb.jpg", orientation: "LANDSCAPE" },
      { caption: "Master Bedroom King sized bed, 4k HDTV, ensuite, walk-in closet", imageUrl: "https://a0.muscache.com/im/pictures/212c8057-a1d0-4b0c-b3e2-e4dc173d4aff.jpg", orientation: "LANDSCAPE" },
      { caption: "Master Ensuite Bathroom with dual vanity", imageUrl: "https://a0.muscache.com/im/pictures/29ce86c0-e4e9-4ef2-ac3e-19586e6ca156.jpg", orientation: "LANDSCAPE" },
      { caption: "Full bathroom 2 image 1", imageUrl: "https://a0.muscache.com/im/pictures/hosting/Hosting-27128234/original/0933df7d-a469-4158-ab68-da03c049b898.jpeg", orientation: "PORTRAIT" },
      { caption: "Stunning spacious pool and yard area, mountain views, large 12-person hot tub", imageUrl: "https://a0.muscache.com/im/pictures/64372c5d-154f-455f-9d43-8e2884409e12.jpg", orientation: "LANDSCAPE" },
      { caption: "Pool at night", imageUrl: "https://a0.muscache.com/im/pictures/86c016b3-b125-444a-acb6-4f31f94effae.jpg", orientation: "LANDSCAPE" },
      { caption: "Backyard image 3", imageUrl: "https://a0.muscache.com/im/pictures/8d366f93-37c5-4cb2-94cb-787cd7bf4d9d.jpg", orientation: "LANDSCAPE" },
      { caption: "Relax and unwind. Enjoy your wine by the Outdoor pool side tabletop firepit", imageUrl: "https://a0.muscache.com/im/pictures/ef1b4e1b-2b1a-412b-8ba1-563efd9e3ea6.jpg", orientation: "LANDSCAPE" },
      { caption: "Hot tub image 1", imageUrl: "https://a0.muscache.com/im/pictures/hosting/Hosting-27128234/original/c5e549be-4602-471d-9a47-2b10503ef403.jpeg", orientation: "LANDSCAPE" },
      { caption: "Shaded front entrance to home", imageUrl: "https://a0.muscache.com/im/pictures/276dcfac-a8d9-4547-b733-b98bcbe3a249.jpg", orientation: "LANDSCAPE" },
    ],
    amenities: [
      {
        title: "Heating and cooling",
        values: [
          { title: "Central air conditioning", icon: "SYSTEM_SNOWFLAKE", available: true },
          { title: "Indoor fireplace: gas", icon: "SYSTEM_FIREPLACE", available: true },
          { title: "Ceiling fan", icon: "SYSTEM_FAN_CEILING", available: true },
          { title: "Portable fans", icon: "SYSTEM_FAN_PORTABLE", available: true },
          { title: "Central heating", icon: "SYSTEM_THERMOMETER", available: true },
        ],
      },
      {
        title: "Kitchen and dining",
        values: [
          { title: "Kitchen", subtitle: "Space where guests can cook their own meals", available: true },
          { title: "Refrigerator", available: true },
          { title: "Microwave", available: true },
          { title: "Dishwasher", available: true },
          { title: "GE stainless steel gas stove", available: true },
          { title: "Stainless steel double oven", available: true },
          { title: "Coffee maker: drip coffee maker, Keurig coffee machine", available: true },
          { title: "Barbecue utensils", subtitle: "Grill, charcoal, bamboo skewers", available: true },
          { title: "Blender", available: true },
          { title: "Rice maker", available: true },
          { title: "Toaster", available: true },
          { title: "Wine glasses", available: true },
        ],
      },
      {
        title: "Bathroom",
        values: [
          { title: "Bathtub", available: true },
          { title: "Hair dryer", available: true },
          { title: "Shampoo", available: true },
          { title: "Body soap", available: true },
          { title: "Hot water", available: true },
        ],
      },
      {
        title: "Outdoor",
        values: [
          { title: "Private patio or balcony", available: true },
          { title: "Private backyard – Fully fenced", subtitle: "An open space on the property", available: true },
          { title: "Fire pit", available: true },
          { title: "Outdoor furniture", available: true },
          { title: "Outdoor dining area", available: true },
          { title: "Outdoor kitchen", available: true },
          { title: "Private BBQ grill: gas", available: true },
          { title: "Sun loungers", available: true },
        ],
      },
      {
        title: "Parking and facilities",
        values: [
          { title: "Free driveway parking on premises – 2 spaces", available: true },
          { title: "Private outdoor pool - available all year, open 24 hours, heated, lap pool", available: true },
          { title: "Private hot tub - available all year, open 24 hours", available: true },
          { title: "Single level home", subtitle: "No stairs in home", available: true },
        ],
      },
      {
        title: "Home safety",
        values: [
          { title: "Noise decibel monitors on property", subtitle: "Decibel sensor only (Noiseaware)", available: true },
          { title: "Exterior security cameras on property", subtitle: "Video cameras in front, doorbell camera, security alarm", available: true },
          { title: "Smoke alarm", available: true },
          { title: "Carbon monoxide alarm", available: true },
          { title: "Fire extinguisher", available: true },
        ],
      },
      {
        title: "Entertainment",
        values: [
          { title: "55 inch HDTV with Roku, Amazon Prime Video, Apple TV, Disney+, Netflix, HBO Max, Hulu", available: true },
          { title: "Ethernet connection", available: true },
          { title: "Life size games", available: true },
          { title: "Books and reading material", available: true },
        ],
      },
      {
        title: "Internet and office",
        values: [
          { title: "Fast wifi – 151 Mbps", subtitle: "Stream 4K and join video calls on multiple devices", available: true },
          { title: "Dedicated workspace", available: true },
        ],
      },
      {
        title: "Services",
        values: [
          { title: "Self check-in", available: true },
          { title: "Keypad", subtitle: "Check yourself into the home with a door code", available: true },
          { title: "Long term stays allowed", available: true },
        ],
      },
      {
        title: "Family",
        values: [
          { title: "Children's playroom", subtitle: "An indoor room with toys, books, and games", available: true },
          { title: "Board games", available: true },
          { title: "Crib - always at the listing", available: true },
        ],
      },
      {
        title: "Bedroom and laundry",
        values: [
          { title: "Free washer – In unit", available: true },
          { title: "Free dryer – In unit", available: true },
          { title: "Room-darkening shades", available: true },
          { title: "Iron", available: true },
          { title: "Clothing storage: walk-in closet, closet, wardrobe, and dresser", available: true },
        ],
      },
    ],
    brandHighlights: {
      title: "One of the most loved homes on Airbnb, according to guests",
      subtitle: "Guest\nfavorite",
    },
  },
};
