// Sentry client-side initialization (browser)
// This file is loaded automatically by @sentry/nextjs when the app loads in the browser.

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 10% of transactions sampled for performance monitoring
  // Increase to 1.0 if you need full traces during debugging
  tracesSampleRate: 0.1,

  // Disable only if DSN is not set (prevents silent no-ops)
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Show a dialog asking the user for feedback when an error occurs
  // (optional — remove if you don't want this)
  // beforeSend(event) { return event; },

  integrations: [
    Sentry.replayIntegration({
      // Capture 5% of all sessions, 100% of sessions with errors
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Capture 5% of sessions, 100% on errors
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,
});
