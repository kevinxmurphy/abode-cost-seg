// ═══════════════════════════════════════════════════════
// ABODE — Stripe helpers
// Server-side: initialized Stripe instance
// Client-side: loadStripe helper
// ═══════════════════════════════════════════════════════

import Stripe from "stripe";

// Server-side Stripe instance (used in API routes only)
// Lazy-initialized to avoid crashing the build when STRIPE_SECRET_KEY is not set.
let _stripe = null;

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error("[stripe] STRIPE_SECRET_KEY is not configured");
    }
    _stripe = new Stripe(key, { apiVersion: "2024-12-18.acacia" });
  }
  return _stripe;
}

// Backwards-compat: keep named export but lazy-resolve via getter
// so module evaluation doesn't throw when the key is missing.
export const stripe = new Proxy(
  {},
  {
    get(_target, prop) {
      return getStripe()[prop];
    },
  }
);

// Price ID from Stripe dashboard — $481 one-time
export const PRICE_ID = "price_1TBjGFCym8zeLTTQ0Dkvi1Aa";
