// Quiz step configuration — Typeform-style with tooltips, guidance, and smart flows

export const QUIZ_STEPS = [
  {
    id: "propertyUse",
    question: "How is this property used?",
    subtitle: "Cost segregation benefits vary by property type. Short-term rentals often qualify for the most aggressive depreciation.",
    type: "option",
    options: [
      { label: "Short-term rental (Airbnb, VRBO)", value: "str", icon: "🏠" },
      { label: "Mid-term rental (month-to-month)", value: "mtr", icon: "🏘️" },
      { label: "Long-term rental (12+ month leases)", value: "ltr", icon: "🏢" },
      { label: "Primary residence", value: "primary", icon: "🏡", disqualify: true },
      { label: "Second home (personal use)", value: "second", icon: "🏖️", disqualify: true },
    ],
    tooltip: "Cost segregation studies are designed for income-producing properties. Short-term and mid-term rentals often qualify for the most aggressive bonus depreciation because they're treated as active business assets. Primary and second homes used personally generally don't qualify.",
  },
  {
    id: "propertyAddressEntry",
    question: "What's the property address?",
    subtitle: "We'll look up public records to pre-fill your property details.",
    type: "address",
    phase: "entry",
    placeholder: "Search by address, city, or zip...",
    tooltip: "We use your address to look up public county assessor records — including square footage, year built, and assessed values. This data dramatically improves estimate accuracy and saves you from manually entering property details. We never store or share your exact address without your consent.",
  },
  {
    id: "airbnbUrl",
    question: "Do you have an Airbnb listing?",
    subtitle: "Paste your listing URL and we'll pull in your property details in the background.",
    type: "airbnb-url",
    placeholder: "https://www.airbnb.com/rooms/...",
    tooltip: "If you have an active listing on Airbnb, we can pull your actual rental data to personalize your cost segregation estimate. This step is completely optional — skip it if you don't have a listing yet.",
    optional: true,
  },
  {
    id: "propertyAddressConfirm",
    question: "Confirm your property details",
    subtitle: "We pulled these from public records. Make any corrections before we calculate your estimate.",
    type: "address-confirm",
    tooltip: "These details come from county assessor records and public listing data. The assessed land/improvement split is especially important — it directly affects your depreciable basis calculation.",
  },
  {
    id: "airbnbVerify",
    question: "Here's your listing",
    subtitle: "We pulled your Airbnb details to personalize your estimate. Confirm or continue.",
    type: "airbnb-verify",
    optional: true,
    tooltip: "Your Airbnb listing data helps us personalize the estimate with your actual amenities, property type, and photos. You can always continue without it.",
  },
  {
    id: "purchasePrice",
    question: "What was the total purchase price?",
    subtitle: "Include the full acquisition cost from your closing statement. This is the starting point for your depreciable basis.",
    type: "currency",
    placeholder: "e.g. 750,000",
    tooltip: "Enter the total purchase price from your closing statement (HUD-1 or Closing Disclosure). This includes the building and land value combined — we'll separate them in the study. Don't include closing costs or loan amounts, just the purchase price.",
    validation: {
      min: 100000,
      max: 10000000,
      minMessage: "Properties under $100K typically don't generate enough savings to justify a study.",
      maxMessage: "For properties over $10M, we recommend a custom consultation. Contact us directly.",
    },
  },
  {
    id: "purchaseYear",
    question: "Last one — when did you purchase or place it in service?",
    subtitle: "This determines your bonus depreciation rate and whether you qualify for catch-up deductions.",
    type: "option",
    options: [
      { label: "2025 (after Jan 19)", value: "2025-post", icon: "✨", badge: "100% Bonus" },
      { label: "2025 (before Jan 20)", value: "2025-pre", icon: "📅", badge: "40% Bonus" },
      { label: "2024", value: "2024", icon: "📅", badge: "60% Bonus" },
      { label: "2023", value: "2023", icon: "📅", badge: "80% Bonus" },
      { label: "2022 or earlier", value: "2022-earlier", icon: "📅", badge: "Catch-up Available" },
    ],
    tooltip: "The OBBBA reinstated 100% bonus depreciation for property acquired after January 19, 2025. Earlier purchases have lower rates but can still capture significant deductions. If you bought years ago, a 'catch-up' deduction via IRS Form 3115 lets you claim all missed depreciation in one year — no amended returns needed.",
    autoDetectFrom: "lastSoldDate",
  },
];

