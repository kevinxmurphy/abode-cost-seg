"use client";

import { useState } from "react";
import Link from "next/link";
import { useScrollReveal } from "@/lib/useScrollReveal";
import {
  MessageSquare,
  FileText,
  HelpCircle,
  AlertCircle,
  ArrowRight,
  Check,
  Sparkles,
  Zap,
} from "lucide-react";

const helpTopics = [
  {
    icon: HelpCircle,
    title: "Question before purchasing",
    description: "Want to know if your property qualifies, or what the study includes?",
    subject: "Pre-purchase question",
  },
  {
    icon: FileText,
    title: "My CPA has questions",
    description:
      "Your tax professional wants to review the methodology or delivery format.",
    subject: "CPA review question",
  },
  {
    icon: MessageSquare,
    title: "Question about my study",
    description: "Something in your completed study you'd like clarified.",
    subject: "Study question",
  },
  {
    icon: AlertCircle,
    title: "Technical issue",
    description: "Something not working the way it should on the platform.",
    subject: "Technical issue",
  },
];

export default function ContactContent() {
  const ref1 = useScrollReveal();
  const ref2 = useScrollReveal();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleTopicClick(subject) {
    setFormData((prev) => ({ ...prev, subject }));
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // STUB: send to email/CRM (e.g. Resend, Loops, HubSpot)
    await new Promise((r) => setTimeout(r, 900));
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
            Contact Us
          </div>
          <h1
            className="h1-hero"
            style={{ maxWidth: "600px", margin: "0 auto var(--space-3)" }}
          >
            We&rsquo;re here. Ask us anything.
          </h1>
          <p
            className="body-text"
            style={{
              fontSize: "17px",
              maxWidth: "480px",
              margin: "0 auto",
              color: "var(--ink-mid)",
              lineHeight: 1.7,
            }}
          >
            A real team behind the tool. We respond to every message — typically
            within one business day.
          </p>
        </div>
      </section>

      {/* ─── Abby Primary CTA ─── */}
      <section style={{ paddingBottom: "var(--space-6)" }}>
        <div className="container">
          <div
            style={{
              maxWidth: "660px",
              margin: "0 auto",
              background: "var(--turq-bg)",
              border: "1.5px solid var(--turq-light)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  background: "var(--turq)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: "#fff",
                  boxShadow: "var(--shadow-turq)",
                }}
              >
                <Sparkles size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-1)", marginBottom: "4px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-primary)",
                      fontWeight: 700,
                      fontSize: "16px",
                      color: "var(--ink)",
                    }}
                  >
                    Chat with Abby
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "var(--turq)",
                      color: "#fff",
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      padding: "2px 8px",
                      borderRadius: "var(--radius-pill)",
                    }}
                  >
                    <Zap size={9} strokeWidth={2.5} />
                    FASTEST
                  </span>
                </div>
                <p
                  className="body-text"
                  style={{ fontSize: "14px", color: "var(--ink-mid)", lineHeight: 1.6, margin: 0 }}
                >
                  Abby is our AI assistant — she knows cost segregation, bonus depreciation,
                  and how our service works inside and out. Most questions get answered instantly.
                </p>
              </div>
            </div>

            {/* What Abby can help with */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                paddingLeft: "var(--space-8)",
              }}
            >
              {[
                "Does my property qualify for cost segregation?",
                "How much could I save with bonus depreciation?",
                "What does my CPA need from the study?",
                "Can I still do this if I bought the property years ago?",
                "How is Abode different from hiring an engineering firm?",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    if (typeof window !== "undefined" && window.openAbby) {
                      window.openAbby();
                    }
                  }}
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    border: "1px solid var(--turq-light)",
                    borderRadius: "var(--radius-pill)",
                    padding: "6px 14px",
                    fontSize: "13px",
                    color: "var(--ink)",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-primary)",
                    transition: "background var(--dur-fast) var(--ease-out)",
                    width: "fit-content",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#fff")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.6)")}
                >
                  &ldquo;{q}&rdquo;
                </button>
              ))}
            </div>

            <div style={{ paddingLeft: "var(--space-8)" }}>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (typeof window !== "undefined" && window.openAbby) {
                    window.openAbby();
                  }
                }}
              >
                <Sparkles size={15} style={{ marginRight: "6px" }} />
                Start chatting with Abby
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="container" style={{ paddingBottom: "var(--space-2)" }}>
        <div
          style={{
            maxWidth: "660px",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--surface-2)" }} />
          <span
            className="mono"
            style={{ fontSize: "11px", color: "var(--dust)", whiteSpace: "nowrap" }}
          >
            or reach a human
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--surface-2)" }} />
        </div>
      </div>

      {/* ─── Help Topics ─── */}
      <section style={{ paddingBottom: "var(--space-8)" }}>
        <div className="container" ref={ref1}>
          <div
            className="ui-label reveal"
            style={{
              textAlign: "center",
              color: "var(--dust)",
              marginBottom: "var(--space-4)",
            }}
          >
            What can we help with?
          </div>

          <div
            className="reveal-stagger"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "var(--space-3)",
              maxWidth: "860px",
              margin: "0 auto",
            }}
          >
            {helpTopics.map(({ icon: Icon, title, description, subject }) => (
              <button
                key={subject}
                onClick={() => handleTopicClick(subject)}
                className="reveal"
                style={{
                  background:
                    formData.subject === subject
                      ? "var(--turq-bg)"
                      : "var(--surface)",
                  border:
                    formData.subject === subject
                      ? "1.5px solid var(--turq)"
                      : "1.5px solid var(--surface-2)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-4)",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "border-color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-sm)",
                    background:
                      formData.subject === subject
                        ? "var(--turq)"
                        : "rgba(0,0,0,0.05)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "var(--space-2)",
                    color:
                      formData.subject === subject ? "#fff" : "var(--ink-mid)",
                    transition: "background var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out)",
                  }}
                >
                  <Icon size={20} strokeWidth={1.75} />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-primary)",
                    fontWeight: 700,
                    fontSize: "14px",
                    color: "var(--ink)",
                    marginBottom: "4px",
                  }}
                >
                  {title}
                </div>
                <div
                  className="body-text"
                  style={{ fontSize: "13px", lineHeight: 1.55, color: "var(--ink-mid)" }}
                >
                  {description}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact Form ─── */}
      <section
        id="contact-form"
        className="section"
        style={{ background: "var(--surface)", paddingTop: "var(--space-8)" }}
      >
        <div className="container" ref={ref2}>
          <div style={{ maxWidth: "580px", margin: "0 auto" }}>
            {submitted ? (
              <div
                className="reveal"
                style={{
                  textAlign: "center",
                  padding: "var(--space-10) var(--space-6)",
                }}
              >
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
                  Message received.
                </h2>
                <p
                  className="body-text"
                  style={{ fontSize: "15px", color: "var(--ink-mid)", lineHeight: 1.7 }}
                >
                  We&rsquo;ll get back to you within one business day. In the meantime,
                  the{" "}
                  <Link href="/learn" style={{ color: "var(--turq)", fontWeight: 600 }}>
                    learning hub
                  </Link>{" "}
                  has answers to most common questions.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                <h2
                  className="h2-section"
                  style={{ marginBottom: "var(--space-1)", textAlign: "center" }}
                >
                  Send us a message
                </h2>
                <p
                  className="body-text"
                  style={{
                    fontSize: "14px",
                    color: "var(--dust)",
                    textAlign: "center",
                    marginBottom: "var(--space-2)",
                  }}
                >
                  Or email us directly at{" "}
                  <a
                    href="mailto:hello@tryabode.com"
                    style={{ color: "var(--turq)", fontWeight: 600 }}
                  >
                    hello@tryabode.com
                  </a>
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "var(--space-3)",
                  }}
                >
                  <div>
                    <label
                      htmlFor="name"
                      className="ui-label"
                      style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                    >
                      Name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Your name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="ui-label"
                      style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="input"
                      style={{ width: "100%", boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="ui-label"
                    style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                  >
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="input"
                    style={{ width: "100%", boxSizing: "border-box" }}
                  >
                    <option value="">Select a topic...</option>
                    <option value="Pre-purchase question">Pre-purchase question</option>
                    <option value="CPA review question">CPA review question</option>
                    <option value="Study question">Question about my study</option>
                    <option value="Technical issue">Technical issue</option>
                    <option value="Refund request">Refund request</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="ui-label"
                    style={{ display: "block", marginBottom: "6px", color: "var(--dust)" }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Tell us what's on your mind..."
                    value={formData.message}
                    onChange={handleChange}
                    className="input"
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      resize: "vertical",
                      minHeight: "120px",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ alignSelf: "flex-start" }}
                >
                  {submitting ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message
                      <ArrowRight size={16} style={{ marginLeft: "6px" }} />
                    </>
                  )}
                </button>
              </form>
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

      {/* ─── Alt CTA ─── */}
      <section className="section">
        <div className="container">
          <div
            style={{
              maxWidth: "700px",
              margin: "0 auto",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <p
              className="body-text"
              style={{ fontSize: "15px", color: "var(--ink-mid)" }}
            >
              Looking for answers right now?
            </p>
            <div
              style={{
                display: "flex",
                gap: "var(--space-2)",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Link href="/learn" className="btn btn-ghost">
                Browse the learning hub
              </Link>
              <Link href="/sample-study" className="btn btn-ghost">
                View a sample study
              </Link>
              <Link href="/quiz" className="btn btn-ghost">
                Get a free estimate
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
