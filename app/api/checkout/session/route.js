// ═══════════════════════════════════════════════════════
// POST /api/checkout/session
// Creates a Stripe Checkout session for the $481 study
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { stripe, PRICE_ID } from "@/lib/stripe";
import { getSession } from "@/lib/auth";
import log from "@/lib/logger";

export async function POST(request) {
  try {
    // Get user session (optional — guest checkout allowed)
    const session = await getSession(request);
    const userId = session?.userId || null;
    const userEmail = session?.email || null;

    // Parse request body for property context
    const body = await request.json().catch(() => ({}));
    const { propertyAddress, propertyId, cancelUrl } = body;

    // Build the checkout session
    const origin = request.headers.get("origin") || "http://localhost:3000";

    // Default cancel URL — return to the details page that triggered checkout
    const resolvedCancelUrl = cancelUrl && cancelUrl.startsWith(origin)
      ? cancelUrl
      : `${origin}/quiz/details`;

    const checkoutParams = {
      mode: "payment",
      line_items: [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ],
      // After payment: land on /checkout/success — success page reads sessionStorage for wizard params
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: resolvedCancelUrl,
      metadata: {
        userId: userId || "",
        propertyId: propertyId || "",
        propertyAddress: propertyAddress || "",
      },
      // Pre-fill email if user is logged in
      ...(userEmail && { customer_email: userEmail }),
    };

    const checkoutSession = await stripe.checkout.sessions.create(
      checkoutParams
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    log.error("[checkout/session] Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
