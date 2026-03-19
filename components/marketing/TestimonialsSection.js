"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

const testimonials = [
  {
    quote:
      "I had no idea cost segregation was even an option for my Airbnb. I assumed it was only for commercial investors. Abode walked me through the whole thing and my CPA had everything she needed.",
    name: "Rachel M.",
    location: "Nashville, TN",
    property: "3-bed STR, purchased 2023",
    savings: "$44,200",
  },
  {
    quote:
      "I've been doing my own taxes for years and leaving this on the table the whole time. The study was ready before my CPA even asked for it.",
    name: "David L.",
    location: "Scottsdale, AZ",
    property: "Vacation home, purchased 2022",
    savings: "$61,800",
  },
  {
    quote:
      "I was skeptical that something this accessible could hold up. My CPA reviewed it, said it was solid, and filed it. Took about a week total from the day I started the quiz.",
    name: "Jen T.",
    location: "Asheville, NC",
    property: "Mountain cabin, purchased 2021",
    savings: "$38,500",
  },
];

export default function TestimonialsSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" style={{ background: "var(--surface)" }}>
      <div className="container" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)", color: "var(--adobe)" }}>
            What STR Investors Are Saying
          </div>
          <h2 className="h2-section reveal">
            The strategy that was always available. Just never accessible.
          </h2>
        </div>

        <div
          className="reveal-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "var(--space-3)",
            maxWidth: "1100px",
            margin: "0 auto",
          }}
        >
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} {...t} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, name, location, property, savings }) {
  return (
    <div
      className="reveal"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderTop: "3px solid var(--adobe)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4)",
        boxShadow: "var(--shadow-sm)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        transition: "box-shadow var(--dur-mid) var(--ease-out), transform var(--dur-mid) var(--ease-out)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Opening quote mark */}
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "48px",
          fontWeight: 700,
          color: "var(--adobe-light)",
          lineHeight: 0.8,
          marginBottom: "-4px",
          userSelect: "none",
        }}
      >
        &ldquo;
      </div>

      {/* Quote */}
      <p
        className="body-text"
        style={{
          fontSize: "15px",
          lineHeight: 1.7,
          color: "var(--ink-mid)",
          flex: 1,
        }}
      >
        {quote}
      </p>

      {/* Savings pill */}
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(184, 80, 48, 0.08)",
            border: "1px solid var(--adobe-light)",
            borderRadius: "var(--radius-pill)",
            padding: "4px 12px",
            fontSize: "12px",
            color: "var(--adobe-dark)",
            fontWeight: 600,
            fontFamily: "var(--font-primary)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <path d="M3.5 7L6 9.5L10.5 4.5" stroke="var(--adobe)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Identified {savings} in deductions
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid var(--border)" }} />

      {/* Attribution */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: "var(--space-2)",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 500,
              fontSize: "14px",
              color: "var(--ink)",
              fontFamily: "var(--font-primary)",
              marginBottom: "2px",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--dust)",
              letterSpacing: "0.04em",
            }}
          >
            {location}
          </div>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--dust)",
            letterSpacing: "0.04em",
            textAlign: "right",
          }}
        >
          {property}
        </div>
      </div>
    </div>
  );
}
