"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";
import {
  Users,
  Layers,
  Star,
  ArrowRight,
  Check,
  FileText,
  Mail,
} from "lucide-react";

const tiers = [
  {
    icon: Users,
    tag: "Referral Program",
    title: "Refer & Earn",
    description:
      "Send your STR clients to Abode. Earn a commission on every completed study. No paperwork, no overhead — just a custom referral link and a payout when they purchase.",
    bullets: [
      "15% commission per completed study",
      "Dedicated referral dashboard",
      "No minimum volume requirement",
      "Transparent tracking + monthly payouts",
    ],
    cta: "Apply to Refer",
    ctaAction: "refer",
    color: "var(--turq)",
    colorBg: "var(--turq-bg)",
    colorBorder: "var(--turq-light)",
  },
  {
    icon: Layers,
    tag: "White Label",
    title: "Your Brand. Our Engine.",
    description:
      "Offer AI-powered cost segregation studies under your firm's name. We power the platform; your clients see your logo, your colors, and your domain. Ideal for accounting firms with STR-focused client books.",
    bullets: [
      "Custom-branded study PDFs and Excel output",
      "Your domain, your client portal",
      "Wholesale pricing per study",
      "Dedicated onboarding and account support",
    ],
    cta: "Discuss White Label",
    ctaAction: "whitelabel",
    color: "var(--adobe)",
    colorBg: "var(--adobe-light)",
    colorBorder: "rgba(184,80,48,0.2)",
  },
  {
    icon: Star,
    tag: "Premium Certification",
    title: "CPA-Certified Review",
    description:
      "Your clients want the confidence of a CPA's stamp. You review the Abode study, verify it against their specific tax situation, and sign off. Charge your standard hourly rate — we give you the foundation.",
    bullets: [
      "Structured review checklist provided",
      "Direct access to our methodology documentation",
      "Positioning: \"reviewed and certified by [Your Firm]\"",
      "Upsell your clients on a premium advisory tier",
    ],
    cta: "Learn About Certification",
    ctaAction: "certification",
    color: "var(--ink)",
    colorBg: "var(--surface)",
    colorBorder: "var(--surface-2)",
  },
];

const whyAbode = [
  {
    stat: STUDY_PRICE_DISPLAY,
    label: "Per study — wholesale pricing available",
  },
  {
    stat: "Minutes",
    label: "Turnaround from property input to study",
  },
  {
    stat: "IRS ATG",
    label: "Methodology basis — audit defensible",
  },
  {
    stat: "PDF + XLSX",
    label: "CPA-ready deliverables every time",
  },
];

