// ═══════════════════════════════════════════════════════
// GET /api/billing/portal — Create a Stripe Customer Portal session
// ═══════════════════════════════════════════════════════
// Finds or creates a Stripe Customer for the authenticated user,
// then returns a short-lived billing portal URL.
//
// The portal must be configured in the Stripe Dashboard to enable
// payment method management (Billing → Customer Portal → Settings).

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db/users";
import { getStripe } from "@/lib/stripe";

const RETURN_URL =
  process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/app/account`
    : "https://abodecostseg.com/app/account";

export async function GET(request) {
  try {
    const session = getSession(request);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const stripe = getStripe();
    let stripeCustomerId = user.stripe_customer_id;

    // Create Stripe customer if they don't have one yet
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: { abode_user_id: user.id },
      });
      stripeCustomerId = customer.id;
      await updateUser(user.id, { stripe_customer_id: stripeCustomerId });
    }

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: RETURN_URL,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("[billing/portal] Error:", error.message);

    // Stripe portal not configured in dashboard
    if (error.message?.includes("No configuration was found")) {
      return NextResponse.json(
        { error: "Billing portal is not configured yet. Please contact support@abodecostseg.com." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: "Could not open billing portal." }, { status: 500 });
  }
}
