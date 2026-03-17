// ═══════════════════════════════════════════════════════
// ABODE — Street View Proxy
// Generates a Google Street View Static API URL server-side
// so the API key never reaches the browser.
//
// GET /api/streetview?lat=33.703&lon=-116.253&address=80761+Canyon+Trl+Indio+CA
// Returns: image/jpeg (proxied from Google)
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const address = searchParams.get("address");

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  // Build Google Street View URL — prefer coordinates, fallback to address
  const params = new URLSearchParams({
    size: "640x400",
    source: "outdoor",
    return_error_code: "true",
    key: apiKey,
  });

  if (lat && lon) {
    params.set("location", `${lat},${lon}`);
  } else if (address) {
    params.set("location", address);
  } else {
    return NextResponse.json({ error: "lat/lon or address required" }, { status: 400 });
  }

  const googleUrl = `https://maps.googleapis.com/maps/api/streetview?${params.toString()}`;

  try {
    const response = await fetch(googleUrl, {
      signal: AbortSignal.timeout(8000),
    });

    // Google returns 404 when no street view is available
    if (!response.ok) {
      return NextResponse.json({ error: "No street view available" }, { status: 404 });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    // If Google returned an error page (HTML), no street view
    if (contentType.includes("text/html")) {
      return NextResponse.json({ error: "No street view available" }, { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=604800",
      },
    });
  } catch {
    return NextResponse.json({ error: "Street View request failed" }, { status: 502 });
  }
}
