"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";
import Link from "next/link";
import { Check, X, Minus } from "lucide-react";
import { STUDY_PRICE_DISPLAY, STUDY_PRICE_FLAT } from "@/lib/pricing";

const rows = [
  { label: "Cost",                        abode: STUDY_PRICE_FLAT,       software: "$1,500–$3,000",    eng: "$5,000–$15,000",    diy: "Your time" },
  { label: "Turnaround",                  abode: "Minutes (AI-powered)", software: "Days to weeks",    eng: "4–8 weeks",         diy: "Weeks (if possible)" },
  { label: "STR-optimised",               abode: true,                   software: "rarely",           eng: "rarely",            diy: false },
  { label: "IRS-guided methodology",      abode: true,                   software: true,               eng: true,                diy: false },
  { label: "CPA-ready PDF",               abode: true,                   software: true,               eng: true,                diy: false },
  { label: "Excel fixed asset schedule",  abode: true,                   software: true,               eng: true,                diy: false },
  { label: "Catch-up (Form 3115)",        abode: true,                   software: "rarely",           eng: true,                diy: false },
  { label: "Land/building allocation",    abode: true,                   software: true,               eng: true,                diy: false },
  { label: "No engineering firm needed",  abode: true,                   software: true,               eng: false,               diy: true },
  { label: "90-day money-back guarantee", abode: true,                   software: false,              eng: false,               diy: false },
];

function Cell({ value }) {
  if (value === true)
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{
          width: 22, height: 22, borderRadius: "50%",
          background: "var(--turq)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <Check size={13} strokeWidth={2.5} color="#fff" />
        </div>
      </div>
    );
  if (value === false)
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <X size={18} style={{ color: "var(--dust)" }} />
      </div>
    );
  if (value === "rarely")
    return (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <Minus size={18} style={{ color: "var(--dust)" }} />
      </div>
    );
  return (
    <div style={{
      textAlign: "center", fontSize: "13px",
      color: "var(--ink-mid)", fontFamily: "var(--font-primary)",
      lineHeight: 1.4,
    }}>
      {value}
    </div>
  );
}

export default function ComparisonSection() {
  const ref = useScrollReveal();

  return (
    <section className="section" style={{ background: "var(--surface)" }}>
      <div className="container" ref={ref}>
        <div style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
          <div className="eyebrow reveal" style={{ marginBottom: "var(--space-1)" }}>
            How We Compare
          </div>
          <h2 className="h2-section reveal" style={{ maxWidth: 560, margin: "0 auto" }}>
            For decades, this was only for the big guys. We changed the math.
          </h2>
          <p className="body-text reveal" style={{ maxWidth: 560, margin: "var(--space-2) auto 0", fontSize: 16 }}>
            Engineering firms charge $5K–$15K and take months — pricing that only made sense for commercial portfolios. Abode delivers the same IRS-guided study in minutes, at a price built for individual STR investors.
          </p>
        </div>

        <div className="reveal" style={{ maxWidth: 1020, margin: "0 auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ width: "26%", padding: "12px 16px", textAlign: "left",
                  fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--dust)",
                  letterSpacing: "0.08em", fontWeight: 400, borderBottom: "1px solid var(--border)" }} />

                {/* Abode column — highlighted */}
                <th style={{
                  width: "18.5%", padding: "12px 16px", textAlign: "center",
                  background: "var(--turq-bg)",
                  borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
                  borderTop: "3px solid var(--turq)",
                  borderLeft: "1px solid var(--turq-light)",
                  borderRight: "1px solid var(--turq-light)",
                }}>
                  <div style={{ fontFamily: "var(--font-primary)", fontWeight: 700,
                    fontSize: 15, color: "var(--turq-mid)" }}>Abode</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--turq)", letterSpacing: "0.06em", marginTop: 2 }}>
                    STR-FOCUSED
                  </div>
                </th>

                {/* Desktop Software */}
                <th style={{ width: "18.5%", padding: "12px 16px", textAlign: "center",
                  borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-primary)", fontWeight: 600,
                    fontSize: 14, color: "var(--ink)" }}>Desktop Software</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--dust)", letterSpacing: "0.06em", marginTop: 2 }}>
                    LOWER COST
                  </div>
                </th>

                {/* Engineering Firm */}
                <th style={{ width: "18.5%", padding: "12px 16px", textAlign: "center",
                  borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-primary)", fontWeight: 600,
                    fontSize: 14, color: "var(--ink)" }}>Engineering Firm</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--dust)", letterSpacing: "0.06em", marginTop: 2 }}>
                    TRADITIONAL
                  </div>
                </th>

                {/* DIY */}
                <th style={{ width: "18.5%", padding: "12px 16px", textAlign: "center",
                  borderBottom: "1px solid var(--border)" }}>
                  <div style={{ fontFamily: "var(--font-primary)", fontWeight: 600,
                    fontSize: 14, color: "var(--ink)" }}>DIY / Spreadsheet</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10,
                    color: "var(--dust)", letterSpacing: "0.06em", marginTop: 2 }}>
                    RISKY
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => {
                const isLast = i === rows.length - 1;
                const rowBg = i % 2 === 0 ? "#fff" : "var(--surface)";
                return (
                  <tr key={i}>
                    {/* Label */}
                    <td style={{
                      padding: "12px 16px",
                      fontSize: 14,
                      color: "var(--ink-mid)",
                      fontFamily: "var(--font-primary)",
                      background: rowBg,
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                    }}>
                      {row.label}
                    </td>

                    {/* Abode — highlighted column */}
                    <td style={{
                      padding: "12px 16px",
                      background: "var(--turq-bg)",
                      borderLeft: "1px solid var(--turq-light)",
                      borderRight: "1px solid var(--turq-light)",
                      borderBottom: isLast ? "none" : "1px solid rgba(26,140,140,0.1)",
                      borderRadius: isLast ? "0 0 var(--radius-lg) var(--radius-lg)" : undefined,
                    }}>
                      <Cell value={row.abode} />
                    </td>

                    {/* Desktop Software */}
                    <td style={{
                      padding: "12px 16px",
                      background: rowBg,
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                    }}>
                      <Cell value={row.software} />
                    </td>

                    {/* Engineering */}
                    <td style={{
                      padding: "12px 16px",
                      background: rowBg,
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                    }}>
                      <Cell value={row.eng} />
                    </td>

                    {/* DIY */}
                    <td style={{
                      padding: "12px 16px",
                      background: rowBg,
                      borderBottom: isLast ? "none" : "1px solid var(--border)",
                    }}>
                      <Cell value={row.diy} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* CTA below table */}
        <div className="reveal" style={{ textAlign: "center", marginTop: "var(--space-5)" }}>
          <Link href="/quiz" className="btn btn-primary">
            Get My STR Study — {STUDY_PRICE_DISPLAY}
          </Link>
          <p style={{ marginTop: "var(--space-2)", fontSize: 12,
            color: "var(--dust)", fontFamily: "var(--font-primary)" }}>
            90-day money-back guarantee · No engineering firm required
          </p>
        </div>
      </div>
    </section>
  );
}
