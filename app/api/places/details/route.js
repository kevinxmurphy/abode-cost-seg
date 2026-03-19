// ═══════════════════════════════════════════════════════
// ABODE — Google Places Details Proxy
// Fetches full address components for a given place_id.
// Used after user selects an autocomplete suggestion.
//
// GET /api/places/details?placeId={place_id}
// Response: { result: { address, city, state, zip, ... } }
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { parseGooglePlacesComponents, isZillowLookupViable } from "@/lib/addressUtils";
import { serverCacheGet, serverCacheSet, buildPlacesCacheKey } from "@/lib/propertyCache";
import log from "@/lib/logger";

const DETAILS_API = "https://maps.googleapis.com/maps/api/place/details/json";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours (place details don't change)

// Only request the fields we need — reduces billing cost (Basic vs. Contact vs. Atmosphere tiers)
// address_components = Basic tier ($0.017/1000 requests)
const FIELDS = "place_id,formatted_address,address_components,geometry";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim();

  if (!placeId) {
    return NextResponse.json({ error: "placeId is required" }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    log.warn("[Places Details] GOOGLE_PLACES_API_KEY not configured");
    return NextResponse.json(
      { error: "Address API not configured", fallback: true },
      { status: 200 }
    );
  }

  // Check server cache — place details almost never change
  const cacheKey = buildPlacesCacheKey(placeId);
  const cached = serverCacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({ result: cached, cached: true });
  }

  try {
    const url = new URL(DETAILS_API);
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", FIELDS);
    url.searchParams.set("key", apiKey);
    url.searchParams.set("language", "en");

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Google Places Details API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== "OK") {
      log.error("[Places Details] API error:", data.status);
      return NextResponse.json(
        { error: `Places API error: ${data.status}`, fallback: true },
        { status: 200 }
      );
    }

    const rawResult = data.result;
    const components = parseGooglePlacesComponents(rawResult.address_components);

    if (!components) {
      return NextResponse.json(
        { error: "Could not parse address components", fallback: true },
        { status: 200 }
      );
    }

    const result = {
      placeId,
      formattedAddress: rawResult.formatted_address,
      ...components,
      coordinates: {
        lat: rawResult.geometry?.location?.lat ?? null,
        lng: rawResult.geometry?.location?.lng ?? null,
      },
      // Flag for downstream: is this address viable for Zillow lookup?
      zillowLookupViable: isZillowLookupViable(components),
    };

    // Cache the parsed result
    serverCacheSet(cacheKey, result, CACHE_TTL);

    return NextResponse.json({ result });
  } catch (err) {
    log.error("[Places Details] Error:", err.message);
    return NextResponse.json(
      { error: "Could not fetch address details", fallback: true },
      { status: 200 }
    );
  }
}
