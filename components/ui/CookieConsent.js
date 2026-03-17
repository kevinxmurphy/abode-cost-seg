"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const COOKIE_CONSENT_KEY = "abode_cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        background: "var(--ink)",
        borderTop: "1px solid rgba(255,255,255,0.1)",
        padding: "var(--space-3) 0",
        animation: "slideUp 0.3s ease-out",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-3)",
        }}
      >
        <div style={{ flex: "1 1 400px", minWidth: 0 }}>
          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.6,
              color: "rgba(255,255,255,0.7)",
              margin: 0,
            }}
          >
            We use cookies and similar technologies to improve your experience, analyze site
            traffic, and for marketing purposes. By clicking &ldquo;Accept All,&rdquo; you
            consent to our use of cookies. See our{" "}
            <Link
              href="/privacy"
              style={{ color: "var(--turq-light)", textDecoration: "underline" }}
            >
              Privacy Policy
            </Link>{" "}
            for details.{" "}
            <span style={{ color: "rgba(255,255,255,0.5)" }}>
              California residents: see our{" "}
              <Link
                href="/privacy#ccpa"
                style={{ color: "var(--turq-light)", textDecoration: "underline" }}
              >
                CCPA disclosures
              </Link>.
            </span>
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", flexShrink: 0 }}>
          <button
            onClick={handleDecline}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "var(--font-primary)",
              background: "transparent",
              color: "rgba(255,255,255,0.6)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            Essential Only
          </button>
          <button
            onClick={handleAccept}
            style={{
              padding: "8px 20px",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-primary)",
              background: "var(--turq)",
              color: "#fff",
              border: "1px solid var(--turq)",
              borderRadius: "var(--radius-pill)",
              cursor: "pointer",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            Accept All
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
