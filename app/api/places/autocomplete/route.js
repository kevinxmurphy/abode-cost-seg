// ═══════════════════════════════════════════════════════
// ABODE — Google Places Autocomplete Proxy
// Server-side proxy keeps API key out of client bundle.
// Restricts results to US addresses (residential properties only).
//
// GET /api/places/autocomplete?input={query}
// Response: { predictions: [{ place_id, description, structured_formatting }] }
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { serverCacheGet, serverCacheSet } from "@/lib/propertyCache";
import log from "@/lib/logger";

const PLACES_API = "https://maps.googleapis.com/maps/api/place/autocomplete/json";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes (autocomplete results change rarely)

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get("input")?.trim();

  // Validate input
  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    // Return empty rather than error — falls back to manual entry gracefully
    log.warn("[Places Autocomplete] GOOGLE_PLACES_API_KEY not configured");
    return NextResponse.json({
      predictions: [],
      fallback: true,
      message: "Address API not configured",
    });
  }

  // Check server cache
  const cacheKey = `autocomplete:${input.toLowerCase()}`;
  const cached = serverCacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({ predictions: cached, cached: true });
  }

  try {
    const url = new URL(PLACES_API);
    url.searchParams.set("input", input);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("types", "address"); // Address-only (no businesses, etc.)
    url.searchParams.set("components", "country:us"); // US only
    url.searchParams.set("language", "en");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Google Places API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      log.error("[Places Autocomplete] API error:", data.status, data.error_message);
      // Return graceful empty rather than throwing
      return NextResponse.json({ predictions: [], apiStatus: data.status });
    }

    const predictions = (data.predictions || []).map(formatPrediction);

    // Cache the result
    serverCacheSet(cacheKey, predictions, CACHE_TTL);

    return NextResponse.json({ predictions });
  } catch (err) {
    log.error("[Places Autocomplete] Error:", err.message);
    // Graceful fallback — user can still type manually
    return NextResponse.json(
      { predictions: [], error: "Autocomplete temporarily unavailable" },
      { status: 200 } // Return 200 so the UI handles it gracefully
    );
  }
}

/**
 * Format a Google Places prediction into our simplified model.
 * Only return what the UI needs to keep payload small.
 */
function formatPrediction(prediction) {
  return {
    placeId: prediction.place_id,
    description: prediction.description,
    mainText: prediction.structured_formatting?.main_text || prediction.description,
    secondaryText: prediction.structured_formatting?.secondary_text || "",
    types: prediction.types || [],
  };
}
