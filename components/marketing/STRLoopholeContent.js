"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ArrowRight, Check, AlertCircle } from "lucide-react";

const qualifications = [
  "You personally manage guest communications, cleanings, or maintenance",
  "Your average guest stay is 7 days or fewer (most Airbnb/VRBO properties qualify)",
  "You meet at least one material participation test (most active STR owners do)",
  "You have ordinary income you want to offset — W-2, business income, etc.",
];

const steps = [
  {
    number: "01",
    title: "Confirm your average guest stay is ≤7 days",
    body: "This is the STR loophole trigger. If your average guest stay is 7 days or fewer, your rental is classified as a short-term rental — not a passive rental activity. This single fact changes everything about how your losses are treated.",
  },
  {
    number: "02",
    title: "Prove material participation",
    body: "You need to qualify under one of the IRS's 7 material participation tests. For most active STR owners, the easiest is the 100-hour test: you personally spend at least 100 hours on the rental, and no one else spends more hours than you. Guest communications, coordinating cleanings, maintenance calls, and direct management all count.",
  },
  {
    number: "03",
    title: "Get a cost segregation study",
    body: "This is where the strategy becomes explosive. A cost seg study reclassifies your property's components — appliances, furnishings, outdoor amenities — from 27.5-year depreciation into 5, 7, and 15-year categories. With 100% bonus depreciation (now permanent under the OBBBA), those assets can be fully deducted in year one.",
  },
  {
    number: "04",
    title: "Use the losses against your ordinary income",
    body: "Here's the payoff. Because you meet the STR and material participation requirements, your depreciation losses are non-passive. They flow directly against your W-2, business income, or other ordinary income — reducing your taxable income dollar for dollar, at your marginal rate.",
  },
];

