"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  Download,
  Mail,
  Trash2,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Building2,
  X,
  ChevronRight,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (!n) return "$0";
  return "$" + Math.round(n).toLocaleString("en-US");
}

/** Derive a simple 4-state UI status from property DB fields */
function getUIState(property) {
  const status = property.study_status || property.studyStatus || "estimate";
  const step = property.step || "results";
  if (status === "complete") return "complete";
  if (status === "processing") return "processing";
  if (step === "details") return "refined"; // went through Tier 2
  return "estimate";
}

const STATE_BADGE = {
  estimate:   { label: "Estimate",   variant: "dust" },
  refined:    { label: "Estimate",   variant: "dust" },
  processing: { label: "Generating", variant: "adobe" },
  complete:   { label: "Complete",   variant: "turq" },
};

const FILTER_LABELS = {
  all:        "All",
  estimate:   "Estimate",
  processing: "Generating",
  complete:   "Complete",
};

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function PropertiesPage() {
  const [user, setUser]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [properties, setProperties]   = useState([]);
  const [filter, setFilter]           = useState("all");
  const [deletingId, setDeletingId]   = useState(null); // id → confirm pending
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [shareStudy, setShareStudy]   = useState(null); // { studyId, address, deduction, savings }

  // ── Load ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok || cancelled) return;
        const { user: u } = await sessionRes.json();
        if (!u || cancelled) return;
        setUser(u);

        const propsRes = await fetch("/api/properties");
        if (!cancelled && propsRes.ok) {
          const { properties: p } = await propsRes.json();
          setProperties(p || []);
        }
      } catch { /* silent */ } finally {
        if (!cancelled) { setAuthChecked(true); setLoading(false); }
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/properties/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p.id !== id));
      }
    } catch { /* silent */ } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = properties.filter((p) => {
    if (filter === "all") return true;
    const s = getUIState(p);
    if (filter === "estimate") return s === "estimate" || s === "refined";
    return s === filter;
  });

  const counts = properties.reduce((acc, p) => {
    const s = getUIState(p);
    acc[s] = (acc[s] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, { all: 0 });

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--dust)", marginTop: "var(--space-8)" }}>
        <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
        <span style={{ fontSize: 14 }}>Loading properties…</span>
      </div>
    );
  }

  if (authChecked && !user) {
    return <SignInPrompt />;
  }

  return (
    <div style={{ maxWidth: 720 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 4 }}>My Account</div>
          <h1 className="h2-section">Properties</h1>
        </div>
        <Link href="/quiz" className="btn btn-primary btn-sm">
          <Plus size={16} />
          Add Property
        </Link>
      </div>

      {/* ── Filter tabs ── */}
      {properties.length > 0 && (
        <div style={{ display: "flex", gap: 8, marginBottom: "var(--space-3)", flexWrap: "wrap" }}>
          {["all", "estimate", "processing", "complete"].map((f) => {
            const count = f === "estimate"
              ? (counts.estimate || 0) + (counts.refined || 0)
              : counts[f] || 0;
            const active = filter === f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "var(--radius-pill)",
                  border: active ? "1.5px solid var(--turq)" : "1.5px solid var(--border-strong)",
                  background: active ? "var(--turq-bg)" : "transparent",
                  color: active ? "var(--turq)" : "var(--dust)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all 150ms",
                  fontFamily: "var(--font-primary)",
                }}
              >
                {FILTER_LABELS[f]}
                {count > 0 && (
                  <span style={{
                    background: active ? "var(--turq)" : "var(--surface-2)",
                    color: active ? "#fff" : "var(--dust)",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "1px 7px",
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Property list ── */}
      {filtered.length === 0 && properties.length === 0 ? (
        <EmptyState />
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: "var(--space-4)", textAlign: "center", color: "var(--dust)", fontSize: 14 }}>
          No properties match this filter.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {filtered.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              deletingId={deletingId}
              deleteLoading={deleteLoading}
              onDeleteRequest={setDeletingId}
              onDeleteConfirm={handleDelete}
              onDeleteCancel={() => setDeletingId(null)}
              onShareCPA={setShareStudy}
            />
          ))}
        </div>
      )}

      {/* ── CPA Share Modal ── */}
      {shareStudy && (
        <CPAShareModal
          study={shareStudy}
          onClose={() => setShareStudy(null)}
        />
      )}
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Property Card
// ═══════════════════════════════════════════════════════════════════════════════

function PropertyCard({ property, deletingId, deleteLoading, onDeleteRequest, onDeleteConfirm, onDeleteCancel, onShareCPA }) {
  const uiState = getUIState(property);
  const badge   = STATE_BADGE[uiState];

  // Normalise snake_case DB fields vs camelCase mock fields
  const address      = property.airbnb_title || property.airbnbTitle || property.address || "Property";
  const fullAddress  = [property.address, property.city, property.state].filter(Boolean).join(", ") || address;
  const price        = property.purchase_price || property.purchasePrice;
  const yearBuilt    = property.year_built || property.yearBuilt;
  const type         = property.property_type || property.propertyType;
  const studyId      = property.studyId || property.study_id;
  const deduction    = property.estimate?.first_year_deduction || property.estimate?.firstYearDeduction;
  const savings      = property.estimate?.first_year_savings || property.estimate?.firstYearSavings
    || (deduction ? Math.round(deduction * 0.32) : null);

  const isDeleting   = deletingId === property.id;
  const canDelete    = uiState !== "complete";

  // For complete cards, link to study; otherwise property detail
  const detailHref = studyId ? `/app/studies/${studyId}` : `/app/properties/${property.id}`;

  return (
    <div className="card" style={{ padding: "var(--space-3)", overflow: "hidden" }}>
      {/* ── Top row: address + badge ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", marginBottom: 8 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {address !== fullAddress ? address : fullAddress}
          </div>
          {address !== fullAddress && (
            <div style={{ fontSize: 12, color: "var(--dust)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {fullAddress}
            </div>
          )}
          <div className="mono" style={{ fontSize: 11, color: "var(--dust)", marginTop: 2 }}>
            {price ? fmt(price) : "—"}
            {type ? ` · ${type}` : ""}
            {yearBuilt ? ` · Built ${yearBuilt}` : ""}
          </div>
        </div>
        <Badge variant={badge.variant}>{badge.label}</Badge>
      </div>

      {/* ── State-specific body ── */}
      {uiState === "complete" && (
        <CompleteBody
          property={property}
          deduction={deduction}
          savings={savings}
          studyId={studyId}
          fullAddress={fullAddress}
          detailHref={detailHref}
          onShareCPA={onShareCPA}
        />
      )}

      {uiState === "processing" && (
        <ProcessingBody />
      )}

      {(uiState === "estimate" || uiState === "refined") && (
        <EstimateBody
          property={property}
          deduction={deduction}
          uiState={uiState}
          detailHref={`/app/properties/${property.id}`}
          isDeleting={isDeleting}
          deleteLoading={deleteLoading}
          canDelete={canDelete}
          onDeleteRequest={onDeleteRequest}
          onDeleteConfirm={onDeleteConfirm}
          onDeleteCancel={onDeleteCancel}
        />
      )}
    </div>
  );
}


// ─── Complete State ───────────────────────────────────────────────────────────

function CompleteBody({ property, deduction, savings, studyId, fullAddress, detailHref, onShareCPA }) {
  return (
    <>
      {/* Key numbers */}
      {deduction && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: "var(--space-2)",
          padding: "12px 16px",
          background: "var(--turq-bg)",
          borderRadius: "var(--radius-sm)",
        }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: "var(--turq)", marginBottom: 2 }}>YEAR 1 DEDUCTION</div>
            <div className="mono-value" style={{ fontSize: 20, fontWeight: 700, color: "var(--turq)" }}>{fmt(deduction)}</div>
          </div>
          {savings && (
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--dust)", marginBottom: 2 }}>EST. TAX SAVINGS</div>
              <div className="mono-value" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{fmt(savings)}</div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Link href={detailHref} className="btn btn-primary btn-sm">
          <FileText size={14} />
          View Study
        </Link>
        {studyId && (
          <a href={`/api/study/pdf?id=${studyId}`} target="_blank" rel="noreferrer" className="btn btn-subtle btn-sm">
            <Download size={14} />
            PDF
          </a>
        )}
        {studyId && (
          <button
            className="btn btn-subtle btn-sm"
            onClick={() => onShareCPA({
              studyId,
              address: fullAddress,
              deduction: deduction || 0,
              savings: savings || 0,
            })}
          >
            <Mail size={14} />
            Send to CPA
          </button>
        )}
        <div style={{ marginLeft: "auto" }}>
          <CheckCircle2 size={16} style={{ color: "var(--turq)" }} />
        </div>
      </div>
    </>
  );
}


// ─── Processing State ─────────────────────────────────────────────────────────

function ProcessingBody() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "var(--space-2)",
      padding: "12px 16px",
      background: "var(--surface)",
      borderRadius: "var(--radius-sm)",
    }}>
      <Loader2 size={16} style={{ color: "var(--dust)", flexShrink: 0, animation: "spin 1.2s linear infinite" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)", marginBottom: 2 }}>
          Your cost seg study is being prepared
        </div>
        <div style={{ fontSize: 12, color: "var(--dust)" }}>
          We&apos;ll email you when it&apos;s ready.{" "}
          <a href="mailto:hello@abodecostseg.com" style={{ color: "var(--turq)", textDecoration: "none" }}>
            Questions?
          </a>
        </div>
      </div>
    </div>
  );
}


