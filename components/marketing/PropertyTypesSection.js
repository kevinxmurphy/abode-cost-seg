"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import Link from "next/link";

// SVG property illustrations — minimal line art, on-brand
const properties = [
  {
    label: "Mountain Cabin",
    subLabel: "Highest reclassification potential",
    highlight: true,
    emoji: "🏔️",
    svg: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 60 }}>
        <path d="M10 50 L40 12 L70 50" stroke="var(--turq)" strokeWidth="2" strokeLinejoin="round" />
        <path d="M20 50 L40 26 L60 50" stroke="var(--turq-mid)" strokeWidth="1.5" strokeLinejoin="round" fill="var(--turq-bg)" />
        <rect x="32" y="38" width="16" height="12" rx="1" fill="var(--turq-bg)" stroke="var(--turq)" strokeWidth="1.5" />
        <rect x="36" y="42" width="8" height="8" rx="1" fill="var(--turq-light)" />
        <path d="M5 50 H75" stroke="var(--border)" strokeWidth="1.5" />
        <path d="M15 50 Q18 44 22 46 Q26 42 30 46" stroke="var(--turq-light)" strokeWidth="1" fill="none" />
      </svg>
    ),
    tags: ["High reclassification", "Deck & landscaping", "Bonus dep. eligible"],
  },
  {
    label: "Beach House",
    subLabel: "Outdoor features boost deductions",
    highlight: false,
    svg: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 60 }}>
        <rect x="15" y="26" width="50" height="26" rx="2" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M10 26 H70 L60 16 H20 Z" fill="var(--adobe-light)" stroke="var(--adobe)" strokeWidth="1.5" />
        <rect x="30" y="36" width="20" height="16" rx="1" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <rect x="19" y="30" width="10" height="8" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="51" y="30" width="10" height="8" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <path d="M5 52 Q20 48 40 52 Q60 56 75 52" stroke="var(--turq-light)" strokeWidth="1.5" fill="none" />
        <path d="M5 55 Q20 51 40 55 Q60 59 75 55" stroke="var(--turq-bg)" strokeWidth="1" fill="none" />
      </svg>
    ),
    tags: ["Outdoor kitchen", "Pool & landscaping", "Short-season use"],
  },
  {
    label: "Lake House",
    subLabel: "Dock & exterior assets qualify",
    highlight: false,
    svg: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 60 }}>
        <rect x="18" y="22" width="44" height="28" rx="2" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M12 22 H68 L58 10 H22 Z" fill="var(--turq-bg)" stroke="var(--turq)" strokeWidth="1.5" />
        <rect x="33" y="34" width="14" height="16" rx="1" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <rect x="20" y="26" width="10" height="8" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="50" y="26" width="10" height="8" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <path d="M5 52 Q40 46 75 52" stroke="var(--turq-light)" strokeWidth="1.5" fill="none" />
        <path d="M28 52 L28 58 M40 52 L40 58 M52 52 L52 58" stroke="var(--turq-light)" strokeWidth="1" />
        <path d="M24 58 H56" stroke="var(--ink-mid)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
    tags: ["Dock & boathouse", "Waterfront premium", "Seasonal amenities"],
  },
  {
    label: "Urban STR / Condo",
    subLabel: "Interior components reclassified",
    highlight: false,
    svg: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 60 }}>
        <rect x="22" y="8" width="36" height="44" rx="2" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <rect x="26" y="14" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="38" y="14" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="50" y="14" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="26" y="24" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="38" y="24" width="8" height="6" rx="1" fill="var(--turq-light)" stroke="var(--turq)" strokeWidth="1" />
        <rect x="50" y="24" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="26" y="34" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="38" y="34" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="50" y="34" width="8" height="6" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="34" y="44" width="12" height="8" rx="1" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M5 52 H75" stroke="var(--border)" strokeWidth="1" />
      </svg>
    ),
    tags: ["Cabinetry & fixtures", "Smart home tech", "HVAC & lighting"],
  },
  {
    label: "Vacation Home",
    subLabel: "Full 27.5-yr to 5/7-yr reclassification",
    highlight: false,
    svg: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 60 }}>
        <rect x="12" y="28" width="56" height="24" rx="2" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M8 28 H72 L56 12 H24 Z" fill="var(--adobe-light)" stroke="var(--adobe)" strokeWidth="1.5" />
        <rect x="34" y="38" width="12" height="14" rx="1" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <rect x="16" y="32" width="10" height="8" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="54" y="32" width="10" height="8" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="4" y="48" width="14" height="4" rx="1" fill="var(--turq-light)" stroke="var(--turq)" strokeWidth="1" />
        <rect x="62" y="48" width="14" height="4" rx="1" fill="var(--turq-light)" stroke="var(--turq)" strokeWidth="1" />
        <path d="M5 52 H75" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
    ),
    tags: ["Garage & ADU", "Renovation add-backs", "Multiple structures"],
  },
  {
    label: "VRBO / Multi-unit",
    subLabel: "Each unit studied independently",
    highlight: false,
    svg: (
      <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 60 }}>
        <rect x="5" y="20" width="30" height="32" rx="2" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M2 20 H38 L30 10 H10 Z" fill="var(--turq-bg)" stroke="var(--turq)" strokeWidth="1.5" />
        <rect x="10" y="26" width="9" height="7" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="23" y="26" width="9" height="7" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="16" y="38" width="10" height="14" rx="1" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <rect x="45" y="24" width="30" height="28" rx="2" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M42 24 H78 L70 14 H50 Z" fill="var(--adobe-light)" stroke="var(--adobe)" strokeWidth="1.5" />
        <rect x="50" y="30" width="9" height="7" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="63" y="30" width="9" height="7" rx="1" fill="var(--turq-bg)" stroke="var(--turq-light)" strokeWidth="1" />
        <rect x="55" y="40" width="10" height="12" rx="1" fill="var(--surface)" stroke="var(--ink-mid)" strokeWidth="1.5" />
        <path d="M2 52 H78" stroke="var(--border)" strokeWidth="1.5" />
      </svg>
    ),
    tags: ["Per-unit studies", "Scale discounts", "Portfolio investors"],
  },
];

