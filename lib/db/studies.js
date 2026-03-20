// ═══════════════════════════════════════════════════════
// ABODE — Study DB Operations
// Server-side only. Uses service role client.
// ═══════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

/**
 * Get a study by ID.
 */
export async function getStudyById(studyId) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("studies")
    .select("*, properties(*)")
    .eq("id", studyId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db/studies] getStudyById error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Get the study for a property (one-to-one via property_id unique index).
 */
export async function getStudyByPropertyId(propertyId) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("studies")
    .select("*")
    .eq("property_id", propertyId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get all studies for a user.
 */
export async function getStudiesByUser(userId) {
  const db = getServerClient();
  if (!db) return [];

  const { data, error } = await db
    .from("studies")
    .select("*, properties(address, city, state)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[db/studies] getStudiesByUser error:", error.message);
    return [];
  }

  return data || [];
}

/**
 * Save (create or update) a completed study with generated data.
 * If a study already exists for this property (created by webhook), updates it.
 * Otherwise creates a new one.
 *
 * @param {string} userId
 * @param {string} propertyId
 * @param {{ studyData, reportData, wizardInputs, attestation }} payload
 * @returns {Promise<object|null>}
 */
export async function saveStudy(userId, propertyId, payload) {
  const db = getServerClient();
  if (!db) return null;

  const { studyData, reportData, wizardInputs, attestation } = payload;

  // Build denormalized summary fields from studyData
  const allocation = studyData?.allocation || {};
  const depreciation = studyData?.depreciation || {};
  const savings = studyData?.savings || {};
  const catchUp = studyData?.catchUp || {};

  const row = {
    user_id: userId,
    property_id: propertyId || null,
    status: "complete",
    study_type: catchUp?.isCatchUp ? "catch-up" : "standard",

    wizard_answers: wizardInputs?.wizardAnswers || null,
    material_participation: wizardInputs?.materialParticipation || null,
    renovations: wizardInputs?.renovations || null,
    attestation: attestation || null,

    study_data: studyData,
    report_data: reportData,

    depreciable_basis: studyData?.basis?.adjustedBasis || studyData?.basis?.depreciableBasis || null,
    five_year_amount: allocation.fiveYear?.amount || null,
    seven_year_amount: allocation.sevenYear?.amount || null,
    fifteen_year_amount: allocation.fifteenYear?.amount || null,
    building_amount: allocation.building?.amount || null,
    total_reclass_percent: allocation.totalReclass || null,
    first_year_deduction: depreciation?.totalFirstYearDeduction || null,
    bonus_rate: studyData?.bonusRate || null,
    section_481a_adjustment: catchUp?.adjustmentAmount || null,
    estimated_tax_savings: savings?.firstYearSavings || null,

    completed_at: new Date().toISOString(),
  };

  // Try to update existing study (created by webhook on payment)
  if (propertyId) {
    const { data: existing } = await db
      .from("studies")
      .select("id")
      .eq("property_id", propertyId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      const { data, error } = await db
        .from("studies")
        .update(row)
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("[db/studies] update error:", error.message);
        return null;
      }
      return data;
    }
  }

  // No existing study — create new
  const { data, error } = await db
    .from("studies")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("[db/studies] insert error:", error.message);
    return null;
  }

  return data;
}
