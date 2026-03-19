// ═══════════════════════════════════════════════════════
// ABODE — Airbnb Listing Lookup API Route
// Fetches Airbnb listing details via Apify tri_angle actor.
// Used to personalize the quiz with the user's actual property.
//
// POST /api/airbnb/lookup
// Body: { url: "https://www.airbnb.com/rooms/12345" }
//       OR: { roomId: "12345" }
// Response: { listing: AirbnbData, source, cached }
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { parseAirbnbUrl } from "@/lib/airbnbParser";
import { fetchAirbnbDetails, ApifyError } from "@/lib/apify";
import { transformAirbnbData } from "@/lib/propertyTransformer";
import {
  serverCacheGet,
  serverCacheSet,
  buildAirbnbCacheKey,
} from "@/lib/propertyCache";
import log from "@/lib/logger";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawInput = body.url || body.roomId || "";

  if (!rawInput) {
    return NextResponse.json(
      { error: "url or roomId is required" },
      { status: 400 }
    );
  }

  // ─── Parse the Airbnb URL/ID ──────────────────────────────────────────────
  // Normalize to a full URL (actor requires full URL)
  let listingUrl;
  let roomId;

  if (rawInput.includes("airbnb.com")) {
    listingUrl = rawInput.split("?")[0]; // Strip query params
    roomId = parseAirbnbUrl(rawInput);
  } else if (/^\d+$/.test(rawInput.trim())) {
    // Numeric ID only
    roomId = rawInput.trim();
    listingUrl = `https://www.airbnb.com/rooms/${roomId}`;
  } else {
    return NextResponse.json(
      { error: "Invalid Airbnb URL or room ID" },
      { status: 400 }
    );
  }

  if (!roomId) {
    return NextResponse.json(
      { error: "Could not extract room ID from URL" },
      { status: 400 }
    );
  }

  // ─── Cache check ─────────────────────────────────────────────────────────
  const cacheKey = buildAirbnbCacheKey(roomId);
  const cached = serverCacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({
      listing: cached,
      source: "cache",
      cached: true,
    });
  }

  // ─── Apify availability check ─────────────────────────────────────────────
  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    log.warn("[Airbnb Lookup] APIFY_API_TOKEN not configured");
    return NextResponse.json({
      listing: null,
      source: "not_configured",
      fallback: true,
      message: "Airbnb lookup not configured — add APIFY_API_TOKEN to .env.local",
    });
  }

  // ─── Fetch from Apify ─────────────────────────────────────────────────────
  let rawListing = null;
  try {
    log.info(`[Airbnb Lookup] Fetching listing: ${listingUrl}`);
    rawListing = await fetchAirbnbDetails(listingUrl);
  } catch (err) {
    if (err instanceof ApifyError) {
      log.error(`[Airbnb Lookup] Apify error: ${err.message}`);
      return NextResponse.json(
        {
          listing: null,
          source: "apify_error",
          fallback: true,
          message: "Could not fetch listing. Please enter property details manually.",
        },
        { status: 200 } // 200 so client handles gracefully
      );
    }
    throw err; // Re-throw unexpected errors
  }

  if (!rawListing) {
    return NextResponse.json({
      listing: null,
      source: "not_found",
      fallback: true,
      message: "Listing not found. Check the URL and try again.",
    });
  }

  // ─── Transform to AirbnbData model ───────────────────────────────────────
  const listing = transformAirbnbData(rawListing);

  if (!listing) {
    return NextResponse.json({
      listing: null,
      source: "transform_failed",
      fallback: true,
    });
  }

  // Ensure the airbnbId is set correctly
  listing.airbnbId = roomId;
  listing.url = listingUrl;

  // ─── Cache and return ─────────────────────────────────────────────────────
  serverCacheSet(cacheKey, listing);

  return NextResponse.json({
    listing,
    source: "apify",
    cached: false,
  });
}
