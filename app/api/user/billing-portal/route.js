// ═══════════════════════════════════════════════════════
// POST /api/user/billing-portal
// Creates a Stripe Customer Portal session so the user
// can view receipts, payment methods, etc.
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { getUserById } from "@/lib/db/users";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    const session = await getSession(request);
    if (!session?.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await getUserById(session.userId);
    if (!user?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No billing history found for this account." },
        { status: 404 }
      );
    }

    const origin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://www.abodecostseg.com";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${origin}/app/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    log.error("[user/billing-portal] Error:", err.message);
    return NextResponse.json(
      { error: "Failed to open billing portal." },
      { status: 500 }
    );
  }
}
