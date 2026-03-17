"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import { getBrowserClient } from "@/lib/supabase";
import Badge from "@/components/ui/Badge";


// ─── Status badge variant map ────────────────────────────────────────
const STATUS_CONFIG = {
  draft:      { label: "Draft",      variant: "dust" },
  generating: { label: "Generating", variant: "adobe" },
  complete:   { label: "Complete",   variant: "turq" },
  failed:     { label: "Failed",     variant: "adobe" },
};


// ─── Currency / percent helpers ──────────────────────────────────────
function fmt(n) {
  if (n == null || isNaN(n)) return "$0";
  const abs = Math.abs(Math.round(n));
  const s = "$" + abs.toLocaleString("en-US");
  return n < 0 ? `(${s})` : s;
}
function pct(n) {
  if (n == null || isNaN(n)) return "0.0%";
  return `${(Math.round(n * 10) / 10).toFixed(1)}%`;
}


// ═════════════════════════════════════════════════════════════════════
// Main Page Component
// ═════════════════════════════════════════════════════════════════════

export default function StudyViewerPage({ params }) {
  const resolvedParams = use(params);
  const studyId = resolvedParams.id;

  const [row, setRow] = useState(null);      // Supabase row (or session fallback)
  const [study, setStudy] = useState(null);   // The generateStudy() output
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Fetch study data ─────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // 1. Try Supabase
        const supabase = getBrowserClient();
        const { data, error: sbErr } = await supabase
          .from("studies")
          .select("*, properties(*)")
          .eq("id", studyId)
          .single();

        if (!cancelled && data) {
          setRow(data);
          setStudy(data.study_data);
          setProperty(data.properties);
          setLoading(false);
          return;
        }

        // 2. Fallback: sessionStorage (pre-Supabase flow)
        if (!cancelled) {
          const cached = sessionStorage.getItem("abode_latest_study");
          if (cached) {
            const parsed = JSON.parse(cached);
            // Could be the raw study object or wrapped
            const studyData = parsed.study_data || parsed;
            setRow(parsed);
            setStudy(studyData);
            setProperty(parsed.properties || null);
            setLoading(false);
            return;
          }
        }

        // 3. Nothing found
        if (!cancelled) {
          setError("Study not found. It may have been deleted or the link is invalid.");
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[StudyViewer] load error:", err);
          // Try sessionStorage as last resort
          try {
            const cached = sessionStorage.getItem("abode_latest_study");
            if (cached) {
              const parsed = JSON.parse(cached);
              const studyData = parsed.study_data || parsed;
              setRow(parsed);
              setStudy(studyData);
              setProperty(parsed.properties || null);
              setLoading(false);
              return;
            }
          } catch {}
          setError("Unable to load study. Please try again.");
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [studyId]);

  // ── Loading skeleton ─────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <Link href="/app/studies" className="btn btn-subtle btn-sm">
            <ArrowLeft size={16} /> Back to Studies
          </Link>
        </div>
        <SkeletonBlock h={28} w="40%" mb="var(--space-2)" />
        <SkeletonBlock h={18} w="60%" mb="var(--space-5)" />
        <SkeletonBlock h={120} mb="var(--space-4)" />
        <SkeletonBlock h={200} mb="var(--space-4)" />
        <SkeletonBlock h={160} />
      </div>
    );
  }

  // ── Error / not found ────────────────────────────────────────────
  if (error || !study) {
    return (
      <div style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <Link href="/app/studies" className="btn btn-subtle btn-sm">
            <ArrowLeft size={16} /> Back to Studies
          </Link>
        </div>
        <div className="card" style={{ padding: "var(--space-5)", textAlign: "center" }}>
          <AlertTriangle size={32} style={{ color: "var(--adobe)", marginBottom: "var(--space-2)" }} />
          <h2 className="h2-section" style={{ marginBottom: "var(--space-1)" }}>
            Study Not Found
          </h2>
          <p style={{ color: "var(--dust)", fontSize: 14 }}>
            {error || "This study could not be loaded."}
          </p>
          <Link href="/app/studies" className="btn btn-primary" style={{ marginTop: "var(--space-3)" }}>
            View All Studies
          </Link>
        </div>
      </div>
    );
  }

  // ── Resolve data from study object ───────────────────────────────
  const status = row?.status || "complete";
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.complete;
  const metaId = study.meta?.studyId || studyId;
  const createdAt = row?.created_at
    ? new Date(row.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
    : study.meta?.studyDate || "";

  const address =
    property?.address
      ? `${property.address}, ${property.city}, ${property.state}`
      : study.property?.propertyAddress || "Property";

  const { basis, allocation, depreciation, savings, catchUp, reconciliation } = study;

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Back link */}
      <Link
        href="/app/studies"
        className="btn btn-subtle btn-sm"
        style={{ marginBottom: "var(--space-3)" }}
      >
        <ArrowLeft size={16} /> Back to Studies
      </Link>

      {/* ── Header ────────────────────────────────────────────── */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: 4 }}>
          <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
          <span className="mono" style={{ color: "var(--dust)", fontSize: 11 }}>
            Study #{metaId}
          </span>
          {createdAt && (
            <span className="mono" style={{ color: "var(--dust)", fontSize: 11 }}>
              &middot; {createdAt}
            </span>
          )}
        </div>
        <h1 className="h2-section">{address}</h1>
      </div>

      {/* ── Summary Card (dark) ───────────────────────────────── */}
      <div className="card-dark" style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "var(--space-3)" }}>
          <SummaryItem label="Purchase Price" value={fmt(basis?.purchasePrice)} />
          <SummaryItem label="Depreciable Basis" value={fmt(basis?.adjustedBasis || basis?.depreciableBasis)} />
          <SummaryItem label="First-Year Deduction" value={fmt(depreciation?.totalFirstYearDeduction)} highlight />
          <SummaryItem label="Est. Tax Savings" value={fmt(savings?.firstYearSavings)} highlight />
        </div>
      </div>

      {/* ── Asset Classification Breakdown ────────────────────── */}
      {allocation && (
        <AssetBreakdown allocation={allocation} adjustedBasis={basis?.adjustedBasis || basis?.depreciableBasis} />
      )}

      {/* ── Component Detail Table ────────────────────────────── */}
      {allocation && (
        <ComponentTable allocation={allocation} adjustedBasis={basis?.adjustedBasis || basis?.depreciableBasis} />
      )}

      {/* ── Depreciation Schedule ─────────────────────────────── */}
      {depreciation?.yearByYearSchedule && (
        <DepreciationSchedule schedule={depreciation.yearByYearSchedule} />
      )}

      {/* ── Catch-Up / 481(a) ─────────────────────────────────── */}
      {catchUp && <CatchUpSection catchUp={catchUp} />}

      {/* ── Reconciliation ────────────────────────────────────── */}
      {reconciliation && <ReconciliationBadge rec={reconciliation} />}

      {/* ── Material Participation Warning ────────────────────── */}
      {savings?.passiveWarning && (
        <div
          className="card"
          style={{
            marginBottom: "var(--space-4)",
            padding: "var(--space-3)",
            borderLeft: "3px solid #D4A843",
            background: "#FDF8EC",
          }}
        >
          <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "flex-start" }}>
            <AlertTriangle size={18} style={{ color: "#D4A843", flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)", marginBottom: 4 }}>
                Passive Activity Limitation
              </div>
              <p style={{ fontSize: 13, color: "var(--ink-mid)", margin: 0, lineHeight: 1.5 }}>
                {savings.materialParticipation?.note ||
                  "Depreciation deductions may be limited to passive income unless you qualify for the STR material participation exception under Sec. 469."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Downloads ─────────────────────────────────────────── */}
      <DownloadsCard studyId={studyId} metaId={metaId} study={study} />

      {/* ── Disclaimer ────────────────────────────────────────── */}
      <div style={{ marginTop: "var(--space-4)", marginBottom: "var(--space-6)" }}>
        <p className="mono" style={{ fontSize: 10, color: "var(--dust)", lineHeight: 1.6 }}>
          This cost segregation study is for informational and tax planning purposes only. It does not constitute
          tax, legal, or financial advice. The analysis is based on information provided by the property owner and
          publicly available data sources. Actual tax savings depend on individual circumstances, filing status, and
          applicable tax law. A qualified CPA or tax professional should review this study before filing. Abode is
          not a licensed CPA firm and does not provide tax preparation services. IRS Circular 230 Notice: Any tax
          advice contained herein was not intended or written to be used, and cannot be used, for the purpose of
          avoiding penalties under the Internal Revenue Code.
        </p>
      </div>
    </div>
  );
}


