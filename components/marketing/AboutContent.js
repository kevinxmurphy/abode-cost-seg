"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { Home, Unlock, DollarSign, BookOpen, Users, ArrowRight } from "lucide-react";

const values = [
  {
    icon: BookOpen,
    title: "Radical transparency",
    desc: "Our methodology is built on the IRS's own published Cost Segregation Audit Techniques Guide. We're not doing anything novel or proprietary — we're making the standard accessible.",
  },
  {
    icon: Unlock,
    title: "Accessible by design",
    desc: "Flat pricing. No engagement letters. No annual retainer. No discovery call required just to find out if you qualify. The information — and the tool — is yours.",
  },
  {
    icon: Users,
    title: "CPA-first deliverables",
    desc: "We don't replace your tax professional — we equip them. Every study ships as a PDF report and Excel fixed asset schedule your CPA can hand directly to the IRS.",
  },
  {
    icon: Home,
    title: "STR-specific from the start",
    desc: "Cost segregation for short-term rentals has unique rules around bonus depreciation, the STR loophole, and material participation. We built for that use case, not commercial office towers.",
  },
];

export default function AboutContent() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();
  const ref4 = useScrollReveal();
  const ref5 = useScrollReveal();

  return (
    <>
      {/* ─── Hero ─── */}
      <section
        style={{
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-12)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
            Our Story
          </div>
          <h1
            className="h1-hero"
            style={{
              maxWidth: "780px",
              margin: "0 auto var(--space-4)",
            }}
          >
            Cost segregation was kept from you on purpose.
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "18px",
              maxWidth: "580px",
              margin: "0 auto",
              lineHeight: 1.7,
              color: "var(--ink-mid)",
            }}
          >
            We experienced the gatekeeping directly. If you wanted access to this
            strategy, it would cost you — in fees, in time, in knowing the right people.
            We built Abode to end that.
          </p>
        </div>
      </section>

      {/* ─── The Name ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref1}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "var(--space-8)",
              maxWidth: "900px",
              margin: "0 auto",
              alignItems: "center",
            }}
          >
            {/* Word mark + definition */}
            <div>
              <div
                className="reveal"
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: "12px",
                  marginBottom: "var(--space-4)",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 800,
                    fontSize: "clamp(42px, 6vw, 72px)",
                    letterSpacing: "-0.03em",
                    color: "var(--ink)",
                    lineHeight: 1,
                  }}
                >
                  Abode
                </span>
                <span
                  className="mono"
                  style={{ fontSize: "14px", color: "var(--dust)", paddingBottom: "4px" }}
                >
                  /əˈbōd/
                </span>
              </div>

              <p
                className="body-text reveal"
                style={{
                  fontSize: "17px",
                  lineHeight: 1.75,
                  marginBottom: "var(--space-5)",
                  maxWidth: "540px",
                }}
              >
                <em>noun</em> — a place of residence; a home. The place you return to.
                The place someone else calls their getaway, their retreat, their
                favorite weekend.
              </p>

              {/* Acronym breakdown */}
              <div
                className="reveal"
                style={{
                  background: "var(--turq-bg)",
                  border: "1px solid var(--turq-light)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-5)",
                  display: "inline-block",
                }}
              >
                <div
                  className="ui-label"
                  style={{ color: "var(--dust)", marginBottom: "var(--space-3)" }}
                >
                  Also reads as
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-2)",
                  }}
                >
                  {[
                    { letter: "A", word: "Airbnb", note: "Short-term rental platform" },
                    { letter: "Bo", word: "Bonus", note: "100% first-year deduction" },
                    { letter: "De", word: "Depreciation", note: "The strategy itself" },
                  ].map(({ letter, word, note }) => (
                    <div
                      key={letter}
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "var(--space-2)",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-primary)",
                          fontWeight: 800,
                          fontSize: "22px",
                          color: "var(--turq)",
                          lineHeight: 1,
                          minWidth: "32px",
                        }}
                      >
                        {letter}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-primary)",
                          fontWeight: 600,
                          fontSize: "16px",
                          color: "var(--ink)",
                        }}
                      >
                        {word}
                      </span>
                      <span
                        className="mono"
                        style={{ fontSize: "11px", color: "var(--dust)" }}
                      >
                        — {note}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quote pull */}
            <div
              className="reveal"
              style={{
                borderLeft: "3px solid var(--adobe)",
                paddingLeft: "var(--space-4)",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-primary)",
                  fontWeight: 600,
                  fontSize: "clamp(18px, 2.5vw, 22px)",
                  lineHeight: 1.5,
                  color: "var(--ink)",
                  marginBottom: "var(--space-2)",
                }}
              >
                &ldquo;We named it Abode because your rental property is someone&rsquo;s
                home — and because what we unlock is the tax strategy hiding inside it:
                Airbnb Bonus Depreciation.&rdquo;
              </p>
              <p
                className="mono"
                style={{ fontSize: "12px", color: "var(--dust)" }}
              >
                — Abode founding team
              </p>
            </div>
          </div>
        </div>

        <style jsx>{`
          @media (min-width: 900px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr 1fr !important;
            }
          }
        `}</style>
      </section>

      {/* ─── The Problem ─── */}
      <section className="section">
        <div className="container" ref={ref2}>
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              The Problem
            </div>
            <h2
              className="h2-section reveal"
              style={{ marginBottom: "var(--space-5)" }}
            >
              A perfectly legal strategy, deliberately kept out of reach.
            </h2>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
              }}
            >
              {[
                {
                  heading: "Cost segregation has existed for decades.",
                  body: "Engineering firms have charged $5,000–$15,000 for studies that take 4–8 weeks. Qualification thresholds were quietly set high enough to exclude most residential investors. The math only worked if your property was a strip mall.",
                },
                {
                  heading: "The knowledge was deliberately siloed.",
                  body: "Your CPA might not bring it up — it's not their job to proactively redesign your tax strategy. Traditional firms have no incentive to tell you a cheaper option exists. And unless you already knew to ask, you'd never find out you were leaving tens of thousands of dollars on the table. Every year.",
                },
                {
                  heading: "Short-term rental investors got hit hardest.",
                  body: "The STR tax loophole — and the bonus depreciation that makes it explosive — is one of the most powerful wealth-building tools in the tax code. But the only people who knew about it were the ones who could afford an attorney to explain it to them.",
                },
              ].map(({ heading, body }, i) => (
                <div
                  key={i}
                  className="reveal"
                  style={{
                    padding: "var(--space-4)",
                    background: "var(--surface)",
                    borderRadius: "var(--radius-md)",
                    borderLeft: "3px solid var(--turq)",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "var(--ink)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {heading}
                  </p>
                  <p
                    className="body-text"
                    style={{ fontSize: "15px", lineHeight: 1.7, margin: 0 }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Mission ─── */}
      <section
        className="section"
        style={{
          background: "var(--ink)",
          color: "#fff",
        }}
      >
        <div className="container" ref={ref3}>
          <div style={{ maxWidth: "740px", margin: "0 auto", textAlign: "center" }}>
            <div
              className="eyebrow reveal"
              style={{ color: "rgba(255,255,255,0.5)", marginBottom: "var(--space-2)" }}
            >
              Our Mission
            </div>
            <h2
              className="h2-section reveal"
              style={{ color: "#fff", marginBottom: "var(--space-5)" }}
            >
              Every STR investor deserves to know what&rsquo;s in their tax code.
            </h2>

            <p
              className="body-text reveal"
              style={{
                fontSize: "17px",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.72)",
                marginBottom: "var(--space-4)",
              }}
            >
              We built Abode for the investor who is running a real business — managing
              guest communications, keeping the property immaculate, optimizing their
              listing at midnight — but doesn&rsquo;t have a real estate empire or a
              $500-an-hour tax attorney.
            </p>

            <p
              className="body-text reveal"
              style={{
                fontSize: "17px",
                lineHeight: 1.75,
                color: "rgba(255,255,255,0.72)",
                marginBottom: "var(--space-6)",
              }}
            >
              AI lets us do in minutes what took an engineer weeks. That means we can
              offer a complete, IRS-methodology cost segregation study for $481 flat.
              No surprise fees. No annual subscription. No discovery call.
              No gatekeeping.
            </p>

            <div className="reveal">
              <Link href="/quiz" className="btn btn-primary">
                Get Your Free Savings Estimate
                <ArrowRight size={16} style={{ marginLeft: "6px" }} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Values ─── */}
      <section className="section">
        <div className="container" ref={ref4}>
          <div
            className="eyebrow reveal"
            style={{ textAlign: "center", marginBottom: "var(--space-2)" }}
          >
            How We Build
          </div>
          <h2
            className="h2-section reveal"
            style={{ textAlign: "center", marginBottom: "var(--space-8)" }}
          >
            Four principles we don&rsquo;t negotiate on.
          </h2>

          <div
            className="reveal-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-4)",
              maxWidth: "960px",
              margin: "0 auto",
            }}
          >
            {values.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="reveal"
                style={{
                  background: "var(--surface)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-5)",
                  border: "1px solid var(--surface-2)",
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--turq-bg)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-3)",
                    color: "var(--turq)",
                  }}
                >
                  <Icon size={22} strokeWidth={1.75} />
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "var(--ink)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  {title}
                </h3>
                <p
                  className="body-text"
                  style={{ fontSize: "14px", lineHeight: 1.7, margin: 0 }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref5}>
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              Ready?
            </div>
            <h2
              className="h2-section reveal"
              style={{ marginBottom: "var(--space-3)" }}
            >
              Find out what your property qualifies for — free.
            </h2>
            <p
              className="body-text reveal"
              style={{
                fontSize: "16px",
                maxWidth: "440px",
                margin: "0 auto var(--space-5)",
                lineHeight: 1.7,
              }}
            >
              Two minutes. No account required. A real savings estimate based on
              your actual property data.
            </p>
            <div
              className="reveal"
              style={{ display: "flex", gap: "var(--space-2)", justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/quiz" className="btn btn-primary">
                Get My Free Estimate
              </Link>
              <Link href="/how-it-works" className="btn btn-ghost">
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
