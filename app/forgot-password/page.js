"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // STUB: No actual email sent
    setSent(true);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: "var(--space-3)",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <Link
          href="/"
          style={{
            display: "block",
            fontWeight: 700,
            fontSize: "24px",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            textAlign: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          abode
        </Link>

        <div className="card card-raised" style={{ padding: "var(--space-5)" }}>
          {sent ? (
            <div style={{ textAlign: "center" }}>
              <h1 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
                Check your email
              </h1>
              <p style={{ fontSize: "14px", color: "var(--dust)", marginBottom: "var(--space-4)" }}>
                If an account exists with that email, we&apos;ll send reset instructions.
              </p>
              <Link href="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="h3-component" style={{ textAlign: "center", marginBottom: "var(--space-4)" }}>
                Reset your password
              </h1>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Email</label>
                  <input className="input" type="email" placeholder="you@example.com" required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--dust)", marginTop: "var(--space-3)" }}>
          <Link href="/login" style={{ color: "var(--turq)", fontWeight: 500 }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
