// ═══════════════════════════════════════════════════════
// GET /api/billing
// Returns the authenticated user's paid study transactions.
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getServerClient } from "@/lib/supabase";
import { getUserByEmail } from "@/lib/db/users";
import log from "@/lib/logger";

export async function GET(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userId = session.userId;
  if (!userId) {
    const dbUser = await getUserByEmail(session.email);
    userId = dbUser?.id || null;
  }

  if (!userId) {
    return NextResponse.json({ transactions: [] });
  }

  const db = getServerClient();
  if (!db) return NextResponse.json({ transactions: [] });

  const { data, error } = await db
    .from("studies")
    .select(`
      id,
      payment_amount,
      paid_at,
      study_type,
      status,
      properties(address, city, state)
    `)
    .eq("user_id", userId)
    .eq("payment_status", "paid")
    .order("paid_at", { ascending: false });

  if (error) {
    log.error("[api/billing] error:", error.message);
    return NextResponse.json({ transactions: [] });
  }

  const transactions = (data || []).map((row) => {
    const p = row.properties;
    const address = p
      ? [p.address, p.city, p.state].filter(Boolean).join(", ")
      : "Property";
    return {
      id: row.id,
      address,
      amount: row.payment_amount || 48100, // cents
      paid_at: row.paid_at,
      study_type: row.study_type,
      status: row.status,
    };
  });

  return NextResponse.json({ transactions });
}
