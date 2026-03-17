"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";
import {
  Home,
  FileText,
  Calculator,
  Shield,
  Clock,
  DollarSign,
  ArrowRight,
  Check,
} from "lucide-react";

const steps = [
  {
    icon: Home,
    number: "01",
    title: "Enter Your Property Details",
    description:
      "Tell us about your short-term rental: address, purchase price, year built, and key amenities. Our system uses this data to begin classifying your assets. Takes under 2 minutes.",
  },
  {
    icon: FileText,
    number: "02",
    title: "AI Generates Your Study",
    description:
      "Our AI engine analyzes your property against IRS cost segregation guidelines, identifying assets eligible for accelerated depreciation across 5, 7, 15, and 39-year categories. We calculate bonus depreciation at current rates.",
  },
  {
    icon: Calculator,
    number: "03",
    title: "Download & Hand to Your CPA",
    description:
      "Download a complete PDF report and Excel fixed asset schedule. Your CPA files the study with your tax return — or uses Form 3115 for catch-up deductions if you purchased the property in a prior year.",
  },
];

const benefits = [
  { icon: Clock, title: "Minutes, Not Weeks", desc: "Traditional studies take 4–8 weeks. Our AI generates yours in minutes." },
  { icon: DollarSign, title: `${STUDY_PRICE_DISPLAY}, Not $10,000`, desc: "Engineering-firm studies cost $5K–$15K. Comparable output at a fraction of the price." },
  { icon: Shield, title: "IRS-Guided Methodology", desc: "Built on principles from the IRS Cost Segregation Audit Techniques Guide (ATG). Review by your CPA recommended." },
];

export default function HowItWorksContent() {
  const ref = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();

  return (
    <>
      {/* Hero */}
      <section
        style={{
          paddingTop: "var(--space-16)",
          paddingBottom: "var(--space-10)",
          textAlign: "center",
        }}
      >
        <div className="container">
          <div className="eyebrow" style={{ marginBottom: "var(--space-1)" }}>
            How It Works
          </div>
          <h1 className="h1-hero" style={{ marginBottom: "var(--space-3)", maxWidth: "700px", margin: "0 auto var(--space-3)" }}>
            From property details to tax savings in three steps
          </h1>
          <p
            className="body-text"
            style={{ fontSize: "17px", maxWidth: "540px", margin: "0 auto var(--space-5)" }}
          >
            No engineers. No site visits. No weeks of waiting.
            Just an AI-powered study that follows the same IRS guidelines
            as traditional firms.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="section" style={{ background: "var(--surface)" }} ref={ref}>
        <div className="container">
          <div
            className="reveal-stagger"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-6)",
              maxWidth: "640px",
              margin: "0 auto",
            }}
          >
            {steps.map((step, i) => (
              <div key={i} className="reveal" style={{ display: "flex", gap: "var(--space-4)", alignItems: "flex-start" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(184,80,48,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--adobe)",
                    flexShrink: 0,
                  }}
                >
                  <step.icon size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <div className="mono" style={{ color: "var(--adobe)", marginBottom: "4px" }}>
                    Step {step.number}
                  </div>
                  <h3 className="h3-component" style={{ marginBottom: "var(--space-1)" }}>
                    {step.title}
                  </h3>
                  <p className="body-text" style={{ fontSize: "14px" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section" ref={ref2}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
            <h2 className="h2-section reveal">Why Abode?</h2>
          </div>
          <div
            className="reveal-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "var(--space-3)",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            {benefits.map((b, i) => (
              <div key={i} className="card reveal" style={{ textAlign: "center", padding: "var(--space-5) var(--space-4)" }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-md)",
                    background: "rgba(184,80,48,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto var(--space-3)",
                    color: "var(--adobe)",
                  }}
                >
                  <b.icon size={22} strokeWidth={1.5} />
                </div>
                <h3 className="h3-component" style={{ marginBottom: "var(--space-1)" }}>
                  {b.title}
                </h3>
                <p className="body-text" style={{ fontSize: "14px" }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        ref={ref3}
        style={{
          background: "var(--turq)",
          padding: "var(--space-10) 0",
          textAlign: "center",
        }}
      >
        <div className="container reveal">
          <h2
            style={{
              fontWeight: 700,
              fontSize: "clamp(24px, 4vw, 40px)",
              color: "#fff",
              letterSpacing: "-0.02em",
              marginBottom: "var(--space-3)",
            }}
          >
            Ready to see your savings?
          </h2>
          <Link
            href="/quiz"
            className="btn btn-lg"
            style={{ background: "#fff", color: "var(--turq)", border: "1px solid #fff" }}
          >
            Get Your Free Estimate
            <ArrowRight size={18} />
          </Link>
          <p
            style={{
              marginTop: "var(--space-3)",
              fontSize: "10px",
              color: "rgba(255,255,255,0.5)",
              maxWidth: "440px",
              margin: "var(--space-3) auto 0",
              lineHeight: 1.5,
            }}
          >
            For informational purposes only. Not tax, legal, or financial advice.
            Results depend on data you provide. Consult your CPA.{" "}
            <Link href="/disclaimers" style={{ color: "#fff", textDecoration: "underline" }}>
              Disclaimers
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
