"use client";

import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ArrowRight } from "lucide-react";

export default function QuizCTABanner() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      style={{
        background: "var(--grad-cta)",
        backgroundSize: "200% 200%",
        animation: "gradShift 8s ease-in-out infinite",
        padding: "var(--space-10) 0",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Floating decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "8%",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          animation: "float 6s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "12%",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          animation: "float 6s ease-in-out infinite",
          animationDelay: "-3s",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "25%",
          width: "24px",
          height: "24px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.08)",
          animation: "float 5s ease-in-out infinite",
          animationDelay: "-1.5s",
          pointerEvents: "none",
        }}
      />

      <div
        className="container reveal"
        style={{
          textAlign: "center",
          maxWidth: "640px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <h2
          style={{
            fontFamily: "var(--font-primary)",
            fontWeight: 700,
            fontSize: "clamp(24px, 4vw, 40px)",
            color: "#fff",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: "var(--space-2)",
          }}
        >
          Every year you wait,
          <br />
          the IRS keeps your money.
        </h2>
        <p
          style={{
            fontSize: "16px",
            color: "rgba(255,255,255,0.8)",
            marginBottom: "var(--space-5)",
            lineHeight: 1.6,
          }}
        >
          Answer a few questions about your property. Get a personalized
          first-year savings estimate — based on your actual purchase price,
          renovation history, and tax bracket. Free, and takes under 3 minutes.
        </p>
        <Link
          href="/quiz"
          className="btn btn-lg"
          style={{
            background: "#fff",
            color: "var(--turq-mid)",
            border: "1px solid #fff",
            fontWeight: 600,
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
          }}
        >
          Calculate My Tax Savings — Free
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
