"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ArrowRight, BookOpen } from "lucide-react";

const categories = [
  {
    label: "The Core Strategy",
    color: "var(--turq)",
    colorBg: "var(--turq-bg)",
    colorBorder: "var(--turq-light)",
    terms: [
      {
        slug: "what-is-cost-segregation-definition",
        term: "Cost Segregation",
        def: "An IRS-approved engineering study that reclassifies building components into shorter depreciation categories (5, 7, 15 years) to accelerate first-year tax deductions.",
        also: "accelerated depreciation, cost seg study",
      },
      {
        slug: "what-is-the-str-tax-loophole",
        term: "STR Tax Loophole",
        def: "A provision that allows short-term rental owners who materially participate to treat depreciation losses as non-passive — deducting them against W-2 or business income.",
        also: "short-term rental loophole, Airbnb tax loophole",
      },
      {
        slug: "what-is-bonus-depreciation",
        term: "Bonus Depreciation",
        def: "A tax provision (Section 168(k)) allowing immediate 100% expensing of eligible 5-year and 7-year property in the year placed in service. Made permanent by the OBBBA (2025).",
        also: "first-year bonus, 100% bonus, Section 168(k)",
      },
    ],
  },
  {
    label: "Depreciation Basics",
    color: "var(--adobe)",
    colorBg: "var(--adobe-light)",
    colorBorder: "rgba(184,80,48,0.18)",
    terms: [
      {
        slug: "what-is-depreciation-rental-property",
        term: "Depreciation",
        def: "The IRS mechanism that lets rental property owners deduct the cost of their building over time — typically 27.5 years for residential property.",
        also: "straight-line depreciation, MACRS depreciation",
      },
      {
        slug: "what-is-macrs-depreciation",
        term: "MACRS",
        def: "Modified Accelerated Cost Recovery System — the IRS framework defining depreciation periods (5, 7, 15, 27.5 years) for different property types.",
        also: "accelerated cost recovery, asset class lives",
      },
      {
        slug: "what-is-cost-basis-rental-property",
        term: "Cost Basis",
        def: "The starting value used to calculate depreciation — typically your purchase price minus land value, plus qualifying improvements.",
        also: "adjusted basis, depreciable basis",
      },
      {
        slug: "what-is-depreciation-recapture",
        term: "Depreciation Recapture",
        def: "When you sell a rental property, the IRS \"recaptures\" prior depreciation deductions at a 25% rate. Planning around this is part of any full cost seg strategy.",
        also: "Section 1250 recapture, unrecaptured Section 1250 gain",
      },
      {
        slug: "what-is-section-179-rental-property",
        term: "Section 179",
        def: "A separate first-year expensing election for personal property. Overlaps with bonus depreciation but has income limitations — consult your CPA on which applies.",
        also: "Section 179 deduction, first-year expensing",
      },
    ],
  },
  {
    label: "Qualifications & Tests",
    color: "var(--ink)",
    colorBg: "var(--surface)",
    colorBorder: "var(--surface-2)",
    terms: [
      {
        slug: "what-is-material-participation",
        term: "Material Participation",
        def: "The IRS standard for proving you're actively involved in your rental activity — required to claim STR losses as non-passive. Most active STR owners qualify under the 100-hour test.",
        also: "active participation, 100-hour test, 500-hour test",
      },
      {
        slug: "what-is-real-estate-professional-status",
        term: "Real Estate Professional Status (REPS)",
        def: "A separate IRS designation requiring 750+ hours in real estate activities — more demanding than the STR loophole but applicable to long-term rentals too.",
        also: "REPS, real estate professional, 750-hour test",
      },
      {
        slug: "what-is-passive-activity-loss",
        term: "Passive Activity Loss (PAL)",
        def: "Losses from activities you don't materially participate in. Rental losses are passive by default — suspended until you have passive income or sell the property.",
        also: "passive losses, PAL rules, suspended losses",
      },
      {
        slug: "what-is-niit-rental-property",
        term: "Net Investment Income Tax (NIIT)",
        def: "A 3.8% surtax on investment income — including rental income — for high-income taxpayers. Active participation or REPS can reduce or eliminate it.",
        also: "3.8% surtax, Medicare surtax, net investment income",
      },
    ],
  },
  {
    label: "Tools & Tax Forms",
    color: "var(--turq)",
    colorBg: "var(--turq-bg)",
    colorBorder: "var(--turq-light)",
    terms: [
      {
        slug: "what-is-form-3115",
        term: "Form 3115",
        def: "IRS Change in Accounting Method form — used to claim all missed accelerated depreciation from prior years in a single current-year deduction. No amended returns required.",
        also: "look-back study, catch-up depreciation, accounting method change",
      },
      {
        slug: "what-is-1031-exchange-rental-property",
        term: "1031 Exchange",
        def: "A tax-deferred property sale — you swap one investment property for another and defer capital gains (and depreciation recapture). Interacts with cost seg strategy on exit.",
        also: "like-kind exchange, tax-deferred exchange",
      },
      {
        slug: "what-is-qbi-deduction-rental",
        term: "QBI Deduction",
        def: "Qualified Business Income deduction — up to 20% deduction on qualified business income. Made permanent under the OBBBA. May apply to some STR activities.",
        also: "Section 199A, 20% deduction, pass-through deduction",
      },
    ],
  },
];

