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
 * @returns {Promise<object|null>}
 */
export async function upsertUser({ email, name, picture, googleId, utmSource, utmMedium, utmCampaign }) {
  const db = getServerClient();
  if (!db) return null;

  const row = {
    google_id: googleId,
    email,
    name,
    picture_url: picture || null,
    auth_provider: "google",
    email_verified: true,
  };

  // Only set UTM on initial insert (first-touch attribution)
  if (utmSource) row.utm_source = utmSource;
  if (utmMedium) row.utm_medium = utmMedium;
  if (utmCampaign) row.utm_campaign = utmCampaign;

  const { data, error } = await db
    .from("users")
    .upsert(
      row,
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
 * Create a new user with email/password auth.
 * Returns the full user row.
 *
 * @param {{ email, name, passwordHash }} params
 * @returns {Promise<object|null>}
 */
export async function createEmailUser({ email, name, passwordHash, utmSource, utmMedium, utmCampaign }) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .insert({
      email,
      name,
      password_hash: passwordHash,
      auth_provider: "email",
      email_verified: false,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
    })
    .select()
    .single();

  if (error) {
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
 * Update user profile fields.
 * Allowed: name, phone, email, tax_bracket, property_count.
 *
 * @param {string} userId
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
export async function updateUser(userId, updates) {
  const db = getServerClient();
  if (!db) return null;

  const allowed = ["phone", "tax_bracket", "property_count", "name", "email"];
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
 * Update a user's password hash.
 *
 * @param {string} userId
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
export async function updatePassword(userId, passwordHash) {
  const db = getServerClient();
  if (!db) return false;

  const { error } = await db
    .from("users")
    .update({
      password_hash: passwordHash,
      password_reset_token: null,
      password_reset_expires: null,
    })
    .eq("id", userId);

  if (error) {
    console.error("[db/users] updatePassword error:", error.message);
    return false;
  }

  return true;
}

/**
 * Store a hashed password reset token with expiry.
 *
 * @param {string} userId
 * @param {string} tokenHash - SHA-256 hash of the raw token
 * @param {Date} expires
 * @returns {Promise<boolean>}
 */
export async function setPasswordResetToken(userId, tokenHash, expires) {
  const db = getServerClient();
  if (!db) return false;

  const { error } = await db
    .from("users")
    .update({
      password_reset_token: tokenHash,
      password_reset_expires: expires.toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[db/users] setPasswordResetToken error:", error.message);
    return false;
  }

  return true;
}

/**
 * Find a user by their hashed reset token (if not expired).
 *
 * @param {string} tokenHash - SHA-256 hash of the submitted token
 * @returns {Promise<object|null>}
 */
export async function getUserByResetToken(tokenHash) {
  const db = getServerClient();
  if (!db) return null;

  const { data, error } = await db
    .from("users")
    .select("*")
    .eq("password_reset_token", tokenHash)
    .gt("password_reset_expires", new Date().toISOString())
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
 * Update or set the Stripe customer ID for a user.
 *
 * @param {string} userId
 * @param {string} stripeCustomerId
 * @returns {Promise<boolean>}
 */
export async function setStripeCustomerId(userId, stripeCustomerId) {
  const db = getServerClient();
  if (!db) return false;

  const { error } = await db
    .from("users")
    .update({ stripe_customer_id: stripeCustomerId })
    .eq("id", userId);

  if (error) {
    console.error("[db/users] setStripeCustomerId error:", error.message);
    return false;
  }

  return true;
}
