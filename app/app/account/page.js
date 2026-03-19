"use client";

import { useState, useEffect } from "react";
import { Loader2, Receipt, CheckCircle2, Clock } from "lucide-react";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function fmtCents(cents) {
  if (!cents) return STUDY_PRICE_DISPLAY; // fallback
  return "$" + (cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function AccountPage() {
  const [user,         setUser]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [transactions, setTransactions] = useState(null); // null = not loaded
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/auth/session");
        if (!res.ok || cancelled) return;
        const { user: u } = await res.json();
        if (!u || cancelled) return;
        setUser(u);
        setName(u.name || "");
        setEmail(u.email || "");

        // Load billing
        const billingRes = await fetch("/api/billing");
        if (!cancelled && billingRes.ok) {
          const { transactions: t } = await billingRes.json();
          setTransactions(t || []);
        }
      } catch { /* silent */ } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      // PHASE 2: Real profile update via /api/user/profile
      await new Promise((r) => setTimeout(r, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--dust)", marginTop: "var(--space-8)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Loading account…</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 520 }}>
      <div className="eyebrow" style={{ marginBottom: 4 }}>My Account</div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>Settings</h1>

      {/* ── Profile ── */}
      <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>Profile</div>

        <div className="field">
          <label className="label">Name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="field">
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          className="btn btn-primary btn-sm"
          onClick={handleSave}
          disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          {saving
            ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</>
            : saved
              ? <><CheckCircle2 size={14} /> Saved</>
              : "Save Changes"
          }
        </button>
      </div>

      {/* ── Plan ── */}
      <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>Plan</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 4 }}>
          Pay-per-study
        </div>
        <p style={{ fontSize: 13, color: "var(--dust)", margin: "0 0 var(--space-2)", lineHeight: 1.5 }}>
          {STUDY_PRICE_DISPLAY} per property · No subscription · Cancel anytime within 90 days.
        </p>
        <a
          href="mailto:hello@abodecostseg.com?subject=Refund request"
          style={{ fontSize: 13, color: "var(--turq)", textDecoration: "none" }}
        >
          Refund request or billing question →
        </a>
      </div>

      {/* ── Order History ── */}
      <div className="card" style={{ padding: "var(--space-4)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>Order History</div>

        {transactions === null && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dust)", fontSize: 13 }}>
            <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
            Loading…
          </div>
        )}

        {transactions !== null && transactions.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--dust)", margin: 0 }}>
            No orders yet.{" "}
            <a href="/quiz" style={{ color: "var(--turq)", textDecoration: "none" }}>
              Start your first estimate →
            </a>
          </p>
        )}

        {transactions !== null && transactions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {transactions.map((tx, i) => (
              <div
                key={tx.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-2)",
                  padding: "12px 0",
                  borderBottom: i < transactions.length - 1 ? "1px solid var(--border)" : "none",
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 32, height: 32, borderRadius: "var(--radius-sm)",
                  background: tx.status === "complete" ? "var(--turq-bg)" : "var(--surface)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {tx.status === "complete"
                    ? <Receipt size={14} style={{ color: "var(--turq)" }} />
                    : <Clock size={14} style={{ color: "var(--dust)" }} />
                  }
                </div>

                {/* Details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {tx.address}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "var(--dust)", marginTop: 2 }}>
                    {tx.study_type === "catch-up" ? "Catch-Up Study" : "Cost Seg Study"}
                    {tx.paid_at ? ` · ${formatDate(tx.paid_at)}` : ""}
                  </div>
                </div>

                {/* Amount */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                    {fmtCents(tx.amount)}
                  </div>
                  <div
                    className="mono"
                    style={{ fontSize: 10, color: tx.status === "complete" ? "var(--turq)" : "var(--dust)", marginTop: 2 }}
                  >
                    {tx.status === "complete" ? "COMPLETE" : tx.status?.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="mono" style={{ fontSize: 10, color: "var(--dust)", marginTop: "var(--space-2)", marginBottom: 0, lineHeight: 1.5 }}>
          Stripe receipts are sent to your email at time of purchase.
          For a copy, contact{" "}
          <a href="mailto:hello@abodecostseg.com" style={{ color: "var(--turq)" }}>hello@abodecostseg.com</a>.
        </p>
      </div>
    </div>
  );
}