// Zip code to city/state lookup (common STR markets + general coverage)
// PHASE 2: Replace with full zip database or API
export const ZIP_LOOKUP = {
  "85250": { city: "Scottsdale", state: "Arizona" },
  "85251": { city: "Scottsdale", state: "Arizona" },
  "85255": { city: "Scottsdale", state: "Arizona" },
  "37201": { city: "Nashville", state: "Tennessee" },
  "37203": { city: "Nashville", state: "Tennessee" },
  "37206": { city: "Nashville", state: "Tennessee" },
  "28801": { city: "Asheville", state: "North Carolina" },
  "28803": { city: "Asheville", state: "North Carolina" },
  "92253": { city: "La Quinta", state: "California" },
  "92260": { city: "Palm Desert", state: "California" },
  "92262": { city: "Palm Springs", state: "California" },
  "84060": { city: "Park City", state: "Utah" },
  "84098": { city: "Park City", state: "Utah" },
  "30301": { city: "Atlanta", state: "Georgia" },
  "78701": { city: "Austin", state: "Texas" },
  "78702": { city: "Austin", state: "Texas" },
  "33139": { city: "Miami Beach", state: "Florida" },
  "33101": { city: "Miami", state: "Florida" },
  "32801": { city: "Orlando", state: "Florida" },
  "96740": { city: "Kailua-Kona", state: "Hawaii" },
  "96761": { city: "Lahaina", state: "Hawaii" },
  "80435": { city: "Keystone", state: "Colorado" },
  "80443": { city: "Frisco", state: "Colorado" },
  "80424": { city: "Breckenridge", state: "Colorado" },
  "72632": { city: "Eureka Springs", state: "Arkansas" },
  "65616": { city: "Branson", state: "Missouri" },
  "29928": { city: "Hilton Head", state: "South Carolina" },
  "23451": { city: "Virginia Beach", state: "Virginia" },
  "93921": { city: "Carmel", state: "California" },
  "96150": { city: "South Lake Tahoe", state: "California" },
  "49770": { city: "Petoskey", state: "Michigan" },
  "04609": { city: "Bar Harbor", state: "Maine" },
  "87501": { city: "Santa Fe", state: "New Mexico" },
  "98362": { city: "Port Angeles", state: "Washington" },
  "97034": { city: "Lake Oswego", state: "Oregon" },
};

// STUB: Address autocomplete suggestions (popular STR markets)
// PHASE 2: Replace with Google Places Autocomplete API
export const ADDRESS_SUGGESTIONS = [
  { address: "7401 E Chaparral Rd", city: "Scottsdale", state: "AZ", zip: "85250" },
  { address: "14832 N Fountain Hills Blvd", city: "Scottsdale", state: "AZ", zip: "85255" },
  { address: "412 Broadway", city: "Nashville", state: "TN", zip: "37203" },
  { address: "1842 Shelby Ave", city: "Nashville", state: "TN", zip: "37206" },
  { address: "89 Montford Ave", city: "Asheville", state: "NC", zip: "28801" },
  { address: "52030 Avenida Villa", city: "La Quinta", state: "CA", zip: "92253" },
  { address: "2201 N Palm Canyon Dr", city: "Palm Springs", state: "CA", zip: "92262" },
  { address: "1455 Park Ave", city: "Park City", state: "UT", zip: "84060" },
  { address: "742 W Church St", city: "Orlando", state: "FL", zip: "32801" },
  { address: "1920 Collins Ave", city: "Miami Beach", state: "FL", zip: "33139" },
  { address: "515 S Congress Ave", city: "Austin", state: "TX", zip: "78701" },
  { address: "220 Ski Hill Rd", city: "Breckenridge", state: "CO", zip: "80424" },
  { address: "45 Lighthouse Rd", city: "Hilton Head", state: "SC", zip: "29928" },
  { address: "88 Alii Dr", city: "Kailua-Kona", state: "HI", zip: "96740" },
  { address: "160 Artist Rd", city: "Santa Fe", state: "NM", zip: "87501" },
  { address: "3200 Lake Tahoe Blvd", city: "South Lake Tahoe", state: "CA", zip: "96150" },
];

