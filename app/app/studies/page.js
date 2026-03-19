"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, FileText, Loader2 } from "lucide-react";
import Badge from "@/components/ui/Badge";

export default function StudiesPage() {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadStudies() {
      try {
        const res = await fetch("/api/properties");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const props = (data.properties || []).filter(
          (p) => p.step === "purchased" || p.study_status === "complete" || p.study_status === "processing"
        );
        if (!cancelled) {
          setStudies(
            props.map((p) => ({
              id: p.id,
              propertyAddress: p.airbnb_title || p.address || "Property",
              purchasePrice: p.purchase_price || 0,
              firstYearDeduction: p.estimate?.first_year_deduction || 0,
              status: p.study_status === "complete" || p.step === "purchased" ? "complete" : "processing",
              completedAt: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : null,
            }))
          );
        }
      } catch {
        // Silently fail — will show empty state
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadStudies();
    return () => { cancelled = true; };
  }, []);

  const statusVariant = { complete: "turq", processing: "adobe", pending: "dust", draft: "dust" };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
        <Loader2 size={24} className="quiz-airbnb-spinner" style={{ color: "var(--turq)" }} />
      </div>
    );
  }

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: "4px" }}>
        Studies
      </div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-4)" }}>
        Cost Segregation Studies
      </h1>

      {studies.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "var(--space-6) var(--space-3)",
            color: "var(--dust)",
          }}
        >
          <FileText size={40} style={{ marginBottom: "var(--space-2)", opacity: 0.4 }} />
          <p style={{ fontSize: "15px", marginBottom: "var(--space-3)" }}>
            No studies yet. Complete a purchase to start your first cost segregation study.
          </p>
          <Link href="/quiz" className="btn btn-primary">
            Get Your Free Estimate
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          {studies.map((study) => (
            <Link
              key={study.id}
              href={`/app/studies/${study.id}`}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-3)",
                padding: "var(--space-3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--turq-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--turq)",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {study.propertyAddress}
                  </div>
                  <div className="mono" style={{ color: "var(--dust)", fontSize: "11px" }}>
                    {study.status === "complete"
                      ? `Completed ${study.completedAt} · $${study.firstYearDeduction.toLocaleString()} deduction`
                      : "In progress..."}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
                <Badge variant={statusVariant[study.status]}>
                  {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                </Badge>
                <ArrowRight size={16} style={{ color: "var(--dust)" }} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
