// Sentry server-side initialization (Node.js runtime)
// This file is loaded automatically by @sentry/nextjs on the server.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Capture all server errors — these are the ones you most need to see
  tracesSampleRate: 0.1,

  enabled: !!process.env.SENTRY_DSN,
});
