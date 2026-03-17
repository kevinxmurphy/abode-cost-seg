"use client";

import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/stubs";
import Badge from "@/components/ui/Badge";

export default function PropertiesPage() {
  const statusVariant = { complete: "turq", processing: "adobe", pending: "dust" };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "var(--space-4)",
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: "4px" }}>
            Properties
          </div>
          <h1 className="h2-section">Your Properties</h1>
        </div>
        <Link href="/app/properties/new" className="btn btn-primary btn-sm">
          <Plus size={16} />
          Add Property
        </Link>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        {MOCK_PROPERTIES.map((p) => (
          <Link
            key={p.id}
            href={`/app/properties/${p.id}`}
            className="card"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "var(--space-3)",
              padding: "var(--space-3)",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)", marginBottom: "4px" }}>
                {p.address}
              </div>
              <div className="mono" style={{ color: "var(--dust)", fontSize: "11px" }}>
                ${p.purchasePrice.toLocaleString()} &middot; Built {p.yearBuilt} &middot; {p.propertyType}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", flexShrink: 0 }}>
              <Badge variant={statusVariant[p.studyStatus]}>
                {p.studyStatus.charAt(0).toUpperCase() + p.studyStatus.slice(1)}
              </Badge>
              <ArrowRight size={16} style={{ color: "var(--dust)" }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