export default function STRLoopholeContent() {
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
            The STR Tax Loophole
          </div>
          <h1
            className="h1-hero"
            style={{ maxWidth: "820px", margin: "0 auto var(--space-4)" }}
          >
            The most powerful tax strategy in the code.
            <br />
            <span style={{ color: "var(--turq)" }}>Most Airbnb owners have never heard of it.</span>
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "17px",
              maxWidth: "560px",
              margin: "0 auto var(--space-6)",
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            The short-term rental tax loophole lets STR investors use large depreciation losses
            against ordinary income — W-2 salary, business income, anything. Cost segregation
            is what makes it explosive.
          </p>

          {/* Two stat cards */}
          <div
            style={{
              display: "inline-grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
              marginBottom: "var(--space-5)",
            }}
          >
            {[
              { val: "$44K+", desc: "Avg. first-year deduction from cost seg on a $500K STR" },
              { val: "37%", desc: "Max tax savings rate — every dollar deducted at your marginal rate" },
            ].map(({ val, desc }) => (
              <div
                key={val}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--surface-2)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 800,
                    fontSize: "clamp(28px, 4vw, 40px)",
                    color: "var(--turq)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {val}
                </div>
                <p
                  className="body-text"
                  style={{ fontSize: "13px", color: "var(--dust)", margin: 0, lineHeight: 1.5 }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/quiz" className="btn btn-primary">
              See My Savings Estimate
              <ArrowRight size={16} style={{ marginLeft: "6px" }} />
            </Link>
            <Link href="/learn/what-is-the-str-tax-loophole" className="btn btn-ghost">
              Read the Full Guide
            </Link>
          </div>
        </div>
      </section>

      {/* ─── What the loophole actually is ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref1}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              The Core Mechanic
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-4)" }}>
              What the loophole actually does.
            </h2>

            <div className="reveal" style={{ marginBottom: "var(--space-5)" }}>
              <p className="body-text" style={{ fontSize: "16px", lineHeight: 1.8, marginBottom: "var(--space-3)" }}>
                Under normal IRS rules, rental property losses are{" "}
                <strong>passive</strong> — meaning they can only offset other passive
                income. Most W-2 earners and business owners have zero passive income.
                So the losses sit unused, carried forward indefinitely.
              </p>
              <p className="body-text" style={{ fontSize: "16px", lineHeight: 1.8 }}>
                The STR loophole punches through that wall. If your rental qualifies as a
                short-term rental (average stay ≤7 days) and you meet material
                participation, the IRS treats your losses as{" "}
                <strong>non-passive</strong>. They flow directly against your W-2, your
                business income, your spouse&rsquo;s salary — any ordinary income. Dollar for
                dollar, at your marginal rate.
              </p>
            </div>

            {/* The math box */}
            <div
              className="reveal"
              style={{
                background: "var(--turq-bg)",
                border: "1px solid var(--turq-light)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-5)",
              }}
            >
              <div className="ui-label" style={{ marginBottom: "var(--space-3)", color: "var(--turq)" }}>
                A simple example — $600K STR property
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                {[
                  ["Purchase price", "$600,000"],
                  ["Land value (excluded)", "−$90,000"],
                  ["Depreciable basis", "$510,000"],
                  ["Cost seg reclassifies (est. 25%)", "$127,500 → 5, 7, 15-yr property"],
                  ["Bonus depreciation at 100%", "$127,500 deducted in year one"],
                  ["Tax savings at 37% bracket", "≈ $47,175 cash back"],
                ].map(([label, val], i) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "var(--space-3)",
                      paddingBottom: i < 5 ? "var(--space-2)" : 0,
                      borderBottom: i < 5 ? "1px solid var(--turq-light)" : "none",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "var(--ink-mid)", fontFamily: "var(--font-primary)" }}>
                      {label}
                    </span>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: i === 5 ? 700 : 500,
                        color: i === 5 ? "var(--turq)" : "var(--ink)",
                        fontFamily: "var(--font-primary)",
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {val}
                    </span>
                  </div>
                ))}
              </div>
              <p
                className="mono"
                style={{ fontSize: "10px", color: "var(--dust)", marginTop: "var(--space-3)", lineHeight: 1.5 }}
              >
                Illustrative example only. Results vary based on property, tax bracket, and individual circumstances. Not tax advice — consult a CPA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Do you qualify ─── */}
      <section className="section">
        <div className="container" ref={ref2}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              Do You Qualify?
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-4)" }}>
              Most active Airbnb owners do.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-5)" }}>
              {qualifications.map((q) => (
                <div
                  key={q}
                  className="reveal"
                  style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)" }}
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
                    {q}
                  </span>
                </div>
              ))}
            </div>

            {/* Disclaimer callout */}
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
              }}
            >
              <AlertCircle size={18} style={{ color: "var(--adobe)", flexShrink: 0, marginTop: 1 }} />
              <p className="body-text" style={{ fontSize: "13px", color: "var(--adobe-dark)", margin: 0, lineHeight: 1.6 }}>
                <strong>Always confirm with your CPA.</strong> The STR loophole has specific
                requirements around guest stay length, material participation, and passive activity rules.
                The free estimate below will help you understand your situation — but your tax professional
                should confirm before filing.
              </p>
            </div>

            <div className="reveal">
              <Link href="/quiz" className="btn btn-primary">
                Check My Property — Free Estimate
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── The 4 steps ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref3}>
          <div className="eyebrow reveal" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            How to Use It
          </div>
          <h2
            className="h2-section reveal"
            style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
          >
            Four steps from Airbnb owner to tax winner.
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
                    fontWeight: 500,
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
              Your Next Step
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-3)" }}>
              Find out what your property qualifies for.
            </h2>
            <p
              className="body-text reveal"
              style={{ fontSize: "16px", margin: "0 auto var(--space-5)", lineHeight: 1.7 }}
            >
              Answer a few questions about your STR. We&rsquo;ll show you an estimated
              first-year deduction and tax savings — before you spend a dollar.
            </p>
            <div
              className="reveal"
              style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/quiz" className="btn btn-primary">
                Get My Free Estimate
              </Link>
              <Link href="/learn/what-is-cost-segregation-definition" className="btn btn-ghost">
                Cost Seg 101
              </Link>
              <Link href="/learn/what-is-material-participation" className="btn btn-ghost">
                Material Participation Guide
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