export default function GlossaryContent() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();

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
            Glossary
          </div>
          <h1
            className="h1-hero"
            style={{ maxWidth: "680px", margin: "0 auto var(--space-3)" }}
          >
            The STR tax terms you need to know.
            <br />
            <span style={{ color: "var(--turq)" }}>In plain English.</span>
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "17px",
              maxWidth: "520px",
              margin: "0 auto",
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            The tax code uses terminology that accountants understand and everyone else finds
            alienating. We wrote definitions that don&rsquo;t require a law degree — with links
            to deep-dive articles where you need them.
          </p>
        </div>
      </section>

      {/* ─── Categories ─── */}
      <section style={{ paddingBottom: "var(--space-12)" }}>
        <div className="container" ref={ref1}>
          <div
            style={{
              maxWidth: "860px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-10)",
            }}
          >
            {categories.map(({ label, color, colorBg, colorBorder, terms }) => (
              <div key={label}>
                {/* Category header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "var(--space-2)",
                    marginBottom: "var(--space-4)",
                    paddingBottom: "var(--space-2)",
                    borderBottom: `2px solid ${colorBorder}`,
                  }}
                >
                  <BookOpen size={16} style={{ color }} strokeWidth={2} />
                  <span
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {label}
                  </span>
                </div>

                {/* Terms grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
                    gap: "var(--space-3)",
                  }}
                >
                  {terms.map(({ slug, term, def, also }) => (
                    <Link
                      key={slug}
                      href={`/learn/${slug}`}
                      style={{
                        display: "block",
                        background: colorBg,
                        border: `1px solid ${colorBorder}`,
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-4)",
                        textDecoration: "none",
                        transition: "box-shadow var(--dur-fast) var(--ease-out), transform var(--dur-fast) var(--ease-out)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)", marginBottom: "var(--space-1)" }}>
                        <span
                          style={{
                            fontFamily: "var(--font-primary)",
                            fontWeight: 700,
                            fontSize: "16px",
                            color: "var(--ink)",
                            lineHeight: 1.2,
                          }}
                        >
                          {term}
                        </span>
                        <ArrowRight size={14} style={{ color, flexShrink: 0, marginTop: 3 }} />
                      </div>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "var(--ink-mid)",
                          lineHeight: 1.65,
                          margin: "0 0 var(--space-2)",
                          fontFamily: "var(--font-primary)",
                        }}
                      >
                        {def}
                      </p>
                      <div
                        className="mono"
                        style={{ fontSize: "10px", color: "var(--dust)", lineHeight: 1.4 }}
                      >
                        Also called: {also}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref2}>
          <div style={{ maxWidth: "580px", margin: "0 auto", textAlign: "center" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              Ready to Apply This?
            </div>
            <h2 className="h2-section reveal" style={{ marginBottom: "var(--space-3)" }}>
              Now that you know the terms — see your numbers.
            </h2>
            <p
              className="body-text reveal"
              style={{ fontSize: "16px", margin: "0 auto var(--space-5)", lineHeight: 1.7, color: "var(--ink-mid)" }}
            >
              Two minutes. Your actual property. A real savings estimate — not a range from a
              calculator that has never seen your address.
            </p>
            <div
              className="reveal"
              style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/quiz" className="btn btn-primary">
                Get My Free Estimate
              </Link>
              <Link href="/learn" className="btn btn-ghost">
                Browse All Articles
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
