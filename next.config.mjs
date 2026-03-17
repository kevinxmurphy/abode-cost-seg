// @ts-check
import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable the instrumentation hook so Sentry initializes on server startup
  experimental: {
    instrumentationHook: true,
  },

  // ─── Security Headers ────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Prevent MIME-type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Control referrer info sent with requests
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
          // Restrict browser features
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
          },
          // Force HTTPS for 2 years (only active on HTTPS, Vercel handles this)
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // DNS prefetch for performance
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

// ─── Sentry Config ───────────────────────────────────────────────────────────
// These options are passed to @sentry/nextjs's build-time Webpack plugin.
// They do NOT affect runtime behaviour — runtime config lives in sentry.*.config.js.
export default withSentryConfig(nextConfig, {
  // Sentry project org + project slugs (from sentry.io → Settings → Projects)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps (set in Vercel env vars as SENTRY_AUTH_TOKEN)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps in production builds so stack traces are readable
  silent: true, // suppress CLI output during build
  widenClientFileUpload: true,

  // Avoid Sentry wrapping every server component — keeps bundle size down
  webpack: {
    automaticVercelMonitors: false,
    treeshake: {
      // Tree-shake Sentry logger statements in production builds
      removeDebugLogging: true,
    },
  },
});
