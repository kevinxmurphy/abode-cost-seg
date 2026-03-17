"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { STUDY_PRICE_DISPLAY, STUDY_PRICE } from "@/lib/pricing";
import { Check, X, ArrowRight, Shield } from "lucide-react";

const included = [
  "Full IRS-compliant cost segregation study",
  "Asset classification: 5, 7, 15, and 27.5-year property",
  "100% bonus depreciation calculations (OBBBA rates)",
  "PDF report formatted for CPA filing",
  "Excel fixed asset schedule",
  "Catch-up deduction analysis (Form 3115 guidance)",
  "Land vs. building split documentation",
];

const comparison = [
  { feature: "Cost", abode: STUDY_PRICE_DISPLAY, firm: "$5,000–$15,000" },
  { feature: "Turnaround", abode: "Minutes", firm: "4–8 weeks" },
  { feature: "Site visit required", abode: "No", firm: "Yes" },
  { feature: "Asset classification report", abode: "Yes", firm: "Yes" },
  { feature: "PDF + Excel deliverables", abode: "Yes", firm: "Yes" },
  { feature: "IRS ATG methodology", abode: "Yes", firm: "Yes" },
  { feature: "Bonus depreciation calc", abode: "Yes", firm: "Yes" },
  { feature: "Form 3115 guidance", abode: "Yes", firm: "Varies" },
  { feature: "Minimum property size", abode: "None", firm: "$500K+" },
  { feature: "Money-back guarantee", abode: "90 days", firm: "No" },
];

const objections = [
  {
    q: `Why is it ${STUDY_PRICE_DISPLAY} and not more?`,
    a: `Engineering firms charge $5K–$15K because they send a physical engineer to your property, bill hourly, and carry significant overhead. We use AI trained on the same IRS Cost Segregation Audit Techniques Guide, combined with detailed property data you provide. The methodology is equivalent. The delivery is not.`,
  },
  {
    q: "Will my CPA accept this?",
    a: "Most CPAs work with cost segregation studies regularly — it's a standard deliverable format. Our PDF and Excel output follows the same structure CPAs receive from traditional engineering firms. If your CPA has specific questions, have them reach out or review our sample study.",
  },
  {
    q: "What if I'm not satisfied?",
    a: "Full refund within 90 days. No questions. The guarantee covers the study fee — it doesn't cover tax outcomes, which depend on your complete tax situation and your CPA's filing.",
  },
  {
    q: "Is this a subscription?",
    a: `No. ${STUDY_PRICE_DISPLAY} per property, one time. You receive the study; you own it permanently. No account fees, no renewal, no surprises.`,
  },
  {
    q: "What if I bought my property years ago?",
    a: "You can still do a cost segregation study. Your CPA files IRS Form 3115 to claim all missed accelerated depreciation in a single current-year deduction — no amended returns required. Our study includes catch-up analysis.",
  },
];

