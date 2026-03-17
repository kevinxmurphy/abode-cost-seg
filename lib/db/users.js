// ═══════════════════════════════════════════════════════
// ABODE — User DB Operations
// Server-side only. Uses service role client.
// ═══════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

/**
 * Upsert a user from Google OAuth data.
 * Creates the user if they don't exist; updates name/picture if they do.
 * Returns the full user row including the Supabase UUID.
 *
 * @param {{ email, name, picture, googleId }} googleUser
 * @returns {Promise<{ id, email, name, picture_url, google_id, created_at } | null>}
 */
export async function upsertUser({ email, name, picture, googleId }) {
  const db = getServerClient();

  const { data, error } = await db
    .from("users")
    .upsert(
      {
        google_id: googleId,
        email,
        name,
        picture_url: picture || null,
      },
      {
        onConflict: "google_id",
        ignoreDuplicates: false, // always update name/picture
      }
    )
    .select()
    .single();

  if (error) {
    console.error("[db/users] upsertUser error:", error.message);
    return null;
  }

  return data;
}

/**
 * Get a user by their Supabase UUID.
 *
 * @param {string} userId - UUID
 * @returns {Promise<object|null>}
 */
export async function getUserById(userId) {
  const db = getServerClient();

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") { // PGRST116 = row not found, expected
      console.error("[db/users] getUserById error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Get a user by email.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
export async function getUserByEmail(email) {
  const db = getServerClient();

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db/users] getUserByEmail error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Update user profile fields (phone, tax_bracket, property_count).
 *
 * @param {string} userId
 * @param {{ phone?, tax_bracket?, property_count? }} updates
 * @returns {Promise<object|null>}
 */
export async function updateUser(userId, updates) {
  const db = getServerClient();

  const allowed = ["phone", "tax_bracket", "property_count", "name"];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(filtered).length === 0) return null;

  const { data, error } = await db
    .from("users")
    .update(filtered)
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    console.error("[db/users] updateUser error:", error.message);
    return null;
  }

  return data;
}
