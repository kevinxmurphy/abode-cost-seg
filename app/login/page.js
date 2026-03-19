"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [gisRendered, setGisRendered] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => setMounted(true), []);

  // ─── Email / Password login ───
  async function handleSubmit(e) {
    e.preventDefault();
    setAuthError("");
    setEmailLoading(true);
    try {
      const res = await fetch("/api/auth/email/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/app/dashboard");
      } else {
        setAuthError(data.error || "Sign-in failed. Please try again.");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setEmailLoading(false);
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
          router.push("/app/dashboard");
        } else {
          setAuthError(data.error || "Sign-in failed. Please try again.");
        }
      } catch {
        setAuthError("Network error. Please try again.");
      } finally {
        setAuthLoading(false);
      }
    },
    [router]
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

  const isLoading = authLoading || emailLoading;

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

          {/* Google Sign-In — Real GIS button */}
          <div
            ref={googleBtnRef}
            style={{ marginBottom: "var(--space-2)", minHeight: 44 }}
          />

          {/* Fallback Google button if GIS hasn't rendered */}
          {mounted && !authLoading && !gisRendered && (
            <button
              className="btn btn-outline"
              style={{ width: "100%", marginBottom: "var(--space-2)" }}
              onClick={() => {
                if (window.google?.accounts?.id) {
                  window.google.accounts.id.prompt();
                } else {
                  setAuthError(
                    "Google Sign-In is loading. Please try again in a moment."
                  );
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
              textAlign: "center",
              margin: "var(--space-2) 0",
              fontSize: "12px",
              color: "var(--dust)",
            }}
          >
            or
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
                disabled={isLoading}
              />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%" }}
              disabled={isLoading}
            >
              {emailLoading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Loader2 size={14} className="quiz-airbnb-spinner" />
                  Signing in...
                </span>
              ) : (
                "Log in"
              )}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "var(--space-3)" }}>
            <Link
              href="/forgot-password"
              style={{ fontSize: "13px", color: "var(--turq)" }}
            >
              Forgot password?
            </Link>
          </div>
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
          <Link
            href="/signup"
            style={{ color: "var(--turq)", fontWeight: 500 }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
