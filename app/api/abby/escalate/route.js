import { Resend } from "resend";
import log from "@/lib/logger";

const ESCALATION_TO = process.env.ESCALATION_EMAIL || "hello@abodecostseg.com";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, category, message, smsConsent } = body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return Response.json(
        { error: 'Name, email, and message are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const submission = {
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone?.trim() || null,
      category: category || 'General',
      message: message.trim(),
      smsConsent: phone?.trim() ? !!smsConsent : null,
    };

    // Always log for audit trail
    log.info('[Abby Escalation]', JSON.stringify(submission, null, 2));

    // Send email via Resend
    const resend = getResend();
    if (resend) {
      const { error } = await resend.emails.send({
        from: 'Abby <hello@abodecostseg.com>',
        to: ESCALATION_TO,
        replyTo: submission.email,
        subject: `[Abby Contact] ${submission.category} — ${submission.name}`,
        text: [
          `Name: ${submission.name}`,
          `Email: ${submission.email}`,
          `Phone: ${submission.phone || 'not provided'}`,
          `SMS Consent: ${submission.smsConsent ?? 'n/a'}`,
          `Category: ${submission.category}`,
          ``,
          `Message:`,
          submission.message,
          ``,
          `Submitted: ${submission.timestamp}`,
        ].join('\n'),
      });

      if (error) {
        log.error('[Abby] Resend error:', error);
      } else {
        log.info('[Abby] Escalation email sent to', ESCALATION_TO);
      }
    } else {
      log.warn('[Abby] RESEND_API_KEY not set — email not sent');
    }

    return Response.json({ success: true });

  } catch (err) {
    log.error('[Abby] Escalation error:', err?.message ?? err);
    return Response.json(
      { error: 'Something went wrong. Please email support@abodecostseg.com directly.' },
      { status: 500 }
    );
  }
}
