// ═══════════════════════════════════════════════════════
// POST /api/auth/reset-password — Complete a password reset
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import {
  hashPassword,
  createSession,
  buildSessionCookie,
} from "@/lib/auth";
import {
  getUserByResetToken,
  updateUserPassword,
  clearResetToken,
} from "@/lib/db/users";

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

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    // Find user by token (also checks expiry)
    const user = await getUserByResetToken(token);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Update password and clear the token
    const passwordHash = hashPassword(password);
    const [updated] = await Promise.all([
      updateUserPassword(user.id, passwordHash),
      clearResetToken(user.id),
    ]);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Password update failed. Please try again." },
        { status: 500 }
      );
    }

    // Log the user in immediately after reset
    const sessionToken = createSession({
      email: user.email,
      name: user.name,
      userId: user.id,
      authMethod: "email",
    });

    const response = NextResponse.json({
      success: true,
      user: { email: user.email, name: user.name },
    });

    response.headers.set("Set-Cookie", buildSessionCookie(sessionToken));
    return response;
  } catch (error) {
    console.error("[auth/reset-password] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
