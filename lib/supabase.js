// ═══════════════════════════════════════════════════════
// ABODE — Supabase Client
//
// Two clients:
//   getServerClient() — Uses service role key. Server-side only (API routes).
//                       Bypasses Row Level Security. Never expose to browser.
//   getBrowserClient() — Uses anon key. Safe for client components.
//                        Respects Row Level Security.
// ═══════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

// ─── Server client (service role) ────────────────────
// Singleton — one instance per Node.js process.
// Only used in API routes and server actions.

let _serverClient = null;

export function getServerClient() {
  // Read env vars at call time (not module load time) so the build doesn't crash
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set — DB calls will be skipped");
    return null;
  }
  if (!_serverClient) {
    _serverClient = createClient(url, key, {
      auth: { persistSession: false },
    });
  }
  return _serverClient;
}

// ─── Browser client (anon key) ───────────────────────
// Singleton — one instance per browser tab.
// Safe to use in React client components.

let _browserClient = null;

export function getBrowserClient() {
  if (typeof window === "undefined") {
    console.warn("[supabase] getBrowserClient() called server-side. Use getServerClient() in API routes.");
    return null;
  }
  // Read env vars at call time — NEXT_PUBLIC_ vars are inlined by Next.js at build time
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    console.warn("[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set");
    return null;
  }
  if (!_browserClient) {
    _browserClient = createClient(url, anonKey);
  }
  return _browserClient;
}
