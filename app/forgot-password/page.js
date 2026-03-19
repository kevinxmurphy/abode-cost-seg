"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/email/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always show success to prevent user enumeration
      setSent(true);
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
              <h1 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
                Check your email
              </h1>
              <p style={{ fontSize: "14px", color: "var(--dust)", marginBottom: "var(--space-4)" }}>
                If an account exists for <strong>{email}</strong>, we&apos;ve sent
                reset instructions. The link expires in 60 minutes.
              </p>
              <Link href="/login" className="btn btn-primary">
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="h3-component" style={{ textAlign: "center", marginBottom: "var(--space-1)" }}>
                Reset your password
              </h1>
              <p style={{ fontSize: "14px", color: "var(--dust)", textAlign: "center", marginBottom: "var(--space-4)" }}>
                Enter your email and we&apos;ll send a reset link.
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
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={loading}
                >
                  {loading ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <Loader2 size={14} className="quiz-airbnb-spinner" />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Link"
                  )}
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
