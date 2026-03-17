// STUB: Replace console.log with email service (Resend / SendGrid / Loops) before go-live.
// Current recipient: kevinxmurphy@gmail.com — PRE-PRODUCTION ONLY. Change before launch.

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

    // STUB: Send email notification
    // Example with Resend (add `npm install resend` + RESEND_API_KEY env var):
    //
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'Abby <no-reply@abodecostseg.com>',
    //   to: 'kevinxmurphy@gmail.com',   // ← change before go-live
    //   subject: `[Abby Contact] ${submission.category} — ${submission.name}`,
    //   text: `
    //     Name: ${submission.name}
    //     Email: ${submission.email}
    //     Phone: ${submission.phone || 'not provided'}
    //     SMS Consent: ${submission.smsConsent ?? 'n/a'}
    //     Category: ${submission.category}
    //     Message: ${submission.message}
    //     Submitted: ${submission.timestamp}
    //   `,
    // });

    // Log to server console (visible in dev + deployment logs)
    console.log('[Abby Escalation]', JSON.stringify(submission, null, 2));

    return Response.json({ success: true });

  } catch (err) {
    console.error('[Abby] Escalation error:', err?.message ?? err);
    return Response.json(
      { error: 'Something went wrong. Please email support@abodecostseg.com directly.' },
      { status: 500 }
    );
  }
}
