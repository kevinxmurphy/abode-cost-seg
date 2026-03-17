"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { MOCK_STUDY } from "@/lib/stubs";
import Badge from "@/components/ui/Badge";

const studies = [
  { ...MOCK_STUDY },
  {
    id: "std_demo_002",
    propertyAddress: "1842 Sunset Canyon Dr, Scottsdale, AZ",
    purchasePrice: 1250000,
    firstYearDeduction: 0,
    status: "processing",
    completedAt: null,
  },
];

export default function StudiesPage() {
  const statusVariant = { complete: "turq", processing: "adobe", pending: "dust", draft: "dust" };

  return (
    <div>
      <div className="eyebrow" style={{ marginBottom: "4px" }}>
        Studies
      </div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-4)" }}>
        Cost Segregation Studies
      </h1>

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
    </div>
  );
}
