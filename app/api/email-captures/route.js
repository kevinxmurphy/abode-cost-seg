// POST /api/email-captures
// Saves an email capture to Supabase. No auth required.

import { NextResponse } from "next/server";
import { captureEmail } from "@/lib/db/emailCaptures";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { email, source, propertyAddress, quizData, utmSource, utmMedium, utmCampaign } = body;

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }

  await captureEmail({ email, source, propertyAddress, quizData, utmSource, utmMedium, utmCampaign });

  // Always return success — don't leak DB errors to client
  return NextResponse.json({ success: true });
}
