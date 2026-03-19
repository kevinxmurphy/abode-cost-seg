// ═══════════════════════════════════════════════════════
// POST /api/email/study-complete
// Called by StudyWizardPage after the report is generated.
// Reads user email from session cookie, sends study-complete email.
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { sendStudyComplete } from "@/lib/email";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    const session = await getSession(request);

    // Get the user's email — from session (logged-in) or from request body (guest)
    const body = await request.json().catch(() => ({}));
    const email = session?.email || body.email;

    if (!email) {
      // No email available — skip silently (guest with no account)
      return NextResponse.json({ sent: false, reason: "no_email" });
    }

    const {
      propertyAddress,
      firstYearDeduction,
      taxSavings,
      totalComponents,
    } = body;

    await sendStudyComplete({
      to: email,
      name: session?.name || body.name || "",
      propertyAddress: propertyAddress || "",
      firstYearDeduction: firstYearDeduction || 0,
      taxSavings: taxSavings || 0,
      totalComponents: totalComponents || 0,
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    // Email failure should never break the user's flow — log and return 200
    log.error("[email/study-complete] Error:", err.message);
    return NextResponse.json({ sent: false, error: err.message });
  }
}
