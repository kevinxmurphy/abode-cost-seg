// ═══════════════════════════════════════════════════════
// ABODE — Apify HTTP Client
// Unified wrapper for all Apify actor calls
// Pay-per-use: no monthly fees, per-call billing
// All calls are server-side only (API token stays in .env.local)
// ═══════════════════════════════════════════════════════

const APIFY_BASE = "https://api.apify.com/v2";

// Default actor configuration
const DEFAULTS = {
  timeoutSecs: 45,
  memoryMbytes: 256,
  maxItems: 1,
};

// ─── Actor Registry ──────────────────────────────────────────────────────────
// Note: Apify uses "~" in API calls, "/" in the UI.
// e.g. "one-api/zillow-scrape-address-url-zpid" → "one-api~zillow-scrape-address-url-zpid"
export const ACTORS = {
  // Step 1 of Zillow 2-step: address string/URL → ZPID
  // Input: { searchText: "123 Main St, City, ST 12345" }
  // Output: [{ zpid: "12345678", address: "...", zestimate: 500000, ... }]
  ZILLOW_ZPID_LOOKUP: "one-api~zillow-scrape-address-url-zpid",

  // Step 2 of Zillow 2-step: ZPID → full property details
  // Input: { zpids: ["12345678"] }
  // Output: [{ zpid, beds, baths, livingArea, yearBuilt, taxAssessedValue, parcelId, ... }]
  ZILLOW_DETAILS: "mido_99~zillow-details-scraper",

  // Airbnb: full listing URL → listing details
  // Input: { startUrls: [{ url: "https://www.airbnb.com/rooms/12345" }] }
  // Output: [{ title, rating, reviewCount, bedrooms, baths, amenities, ... }]
  AIRBNB_LISTING: "tri_angle~airbnb-rooms-urls-scraper",
};

// ─── Input builders ───────────────────────────────────────────────────────────
// Centralized so we can easily update if actor APIs change

export function buildZillowZpidInput(zpid) {
  // one-api/zillow-scrape-address-url-zpid expects:
  // ZPID as string in the multiple_input_box field
  // NOTE: This actor only works with ZPIDs, not addresses or URLs
  return {
    multiple_input_box: String(zpid),
  };
}

export function buildZillowDetailsInput(zpid) {
  // mido_99/zillow-details-scraper expects zpids + proxy config
  // NOTE: This actor may be unreliable — Actor 1 with ZPID is the primary path
  return {
    zpids: [String(zpid)],
    proxyConfiguration: { useApifyProxy: true },
  };
}

export function buildAirbnbInput(listingUrl) {
  // tri_angle/airbnb-rooms-urls-scraper expects:
  // startUrls array with url objects
  return {
    startUrls: [{ url: listingUrl }],
  };
}

// ─── Core Actor Runner ────────────────────────────────────────────────────────

/**
 * Run an Apify actor synchronously and return dataset items.
 * Uses /run-sync-get-dataset-items — blocks until complete.
 * Best for actors that finish in <45 seconds (most property lookups).
 *
 * @param {string} actorId - Actor ID with ~ separator (use ACTORS constants)
 * @param {object} input - Actor-specific input object
 * @param {object} options - { timeoutSecs, memoryMbytes, maxItems }
 * @returns {Promise<Array>} Dataset items
 * @throws {ApifyError} On failure or timeout
 */
export async function runActor(actorId, input, options = {}) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new ApifyError("APIFY_API_TOKEN not configured. Add it to .env.local", {
      actorId,
      configIssue: true,
    });
  }

  const timeoutSecs = options.timeoutSecs ?? DEFAULTS.timeoutSecs;
  const memoryMbytes = options.memoryMbytes ?? DEFAULTS.memoryMbytes;
  const maxItems = options.maxItems ?? DEFAULTS.maxItems;

  const url = new URL(
    `${APIFY_BASE}/acts/${actorId}/run-sync-get-dataset-items`
  );
  url.searchParams.set("token", token);
  url.searchParams.set("timeout", timeoutSecs);
  url.searchParams.set("memoryMbytes", memoryMbytes);
  url.searchParams.set("maxItems", maxItems);

  // AbortSignal: 1s buffer beyond actor timeout so we get a clean ApifyError
  // before the hosting platform (e.g. Vercel 10s) hard-kills the function.
  const abortMs = (timeoutSecs + 1) * 1000;

  let response;
  try {
    response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(abortMs),
    });
  } catch (err) {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      throw new ApifyError(
        `Actor ${actorId} request timed out after ${timeoutSecs}s`,
        { actorId, timeout: true }
      );
    }
    throw new ApifyError(`Network error calling actor ${actorId}: ${err.message}`, {
      actorId,
      originalError: err,
    });
  }

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new ApifyError(
      `Actor ${actorId} returned HTTP ${response.status}`,
      { actorId, status: response.status, body }
    );
  }

  const data = await response.json();

  // Apify may return { items: [...] } or a direct array
  if (Array.isArray(data)) return data;
  if (data?.items && Array.isArray(data.items)) return data.items;
  if (data && typeof data === "object") return [data];

  return [];
}

/**
 * Run an actor asynchronously and poll for completion.
 * Use for long-running actors or when sync endpoint isn't working.
 *
 * @param {string} actorId
 * @param {object} input
 * @param {object} options - { timeoutSecs, memoryMbytes, pollIntervalMs }
 * @returns {Promise<Array>}
 */
