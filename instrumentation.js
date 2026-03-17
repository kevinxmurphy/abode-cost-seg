// Next.js 14 instrumentation hook — initializes Sentry on the server.
// This file is picked up automatically by Next.js when
// `experimental.instrumentationHook` is enabled in next.config.mjs.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}