export default function PricingPageContent() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        style={{
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-10)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
            Pricing
          </div>
          <h1
            className="h1-hero"
            style={{ maxWidth: "680px", margin: "0 auto var(--space-3)" }}
          >
            One price. Full access.{" "}
            <span style={{ color: "var(--turq)" }}>No gatekeepers.</span>
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "17px",
              maxWidth: "500px",
              margin: "0 auto var(--space-5)",
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            Engineering firms charge $5,000–$15,000 and take 4–8 weeks. We charge{" "}
            {STUDY_PRICE_DISPLAY} and deliver in minutes. Same IRS methodology. Different era.
          </p>

          {/* ROI quick calc */}
          <div
            style={{
              display: "inline-grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "var(--space-4)",
              background: "var(--surface)",
              border: "1px solid var(--surface-2)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4) var(--space-6)",
              marginBottom: "var(--space-6)",
              textAlign: "center",
            }}
          >
            {[
              { val: STUDY_PRICE_DISPLAY, label: "Study fee" },
              { val: "~$44K", label: "Avg. first-year deduction*" },
              { val: "~28×", label: "Year-1 return (32% bracket)" },
            ].map(({ val, label }) => (
              <div key={label}>
                <div
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 800,
                    fontSize: "clamp(22px, 3vw, 30px)",
                    color: "var(--ink)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {val}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--dust)", marginTop: "6px" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <p
            className="mono"
            style={{ fontSize: "10px", color: "var(--dust)", marginTop: "-var(--space-4)" }}
          >
            *Based on avg. $500K STR property. Your results will vary.
          </p>
        </div>
      </section>

      {/* ─── Pricing card ─── */}
      <section style={{ paddingBottom: "var(--space-10)" }}>
        <div className="container" ref={ref1}>
          <div style={{ maxWidth: "480px", margin: "0 auto" }}>
            {/* Badge */}
            <div style={{ textAlign: "center", marginBottom: "-12px", position: "relative", zIndex: 2 }}>
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
                STR Cost Segregation Study
              </span>
            </div>

            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--surface-2)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-6)",
                boxShadow: "var(--shadow-md), var(--shadow-glow)",
              }}
            >
              {/* Previously unavailable note */}
              <div
                className="mono"
                style={{
                  color: "var(--adobe)",
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  textAlign: "center",
                  marginBottom: "var(--space-2)",
                }}
              >
                Previously only available to commercial investors
              </div>

              {/* Price */}
              <div style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
                <span
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 800,
                    fontSize: "72px",
                    color: "var(--ink)",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  {STUDY_PRICE_DISPLAY}
                </span>
                <div style={{ fontSize: "13px", color: "var(--dust)", marginTop: "6px" }}>
                  one-time · per property · no subscription
                </div>
              </div>

              {/* What's included */}
              <div
                style={{
                  borderTop: "1px solid var(--surface-2)",
                  paddingTop: "var(--space-4)",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>
                  What&apos;s Included
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {included.map((item) => (
                    <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
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

              <Link
                href="/quiz"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", display: "block", textAlign: "center" }}
              >
                Start My Study — {STUDY_PRICE_DISPLAY}
              </Link>

              {/* Guarantee */}
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
                }}
              >
                <Shield size={18} style={{ color: "var(--adobe)", flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "var(--adobe-dark)",
                      marginBottom: "2px",
                      fontFamily: "var(--font-primary)",
                    }}
                  >
                    90-Day Money-Back Guarantee
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--adobe)", lineHeight: 1.5, fontFamily: "var(--font-primary)" }}>
                    Not satisfied for any reason? Full refund. No questions asked.
                  </div>
                </div>
              </div>

              <div
                className="mono"
                style={{
                  fontSize: "10px",
                  color: "var(--dust)",
                  marginTop: "var(--space-3)",
                  lineHeight: 1.5,
                  borderTop: "1px solid var(--surface-2)",
                  paddingTop: "var(--space-2)",
                  textAlign: "center",
                }}
              >
                Guarantee covers the {STUDY_PRICE_DISPLAY} fee only. Not tax outcomes or IRS decisions.{" "}
                <Link href="/terms" style={{ color: "var(--turq)" }}>Terms</Link>{" "}
                &middot;{" "}
                <Link href="/disclaimers" style={{ color: "var(--turq)" }}>Disclaimers</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comparison table ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref2}>
          <div className="eyebrow reveal" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            How We Compare
          </div>
          <h2
            className="h2-section reveal"
            style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
          >
            Same IRS methodology. A very different price.
          </h2>

          <div style={{ maxWidth: "680px", margin: "0 auto", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.06em",
                      color: "var(--dust)",
                      fontWeight: 500,
                      borderBottom: "2px solid var(--surface-2)",
                    }}
                  >
                    FEATURE
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "10px 16px",
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "var(--turq)",
                      borderBottom: "2px solid var(--turq)",
                      background: "var(--turq-bg)",
                    }}
                  >
                    Abode
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "10px 16px",
                      fontFamily: "var(--font-primary)",
                      fontWeight: 600,
                      fontSize: "14px",
                      color: "var(--dust)",
                      borderBottom: "2px solid var(--surface-2)",
                    }}
                  >
                    Engineering Firm
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparison.map(({ feature, abode, firm }, i) => (
                  <tr
                    key={feature}
                    style={{ background: i % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)" }}
                  >
                    <td
                      style={{
                        padding: "10px 16px",
                        color: "var(--ink-mid)",
                        fontFamily: "var(--font-primary)",
                      }}
                    >
                      {feature}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "center",
                        fontWeight: 600,
                        color:
                          abode === "No" || abode === "Varies"
                            ? "var(--dust)"
                            : "var(--ink)",
                        background: "rgba(26,140,140,0.04)",
                        fontFamily: "var(--font-primary)",
                      }}
                    >
                      {abode === "Yes" ? (
                        <Check size={16} color="var(--turq)" style={{ margin: "0 auto", display: "block" }} />
                      ) : abode === "No" ? (
                        <X size={16} color="var(--dust)" style={{ margin: "0 auto", display: "block" }} />
                      ) : (
                        abode
                      )}
                    </td>
                    <td
                      style={{
                        padding: "10px 16px",
                        textAlign: "center",
                        color: "var(--ink-mid)",
                        fontFamily: "var(--font-primary)",
                      }}
                    >
                      {firm === "Yes" ? (
                        <Check size={16} color="var(--ink-mid)" style={{ margin: "0 auto", display: "block" }} />
                      ) : firm === "No" ? (
                        <X size={16} color="var(--dust)" style={{ margin: "0 auto", display: "block" }} />
                      ) : (
                        firm
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Objections / FAQ ─── */}
      <section className="section">
        <div className="container" ref={ref3}>
          <div className="eyebrow reveal" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            Common Questions
          </div>
          <h2
            className="h2-section reveal"
            style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
          >
            Answers before you buy.
          </h2>

          <div
            style={{
              maxWidth: "680px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {objections.map(({ q, a }) => (
              <div
                key={q}
                className="reveal"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 700,
                    fontSize: "15px",
                    color: "var(--ink)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {q}
                </div>
                <p className="body-text" style={{ fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                  {a}
                </p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div style={{ textAlign: "center", marginTop: "var(--space-8)" }}>
            <Link href="/quiz" className="btn btn-primary btn-lg">
              Get My Free Estimate First
              <ArrowRight size={16} style={{ marginLeft: "6px" }} />
            </Link>
            <p
              className="body-text"
              style={{
                fontSize: "13px",
                color: "var(--dust)",
                marginTop: "var(--space-2)",
              }}
            >
              Free estimate takes 2 minutes. No account required. Pay only when you&apos;re ready.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
