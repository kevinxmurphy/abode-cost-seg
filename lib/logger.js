// ═══════════════════════════════════════════════════════
// ABODE — Lightweight server logger
// Suppresses debug/info logs in production.
// Errors and warnings always log.
// ═══════════════════════════════════════════════════════

const isDev = process.env.NODE_ENV !== "production";

const logger = {
  info: (...args) => isDev && console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};

export default logger;
