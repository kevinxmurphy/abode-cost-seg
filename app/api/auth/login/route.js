// ═══════════════════════════════════════════════════════
// POST /api/auth/login — Email/password sign in
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { verifyPassword, createSession, buildSessionCookie } from "@/lib/auth";
import { getUserByEmail } from "@/lib/db/users";

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

    const normalizedEmail = email.toLowerCase().trim();

    // Fetch user
    const user = await getUserByEmail(normalizedEmail);

    // Use a generic error to avoid revealing whether the email exists
    const INVALID_MSG = "Invalid email or password.";

    if (!user) {
      return NextResponse.json({ success: false, error: INVALID_MSG }, { status: 401 });
    }

    if (!user.password_hash) {
      // This is a Google-only account — guide them to the right path
      return NextResponse.json(
        { success: false, error: "This account uses Google Sign-In. Please continue with Google." },
        { status: 401 }
      );
    }

    const valid = verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ success: false, error: INVALID_MSG }, { status: 401 });
    }

    // Create session
    const sessionToken = createSession({
      email: user.email,
      name: user.name,
      picture: user.picture_url || null,
      userId: user.id,
      authMethod: "email",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: user.email,
        name: user.name,
        userId: user.id,
      },
    });

    response.headers.set("Set-Cookie", buildSessionCookie(sessionToken));
    return response;
  } catch (error) {
    console.error("[auth/login] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
