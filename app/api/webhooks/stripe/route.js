// ═══════════════════════════════════════════════════════
// POST /api/webhooks/stripe
// Handles Stripe webhook events (checkout.session.completed)
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerClient } from "@/lib/supabase";
import { sendPurchaseConfirmation } from "@/lib/email";

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const runtime = "nodejs";

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If no webhook secret configured, log and return 200 (don't block during dev)
  if (!webhookSecret) {
    console.warn("[webhook/stripe] No STRIPE_WEBHOOK_SECRET configured — skipping verification");
    return NextResponse.json({ received: true });
  }

  let event;

  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[webhook/stripe] Signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      console.log("[webhook/stripe] checkout.session.completed:", {
        sessionId: session.id,
        customerEmail: session.customer_details?.email,
        paymentStatus: session.payment_status,
        metadata: session.metadata,
      });

      // Update property status in Supabase if we have a propertyId
      const propertyId = session.metadata?.propertyId;
      const userId = session.metadata?.userId;

      if (propertyId && getServerClient()) {
        try {
          const { error } = await getServerClient()
            .from("properties")
            .update({
              step: "purchased",
              stripe_session_id: session.id,
              stripe_payment_status: session.payment_status,
              purchased_at: new Date().toISOString(),
            })
            .eq("id", propertyId);

          if (error) {
            console.error("[webhook/stripe] Supabase update failed:", error);
          } else {
            console.log("[webhook/stripe] Property updated to 'purchased':", propertyId);
          }
        } catch (dbErr) {
          console.error("[webhook/stripe] DB error:", dbErr);
        }
      }

      // Log the purchase for tracking even without a propertyId
      if (userId && getServerClient()) {
        try {
          await getServerClient().from("purchases").insert({
            user_id: userId,
            property_id: propertyId || null,
            stripe_session_id: session.id,
            stripe_payment_status: session.payment_status,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_details?.email || null,
            created_at: new Date().toISOString(),
          });
        } catch (insertErr) {
          // Table may not exist yet — that's ok, log and continue
          console.warn("[webhook/stripe] Purchases insert failed (table may not exist):", insertErr.message);
        }
      }

      // Send purchase confirmation email
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || "";
      const propertyAddress = session.metadata?.propertyAddress || "";
      if (customerEmail) {
        await sendPurchaseConfirmation({
          to: customerEmail,
          name: customerName,
          propertyAddress,
          sessionId: session.id,
        });
      }

      break;
    }

    default:
      console.log("[webhook/stripe] Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true });
}
