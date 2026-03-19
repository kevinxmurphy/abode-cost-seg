"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Home,
  Calendar,
  Ruler,
  MapPin,
  Zap,
  Lock,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";
import { captureEmail } from "@/lib/stubs";
import { useCountUp } from "@/lib/useCountUp";
import { saveProperty } from "@/lib/propertyStore";

// Bonus depreciation rates by purchase year
const BONUS_RATES = {
  "2025-post": 1.0,
  "2025-pre": 0.4,
  "2024": 0.6,
  "2023": 0.8,
  "2022-earlier": 1.0, // catch-up via 3115
};

// Study cost (flat rate)
function getStudyCost(purchasePrice) {
  return 481;
}

// Reclassification % by property type and age
function getReclassPercent(propertyType, yearBuilt) {
  const age = new Date().getFullYear() - (yearBuilt || 2010);
  const type = (propertyType || "").toLowerCase();
  let base = 0.20;
  if (type.includes("condo") || type.includes("townhouse")) base = 0.15;
  else if (type.includes("multi")) base = 0.22;
  if (age > 30) base += 0.04;
  else if (age > 20) base += 0.03;
  else if (age > 10) base += 0.02;
  else if (age < 3) base -= 0.02;
  return Math.max(0.12, Math.min(base, 0.35));
}

function calculateEstimate(answers) {
  const price = answers.purchasePrice || 500000;
  const bonusRate = BONUS_RATES[answers.purchaseYear] || 0.6;
  const bracket = 0.32;

  // Land ratio from actual county data or default
  let landRatio = 0.17;
  let landRatioSource = "default";
  if (answers.assessedLand > 0 && answers.assessedImprovement > 0) {
    const totalAssessed = answers.assessedLand + answers.assessedImprovement;
    landRatio = answers.assessedLand / totalAssessed;
    landRatio = Math.max(0.08, Math.min(landRatio, 0.45));
    landRatioSource = "county";
  }

  const depreciableBasis = price * (1 - landRatio);

  // Property-aware reclassification
  const yearBuilt = parseInt(answers.yearBuilt) || 0;
  const reclassPercent = getReclassPercent(answers.propertyType, yearBuilt);
  const accelerated = depreciableBasis * reclassPercent;

  const bonusDeduction = accelerated * bonusRate;
  const regularFirstYear = accelerated * 0.08;
  const remainingStructure = depreciableBasis - accelerated;
  const structureFirstYear = remainingStructure / 27.5;
  const firstYearDeduction = regularFirstYear + bonusDeduction + structureFirstYear;
  const isCatchUp = answers.purchaseYear === "2022-earlier";

  // 27.5-year standard baseline
  const standardAnnualDeduction = depreciableBasis / 27.5;
  const standardAnnualSavings = standardAnnualDeduction * bracket;
  const firstYearSavings = firstYearDeduction * bracket;
  const yearOneMultiplier = standardAnnualDeduction > 0
    ? firstYearDeduction / standardAnnualDeduction
    : 0;

  return {
    firstYearDeduction: Math.round(firstYearDeduction),
    acceleratedAmount: Math.round(accelerated),
    depreciableBasis: Math.round(depreciableBasis),
    reclassPercent: Math.round(reclassPercent * 100),
    bonusRate: Math.round(bonusRate * 100),
    isCatchUp,
    standardAnnualDeduction: Math.round(standardAnnualDeduction),
    standardAnnualSavings: Math.round(standardAnnualSavings),
    firstYearSavings: Math.round(firstYearSavings),
    yearOneMultiplier: Math.round(yearOneMultiplier * 10) / 10,
    landRatio: Math.round(landRatio * 100),
    landRatioSource,
  };
}

