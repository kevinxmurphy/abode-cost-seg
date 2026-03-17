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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ─── Server client (service role) ────────────────────
// Singleton — one instance per Node.js process.
// Only used in API routes and server actions.

let _serverClient = null;

export function getServerClient() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local"
    );
  }
  if (!_serverClient) {
    _serverClient = createClient(supabaseUrl, supabaseServiceKey, {
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
    throw new Error(
      "[supabase] getBrowserClient() called server-side. Use getServerClient() in API routes."
    );
  }
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[supabase] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
    );
  }
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _browserClient;
}
