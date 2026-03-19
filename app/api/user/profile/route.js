// ═══════════════════════════════════════════════════════
// /api/user/profile — Get and update the authenticated user's profile
// GET  → Return full profile from DB (includes phone, etc.)
// PATCH → Update name and/or phone
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { getUserById, updateUser, updateUserPassword } from "@/lib/db/users";

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || "",
      picture_url: user.picture_url || null,
      auth_method: user.auth_method || "google",
      stripe_customer_id: user.stripe_customer_id || null,
    });
  } catch (error) {
    console.error("[user/profile] GET error:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, phone, currentPassword, newPassword } = body;

    const updates = {};

    if (name !== undefined) {
      const trimmed = name.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
      }
      updates.name = trimmed;
    }

    if (phone !== undefined) {
      updates.phone = phone.trim() || null;
    }

    // Update name/phone if provided
    if (Object.keys(updates).length > 0) {
      const updated = await updateUser(session.userId, updates);
      if (!updated) {
        return NextResponse.json({ error: "Profile update failed." }, { status: 500 });
      }
    }

    // Handle password change (email users only)
    if (newPassword !== undefined) {
      if (session.authMethod !== "email") {
        return NextResponse.json(
          { error: "Password change is only available for email accounts." },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required." }, { status: 400 });
      }

      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "New password must be at least 8 characters." },
          { status: 400 }
        );
      }

      const user = await getUserById(session.userId);
      if (!user?.password_hash) {
        return NextResponse.json({ error: "No password set on this account." }, { status: 400 });
      }

      const valid = verifyPassword(currentPassword, user.password_hash);
      if (!valid) {
        return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
      }

      const newHash = hashPassword(newPassword);
      const ok = await updateUserPassword(session.userId, newHash);
      if (!ok) {
        return NextResponse.json({ error: "Password update failed." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[user/profile] PATCH error:", error.message);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
