// ═══════════════════════════════════════════════════════
// ABODE — Property Lookup API Route
// Fetches property data for a given address.
//
// Data source priority:
//   1. Realtor.com GraphQL API (FREE — beds, baths, sqft, year built,
//      lot size, tax history with ACTUAL land/building split, sale history)
//   2. Zillow autocomplete + Apify Actor 1 (fallback — basic data only)
//
// POST /api/property/lookup
// Body: { address, city, state, zip, fullAddress? }
// Response: { property, source, cached }
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { isZillowLookupViable, lookupZpidFromZillow } from "@/lib/addressUtils";
import { lookupRealtorPropertyId, fetchRealtorPropertyDetails } from "@/lib/realtorApi";
import { lookupZpid, ApifyError } from "@/lib/apify";
import { serverCacheGet, serverCacheSet, buildPropertyCacheKey } from "@/lib/propertyCache";
import { dbCacheGet, dbCacheSet } from "@/lib/db/cache";
import log from "@/lib/logger";
import { rateLimit, tooManyRequests } from "@/lib/rateLimit";

const limiter = rateLimit({ windowMs: 60_000, max: 20 });

export async function POST(request) {
  const { limited } = limiter(request);
  if (limited) return tooManyRequests();
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { address, city, state, zip, fullAddress } = body;

  if (!address || !state) {
    return NextResponse.json({ error: "address and state are required" }, { status: 400 });
  }

  // ─── Cache check (in-memory first, then DB) ──────────────────────────────
  const cacheKey = buildPropertyCacheKey(fullAddress || `${address} ${city} ${state} ${zip}`);

  const memCached = serverCacheGet(cacheKey);
  if (memCached) {
    return NextResponse.json({ property: memCached, source: "cache", cached: true });
  }

  const dbCached = await dbCacheGet(cacheKey);
  if (dbCached) {
    serverCacheSet(cacheKey, dbCached); // warm in-memory cache
    return NextResponse.json({ property: dbCached, source: "cache", cached: true });
  }

  // ─── Viability check ─────────────────────────────────────────────────────
  if (!isZillowLookupViable({ address, city, state, zip })) {
    return NextResponse.json({
      property: null,
      source: "ineligible",
      fallback: true,
      message: "Address not eligible for automated lookup.",
    });
  }

  const addressQuery = [address, city, `${state} ${zip}`].filter(Boolean).join(" ");

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIMARY: Realtor.com (FREE, rich data, actual land/building split)
  // ═══════════════════════════════════════════════════════════════════════════

  log.info(`[Property Lookup] Searching Realtor.com for: ${addressQuery}`);
  const realtorResult = await lookupRealtorPropertyId(addressQuery);

  if (realtorResult?.propertyId) {
    log.info(`[Property Lookup] Got Realtor ID: ${realtorResult.propertyId}`);

    const property = await fetchRealtorPropertyDetails(realtorResult.propertyId);

    if (property && property.beds > 0) {
      // Enrich with address components from Google Places (if not in Realtor data)
      property.address = property.address || address;
      property.city = property.city || city;
      property.state = property.state || state;
      property.zip = property.zip || zip;
      property.fullAddress = property.fullAddress || fullAddress || `${address}, ${city}, ${state} ${zip}`;

      // Also look up ZPID for Zillow link (non-blocking, best-effort)
      const zpidResult = await lookupZpidFromZillow(addressQuery).catch(() => null);
      if (zpidResult?.zpid) {
        property.zpid = zpidResult.zpid;
        property.zillowUrl = `https://www.zillow.com/homedetails/${zpidResult.zpid}_zpid/`;
      }

      // Cache in both layers
      serverCacheSet(cacheKey, property);
      dbCacheSet(cacheKey, "property", property).catch(() => {});
      log.info(`[Property Lookup] Realtor.com: ${property.beds}bd/${property.baths}ba, ${property.sqft}sqft, built ${property.yearBuilt}`);

      return NextResponse.json({
        property,
        source: "realtor",
        cached: false,
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FALLBACK: Zillow autocomplete → Apify Actor 1 (basic data)
  // ═══════════════════════════════════════════════════════════════════════════

  log.info(`[Property Lookup] Realtor.com miss — trying Zillow fallback`);

  const zpidResult = await lookupZpidFromZillow(addressQuery);

  if (!zpidResult?.zpid) {
    return NextResponse.json({
      property: null,
      source: "not_found",
      fallback: true,
      message: "Property not found. Please enter details manually.",
    });
  }

  const apifyToken = process.env.APIFY_API_TOKEN;
  if (!apifyToken) {
    return NextResponse.json({
      property: null,
      source: "not_configured",
      fallback: true,
      message: "Property lookup API not configured.",
    });
  }

  try {
    const rawDetails = await lookupZpid(zpidResult.zpid);

    if (rawDetails && rawDetails.PropertyZPID) {
      const property = {
        source: "zillow",
        zpid: String(rawDetails.PropertyZPID),
        zillowUrl: rawDetails.PropertyZillowURL || "",
        address: rawDetails.PropertyAddress?.streetAddress || address,
        city: rawDetails.PropertyAddress?.city || city,
        state: rawDetails.PropertyAddress?.state || state,
        zip: rawDetails.PropertyAddress?.zipcode || zip,
        fullAddress: fullAddress || `${address}, ${city}, ${state} ${zip}`,
        beds: rawDetails.Bedrooms || 0,
        baths: rawDetails.Bathrooms || 0,
        sqft: rawDetails["Area(sqft)"] || 0,
        lotSqft: 0,
        yearBuilt: rawDetails.yearBuilt || 0,
        propertyType: "Single Family",
        zestimate: rawDetails.zestimate || 0,
        assessedTotal: 0,
        assessedLand: 0,
        assessedImprovement: 0,
        lastSoldPrice: 0,
        lastSoldDate: null,
        taxHistory: [],
        priceHistory: [],
        quality: {
          hasAssessedSplit: false,
          splitIsEstimated: true,
          confidence: 40,
        },
      };

      serverCacheSet(cacheKey, property);
      dbCacheSet(cacheKey, "property", property).catch(() => {});
      log.info(`[Property Lookup] Zillow fallback: ${property.beds}bd/${property.baths}ba`);

      return NextResponse.json({
        property,
        source: "zillow",
        cached: false,
        zpid: zpidResult.zpid,
      });
    }
  } catch (err) {
    if (err instanceof ApifyError) {
      log.error(`[Property Lookup] Apify error: ${err.message}`);
    } else {
      throw err;
    }
  }

  return NextResponse.json({
    property: null,
    source: "all_failed",
    fallback: true,
    message: "Could not fetch property details. Please enter manually.",
  });
}
