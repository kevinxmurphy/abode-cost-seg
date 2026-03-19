// ═══════════════════════════════════════════════════════
// POST /api/auth/forgot-password — Request a password reset email
// ═══════════════════════════════════════════════════════
// Always returns 200 (don't reveal whether email exists in DB).

import { NextResponse } from "next/server";
import { generateResetToken } from "@/lib/auth";
import { getUserByEmail, setResetToken } from "@/lib/db/users";
import { sendPasswordReset } from "@/lib/email";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://abodecostseg.com"
    : "http://localhost:3000");

export async function POST(request) {
  try {
    const body = await request.json();
    const email = body?.email?.toLowerCase?.().trim();

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    // Always respond with success to prevent email enumeration
    const user = await getUserByEmail(email);

    if (user && user.auth_method === "email") {
      const { token, expires } = generateResetToken();
      await setResetToken(user.id, token, expires);

      const resetUrl = `${BASE_URL}/reset-password?token=${token}`;
      await sendPasswordReset({
        to: user.email,
        name: user.name || "",
        resetUrl,
      });
    }
    // If user doesn't exist or is Google-only, silently do nothing

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/forgot-password] Error:", error.message);
    // Still return success to not reveal anything
    return NextResponse.json({ success: true });
  }
}
