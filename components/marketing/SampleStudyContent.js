"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ArrowRight, FileText, FileSpreadsheet, Download } from "lucide-react";
import { MOCK_STUDY } from "@/lib/stubs";

const study = MOCK_STUDY;

const assetCategories = [
  { name: "5-Year Personal Property", amount: study.personalProperty5yr, pct: ((study.personalProperty5yr / study.depreciableBasis) * 100).toFixed(1) },
  { name: "7-Year Personal Property", amount: study.personalProperty7yr, pct: ((study.personalProperty7yr / study.depreciableBasis) * 100).toFixed(1) },
  { name: "15-Year Land Improvements", amount: study.personalProperty15yr, pct: ((study.personalProperty15yr / study.depreciableBasis) * 100).toFixed(1) },
  { name: "27.5/39-Year Property", amount: study.section1250Property, pct: ((study.section1250Property / study.depreciableBasis) * 100).toFixed(1) },
];

export default function SampleStudyContent() {
  const ref = useScrollReveal();
  const ref2 = useScrollReveal();

  return (
    <>
      {/* Hero */}
      <section
        style={{
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-8)",
        }}
      >
        <div className="container" style={{ maxWidth: "800px" }}>
          <div className="eyebrow" style={{ marginBottom: "var(--space-1)", color: "var(--turq)" }}>
            Sample Study
          </div>
          <h1 className="h1-hero" style={{ marginBottom: "var(--space-3)" }}>
            See what you get
          </h1>
          <p className="body-text" style={{ fontSize: "17px", maxWidth: "540px", marginBottom: "var(--space-4)" }}>
            Here&apos;s a sample cost segregation study for a $875,000 short-term rental
            in La Quinta, CA. This is what your study will look like.
          </p>
        </div>
      </section>

      {/* Study Preview */}
      <section className="section" style={{ background: "var(--surface)" }} ref={ref}>
        <div className="container" style={{ maxWidth: "800px" }}>
          {/* Summary */}
          <div className="card-dark reveal" style={{ padding: "var(--space-5)", marginBottom: "var(--space-4)" }}>
            <div className="mono" style={{ color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-1)", fontSize: "10px" }}>
              Sample Property
            </div>
            <div style={{ fontSize: "18px", fontWeight: 500, color: "#fff", marginBottom: "var(--space-4)" }}>
              {study.propertyAddress}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "var(--space-3)" }}>
              <StatBlock label="Purchase Price" value={`$${study.purchasePrice.toLocaleString()}`} />
              <StatBlock label="Land Value" value={`$${study.landValue.toLocaleString()}`} />
              <StatBlock label="Depreciable Basis" value={`$${study.depreciableBasis.toLocaleString()}`} />
              <StatBlock label="First-Year Deduction" value={`$${study.firstYearDeduction.toLocaleString()}`} highlight />
              <StatBlock label="Bonus Dep. Amount" value={`$${study.bonusDepreciationAmount.toLocaleString()}`} highlight />
              <StatBlock label="Est. Tax Savings" value={`$${study.estimatedTaxSavings.toLocaleString()}`} highlight />
            </div>
          </div>

          {/* Asset Breakdown */}
          <div className="card reveal" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
              Asset Classification
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {assetCategories.map((cat) => (
                <div key={cat.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)" }}>
                      {cat.name}
                    </span>
                    <span className="mono-value" style={{ fontSize: "14px", color: "var(--ink)" }}>
                      ${cat.amount.toLocaleString()} ({cat.pct}%)
                    </span>
                  </div>
                  <div style={{ height: 4, background: "var(--surface-2)", borderRadius: 2, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${cat.pct}%`,
                        background: "var(--turq)",
                        borderRadius: 2,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Downloads */}
          <div className="card reveal" style={{ padding: "var(--space-4)", marginBottom: "var(--space-4)" }}>
            <div className="ui-label" style={{ marginBottom: "var(--space-3)" }}>
              Deliverables Included
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
              <a
                className="btn btn-outline"
                href="/api/study/pdf?id=sample&preview"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText size={16} />
                PDF Report Preview
              </a>
              <Link
                className="btn btn-outline"
                href="/quiz"
              >
                <FileSpreadsheet size={16} />
                Get Your Own Estimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ref2}
        style={{
          padding: "var(--space-10) 0",
          textAlign: "center",
        }}
      >
        <div className="container reveal">
          <h2 className="h2-section" style={{ marginBottom: "var(--space-2)" }}>
            Ready to get yours?
          </h2>
          <p className="body-text" style={{ marginBottom: "var(--space-4)" }}>
            Take our free 2-minute quiz to see your estimated savings.
          </p>
          <Link href="/quiz" className="btn btn-primary btn-lg">
            Get Your Free Estimate
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}

function StatBlock({ label, value, highlight }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: "10px", color: highlight ? "var(--turq-light)" : "rgba(255,255,255,0.4)", marginBottom: "2px" }}>
        {label}
      </div>
      <div
        className="mono-value"
        style={{
          fontSize: highlight ? "18px" : "15px",
          fontWeight: highlight ? 700 : 400,
          color: "#fff",
        }}
      >
        {value}
      </div>
    </div>
  );
}
