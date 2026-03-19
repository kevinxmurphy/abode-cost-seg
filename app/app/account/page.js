"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, CreditCard, Lock, User, Phone } from "lucide-react";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

// ─── Small helper: inline status banner ────────────────────────────────────────
function Banner({ type, message }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: "8px",
        fontSize: "13px",
        lineHeight: 1.5,
        marginBottom: "var(--space-3)",
        background: isError ? "rgba(220,53,69,0.08)" : "var(--turq-bg)",
        color: isError ? "var(--adobe)" : "var(--turq)",
        border: `1px solid ${isError ? "rgba(220,53,69,0.2)" : "var(--turq-light)"}`,
      }}
    >
      {!isError && <CheckCircle size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />}
      {message}
    </div>
  );
}

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div
      className="card"
      style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}
    >
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function AccountPage() {
  // ─── User state ────────────────────────────────────────────────────────────
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─── Profile form ──────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileBanner, setProfileBanner] = useState(null); // { type, message }

  // ─── Password form (email users only) ─────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordBanner, setPasswordBanner] = useState(null);

  // ─── Billing ───────────────────────────────────────────────────────────────
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  // ─── Load user profile ─────────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setUser(data);
          setName(data.name || "");
          setPhone(data.phone || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ─── Save profile (name + phone) ───────────────────────────────────────────
  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileBanner(null);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (data.success) {
        setProfileBanner({ type: "success", message: "Profile updated." });
        setUser((prev) => ({ ...prev, name, phone }));
      } else {
        setProfileBanner({ type: "error", message: data.error || "Update failed." });
      }
    } catch {
      setProfileBanner({ type: "error", message: "Network error. Please try again." });
    } finally {
      setProfileSaving(false);
    }
  }

  // ─── Change password ───────────────────────────────────────────────────────
  async function handlePasswordSave(e) {
    e.preventDefault();
    setPasswordBanner(null);

    if (newPassword.length < 8) {
      setPasswordBanner({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordBanner({ type: "error", message: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setPasswordBanner({ type: "success", message: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordBanner({ type: "error", message: data.error || "Password change failed." });
      }
    } catch {
      setPasswordBanner({ type: "error", message: "Network error. Please try again." });
    } finally {
      setPasswordSaving(false);
    }
  }

  // ─── Open Stripe billing portal ────────────────────────────────────────────
  async function handleManageBilling() {
    setBillingLoading(true);
    setBillingError("");

    try {
      const res = await fetch("/api/billing/portal");
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setBillingError(data.error || "Could not open billing portal.");
      }
    } catch {
      setBillingError("Network error. Please try again.");
    } finally {
      setBillingLoading(false);
    }
  }

  // ─── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: "540px" }}>
        <div className="eyebrow" style={{ marginBottom: "4px" }}>Account</div>
        <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>Settings</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dust)", fontSize: 14 }}>
          <Loader2 size={16} className="quiz-airbnb-spinner" />
          Loading your account...
        </div>
      </div>
    );
  }

  const isEmailUser = user?.auth_method === "email";

  return (
    <div style={{ maxWidth: "540px" }}>
      <div className="eyebrow" style={{ marginBottom: "4px" }}>Account</div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>Settings</h1>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <Section label={<><User size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Profile</>}>
        <Banner {...(profileBanner || {})} message={profileBanner?.message} />

        <form onSubmit={handleProfileSave}>
          <div className="field">
            <label className="label">Full Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>

          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              value={user?.email || ""}
              disabled
              style={{ background: "var(--surface)", color: "var(--dust)", cursor: "not-allowed" }}
            />
            <p style={{ fontSize: "11px", color: "var(--dust)", marginTop: "4px" }}>
              {isEmailUser
                ? "To change your email, contact support@abodecostseg.com."
                : "Managed by Google."}
            </p>
          </div>

          <div className="field">
            <label className="label">
              <Phone size={12} style={{ marginRight: 5, verticalAlign: "middle" }} />
              Phone <span style={{ color: "var(--dust)", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              className="input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={profileSaving}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            {profileSaving && <Loader2 size={14} className="quiz-airbnb-spinner" />}
            {profileSaving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Section>

      {/* ── Password (email users only) ───────────────────────────────────── */}
      {isEmailUser && (
        <Section label={<><Lock size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Password</>}>
          <Banner {...(passwordBanner || {})} message={passwordBanner?.message} />

          <form onSubmit={handlePasswordSave}>
            <div className="field">
              <label className="label">Current Password</label>
              <input
                className="input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <div className="field">
              <label className="label">New Password</label>
              <input
                className="input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8+ characters"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="field">
              <label className="label">Confirm New Password</label>
              <input
                className="input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={passwordSaving}
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              {passwordSaving && <Loader2 size={14} className="quiz-airbnb-spinner" />}
              {passwordSaving ? "Updating..." : "Update Password"}
            </button>
          </form>
        </Section>
      )}

      {/* ── Billing & Payment ─────────────────────────────────────────────── */}
      <Section label={<><CreditCard size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />Billing &amp; Payment</>}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <div
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "var(--ink)",
              marginBottom: "var(--space-1)",
            }}
          >
            Standard Plan
          </div>
          <p style={{ fontSize: "14px", color: "var(--dust)", margin: 0 }}>
            Pay per study — {STUDY_PRICE_DISPLAY} per property. No subscription.
          </p>
        </div>

        {billingError && (
          <p style={{ fontSize: 12, color: "var(--adobe)", marginBottom: "var(--space-2)" }}>
            {billingError}
          </p>
        )}

        <button
          className="btn btn-outline"
          onClick={handleManageBilling}
          disabled={billingLoading}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {billingLoading && <Loader2 size={14} className="quiz-airbnb-spinner" />}
          {billingLoading ? "Opening..." : "Manage Payment Methods"}
        </button>

        <p
          className="mono"
          style={{ fontSize: "11px", color: "var(--dust)", marginTop: "var(--space-3)", marginBottom: 0 }}
        >
          Payment methods are managed securely via Stripe. Abode never stores card details.
        </p>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <Section label="Account">
        <p style={{ fontSize: "13px", color: "var(--dust)", marginBottom: "var(--space-3)" }}>
          Need to close your account or have questions? Contact us and we&apos;ll take care of it.
        </p>
        <a
          href="mailto:support@abodecostseg.com?subject=Account%20Request"
          className="btn btn-subtle"
          style={{ fontSize: "13px" }}
        >
          Contact Support
        </a>
      </Section>
    </div>
  );
}
