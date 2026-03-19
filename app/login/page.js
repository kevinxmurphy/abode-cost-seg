"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/app/dashboard";

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [gisRendered, setGisRendered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const googleBtnRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // ─── Email/password login ───
  async function handleSubmit(e) {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(redirect);
      } else {
        setAuthError(data.error || "Sign-in failed. Please try again.");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  // ─── Google Sign-In callback ───
  const handleGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        setAuthError("Google sign-in failed. Please try again.");
        return;
      }
      setAuthLoading(true);
      setAuthError("");
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential: response.credential }),
        });
        const data = await res.json();
        if (data.success && data.user) {
          router.push(redirect);
        } else {
          setAuthError(data.error || "Sign-in failed. Please try again.");
        }
      } catch {
        setAuthError("Network error. Please try again.");
      } finally {
        setAuthLoading(false);
      }
    },
    [router, redirect]
  );

  // ─── Initialize Google Identity Services ───
  useEffect(() => {
    function initGoogle() {
      if (typeof window === "undefined" || !window.google?.accounts?.id) return;
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      if (googleBtnRef.current) {
        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: "outline",
          size: "large",
          width: googleBtnRef.current.offsetWidth || 380,
          text: "signin_with",
          shape: "pill",
          logo_alignment: "center",
        });
        setGisRendered(true);
      }
    }

    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initGoogle();
        }
      }, 200);
      const timeout = setTimeout(() => clearInterval(checkInterval), 5000);
      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, [handleGoogleCredential]);

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
          <h1
            className="h3-component"
            style={{ textAlign: "center", marginBottom: "var(--space-4)" }}
          >
            Welcome back
          </h1>

          {/* Google Sign-In */}
          <div
            ref={googleBtnRef}
            style={{ marginBottom: "var(--space-2)", minHeight: 44 }}
          />

          {mounted && !authLoading && !gisRendered && (
            <button
              className="btn btn-outline"
              style={{ width: "100%", marginBottom: "var(--space-2)" }}
              onClick={() => {
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                } else {
                  setAuthError("Google Sign-In is loading. Please try again in a moment.");
                }
              }}
            >
              Sign in with Google
            </button>
          )}

          {authLoading && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px 0",
                fontSize: 13,
                color: "var(--dust)",
              }}
            >
              <Loader2 size={16} className="quiz-airbnb-spinner" />
              Signing in...
            </div>
          )}

          {authError && (
            <p
              style={{
                fontSize: 12,
                color: "var(--adobe)",
                textAlign: "center",
                marginBottom: "var(--space-2)",
              }}
            >
              {authError}
            </p>
          )}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-2)",
              margin: "var(--space-3) 0",
            }}
          >
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
            <span style={{ fontSize: "12px", color: "var(--dust)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
          </div>

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
            <div className="field">
              <label className="label" style={{ display: "flex", justifyContent: "space-between" }}>
                Password
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "var(--turq)", fontWeight: 400 }}>
                  Forgot?
                </Link>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={authLoading}
            >
              Log in
            </button>
          </form>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "var(--dust)",
            marginTop: "var(--space-3)",
          }}
        >
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "var(--turq)", fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
