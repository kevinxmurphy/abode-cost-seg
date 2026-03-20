// ═══════════════════════════════════════════════════════
// Quiz Resume Utilities
// Converts a saved DB property row back into the quiz
// answers shape so QuizShell can pre-populate state.
// ═══════════════════════════════════════════════════════

/**
 * Convert a DB property row (snake_case) → quiz answers object.
 * Mirrors the shape that QuizShell stores in its `answers` state.
 *
 * @param {object} property - Row from getPropertiesByUser / getPropertyById
 * @returns {object} - Partial or complete quiz answers
 */
export function reconstructAnswersFromProperty(property) {
  if (!property) return {};

  const answers = {};

  // Step: propertyUse
  if (property.property_use) {
    answers.propertyUse = property.property_use;
  }

  // Steps: propertyAddressEntry + propertyAddressConfirm (shared key)
  if (property.address) {
    answers.propertyAddress = {
      fullAddress: property.address,
      city: property.city || "",
      state: property.state || "",
      zip: property.zip || "",
      confirmed: true, // already confirmed when originally saved
      propertyDetails: {
        beds: property.beds ?? null,
        baths: property.baths ?? null,
        sqft: property.sqft ?? null,
        yearBuilt: property.year_built ?? null,
        propertyType: property.property_type ?? null,
        assessedLand: property.assessed_land ?? null,
        assessedImprovement: property.assessed_improvement ?? null,
        lastSoldPrice: property.last_sold_price ?? null,
        lastSoldDate: property.last_sold_date ?? null,
        lat: property.latitude ?? null,
        lon: property.longitude ?? null,
      },
    };
  }

  // Derived: propertyAge from year_built (used by running estimate widget)
  if (property.year_built) {
    const yb = Number(property.year_built);
    if (yb >= 2020) answers.propertyAge = "2020s";
    else if (yb >= 2010) answers.propertyAge = "2010s";
    else if (yb >= 2000) answers.propertyAge = "2000s";
    else answers.propertyAge = "pre-2000";
  }

  // Step: purchasePrice
  if (property.purchase_price) {
    answers.purchasePrice = String(property.purchase_price);
  }

  // Step: purchaseYear
  if (property.purchase_year) {
    answers.purchaseYear = property.purchase_year;
  }

  return answers;
}

/**
 * Reconstruct airbnbJob state from the saved airbnb_data blob.
 * If the property had a completed Airbnb lookup, restore it as "done"
 * so QuizShell doesn't re-fire the API call.
 *
 * @param {object} property
 * @returns {{ runId: null, status: string, listing: object|null }}
 */
export function reconstructAirbnbJob(property) {
  if (property?.airbnb_data) {
    return { runId: null, status: "done", listing: property.airbnb_data };
  }
  return { runId: null, status: "idle", listing: null };
}
