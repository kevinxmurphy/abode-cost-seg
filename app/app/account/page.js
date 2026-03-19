"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

// ─── Small status banner ────────────────────────────────
function Banner({ type, message }) {
  if (!message) return null;
  const isError = type === "error";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 14px",
        borderRadius: 8,
        fontSize: 13,
        marginBottom: "var(--space-3)",
        background: isError ? "var(--adobe-bg, #fef2f2)" : "var(--turq-bg)",
        color: isError ? "var(--adobe, #dc2626)" : "var(--turq)",
        border: `1px solid ${isError ? "var(--adobe-border, #fecaca)" : "var(--turq-light)"}`,
      }}
    >
      {isError ? <AlertCircle size={14} /> : <Check size={14} />}
      {message}
    </div>
  );
}

// ─── Profile section ────────────────────────────────────
function ProfileSection({ user, onSaved }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  async function handleSave(e) {
    e.preventDefault();
    setBanner(null);
    setLoading(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", message: "Profile updated." });
        onSaved(data.user);
      } else {
        setBanner({ type: "error", message: data.error || "Update failed." });
      }
    } catch {
      setBanner({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>Profile</div>

      <Banner type={banner?.type} message={banner?.message} />

      <form onSubmit={handleSave}>
        <div className="field">
          <label className="label">Full Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="field">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="field">
          <label className="label">Phone <span style={{ color: "var(--dust)", fontWeight: 400 }}>(optional)</span></label>
          <input
            className="input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 000-0000"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={14} className="quiz-airbnb-spinner" />
              Saving...
            </span>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Change password section (email auth users only) ────
function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setBanner(null);

    if (newPassword !== confirmPassword) {
      setBanner({ type: "error", message: "New passwords don't match." });
      return;
    }
    if (newPassword.length < 8) {
      setBanner({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setBanner({ type: "success", message: "Password updated successfully." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setBanner({ type: "error", message: data.error || "Update failed." });
      }
    } catch {
      setBanner({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>Password</div>

      <Banner type={banner?.type} message={banner?.message} />

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Current Password</label>
          <input
            className="input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>
        <div className="field">
          <label className="label">New Password</label>
          <input
            className="input"
            type="password"
            placeholder="8+ characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            disabled={loading}
          />
        </div>
        <div className="field">
          <label className="label">Confirm New Password</label>
          <input
            className="input"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={14} className="quiz-airbnb-spinner" />
              Updating...
            </span>
          ) : (
            "Update Password"
          )}
        </button>
      </form>
    </div>
  );
}

// ─── Billing / plan section ─────────────────────────────
function BillingSection({ user }) {
  const [portalLoading, setPortalLoading] = useState(false);

  return (
    <div className="card" style={{ padding: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>Plan &amp; Billing</div>

      <div style={{ marginBottom: "var(--space-3)" }}>
        <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginBottom: 4 }}>
          Standard — Pay Per Study
        </div>
        <p style={{ fontSize: "14px", color: "var(--dust)" }}>
          {STUDY_PRICE_DISPLAY} per property. No subscription required.
        </p>
      </div>

      {user?.stripe_customer_id ? (
        <button
          className="btn btn-outline"
          disabled={portalLoading}
          onClick={async () => {
            setPortalLoading(true);
            try {
              const res = await fetch("/api/user/billing-portal", { method: "POST" });
              const data = await res.json();
              if (data.url) {
                window.location.href = data.url;
              }
            } catch {
              // silent — portal is best-effort
            } finally {
              setPortalLoading(false);
            }
          }}
          style={{ fontSize: 13 }}
        >
          {portalLoading ? (
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Loader2 size={13} className="quiz-airbnb-spinner" />
              Loading...
            </span>
          ) : (
            "Manage Billing"
          )}
        </button>
      ) : null}

      <p className="mono" style={{ fontSize: "10px", color: "var(--dust)", marginTop: "var(--space-3)" }}>
        Questions? Contact{" "}
        <a href="mailto:support@abodecostseg.com" style={{ color: "var(--turq)" }}>
          support@abodecostseg.com
        </a>
      </p>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────
export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) setUser(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "var(--space-5) 0", color: "var(--dust)" }}>
        <Loader2 size={18} className="quiz-airbnb-spinner" />
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ maxWidth: 480 }}>
        <div className="eyebrow" style={{ marginBottom: 4 }}>Account</div>
        <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>Account Settings</h1>
        <p style={{ color: "var(--dust)", fontSize: 14 }}>Unable to load profile. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "480px" }}>
      <div className="eyebrow" style={{ marginBottom: "4px" }}>Account</div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>Account Settings</h1>

      <ProfileSection user={user} onSaved={setUser} />

      {user.auth_provider === "email" && <ChangePasswordSection />}

      <BillingSection user={user} />
    </div>
  );
}
