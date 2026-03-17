"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import { useCountUp } from "@/lib/useCountUp";
import { useState } from "react";

const stats = [
  { value: 61847, prefix: "$", suffix: "", label: "Avg. first-year deduction claimed" },
  { value: 22, prefix: "", suffix: "%", label: "Of property value reclassified, on average" },
  { value: 10, prefix: "<", suffix: " min", label: "AI-powered delivery" },
];

export default function SocialProof() {
  const ref = useScrollReveal();

  return (
    <section
      className="section"
      style={{
        background: "var(--grad-dark)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative turquoise glow */}
      <div
        style={{
          position: "absolute",
          top: "-40%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(ellipse, rgba(26,140,140,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div className="container" ref={ref} style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div
            className="eyebrow reveal"
            style={{ marginBottom: "var(--space-1)", color: "var(--adobe-light)" }}
          >
            The Math
          </div>
          <h2
            className="h2-section reveal"
            style={{ color: "#fff" }}
          >
            What institutional investors have known for 30 years
          </h2>
        </div>

        <div
          className="reveal-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "var(--space-2)",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <p
          style={{
            textAlign: "center",
            marginTop: "var(--space-4)",
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-mono)",
            letterSpacing: "0.04em",
          }}
        >
          Based on internal estimates using typical STR property profiles. Individual results vary.
        </p>
      </div>
    </section>
  );
}

function StatCard({ value, prefix, suffix, label }) {
  const [inView, setInView] = useState(false);
  const count = useCountUp(value, 800, inView);

  return (
    <div
      className="reveal"
      ref={(el) => {
        if (!el) return;
        const obs = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setInView(true);
              obs.disconnect();
            }
          },
          { threshold: 0.5 }
        );
        obs.observe(el);
      }}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderTop: "2px solid var(--adobe-light)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-3)",
        textAlign: "center",
        transition: "all var(--dur-mid) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.borderTopColor = "var(--adobe)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderTopColor = "var(--adobe-light)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        className="number-hero mono-value"
        style={{
          fontSize: "clamp(28px, 4vw, 44px)",
          color: "#fff",
          marginBottom: "var(--space-1)",
          textShadow: "0 0 30px rgba(26,140,140,0.2)",
        }}
      >
        {prefix}
        <span className="count-up">
          {prefix === "$" ? count.toLocaleString() : count}
        </span>
        {suffix}
      </div>
      <div
        className="mono"
        style={{ color: "rgba(255,255,255,0.5)" }}
      >
        {label}
      </div>
    </div>
  );
}
