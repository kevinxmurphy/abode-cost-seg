"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ArrowRight, AlertCircle } from "lucide-react";

const timeline = [
  { year: "2017–2022", rate: "100%", note: "Tax Cuts & Jobs Act — 100% bonus on eligible property" },
  { year: "2023", rate: "80%", note: "Phase-down begins" },
  { year: "2024", rate: "60%", note: "Continued phase-down" },
  { year: "Jan 1–19, 2025", rate: "40%", note: "Final days of the phase-down" },
  { year: "Jan 19, 2025+", rate: "100%", note: "OBBBA signed July 4, 2025 — permanently restored", highlight: true },
];

const termEquivalents = [
  {
    term: "Bonus depreciation",
    meaning: "The IRS tax code provision — Section 168(k) — that allows immediate expensing of eligible assets",
    who: "Your CPA, the IRS, tax legislation",
  },
  {
    term: "Cost segregation",
    meaning: "The engineering study that identifies which assets qualify for bonus depreciation",
    who: "Engineering firms, CPAs, Abode",
  },
  {
    term: "Accelerated depreciation",
    meaning: "The general concept: taking deductions faster than the standard 27.5-year schedule",
    who: "Finance articles, investors",
  },
  {
    term: "Section 179",
    meaning: "A different first-year expensing provision — similar result but with caps and limitations",
    who: "Small business context, personal property",
  },
];

const steps = [
  {
    number: "01",
    title: "Get a cost segregation study",
    body: "The study identifies which components of your property qualify for 5-year, 7-year, or 15-year depreciation instead of 27.5 years. Appliances, furnishings, outdoor amenities, and specialty systems are typical candidates.",
  },
  {
    number: "02",
    title: "Apply 100% bonus depreciation",
    body: "Under the OBBBA (signed July 4, 2025), all 5-year and 7-year property placed in service after January 19, 2025 qualifies for 100% immediate expensing. The full asset value is deducted in year one — not spread over years.",
  },
  {
    number: "03",
    title: "Use the STR loophole to activate the deductions",
    body: "Bonus depreciation creates paper losses. For most rental investors, those losses are passive — useless against W-2 income. The STR loophole changes that: if your property qualifies, those losses become non-passive and offset any ordinary income.",
  },
];

