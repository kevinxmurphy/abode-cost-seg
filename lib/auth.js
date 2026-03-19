// ═══════════════════════════════════════════════════════
// Auth Utilities — Google OAuth + Email/Password + Session Management
// ═══════════════════════════════════════════════════════

import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const COOKIE_NAME = "abode_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// ─── Password Hashing (PBKDF2 — no external dependency) ──────────────────────

/**
 * Hash a plain-text password using PBKDF2-SHA512.
 * Returns a "salt:hash" string for storage.
 *
 * @param {string} password
 * @returns {string}
 */
export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain-text password against a stored "salt:hash" string.
 * Uses timing-safe comparison to prevent timing attacks.
 *
 * @param {string} password - Plain-text candidate
 * @param {string} stored - "salt:hash" from the database
 * @returns {boolean}
 */
export function verifyPassword(password, stored) {
  try {
    const [salt, storedHash] = stored.split(":");
    if (!salt || !storedHash) return false;
    const candidateHash = pbkdf2Sync(password, salt, 100_000, 64, "sha512").toString("hex");
    // timingSafeEqual requires same-length buffers
    const a = Buffer.from(candidateHash, "hex");
    const b = Buffer.from(storedHash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Generate a secure random reset token (hex string).
 * @returns {{ token: string, expires: Date }}
 */
export function generateResetToken() {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  return { token, expires };
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * Verify a Google ID token using Google's tokeninfo endpoint.
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

    const expectedClientId = process.env.GOOGLE_CLIENT_ID;
    if (expectedClientId && payload.aud !== expectedClientId) {
      console.error("[auth] Token audience mismatch");
      return null;
    }

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

// ─── Session Management ───────────────────────────────────────────────────────

/**
 * Create a session token from user data.
 * Works for both Google and email/password users.
 *
 * @param {{ email, name, picture?, googleId?, userId?, authMethod? }} userData
 * @returns {string} Base64-encoded session token
 */
export function createSession(userData) {
  const session = {
    email: userData.email,
    name: userData.name,
    picture: userData.picture || null,
    googleId: userData.googleId || null,
    userId: userData.userId || null,
    authMethod: userData.authMethod || "google",
    createdAt: new Date().toISOString(),
  };

  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

/**
 * Read and decode the session from the request cookie.
 * Supports both Google and email/password sessions.
 *
 * @param {Request} request - The incoming request
 * @returns {object | null}
 */
export function getSession(request) {
  try {
    const cookieHeader = request.headers.get("cookie") || "";
    const cookies = parseCookies(cookieHeader);
    const sessionToken = cookies[COOKIE_NAME];

    if (!sessionToken) return null;

    const decoded = Buffer.from(sessionToken, "base64url").toString("utf-8");
    const session = JSON.parse(decoded);

    // Must have an email at minimum
    if (!session.email) return null;

    // Back-compat: old sessions may not have authMethod
    if (!session.authMethod) {
      session.authMethod = session.googleId ? "google" : "email";
    }

    // Check expiry (30 days from creation)
    const createdAt = new Date(session.createdAt).getTime();
    const maxAge = COOKIE_MAX_AGE * 1000;
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
 * @returns {{ "Set-Cookie": string }}
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