export default function PropertyTypesSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" style={{ background: "var(--warm-white)" }}>
      <div className="container" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)" }}>
            Qualifying Properties
          </div>
          <h2 className="h2-section reveal">
            If guests stay there, it probably qualifies.
          </h2>
          <p className="body-text reveal" style={{ maxWidth: 520, margin: "var(--space-2) auto 0", fontSize: 16 }}>
            Cost segregation works on any short-term rental — regardless of location,
            property type, or whether you bought it last year or five years ago.
          </p>
        </div>

        <div
          className="reveal-stagger"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--space-3)",
            maxWidth: 1040,
            margin: "0 auto",
          }}
        >
          {properties.map((p, i) => (
            <div
              key={i}
              className="reveal"
              style={{
                background: p.highlight ? "var(--turq-bg)" : "#fff",
                border: p.highlight ? "1px solid var(--turq-light)" : "1px solid var(--border)",
                borderTop: p.highlight ? "3px solid var(--turq)" : "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-4)",
                transition: "all var(--dur-mid) var(--ease-out)",
                boxShadow: p.highlight ? "var(--shadow-md), 0 0 20px rgba(26,140,140,0.06)" : "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "var(--shadow-md), 0 0 20px rgba(26,140,140,0.08)";
                e.currentTarget.style.borderColor = "var(--turq-light)";
                e.currentTarget.style.borderTopColor = "var(--turq)";
                e.currentTarget.style.background = "var(--turq-bg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = p.highlight
                  ? "var(--shadow-md), 0 0 20px rgba(26,140,140,0.06)"
                  : "var(--shadow-sm)";
                e.currentTarget.style.borderColor = p.highlight ? "var(--turq-light)" : "var(--border)";
                e.currentTarget.style.borderTopColor = p.highlight ? "var(--turq)" : "var(--border)";
                e.currentTarget.style.background = p.highlight ? "var(--turq-bg)" : "#fff";
              }}
            >
              {/* Illustration */}
              <div style={{
                display: "flex", justifyContent: "center",
                padding: "var(--space-2) 0 var(--space-1)",
              }}>
                {p.svg}
              </div>

              {/* Label */}
              <div>
                <div style={{
                  fontFamily: "var(--font-primary)", fontWeight: 600,
                  fontSize: 15, color: p.highlight ? "var(--turq-mid)" : "var(--ink)",
                  marginBottom: 2,
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: 10,
                  color: p.highlight ? "var(--turq)" : "var(--dust)",
                  letterSpacing: "0.06em",
                }}>
                  {p.subLabel}
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {p.tags.map((tag) => (
                  <span key={tag} style={{
                    fontSize: 11, padding: "2px 8px",
                    background: p.highlight ? "rgba(26,140,140,0.12)" : "var(--surface)",
                    color: p.highlight ? "var(--turq-mid)" : "var(--dust)",
                    borderRadius: "var(--radius-pill)",
                    fontFamily: "var(--font-primary)",
                    border: p.highlight ? "1px solid var(--turq-light)" : "1px solid var(--border)",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* STR-specific benefits callout */}
        <div
          className="reveal"
          style={{
            marginTop: "var(--space-5)",
            padding: "var(--space-4)",
            background: "var(--adobe-light)",
            border: "1px solid rgba(184,80,48,0.15)",
            borderLeft: "3px solid var(--adobe)",
            borderRadius: "var(--radius-md)",
            maxWidth: 880,
            margin: "var(--space-5) auto var(--space-3)",
          }}
        >
          <div style={{
            fontFamily: "var(--font-mono)", fontSize: 10, fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "var(--adobe)", marginBottom: "var(--space-2)",
          }}>
            STR Advantage — Assets Engineering Firms Often Miss
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "10px",
          }}>
            {[
              "Furniture & furnishings (5-yr)",
              "Appliances & smart home tech (5-yr)",
              "Hot tub & outdoor furniture (7-yr)",
              "Landscaping & hardscaping (15-yr)",
              "Décor & artwork (5-yr)",
              "Linens & supplies (5-yr)",
            ].map((item) => (
              <div key={item} style={{
                display: "flex", alignItems: "center", gap: 8,
                fontSize: 13, color: "var(--adobe-dark)",
                fontFamily: "var(--font-primary)",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 7L6 9.5L10.5 4.5" stroke="var(--adobe)" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </div>
            ))}
          </div>
          <p style={{
            fontSize: 12, color: "var(--adobe)", marginTop: "var(--space-2)",
            fontFamily: "var(--font-primary)", lineHeight: 1.6,
          }}>
            STR properties carry significantly more depreciable personal property than long-term rentals —
            furnishings, appliances, and outdoor assets all qualify for accelerated depreciation.
          </p>
        </div>

        {/* Bottom callout */}
        <div
          className="reveal"
          style={{
            padding: "var(--space-3) var(--space-4)",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-md)",
            maxWidth: 640,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--ink-mid)", lineHeight: 1.7, fontFamily: "var(--font-primary)" }}>
            <strong style={{ color: "var(--ink)" }}>Not sure if yours qualifies?</strong>{" "}
            Take the 3-minute quiz — no credit card, no commitment.
            You&apos;ll know your estimated savings before you spend anything.
          </p>
          <Link
            href="/quiz"
            className="btn btn-outline"
            style={{ marginTop: "var(--space-2)", display: "inline-flex" }}
          >
            Check My Property →
          </Link>
        </div>
      </div>
    </section>
  );
}
