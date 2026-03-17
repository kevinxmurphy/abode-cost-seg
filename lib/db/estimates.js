// ═══════════════════════════════════════════════════════
// ABODE — Estimate DB Operations
// Server-side only. Uses service role client.
// ═══════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

/**
 * Save (upsert) a cost seg estimate for a property.
 * One estimate per property — updates if one already exists.
 *
 * @param {string} propertyId - Supabase property UUID
 * @param {string} userId - Supabase user UUID
 * @param {object} estimateData - Output from calculateEstimate()
 * @returns {Promise<object|null>}
 */
export async function saveEstimate(propertyId, userId, estimateData) {
  const db = getServerClient();

  const row = {
    property_id: propertyId,
    user_id: userId,

    first_year_deduction: estimateData.firstYearDeduction || null,
    first_year_savings: estimateData.firstYearSavings || null,
    conservative: estimateData.conservative || null,
    likely: estimateData.likely || null,
    optimistic: estimateData.optimistic || null,

    standard_annual_deduction: estimateData.standardAnnualDeduction || null,
    standard_annual_savings: estimateData.standardAnnualSavings || null,
    year_one_multiplier: estimateData.yearOneMultiplier || null,

    depreciable_basis: estimateData.depreciableBasis || null,
    purchase_price: estimateData.purchasePrice || null,
    land_ratio: estimateData.landRatio || null,
    land_ratio_source: estimateData.landRatioSource || null,
    reclass_percent: estimateData.reclassPercent || null,
    accelerated_amount: estimateData.acceleratedAmount || null,
    bonus_rate: estimateData.bonusRate || null,
    bracket: estimateData.bracket || null,
    is_catch_up: estimateData.isCatchUp || false,
  };

  const { data, error } = await db
    .from("estimates")
    .upsert(row, {
      onConflict: "property_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    console.error("[db/estimates] saveEstimate error:", error.message);
    return null;
  }

  return data;
}

/**
 * Get the estimate for a property.
 *
 * @param {string} propertyId - UUID
 * @returns {Promise<object|null>}
 */
export async function getEstimateByProperty(propertyId) {
  const db = getServerClient();

  const { data, error } = await db
    .from("estimates")
    .select("*")
    .eq("property_id", propertyId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db/estimates] getEstimateByProperty error:", error.message);
    }
    return null;
  }

  return data;
}
