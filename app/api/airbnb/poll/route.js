// ═══════════════════════════════════════════════════════
// ABODE — Airbnb Job Poll Route
// Checks an Apify run status and returns listing data
// when ready. Called repeatedly by the client every 3s.
//
// GET /api/airbnb/poll?runId=...&roomId=...
// Response: { status: "running" | "done" | "failed", listing? }
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { checkActorRun, ApifyError } from "@/lib/apify";
import { transformAirbnbData } from "@/lib/propertyTransformer";
import { serverCacheSet, buildAirbnbCacheKey } from "@/lib/propertyCache";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const runId = searchParams.get("runId");
  const roomId = searchParams.get("roomId");
  const listingUrl = searchParams.get("listingUrl");

  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  try {
    const result = await checkActorRun(runId);

    // Still running
    if (result.status === "RUNNING" || result.status === "READY") {
      return NextResponse.json({ status: "running" });
    }

    // Failed/aborted
    if (["FAILED", "ABORTED", "TIMED-OUT"].includes(result.status)) {
      console.warn(`[Airbnb Poll] Run ${runId} ended with status ${result.status}`);
      return NextResponse.json({
        status: "failed",
        fallback: true,
        message: "Could not fetch listing. Please enter property details manually.",
      });
    }

    // Succeeded — transform and cache
    if (result.status === "SUCCEEDED") {
      const rawListing = result.items?.[0];
      if (!rawListing) {
        return NextResponse.json({
          status: "failed",
          fallback: true,
          message: "Listing not found. Check the URL and try again.",
        });
      }

      const listing = transformAirbnbData(rawListing);
      if (!listing) {
        return NextResponse.json({ status: "failed", fallback: true });
      }

      if (roomId) listing.airbnbId = roomId;
      if (listingUrl) listing.url = listingUrl;

      // Cache so future requests for the same listing are instant
      if (roomId) {
        const cacheKey = buildAirbnbCacheKey(roomId);
        serverCacheSet(cacheKey, listing);
      }

      console.log(`[Airbnb Poll] ✅ Run ${runId} complete — ${listing.title}`);
      return NextResponse.json({ status: "done", listing });
    }

    // Unknown status
    return NextResponse.json({ status: "running" });

  } catch (err) {
    if (err instanceof ApifyError) {
      console.error(`[Airbnb Poll] ${err.message}`);
      return NextResponse.json({
        status: "failed",
        fallback: true,
        message: "Could not fetch listing. Please enter property details manually.",
      }, { status: 200 });
    }
    throw err;
  }
}
