"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, FileText, ArrowRight, Shield, Loader2 } from "lucide-react";
import { AbodeLogo } from "@/components/ui/NavBar";

/**
 * /checkout/success — Post-payment confirmation page
 * Stripe redirects here with ?session_id=cs_...
 * Reads sessionStorage for wizard params and offers "Start Your Study" CTA.
 */
function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [wizardUrl, setWizardUrl] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      return;
    }

    // Build wizard URL from saved sessionStorage params
    try {
      const raw = sessionStorage.getItem("abode_wizard_params");
      if (raw) {
        const params = JSON.parse(raw);
        const qs = new URLSearchParams(params);
        // Mark as paid so wizard page knows to let the user through
        qs.set("session_id", sessionId);
        qs.set("paid", "1");
        setWizardUrl(`/quiz/study?${qs.toString()}`);
        // Clear so it can't be reused
        sessionStorage.removeItem("abode_wizard_params");
      } else {
        // No stored params — wizard can still launch with just session_id
        setWizardUrl(`/quiz/study?session_id=${sessionId}&paid=1`);
      }
    } catch {
      setWizardUrl(`/quiz/study?session_id=${sessionId}&paid=1`);
    }

    setStatus("success");
  }, [sessionId]);

  const Logo = () => (
    <div className="quiz-header">
      <Link href="/" className="quiz-logo"><AbodeLogo /></Link>
    </div>
  );

  if (status === "loading") {
    return (
      <div className="quiz-shell">
        <Logo />
        <div className="quiz-body" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div className="loading-spinner" />
          <p style={{ color: "var(--dust)", marginTop: "var(--space-3)" }}>Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="quiz-shell">
        <Logo />
        <div className="quiz-body" style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: "var(--space-3)" }}>
          <h1 className="h2-component">Something went wrong</h1>
          <p style={{ color: "var(--dust)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
            We couldn&apos;t confirm your payment. If you were charged, your purchase is safe —
            go to your dashboard and we&apos;ll sort it out.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxWidth: 360, width: "100%", margin: "0 auto" }}>
            <Link href="/app/dashboard" className="btn btn-primary btn-lg" style={{ width: "100%", justifyContent: "center" }}>
              Go to Dashboard
            </Link>
            <a href="mailto:support@abodecostseg.com" className="btn btn-subtle" style={{ width: "100%", justifyContent: "center" }}>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success state ────────────────────────────────────────────────────────
  return (
    <div className="quiz-shell quiz-results-shell">
      <Logo />
      <div
        className="quiz-body"
        style={{
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "var(--space-3)",
          padding: "var(--space-6) var(--space-3)",
        }}
      >
        {/* Success icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "var(--turq-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <CheckCircle size={36} color="var(--turq)" strokeWidth={2} />
        </div>

        <div>
          <h1 className="h2-component" style={{ marginBottom: "var(--space-1)" }}>
            Payment confirmed — you&apos;re good to go
          </h1>
          <p style={{ color: "var(--dust)", fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
            Your cost segregation study is purchased. Now let&apos;s get the details
            we need to generate your IRS-grade report. Takes about 5 minutes.
          </p>
        </div>

        {/* What happens next */}
        <div
          style={{
            background: "var(--surface)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-4)",
            maxWidth: 460,
            width: "100%",
            margin: "0 auto",
            textAlign: "left",
          }}
        >
          <h3 style={{ fontSize: 13, fontWeight: 600, marginBottom: "var(--space-3)", color: "var(--ink)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            What happens next
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {[
              { num: "1", text: "Confirm a few property details (pre-filled from your search)" },
              { num: "2", text: "Answer questions about materials, finishes & improvements" },
              { num: "3", text: "Review and sign your study — done in minutes" },
              { num: "4", text: "Download your IRS-grade cost seg report immediately" },
            ].map(({ num, text }) => (
              <div key={num} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--turq)",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {num}
                </div>
                <span style={{ fontSize: 14, color: "var(--ink-mid)", lineHeight: 1.5, paddingTop: 3 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Primary CTA */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxWidth: 400, width: "100%", margin: "0 auto" }}>
          {wizardUrl ? (
            <Link
              href={wizardUrl}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Start Your Study <ArrowRight size={18} />
            </Link>
          ) : (
            <Link
              href="/app/dashboard"
              className="btn btn-primary btn-lg"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          )}
          <Link href="/app/dashboard" className="btn btn-subtle" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
            Save for later — go to dashboard
          </Link>
        </div>

        {/* Receipt note */}
        <p style={{ color: "var(--dust)", fontSize: 12, marginTop: "var(--space-1)" }}>
          A receipt has been sent to your email by Stripe. Questions?{" "}
          <a href="mailto:support@abodecostseg.com" style={{ color: "var(--turq)" }}>support@abodecostseg.com</a>
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="quiz-shell">
          <div className="quiz-header">
            <Link href="/" className="quiz-logo"><AbodeLogo /></Link>
          </div>
          <div className="quiz-body" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <div className="loading-spinner" />
          </div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
