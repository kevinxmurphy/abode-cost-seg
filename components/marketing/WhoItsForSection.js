"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import { Check } from "lucide-react";
import Link from "next/link";
import { STUDY_PRICE_FLAT } from "@/lib/pricing";

const traits = [
  "You run your STR like a business — tracking every dollar, optimizing every season",
  "You're in a 24%+ federal tax bracket and your investment should reflect that",
  "Your property is worth between $300K and $2M",
  "You purchased or renovated in the last 5+ years without a cost seg study",
  "Your CPA handles your return but cost segregation has never come up",
  "You want an IRS-compliant report your CPA can file without a second thought",
];

const quickStats = [
  { value: "$61K", label: "avg. first-year deduction" },
  { value: "1–3 days", label: "turnaround" },
  { value: STUDY_PRICE_FLAT, label: "no surprise fees" },
];

export default function WhoItsForSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" style={{ background: "var(--surface)" }}>
      <div className="container" ref={ref}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
            alignItems: "center",
            maxWidth: "960px",
            margin: "0 auto",
          }}
        >
          {/* Left: checklist */}
          <div>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)" }}>
              Who It&apos;s For
            </div>
            <h2
              className="h2-section reveal"
              style={{ marginBottom: "var(--space-4)" }}
            >
              Built for STR investors who want to keep what they earn.
            </h2>

            <div
              className="reveal-stagger"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                marginBottom: "var(--space-5)",
              }}
            >
              {traits.map((trait, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-2)",
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--adobe)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 0,
                      boxShadow: "0 2px 8px rgba(184,80,48,0.28)",
                    }}
                  >
                    <Check size={14} strokeWidth={2.5} />
                  </div>
                  <span className="body-text" style={{ fontSize: "15px", paddingTop: "3px" }}>
                    {trait}
                  </span>
                </div>
              ))}
            </div>

            <div className="reveal">
              <Link href="/quiz" className="btn btn-primary">
                Calculate My Savings — It&apos;s Free
              </Link>
            </div>
          </div>

          {/* Right: quick stats callout — desktop only */}
          <div
            className="reveal"
            style={{
              display: "none",
              background: "rgba(184,80,48,0.06)",
              border: "1px solid var(--adobe-light)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
            }}
          >
            <div
              className="eyebrow"
              style={{ marginBottom: "var(--space-4)" }}
            >
              By the numbers
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {quickStats.map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "28px",
                      color: "var(--ink)",
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      marginBottom: "4px",
                    }}
                  >
                    {s.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--dust)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr 1fr !important;
          }
          div[style*="display: none"] {
            display: block !important;
          }
        }
      `}</style>
    </section>
  );
}
