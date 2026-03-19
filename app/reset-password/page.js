"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
          Invalid link
        </h1>
        <p style={{ fontSize: "14px", color: "var(--dust)", marginBottom: "var(--space-4)" }}>
          This reset link is missing or malformed. Please request a new one.
        </p>
        <Link href="/forgot-password" className="btn btn-primary" style={{ display: "inline-block" }}>
          Request Reset Link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setDone(true);
        setTimeout(() => router.push("/app/dashboard"), 2000);
      } else {
        setError(data.error || "Reset failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
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
          Password updated
        </h1>
        <p style={{ fontSize: "14px", color: "var(--dust)" }}>
          You&apos;re signed in. Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <>
      <h1
        className="h3-component"
        style={{ textAlign: "center", marginBottom: "var(--space-2)" }}
      >
        Set new password
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
          <div style={{ position: "relative" }}>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              placeholder="8+ characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--dust)",
                display: "flex",
                alignItems: "center",
                padding: 0,
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
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
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: "100%" }}
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </>
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

        <div className="card card-raised" style={{ padding: "var(--space-5)" }}>
          <Suspense fallback={<div style={{ textAlign: "center", color: "var(--dust)" }}>Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
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
