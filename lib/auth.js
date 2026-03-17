// ═══════════════════════════════════════════════════════
// Auth Utilities — Google OAuth + Session Management
// ═══════════════════════════════════════════════════════
// PHASE 2: Replace base64 sessions with proper JWT (jsonwebtoken)
// PHASE 2: Add refresh token rotation
// PHASE 2: Add database-backed session storage

const COOKIE_NAME = "abode_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/**
 * Verify a Google ID token using Google's tokeninfo endpoint.
 * No library needed — just a fetch call.
 *
 * @param {string} credential - The Google ID token (from one-tap or button flow)
 * @returns {Promise<{ email, name, picture, googleId } | null>}
 */
export async function verifyGoogleToken(credential) {
  if (!credential) return null;

  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );

    if (!response.ok) {
      console.error("[auth] Google token verification failed:", response.status);
      return null;
    }

    const payload = await response.json();

    // Verify the token was issued for our client ID
    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      console.error("[auth] Token audience mismatch");
      return null;
    }

    // Verify the token is not expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && Number(payload.exp) < now) {
      console.error("[auth] Token expired");
      return null;
    }

    return {
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      picture: payload.picture || null,
      googleId: payload.sub,
    };
  } catch (error) {
    console.error("[auth] Token verification error:", error.message);
    return null;
  }
}

/**
 * Create a session token from user data.
 * PHASE 2: Replace with proper JWT signing (HS256 + secret)
 *
 * @param {{ email, name, picture, googleId, userId? }} userData
 * @returns {string} Base64-encoded session token
 */
export function createSession(userData) {
  const session = {
    email: userData.email,
    name: userData.name,
    picture: userData.picture,
    googleId: userData.googleId,
    userId: userData.userId || null,   // Supabase UUID — set after DB upsert
    createdAt: new Date().toISOString(),
  };

  // PHASE 2: Sign with proper JWT — this is just base64 for now
  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  return encoded;
}

/**
 * Read and decode the session from the request cookie.
 *
 * @param {Request} request - The incoming request
 * @returns {{ email, name, picture, googleId, createdAt } | null}
 */
export function getSession(request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];

    if (!sessionToken) return null;

    // PHASE 2: Verify JWT signature here
    const decoded = Buffer.from(sessionToken, "base64url").toString("utf-8");
    const session = JSON.parse(decoded);

    // Validate session shape
    if (!session.email || !session.googleId) return null;
    // Back-compat: sessions created before userId was added will have userId: null

    // Check expiry (30 days from creation)
    const createdAt = new Date(session.createdAt).getTime();
    const maxAge = COOKIE_MAX_AGE * 1000; // convert to ms
    if (Date.now() - createdAt > maxAge) return null;

    return session;
  } catch (error) {
    console.error("[auth] Session decode error:", error.message);
    return null;
  }
}

/**
 * Build Set-Cookie header to store the session.
 *
 * @param {string} sessionToken - The encoded session token
 * @returns {string} Set-Cookie header value
 */
export function buildSessionCookie(sessionToken) {
  const parts = [
    `${COOKIE_NAME}=${sessionToken}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${COOKIE_MAX_AGE}`,
  ];

  if (IS_PRODUCTION) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

/**
 * Build Set-Cookie header to clear/expire the session.
 *
 * @returns {{ "Set-Cookie": string }} Headers object to clear the session cookie
 */
export function clearSession() {
  const parts = [
    `${COOKIE_NAME}=`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`,
  ];

  if (IS_PRODUCTION) {
    parts.push("Secure");
  }

  return { "Set-Cookie": parts.join("; ") };
}

// ─── Helpers ─────────────────────────────────────────

/**
 * Simple cookie parser (avoids needing a library).
 * @param {string} cookieHeader
 * @returns {Record<string, string>}
 */
function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;

  cookieHeader.split(";").forEach((pair) => {
    const [name, ...rest] = pair.trim().split("=");
    if (name) {
      cookies[name.trim()] = rest.join("=").trim();
    }
  });

  return cookies;
}