// STUB: Mock county assessor property data (keyed by "address, city, state")
// PHASE 2: Replace with BatchData / ATTOM API for real county records
export const MOCK_PROPERTY_DATA = {
  "7401 E Chaparral Rd, Scottsdale, AZ": {
    beds: 4, baths: 3, sqft: 2847, lotSqft: 8712, yearBuilt: 2018,
    propertyType: "Single Family", assessedLand: 185000, assessedImprovement: 592000,
  },
  "14832 N Fountain Hills Blvd, Scottsdale, AZ": {
    beds: 5, baths: 4, sqft: 3420, lotSqft: 12500, yearBuilt: 2005,
    propertyType: "Single Family", assessedLand: 245000, assessedImprovement: 785000,
  },
  "412 Broadway, Nashville, TN": {
    beds: 3, baths: 2, sqft: 1640, lotSqft: 4200, yearBuilt: 2019,
    propertyType: "Single Family", assessedLand: 120000, assessedImprovement: 385000,
  },
  "1842 Shelby Ave, Nashville, TN": {
    beds: 3, baths: 2.5, sqft: 1875, lotSqft: 5100, yearBuilt: 2017,
    propertyType: "Single Family", assessedLand: 135000, assessedImprovement: 425000,
  },
  "89 Montford Ave, Asheville, NC": {
    beds: 3, baths: 2, sqft: 1520, lotSqft: 6800, yearBuilt: 1925,
    propertyType: "Single Family", assessedLand: 95000, assessedImprovement: 310000,
  },
  "52030 Avenida Villa, La Quinta, CA": {
    beds: 4, baths: 3, sqft: 2650, lotSqft: 9200, yearBuilt: 2003,
    propertyType: "Single Family", assessedLand: 175000, assessedImprovement: 545000,
  },
  "2201 N Palm Canyon Dr, Palm Springs, CA": {
    beds: 3, baths: 2.5, sqft: 2100, lotSqft: 7600, yearBuilt: 1962,
    propertyType: "Single Family", assessedLand: 210000, assessedImprovement: 480000,
  },
  "1455 Park Ave, Park City, UT": {
    beds: 4, baths: 3.5, sqft: 3100, lotSqft: 8400, yearBuilt: 2012,
    propertyType: "Single Family", assessedLand: 320000, assessedImprovement: 875000,
  },
  "742 W Church St, Orlando, FL": {
    beds: 4, baths: 3, sqft: 2200, lotSqft: 6500, yearBuilt: 2015,
    propertyType: "Single Family", assessedLand: 95000, assessedImprovement: 365000,
  },
  "1920 Collins Ave, Miami Beach, FL": {
    beds: 2, baths: 2, sqft: 1150, lotSqft: 0, yearBuilt: 2008,
    propertyType: "Condo", assessedLand: 85000, assessedImprovement: 425000,
  },
  "515 S Congress Ave, Austin, TX": {
    beds: 3, baths: 2, sqft: 1780, lotSqft: 5400, yearBuilt: 2020,
    propertyType: "Single Family", assessedLand: 165000, assessedImprovement: 475000,
  },
  "220 Ski Hill Rd, Breckenridge, CO": {
    beds: 3, baths: 3, sqft: 1950, lotSqft: 4800, yearBuilt: 2010,
    propertyType: "Townhouse", assessedLand: 280000, assessedImprovement: 620000,
  },
  "45 Lighthouse Rd, Hilton Head, SC": {
    beds: 4, baths: 3, sqft: 2400, lotSqft: 10500, yearBuilt: 1998,
    propertyType: "Single Family", assessedLand: 195000, assessedImprovement: 510000,
  },
  "88 Alii Dr, Kailua-Kona, HI": {
    beds: 3, baths: 2, sqft: 1650, lotSqft: 7200, yearBuilt: 1995,
    propertyType: "Single Family", assessedLand: 350000, assessedImprovement: 520000,
  },
  "160 Artist Rd, Santa Fe, NM": {
    beds: 3, baths: 2.5, sqft: 2050, lotSqft: 8100, yearBuilt: 2001,
    propertyType: "Adobe/Single Family", assessedLand: 140000, assessedImprovement: 395000,
  },
  "3200 Lake Tahoe Blvd, South Lake Tahoe, CA": {
    beds: 4, baths: 3, sqft: 2300, lotSqft: 9600, yearBuilt: 1988,
    propertyType: "Single Family", assessedLand: 285000, assessedImprovement: 590000,
  },
};

// Disqualification message for non-qualifying properties
export const DISQUALIFY_MESSAGE = {
  title: "Cost segregation may not be right for this property",
  body: "Cost segregation studies are designed for income-producing investment properties. Primary residences and personal-use second homes generally don't qualify for accelerated depreciation deductions. If your situation is more nuanced (e.g., you rent part of your home or are converting it to a rental), we recommend consulting a CPA.",
  cta: "Learn More About Cost Segregation",
  ctaLink: "/learn/what-is-cost-segregation",
};
