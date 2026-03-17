"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { useCountUp } from "@/lib/useCountUp";

export default function HeroSection() {
  const ref = useScrollReveal();
  const [cardVisible, setCardVisible] = useState(false);

  // Force above-fold hero elements visible immediately on mount
  // (IntersectionObserver handles below-fold sections; hero needs instant reveal)
  useEffect(() => {
    const t = setTimeout(() => setCardVisible(true), 300);
    if (ref.current) {
      ref.current.querySelectorAll(".reveal").forEach((el) => {
        el.classList.add("visible");
      });
    }
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        paddingTop: "var(--space-12)",
        paddingBottom: "var(--space-10)",
        position: "relative",
        overflow: "hidden",
        background: "var(--grad-hero)",
      }}
    >
      {/* Decorative dot pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle, rgba(28,25,22,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      {/* Large decorative turquoise arc — right side */}
      <div
        style={{
          position: "absolute",
          right: "-180px",
          top: "10%",
          width: "520px",
          height: "520px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(26,140,140,0.07) 0%, rgba(26,140,140,0.02) 60%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Small decorative adobe dot — left bottom */}
      <div
        style={{
          position: "absolute",
          left: "5%",
          bottom: "12%",
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(184,80,48,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
          animation: "float 8s ease-in-out infinite",
          animationDelay: "-2s",
        }}
      />

      <div className="container" ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-8)",
            alignItems: "center",
          }}
        >
          {/* Text */}
          <div style={{ maxWidth: "640px" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              Cost Segregation Study for Short-Term Rental Owners
            </div>

            <h1 style={{ marginBottom: "var(--space-3)", display: "flex", flexDirection: "column", gap: "4px" }}>
              <span className="h1-hero reveal">
                You&apos;ve been overpaying taxes on your short-term rental.
              </span>
              <span
                className="h1-hero-light reveal"
                style={{ transitionDelay: "80ms", color: "var(--turq-mid)" }}
              >
                Time to claim what&apos;s yours.
              </span>
            </h1>

            <p
              className="body-text reveal"
              style={{
                fontSize: "17px",
                maxWidth: "480px",
                marginBottom: "var(--space-5)",
                transitionDelay: "160ms",
              }}
            >
              Cost segregation has sheltered millions in taxes for institutional investors
              for 30 years. No one built it for individual STR owners — until now.
              Enter your property, get an IRS-compliant study in minutes, and see
              exactly what you&apos;re owed.
            </p>

            <div
              className="reveal"
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-2)",
                transitionDelay: "240ms",
              }}
            >
              <Link
                href="/quiz"
                className="btn btn-primary btn-lg"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, var(--turq) 0%, #1FA89A 25%, var(--turq) 50%, #1FA89A 75%, var(--turq) 100%)",
                  backgroundSize: "200% auto",
                  animation: "shimmer 4s linear infinite",
                }}
              >
                Calculate My Tax Savings
              </Link>
              <Link href="/how-it-works" className="btn btn-outline btn-lg">
                How It Works
              </Link>
            </div>

            {/* Trust strip */}
            <div
              className="reveal"
              style={{
                marginTop: "var(--space-5)",
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                alignItems: "center",
                transitionDelay: "320ms",
              }}
            >
              <TrustItem label="IRS-Guided Methodology" />
              <TrustItem label="Tax Pro Reviewed" />
              <TrustItem label="90-Day Guarantee" />
            </div>

            {/* Legal footnotes */}
            <p
              className="reveal"
              style={{
                marginTop: "var(--space-3)",
                fontSize: "10px",
                lineHeight: 1.5,
                color: "var(--dust)",
                maxWidth: "480px",
                transitionDelay: "400ms",
              }}
            >
              Estimated range based on typical STR properties. Actual results vary by
              property and tax situation. Not a guarantee of savings.{" "}
              This is not tax, legal, or financial advice.{" "}
              <Link href="/disclaimers" style={{ color: "var(--turq)", textDecoration: "underline" }}>
                See full disclaimers
              </Link>.
            </p>
          </div>

          {/* Savings preview card — desktop */}
          <div
            className="reveal"
            style={{
              transitionDelay: "200ms",
              display: "none",
            }}
          >
            <SavingsPreviewCard visible={cardVisible} />
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

