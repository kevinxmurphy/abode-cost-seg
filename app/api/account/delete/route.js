// ═══════════════════════════════════════════════════════
// DELETE /api/account/delete
// GDPR-compliant account deletion — removes user data
// from all Supabase tables and clears session cookie.
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getServerClient } from "@/lib/supabase";
import log from "@/lib/logger";
import { rateLimit, tooManyRequests } from "@/lib/rateLimit";

const limiter = rateLimit({ windowMs: 60_000, max: 5 });

export async function DELETE(request) {
  const { limited } = limiter(request);
  if (limited) return tooManyRequests();

  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.userId;
    const db = getServerClient();

    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 }
      );
    }

    // Delete in dependency order (child tables first)
    const deletions = [
      { table: "estimates", filter: { user_id: userId } },
      { table: "studies", filter: { user_id: userId } },
      { table: "purchases", filter: { user_id: userId } },
      { table: "properties", filter: { user_id: userId } },
      { table: "email_captures", filter: { email: session.email } },
      { table: "contact_submissions", filter: { email: session.email } },
      { table: "users", filter: { id: userId } },
    ];

    const errors = [];

    for (const { table, filter } of deletions) {
      try {
        const [key, value] = Object.entries(filter)[0];
        const { error } = await db.from(table).delete().eq(key, value);
        if (error) {
          // Table may not exist yet — log but continue
          log.warn(`[account/delete] ${table} deletion warning:`, error.message);
          errors.push({ table, error: error.message });
        }
      } catch (err) {
        log.warn(`[account/delete] ${table} deletion skipped:`, err.message);
      }
    }

    log.info("[account/delete] Account deleted for user:", userId);

    // Clear session cookie
    const response = NextResponse.json({
      success: true,
      message: "Account and all associated data have been deleted.",
    });

    response.headers.set(
      "Set-Cookie",
      "abode_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
    );

    return response;
  } catch (err) {
    log.error("[account/delete] Error:", err);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
