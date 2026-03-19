"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/email/reset-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setDone(true);
        setTimeout(() => router.push("/app/dashboard"), 2000);
      } else {
        setError(data.error || "Reset failed. Please request a new link.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card card-raised" style={{ padding: "var(--space-5)" }}>
      {done ? (
        <div style={{ textAlign: "center" }}>
          <h1 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
            Password updated
          </h1>
          <p style={{ fontSize: "14px", color: "var(--dust)", marginBottom: "var(--space-3)" }}>
            You&apos;re now signed in. Redirecting to your dashboard...
          </p>
          <Loader2 size={20} className="quiz-airbnb-spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : (
        <>
          <h1 className="h3-component" style={{ textAlign: "center", marginBottom: "var(--space-1)" }}>
            Set a new password
          </h1>
          <p style={{ fontSize: "14px", color: "var(--dust)", textAlign: "center", marginBottom: "var(--space-4)" }}>
            Choose a strong password for your account.
          </p>

          {error && (
            <p style={{ fontSize: 12, color: "var(--adobe)", textAlign: "center", marginBottom: "var(--space-2)" }}>
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label className="label">New Password</label>
              <input
                className="input"
                type="password"
                placeholder="8+ characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                disabled={loading || !token}
              />
            </div>
            <div className="field">
              <label className="label">Confirm Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                disabled={loading || !token}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={loading || !token}
            >
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Loader2 size={14} className="quiz-airbnb-spinner" />
                  Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
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

        <Suspense fallback={
          <div className="card card-raised" style={{ padding: "var(--space-5)", textAlign: "center" }}>
            <Loader2 size={20} className="quiz-airbnb-spinner" style={{ margin: "0 auto" }} />
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>

        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--dust)", marginTop: "var(--space-3)" }}>
          <Link href="/login" style={{ color: "var(--turq)", fontWeight: 500 }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