export default function QuizResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const googleBtnRef = useRef(null);
  const gateRef = useRef(null);

  const answers = {
    propertyUse: searchParams.get("propertyUse") || "str",
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zip: searchParams.get("zip") || "",
    beds: searchParams.get("beds") || "",
    baths: searchParams.get("baths") || "",
    sqft: searchParams.get("sqft") || "",
    yearBuilt: searchParams.get("yearBuilt") || "",
    lotSqft: searchParams.get("lotSqft") || "",
    assessedLand: parseInt(searchParams.get("assessedLand") || "0", 10),
    assessedImprovement: parseInt(searchParams.get("assessedImprovement") || "0", 10),
    propertyType: searchParams.get("propertyType") || "",
    purchasePrice: parseCurrency(searchParams.get("purchasePrice") || "500000"),
    purchaseYear: searchParams.get("purchaseYear") || "2024",
    lastSoldPrice: searchParams.get("lastSoldPrice") || "",
    lastSoldDate: searchParams.get("lastSoldDate") || "",
    lat: searchParams.get("lat") || "",
    lon: searchParams.get("lon") || "",
  };

  // Airbnb data (if user imported via URL)
  const airbnb = {
    title: searchParams.get("airbnbTitle") || "",
    thumbnail: searchParams.get("airbnbThumbnail") || "",
    rating: parseFloat(searchParams.get("airbnbRating") || "0"),
    reviewCount: parseInt(searchParams.get("airbnbReviews") || "0", 10),
    isSuperhost: searchParams.get("airbnbSuperhost") === "1",
    bedrooms: parseInt(searchParams.get("airbnbBedrooms") || "0", 10),
    baths: parseFloat(searchParams.get("airbnbBaths") || "0"),
    guests: parseInt(searchParams.get("airbnbGuests") || "0", 10),
    propertyType: searchParams.get("airbnbPropertyType") || "",
    airbnbId: searchParams.get("airbnbId") || "",
    enrichment: searchParams.get("airbnbEnrichment") || "",
    images: searchParams.get("airbnbImages") || "",
  };
  const hasAirbnb = !!airbnb.title;

  const estimate = calculateEstimate(answers);
  const studyCost = getStudyCost(answers.purchasePrice);
  const midpointDeduction = Math.round(estimate.firstYearDeduction);
  const midpointSavings = Math.round(midpointDeduction * 0.32);
  const roiMultiple = midpointSavings > 0 ? (midpointSavings / studyCost).toFixed(1) : "0";
  const improvementPercent = Math.round(
    ((estimate.firstYearDeduction - estimate.standardAnnualDeduction) /
      estimate.standardAnnualDeduction) *
      100
  );

  // Street view URL — prefer lat/lon; fallback to full address (street + city + state)
  const streetViewUrl =
    answers.lat && answers.lon
      ? `/api/streetview?lat=${answers.lat}&lon=${answers.lon}`
      : answers.address
        ? `/api/streetview?address=${encodeURIComponent(
            [answers.address, answers.city, answers.state].filter(Boolean).join(", ")
          )}`
        : null;

  // Build URL for Tier 2 detailed walkthrough
  const detailParams = new URLSearchParams({
    address: answers.address,
    city: answers.city,
    state: answers.state,
    zip: answers.zip,
    propertyType: answers.propertyType,
    yearBuilt: answers.yearBuilt,
    sqft: answers.sqft,
    beds: answers.beds,
    baths: answers.baths,
    purchasePrice: String(answers.purchasePrice),
    purchaseYear: answers.purchaseYear,
    assessedLand: String(answers.assessedLand),
    assessedImprovement: String(answers.assessedImprovement),
    estLow: String(Math.round(estimate.firstYearDeduction * 0.75)),
    estHigh: String(Math.round(estimate.firstYearDeduction * 1.3)),
  });
  if (hasAirbnb) {
    detailParams.set("airbnbTitle", airbnb.title);
    detailParams.set("airbnbThumbnail", airbnb.thumbnail);
    detailParams.set("airbnbRating", String(airbnb.rating));
    detailParams.set("airbnbReviews", String(airbnb.reviewCount));
    if (airbnb.isSuperhost) detailParams.set("airbnbSuperhost", "1");
    detailParams.set("airbnbBedrooms", String(airbnb.bedrooms));
    detailParams.set("airbnbBaths", String(airbnb.baths));
    detailParams.set("airbnbGuests", String(airbnb.guests));
    detailParams.set("airbnbPropertyType", airbnb.propertyType);
    detailParams.set("airbnbId", airbnb.airbnbId);
    if (airbnb.enrichment) detailParams.set("airbnbEnrichment", airbnb.enrichment);
    if (airbnb.images) detailParams.set("airbnbImages", airbnb.images);
  }
  const detailsUrl = `/quiz/details?${detailParams.toString()}`;

  // ─── Google Sign-In callback ────────────────────────────────────────────
  const handleGoogleCredential = useCallback(async (response) => {
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
        body: JSON.stringify({
          credential: response.credential,
          propertyData: {
            answers,
            airbnb: hasAirbnb ? airbnb : null,
            estimate: calculateEstimate(answers),
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setAuthUser(data.user);
        setUnlocked(true);
        // Save property to local store so user can resume later
        saveProperty(data.user.email, {
          answers,
          airbnb: hasAirbnb ? airbnb : null,
          estimate: calculateEstimate(answers),
          detailsUrl,
          step: "results",
        });
        // Auto-advance to detailed walkthrough after a brief confirmation moment
        setTimeout(() => router.push(detailsUrl), 900);
      } else {
        setAuthError(data.error || "Sign-in failed. Please try email instead.");
      }
    } catch {
      setAuthError("Network error. Please try email instead.");
    } finally {
      setAuthLoading(false);
    }
  }, [answers, airbnb, hasAirbnb]);

  // ─── Initialize Google Identity Services ──────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 400);

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
        clearTimeout(timer);
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }

    return () => clearTimeout(timer);
  }, [handleGoogleCredential]);

  // Animated counters
  const conservativeDeduction = useCountUp(Math.round(estimate.firstYearDeduction * 0.75), 1000, revealed);
  const optimisticDeduction = useCountUp(Math.round(estimate.firstYearDeduction * 1.3), 1000, revealed);
  const standardAnnual = useCountUp(estimate.standardAnnualDeduction, 1000, revealed);
  const multiplierDisplay = useCountUp(estimate.yearOneMultiplier * 10, 800, revealed);

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (!email) return;
    captureEmail(email);
    setUnlocked(true);
    saveProperty(email, {
      answers,
      airbnb: hasAirbnb ? airbnb : null,
      estimate: calculateEstimate(answers),
      detailsUrl,
      step: "results",
    });
  }

  // Has rich property data from API?
  const hasPropertyData = !!answers.beds && !!answers.sqft;

  // Scroll to gate when user tries to interact with blurred content
  function scrollToGate() {
    if (gateRef.current) {
      gateRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <div className="quiz-shell quiz-results-shell">
      {/* Header */}
      <div className="quiz-header">
        <Link href="/" className="quiz-logo">abode</Link>
        <div />
        <Link href="/" className="btn btn-subtle btn-sm">Close</Link>
      </div>

      <div className="quiz-body" style={{ alignItems: "flex-start", paddingTop: "var(--space-4)" }}>
        <div style={{ maxWidth: "640px", width: "100%", margin: "0 auto" }}>

          {/* ═══ STREET VIEW + PROPERTY HERO ═══ */}
          {(streetViewUrl || hasAirbnb) && (
            <div className="results-property-hero">
              {streetViewUrl && (
                <div className="results-streetview" id="sv-container">
                  <img
                    src={streetViewUrl}
                    alt={`Street view of ${answers.address || "property"}`}
                    className="results-streetview-img"
                    onError={(e) => {
                      // Hide entire container — empty block looks broken
                      const container = document.getElementById("sv-container");
                      if (container) container.style.display = "none";
                    }}
                  />
                </div>
              )}
              {hasAirbnb && (
                <div className="results-airbnb-card">
                  {airbnb.thumbnail && (
                    <div className="results-airbnb-hero-wrap">
                      <img
                        src={airbnb.thumbnail}
                        alt={airbnb.title}
                        className="results-airbnb-hero-img"
                      />
                      {airbnb.isSuperhost && (
                        <span className="results-airbnb-superhost-badge">Superhost</span>
                      )}
                    </div>
                  )}
                  <div className="results-airbnb-info">
                    <div className="results-airbnb-title">{airbnb.title}</div>
                    <div className="results-airbnb-meta">
                      <Star size={13} fill="var(--turq)" stroke="var(--turq)" />
                      <span style={{ fontWeight: 700 }}>{airbnb.rating}</span>
                      <span style={{ color: "var(--dust)" }}>&middot;</span>
                      <span style={{ color: "var(--dust)" }}>{airbnb.reviewCount} reviews</span>
                      {airbnb.isSuperhost && (
                        <>
                          <span style={{ color: "var(--dust)" }}>&middot;</span>
                          <span className="results-airbnb-superhost">Superhost</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PHASE 1 — VISIBLE TEASER (above the gate) ═══ */}
          <div className="results-header">
            <div className="results-eyebrow">Your Estimated First-Year Deduction</div>
            <p className="results-tagline">
              {answers.address || answers.city || "Your property"}
              {hasAirbnb && (
                <span style={{ display: "block", fontSize: 13, color: "var(--dust)", marginTop: 2 }}>
                  Listed as: {airbnb.title}
                </span>
              )}
            </p>
          </div>

          {/* Main deduction card — always visible */}
          <div className={`results-main-card ${revealed ? "revealed" : ""}`}>
            <div className="results-main-label" style={{ marginBottom: "var(--space-2)" }}>
              Estimated first-year deduction
            </div>
            <div className="results-range-hero">
              <span className="results-range-hero-low">
                ${conservativeDeduction.toLocaleString()}
              </span>
              <span className="results-range-hero-dash">&mdash;</span>
              <span className="results-range-hero-high">
                ${optimisticDeduction.toLocaleString()}
              </span>
            </div>
            <div className="results-main-label" style={{ marginTop: "var(--space-2)", fontSize: 12 }}>
              That&apos;s a ${estimate.firstYearDeduction.toLocaleString()} deduction — saving you ~${Math.round(estimate.firstYearDeduction * 0.32).toLocaleString()} in taxes at 32%
            </div>
          </div>

          {/* ═══ STANDARD vs COST SEG — always visible (the "holy shit" moment) ═══ */}
          <div className="results-baseline-card">
            <div className="results-baseline-header">
              <Zap size={16} style={{ color: "var(--turq)" }} />
              <span className="results-baseline-title">Standard depreciation vs cost segregation</span>
            </div>
            <div className="results-baseline-comparison">
              <div className="results-baseline-col results-baseline-standard">
                <div className="results-baseline-label">Standard (27.5 yr)</div>
                <div className="results-baseline-amount">
                  ${standardAnnual.toLocaleString()}<span className="results-baseline-per">/yr</span>
                </div>
                <div className="results-baseline-sub">
                  Straight-line depreciation
                </div>
              </div>
              <div className="results-baseline-vs">vs</div>
              <div className="results-baseline-col results-baseline-costseg">
                <div className="results-baseline-label">With Cost Seg</div>
                <div className="results-baseline-amount results-baseline-highlight">
                  ${estimate.firstYearDeduction.toLocaleString()}<span className="results-baseline-per"> yr 1</span>
                </div>
                <div className="results-baseline-sub results-baseline-multiplier">
                  {(multiplierDisplay / 10).toFixed(1)}x more in Year 1
                </div>
              </div>
            </div>
            {estimate.landRatioSource === "county" && (
              <div className="results-baseline-footnote">
                Using actual county assessed values (land: {estimate.landRatio}% of total)
              </div>
            )}
          </div>

          {/* ═══ ROI ANCHORS — always visible ═══ */}
          <div className="results-roi-strip">
            <div className="results-roi-item">
              <div className="results-roi-value">{improvementPercent}%</div>
              <div className="results-roi-label">more than standard depreciation in Year 1</div>
            </div>
            <div className="results-roi-divider" />
            <div className="results-roi-item">
              <div className="results-roi-value">{roiMultiple}x</div>
              <div className="results-roi-label">return on your Abode cost seg study</div>
            </div>
            <div className="results-roi-divider" />
            <div className="results-roi-item">
              <div className="results-roi-value">~${midpointSavings.toLocaleString()}</div>
              <div className="results-roi-label">estimated Year 1 tax savings</div>
            </div>
          </div>

          {/* ═══ PHASE 2 — BLURRED / GATED CONTENT ═══ */}
          {!unlocked ? (
            <>
              {/* Blurred breakdown tease */}
              <div className="results-blurred-section" onClick={scrollToGate}>
                <div className="results-blurred-overlay">
                  <Lock size={20} />
                  <span>Create a free account to unlock your full breakdown</span>
                </div>
                <div className="results-blurred-content">
                  {/* Fake breakdown cards — blurred but visible shapes */}
                  <div className="results-breakdown">
                    <div className="results-breakdown-card">
                      <div className="results-breakdown-icon"><DollarSign size={18} /></div>
                      <div>
                        <div className="results-breakdown-label">Reclassified Assets</div>
                        <div className="results-breakdown-value">~XX%</div>
                        <div className="results-breakdown-detail">Of your property on shorter depreciation</div>
                      </div>
                    </div>
                    <div className="results-breakdown-card">
                      <div className="results-breakdown-icon"><Clock size={18} /></div>
                      <div>
                        <div className="results-breakdown-label">Bonus Depreciation</div>
                        <div className="results-breakdown-value">XX%</div>
                        <div className="results-breakdown-detail">Current bonus depreciation rate</div>
                      </div>
                    </div>
                  </div>

                  {/* Fake property recap — blurred */}
                  <div className="results-recap-card">
                    <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>
                      Your Property Details
                    </div>
                    <div className="results-recap-grid">
                      <span className="results-recap-label">Address</span>
                      <span className="results-recap-value">XXXX XXXXX XX</span>
                      <span className="results-recap-label">Details</span>
                      <span className="results-recap-value">Xbd Xba X,XXX sqft</span>
                      <span className="results-recap-label">Year Built</span>
                      <span className="results-recap-value">XXXX</span>
                      <span className="results-recap-label">Depreciable Basis</span>
                      <span className="results-recap-value">$XXX,XXX</span>
                      <span className="results-recap-label">Land/Building Split</span>
                      <span className="results-recap-value">$XX,XXX / $XXX,XXX</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ═══ ACCOUNT GATE — the conversion point ═══ */}
              <div className="results-gate-card" ref={gateRef}>
                <div className="results-gate-hook">
                  <h3 className="results-gate-title">
                    {hasAirbnb
                      ? `See exactly what's driving your $${estimate.firstYearDeduction.toLocaleString()} estimate`
                      : "Unlock your full component-level breakdown"}
                  </h3>
                  <p className="results-gate-subtitle">
                    {hasAirbnb
                      ? `We found your listing. Now see how your specific amenities — pool, appliances, outdoor areas — break down into exact depreciation schedules.`
                      : "Kitchen, bathrooms, outdoor areas, appliances — with exact asset allocations and bonus depreciation. Free, no credit card needed."}
                  </p>
                </div>

                {/* Primary CTA — Google */}
                <button
                  className="btn btn-google btn-lg"
                  style={{ width: "100%", marginBottom: "var(--space-2)" }}
                  onClick={() => {
                    if (window.google?.accounts?.id) {
                      window.google.accounts.id.prompt();
                    }
                  }}
                  disabled={authLoading}
                >
                  <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                  </svg>
                  {authLoading ? "Signing in…" : "Continue with Google"}
                </button>

                {/* Hidden GIS renderer — Google initializes the real button here */}
                <div ref={googleBtnRef} style={{ display: "none" }} />

                {authError && (
                  <div style={{ textAlign: "center", padding: "var(--space-1)", color: "#d93025", fontSize: "13px" }}>
                    {authError}
                  </div>
                )}

                {/* Divider */}
                <div className="results-gate-divider">
                  <span>or use email</span>
                </div>

                {/* Email-only form — minimal friction */}
                <form onSubmit={handleEmailSubmit} className="results-gate-form">
                  <input
                    type="email"
                    className="input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }}>
                    Get My Full Breakdown
                    <ArrowRight size={18} />
                  </button>
                </form>

                {/* Trust strip */}
                <div className="results-gate-trust" style={{ marginTop: "var(--space-3)" }}>
                  {[
                    { icon: <ShieldCheck size={13} />, text: "No credit card" },
                    { icon: <Clock size={13} />, text: "10 seconds" },
                    { icon: <CheckCircle size={13} />, text: "90-day guarantee" },
                  ].map(({ icon, text }) => (
                    <span key={text} className="results-gate-badge">
                      {icon} {text}
                    </span>
                  ))}
                </div>

                <p className="results-gate-legal">
                  By continuing, you agree to our{" "}
                  <Link href="/privacy" style={{ color: "var(--turq)", textDecoration: "underline" }}>
                    Privacy Policy
                  </Link>.
                </p>
              </div>
            </>
          ) : (
            <>
              {/* ═══ PHASE 3 — UNLOCKED CONTENT ═══ */}

              {/* Signed-in confirmation */}
              {authUser && (
                <div className="results-auth-confirmed">
                  {authUser.picture && (
                    <img
                      src={authUser.picture}
                      alt=""
                      className="results-auth-avatar"
                    />
                  )}
                  <div>
                    <div className="results-auth-name">
                      Welcome, {authUser.name?.split(" ")[0] || "there"}
                    </div>
                    <div className="results-auth-email">
                      Signed in as {authUser.email}
                    </div>
                  </div>
                </div>
              )}

              {/* Real breakdown cards */}
              <div className="results-breakdown">
                <BreakdownCard
                  icon={<DollarSign size={18} />}
                  label="Reclassified Assets"
                  value={`~${estimate.reclassPercent}%`}
                  detail="Of your property moved to shorter depreciation schedules"
                />
                <BreakdownCard
                  icon={<Clock size={18} />}
                  label="Bonus Depreciation"
                  value={`${estimate.bonusRate}%`}
                  detail={estimate.isCatchUp ? "Via IRS Form 3115 catch-up" : "Current bonus depreciation rate"}
                />
                <BreakdownCard
                  icon={<TrendingUp size={18} />}
                  label="Depreciable Basis"
                  value={`$${estimate.depreciableBasis.toLocaleString()}`}
                  detail={`Based on $${answers.purchasePrice.toLocaleString()} purchase price`}
                />
                <BreakdownCard
                  icon={<Zap size={18} />}
                  label="Year 1 Tax Savings"
                  value={`~$${estimate.firstYearSavings.toLocaleString()}`}
                  detail="Estimated at 32% marginal tax bracket"
                />
              </div>

              {/* Catch-up callout */}
              {estimate.isCatchUp && (
                <div className="pdc-callout pdc-callout-adobe">
                  <div className="pdc-callout-icon">&lrarr;</div>
                  <div>
                    <div className="pdc-callout-title">
                      Your catch-up window is open
                    </div>
                    <div className="pdc-callout-body">
                      Because your property was purchased before 2023, you can claim all
                      missed depreciation in a single year via IRS Form 3115. No amended
                      returns needed.
                    </div>
                  </div>
                </div>
              )}

              {/* Full property recap */}
              <div className="results-recap-card">
                <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>
                  Your Property
                </div>
                <div className="results-recap-grid">
                  <InfoRow
                    icon={<MapPin size={13} />}
                    label="Address"
                    value={answers.address || answers.city || answers.state || "\u2014"}
                  />
                  {hasAirbnb && (
                    <InfoRow
                      icon={<Star size={13} />}
                      label="Airbnb Listing"
                      value={airbnb.title}
                    />
                  )}
                  {hasPropertyData && (
                    <InfoRow
                      icon={<Home size={13} />}
                      label="Details"
                      value={[
                        answers.beds && `${answers.beds}bd`,
                        answers.baths && `${answers.baths}ba`,
                        answers.sqft && `${Number(answers.sqft).toLocaleString()} sqft`,
                        answers.lotSqft && `${Number(answers.lotSqft).toLocaleString()} sqft lot`,
                      ].filter(Boolean).join(" \u00b7 ")}
                    />
                  )}
                  {answers.yearBuilt && (
                    <InfoRow
                      icon={<Calendar size={13} />}
                      label="Built"
                      value={answers.yearBuilt}
                    />
                  )}
                  <InfoRow
                    icon={<DollarSign size={13} />}
                    label="Purchase Price"
                    value={`$${answers.purchasePrice.toLocaleString()}`}
                  />
                  {answers.lastSoldPrice && (
                    <InfoRow
                      icon={<TrendingUp size={13} />}
                      label="Last Sale"
                      value={`$${Number(answers.lastSoldPrice).toLocaleString()} (${answers.lastSoldDate || "\u2014"})`}
                    />
                  )}
                  <InfoRow
                    icon={<Clock size={13} />}
                    label="Purchase Year"
                    value={formatPurchaseYear(answers.purchaseYear)}
                  />
                  {answers.assessedLand > 0 && (
                    <InfoRow
                      icon={<Ruler size={13} />}
                      label="Assessed Split"
                      value={`Land $${answers.assessedLand.toLocaleString()} \u00b7 Building $${answers.assessedImprovement.toLocaleString()}`}
                    />
                  )}
                  {hasAirbnb && airbnb.rating > 0 && (
                    <InfoRow
                      icon={<Star size={13} />}
                      label="Airbnb"
                      value={`${airbnb.rating} \u2605 \u00b7 ${airbnb.reviewCount} reviews${airbnb.isSuperhost ? " \u00b7 Superhost" : ""}`}
                    />
                  )}
                </div>
              </div>

              {/* Primary CTA — Detailed walkthrough */}
              <div className="results-unlock-cta">
                <div className="results-unlock-cta-inner">
                  <h3 className="results-unlock-cta-title">
                    Ready to see your full component-level breakdown?
                  </h3>
                  <p className="results-unlock-cta-sub">
                    Walk through kitchen, bathrooms, outdoor areas, and more — with exact asset allocations and depreciation schedules.
                  </p>
                  <Link
                    href={detailsUrl}
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%" }}
                  >
                    See My Detailed Breakdown
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </>
          )}

          {/* Secondary CTAs */}
          <div className="results-ctas">
            <Link href="/sample-study" className="btn btn-outline results-cta-secondary">
              <Download size={16} />
              View a sample report
            </Link>
          </div>

          {/* Zero-friction reassurance strip */}
          <div className="results-trust-strip">
            {["No credit card required", "AI-powered \u2014 delivered in minutes", "IRS-compliant", "90-day guarantee"].map((label) => (
              <span key={label} className="results-trust-item">
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M3.5 7L6 9.5L10.5 4.5" stroke="var(--turq)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {label}
              </span>
            ))}
          </div>

          {/* Disclaimer */}
          <p className="results-disclaimer">
            This estimate is for informational purposes only and does not
            constitute tax, legal, or financial advice. Estimates are hypothetical
            projections based on the data you provided and generalized assumptions.
            Actual savings depend on your specific tax situation, current tax law,
            and accurate property data. No guarantee of savings is made or implied.
            Consult a qualified CPA or tax attorney before making tax decisions.
            See our{" "}
            <Link href="/disclaimers" style={{ color: "var(--turq)", textDecoration: "underline" }}>
              full disclaimers
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ icon, label, value, detail }) {
  return (
    <div className="results-breakdown-card">
      <div className="results-breakdown-icon">{icon}</div>
      <div>
        <div className="results-breakdown-label">{label}</div>
        <div className="results-breakdown-value">{value}</div>
        <div className="results-breakdown-detail">{detail}</div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <>
      <span className="results-recap-label">
        {icon && <span style={{ marginRight: 4, display: "inline-flex", verticalAlign: "middle" }}>{icon}</span>}
        {label}
      </span>
      <span className="results-recap-value">{value}</span>
    </>
  );
}

function parseCurrency(str) {
  return parseInt(str.replace(/\D/g, ""), 10) || 500000;
}

function formatPurchaseYear(val) {
  const map = {
    "2025-post": "2025 (post-Jan 19)",
    "2025-pre": "2025 (pre-Jan 20)",
    "2024": "2024",
    "2023": "2023",
    "2022-earlier": "2022 or earlier",
  };
  return map[val] || val;
}
