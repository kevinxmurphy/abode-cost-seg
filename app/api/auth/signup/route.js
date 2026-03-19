// ═══════════════════════════════════════════════════════
// POST /api/auth/signup — Email/password account creation
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { hashPassword, createSession, buildSessionCookie } from "@/lib/auth";
import { createEmailUser } from "@/lib/db/users";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Validate inputs
    if (!email || !name || !password) {
      return NextResponse.json(
        { success: false, error: "Email, name, and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user in DB
    const result = await createEmailUser({
      email: normalizedEmail,
      name: name.trim(),
      passwordHash,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Account creation failed. Please try again." },
        { status: 500 }
      );
    }

    if (result.error === "email_taken") {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists. Try logging in." },
        { status: 409 }
      );
    }

    // Create session
    const sessionToken = createSession({
      email: result.email,
      name: result.name,
      userId: result.id,
      authMethod: "email",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: result.email,
        name: result.name,
        userId: result.id,
      },
    });

    response.headers.set("Set-Cookie", buildSessionCookie(sessionToken));
    return response;
  } catch (error) {
    console.error("[auth/signup] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