export async function runActorAsync(actorId, input, options = {}) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new ApifyError("APIFY_API_TOKEN not configured", { configIssue: true });
  }

  const memoryMbytes = options.memoryMbytes ?? DEFAULTS.memoryMbytes;
  const maxWaitMs = (options.timeoutSecs ?? 90) * 1000;
  const pollIntervalMs = options.pollIntervalMs ?? 2500;

  // Start the run
  const startRes = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&memoryMbytes=${memoryMbytes}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!startRes.ok) {
    const body = await startRes.text().catch(() => "");
    throw new ApifyError(`Failed to start actor ${actorId}`, {
      status: startRes.status,
      body,
    });
  }

  const { data: runData } = await startRes.json();
  const runId = runData.id;

  // Poll for completion
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    await sleep(pollIntervalMs);

    const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
    const { data: statusData } = await statusRes.json();
    const status = statusData.status;

    if (status === "SUCCEEDED") {
      const itemsRes = await fetch(
        `${APIFY_BASE}/datasets/${statusData.defaultDatasetId}/items?token=${token}&format=json`
      );
      const items = await itemsRes.json();
      return Array.isArray(items) ? items : [items];
    }

    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(status)) {
      throw new ApifyError(`Actor ${actorId} run ${status}`, {
        runId,
        actorStatus: status,
      });
    }

    // RUNNING or READY — continue polling
  }

  throw new ApifyError(
    `Actor ${actorId} polling timed out after ${maxWaitMs / 1000}s`,
    { runId }
  );
}

// ─── Async job helpers (for client-side polling pattern) ─────────────────────

/**
 * Start an Apify actor run without waiting for it to complete.
 * Returns immediately with a runId the client can poll.
 *
 * @param {string} actorId
 * @param {object} input
 * @param {object} options - { memoryMbytes }
 * @returns {Promise<string>} runId
 */
export async function startActorRun(actorId, input, options = {}) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new ApifyError("APIFY_API_TOKEN not configured", { configIssue: true });
  }

  const memoryMbytes = options.memoryMbytes ?? DEFAULTS.memoryMbytes;

  const res = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&memoryMbytes=${memoryMbytes}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new ApifyError(`Failed to start actor ${actorId}: HTTP ${res.status}`, {
      actorId,
      status: res.status,
      body,
    });
  }

  const { data } = await res.json();
  return data.id; // runId
}

/**
 * Check the status of an Apify run. Returns items if SUCCEEDED.
 *
 * @param {string} runId
 * @returns {Promise<{ status: string, items?: Array }>}
 *   status: "RUNNING" | "READY" | "SUCCEEDED" | "FAILED" | "ABORTED" | "TIMED-OUT"
 */
export async function checkActorRun(runId) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new ApifyError("APIFY_API_TOKEN not configured", { configIssue: true });
  }

  const statusRes = await fetch(`${APIFY_BASE}/actor-runs/${runId}?token=${token}`);
  if (!statusRes.ok) {
    throw new ApifyError(`Failed to check run ${runId}: HTTP ${statusRes.status}`, { runId });
  }

  const { data } = await statusRes.json();
  const status = data.status;

  if (status === "SUCCEEDED") {
    const itemsRes = await fetch(
      `${APIFY_BASE}/datasets/${data.defaultDatasetId}/items?token=${token}&format=json`
    );
    const items = await itemsRes.json();
    return { status, items: Array.isArray(items) ? items : [items] };
  }

  return { status };
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

/**
 * Look up a Zillow ZPID from an address string or Zillow URL.
 *
 * @param {string} addressOrUrl - Plain address or zillow.com URL
 * @returns {Promise<object|null>} { zpid, zestimate, beds, baths, ... } or null
 */
export async function lookupZpid(addressOrUrl) {
  const items = await runActor(
    ACTORS.ZILLOW_ZPID_LOOKUP,
    buildZillowZpidInput(addressOrUrl),
    { maxItems: 1, timeoutSecs: 7 } // 7s → clean fail at 8s, within Vercel 10s limit
  );
  return items[0] || null;
}

/**
 * Fetch full Zillow property details by ZPID.
 *
 * @param {string|number} zpid
 * @returns {Promise<object|null>}
 */
export async function fetchZillowDetails(zpid) {
  const items = await runActor(
    ACTORS.ZILLOW_DETAILS,
    buildZillowDetailsInput(zpid),
    { maxItems: 1, timeoutSecs: 45 }
  );
  return items[0] || null;
}

/**
 * Fetch Airbnb listing details by room URL.
 *
 * @param {string} listingUrl - Full Airbnb URL e.g. "https://www.airbnb.com/rooms/12345"
 * @returns {Promise<object|null>}
 */
export async function fetchAirbnbDetails(listingUrl) {
  const items = await runActor(
    ACTORS.AIRBNB_LISTING,
    buildAirbnbInput(listingUrl),
    { maxItems: 1, timeoutSecs: 7 } // 7s → clean fail at 8s, within Vercel 10s limit
  );
  return items[0] || null;
}

// ─── Error class ─────────────────────────────────────────────────────────────

export class ApifyError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "ApifyError";
    this.context = context;
  }

  get isConfigError() {
    return !!this.context.configIssue;
  }

  get isTimeout() {
    return !!this.context.timeout;
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
