// ═══════════════════════════════════════════════════════
// POST /api/auth/email/reset-confirm — Confirm password reset
// ═══════════════════════════════════════════════════════
// Verifies token from the reset link, updates the password,
// and creates a new session so the user is logged in.

import { NextResponse } from "next/server";
import {
  hashResetToken,
  hashPassword,
  createSession,
  buildSessionCookie,
} from "@/lib/auth";
import { getUserByResetToken, updatePassword } from "@/lib/db/users";
import log from "@/lib/logger";

const MIN_PASSWORD_LEN = 8;

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < MIN_PASSWORD_LEN) {
      return NextResponse.json(
        { success: false, error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` },
        { status: 400 }
      );
    }

    // Hash the submitted token and look up the user
    const tokenHash = hashResetToken(token);
    const user = await getUserByResetToken(tokenHash);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or has expired." },
        { status: 400 }
      );
    }

    // Update the password (also clears the reset token)
    const newHash = hashPassword(password);
    const ok = await updatePassword(user.id, newHash);

    if (!ok) {
      return NextResponse.json(
        { success: false, error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    // Log the user in immediately
    const sessionToken = createSession({
      email: user.email,
      name: user.name,
      picture: user.picture_url || null,
      googleId: null,
      userId: user.id,
      authProvider: "email",
    });

    const cookieHeader = buildSessionCookie(sessionToken);

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name },
    });

    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    log.error("[auth/reset-confirm] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Password reset failed. Please try again." },
      { status: 500 }
    );
  }
}
