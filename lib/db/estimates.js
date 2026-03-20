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
  if (!db) return null;

  // Accept both camelCase (internal callers) and snake_case (QuizResults POST body)
  const g = (camel, snake) => estimateData[camel] ?? estimateData[snake] ?? null;

  const row = {
    property_id: propertyId,
    user_id: userId,

    first_year_deduction: g("firstYearDeduction", "first_year_deduction"),
    first_year_savings: g("firstYearSavings", "first_year_savings"),
    conservative: g("conservative", "conservative"),
    likely: g("likely", "likely"),
    optimistic: g("optimistic", "optimistic"),

    standard_annual_deduction: g("standardAnnualDeduction", "standard_annual_deduction"),
    standard_annual_savings: g("standardAnnualSavings", "standard_annual_savings"),
    year_one_multiplier: g("yearOneMultiplier", "year_one_multiplier"),

    depreciable_basis: g("depreciableBasis", "depreciable_basis"),
    purchase_price: g("purchasePrice", "purchase_price"),
    land_ratio: g("landRatio", "land_ratio"),
    land_ratio_source: g("landRatioSource", "land_ratio_source"),
    reclass_percent: g("reclassPercent", "reclass_percent"),
    accelerated_amount: g("acceleratedAmount", "accelerated_amount"),
    bonus_rate: g("bonusRate", "bonus_rate"),
    bracket: g("bracket", "bracket"),
    is_catch_up: estimateData.isCatchUp ?? estimateData.is_catch_up ?? false,
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
  if (!db) return null;

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
