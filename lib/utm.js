// ═══════════════════════════════════════════════════════
// UTM Parameter Capture & Persistence
// Captures UTM params on first landing, persists to
// sessionStorage so they're available on auth/email capture.
// ═══════════════════════════════════════════════════════

const UTM_STORAGE_KEY = "abode_utm";
const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];

/**
 * Capture UTM params from the current URL and persist to sessionStorage.
 * Only captures on first visit — doesn't overwrite if already set.
 * Call this once on app mount (e.g. in a root layout effect).
 */
export function captureUtmParams() {
  if (typeof window === "undefined") return;

  // Don't overwrite — first touch attribution
  if (sessionStorage.getItem(UTM_STORAGE_KEY)) return;

  const url = new URL(window.location.href);
  const utms = {};
  let hasAny = false;

  for (const key of UTM_PARAMS) {
    const val = url.searchParams.get(key);
    if (val) {
      utms[key] = val;
      hasAny = true;
    }
  }

  if (hasAny) {
    // Also capture the landing page
    utms.landing_page = window.location.pathname;
    sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utms));
  }
}

/**
 * Retrieve stored UTM params (or null if none captured).
 * @returns {{ utm_source?, utm_medium?, utm_campaign?, utm_term?, utm_content?, landing_page? } | null}
 */
export function getUtmParams() {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
