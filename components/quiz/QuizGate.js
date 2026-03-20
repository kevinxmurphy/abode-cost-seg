"use client";

// ═══════════════════════════════════════════════════════
// QuizGate — Session-aware quiz entry point
//
// Priority order on mount:
//  1. ?propertyId=UUID param → fetch that property → redirect to details_url
//  2. Logged-in with saved estimate(s) → Resume screen
//  3. Logged-in, no saved estimates   → Fresh quiz
//  4. Not logged in                   → Fresh quiz
// ═══════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import QuizShell from "./QuizShell";
import { reconstructAnswersFromProperty, reconstructAirbnbJob } from "@/lib/quizRestore";
import { AbodeLogo } from "@/components/ui/NavBar";

export default function QuizGate() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // "loading" | "resume" | "quiz"
  const [status, setStatus] = useState("loading");
  const [savedProperties, setSavedProperties] = useState([]);
  const [initialAnswers, setInitialAnswers] = useState({});
  const [initialAirbnbJob, setInitialAirbnbJob] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        // 0. ?propertyId param — go straight to that property's details
        const propertyId = searchParams.get("propertyId");
        if (propertyId) {
          const res = await fetch(`/api/properties/${propertyId}`);
          if (res.ok && !cancelled) {
            const { property } = await res.json();
            if (property?.details_url) {
              router.replace(property.details_url);
              return;
            }
            if (property) {
              // Fallback: pre-populate quiz from DB data
              setInitialAnswers(reconstructAnswersFromProperty(property));
              setInitialAirbnbJob(reconstructAirbnbJob(property));
              setStatus("quiz");
              return;
            }
          }
          // Property not found / not owned — fall through to normal flow
        }

        // 1. Is user logged in?
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok || cancelled) {
          if (!cancelled) setStatus("quiz");
          return;
        }
        const session = await sessionRes.json();
        if (!session?.user || cancelled) {
          if (!cancelled) setStatus("quiz");
          return;
        }

        // 2. Do they have any saved estimate-stage properties?
        const propsRes = await fetch("/api/properties");
        if (!propsRes.ok || cancelled) {
          if (!cancelled) setStatus("quiz");
          return;
        }
        const { properties: allProps } = await propsRes.json();
        if (cancelled) return;

        const estimateProps = (allProps || []).filter(
          (p) => !p.study_status || p.study_status === "estimate"
        );

        if (estimateProps.length === 0) {
          setStatus("quiz");
          return;
        }

        // 3. Pre-build answers from most-recent property (used if no details_url)
        const answers = reconstructAnswersFromProperty(estimateProps[0]);
        const airbnbJob = reconstructAirbnbJob(estimateProps[0]);
        setSavedProperties(estimateProps);
        setInitialAnswers(answers);
        setInitialAirbnbJob(airbnbJob);
        setStatus("resume");
      } catch {
        if (!cancelled) setStatus("quiz");
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Loading ──────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="quiz-shell">
        <div className="quiz-header">
          <Link href="/" className="quiz-logo">
            <AbodeLogo />
          </Link>
          <div />
          <div />
        </div>
        <div
          className="quiz-body"
          style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 300 }}
        >
          <div className="dash-spinner" />
        </div>
      </div>
    );
  }

  // ── Resume screen ────────────────────────────────────
  if (status === "resume") {
    return (
      <ResumeScreen
        properties={savedProperties}
        onNewProperty={() => {
          setInitialAnswers({});
          setInitialAirbnbJob(null);
          setStatus("quiz");
        }}
        router={router}
      />
    );
  }

  // ── Fresh or pre-populated quiz ──────────────────────
  return (
    <QuizShell
      initialAnswers={initialAnswers}
      initialAirbnbJob={initialAirbnbJob}
    />
  );
}

// ─── Resume Screen ────────────────────────────────────────────────────────────

function ResumeScreen({ properties, onNewProperty, router }) {
  const hasMultiple = properties.length > 1;

  return (
    <div className="quiz-shell">
      <div className="quiz-header">
        <Link href="/" className="quiz-logo">
          <AbodeLogo />
        </Link>
        <div />
        <div />
      </div>

      <div className="quiz-body">
        <div className="quiz-content">
          <div style={{ marginBottom: "var(--space-2)" }}>
            <span className="eyebrow">Welcome back</span>
          </div>
          <h2 className="quiz-question" style={{ marginBottom: "var(--space-2)" }}>
            {hasMultiple ? "Pick up where you left off" : "Continue your estimate"}
          </h2>
          <p
            className="body-text"
            style={{ color: "var(--ink-mid)", marginBottom: "var(--space-5)", fontSize: 15, lineHeight: 1.6 }}
          >
            {hasMultiple
              ? "You have saved properties. Continue an estimate or start fresh with a new one."
              : "Your saved estimate is ready. Jump back in to review, refine, or order your full study."}
          </p>

          {/* Property cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
            {properties.map((property) => (
              <PropertyResumeCard key={property.id} property={property} router={router} />
            ))}
          </div>

          {/* New property CTA */}
          <button
            className="btn btn-subtle"
            onClick={onNewProperty}
            style={{ width: "100%", justifyContent: "center", gap: "var(--space-1)" }}
          >
            <Plus size={15} />
            Start a new property
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Property Resume Card ─────────────────────────────────────────────────────

function PropertyResumeCard({ property, router }) {
  const displayName =
    property.airbnb_title || property.address || "Saved Property";
  const fullAddress = [property.address, property.city, property.state]
    .filter(Boolean)
    .join(", ");
  const showSubAddress = displayName !== fullAddress && fullAddress;

  const deduction = property.estimate?.first_year_deduction;
  const conservative = property.estimate?.conservative;
  const optimistic = property.estimate?.optimistic;
  const price = property.purchase_price;

  function handleContinue() {
    // details_url is the full /quiz/details?... URL with all quiz context
    if (property.details_url) {
      router.push(property.details_url);
    } else {
      // Fallback: property detail page (edge case — should always have details_url)
      router.push(`/app/properties/${property.id}`);
    }
  }

  return (
    <button
      onClick={handleContinue}
      style={{
        all: "unset",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3)",
        border: "1.5px solid var(--border)",
        borderRadius: "var(--radius)",
        background: "var(--surface)",
        cursor: "pointer",
        width: "100%",
        boxSizing: "border-box",
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--turq)";
        e.currentTarget.style.boxShadow = "0 0 0 3px var(--turq-bg)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
        <div
          style={{
            fontWeight: 600,
            color: "var(--ink)",
            fontSize: 15,
            marginBottom: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {displayName}
        </div>
        {showSubAddress && (
          <div
            style={{
              fontSize: 12,
              color: "var(--dust)",
              marginBottom: 6,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {fullAddress}
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", fontSize: 13 }}>
          {price && (
            <span style={{ color: "var(--ink-mid)" }}>
              ${Number(price).toLocaleString()}
            </span>
          )}
          {deduction ? (
            <span style={{ color: "var(--turq)", fontWeight: 600 }}>
              ~${Math.round(deduction).toLocaleString()} est. yr 1 deduction
            </span>
          ) : conservative && optimistic ? (
            <span style={{ color: "var(--turq)", fontWeight: 600 }}>
              ${Math.round(conservative).toLocaleString()}–${Math.round(optimistic).toLocaleString()} range
            </span>
          ) : null}
        </div>
      </div>
      <ArrowRight size={18} style={{ color: "var(--turq)", flexShrink: 0 }} />
    </button>
  );
}