export default function ForCPAsContent() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();
  const ref3 = useScrollReveal();

  const [form, setForm] = useState({ name: "", firm: "", email: "", interest: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function scrollToForm(interest) {
    setForm((prev) => ({ ...prev, interest }));
    document.getElementById("cpa-contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/abby/escalate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          category: `CPA Partnership — ${form.interest || "General"}`,
          message: `Firm: ${form.firm || "N/A"}\n\n${form.message}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("[ForCPAs] Submit failed:", data.error);
      }
    } catch (err) {
      console.error("[ForCPAs] Submit error:", err.message);
    }
    setSubmitting(false);
    setSubmitted(true);
  }

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
            For Tax Professionals
          </div>
          <h1
            className="h1-hero"
            style={{ maxWidth: "800px", margin: "0 auto var(--space-4)" }}
          >
            Your STR clients are leaving money on the table.
            <br />
            <span style={{ color: "var(--turq)" }}>Let&rsquo;s fix that together.</span>
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "17px",
              maxWidth: "560px",
              margin: "0 auto var(--space-5)",
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            Cost segregation used to be impractical for residential STR owners — the
            minimum fee made the math impossible. At {STUDY_PRICE_DISPLAY}, it works for almost every
            STR client you have. We give you three ways to bring it to them.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => scrollToForm("")}
          >
            Partner with Abode
            <ArrowRight size={16} style={{ marginLeft: "6px" }} />
          </button>
        </div>
      </section>

      {/* ─── By the numbers ─── */}
      <section style={{ paddingBottom: "var(--space-8)" }}>
        <div className="container" ref={ref1}>
          <div
            style={{
              maxWidth: "800px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            {whyAbode.map(({ stat, label }) => (
              <div
                key={label}
                className="reveal"
                style={{
                  textAlign: "center",
                  padding: "var(--space-4)",
                  background: "var(--surface)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--surface-2)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 800,
                    fontSize: "clamp(22px, 3vw, 30px)",
                    color: "var(--turq)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    marginBottom: "8px",
                  }}
                >
                  {stat}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "11px", color: "var(--dust)", lineHeight: 1.4 }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Three tiers ─── */}
      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container" ref={ref2}>
          <div className="eyebrow reveal" style={{ textAlign: "center", marginBottom: "var(--space-2)" }}>
            Three Ways to Work Together
          </div>
          <h2
            className="h2-section reveal"
            style={{ textAlign: "center", marginBottom: "var(--space-6)" }}
          >
            Pick the model that fits your firm.
          </h2>

          <div
            className="reveal-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "var(--space-4)",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            {tiers.map(({ icon: Icon, tag, title, description, bullets, cta, ctaAction, color, colorBg, colorBorder }) => (
              <div
                key={title}
                className="reveal"
                style={{
                  background: colorBg,
                  border: `1.5px solid ${colorBorder}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-5)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-3)",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "rgba(255,255,255,0.5)",
                      border: `1px solid ${colorBorder}`,
                      borderRadius: "var(--radius-pill)",
                      padding: "4px 12px",
                      marginBottom: "var(--space-2)",
                    }}
                  >
                    <Icon size={13} style={{ color }} strokeWidth={2} />
                    <span
                      className="mono"
                      style={{ fontSize: "10px", color, letterSpacing: "0.06em", fontWeight: 600 }}
                    >
                      {tag.toUpperCase()}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "20px",
                      color: "var(--ink)",
                      marginBottom: "var(--space-2)",
                      lineHeight: 1.2,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    className="body-text"
                    style={{ fontSize: "14px", lineHeight: 1.7, color: "var(--ink-mid)", margin: 0 }}
                  >
                    {description}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {bullets.map((b) => (
                    <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                      <Check size={14} style={{ color, flexShrink: 0, marginTop: 2 }} strokeWidth={2.5} />
                      <span style={{ fontSize: "13px", color: "var(--ink-mid)", lineHeight: 1.5 }}>{b}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => scrollToForm(tag)}
                  className="btn"
                  style={{
                    background: color,
                    color: "#fff",
                    border: "none",
                    marginTop: "auto",
                    alignSelf: "flex-start",
                    cursor: "pointer",
                  }}
                >
                  {cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Why it matters for your clients ─── */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: "720px", margin: "0 auto" }}>
            <div className="eyebrow reveal" style={{ marginBottom: "var(--space-2)" }}>
              The Opportunity
            </div>
            <h2
              className="h2-section reveal"
              style={{ marginBottom: "var(--space-4)" }}
            >
              Your STR clients don&rsquo;t know to ask. You can change that.
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {[
                {
                  heading: "Most STR investors have never heard of cost segregation.",
                  body: "Unless they have a proactive tax advisor or happened to find the right Reddit thread, they're depreciating their property over 27.5 years — the default — and leaving the accelerated deduction completely on the table.",
                },
                {
                  heading: "The OBBBA made this more urgent than ever.",
                  body: "100% bonus depreciation is now permanent for property acquired after January 19, 2025. The deduction window is open. Clients who act now get the most from it. The ones who wait until next year could lose this year's opportunity entirely.",
                },
                {
                  heading: "You don't need to become a cost segregation specialist.",
                  body: `Abode handles the technical study. You review, advise, and file. At ${STUDY_PRICE_DISPLAY}, the conversation is easy to have. The alternative — referring them to an engineering firm at $8,000 — is a harder sell for a client with a $400K cabin.`,
                },
              ].map(({ heading, body }) => (
                <div
                  key={heading}
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
                      fontSize: "15px",
                      color: "var(--ink)",
                      marginBottom: "var(--space-1)",
                    }}
                  >
                    {heading}
                  </p>
                  <p
                    className="body-text"
                    style={{ fontSize: "14px", lineHeight: 1.7, margin: 0 }}
                  >
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Contact form ─── */}
      <section
        id="cpa-contact-form"
        className="section"
        style={{ background: "var(--surface)" }}
      >
        <div className="container" ref={ref3}>
          <div style={{ maxWidth: "560px", margin: "0 auto" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "var(--space-10) 0" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "var(--turq)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto var(--space-4)",
                    color: "#fff",
                    boxShadow: "var(--shadow-turq)",
                  }}
                >
                  <Check size={26} strokeWidth={2.5} />
                </div>
                <h2
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 700,
                    fontSize: "24px",
                    color: "var(--ink)",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  We&rsquo;ll be in touch.
                </h2>
                <p
                  className="body-text"
                  style={{ fontSize: "15px", color: "var(--ink-mid)", lineHeight: 1.7 }}
                >
                  Expect a response within one business day. If you have a specific client
                  situation in mind, bring it — we&rsquo;re happy to walk through it.
                </p>
              </div>
            ) : (
              <>
                <div style={{ textAlign: "center", marginBottom: "var(--space-5)" }}>
                  <div className="eyebrow" style={{ marginBottom: "var(--space-2)" }}>
                    Get In Touch
                  </div>
                  <h2 className="h2-section" style={{ marginBottom: "var(--space-2)" }}>
                    Let&rsquo;s talk about your firm.
                  </h2>
                  <p
                    className="body-text"
                    style={{ fontSize: "15px", color: "var(--ink-mid)" }}
                  >
                    Tell us about your practice and what you&rsquo;re looking for. We&rsquo;ll get back
                    to you within one business day.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit}
                  style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
                    <div>
                      <label
                        className="ui-label"
                        style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                      >
                        Your Name
                      </label>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="Jane Smith, CPA"
                        value={form.name}
                        onChange={handleChange}
                        className="input"
                        style={{ width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label
                        className="ui-label"
                        style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                      >
                        Firm Name
                      </label>
                      <input
                        name="firm"
                        type="text"
                        placeholder="Smith Tax Advisors"
                        value={form.firm}
                        onChange={handleChange}
                        className="input"
                        style={{ width: "100%", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      className="ui-label"
                      style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                    >
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="jane@smithtax.com"
                      value={form.email}
                      onChange={handleChange}
                      className="input"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>

                  <div>
                    <label
                      className="ui-label"
                      style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                    >
                      I&rsquo;m interested in...
                    </label>
                    <select
                      name="interest"
                      value={form.interest}
                      onChange={handleChange}
                      className="input"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    >
                      <option value="">Select an option</option>
                      <option value="Referral Program">Referral Program</option>
                      <option value="White Label">White Label Platform</option>
                      <option value="Premium Certification">CPA Certification / Review</option>
                      <option value="General">General inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label
                      className="ui-label"
                      style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                    >
                      Tell us about your practice
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="How many STR clients do you have? What's your current approach to cost segregation? What are you hoping Abode can help with?"
                      value={form.message}
                      onChange={handleChange}
                      className="input"
                      style={{ width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: "100px" }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {submitting ? "Sending..." : (
                      <>
                        <Mail size={15} style={{ marginRight: "6px" }} />
                        Send to Partnership Team
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <style jsx>{`
          @media (max-width: 480px) {
            div[style*="gridTemplateColumns: 1fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </>
  );
}
