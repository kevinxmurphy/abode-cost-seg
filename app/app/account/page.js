"use client";

import { MOCK_USER } from "@/lib/stubs";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

export default function AccountPage() {
  return (
    <div style={{ maxWidth: "480px" }}>
      <div className="eyebrow" style={{ marginBottom: "4px" }}>
        Account
      </div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>
        Account Settings
      </h1>

      <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
          Profile
        </div>

        <div className="field">
          <label className="label">Name</label>
          <input className="input" defaultValue={MOCK_USER.name} />
        </div>

        <div className="field">
          <label className="label">Email</label>
          <input className="input" defaultValue={MOCK_USER.email} type="email" />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => alert("Profile update coming soon (stub)")}
        >
          Save Changes
        </button>
      </div>

      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
          Plan
        </div>
        <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginBottom: "var(--space-1)" }}>
          Standard
        </div>
        <p style={{ fontSize: "14px", color: "var(--dust)", marginBottom: "var(--space-3)" }}>
          Pay per study. {STUDY_PRICE_DISPLAY} per property.
        </p>
        <p className="mono" style={{ fontSize: "10px", color: "var(--dust)" }}>
          {/* PHASE 2: Billing management via Stripe customer portal */}
          Need help? Contact support@abodecostseg.com
        </p>
      </div>
    </div>
  );
}
