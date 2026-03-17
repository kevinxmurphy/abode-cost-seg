// ═══════════════════════════════════════════════════════
// ABODE — Email Service (Resend)
// Sender: hello@abodecostseg.com
//
// Exports:
//   sendPurchaseConfirmation({ to, name, propertyAddress, sessionId })
//   sendStudyComplete({ to, name, propertyAddress, firstYearDeduction, dashboardUrl })
// ═══════════════════════════════════════════════════════

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = "Abode <hello@abodecostseg.com>";
const BRAND_TEAL = "#1a8c8c";
const BRAND_SAND = "#f5f0e8";

// ─── Shared HTML shell ────────────────────────────────────────────────────────
function emailShell(bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Abode Cost Segregation</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND_SAND};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${BRAND_SAND};padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / header -->
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#1a1a1a;">abode</span>
              <span style="font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;color:${BRAND_TEAL};display:block;margin-top:2px;">Cost Segregation</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 36px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
              ${bodyHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#888;line-height:1.6;">
                Abode Cost Segregation &nbsp;·&nbsp; abodecostseg.com<br />
                Questions? <a href="mailto:hello@abodecostseg.com" style="color:${BRAND_TEAL};text-decoration:none;">hello@abodecostseg.com</a>
              </p>
              <p style="margin:8px 0 0;font-size:11px;color:#aaa;">
                Abode provides cost segregation analysis tools. This is not tax advice.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Purchase Confirmation ────────────────────────────────────────────────────
/**
 * Sent immediately when Stripe webhook fires (checkout.session.completed).
 *
 * @param {{ to: string, name: string, propertyAddress: string, sessionId: string }} opts
 */
export async function sendPurchaseConfirmation({ to, name, propertyAddress, sessionId }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping purchase confirmation");
    return;
  }

  const displayName = name ? name.split(" ")[0] : "there";
  const displayAddress = propertyAddress || "your property";
  const studyUrl = `https://abodecostseg.com/quiz/study?session_id=${sessionId}&paid=1`;

  const body = `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:60px;height:60px;border-radius:50%;background:#e8f5f5;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">✓</div>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;text-align:center;letter-spacing:-0.5px;">
      Payment confirmed, ${displayName}
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#666;text-align:center;line-height:1.6;">
      Your cost segregation study for <strong style="color:#1a1a1a;">${displayAddress}</strong> is purchased and ready to generate.
    </p>

    <!-- What to expect -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border-radius:12px;padding:24px;margin-bottom:28px;">
      <tr><td>
        <p style="margin:0 0 14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;">What happens next</p>
        ${[
          ["1", "Answer a few questions about your property's materials and finishes (~5 min)"],
          ["2", "We generate your IRS-grade MACRS cost segregation study"],
          ["3", "Download your completed report — ready for your CPA"],
        ].map(([num, text]) => `
        <table cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
          <tr>
            <td style="width:28px;vertical-align:top;">
              <div style="width:22px;height:22px;border-radius:50%;background:${BRAND_TEAL};color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">${num}</div>
            </td>
            <td style="padding-left:10px;font-size:14px;color:#444;line-height:1.5;">${text}</td>
          </tr>
        </table>`).join("")}
      </td></tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${studyUrl}"
         style="display:inline-block;background:${BRAND_TEAL};color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:99px;letter-spacing:0.01em;">
        Start Your Study →
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#999;text-align:center;line-height:1.6;">
      Takes about 5 minutes. Your report will be available to download immediately after completion.<br />
      A Stripe receipt has been sent separately. 90-day refund policy applies.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Your cost seg study is purchased — let's get started`,
      html: emailShell(body),
    });

    if (error) {
      console.error("[email] sendPurchaseConfirmation failed:", error);
    } else {
      console.log("[email] Purchase confirmation sent:", data?.id, "→", to);
    }
  } catch (err) {
    console.error("[email] sendPurchaseConfirmation threw:", err.message);
  }
}

// ─── Study Complete ───────────────────────────────────────────────────────────
/**
 * Sent when the study wizard completes and the report is generated.
 *
 * @param {{ to: string, name: string, propertyAddress: string, firstYearDeduction: number, taxSavings: number, totalComponents: number }} opts
 */
export async function sendStudyComplete({ to, name, propertyAddress, firstYearDeduction, taxSavings, totalComponents }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping study complete");
    return;
  }

  const displayName = name ? name.split(" ")[0] : "there";
  const displayAddress = propertyAddress || "your property";
  const dashboardUrl = "https://abodecostseg.com/app/dashboard";

  const fmt = (n) => n?.toLocaleString?.() ?? "—";

  const body = `
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:28px;">
      <div style="width:60px;height:60px;border-radius:50%;background:#e8f5f5;display:inline-flex;align-items:center;justify-content:center;font-size:28px;">📄</div>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1a1a;text-align:center;letter-spacing:-0.5px;">
      Your study is ready, ${displayName}
    </h1>
    <p style="margin:0 0 28px;font-size:15px;color:#666;text-align:center;line-height:1.6;">
      Your IRS-grade cost segregation study for <strong style="color:#1a1a1a;">${displayAddress}</strong> has been generated.
    </p>

    <!-- Key numbers -->
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f4;border-radius:12px;padding:24px;margin-bottom:28px;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#888;">Your results</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="50%" style="padding-bottom:16px;">
              <div style="font-size:11px;color:#888;margin-bottom:3px;">Year 1 Deduction</div>
              <div style="font-size:22px;font-weight:800;color:${BRAND_TEAL};">$${fmt(firstYearDeduction)}</div>
            </td>
            <td width="50%" style="padding-bottom:16px;">
              <div style="font-size:11px;color:#888;margin-bottom:3px;">Est. Tax Savings</div>
              <div style="font-size:22px;font-weight:800;color:#1a1a1a;">$${fmt(taxSavings)}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <div style="font-size:11px;color:#888;margin-bottom:3px;">Components Classified</div>
              <div style="font-size:18px;font-weight:700;color:#1a1a1a;">${totalComponents ?? "—"} asset categories</div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${dashboardUrl}"
         style="display:inline-block;background:${BRAND_TEAL};color:#fff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;border-radius:99px;letter-spacing:0.01em;">
        View &amp; Download Your Study →
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:#999;text-align:center;line-height:1.6;">
      Your report is saved to your dashboard and ready to share with your CPA.<br />
      Questions about your results? Reply to this email.
    </p>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject: `Your cost segregation study is ready — $${fmt(firstYearDeduction)} deduction`,
      html: emailShell(body),
    });

    if (error) {
      console.error("[email] sendStudyComplete failed:", error);
    } else {
      console.log("[email] Study complete email sent:", data?.id, "→", to);
    }
  } catch (err) {
    console.error("[email] sendStudyComplete threw:", err.message);
  }
}
