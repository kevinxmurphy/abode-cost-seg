// ═══════════════════════════════════════════════════════
// /api/properties
//
// GET  — List all properties for the authenticated user
// POST — Save (upsert) a property + its estimate
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getPropertiesByUser, saveProperty } from "@/lib/db/properties";
import { saveEstimate } from "@/lib/db/estimates";
import { getUserByEmail } from "@/lib/db/users";

// ─── GET /api/properties ─────────────────────────────

export async function GET(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Resolve userId — from session (new logins) or look up by email (old sessions)
  let userId = session.userId;
  if (!userId) {
    const dbUser = await getUserByEmail(session.email);
    userId = dbUser?.id || null;
  }

  if (!userId) {
    return NextResponse.json({ properties: [] });
  }

  const properties = await getPropertiesByUser(userId);
  return NextResponse.json({ properties });
}

// ─── POST /api/properties ────────────────────────────

export async function POST(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { property, estimate } = body;

  if (!property?.address || !property?.purchasePrice) {
    return NextResponse.json(
      { error: "property.address and property.purchasePrice are required" },
      { status: 400 }
    );
  }

  // Resolve userId
  let userId = session.userId;
  if (!userId) {
    const dbUser = await getUserByEmail(session.email);
    userId = dbUser?.id || null;
  }

  if (!userId) {
    return NextResponse.json({ error: "User not found in database" }, { status: 404 });
  }

  // 1. Save property
  const savedProperty = await saveProperty(userId, property);
  if (!savedProperty) {
    return NextResponse.json({ error: "Failed to save property" }, { status: 500 });
  }

  // 2. Save estimate (if provided)
  let savedEstimate = null;
  if (estimate && savedProperty.id) {
    savedEstimate = await saveEstimate(savedProperty.id, userId, estimate);
  }

  return NextResponse.json({
    property: savedProperty,
    estimate: savedEstimate,
  });
}
