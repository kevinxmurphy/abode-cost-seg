// ═══════════════════════════════════════════════════════
// POST /api/auth/google — Google OAuth callback
// ═══════════════════════════════════════════════════════
// Verifies Google ID token, upserts user in Supabase,
// creates session cookie with userId, returns user data.

import { NextResponse } from "next/server";
import {
  verifyGoogleToken,
  createSession,
  buildSessionCookie,
} from "@/lib/auth";
import { upsertUser } from "@/lib/db/users";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      log.warn("[auth/google] GOOGLE_CLIENT_ID not set in environment");
      return NextResponse.json(
        { success: false, error: "Google authentication is not configured." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { credential, propertyData } = body;

    if (!credential) {
      return NextResponse.json(
        { success: false, error: "Missing credential token" },
        { status: 400 }
      );
    }

    // 1. Verify Google ID token
    const googleUser = await verifyGoogleToken(credential);
    if (!googleUser) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired Google token" },
        { status: 401 }
      );
    }

    // 2. Upsert user in Supabase — get back their UUID
    const dbUser = await upsertUser(googleUser);
    const userId = dbUser?.id || null;

    if (!dbUser) {
      log.warn("[auth/google] DB upsert failed — continuing without userId");
    }

    // 3. Build session (now includes userId)
    const sessionData = {
      ...googleUser,
      userId,
      ...(propertyData ? { propertyData } : {}),
    };

    const sessionToken = createSession(sessionData);
    const cookieHeader = buildSessionCookie(sessionToken);

    const response = NextResponse.json({
      success: true,
      user: {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        userId,
      },
    });

    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    log.error("[auth/google] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Authentication failed" },
      { status: 500 }
    );
  }
}