// ─── Estimate State ───────────────────────────────────────────────────────────

function EstimateBody({ property, deduction, uiState, detailHref, isDeleting, deleteLoading, canDelete, onDeleteRequest, onDeleteConfirm, onDeleteCancel }) {
  const conservative = property.estimate?.conservative;
  const optimistic   = property.estimate?.optimistic;

  return (
    <>
      {/* Estimate preview */}
      <div style={{
        padding: "12px 16px",
        background: "var(--surface)",
        borderRadius: "var(--radius-sm)",
        marginBottom: "var(--space-2)",
      }}>
        {deduction ? (
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
            <div>
              <div className="mono" style={{ fontSize: 10, color: "var(--dust)", marginBottom: 2 }}>EST. YEAR 1 DEDUCTION</div>
              <div className="mono-value" style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>~{fmt(deduction)}</div>
            </div>
            {conservative && optimistic && (
              <div className="mono" style={{ fontSize: 12, color: "var(--dust)", paddingBottom: 2 }}>
                {fmt(conservative)} – {fmt(optimistic)}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "var(--dust)" }}>
            Estimate not yet calculated.{" "}
            <Link href={detailHref} style={{ color: "var(--turq)", textDecoration: "none" }}>
              View details →
            </Link>
          </div>
        )}
      </div>

      {/* Actions */}
      {!isDeleting ? (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Link href={detailHref} className="btn btn-subtle btn-sm">
            <ChevronRight size={14} />
            {uiState === "refined" ? "Review Details" : "View Details"}
          </Link>
          <Link
            href={`/quiz?propertyId=${property.id}`}
            className="btn btn-subtle btn-sm"
          >
            Refine Estimate
          </Link>
          <Link
            href={`/checkout/session?propertyId=${property.id}`}
            className="btn btn-primary btn-sm"
          >
            Order Study — {STUDY_PRICE_DISPLAY}
          </Link>
          {canDelete && (
            <button
              className="btn btn-subtle btn-sm"
              style={{ marginLeft: "auto", color: "var(--dust)" }}
              onClick={() => onDeleteRequest(property.id)}
              aria-label="Delete property"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      ) : (
        /* Delete confirm row */
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          background: "#FEF2F0",
          borderRadius: "var(--radius-sm)",
          border: "1px solid var(--adobe-light)",
        }}>
          <AlertTriangle size={14} style={{ color: "var(--adobe)", flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: "var(--ink)", flex: 1 }}>Remove this property?</span>
          <button
            className="btn btn-sm"
            style={{ background: "var(--adobe)", color: "#fff", border: "none" }}
            onClick={() => onDeleteConfirm(property.id)}
            disabled={deleteLoading}
          >
            {deleteLoading ? <Loader2 size={12} style={{ animation: "spin 1s linear infinite" }} /> : "Delete"}
          </button>
          <button
            className="btn btn-subtle btn-sm"
            onClick={onDeleteCancel}
            disabled={deleteLoading}
          >
            Cancel
          </button>
        </div>
      )}
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// CPA Share Modal
// ═══════════════════════════════════════════════════════════════════════════════

function CPAShareModal({ study, onClose }) {
  const [cpaEmail,  setCpaEmail]  = useState("");
  const [cpaName,   setCpaName]   = useState("");
  const [message,   setMessage]   = useState("");
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [error,     setError]     = useState(null);

  const handleSend = useCallback(async () => {
    if (!cpaEmail.trim() || !cpaEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/study/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyId: study.studyId,
          cpaEmail: cpaEmail.trim(),
          cpaName:  cpaName.trim(),
          message:  message.trim(),
        }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        const d = await res.json();
        setError(d.error || "Failed to send. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  }, [study, cpaEmail, cpaName, message]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(28,25,22,0.45)",
          zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "var(--space-3)",
        }}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            width: "100%",
            maxWidth: 480,
            boxShadow: "var(--shadow-lg)",
            position: "relative",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", color: "var(--dust)" }}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {!sent ? (
            <>
              <div className="ui-label" style={{ marginBottom: 4 }}>Send to CPA</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>
                Share your study
              </h2>
              <p style={{ fontSize: 13, color: "var(--dust)", margin: "0 0 var(--space-3)", lineHeight: 1.5 }}>
                Your CPA will receive the study results for{" "}
                <strong style={{ color: "var(--ink)" }}>{study.address}</strong>.
              </p>

              {/* Summary strip */}
              <div style={{
                display: "flex", gap: 24, padding: "12px 16px",
                background: "var(--turq-bg)", borderRadius: "var(--radius-sm)",
                marginBottom: "var(--space-3)",
              }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: "var(--turq)", marginBottom: 2 }}>YEAR 1 DEDUCTION</div>
                  <div className="mono-value" style={{ fontSize: 18, fontWeight: 700, color: "var(--turq)" }}>{fmt(study.deduction)}</div>
                </div>
                {study.savings > 0 && (
                  <div>
                    <div className="mono" style={{ fontSize: 10, color: "var(--dust)", marginBottom: 2 }}>EST. TAX SAVINGS</div>
                    <div className="mono-value" style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)" }}>{fmt(study.savings)}</div>
                  </div>
                )}
              </div>

              <div className="field" style={{ marginBottom: "var(--space-2)" }}>
                <label className="label">CPA&apos;s Email *</label>
                <input
                  className="input"
                  type="email"
                  placeholder="cpa@example.com"
                  value={cpaEmail}
                  onChange={(e) => setCpaEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="field" style={{ marginBottom: "var(--space-2)" }}>
                <label className="label">CPA&apos;s Name (optional)</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Jane Smith"
                  value={cpaName}
                  onChange={(e) => setCpaName(e.target.value)}
                />
              </div>

              <div className="field" style={{ marginBottom: "var(--space-3)" }}>
                <label className="label">Add a note (optional)</label>
                <textarea
                  className="input"
                  rows={3}
                  placeholder="Hi, here's my cost seg study for your review…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  style={{ resize: "vertical", fontFamily: "var(--font-primary)" }}
                />
              </div>

              {error && (
                <div style={{ display: "flex", gap: 8, padding: "10px 14px", background: "#FEF2F0", borderRadius: "var(--radius-sm)", marginBottom: "var(--space-2)", color: "var(--adobe)", fontSize: 13 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="btn btn-primary"
                  onClick={handleSend}
                  disabled={sending || !cpaEmail}
                  style={{ flex: 1 }}
                >
                  {sending ? <Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> : <Mail size={15} />}
                  {sending ? "Sending…" : "Send to CPA"}
                </button>
                <button className="btn btn-subtle" onClick={onClose}>Cancel</button>
              </div>
            </>
          ) : (
            /* Success state */
            <div style={{ textAlign: "center", padding: "var(--space-2) 0" }}>
              <CheckCircle2 size={40} style={{ color: "var(--turq)", marginBottom: "var(--space-2)" }} />
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px" }}>Study sent!</h2>
              <p style={{ fontSize: 13, color: "var(--dust)", margin: "0 0 var(--space-3)", lineHeight: 1.5 }}>
                Your CPA at <strong>{cpaEmail}</strong> will receive the study summary and can request the full PDF from you.
              </p>
              <button className="btn btn-primary btn-sm" onClick={onClose}>Done</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Empty / Sign-in states
// ═══════════════════════════════════════════════════════════════════════════════

function EmptyState() {
  return (
    <div className="card" style={{ padding: "var(--space-6)", textAlign: "center" }}>
      <Building2 size={40} style={{ color: "var(--dust)", marginBottom: "var(--space-2)" }} aria-hidden="true" />
      <h3 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
        No properties yet
      </h3>
      <p style={{ fontSize: 14, color: "var(--dust)", lineHeight: 1.6, marginBottom: "var(--space-3)", maxWidth: 320, margin: "0 auto var(--space-3)" }}>
        Get a free estimate in under 2 minutes. See how much you could save with cost segregation.
      </p>
      <Link href="/quiz" className="btn btn-primary">
        <Plus size={16} />
        Start Your First Estimate
      </Link>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="card" style={{ padding: "var(--space-6)", textAlign: "center", maxWidth: 480 }}>
      <Building2 size={40} style={{ color: "var(--turq)", marginBottom: "var(--space-3)" }} aria-hidden="true" />
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>
        Sign in to manage your properties
      </h1>
      <p style={{ fontSize: 14, color: "var(--dust)", lineHeight: 1.6, marginBottom: "var(--space-3)" }}>
        Create a free account to save your estimates and order a full cost segregation study.
      </p>
      <Link href="/quiz" className="btn btn-primary btn-lg">
        Get a Free Estimate
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}
