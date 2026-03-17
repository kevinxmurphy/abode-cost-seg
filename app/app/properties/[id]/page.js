"use client";

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { MOCK_PROPERTIES } from "@/lib/stubs";
import Badge from "@/components/ui/Badge";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

export default function PropertyDetailPage({ params }) {
  // STUB: Find property from mock data or show first
  const property = MOCK_PROPERTIES.find((p) => p.id === params.id) || MOCK_PROPERTIES[0];
  const statusVariant = { complete: "turq", processing: "adobe", pending: "dust" };

  return (
    <div style={{ maxWidth: "640px" }}>
      <Link
        href="/app/properties"
        className="btn btn-subtle btn-sm"
        style={{ marginBottom: "var(--space-3)" }}
      >
        <ArrowLeft size={16} />
        Back to Properties
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
        <h1 className="h2-section">{property.address}</h1>
        <Badge variant={statusVariant[property.studyStatus]}>
          {property.studyStatus.charAt(0).toUpperCase() + property.studyStatus.slice(1)}
        </Badge>
      </div>

      <div className="card" style={{ marginTop: "var(--space-4)", padding: "var(--space-4)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
          Property Details
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "var(--space-2) var(--space-4)",
          }}
        >
          <DetailRow label="Purchase Price" value={`$${property.purchasePrice.toLocaleString()}`} />
          <DetailRow label="Year Built" value={property.yearBuilt} />
          <DetailRow label="Property Type" value={property.propertyType} />
          <DetailRow label="Study Status" value={property.studyStatus} />
        </div>
      </div>

      <div style={{ marginTop: "var(--space-4)", display: "flex", gap: "var(--space-2)" }}>
        {property.studyId ? (
          <Link href={`/app/studies/${property.studyId}`} className="btn btn-primary">
            <FileText size={16} />
            View Study
          </Link>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => alert("Study generation coming soon (stub)")}
          >
            <FileText size={16} />
            Order Study — {STUDY_PRICE_DISPLAY}
          </button>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="mono" style={{ color: "var(--dust)", fontSize: "10px", marginBottom: "2px" }}>
        {label}
      </div>
      <div style={{ fontSize: "15px", fontWeight: 500, color: "var(--ink)" }}>
        {value}
      </div>
    </div>
  );
}
