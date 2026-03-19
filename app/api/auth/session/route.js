// ═══════════════════════════════════════════════════════
// /api/auth/session — Session check + logout
// ═══════════════════════════════════════════════════════
// GET  → Check if user is authenticated, return user data
// DELETE → Clear session cookie (logout)

import { NextResponse } from "next/server";
import { getSession, clearSession } from "@/lib/auth";
import log from "@/lib/logger";

export async function GET(request) {
  try {
    const session = getSession(request);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        email: session.email,
        name: session.name,
        picture: session.picture,
        userId: session.userId,
        authProvider: session.authProvider,
      },
    });
  } catch (error) {
    log.error("[auth/session] GET error:", error.message);
    return NextResponse.json({
      authenticated: false,
    });
  }
}

export async function DELETE() {
  try {
    const headers = clearSession();

    return NextResponse.json(
      { success: true, message: "Logged out" },
      { headers }
    );
  } catch (error) {
    log.error("[auth/session] DELETE error:", error.message);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}
