// ═══════════════════════════════════════════════════════
// Auth Middleware — Protects /app/* routes
// Redirects unauthenticated users to /login
// ═══════════════════════════════════════════════════════

import { NextResponse } from "next/server";

export function middleware(request) {
  const cookie = request.cookies.get("abode_session");

  if (!cookie) {
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
