"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import Link from "next/link";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

const steps = [
  {
    number: "01",
    heading: "Say: \u201CI want to do a cost segregation study.\u201D",
    body: "Most CPAs know exactly what this means — the economics just never worked for individual STR owners before. At legacy prices of $5K–$15K per study, it was a commercial tool. At Abode's price, the conversation is worth having.",
  },
  {
    number: "02",
    heading: "Hand them the report. They do the rest.",
    body: "Abode produces a PDF study and Excel fixed asset schedule in the exact format your CPA expects. There's nothing to translate, no back-and-forth — they file it the same way they'd file a study from any engineering firm.",
  },
  {
    number: "03",
    heading: "Ask about Form 3115 if you bought years ago.",
    body: "If you've owned your STR for more than a year without a cost seg study, you may be able to claim all the missed deductions at once. Your CPA files IRS Form 3115 — no amended returns, just a single catch-up adjustment on your current year return.",
  },
];

const cpaFAQ = [
  {
    q: "Does this hold up to an IRS audit?",
    a: "The study is your documentation — the same function as any other supporting schedule in your tax return. Abode follows IRS Cost Segregation Audit Techniques Guide (ATG) methodology.",
  },
  {
    q: "Is this different from a traditional engineering study?",
    a: "Functionally equivalent for residential STR properties. The study produces the same asset classifications, the same depreciation schedules, and the same deliverables — faster and at a fraction of the cost.",
  },
  {
    q: "What's my liability if this is reviewed?",
    a: "Your liability is the same as any deduction you file — the underlying data needs to be accurate. That's why we ask detailed questions about the property during the quiz.",
  },
];

export default function CPAGuideSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" style={{ background: "var(--surface)" }}>
      <div className="container" ref={ref}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
            maxWidth: 960,
            margin: "0 auto",
            alignItems: "start",
          }}
        >
          {/* Left column */}
          <div>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)", color: "var(--adobe)" }}>
              For You &amp; Your CPA
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-2)" }}>
              Your CPA knows cost segregation.
              <br />
              They just didn&apos;t think to offer it.
            </h2>
            <p className="body-text reveal" style={{ fontSize: 16, maxWidth: 480, marginBottom: "var(--space-5)" }}>
              Cost segregation has been in the tax code for 30 years. Your CPA knows it
              exists. The reason it wasn&apos;t on your return is straightforward: at
              $5,000–$15,000 per study, the economics never worked for individual STR
              owners. At {STUDY_PRICE_DISPLAY}, they do.
            </p>

            <div
              className="reveal-stagger"
              style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginBottom: "var(--space-5)" }}
            >
              {steps.map((step, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{
                    display: "flex", gap: "var(--space-3)", alignItems: "flex-start",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "var(--adobe)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(184,80,48,0.28)",
                    marginTop: 2,
                  }}>
                    {step.number}
                  </div>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-primary)", fontWeight: 600,
                      fontSize: 15, color: "var(--ink)", marginBottom: 4,
                      fontStyle: "italic",
                    }}>
                      {step.heading}
                    </div>
                    <p style={{ fontSize: 14, color: "var(--ink-mid)", lineHeight: 1.7, margin: 0 }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="reveal">
              <Link href="/quiz" className="btn btn-primary">
                Get the Study — Bring It to Your CPA
              </Link>
            </div>
          </div>

          {/* Right column — CPA FAQ card */}
          <div
            className="reveal"
            style={{ display: "none" }}
          >
            <div style={{
              background: "var(--surface-raised)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--adobe)",
                letterSpacing: "0.08em", marginBottom: "var(--space-3)",
              }}>
                WHAT YOUR CPA WILL ASK
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                {cpaFAQ.map((item, i) => (
                  <div key={i} style={{
                    paddingBottom: i < cpaFAQ.length - 1 ? "var(--space-3)" : 0,
                    borderBottom: i < cpaFAQ.length - 1 ? "1px solid var(--border)" : "none",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-primary)", fontWeight: 600,
                      fontSize: 14, color: "var(--ink)", marginBottom: 6,
                    }}>
                      {item.q}
                    </div>
                    <p style={{
                      fontSize: 13, color: "var(--ink-mid)", lineHeight: 1.7, margin: 0,
                    }}>
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>

              {/* Trust footer */}
              <div style={{
                marginTop: "var(--space-3)", paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--border)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2L3.5 4.5V9.5C3.5 13.09 6.26 16.45 10 17.5C13.74 16.45 16.5 13.09 16.5 9.5V4.5L10 2Z"
                    stroke="var(--adobe)" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M7 10L9 12L13 8" stroke="var(--adobe)" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{
                  fontSize: 12, color: "var(--dust)", fontFamily: "var(--font-primary)",
                }}>
                  Study follows IRS Cost Segregation Audit Techniques Guide methodology
                </span>
              </div>
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
