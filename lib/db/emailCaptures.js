// ═══════════════════════════════════════════════════════
// ABODE — Email Capture DB Operations
// Server-side only. Uses service role client.
// ═══════════════════════════════════════════════════════

import { getServerClient } from "@/lib/supabase";

/**
 * Save an email capture (quiz gate, newsletter, etc.)
 *
 * @param {{ email, source, propertyAddress?, quizData? }} capture
 * @returns {Promise<boolean>}
 */
export async function captureEmail({ email, source, propertyAddress, quizData }) {
  if (!email) return false;

  const db = getServerClient();

  const { error } = await db.from("email_captures").insert({
    email: email.toLowerCase().trim(),
    source: source || "unknown",
    property_address: propertyAddress || null,
    quiz_data: quizData || null,
  });

  if (error) {
    // Silently swallow duplicate inserts
    if (!error.message?.includes("duplicate")) {
      console.error("[db/emailCaptures] captureEmail error:", error.message);
    }
    return false;
  }

  return true;
}

/**
 * Save a contact form submission.
 *
 * @param {{ name?, email, phone?, message?, source? }} submission
 * @returns {Promise<boolean>}
 */
export async function saveContactSubmission({ name, email, phone, message, source }) {
  if (!email) return false;

  const db = getServerClient();

  const { error } = await db.from("contact_submissions").insert({
    name: name || null,
    email: email.toLowerCase().trim(),
    phone: phone || null,
    message: message || null,
    source: source || "contact-page",
  });

  if (error) {
    console.error("[db/emailCaptures] saveContactSubmission error:", error.message);
    return false;
  }

  return true;
}
