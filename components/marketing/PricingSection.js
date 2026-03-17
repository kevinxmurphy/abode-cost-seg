"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import { Check } from "lucide-react";
import Link from "next/link";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

const included = [
  "Full IRS-compliant cost segregation study",
  "Asset classification across all depreciation categories",
  "5, 7, 15, and 27.5-year property breakdowns",
  "Bonus depreciation calculations (current rates)",
  "PDF report for your CPA",
  "Excel fixed asset schedule",
  "Catch-up deduction analysis (Form 3115)",
];

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10 2L3.5 4.5V9.5C3.5 13.09 6.26 16.45 10 17.5C13.74 16.45 16.5 13.09 16.5 9.5V4.5L10 2Z"
        stroke="var(--adobe)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7 10L9 12L13 8"
        stroke="var(--adobe)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PricingSection() {
  const ref = useScrollReveal();

  return (
    <section
      id="pricing"
      className="section"
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle background texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(28,25,22,0.03) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
        }}
      />

      <div className="container" ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)" }}>
            Flat-Rate Access
          </div>
          <h2 className="h2-section reveal">
            One property. One price. No surprises.
          </h2>
        </div>

        {/* ROI callout — above the card */}
        <div
          className="reveal"
          style={{
            maxWidth: "480px",
            margin: "0 auto var(--space-4)",
            background: "var(--surface-raised)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-3)",
          }}
        >
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--adobe)",
            letterSpacing: "0.08em", marginBottom: "var(--space-2)",
          }}>
            THE MATH
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-2)" }}>
            {[
              { label: "Study cost", value: STUDY_PRICE_DISPLAY },
              { label: "Typical deduction*", value: "$44K" },
              { label: "Year-1 return (32%)", value: "~28×" },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{
                  fontFamily: "var(--font-primary)", fontWeight: 700,
                  fontSize: "22px", color: "var(--ink)", letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}>
                  {item.value}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "10px",
                  color: "var(--dust)", letterSpacing: "0.04em", marginTop: "4px",
                }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: "var(--space-2)", paddingTop: "var(--space-1)",
            borderTop: "1px solid var(--border)", fontSize: "10px",
            color: "var(--dust)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em",
          }}>
            *Based on avg. $500K STR property at 32% bracket. Your results will vary.
          </div>
        </div>

        <div className="reveal" style={{ maxWidth: "480px", margin: "0 auto" }}>
          {/* Badge */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "-12px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "6px 18px",
                background: "var(--adobe-light)",
                color: "var(--adobe-dark)",
                fontSize: "11px",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderRadius: "var(--radius-pill)",
                border: "1px solid rgba(184,80,48,0.15)",
              }}
            >
              Most Complete STR Study
            </span>
          </div>

          <div
            style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
              textAlign: "center",
              boxShadow: "var(--shadow-md), var(--shadow-glow)",
              borderTop: "3px solid transparent",
              borderImage: "var(--grad-turq) 1",
              borderImageSlice: 1,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle glow at top */}
            <div
              style={{
                position: "absolute",
                top: "-60px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "300px",
                height: "120px",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse, rgba(26,140,140,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            {/* Access framing */}
            <div
              className="mono"
              style={{
                color: "var(--adobe)",
                marginBottom: "var(--space-1)",
                position: "relative",
                fontSize: "11px",
                letterSpacing: "0.08em",
              }}
            >
              Previously only available to commercial investors
            </div>

            <div style={{ marginBottom: "var(--space-4)", position: "relative" }}>
              <span
                style={{
                  fontFamily: "var(--font-primary)",
                  fontWeight: 700,
                  fontSize: "64px",
                  color: "var(--ink)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                }}
              >
                {STUDY_PRICE_DISPLAY}
              </span>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--dust)",
                  marginTop: "4px",
                }}
              >
                one-time payment · per property
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid var(--border)",
                paddingTop: "var(--space-4)",
                marginBottom: "var(--space-4)",
                textAlign: "left",
              }}
            >
              <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>
                What&apos;s Included
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {included.map((item, i) => (
                  <div
                    key={i}
                    style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: "var(--adobe)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      <Check size={12} strokeWidth={2.5} color="#fff" />
                    </div>
                    <span style={{ fontSize: "14px", color: "var(--ink-mid)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/quiz" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
              Start My Study — {STUDY_PRICE_DISPLAY}
            </Link>

            {/* 90-day guarantee block */}
            <div
              style={{
                marginTop: "var(--space-2)",
                padding: "12px 16px",
                background: "var(--adobe-light)",
                borderRadius: "var(--radius-md)",
                border: "1px solid rgba(184,80,48,0.12)",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                textAlign: "left",
              }}
            >
              <div style={{ flexShrink: 0, marginTop: "1px" }}>
                <ShieldIcon />
              </div>
              <div>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "var(--adobe-dark)",
                    marginBottom: "2px",
                    fontFamily: "var(--font-primary)",
                  }}
                >
                  90-Day Money-Back Guarantee
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "var(--adobe)",
                    lineHeight: 1.5,
                    fontFamily: "var(--font-primary)",
                  }}
                >
                  Not satisfied for any reason? Full refund. No questions asked.
                </div>
              </div>
            </div>

            {/* Timing note */}
            <div
              style={{
                fontSize: "12px",
                color: "var(--dust)",
                textAlign: "center",
                marginTop: "var(--space-1)",
                fontFamily: "var(--font-primary)",
              }}
            >
              Order now. Share with your CPA when you&apos;re ready.
            </div>

            {/* Condensed disclaimer */}
            <div
              className="mono"
              style={{
                fontSize: "10px",
                color: "var(--dust)",
                marginTop: "var(--space-3)",
                lineHeight: 1.5,
                borderTop: "1px solid var(--border)",
                paddingTop: "var(--space-2)",
              }}
            >
              Guarantee covers the {STUDY_PRICE_DISPLAY} study fee only. Does not cover tax liability, IRS outcomes, or audit costs.
              Informational only — not tax or legal advice. Results depend on data provided.{" "}
              <Link href="/terms" style={{ color: "var(--turq)", textDecoration: "underline" }}>
                Terms
              </Link>{" "}
              &middot;{" "}
              <Link href="/disclaimers" style={{ color: "var(--turq)", textDecoration: "underline" }}>
                Disclaimers
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
