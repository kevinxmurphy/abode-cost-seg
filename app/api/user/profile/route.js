// ═══════════════════════════════════════════════════════
// /api/user/profile — Get and update current user profile
// ═══════════════════════════════════════════════════════
// GET  → Return full profile from DB
// PATCH → Update name, email, phone

import { NextResponse } from "next/server";
import { getSession, buildSessionCookie, createSession } from "@/lib/auth";
import { getUserById, updateUser, getUserByEmail } from "@/lib/db/users";
import log from "@/lib/logger";

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      picture_url: user.picture_url || null,
      auth_provider: user.auth_provider,
      stripe_customer_id: user.stripe_customer_id || null,
      created_at: user.created_at,
    });
  } catch (error) {
    log.error("[user/profile] GET error:", error.message);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // If email is changing, check it's not already taken
    if (email && email.toLowerCase().trim() !== session.email) {
      const existing = await getUserByEmail(email.toLowerCase().trim());
      if (existing && existing.id !== session.userId) {
        return NextResponse.json(
          { error: "That email is already in use." },
          { status: 409 }
        );
      }
    }

    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) updates.email = email.toLowerCase().trim();
    if (phone !== undefined) updates.phone = phone.trim();

    const updated = await updateUser(session.userId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    // Refresh the session cookie if name or email changed
    let cookieHeader = null;
    if (updates.name || updates.email) {
      const newSession = createSession({
        ...session,
        name: updated.name,
        email: updated.email,
      });
      cookieHeader = buildSessionCookie(newSession);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone || "",
        auth_provider: updated.auth_provider,
      },
    });

    if (cookieHeader) {
      response.headers.set("Set-Cookie", cookieHeader);
    }

    return response;
  } catch (error) {
    log.error("[user/profile] PATCH error:", error.message);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
