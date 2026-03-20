// ═══════════════════════════════════════════════════════
// POST /api/study/save
// Persists a completed study to Supabase after the wizard generates it.
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { saveStudy } from "@/lib/db/studies";
import { updatePropertyStatus } from "@/lib/db/properties";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { propertyId, studyData, reportData, wizardInputs, attestation } = body;

    if (!studyData) {
      return NextResponse.json({ error: "studyData is required" }, { status: 400 });
    }

    // Save study to Supabase
    const study = await saveStudy(session.userId, propertyId, {
      studyData,
      reportData,
      wizardInputs,
      attestation,
    });

    if (!study) {
      return NextResponse.json({ error: "Failed to save study" }, { status: 500 });
    }

    // Update property status to reflect completed study
    if (propertyId) {
      await updatePropertyStatus(propertyId, session.userId, {
        study_status: "complete",
      });
    }

    log.info("[study/save] Study saved:", study.id, "for property:", propertyId);

    return NextResponse.json({ studyId: study.id });
  } catch (err) {
    log.error("[study/save] Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}
