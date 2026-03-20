// POST /api/contact
// Saves contact form submissions to email_captures table.
// No auth required.

import { NextResponse } from "next/server";
import { captureEmail } from "@/lib/db/emailCaptures";
import log from "@/lib/logger";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message, firm, interest } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  // Determine source based on form type
  const source = firm !== undefined ? "cpa-partnership" : "contact-form";

  // Save to email_captures table with form data as quizData (JSON field)
  const formData = { name, subject, message };
  if (firm) formData.firm = firm;
  if (interest) formData.interest = interest;

  try {
    await captureEmail({
      email,
      source,
      propertyAddress: null,
      quizData: formData,
    });
    log.info(`[contact] ${source} submission from ${email}`);
  } catch (e) {
    log.error("[contact] Failed to save:", e.message);
  }

  // Always return success — don't leak errors
  return NextResponse.json({ success: true });
}
