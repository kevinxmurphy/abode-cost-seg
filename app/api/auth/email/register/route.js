// ═══════════════════════════════════════════════════════
// POST /api/auth/email/register — Email/password sign-up
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { hashPassword, createSession, buildSessionCookie } from "@/lib/auth";
import { createEmailUser, getUserByEmail } from "@/lib/db/users";
import { sendWelcomeEmail } from "@/lib/email";
import log from "@/lib/logger";

const MIN_PASSWORD_LEN = 8;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, password, utmSource, utmMedium, utmCampaign } = body;

    // Validate inputs
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const trimmedName = name.trim();

    if (password.length < MIN_PASSWORD_LEN) {
      return NextResponse.json(
        { success: false, error: `Password must be at least ${MIN_PASSWORD_LEN} characters.` },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await getUserByEmail(trimmedEmail);
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    // Hash password and create user
    const passwordHash = hashPassword(password);
    const user = await createEmailUser({
      email: trimmedEmail,
      name: trimmedName,
      passwordHash,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Failed to create account. Please try again." },
        { status: 500 }
      );
    }

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail({ to: user.email, name: user.name }).catch(() => {});

    // Create session
    const sessionToken = createSession({
      email: user.email,
      name: user.name,
      picture: null,
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
    log.error("[auth/email/register] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 }
    );
  }
}
