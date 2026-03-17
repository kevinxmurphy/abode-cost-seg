"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [gisRendered, setGisRendered] = useState(false);
  const googleBtnRef = useRef(null);

  useEffect(() => setMounted(true), []);

  function handleSubmit(e) {
    e.preventDefault();
    if (!agreed) return;
    // STUB: Email/password auth — always redirects to dashboard
    router.push("/app/dashboard");
  }

  // ─── Google Sign-In callback ───
  const handleGoogleCredential = useCallback(
    async (response) => {
      if (!response?.credential) {
        setAuthError("Google sign-in failed. Please try again.");
        return;
      }
      if (!agreed) {
        setAuthError("Please agree to the Terms of Service before continuing.");
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
          setAuthError(data.error || "Sign-up failed. Please try again.");
        }
      } catch {
        setAuthError("Network error. Please try again.");
      } finally {
        setAuthLoading(false);
      }
    },
    [router, agreed]
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
          text: "continue_with",
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
            Create your account
          </h1>

          {/* Terms & Privacy consent — shown above Google button */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              marginBottom: "var(--space-3)",
            }}
          >
            <input
              type="checkbox"
              id="terms-consent"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              style={{
                marginTop: "3px",
                flexShrink: 0,
                width: "16px",
                height: "16px",
                accentColor: "var(--turq)",
                cursor: "pointer",
              }}
            />
            <label
              htmlFor="terms-consent"
              style={{
                fontSize: "12px",
                lineHeight: 1.5,
                color: "var(--dust)",
                cursor: "pointer",
              }}
            >
              I agree to the{" "}
              <Link
                href="/terms"
                style={{ color: "var(--turq)", textDecoration: "underline" }}
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                style={{ color: "var(--turq)", textDecoration: "underline" }}
                target="_blank"
              >
                Privacy Policy
              </Link>
              . I understand that Abode provides informational reports only and
              does not provide tax, legal, or financial advice.
            </label>
          </div>

          {/* Google Sign-In — Real GIS button */}
          <div
            ref={googleBtnRef}
            style={{
              marginBottom: "var(--space-2)",
              minHeight: 44,
              opacity: agreed ? 1 : 0.5,
              pointerEvents: agreed ? "auto" : "none",
              transition: "opacity var(--dur-fast) var(--ease-out)",
            }}
          />

          {/* Fallback Google button if GIS hasn't rendered */}
          {mounted && !authLoading && !gisRendered && (
              <button
                className="btn btn-outline"
                style={{
                  width: "100%",
                  marginBottom: "var(--space-2)",
                  opacity: agreed ? 1 : 0.5,
                  cursor: agreed ? "pointer" : "not-allowed",
                }}
                disabled={!agreed}
                onClick={() => {
                  if (!agreed) {
                    setAuthError("Please agree to the Terms of Service first.");
                    return;
                  }
                  if (window.google?.accounts?.id) {
                    window.google.accounts.id.prompt();
                  } else {
                    setAuthError(
                      "Google Sign-In is loading. Please try again in a moment."
                    );
                  }
                }}
              >
                Continue with Google
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
              Creating your account...
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
              <label className="label">Full Name</label>
              <input className="input" placeholder="Kevin" required />
            </div>
            <div className="field">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="8+ characters"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: "100%",
                opacity: agreed ? 1 : 0.5,
                cursor: agreed ? "pointer" : "not-allowed",
              }}
              disabled={!agreed}
            >
              Create Account
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: "10px",
              color: "var(--dust)",
              marginTop: "var(--space-3)",
              lineHeight: 1.5,
            }}
          >
            By creating an account, you also agree to our{" "}
            <Link
              href="/disclaimers"
              style={{ color: "var(--turq)" }}
              target="_blank"
            >
              Disclaimers
            </Link>
            . We do not sell your personal information.
          </p>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "14px",
            color: "var(--dust)",
            marginTop: "var(--space-3)",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--turq)", fontWeight: 500 }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