// ═════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════

function SummaryItem({ label, value, highlight }) {
  return (
    <div>
      <div
        className="mono"
        style={{
          fontSize: 10,
          color: highlight ? "var(--turq-light)" : "rgba(255,255,255,0.4)",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        className="mono-value"
        style={{
          fontSize: highlight ? 22 : 16,
          fontWeight: highlight ? 700 : 400,
          color: "#fff",
        }}
      >
        {value}
      </div>
    </div>
  );
}


// ─── Asset Classification Breakdown ──────────────────────────────────

function AssetBreakdown({ allocation, adjustedBasis }) {
  const classes = [
    { key: "fiveYear",    label: "5-Year Personal Property",   color: "var(--turq)" },
    { key: "sevenYear",   label: "7-Year Personal Property",   color: "#5BA3A3" },
    { key: "fifteenYear", label: "15-Year Land Improvements",  color: "#8CBCBC" },
    { key: "building",    label: "27.5-Year Building (Sec. 1250)", color: "var(--surface-2)" },
  ];

  return (
    <div className="card" style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
        Asset Classification Breakdown
      </div>

      {/* Stacked bar preview */}
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", marginBottom: "var(--space-3)" }}>
        {classes.map((cls) => {
          const p = allocation[cls.key]?.percent || 0;
          return p > 0 ? (
            <div key={cls.key} style={{ width: `${p}%`, background: cls.color }} />
          ) : null;
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {classes.map((cls) => {
          const data = allocation[cls.key];
          if (!data) return null;
          const amount = data.amount || 0;
          const percent = data.percent || 0;
          const barWidth = adjustedBasis > 0 ? (amount / adjustedBasis) * 100 : 0;

          return (
            <div key={cls.key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                  {cls.label}
                </span>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <span className="mono" style={{ fontSize: 12, color: "var(--dust)" }}>
                    {pct(percent)}
                  </span>
                  <span className="mono-value" style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>
                    {fmt(amount)}
                  </span>
                </div>
              </div>
              <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${barWidth}%`, background: cls.color, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Reclassified total */}
      {allocation.totalReclassAmount > 0 && (
        <div
          style={{
            marginTop: "var(--space-3)",
            paddingTop: "var(--space-2)",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--turq)" }}>
            Total Reclassified (Accelerated)
          </span>
          <span className="mono-value" style={{ fontSize: 14, fontWeight: 600, color: "var(--turq)" }}>
            {fmt(allocation.totalReclassAmount)} ({pct(allocation.totalReclass)})
          </span>
        </div>
      )}
    </div>
  );
}


// ─── Component Detail Table ──────────────────────────────────────────

function ComponentTable({ allocation, adjustedBasis }) {
  const [openClass, setOpenClass] = useState(null);

  const classes = [
    { key: "fiveYear",    label: "5-Year MACRS",   macrs: "5-Year" },
    { key: "sevenYear",   label: "7-Year MACRS",   macrs: "7-Year" },
    { key: "fifteenYear", label: "15-Year MACRS",  macrs: "15-Year" },
  ];

  const toggle = (key) => setOpenClass(openClass === key ? null : key);

  return (
    <div className="card" style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
        Component Detail
      </div>
      {classes.map((cls) => {
        const data = allocation[cls.key];
        const components = data?.components || [];
        if (components.length === 0) return null;
        const isOpen = openClass === cls.key;

        return (
          <div key={cls.key} style={{ marginBottom: "var(--space-2)" }}>
            {/* Accordion header */}
            <button
              onClick={() => toggle(cls.key)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                cursor: "pointer",
                fontFamily: "var(--font-primary)",
              }}
            >
              <span style={{ fontWeight: 500, fontSize: 13, color: "var(--ink)" }}>
                {isOpen ? <ChevronDown size={14} style={{ marginRight: 6, verticalAlign: "middle" }} /> :
                  <ChevronRight size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />}
                {cls.label}
                <span className="mono" style={{ color: "var(--dust)", marginLeft: 8, fontSize: 12 }}>
                  ({components.length} items)
                </span>
              </span>
              <span className="mono-value" style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                {fmt(data.amount)}
              </span>
            </button>

            {/* Expanded table */}
            {isOpen && (
              <div style={{ overflowX: "auto", marginTop: 4 }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Component", "Category", "MACRS Class", "Cost Basis", "% of Basis"].map((h) => (
                        <th
                          key={h}
                          style={{
                            textAlign: h === "Component" || h === "Category" ? "left" : "right",
                            padding: "8px 10px",
                            fontSize: 11,
                            fontWeight: 600,
                            color: "var(--dust)",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {components.map((c, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px 10px", color: "var(--ink)" }}>
                          {c.name || c.id || `Component ${i + 1}`}
                        </td>
                        <td style={{ padding: "8px 10px", color: "var(--ink-mid)" }}>
                          {c.category || "—"}
                        </td>
                        <td className="mono" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink-mid)" }}>
                          {cls.macrs}
                        </td>
                        <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink)" }}>
                          {fmt(c.costBasis)}
                        </td>
                        <td className="mono" style={{ padding: "8px 10px", textAlign: "right", color: "var(--dust)" }}>
                          {pct(c.percentOfBasis)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}


// ─── Depreciation Schedule ───────────────────────────────────────────

function DepreciationSchedule({ schedule }) {
  const rows = schedule.slice(0, 5);

  return (
    <div className="card" style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
        Depreciation Schedule (Years 1–5)
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border-strong)" }}>
              {["Year", "5-Year", "7-Year", "15-Year", "Building", "Total", "Accumulated"].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: h === "Year" ? "left" : "right",
                    padding: "8px 10px",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--dust)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.year} style={{ borderBottom: "1px solid var(--border)", background: i === 0 ? "var(--turq-bg)" : "transparent" }}>
                <td style={{ padding: "8px 10px", fontWeight: 500, color: "var(--ink)" }}>{r.year}</td>
                <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink)" }}>{fmt(r.fiveYr)}</td>
                <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink)" }}>{fmt(r.sevenYr)}</td>
                <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink)" }}>{fmt(r.fifteenYr)}</td>
                <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink)" }}>{fmt(r.building)}</td>
                <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "var(--ink)" }}>{fmt(r.total)}</td>
                <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--dust)" }}>{fmt(r.accumulated)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// ─── Catch-Up / 481(a) Section ───────────────────────────────────────

function CatchUpSection({ catchUp }) {
  return (
    <div className="card" style={{ marginBottom: "var(--space-4)", padding: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
        Section 481(a) Catch-Up Adjustment
      </div>
      <p style={{ fontSize: 13, color: "var(--ink-mid)", marginBottom: "var(--space-3)", lineHeight: 1.5 }}>
        Because this property was placed in service before the current tax year, a catch-up
        adjustment under IRC &sect;481(a) allows you to claim previously missed accelerated
        depreciation in a single year.
      </p>

      {catchUp.adjustmentAmount != null && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            background: "var(--turq-bg)",
            borderRadius: "var(--radius-sm)",
            marginBottom: "var(--space-3)",
          }}
        >
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--turq)" }}>
            481(a) Adjustment Amount
          </span>
          <span className="mono-value" style={{ fontSize: 20, fontWeight: 700, color: "var(--turq)" }}>
            {fmt(catchUp.adjustmentAmount)}
          </span>
        </div>
      )}

      {/* Year-by-year comparison */}
      {catchUp.yearComparison && catchUp.yearComparison.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Year", "Old Method", "New Method (Cost Seg)", "Difference"].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: h === "Year" ? "left" : "right",
                      padding: "8px 10px",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--dust)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catchUp.yearComparison.map((yr) => (
                <tr key={yr.year} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px 10px", color: "var(--ink)" }}>{yr.year}</td>
                  <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink-mid)" }}>
                    {fmt(yr.oldMethod)}
                  </td>
                  <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", color: "var(--ink)" }}>
                    {fmt(yr.newMethod)}
                  </td>
                  <td className="mono-value" style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, color: "var(--turq)" }}>
                    {fmt(yr.difference)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// ─── Reconciliation Badge ────────────────────────────────────────────

function ReconciliationBadge({ rec }) {
  const ok = rec.isReconciled;

  return (
    <div
      className="card"
      style={{
        marginBottom: "var(--space-4)",
        padding: "var(--space-3)",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        borderLeft: `3px solid ${ok ? "var(--turq)" : "var(--adobe)"}`,
      }}
    >
      {ok ? (
        <CheckCircle2 size={18} style={{ color: "var(--turq)", flexShrink: 0 }} />
      ) : (
        <AlertTriangle size={18} style={{ color: "var(--adobe)", flexShrink: 0 }} />
      )}
      <div>
        <span style={{ fontWeight: 600, fontSize: 13, color: ok ? "var(--turq)" : "var(--adobe)" }}>
          {ok ? "Reconciled" : "Reconciliation Warning"}
        </span>
        <span className="mono" style={{ fontSize: 12, color: "var(--dust)", marginLeft: 8 }}>
          Basis: {fmt(rec.adjustedBasis)} &middot; Allocated: {fmt(rec.totalAllocated)}
          {!ok && ` · Diff: ${fmt(rec.difference)}`}
        </span>
      </div>
    </div>
  );
}


// ─── Downloads Card ──────────────────────────────────────────────────

function DownloadsCard({ studyId, metaId, study }) {
  const handlePDF = useCallback(() => {
    window.open(`/api/study/pdf?id=${studyId}`, "_blank");
  }, [studyId]);

  const handleDepreciationCSV = useCallback(async () => {
    try {
      const { generateDepreciationCSV } = await import("@/lib/csvExporter");
      generateDepreciationCSV(study);
    } catch {
      // Fallback: open API route
      window.open(`/api/study/csv?id=${studyId}&type=depreciation`, "_blank");
    }
  }, [study, studyId]);

  const handleComponentCSV = useCallback(async () => {
    try {
      const { generateComponentCSV } = await import("@/lib/csvExporter");
      generateComponentCSV(study);
    } catch {
      // Fallback: open API route
      window.open(`/api/study/csv?id=${studyId}&type=components`, "_blank");
    }
  }, [study, studyId]);

  return (
    <div className="card" style={{ padding: "var(--space-4)" }}>
      <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
        Downloads
      </div>
      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
        <button className="btn btn-primary" onClick={handlePDF}>
          <FileText size={16} />
          Download PDF Report
        </button>
        <button className="btn btn-outline" onClick={handleDepreciationCSV}>
          <FileSpreadsheet size={16} />
          Depreciation Schedule (CSV)
        </button>
        <button className="btn btn-outline" onClick={handleComponentCSV}>
          <Download size={16} />
          Component Register (CSV)
        </button>
      </div>
      <p className="mono" style={{ color: "var(--dust)", marginTop: "var(--space-2)", fontSize: 10 }}>
        PDF includes full study report with legal citations. CSV files are formatted for CPA import.
      </p>
    </div>
  );
}


// ─── Skeleton helper ─────────────────────────────────────────────────

function SkeletonBlock({ h = 20, w = "100%", mb = 0 }) {
  return (
    <div
      style={{
        height: h,
        width: w,
        background: "var(--surface-2)",
        borderRadius: "var(--radius-sm)",
        marginBottom: mb,
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    />
  );
}
