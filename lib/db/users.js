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
 * @returns {Promise<object | null>}
 */
export async function upsertUser({ email, name, picture, googleId }) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .upsert(
      {
        google_id: googleId,
        email,
        name,
        picture_url: picture || null,
        auth_method: "google",
      },
      {
        onConflict: "google_id",
        ignoreDuplicates: false,
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
 * Create a new user with email/password credentials.
 * Returns null if email already exists.
 *
 * @param {{ email, name, passwordHash }} opts
 * @returns {Promise<object | null>}
 */
export async function createEmailUser({ email, name, passwordHash }) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .insert({
      email,
      name,
      password_hash: passwordHash,
      auth_method: "email",
    })
    .select()
    .single();

  if (error) {
    // Unique violation on email
    if (error.code === "23505") return { error: "email_taken" };
    console.error("[db/users] createEmailUser error:", error.message);
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
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
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
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
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
 * Update user profile fields (name, phone, etc.).
 * Allowed fields: name, phone, tax_bracket, property_count, stripe_customer_id
 *
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
export async function updateUser(userId, updates) {
  const db = getServerClient();
  if (!db) return null;

  const allowed = ["phone", "tax_bracket", "property_count", "name", "stripe_customer_id"];
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

/**
 * Update a user's password hash (for email/password users).
 *
 * @param {string} userId
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
export async function updateUserPassword(userId, passwordHash) {
  const db = getServerClient();
  if (!db) return false;

  const { error } = await db
    .from("users")
    .update({ password_hash: passwordHash })
    .eq("id", userId);

  if (error) {
    console.error("[db/users] updateUserPassword error:", error.message);
    return false;
  }

  return true;
}

/**
 * Store a password reset token for a user.
 *
 * @param {string} userId
 * @param {string} token - Raw token (store hashed for extra security is optional here)
 * @param {Date} expires
 * @returns {Promise<boolean>}
 */
export async function setResetToken(userId, token, expires) {
  const db = getServerClient();
  if (!db) return false;

  const { error } = await db
    .from("users")
    .update({
      reset_token: token,
      reset_token_expires: expires.toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[db/users] setResetToken error:", error.message);
    return false;
  }

  return true;
}

/**
 * Find a user by their reset token, only if the token hasn't expired.
 *
 * @param {string} token
 * @returns {Promise<object|null>}
 */
export async function getUserByResetToken(token) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("reset_token", token)
    .gt("reset_token_expires", new Date().toISOString())
    .single();

  if (error) {
    if (error.code !== "PGRST116") {
      console.error("[db/users] getUserByResetToken error:", error.message);
    }
    return null;
  }

  return data;
}

/**
 * Clear the reset token after use.
 *
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function clearResetToken(userId) {
  const db = getServerClient();
  if (!db) return false;

  const { error } = await db
    .from("users")
    .update({ reset_token: null, reset_token_expires: null })
    .eq("id", userId);

  if (error) {
    console.error("[db/users] clearResetToken error:", error.message);
    return false;
  }

  return true;
}
