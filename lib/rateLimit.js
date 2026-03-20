// ═══════════════════════════════════════════════════════
// In-memory rate limiter for Vercel serverless
// ═══════════════════════════════════════════════════════
// Uses a sliding window counter keyed by IP.
// Memory is per-instance, so this is best-effort on serverless.
// For strict enforcement, upgrade to Vercel KV or Upstash Redis.

const stores = new Map();

/**
 * Create a rate limiter with the given options.
 *
 * @param {{ windowMs?: number, max?: number }} opts
 * @returns {(request: Request) => { limited: boolean, remaining: number }}
 */
export function rateLimit({ windowMs = 60_000, max = 20 } = {}) {
  const key = `${windowMs}:${max}`;
  if (!stores.has(key)) stores.set(key, new Map());
  const store = stores.get(key);

  return function check(request) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const now = Date.now();
    const record = store.get(ip);

    if (!record || now - record.start > windowMs) {
      store.set(ip, { start: now, count: 1 });
      return { limited: false, remaining: max - 1 };
    }

    record.count += 1;

    if (record.count > max) {
      return { limited: true, remaining: 0 };
    }

    return { limited: false, remaining: max - record.count };
  };
}

/**
 * NextResponse 429 helper.
 */
export function tooManyRequests() {
  const { NextResponse } = require("next/server");
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": "60" } }
  );
}
