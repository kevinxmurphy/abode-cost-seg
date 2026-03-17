// ═══════════════════════════════════════════════════════
// ABODE — DB-Backed API Cache
// Replaces in-memory server cache (lib/propertyCache.js serverCache*)
// Survives serverless cold starts and deploys.
//
// Falls back gracefully if DB is unavailable — uses in-memory
// cache as a safety net (defined in lib/propertyCache.js).
// ═══════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get a cached API response from the database.
 * Returns null if missing or expired.
 *
 * @param {string} cacheKey
 * @returns {Promise<any|null>}
 */
export async function dbCacheGet(cacheKey) {
  try {
    const db = getServerClient();
    if (!db) return null;

    const { data, error } = await db
      .from("api_cache")
      .select("data, expires_at")
      .eq("cache_key", cacheKey)
      .single();

    if (error || !data) return null;

    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      // Delete stale entry (fire and forget)
      db.from("api_cache").delete().eq("cache_key", cacheKey).then(() => {});
      return null;
    }

    return data.data;
  } catch {
    return null;
  }
}

/**
 * Set a value in the DB cache.
 * Upserts — overwrites if the key already exists.
 *
 * @param {string} cacheKey
 * @param {string} cacheType - "property" | "airbnb" | "places"
 * @param {any} data - JSON-serializable value
 * @param {number} [ttlMs] - Override default TTL
 * @returns {Promise<void>}
 */
export async function dbCacheSet(cacheKey, cacheType, data, ttlMs = DEFAULT_TTL_MS) {
  try {
    const db = getServerClient();
    if (!db) return;
    const expiresAt = new Date(Date.now() + ttlMs).toISOString();

    await db.from("api_cache").upsert(
      { cache_key: cacheKey, cache_type: cacheType, data, expires_at: expiresAt },
      { onConflict: "cache_key" }
    );
  } catch {
    // Non-critical — silently ignore write failures
  }
}

/**
 * Delete a cache entry.
 *
 * @param {string} cacheKey
 * @returns {Promise<void>}
 */
export async function dbCacheDelete(cacheKey) {
  try {
    const db = getServerClient();
    if (!db) return;
    await db.from("api_cache").delete().eq("cache_key", cacheKey);
  } catch {
    // ignore
  }
}

/**
 * Purge all expired entries from the cache table.
 * Call from a scheduled job or maintenance route.
 *
 * @returns {Promise<number>} Number of rows deleted
 */
export async function dbCachePurgeExpired() {
  try {
    const db = getServerClient();
    if (!db) return 0;
    const { count } = await db
      .from("api_cache")
      .delete({ count: "exact" })
      .lt("expires_at", new Date().toISOString());
    return count || 0;
  } catch {
    return 0;
  }
}
