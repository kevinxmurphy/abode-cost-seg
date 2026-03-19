"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
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
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: "var(--turq-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto var(--space-3)",
                  fontSize: 24,
                }}
              >
                ✓
              </div>
              <h1 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
                Check your email
              </h1>
              <p style={{ fontSize: "14px", color: "var(--dust)", marginBottom: "var(--space-4)", lineHeight: 1.6 }}>
                If an account with <strong>{email}</strong> exists, we&apos;ve sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link href="/login" className="btn btn-primary" style={{ display: "inline-block" }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1
                className="h3-component"
                style={{ textAlign: "center", marginBottom: "var(--space-2)" }}
              >
                Reset your password
              </h1>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--dust)",
                  textAlign: "center",
                  marginBottom: "var(--space-4)",
                  lineHeight: 1.5,
                }}
              >
                Enter your email and we&apos;ll send you a reset link.
              </p>

              {error && (
                <p style={{ fontSize: 12, color: "var(--adobe)", textAlign: "center", marginBottom: "var(--space-2)" }}>
                  {error}
                </p>
              )}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="label">Email</label>
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
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
