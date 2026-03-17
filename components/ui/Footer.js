import Link from "next/link";
import { AbodeLogo } from "./NavBar";

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--ink)",
        color: "rgba(255,255,255,0.6)",
        padding: "var(--space-8) 0 var(--space-4)",
      }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "var(--space-6)",
          }}
        >
          {/* Brand */}
          <div>
            <div style={{ marginBottom: "var(--space-2)" }}>
              <AbodeLogo variant="dark" />
            </div>
            <p style={{ fontSize: "14px", maxWidth: "320px", lineHeight: 1.6 }}>
              AI-powered cost segregation studies for short-term rental investors.
              Methodology reviewed by tax professionals.
            </p>
          </div>

          {/* Links Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <div
                className="ui-label"
                style={{ color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-2)" }}
              >
                Product
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <Link href="/how-it-works" style={{ fontSize: "14px" }}>
                  How It Works
                </Link>
                <Link href="/pricing" style={{ fontSize: "14px" }}>
                  Pricing
                </Link>
                <Link href="/sample-study" style={{ fontSize: "14px" }}>
                  Sample Study
                </Link>
                <Link href="/quiz" style={{ fontSize: "14px" }}>
                  Free Estimate
                </Link>
              </div>
            </div>

            <div>
              <div
                className="ui-label"
                style={{ color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-2)" }}
              >
                Learn
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <Link href="/str-tax-loophole" style={{ fontSize: "14px" }}>
                  STR Tax Loophole
                </Link>
                <Link href="/bonus-depreciation" style={{ fontSize: "14px" }}>
                  Bonus Depreciation
                </Link>
                <Link href="/glossary" style={{ fontSize: "14px" }}>
                  Tax Glossary
                </Link>
                <Link href="/learn" style={{ fontSize: "14px" }}>
                  Blog
                </Link>
              </div>
            </div>

            <div>
              <div
                className="ui-label"
                style={{ color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-2)" }}
              >
                Company
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <Link href="/about" style={{ fontSize: "14px" }}>
                  About
                </Link>
                <Link href="/for-cpas" style={{ fontSize: "14px" }}>
                  For CPAs
                </Link>
                <Link href="/contact" style={{ fontSize: "14px" }}>
                  Contact
                </Link>
              </div>
            </div>

            <div>
              <div
                className="ui-label"
                style={{ color: "rgba(255,255,255,0.4)", marginBottom: "var(--space-2)" }}
              >
                Legal
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
                <Link href="/privacy" style={{ fontSize: "14px" }}>
                  Privacy Policy
                </Link>
                <Link href="/terms" style={{ fontSize: "14px" }}>
                  Terms of Service
                </Link>
                <Link href="/disclaimers" style={{ fontSize: "14px" }}>
                  Disclaimers
                </Link>
                <Link
                  href="/privacy#ccpa"
                  style={{ fontSize: "14px" }}
                >
                  Do Not Sell My Info
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            marginTop: "var(--space-6)",
            paddingTop: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
            fontSize: "12px",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "var(--space-2)",
            }}
          >
            <span>&copy; {new Date().getFullYear()} Abode Cost Segregation. All rights reserved.</span>
            <span className="mono" style={{ fontSize: "10px" }}>
              Not a CPA, tax, legal, or engineering firm.
            </span>
          </div>
          <p
            className="mono"
            style={{
              fontSize: "10px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.28)",
              maxWidth: "680px",
            }}
          >
            All studies, estimates, and reports are for informational purposes only and do not
            constitute tax, legal, or financial advice. Results depend on User-provided data
            and are not guaranteed. Consult a qualified CPA or tax attorney before making tax
            decisions. See our{" "}
            <Link
              href="/disclaimers"
              style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}
            >
              full disclaimers
            </Link>{" "}
            and{" "}
            <Link
              href="/terms"
              style={{ color: "rgba(255,255,255,0.4)", textDecoration: "underline" }}
            >
              terms of service
            </Link>.
          </p>
        </div>
      </div>
    </footer>
  );
}
