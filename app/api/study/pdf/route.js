// ═══════════════════════════════════════════════════════════════════════════
// ABODE — Cost Segregation Study PDF API Route
//
// GET /api/study/pdf?id=<studyId>         — Full paid study PDF download
// GET /api/study/pdf?id=<studyId>&preview — Watermarked preview PDF
// POST /api/study/pdf                     — Generate PDF from report_data body
// ═══════════════════════════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

/**
 * GET handler — Generate PDF from a stored study in Supabase.
 *
 * Query params:
 *   id      — Study UUID (required)
 *   preview — If present, generates watermarked preview (no payment check)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const studyId = searchParams.get("id");
  const isPreview = searchParams.has("preview");

  if (!studyId) {
    return new Response(
      JSON.stringify({ error: "Missing study ID parameter" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Fetch study from Supabase
  let study;
  try {
    const supabase = getServerClient();
    const { data, error } = await supabase
      .from("studies")
      .select("*, properties(*)")
      .eq("id", studyId)
      .single();

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Study not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    study = data;
  } catch (err) {
    console.error("[pdf/route] Supabase error:", err.message);
    return new Response(
      JSON.stringify({ error: "Database error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // For full download, require payment
  if (!isPreview && study.payment_status !== "paid") {
    return new Response(
      JSON.stringify({ error: "Payment required to download the full study" }),
      { status: 402, headers: { "Content-Type": "application/json" } }
    );
  }

  // Validate report_data exists
  if (!study.report_data) {
    return new Response(
      JSON.stringify({ error: "Report data not yet generated for this study" }),
      { status: 422, headers: { "Content-Type": "application/json" } }
    );
  }

  // Generate PDF
  try {
    const { generatePDF } = await import("@/lib/pdfGenerator");
    const pdfBlob = await generatePDF(study.report_data, {
      preview: isPreview,
    });

    const buffer = await pdfBlob.arrayBuffer();
    const filename = isPreview
      ? `Abode_Cost_Seg_Preview_${study.id}.pdf`
      : `Abode_Cost_Seg_Study_${study.id}.pdf`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": isPreview
          ? "no-cache, no-store"
          : "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("[pdf/route] PDF generation error:", err.message);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}


/**
 * POST handler — Generate PDF from report_data sent in the request body.
 * Used for client-side preview generation without a stored study.
 *
 * Body: { report_data: {...}, preview?: boolean }
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { report_data, preview = true } = body;

  if (!report_data) {
    return new Response(
      JSON.stringify({ error: "report_data is required in the request body" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { generatePDF } = await import("@/lib/pdfGenerator");
    const pdfBlob = await generatePDF(report_data, { preview });

    const buffer = await pdfBlob.arrayBuffer();
    const filename = preview
      ? "Abode_Cost_Seg_Preview.pdf"
      : "Abode_Cost_Seg_Study.pdf";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.byteLength),
        "Cache-Control": "no-cache, no-store",
      },
    });
  } catch (err) {
    console.error("[pdf/route] PDF generation error:", err.message);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
