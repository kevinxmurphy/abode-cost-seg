// ═══════════════════════════════════════════════════════
// POST /api/user/change-password — Change password (authenticated)
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession, verifyPassword, hashPassword } from "@/lib/auth";
import { getUserById, updatePassword } from "@/lib/db/users";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    const session = getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.auth_provider !== "email" || !user.password_hash) {
      return NextResponse.json(
        { error: "Password change is only available for email/password accounts." },
        { status: 400 }
      );
    }

    const valid = verifyPassword(currentPassword, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 401 }
      );
    }

    const newHash = hashPassword(newPassword);
    const ok = await updatePassword(session.userId, newHash);

    if (!ok) {
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("[user/change-password] Error:", error.message);
    return NextResponse.json(
      { error: "Password change failed." },
      { status: 500 }
    );
  }
}
