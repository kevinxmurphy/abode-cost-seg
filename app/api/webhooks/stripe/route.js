// ═══════════════════════════════════════════════════════
// POST /api/webhooks/stripe
// Handles Stripe webhook events (checkout.session.completed)
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getServerClient } from "@/lib/supabase";
import { sendPurchaseConfirmation } from "@/lib/email";
import { setStripeCustomerId } from "@/lib/db/users";
import log from "@/lib/logger";

// Disable Next.js body parsing — Stripe needs the raw body for signature verification
export const runtime = "nodejs";

export async function POST(request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // If no webhook secret configured, log and return 200 (don't block during dev)
  if (!webhookSecret) {
    log.warn("[webhook/stripe] No STRIPE_WEBHOOK_SECRET configured — skipping verification");
    return NextResponse.json({ received: true });
  }

  let event;

  try {
    const body = await request.text();
    const sig = request.headers.get("stripe-signature");

    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    log.error("[webhook/stripe] Signature verification failed:", err.message);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;

      log.info("[webhook/stripe] checkout.session.completed:", session.id);

      const propertyId = session.metadata?.propertyId;
      const userId = session.metadata?.userId;
      const db = getServerClient();

      // 1. Mark property as "purchased"
      if (propertyId && db) {
        try {
          const { error } = await db
            .from("properties")
            .update({ step: "purchased" })
            .eq("id", propertyId);

          if (error) {
            log.error("[webhook/stripe] Property step update failed:", error);
          } else {
            log.info("[webhook/stripe] Property marked as purchased:", propertyId);
          }
        } catch (dbErr) {
          log.error("[webhook/stripe] Property update error:", dbErr);
        }
      }

      // 2. Create a study record with payment info (pre-creates for the wizard to populate)
      if (userId && db) {
        try {
          const { error } = await db.from("studies").upsert(
            {
              user_id: userId,
              property_id: propertyId || null,
              status: "draft",
              payment_status: "paid",
              payment_id: session.payment_intent || session.id,
              payment_amount: session.amount_total || 48100,
              paid_at: new Date().toISOString(),
            },
            { onConflict: "property_id", ignoreDuplicates: true }
          );

          if (error) {
            log.warn("[webhook/stripe] Study record creation failed:", error.message);
          } else {
            log.info("[webhook/stripe] Study record created for property:", propertyId);
          }
        } catch (studyErr) {
          log.warn("[webhook/stripe] Study insert error:", studyErr.message);
        }
      }

      // 3. Record purchase in audit log (purchases table — optional)
      if (userId && db) {
        try {
          await db.from("purchases").insert({
            user_id: userId,
            property_id: propertyId || null,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent || null,
            amount_total: session.amount_total,
            currency: session.currency,
            customer_email: session.customer_details?.email || null,
            created_at: new Date().toISOString(),
          });
        } catch (insertErr) {
          // Table may not exist yet — log and continue
          log.warn("[webhook/stripe] Purchases audit insert skipped:", insertErr.message);
        }
      }

      // 4. Persist Stripe customer ID on the user for billing portal access
      const stripeCustomerId = session.customer;
      if (stripeCustomerId && userId) {
        await setStripeCustomerId(userId, stripeCustomerId);
      }

      // 5. Send purchase confirmation email
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
      log.info("[webhook/stripe] Unhandled event type:", event.type);
  }

  return NextResponse.json({ received: true });
}
