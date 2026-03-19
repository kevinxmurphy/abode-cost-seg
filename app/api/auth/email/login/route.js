// ═══════════════════════════════════════════════════════
// POST /api/auth/email/login — Email/password sign-in
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { verifyPassword, createSession, buildSessionCookie } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db/users";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();

    // Look up user
    const user = await getUserByEmail(trimmedEmail);

    // Use a generic error to avoid user enumeration
    const invalidMsg = "Incorrect email or password.";

    if (!user) {
      return NextResponse.json(
        { success: false, error: invalidMsg },
        { status: 401 }
      );
    }

    if (user.auth_provider !== "email" || !user.password_hash) {
      // This account was created via Google — guide them to use Google sign-in
      return NextResponse.json(
        { success: false, error: "This account uses Google Sign-In. Please continue with Google." },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: invalidMsg },
        { status: 401 }
      );
    }

    // Create session
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
      user: {
        email: user.email,
        name: user.name,
        userId: user.id,
      },
    });

    response.headers.set("Set-Cookie", cookieHeader);
    return response;
  } catch (error) {
    log.error("[auth/email/login] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Sign-in failed. Please try again." },
      { status: 500 }
    );
  }
}