export default function BonusDepreciationContent() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();
  const ref4 = useScrollReveal();

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
            Bonus Depreciation
          </div>
          <h1
            className="h1-hero"
            style={{ maxWidth: "820px", margin: "0 auto var(--space-4)" }}
          >
            100% bonus depreciation is permanent.
            <br />
            <span style={{ color: "var(--turq)" }}>What that means for your Airbnb.</span>
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "17px",
              maxWidth: "560px",
              margin: "0 auto var(--space-5)",
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            The One Big Beautiful Bill Act (OBBBA), signed July 4, 2025, permanently
            reinstated 100% bonus depreciation for qualifying property acquired after
            January 19, 2025. Combined with a cost segregation study, this is the single
            biggest first-year tax deduction available to STR investors.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quiz" className="btn btn-primary">
              Calculate My Deduction
              <ArrowRight size={16} style={{ marginLeft: "6px" }} />
            </Link>
            <Link href="/learn/what-is-bonus-depreciation" className="btn btn-ghost">
              Deep Dive Guide
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Same thing, different terms ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref1}>
          <div style={{ maxWidth: "760px", margin: "0 auto" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              Clearing Up the Terminology
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-3)" }}>
              &ldquo;Bonus depreciation&rdquo; and &ldquo;cost segregation&rdquo;
              are two different things — but investors use them interchangeably.
            </h2>
            <p
              className="body-text reveal"
              style={{ fontSize: "15px", lineHeight: 1.8, marginBottom: "var(--space-5)", color: "var(--ink-mid)" }}
            >
              It&rsquo;s confusing because they&rsquo;re almost always used together. Here&rsquo;s the actual
              distinction — and why it matters for your taxes.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {termEquivalents.map(({ term, meaning, who }, i) => (
                <div
                  key={term}
                  className="reveal"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "180px 1fr",
                    gap: "var(--space-4)",
                    padding: "var(--space-4)",
                    background: i === 0 || i === 1 ? "var(--turq-bg)" : "rgba(0,0,0,0.02)",
                    border: `1px solid ${i === 0 || i === 1 ? "var(--turq-light)" : "var(--surface-2)"}`,
                    borderRadius: "var(--radius-md)",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-primary)",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: i === 0 || i === 1 ? "var(--turq)" : "var(--ink)",
                        marginBottom: "4px",
                      }}
                    >
                      {term}
                    </div>
                    <div
                      className="mono"
                      style={{ fontSize: "10px", color: "var(--dust)", lineHeight: 1.4 }}
                    >
                      Used by: {who}
                    </div>
                  </div>
                  <p
                    className="body-text"
                    style={{ fontSize: "14px", lineHeight: 1.65, margin: 0 }}
                  >
                    {meaning}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="reveal"
              style={{
                marginTop: "var(--space-4)",
                padding: "var(--space-3)",
                background: "var(--ink)",
                borderRadius: "var(--radius-md)",
                color: "#fff",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-primary)",
                  fontWeight: 600,
                  fontSize: "15px",
                  margin: 0,
                  lineHeight: 1.6,
                  color: "rgba(255,255,255,0.9)",
                }}
              >
                <span style={{ color: "var(--turq)" }}>The short version:</span>{" "}
                Cost segregation is the study. Bonus depreciation is the tax rule that makes the
                study so valuable. You need both. Abode gives you both.
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 540px) {
            div[style*="gridTemplateColumns: 180px 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ─── OBBBA timeline ─── */}
      <section className="section">
        <div className="container" ref={ref2}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              The OBBBA Changed Everything
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-4)" }}>
              Bonus depreciation history — and why right now matters.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {timeline.map(({ year, rate, note, highlight }, i) => (
                <div
                  key={year}
                  className="reveal"
                  style={{
                    display: "flex",
                    gap: "var(--space-4)",
                    position: "relative",
                  }}
                >
                  {/* Vertical line */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "20px", flexShrink: 0 }}>
                    <div
                      style={{
                        width: highlight ? 16 : 12,
                        height: highlight ? 16 : 12,
                        borderRadius: "50%",
                        background: highlight ? "var(--turq)" : "var(--surface-2)",
                        border: highlight ? "3px solid var(--turq)" : "2px solid var(--surface-2)",
                        flexShrink: 0,
                        boxShadow: highlight ? "var(--shadow-turq)" : "none",
                        marginTop: "16px",
                      }}
                    />
                    {i < timeline.length - 1 && (
                      <div style={{ width: 2, flex: 1, background: "var(--surface-2)", minHeight: "32px" }} />
                    )}
                  </div>

                  <div
                    style={{
                      paddingBottom: "var(--space-4)",
                      paddingTop: "12px",
                      background: highlight
                        ? "var(--turq-bg)"
                        : "transparent",
                      border: highlight ? "1px solid var(--turq-light)" : "none",
                      borderRadius: highlight ? "var(--radius-md)" : 0,
                      padding: highlight ? "var(--space-3) var(--space-4)" : "12px 0 var(--space-3) 0",
                      flex: 1,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", flexWrap: "wrap" }}>
                      <span
                        className="mono"
                        style={{ fontSize: "11px", color: "var(--dust)", letterSpacing: "0.04em" }}
                      >
                        {year}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-primary)",
                          fontWeight: 800,
                          fontSize: "22px",
                          color: highlight ? "var(--turq)" : "var(--ink)",
                          letterSpacing: "-0.02em",
                          lineHeight: 1,
                        }}
                      >
                        {rate}
                      </span>
                    </div>
                    <p
                      className="body-text"
                      style={{
                        fontSize: "13px",
                        color: highlight ? "var(--ink)" : "var(--ink-mid)",
                        fontWeight: highlight ? 600 : 400,
                        margin: "4px 0 0",
                        lineHeight: 1.5,
                      }}
                    >
                      {note}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How to use it ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref3}>
          <div className="eyebrow reveal" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            Putting It Together
          </div>
          <h2 className="h2-section reveal" style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            Three steps to your first-year deduction.
          </h2>

          <div
            style={{
              maxWidth: "720px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="reveal"
                style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: "var(--turq)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    boxShadow: "var(--shadow-turq)",
                    marginTop: 2,
                  }}
                >
                  {step.number}
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "var(--ink)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {step.title}
                  </h3>
                  <p className="body-text" style={{ fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section">
        <div className="container" ref={ref4}>
          <div style={{ maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              Act Before Year-End
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-3)" }}>
              Every year without a cost seg study is a missed deduction.
            </h2>
            <p
              className="body-text reveal"
              style={{ fontSize: "16px", margin: "0 auto var(--space-2)", lineHeight: 1.7, color: "var(--ink-mid)" }}
            >
              Missed years can be recovered with a look-back study + Form 3115 — but only for
              years where the statute of limitations is still open. Don&rsquo;t let more time pass.
            </p>
            <div
              className="reveal"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--space-2)",
                background: "var(--adobe-light)",
                border: "1px solid rgba(184,80,48,0.2)",
                borderRadius: "var(--radius-md)",
                padding: "var(--space-3)",
                marginBottom: "var(--space-5)",
                textAlign: "left",
              }}
            >
              <AlertCircle size={16} style={{ color: "var(--adobe)", flexShrink: 0, marginTop: 2 }} />
              <p className="body-text" style={{ fontSize: "13px", color: "var(--adobe-dark)", margin: 0, lineHeight: 1.6 }}>
                Properties acquired before January 19, 2025 are subject to different bonus
                depreciation rates. Your CPA should confirm the applicable rate. Abode&rsquo;s
                study includes the correct calculation for your acquisition date.
              </p>
            </div>
            <div
              className="reveal"
              style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/quiz" className="btn btn-primary">
                Get My Free Estimate
              </Link>
              <Link href="/str-tax-loophole" className="btn btn-ghost">
                STR Loophole Explained
              </Link>
              <Link href="/learn/what-is-form-3115" className="btn btn-ghost">
                Form 3115 Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