function SavingsPreviewCard({ visible }) {
  const count = useCountUp(47200, 1500, visible);

  return (
    <div
      style={{
        position: "relative",
        background: "var(--surface-raised)",
        border: "1px solid var(--border-strong)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-lg), 0 0 60px rgba(26,140,140,0.08)",
        maxWidth: "380px",
        margin: "0 auto",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 600ms cubic-bezier(0.16,1,0.3,1), transform 600ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
        <span
          style={{
            background: "var(--turq-bg)",
            border: "1px solid var(--turq-light)",
            borderRadius: "var(--radius-pill)",
            padding: "4px 12px",
            fontSize: "11px",
            color: "var(--turq-mid)",
            fontWeight: 500,
            fontFamily: "var(--font-primary)",
          }}
        >
          Your Estimated Savings
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--dust)",
            letterSpacing: "0.06em",
          }}
        >
          Asheville, NC · 4BR STR
        </span>
      </div>

      {/* Main number */}
      <div style={{ marginBottom: "var(--space-1)" }}>
        <span
          style={{
            fontFamily: "var(--font-primary)",
            fontWeight: 700,
            fontSize: "clamp(40px, 5vw, 56px)",
            color: "var(--turq-mid)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
          }}
        >
          ${count.toLocaleString()}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--dust)",
          letterSpacing: "0.06em",
          marginBottom: "var(--space-3)",
        }}
      >
        First-year tax deduction estimate
      </div>

      {/* Data rows */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          paddingTop: "var(--space-2)",
          marginBottom: "var(--space-3)",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {[
          { label: "Reclassified assets", value: "22% of basis", highlight: false },
          { label: "Bonus depreciation", value: "100%", highlight: true },
          { label: "Study delivered", value: "1–3 days", highlight: false },
        ].map((row) => (
          <div
            key={row.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "6px 0",
              fontSize: "13px",
            }}
          >
            <span style={{ color: "var(--dust)", fontFamily: "var(--font-primary)" }}>{row.label}</span>
            <span
              style={{
                fontWeight: 500,
                color: row.highlight ? "var(--turq-mid)" : "var(--ink)",
                fontFamily: "var(--font-primary)",
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <Link
        href="/quiz"
        style={{
          display: "block",
          background: "var(--turq-bg)",
          border: "1px solid var(--turq-light)",
          borderRadius: "var(--radius-md)",
          padding: "10px 16px",
          textAlign: "center",
          fontSize: "13px",
          fontWeight: 500,
          color: "var(--turq-mid)",
          textDecoration: "none",
          fontFamily: "var(--font-primary)",
          transition: "background var(--dur-fast) var(--ease-out)",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--turq-light)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--turq-bg)"}
      >
        Calculate your property&apos;s estimate →
      </Link>

      {/* Trust strip below card */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "center",
          marginTop: "var(--space-2)",
          flexWrap: "wrap",
        }}
      >
        {["No credit card", "Takes 3 minutes", "Free to try"].map((label) => (
          <span
            key={label}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "var(--dust)",
              fontFamily: "var(--font-primary)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M3.5 7L6 9.5L10.5 4.5" stroke="var(--turq)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function TrustItem({ label }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        background: "var(--adobe-light)",
        borderRadius: "var(--radius-pill)",
        fontSize: "12px",
        fontWeight: 500,
        color: "var(--adobe-dark)",
        letterSpacing: "0.01em",
        border: "1px solid rgba(184,80,48,0.12)",
        boxShadow: "0 1px 4px rgba(28,25,22,0.04)",
      }}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3.5 7L6 9.5L10.5 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label}
    </span>
  );
}
