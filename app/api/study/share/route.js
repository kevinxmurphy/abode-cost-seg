// ═══════════════════════════════════════════════════════
// POST /api/study/share
// Sends a study summary email to a CPA on behalf of the user.
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getServerClient } from "@/lib/supabase";
import { getUserByEmail } from "@/lib/db/users";
import { sendStudyShareCPA } from "@/lib/email";
import log from "@/lib/logger";

export async function POST(request) {
  const session = getSession(request);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { studyId, cpaEmail, cpaName, message } = body;

  if (!studyId || !cpaEmail) {
    return NextResponse.json(
      { error: "studyId and cpaEmail are required" },
      { status: 400 }
    );
  }

  // Resolve userId
  let userId = session.userId;
  if (!userId) {
    const dbUser = await getUserByEmail(session.email);
    userId = dbUser?.id || null;
  }
  if (!userId) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Fetch study + property — verify ownership
  const db = getServerClient();
  if (!db) {
    return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
  }

  const { data: study, error } = await db
    .from("studies")
    .select("*, properties(*)")
    .eq("id", studyId)
    .eq("user_id", userId)
    .single();

  if (error || !study) {
    return NextResponse.json({ error: "Study not found" }, { status: 404 });
  }

  if (study.status !== "complete") {
    return NextResponse.json(
      { error: "Study is not yet complete" },
      { status: 422 }
    );
  }

  const property = study.properties;
  const address = property
    ? [property.address, property.city, property.state].filter(Boolean).join(", ")
    : "your property";

  try {
    await sendStudyShareCPA({
      to: cpaEmail,
      cpaName: cpaName || "",
      fromName: session.name || "",
      propertyAddress: address,
      firstYearDeduction: study.first_year_deduction || 0,
      taxSavings: study.estimated_tax_savings || 0,
      studyType: study.study_type || "standard",
      message: message || "",
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    log.error("[study/share] Email error:", err.message);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
