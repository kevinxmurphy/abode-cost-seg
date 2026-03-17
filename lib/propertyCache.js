// ═══════════════════════════════════════════════════════
// ABODE — Property Data Cache
// Two-layer caching: server-side in-memory + client-side localStorage
//
// Purpose: Avoid repeat Apify API calls for the same property.
// When a user completes the quiz and later creates an account,
// we retrieve cached data rather than re-fetching.
//
// Server cache: Lives in Node.js process memory (resets on deploy)
// Client cache: Lives in localStorage (persists across sessions)
//
// PHASE 2: Replace server cache with Redis/Upstash for persistence
//          across serverless function instances.
// ═══════════════════════════════════════════════════════

// ─── Server-side In-Memory Cache ─────────────────────────────────────────────
// Used by API routes (server-side only)
// TTL: 24 hours — property data doesn't change frequently

const SERVER_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Singleton map — persists for the lifetime of the Node.js process
const serverCache = new Map();

/**
 * Get a value from the server cache.
 * Returns null if missing or expired.
 *
 * @param {string} key - Cache key
 * @returns {any|null}
 */
export function serverCacheGet(key) {
  const entry = serverCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    serverCache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set a value in the server cache with TTL.
 *
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlMs] - Override default TTL
 */
export function serverCacheSet(key, value, ttlMs = SERVER_CACHE_TTL_MS) {
  serverCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
  });
}

/**
 * Delete a key from the server cache.
 */
export function serverCacheDelete(key) {
  serverCache.delete(key);
}

/**
 * Clear all entries from the server cache (useful for testing).
 */
export function serverCacheClear() {
  serverCache.clear();
}

/**
 * Get cache stats (for debugging/monitoring).
 */
export function serverCacheStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;
  for (const [, entry] of serverCache) {
    if (now > entry.expiresAt) expired++;
    else active++;
  }
  return { total: serverCache.size, active, expired };
}

// ─── Cache key builders ───────────────────────────────────────────────────────

/**
 * Build a normalized cache key for a property address.
 * Normalizes to lowercase, removes extra whitespace and punctuation.
 *
 * @param {string} address - Full address string
 * @returns {string}
 */
export function buildPropertyCacheKey(address) {
  return "property:" + normalizeKey(address);
}

/**
 * Build a cache key for an Airbnb listing.
 *
 * @param {string} airbnbId - Room ID or full URL
 * @returns {string}
 */
export function buildAirbnbCacheKey(airbnbId) {
  // Extract numeric ID if full URL was passed
  const id = String(airbnbId).match(/rooms\/(\d+)/)?.[1] ?? airbnbId;
  return "airbnb:" + normalizeKey(id);
}

/**
 * Build a cache key for a Google Places place_id.
 *
 * @param {string} placeId
 * @returns {string}
 */
export function buildPlacesCacheKey(placeId) {
  return "places:" + placeId;
}

function normalizeKey(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ─── Client-side localStorage Cache ──────────────────────────────────────────
// Used by React components (browser-side only)
// IMPORTANT: Only call these in client components (not during SSR)

const CLIENT_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const CLIENT_CACHE_PREFIX = "abode_cache_";

/**
 * Get a value from localStorage cache.
 * Returns null if missing, expired, or if running server-side.
 *
 * @param {string} key
 * @returns {any|null}
 */
export function clientCacheGet(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CLIENT_CACHE_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw);
    if (Date.now() > entry.expiresAt) {
      localStorage.removeItem(CLIENT_CACHE_PREFIX + key);
      return null;
    }
    return entry.value;
  } catch {
    return null;
  }
}

/**
 * Set a value in localStorage cache.
 * Silently fails if localStorage is unavailable (private browsing, etc.)
 *
 * @param {string} key
 * @param {any} value
 * @param {number} [ttlMs]
 */
export function clientCacheSet(key, value, ttlMs = CLIENT_CACHE_TTL_MS) {
  if (typeof window === "undefined") return;
  try {
    const entry = {
      value,
      expiresAt: Date.now() + ttlMs,
      createdAt: Date.now(),
    };
    localStorage.setItem(CLIENT_CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage quota exceeded or unavailable — silently ignore
  }
}

/**
 * Delete a value from localStorage cache.
 */
export function clientCacheDelete(key) {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(CLIENT_CACHE_PREFIX + key);
  } catch {
    // ignore
  }
}

/**
 * Purge all expired entries from localStorage.
 * Call occasionally to prevent storage bloat.
 */
export function clientCachePurgeExpired() {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CLIENT_CACHE_PREFIX));
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const entry = JSON.parse(raw);
        if (now > entry.expiresAt) localStorage.removeItem(key);
      } catch {
        localStorage.removeItem(key); // Corrupt entry — remove it
      }
    }
  } catch {
    // ignore
  }
}

// ─── Session storage for quiz state ──────────────────────────────────────────
// Stores the current quiz session's property data.
// Clears when browser tab is closed (unlike localStorage).

const SESSION_PREFIX = "abode_session_";

/**
 * Save property data for the current quiz session.
 * This persists the Zillow/Airbnb data fetched during the quiz
 * so it can be retrieved when the user creates an account.
 *
 * @param {string} key
 * @param {any} data
 */
export function sessionSave(key, data) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      SESSION_PREFIX + key,
      JSON.stringify({ value: data, timestamp: Date.now() })
    );
  } catch {
    // Fallback to localStorage if sessionStorage unavailable
    clientCacheSet(key, data, 2 * 60 * 60 * 1000); // 2 hour TTL
  }
}

/**
 * Retrieve property data from the current quiz session.
 *
 * @param {string} key
 * @returns {any|null}
 */
export function sessionGet(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_PREFIX + key);
    if (!raw) return null;
    const { value } = JSON.parse(raw);
    return value;
  } catch {
    return clientCacheGet(key);
  }
}

/**
 * Clear all Abode session data (on quiz restart, logout, etc.)
 */
export function sessionClear() {
  if (typeof window === "undefined") return;
  try {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith(SESSION_PREFIX));
    keys.forEach(k => sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
}
