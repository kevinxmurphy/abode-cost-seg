"use client";

import { useState } from "react";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What is a cost segregation study?",
    a: "A cost segregation study identifies and reclassifies personal property components from real property to shorter depreciation timelines. Instead of depreciating your entire property over 27.5 years, components like appliances, fixtures, landscaping, and specialty systems are depreciated over 5, 7, or 15 years — dramatically front-loading your deductions into the early years of ownership.",
  },
  {
    q: "Is cost segregation only for commercial properties?",
    a: "No — and this is the most common misconception. Cost segregation works for any income-producing real property, including short-term rentals. The reason most STR owners have never heard of it is that engineering firm studies ($5K–$15K) made the math work only for large commercial properties. At $499, it's a different calculation for residential STR owners.",
  },
  {
    q: "Is this IRS-ready — will it hold up?",
    a: "Abode studies follow the IRS Cost Segregation Audit Techniques Guide (ATG) — the same methodology used by engineering firms and referenced by the IRS in examinations. The study is your supporting documentation, just like any other schedule on your return. It doesn't eliminate audit risk (no deduction does), but it gives your CPA everything needed to defend the position.",
  },
  {
    q: "Do I need an engineering firm?",
    a: "Traditionally, yes — cost segregation required an on-site engineer and took weeks. Abode uses AI, property data, and detailed input from you to generate equivalent asset classifications in minutes. Our liability is limited to the fee you pay (see Terms of Service). We always recommend your CPA review the output before filing.",
  },
  {
    q: "Will my CPA accept this?",
    a: "Most CPAs work with cost segregation reports regularly — it's a standard tool in their toolkit. Our PDF and Excel deliverables follow the same format CPAs see from traditional studies. We recommend reviewing the sample study before purchasing so you can show your CPA exactly what they'll receive. If your CPA has specific concerns, contact us.",
  },
  {
    q: "What if I bought my property years ago?",
    a: "You can still benefit. If you haven't done a cost segregation study, you can file a catch-up deduction using IRS Form 3115 (Change in Accounting Method). This lets you claim all the missed accelerated depreciation in a single tax year — no amended returns needed.",
  },
  {
    q: "What is bonus depreciation?",
    a: "Bonus depreciation allows you to deduct a large percentage of qualifying asset costs in the first year. For 2025, the OBBBA legislation reinstated 100% bonus depreciation for qualifying property acquired after January 19, 2025. This means the full value of your 5, 7, and 15-year property can be deducted immediately.",
  },
  {
    q: "How long does it take?",
    a: "Your study is generated in minutes after you submit your property information — powered by AI. Traditional engineering-based studies typically take 4–8 weeks.",
  },
  {
    q: "What property types do you support?",
    a: "Abode is optimized for short-term rental properties (Airbnb, VRBO, vacation rentals). This includes single-family homes, condos, townhomes, cabins, and multi-unit properties used primarily for short-term rental income.",
  },
  {
    q: "What do I get in the final deliverable?",
    a: "You receive a comprehensive PDF report with full asset classifications, a detailed Excel fixed asset schedule, and bonus depreciation calculations. Everything your CPA needs to review and file with your tax return.",
  },
  {
    q: "What if I get audited?",
    a: "Abode studies follow IRS Cost Segregation Audit Techniques Guide methodology — so the study itself serves as your supporting documentation, just like any other deduction on your return. If you're audited, your CPA or tax attorney handles the IRS interaction as they normally would. As with all tax deductions, the accuracy of your underlying data matters. We don't offer audit defense or IRS representation, and we recommend working with a qualified tax professional if you receive an audit notice.",
  },
];

export default function FAQSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" style={{ background: "var(--warm-white)" }}>
      <div className="container" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)", color: "var(--adobe)" }}>
            Before You Buy
          </div>
          <h2 className="h2-section reveal">
            The questions every STR owner asks.
          </h2>
          <p className="body-text reveal" style={{ maxWidth: 480, margin: "var(--space-2) auto 0", fontSize: 16 }}>
            And the answers your CPA will want to see before they file.
          </p>
        </div>

        <div
          className="reveal-stagger"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-1)",
          }}
        >
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="reveal"
      style={{
        background: "var(--surface-raised)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        transition: "all var(--dur-fast) var(--ease-out)",
        borderColor: open ? "var(--turq-light)" : undefined,
        borderLeftWidth: open ? "3px" : "1px",
        borderLeftColor: open ? "var(--turq)" : undefined,
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-2)",
          padding: "var(--space-3)",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          fontFamily: "var(--font-primary)",
          fontWeight: 500,
          fontSize: "15px",
          color: open ? "var(--turq-mid)" : "var(--ink)",
          transition: "color var(--dur-fast) var(--ease-out)",
        }}
      >
        {question}
        <ChevronDown
          size={18}
          style={{
            color: open ? "var(--turq)" : "var(--dust)",
            flexShrink: 0,
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "all var(--dur-mid) var(--ease-out)",
          }}
        />
      </button>
      <div
        style={{
          maxHeight: open ? "400px" : "0",
          overflow: "hidden",
          transition: "max-height var(--dur-mid) var(--ease-out)",
        }}
      >
        <div
          style={{
            padding: "0 var(--space-3) var(--space-3)",
            fontSize: "14px",
            lineHeight: 1.7,
            color: "var(--ink-mid)",
          }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
}
