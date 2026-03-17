// ═══════════════════════════════════════════════════════
// ABODE — Property DB Operations
// Server-side only. Uses service role client.
// ═══════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

/**
 * Get all properties for a user, ordered by most recently updated.
 * Includes the associated estimate (if any) via a join.
 *
 * @param {string} userId - Supabase user UUID
 * @returns {Promise<Array>}
 */
export async function getPropertiesByUser(userId) {
  const db = getServerClient();

  const { data, error } = await db
    .from("properties")
    .select(`
      *,
      estimate:estimates(
        first_year_deduction,
        first_year_savings,
        conservative,
        likely,
        optimistic,
        standard_annual_deduction,
        year_one_multiplier,
        bonus_rate,
        bracket,
        land_ratio,
        land_ratio_source
      )
    `)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[db/properties] getPropertiesByUser error:", error.message);
    return [];
  }

  // Flatten estimate — returns first item from the array (one-to-one via UNIQUE constraint)
  return (data || []).map((p) => ({
    ...p,
    estimate: Array.isArray(p.estimate) ? p.estimate[0] || null : p.estimate,
  }));
}

/**
 * Get a single property by ID, verifying it belongs to the user.
 *
 * @param {string} propertyId - UUID
 * @param {string} userId - UUID (ownership check)
 * @returns {Promise<object|null>}
 */
export async function getPropertyById(propertyId, userId) {
  const db = getServerClient();

  const { data, error } = await db
    .from("properties")
    .select(`*, estimate:estimates(*)`)
    .eq("id", propertyId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db/properties] getPropertyById error:", error.message);
    }
    return null;
  }

  return {
    ...data,
    estimate: Array.isArray(data.estimate) ? data.estimate[0] || null : data.estimate,
  };
}

/**
 * Save (upsert) a property for a user.
 * Matches on (user_id, address) — updates if address already saved.
 * Returns the saved property row including its UUID.
 *
 * @param {string} userId - Supabase user UUID
 * @param {object} propertyData - Property fields from quiz/lookup
 * @returns {Promise<{ id: string, ...} | null>}
 */
export async function saveProperty(userId, propertyData) {
  const db = getServerClient();

  // Map incoming camelCase quiz data to DB snake_case columns
  const row = {
    user_id: userId,
    address: propertyData.address || "",
    city: propertyData.city || null,
    state: propertyData.state || null,
    zip: propertyData.zip || null,
    latitude: propertyData.lat || propertyData.latitude || null,
    longitude: propertyData.lon || propertyData.longitude || null,

    property_type: propertyData.propertyType || null,
    year_built: propertyData.yearBuilt ? parseInt(propertyData.yearBuilt) : null,
    sqft: propertyData.sqft ? parseInt(propertyData.sqft) : null,
    lot_sqft: propertyData.lotSqft ? parseInt(propertyData.lotSqft) : null,
    beds: propertyData.beds ? parseFloat(propertyData.beds) : null,
    baths: propertyData.baths ? parseFloat(propertyData.baths) : null,
    is_furnished: propertyData.isFurnished ?? true,

    assessed_land: propertyData.assessedLand || null,
    assessed_improvement: propertyData.assessedImprovement || null,
    land_value: propertyData.landValue || null,

    last_sold_price: propertyData.lastSoldPrice || null,
    last_sold_date: propertyData.lastSoldDate || null,
    zpid: propertyData.zpid || null,

    property_use: propertyData.propertyUse || null,
    purchase_price: propertyData.purchasePrice ? parseInt(String(propertyData.purchasePrice).replace(/\D/g, "")) : 0,
    purchase_year: propertyData.purchaseYear || null,
    placed_in_service: propertyData.placedInService || null,
    closing_costs: propertyData.closingCosts || null,

    owner_name: propertyData.ownerName || null,
    owner_entity: propertyData.ownerEntity || null,

    airbnb_id: propertyData.airbnbId || null,
    airbnb_title: propertyData.airbnbTitle || null,
    airbnb_data: propertyData.airbnbData || null,
    property_data: propertyData.propertyData || null,

    step: propertyData.step || "results",
    study_status: propertyData.studyStatus || "estimate",
    details_url: propertyData.detailsUrl || null,
  };

  const { data, error } = await db
    .from("properties")
    .upsert(row, {
      onConflict: "user_id,address",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[db/properties] saveProperty error:", error.message);
    return null;
  }

  return data;
}

/**
 * Update workflow state fields (step, study_status, details_url).
 *
 * @param {string} propertyId - UUID
 * @param {string} userId - UUID (ownership check)
 * @param {{ step?, study_status?, details_url? }} updates
 * @returns {Promise<object|null>}
 */
export async function updatePropertyStatus(propertyId, userId, updates) {
  const db = getServerClient();

  const allowed = ["step", "study_status", "details_url", "owner_name", "owner_entity", "closing_costs"];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(filtered).length === 0) return null;

  const { data, error } = await db
    .from("properties")
    .update(filtered)
    .eq("id", propertyId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("[db/properties] updatePropertyStatus error:", error.message);
    return null;
  }

  return data;
}

/**
 * Delete a property. Only deletes if it belongs to the user.
 *
 * @param {string} propertyId - UUID
 * @param {string} userId - UUID (ownership check)
 * @returns {Promise<boolean>}
 */
export async function deleteProperty(propertyId, userId) {
  const db = getServerClient();

  const { error } = await db
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", userId);

  if (error) {
    console.error("[db/properties] deleteProperty error:", error.message);
    return false;
  }

  return true;
}

/**
 * Get count of properties for a user.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export async function getPropertyCount(userId) {
  const db = getServerClient();

  const { count, error } = await db
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return 0;
  return count || 0;
}
