// ═══════════════════════════════════════════════════════
// ABODE — Analytics Helper
// Shared tracking calls — wraps PostHog for funnel events.
// Safe to call server-side (no-ops gracefully).
// ═══════════════════════════════════════════════════════

/**
 * Track a custom event via PostHog.
 * @param {string} event - Event name (e.g. "quiz_started")
 * @param {object} [props] - Optional properties
 */
export function track(event, props = {}) {
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.capture(event, props);
  }
}

/**
 * Identify a user in PostHog (call on auth).
 * @param {string} userId - Supabase UUID
 * @param {{ email?: string, name?: string }} [traits]
 */
export function identify(userId, traits = {}) {
  if (typeof window !== "undefined" && window.posthog) {
    window.posthog.identify(userId, traits);
  }
}

// ─── Core Funnel Events ─────────────────────────────────

export const trackQuizStarted = () => track("quiz_started");

export const trackQuizCompleted = (props = {}) =>
  track("quiz_completed", props);

export const trackResultsViewed = (props = {}) =>
  track("results_viewed", props);

export const trackGateShown = () => track("gate_shown");

export const trackGateConverted = (method = "email") =>
  track("gate_converted", { method });

export const trackEmailCaptured = (source = "unknown") =>
  track("email_captured", { source });

export const trackCheckoutInitiated = (props = {}) =>
  track("checkout_initiated", props);

export const trackPurchaseCompleted = (props = {}) =>
  track("purchase_completed", props);

export const trackStudyWizardStarted = () => track("study_wizard_started");

export const trackStudyWizardCompleted = () => track("study_wizard_completed");
