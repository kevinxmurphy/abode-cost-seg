// ═══════════════════════════════════════════════════════
// POST /api/auth/email/reset-request — Request password reset
// ═══════════════════════════════════════════════════════
// Sends a reset link email if the user exists.
// Always returns success to prevent user enumeration.

import { NextResponse } from "next/server";
import { generateResetToken } from "@/lib/auth";
import { getUserByEmail, setPasswordResetToken } from "@/lib/db/users";

const RESET_EXPIRY_MINUTES = 60;

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required." },
        { status: 400 }
      );
    }

    const trimmedEmail = email.toLowerCase().trim();
    const genericOk = NextResponse.json({ success: true });

    // Look up user — but always return success to prevent enumeration
    const user = await getUserByEmail(trimmedEmail);
    if (!user || user.auth_provider !== "email") {
      return genericOk;
    }

    // Generate reset token
    const { token, tokenHash } = generateResetToken();
    const expires = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

    await setPasswordResetToken(user.id, tokenHash, expires);

    // Build reset URL
    const origin = request.headers.get("origin") || "https://abodecostseg.com";
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Send email via Resend (if configured) or log for dev
    const resendKey = process.env.RESEND_API_KEY;

    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Abode <no-reply@abodecostseg.com>",
          to: [trimmedEmail],
          subject: "Reset your Abode password",
          html: `
            <p>Hi ${user.name || "there"},</p>
            <p>You requested a password reset for your Abode account.</p>
            <p>
              <a href="${resetUrl}" style="background:#0d9488;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block;">
                Reset Password
              </a>
            </p>
            <p>This link expires in ${RESET_EXPIRY_MINUTES} minutes.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
            <p style="color:#999;font-size:12px;">${resetUrl}</p>
          `,
        }),
      });
    } else {
      // Dev fallback — log to console
      console.info("[auth/reset-request] RESEND_API_KEY not set. Reset URL:", resetUrl);
    }

    return genericOk;
  } catch (error) {
    console.error("[auth/reset-request] Error:", error.message);
    // Still return success to prevent enumeration
    return NextResponse.json({ success: true });
  }
}
