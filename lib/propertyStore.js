// ═══════════════════════════════════════════════════════
// ABODE — Property Store (localStorage-backed)
// Saves user property estimates so they can resume later.
//
// PHASE 2: Replace with database-backed storage (Supabase / Postgres)
// ═══════════════════════════════════════════════════════

const STORE_KEY = "abode_properties";

/**
 * Get all saved properties for a user (by email).
 * Returns an array sorted by most recently updated.
 *
 * @param {string} userEmail
 * @returns {Array}
 */
export function getSavedProperties(userEmail) {
  if (typeof window === "undefined" || !userEmail) return [];
  try {
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    const userProps = store[userEmail] || [];
    // Sort by updatedAt descending
    return [...userProps].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
  } catch {
    return [];
  }
}

/**
 * Save or update a property for a user.
 * If a property with the same address exists, it updates it.
 * Otherwise, it adds a new entry.
 *
 * @param {string} userEmail
 * @param {{ address, answers, airbnb, estimate, detailsUrl, step }} propertyData
 * @returns {{ id: string }}
 */
export function saveProperty(userEmail, propertyData) {
  if (typeof window === "undefined" || !userEmail) return null;
  try {
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    const userProps = store[userEmail] || [];

    const address = propertyData.answers?.address || propertyData.address || "";
    const now = new Date().toISOString();

    // Check for existing property by address
    const existingIdx = userProps.findIndex(
      (p) => normalizeAddr(p.address) === normalizeAddr(address)
    );

    const id =
      existingIdx >= 0
        ? userProps[existingIdx].id
        : "prop_" + Date.now().toString(36);

    const entry = {
      id,
      address,
      purchasePrice: propertyData.answers?.purchasePrice || propertyData.purchasePrice || 0,
      propertyType: propertyData.answers?.propertyType || propertyData.propertyType || "",
      yearBuilt: propertyData.answers?.yearBuilt || propertyData.yearBuilt || "",
      sqft: propertyData.answers?.sqft || propertyData.sqft || "",
      beds: propertyData.answers?.beds || propertyData.beds || "",
      baths: propertyData.answers?.baths || propertyData.baths || "",
      airbnbTitle: propertyData.airbnb?.title || "",
      airbnbThumbnail: propertyData.airbnb?.thumbnail || "",
      estimate: propertyData.estimate || null,
      detailsUrl: propertyData.detailsUrl || "",
      step: propertyData.step || "results", // "results" | "details" | "purchased"
      studyStatus: propertyData.studyStatus || "estimate",
      createdAt:
        existingIdx >= 0 ? userProps[existingIdx].createdAt : now,
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      userProps[existingIdx] = entry;
    } else {
      userProps.unshift(entry);
    }

    store[userEmail] = userProps;
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return { id };
  } catch {
    return null;
  }
}

/**
 * Delete a saved property.
 *
 * @param {string} userEmail
 * @param {string} propertyId
 */
export function deleteProperty(userEmail, propertyId) {
  if (typeof window === "undefined" || !userEmail) return;
  try {
    const store = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    const userProps = store[userEmail] || [];
    store[userEmail] = userProps.filter((p) => p.id !== propertyId);
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  } catch {
    // ignore
  }
}

/**
 * Get the count of saved properties for a user.
 *
 * @param {string} userEmail
 * @returns {number}
 */
export function getPropertyCount(userEmail) {
  return getSavedProperties(userEmail).length;
}

// ─── Helpers ─────────────────────────────────────────

function normalizeAddr(str) {
  return (str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}
