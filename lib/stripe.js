// ═══════════════════════════════════════════════════════
// ABODE — Stripe helpers
// Server-side: initialized Stripe instance
// Client-side: loadStripe helper
// ═══════════════════════════════════════════════════════

import Stripe from "stripe";

// Server-side Stripe instance (used in API routes only)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-12-18.acacia",
});

// Price ID from Stripe dashboard — $481 one-time
export const PRICE_ID = "price_1TBjGFCym8zeLTTQ0Dkvi1Aa";
