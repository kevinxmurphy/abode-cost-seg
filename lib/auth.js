// ═══════════════════════════════════════════════════════
// Auth Utilities — Google OAuth + Email/Password + Sessions
// ═══════════════════════════════════════════════════════

import { scryptSync, randomBytes, timingSafeEqual, createHash } from "crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;


const COOKIE_NAME = "abode_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ─── Password Hashing ─────────────────────────────────

/**
 * Hash a plaintext password using scrypt.
 * Returns "salt:hash" format string.
 *
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against a stored "salt:hash" string.
 *
 * @param {string} password - plaintext input
 * @param {string} stored - "salt:hash" from DB
 * @returns {boolean}
 */
export function verifyPassword(password, stored) {
  try {
    const [salt, hash] = stored.split(":");
    if (!salt || !hash) return false;
    const verify = scryptSync(password, salt, 64);
    return timingSafeEqual(Buffer.from(hash, "hex"), verify);
  } catch {
    return false;
  }
}

/**
 * Generate a secure random reset token. Returns the raw token (for the email link)
 * and its SHA-256 hash (for DB storage).
 *
 * @returns {{ token: string, tokenHash: string }}
 */
export function generateResetToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return { token, tokenHash };
}

/**
 * Hash a submitted reset token for DB lookup comparison.
 *
 * @param {string} token
 * @returns {string}
 */
export function hashResetToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

// ─── Google OAuth ─────────────────────────────────────

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

// ─── Session Management ───────────────────────────────

/**
 * Create a session token from user data.
 * Works for both Google OAuth and email/password users.
 * Uses HS256 JWT when JWT_SECRET is set, falls back to base64 for local dev.
 *
 * @param {{ email, name, picture?, googleId?, userId?, authProvider? }} userData
 * @returns {string} Signed JWT or base64-encoded session token
 */
export function createSession(userData) {
  const payload = {
    email: userData.email,
    name: userData.name,
    picture: userData.picture || null,
    googleId: userData.googleId || null,
    userId: userData.userId || null,
    authProvider: userData.authProvider || "google",
  };

  if (JWT_SECRET) {
    return jwt.sign(payload, JWT_SECRET, {
      algorithm: "HS256",
      expiresIn: COOKIE_MAX_AGE,
    });
  }

  // Fallback for local dev without JWT_SECRET
  payload.createdAt = new Date().toISOString();
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Read and decode the session from the request cookie.
 * Supports both Google OAuth and email/password sessions.
 * Verifies JWT signature when JWT_SECRET is set; falls back to base64.
 *
 * @param {Request} request - The incoming request
 * @returns {{ email, name, picture, googleId, userId, authProvider } | null}
 */
export function getSession(request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];

    if (!sessionToken) return null;

    // Try JWT verification first
    if (JWT_SECRET) {
      try {
        const session = jwt.verify(sessionToken, JWT_SECRET, { algorithms: ["HS256"] });
        if (!session.email) return null;
        return session;
      } catch {
        // Token might be a legacy base64 token — try fallback
      }
    }

    // Fallback: base64 decode (legacy or local dev)
    const decoded = Buffer.from(sessionToken, "base64url").toString("utf-8");
    const session = JSON.parse(decoded);

    if (!session.email) return null;

    // Check expiry (30 days from creation) for legacy tokens
    if (session.createdAt) {
      const createdAt = new Date(session.createdAt).getTime();
      const maxAge = COOKIE_MAX_AGE * 1000;
      if (Date.now() - createdAt > maxAge) return null;
    }

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
