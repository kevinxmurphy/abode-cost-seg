// ═══════════════════════════════════════════════════════
// ABODE — Airbnb Job Start Route
// Fires the Apify actor and returns a runId immediately.
// Client polls /api/airbnb/poll?runId=... for results.
//
// POST /api/airbnb/start
// Body: { url: "https://www.airbnb.com/rooms/12345" }
// Response: { runId, status: "started" }
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { parseAirbnbUrl } from "@/lib/airbnbParser";
import { buildAirbnbInput, startActorRun, ACTORS, ApifyError } from "@/lib/apify";
import { serverCacheGet, buildAirbnbCacheKey } from "@/lib/propertyCache";
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
    return NextResponse.json({ error: "url or roomId is required" }, { status: 400 });
  }

  // Parse URL/ID
  let listingUrl, roomId;
  if (rawInput.includes("airbnb.com")) {
    listingUrl = rawInput.split("?")[0];
    roomId = parseAirbnbUrl(rawInput);
  } else if (/^\d+$/.test(rawInput.trim())) {
    roomId = rawInput.trim();
    listingUrl = `https://www.airbnb.com/rooms/${roomId}`;
  } else {
    return NextResponse.json({ error: "Invalid Airbnb URL or room ID" }, { status: 400 });
  }

  if (!roomId) {
    return NextResponse.json({ error: "Could not extract room ID from URL" }, { status: 400 });
  }

  // Check server cache first — return immediately if cached
  const cacheKey = buildAirbnbCacheKey(roomId);
  const cached = serverCacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({ cached: true, listing: cached, roomId });
  }

  // Check Apify token
  if (!process.env.APIFY_API_TOKEN) {
    return NextResponse.json({
      error: "Airbnb lookup not configured",
      fallback: true,
    }, { status: 200 });
  }

  // Fire the actor and return runId immediately
  try {
    const runId = await startActorRun(
      ACTORS.AIRBNB_LISTING,
      buildAirbnbInput(listingUrl),
      { memoryMbytes: 256 }
    );

    log.info(`[Airbnb Start] Fired run ${runId} for listing ${roomId}`);
    return NextResponse.json({ runId, roomId, listingUrl, status: "started" });

  } catch (err) {
    if (err instanceof ApifyError) {
      log.error(`[Airbnb Start] ${err.message}`);
      return NextResponse.json({
        fallback: true,
        message: "Could not start Airbnb lookup. Enter property details manually.",
      }, { status: 200 });
    }
    throw err;
  }
}
