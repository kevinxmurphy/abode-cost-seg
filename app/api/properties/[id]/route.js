// ═══════════════════════════════════════════════════════
// /api/properties/[id]
//
// GET    — Get a single property
// PATCH  — Update workflow state (step, study_status, etc.)
// DELETE — Delete a property
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getPropertyById,
  updatePropertyStatus,
  deleteProperty,
} from "@/lib/db/properties";
import { getUserByEmail } from "@/lib/db/users";

async function resolveUserId(session) {
  if (session.userId) return session.userId;
  const { getUserByEmail } = await import("@/lib/db/users");
  const dbUser = await getUserByEmail(session.email);
  return dbUser?.id || null;
}

// ─── GET /api/properties/[id] ────────────────────────

export async function GET(request, { params }) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await resolveUserId(session);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const property = await getPropertyById(params.id, userId);
  if (!property) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ property });
}

// ─── PATCH /api/properties/[id] ─────────────────────

export async function PATCH(request, { params }) {
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

  const userId = await resolveUserId(session);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = await updatePropertyStatus(params.id, userId, body);
  if (!updated) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }

  return NextResponse.json({ property: updated });
}

// ─── DELETE /api/properties/[id] ────────────────────

export async function DELETE(request, { params }) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = await resolveUserId(session);
  if (!userId) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const success = await deleteProperty(params.id, userId);
  if (!success) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
