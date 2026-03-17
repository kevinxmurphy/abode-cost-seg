"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

const steps = [
  {
    number: "01",
    title: "Tell us about your property",
    description:
      "Answer a few questions about your STR — purchase price, year built, renovations, amenities. Takes under 3 minutes. No engineering firm. No site visit.",
  },
  {
    number: "02",
    title: "We find what the IRS owes you",
    description:
      "Abode's AI analyzes your property against IRS cost segregation guidelines and produces a full asset classification report — PDF and Excel included. What used to take 4–8 weeks at an engineering firm takes minutes here.",
  },
  {
    number: "03",
    title: "Hand it to your CPA. Keep the savings.",
    description:
      "Download your IRS-compliant study and fixed asset schedule. Your CPA files it exactly as they would from any engineering firm. Most clients identify more than they paid for the study in the first hour of review.",
  },
];

export default function HowItWorksSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" id="how-it-works" style={{ background: "var(--warm-white)" }}>
      <div className="container" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
          <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)" }}>
            How It Works
          </div>
          <h2 className="h2-section reveal">
            Three steps to what&apos;s already yours
          </h2>
        </div>

        <div
          className="reveal-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-4)",
            maxWidth: "1000px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Dashed connector line — desktop only */}
          <style jsx>{`
            @media (min-width: 768px) {
              .step-connector {
                display: block !important;
              }
            }
          `}</style>
          <div
            className="step-connector"
            style={{
              display: "none",
              position: "absolute",
              top: "20px",
              left: "calc(100% / 6)",
              width: "calc(100% * 2 / 3)",
              height: "1px",
              background:
                "repeating-linear-gradient(90deg, var(--turq-light) 0, var(--turq-light) 6px, transparent 6px, transparent 14px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />

          {steps.map((step, i) => (
            <div
              key={i}
              className="reveal"
              style={{
                background: "#fff",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                textAlign: "center",
                padding: "var(--space-5) var(--space-4)",
                transition: "all var(--dur-mid) var(--ease-out)",
                boxShadow: "var(--shadow-sm)",
                position: "relative",
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              {/* Step number badge */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--grad-turq)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-3)",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  fontWeight: 500,
                  letterSpacing: "0.02em",
                  boxShadow: "var(--shadow-turq)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {step.number}
              </div>

              <h3 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
                {step.title}
              </h3>
              <p className="body-text" style={{ fontSize: "14px" }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
