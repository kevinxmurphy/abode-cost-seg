"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Download,
  TrendingUp,
  DollarSign,
  Clock,
  FileText,
  Shield,
  Lock,
  Phone,
  Building2,
  ChevronRight,
  Star,
  Loader2,
  CheckCircle,
} from "lucide-react";
import PropertyDetailCards from "./PropertyDetailCards";
import AirbnbAmenityDetection from "./AirbnbAmenityDetection";
import { calculateTotalReclass } from "@/lib/propertyCategories";
import { mergeAirbnbDefaults } from "@/lib/airbnbParser";
import { useCountUp } from "@/lib/useCountUp";
import { saveProperty as savePropertyLocal } from "@/lib/propertyStore";

// Bonus depreciation rates
const BONUS_RATES = {
  "2025-post": 1.0,
  "2025-pre": 0.4,
  "2024": 0.6,
  "2023": 0.8,
  "2022-earlier": 1.0,
};

function parseCurrency(str) {
  return parseInt(String(str).replace(/\D/g, ""), 10) || 500000;
}

/** Returns study cost (flat rate) */
function getStudyCost(purchasePrice) {
  return 481;
}

export default function PropertyDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [phase, setPhase] = useState("profile"); // "profile" | "walkthrough" | "results"
  const [detailSelections, setDetailSelections] = useState({});
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveToast, setSaveToast] = useState(false);
  // Profile enrichment (skippable)
  const [profile, setProfile] = useState({
    taxBracket: "",
    propertyCount: "",
    phone: "",
  });

  // Parse Tier 1 data from URL params
  const tier1Data = {
    address: searchParams.get("address") || "",
    city: searchParams.get("city") || "",
    state: searchParams.get("state") || "",
    zip: searchParams.get("zip") || "",
    propertyType: searchParams.get("propertyType") || "Single Family",
    yearBuilt: parseInt(searchParams.get("yearBuilt") || "2010", 10),
    sqft: parseInt(searchParams.get("sqft") || "0", 10),
    beds: searchParams.get("beds") || "",
    baths: searchParams.get("baths") || "",
    purchasePrice: parseCurrency(searchParams.get("purchasePrice") || "500000"),
    purchaseYear: searchParams.get("purchaseYear") || "2024",
    assessedLand: parseInt(searchParams.get("assessedLand") || "0", 10),
    assessedImprovement: parseInt(searchParams.get("assessedImprovement") || "0", 10),
    // Tier 1 range from light quiz
    tier1Low: parseInt(searchParams.get("estLow") || "0", 10),
    tier1High: parseInt(searchParams.get("estHigh") || "0", 10),
  };

  // Lat/lon for Street View
  const lat = searchParams.get("lat") || "";
  const lon = searchParams.get("lon") || "";
  const streetViewUrl =
    lat && lon
      ? `/api/streetview?lat=${lat}&lon=${lon}`
      : tier1Data.address
        ? `/api/streetview?address=${encodeURIComponent(
            [tier1Data.address, tier1Data.city, tier1Data.state].filter(Boolean).join(", ")
          )}`
        : null;

  // Parse Airbnb enrichment data from URL params
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
  };
  const hasAirbnb = !!airbnb.title;

  // Parse the JSON-serialized category enrichment
  let airbnbEnrichment = null;
  let airbnbDescriptionHints = [];
  if (airbnb.enrichment) {
    try {
      airbnbEnrichment = JSON.parse(airbnb.enrichment);
    } catch (e) {
      // Silently fall back to heuristic defaults
    }
  }
  const airbnbDescriptionHintsRaw = searchParams.get("airbnbDescriptionHints") || "";
  if (airbnbDescriptionHintsRaw) {
    try {
      const parsed = JSON.parse(airbnbDescriptionHintsRaw);
      if (Array.isArray(parsed)) airbnbDescriptionHints = parsed;
    } catch (e) {
      // fall back to empty array
    }
  }

  // Parse Airbnb images from URL param (JSON array of {caption, imageUrl})
  let airbnbImages = [];
  const airbnbImagesRaw = searchParams.get("airbnbImages") || "";
  if (airbnbImagesRaw) {
    try {
      const parsed = JSON.parse(airbnbImagesRaw);
      if (Array.isArray(parsed)) {
        airbnbImages = parsed.filter(
          (img) => img && typeof img.imageUrl === "string" && img.imageUrl
        );
      }
    } catch (e) {
      // Silently ignore malformed image data
    }
  }

  const propertyData = {
    propertyType: tier1Data.propertyType,
    yearBuilt: tier1Data.yearBuilt,
    purchasePrice: tier1Data.purchasePrice,
    state: tier1Data.state,
  };

  const bonusRate = BONUS_RATES[tier1Data.purchaseYear] || 0.6;

  // Land ratio
  let landRatio = 0.17;
  if (tier1Data.assessedLand > 0 && tier1Data.assessedImprovement > 0) {
    const total = tier1Data.assessedLand + tier1Data.assessedImprovement;
    landRatio = tier1Data.assessedLand / total;
    landRatio = Math.max(0.05, Math.min(landRatio, 0.80));
  }

  const depreciableBasis = tier1Data.purchasePrice * (1 - landRatio);

  // Track detail card selections for final estimate
  const handleSelectionsChange = useCallback(
    (selections, confirmed) => {
      setDetailSelections(selections);
      setConfirmedCount(confirmed.size);
    },
    []
  );

  // Full detailed estimate calculation
  function calculateDetailedEstimate() {
    const reclassFromCards = calculateTotalReclass(
      detailSelections,
      tier1Data.purchasePrice
    );

    // The quiz range (tier1Low/tier1High) is set from the light quiz engine.
    // calculateTotalReclass can underestimate when few categories are confirmed
    // because it builds up from zero-scored items. Use the quiz midpoint as an
    // anchor: blend from quiz midpoint → cards-based calc as user confirms more.
    const quizMidpoint = tier1Data.tier1Low > 0
      ? (tier1Data.tier1Low + (tier1Data.tier1High || tier1Data.tier1Low)) / 2 / (bonusRate + 0.08) // reverse bonus to get reclass amt
      : 0;

    // Weight: fully quiz-anchored at 0 confirmed, fully cards-based at 6+ confirmed
    const TOTAL_CATS = 8;
    const blendWeight = Math.min(confirmedCount / TOTAL_CATS, 1); // 0→1
    const totalAccelerated = quizMidpoint > 0
      ? Math.round(quizMidpoint * (1 - blendWeight) + reclassFromCards * blendWeight)
      : Math.round(reclassFromCards);

    const bonusDeduction = totalAccelerated * bonusRate;
    const regularFirst = totalAccelerated * 0.08;
    const firstYearDeduction = regularFirst + bonusDeduction;

    // Asset life breakdown (approximate allocation)
    const fiveYear = Math.round(totalAccelerated * 0.55);
    const sevenYear = Math.round(totalAccelerated * 0.15);
    const fifteenYear = Math.round(totalAccelerated * 0.20);
    const remaining = depreciableBasis - totalAccelerated;
    const twentySevenYear = Math.round(remaining);

    const reclassPercent = depreciableBasis > 0
      ? Math.round((totalAccelerated / depreciableBasis) * 100)
      : 18;

    // Tax savings if bracket was provided in profile enrichment
    const taxBracket = profile.taxBracket ? parseInt(profile.taxBracket) / 100 : null;
    const estimatedSavings = taxBracket ? Math.round(firstYearDeduction * taxBracket) : null;

    return {
      firstYearDeduction: Math.round(firstYearDeduction),
      totalAccelerated: Math.round(totalAccelerated),
      depreciableBasis: Math.round(depreciableBasis),
      reclassPercent,
      bonusRate: Math.round(bonusRate * 100),
      isCatchUp: tier1Data.purchaseYear === "2022-earlier",
      fiveYear,
      sevenYear,
      fifteenYear,
      twentySevenYear,
      taxBracket: taxBracket ? Math.round(taxBracket * 100) : null,
      estimatedSavings,
      confirmedCount,
      isRefined: confirmedCount >= TOTAL_CATS,
    };
  }

  // ─── Build wizard params object (used for both sessionStorage + cancel URL) ──
  function buildWizardParams() {
    const params = {
      address: tier1Data.address,
      city: tier1Data.city,
      state: tier1Data.state,
      zip: tier1Data.zip,
      propertyType: tier1Data.propertyType,
      yearBuilt: String(tier1Data.yearBuilt),
      sqft: String(tier1Data.sqft),
      beds: tier1Data.beds,
      baths: tier1Data.baths,
      purchasePrice: String(tier1Data.purchasePrice),
      purchaseYear: tier1Data.purchaseYear,
      assessedLand: String(tier1Data.assessedLand),
      assessedImprovement: String(tier1Data.assessedImprovement),
    };
    if (lat) params.lat = lat;
    if (lon) params.lon = lon;
    if (airbnb.title) params.airbnbTitle = airbnb.title;
    if (airbnb.airbnbId) params.airbnbId = airbnb.airbnbId;
    if (airbnb.enrichment) params.airbnbEnrichment = airbnb.enrichment;
    const imagesRaw = searchParams.get("airbnbImages") || "";
    if (imagesRaw) params.airbnbImages = imagesRaw;
    if (tier1Data.tier1Low) params.estLow = String(tier1Data.tier1Low);
    if (tier1Data.tier1High) params.estHigh = String(tier1Data.tier1High);
    if (detailSelections && Object.keys(detailSelections).length > 0) {
      params.detailSelections = JSON.stringify(detailSelections);
    }
    return params;
  }

  // ─── Handle "Complete My Study" — save params + redirect to Stripe ────────
  async function handleCompleteMyStudy() {
    setCheckoutLoading(true);
    try {
      // Save wizard params to sessionStorage so the success page can resume
      const wizardParams = buildWizardParams();
      try {
        sessionStorage.setItem("abode_wizard_params", JSON.stringify(wizardParams));
      } catch {}

      const origin = window.location.origin;
      const cancelUrl = `${window.location.href}`; // Return to this exact page on cancel

      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyAddress: tier1Data.address,
          cancelUrl,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout. Please try again.");
        setCheckoutLoading(false);
      }
    } catch (err) {
      console.error("[PropertyDetailsContent] Checkout error:", err);
      alert("Something went wrong. Please try again.");
      setCheckoutLoading(false);
    }
  }

  // ─── Handle "Save for later" — persist to DB + redirect ──────────────────
  async function handleSaveForLater() {
    setSaveLoading(true);
    try {
      // Save to DB
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property: {
            address: tier1Data.address,
            city: tier1Data.city,
            state: tier1Data.state,
            zip: tier1Data.zip,
            propertyType: tier1Data.propertyType,
            yearBuilt: String(tier1Data.yearBuilt),
            sqft: String(tier1Data.sqft),
            beds: tier1Data.beds,
            baths: tier1Data.baths,
            purchasePrice: tier1Data.purchasePrice,
            purchaseYear: tier1Data.purchaseYear,
            assessedLand: tier1Data.assessedLand,
            assessedImprovement: tier1Data.assessedImprovement,
            lat,
            lon,
            airbnbId: airbnb.airbnbId || null,
            airbnbTitle: airbnb.title || null,
            airbnbData: hasAirbnb ? airbnb : null,
            step: "details",
            studyStatus: "estimate",
          },
          estimate: (() => {
            const est = calculateDetailedEstimate();
            return {
              first_year_deduction: est.firstYearDeduction,
              first_year_savings: est.estimatedSavings || Math.round(est.firstYearDeduction * 0.32),
              conservative: Math.round(est.firstYearDeduction * 0.75),
              likely: est.firstYearDeduction,
              optimistic: Math.round(est.firstYearDeduction * 1.3),
              standard_annual_deduction: Math.round(depreciableBasis / 27.5),
              year_one_multiplier: depreciableBasis > 0
                ? Math.round((est.firstYearDeduction / (depreciableBasis / 27.5)) * 10) / 10
                : 0,
              depreciable_basis: Math.round(depreciableBasis),
              purchase_price: tier1Data.purchasePrice,
              land_ratio: Math.round(landRatio * 100),
              reclass_percent: est.reclassPercent,
              bonus_rate: Math.round(bonusRate * 100),
              bracket: profile.taxBracket ? parseInt(profile.taxBracket) : 32,
              is_catch_up: tier1Data.purchaseYear === "2022-earlier",
            };
          })(),
        }),
      });
    } catch (e) {
      console.warn("[PropertyDetailsContent] Failed to save property:", e.message);
    }
    // Also save to localStorage as backup
    try {
      const userRes = await fetch("/api/auth/session");
      const userData = await userRes.json();
      if (userData?.authenticated && userData?.user?.email) {
        savePropertyLocal(userData.user.email, {
          answers: tier1Data,
          airbnb: hasAirbnb ? airbnb : null,
          estimate: calculateDetailedEstimate(),
          step: "details",
        });
      }
    } catch {}
    setSaveLoading(false);
    setSaveToast(true);
    setTimeout(() => router.push("/app/properties"), 1200);
  }

  function handleShowResults() {
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Always call hooks unconditionally (React rules of hooks)
  const estimate = phase === "results" ? calculateDetailedEstimate() : { firstYearDeduction: 0 };
  const deductionDisplay = useCountUp(estimate.firstYearDeduction, 1200, phase === "results");

  // ─── Save toast ───
  const saveToastEl = saveToast ? (
    <div style={{
      position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
      background: "var(--ink)", color: "#fff", padding: "12px 24px", borderRadius: "var(--radius-lg)",
      fontSize: 14, fontWeight: 500, zIndex: 1000, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <CheckCircle size={16} style={{ color: "var(--turq)" }} />
      Property saved! Pick it up anytime from your account.
    </div>
  ) : null;

  // ─── Profile Enrichment Phase (skippable) ───
  if (phase === "profile") {
    return (
      <div className="quiz-shell">
        <div className="quiz-header">
          <Link href="/" className="quiz-logo">abode</Link>
          <div />
          <button
            className="btn btn-subtle btn-sm"
            onClick={() => window.history.back()}
            type="button"
          >
            Back to estimate
          </button>
        </div>

        <div
          className="quiz-body"
          style={{ alignItems: "flex-start", paddingTop: "var(--space-6)" }}
        >
          <div style={{ maxWidth: 480, width: "100%", margin: "0 auto" }}>
            <div className="pdc-intro">
              <h1 className="h2-component">
                A few quick questions
              </h1>
              <p className="pdc-intro-sub">
                Optional — helps us give you a more accurate estimate and better experience.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {/* Tax bracket */}
              <div className="pdc-profile-field">
                <label className="pdc-profile-label">
                  <DollarSign size={16} />
                  Approximate tax bracket
                </label>
                <div className="pdc-profile-pills">
                  {["22", "24", "32", "35", "37"].map((b) => (
                    <button
                      key={b}
                      type="button"
                      className={`pdc-select-btn ${profile.taxBracket === b ? "selected" : ""}`}
                      onClick={() => setProfile((p) => ({ ...p, taxBracket: b }))}
                    >
                      {b}%
                      {b === "32" && <span className="pdc-recommended-badge">Most common</span>}
                    </button>
                  ))}
                </div>
                <span className="pdc-profile-hint">
                  Most STR investors earning $300K–$600K fall in the 32% bracket
                </span>
              </div>

              {/* Number of properties */}
              <div className="pdc-profile-field">
                <label className="pdc-profile-label">
                  <Building2 size={16} />
                  How many investment properties do you own?
                </label>
                <div className="pdc-profile-pills">
                  {[
                    { label: "Just this one", value: "1" },
                    { label: "2–3", value: "2-3" },
                    { label: "4–10", value: "4-10" },
                    { label: "10+", value: "10+" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`pdc-select-btn ${profile.propertyCount === opt.value ? "selected" : ""}`}
                      onClick={() => setProfile((p) => ({ ...p, propertyCount: opt.value }))}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Phone number */}
              <div className="pdc-profile-field">
                <label className="pdc-profile-label">
                  <Phone size={16} />
                  Phone number
                  <span style={{ fontWeight: 400, color: "var(--dust)", marginLeft: 4 }}>(optional)</span>
                </label>
                <input
                  type="tel"
                  className="input"
                  placeholder="(555) 123-4567"
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  style={{ maxWidth: 280 }}
                />
                <label className="pdc-profile-sms-consent" style={{ marginTop: 6, display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12, color: "var(--dust)", lineHeight: 1.5 }}>
                  <input
                    type="checkbox"
                    checked={profile.smsConsent || false}
                    onChange={(e) => setProfile((p) => ({ ...p, smsConsent: e.target.checked }))}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  <span>By providing your number, you consent to receive SMS updates about your estimate. Msg &amp; data rates may apply. Reply STOP to opt out.</span>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setPhase("walkthrough")}
                style={{ width: "100%" }}
              >
                Continue to Property Details
                <ArrowRight size={18} />
              </button>
              <button
                className="btn btn-subtle"
                onClick={() => setPhase("walkthrough")}
                style={{ alignSelf: "center" }}
              >
                Skip for now
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Walkthrough Phase ───
  if (phase === "walkthrough") {
    return (
      <div className="quiz-shell">
        {/* Header */}
        <div className="quiz-header">
          <Link href="/" className="quiz-logo">abode</Link>
          <div className="pdc-phase-label">
            <FileText size={14} />
            <span>Detailed Property Review</span>
          </div>
          <button
            className="btn btn-subtle btn-sm"
            onClick={() => window.history.back()}
            type="button"
          >
            Back to estimate
          </button>
        </div>

        <div
          className="quiz-body"
          style={{ alignItems: "flex-start", paddingTop: "var(--space-4)" }}
        >
          <div style={{ maxWidth: 680, width: "100%", margin: "0 auto" }}>
            {/* Intro */}
            <div className="pdc-intro">
              <h1 className="h2-component">
                Tell us about your property
              </h1>
              <p className="pdc-intro-sub">
                {hasAirbnb
                  ? <>We&apos;ve pre-filled details from your Airbnb listing. Review each category and adjust anything that doesn&apos;t match.</>
                  : <>We&apos;ve pre-filled details based on your{" "}
                    {tier1Data.city
                      ? `${tier1Data.city} ${tier1Data.propertyType.toLowerCase()}`
                      : "property"}
                    . Review each category and adjust anything that doesn&apos;t
                    match — this gives you a much more accurate estimate.</>
                }
              </p>

              {/* Airbnb property card or plain address badge */}
              {hasAirbnb ? (
                <div className="pdc-airbnb-header">
                  {airbnb.thumbnail && (
                    <img
                      src={airbnb.thumbnail}
                      alt={airbnb.title}
                      className="pdc-airbnb-thumb"
                    />
                  )}
                  <div className="pdc-airbnb-header-info">
                    <div className="pdc-airbnb-header-title">{airbnb.title}</div>
                    <div className="pdc-airbnb-header-meta">
                      {airbnb.rating > 0 && (
                        <span className="pdc-airbnb-header-rating">
                          <Star size={12} fill="var(--adobe)" stroke="var(--adobe)" />
                          {airbnb.rating.toFixed(2)}
                        </span>
                      )}
                      {airbnb.reviewCount > 0 && (
                        <span className="pdc-airbnb-header-reviews">
                          {airbnb.reviewCount} reviews
                        </span>
                      )}
                      {airbnb.isSuperhost && (
                        <span className="pdc-airbnb-superhost-badge">Superhost</span>
                      )}
                    </div>
                    <div className="pdc-airbnb-header-specs">
                      {airbnb.bedrooms > 0 && `${airbnb.bedrooms}bd`}
                      {airbnb.bedrooms > 0 && airbnb.baths > 0 && " / "}
                      {airbnb.baths > 0 && `${airbnb.baths}ba`}
                      {airbnb.guests > 0 && ` / ${airbnb.guests} guests`}
                    </div>
                  </div>
                </div>
              ) : tier1Data.address ? (
                <div className="pdc-property-badge">
                  {tier1Data.address}
                  {tier1Data.city && !tier1Data.address.includes(tier1Data.city) && `, ${tier1Data.city}`}
                  {tier1Data.state && !tier1Data.address.includes(`, ${tier1Data.state}`) && `, ${tier1Data.state}`}
                  {(tier1Data.beds || tier1Data.baths || tier1Data.sqft > 0) && (
                    <span className="pdc-property-badge-detail">
                      {tier1Data.beds && `${tier1Data.beds}bd`}
                      {tier1Data.beds && tier1Data.baths && " / "}
                      {tier1Data.baths && `${tier1Data.baths}ba`}
                      {tier1Data.sqft > 0 && ` / ${tier1Data.sqft.toLocaleString()} sqft`}
                    </span>
                  )}
                </div>
              ) : null}
            </div>

            {/* Airbnb amenity detection — shows room photos with detected amenities */}
            {hasAirbnb && airbnbImages.length > 0 && (
              <AirbnbAmenityDetection
                airbnbEnrichment={airbnbEnrichment}
                airbnbImages={airbnbImages}
              />
            )}

            {/* Detail cards */}
            <PropertyDetailCards
              propertyData={propertyData}
              purchasePrice={tier1Data.purchasePrice}
              onSelectionsChange={handleSelectionsChange}
              airbnbEnrichment={airbnbEnrichment}
              airbnbDescriptionHints={airbnbDescriptionHints}
              airbnbImages={airbnbImages}
            />

            {/* Bottom CTA */}
            <div className="pdc-bottom-cta">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleShowResults}
                style={{ width: "100%" }}
              >
                See My Detailed Estimate
                <ArrowRight size={18} />
              </button>
              <p className="pdc-bottom-hint">
                You&apos;ve reviewed {confirmedCount} of 8 categories —{" "}
                {confirmedCount >= 6
                  ? "great detail!"
                  : confirmedCount >= 3
                    ? "keep going for better accuracy"
                    : "the more you review, the more accurate your estimate"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Detailed Results Phase ───
  return (
    <div className="quiz-shell quiz-results-shell">
      {saveToastEl}
      {/* Header */}
      <div className="quiz-header">
        <Link href="/" className="quiz-logo">abode</Link>
        <div />
        <button
          className="btn btn-subtle btn-sm"
          onClick={() => setPhase("walkthrough")}
        >
          <ArrowLeft size={14} />
          Edit details
        </button>
      </div>

      <div
        className="quiz-body"
        style={{ alignItems: "flex-start", paddingTop: "var(--space-6)" }}
      >
        <div style={{ maxWidth: 680, width: "100%", margin: "0 auto" }}>
          {/* Street View */}
          {streetViewUrl && (
            <div className="results-streetview" style={{ marginBottom: "var(--space-3)" }}>
              <img
                src={streetViewUrl}
                alt={`Street view of ${tier1Data.address || "property"}`}
                className="results-streetview-img"
                onError={(e) => { e.target.parentElement.style.display = "none"; }}
              />
            </div>
          )}

          {/* Header */}
          <div className="results-header">
            <div className="results-eyebrow">Your Detailed Property Analysis</div>
            <p className="results-tagline">
              Based on {confirmedCount} reviewed categories for your{" "}
              {hasAirbnb
                ? airbnb.title
                : `${tier1Data.city || tier1Data.state || ""} ${tier1Data.propertyType?.toLowerCase() || "property"}`
              }
            </p>
          </div>

          {/* Airbnb property card in results */}
          {hasAirbnb && (
            <div className="pdc-airbnb-header" style={{ marginBottom: "var(--space-3)" }}>
              {airbnb.thumbnail && (
                <img
                  src={airbnb.thumbnail}
                  alt={airbnb.title}
                  className="pdc-airbnb-thumb"
                />
              )}
              <div className="pdc-airbnb-header-info">
                <div className="pdc-airbnb-header-title">{airbnb.title}</div>
                <div className="pdc-airbnb-header-meta">
                  {airbnb.rating > 0 && (
                    <span className="pdc-airbnb-header-rating">
                      <Star size={12} fill="var(--adobe)" stroke="var(--adobe)" />
                      {airbnb.rating.toFixed(2)}
                    </span>
                  )}
                  {airbnb.reviewCount > 0 && (
                    <span className="pdc-airbnb-header-reviews">
                      {airbnb.reviewCount} reviews
                    </span>
                  )}
                  {airbnb.isSuperhost && (
                    <span className="pdc-airbnb-superhost-badge">Superhost</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Big deduction number */}
          <div className="results-main-card revealed">
            <div className="results-main-amount">
              <span className="results-dollar">$</span>
              <span className="results-number">
                {(deductionDisplay || estimate.firstYearDeduction).toLocaleString()}
              </span>
            </div>
            <div className="results-main-label">
              Estimated first-year depreciation deduction
              {!estimate.isRefined && estimate.confirmedCount < 8 && (
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    background: "var(--turq-bg)",
                    color: "var(--turq-mid)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    verticalAlign: "middle",
                  }}
                >
                  Refining ({estimate.confirmedCount}/8 confirmed)
                </span>
              )}
            </div>
            <div className="results-baseline-inline">
              <div className="results-baseline-inline-item results-baseline-inline-without">
                <span className="results-baseline-inline-label">Without cost seg</span>
                <span className="results-baseline-inline-value">${Math.round(depreciableBasis / 27.5).toLocaleString()}/yr</span>
              </div>
              <div className="results-baseline-inline-arrow">&rarr;</div>
              <div className="results-baseline-inline-item results-baseline-inline-with">
                <span className="results-baseline-inline-label">With cost seg (Year 1)</span>
                <span className="results-baseline-inline-value">${estimate.firstYearDeduction.toLocaleString()}</span>
              </div>
            </div>
            {estimate.estimatedSavings && (
              <div
                style={{
                  textAlign: "center",
                  marginTop: "var(--space-2)",
                  padding: "8px 16px",
                  background: "var(--turq-bg)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 13,
                  color: "var(--turq-mid)",
                  fontWeight: 500,
                }}
              >
                At your {estimate.taxBracket}% bracket, that&apos;s ~${estimate.estimatedSavings.toLocaleString()} in tax savings
                <br />
                That&apos;s ${Math.round(estimate.firstYearDeduction - (depreciableBasis / 27.5)).toLocaleString()} more than standard depreciation
              </div>
            )}
          </div>

          {/* Component breakdown — the Tier 2 differentiator */}
          <div className="pdc-component-breakdown">
            <h3 className="h3-component" style={{ marginBottom: "var(--space-2)" }}>
              Asset Recovery Schedule
            </h3>
            <p
              style={{
                fontSize: 13,
                color: "var(--dust)",
                marginBottom: "var(--space-3)",
              }}
            >
              How your property&apos;s depreciable basis is allocated across IRS recovery periods
            </p>

            <div className="pdc-schedule-grid">
              <ScheduleRow
                life="5-Year"
                label="Personal property (fixtures, appliances, flooring, tech)"
                amount={estimate.fiveYear}
                total={estimate.depreciableBasis}
                color="var(--turq)"
              />
              <ScheduleRow
                life="7-Year"
                label="Furniture, equipment, specialty items"
                amount={estimate.sevenYear}
                total={estimate.depreciableBasis}
                color="var(--turq-mid)"
              />
              <ScheduleRow
                life="15-Year"
                label="Land improvements (pool, deck, landscaping, fencing)"
                amount={estimate.fifteenYear}
                total={estimate.depreciableBasis}
                color="var(--adobe)"
              />
              <ScheduleRow
                life="27.5-Year"
                label="Remaining building structure"
                amount={estimate.twentySevenYear}
                total={estimate.depreciableBasis}
                color="var(--dust)"
              />
            </div>
          </div>

          {/* Breakdown cards */}
          <div className="results-breakdown">
            <BreakdownCard
              icon={<DollarSign size={18} />}
              label="Reclassified Assets"
              value={`${estimate.reclassPercent}%`}
              detail="Of depreciable basis moved to shorter lives"
            />
            <BreakdownCard
              icon={<Clock size={18} />}
              label="Bonus Depreciation"
              value={`${estimate.bonusRate}%`}
              detail={
                estimate.isCatchUp
                  ? "Via IRS Form 3115 catch-up"
                  : "Current bonus depreciation rate"
              }
            />
            <BreakdownCard
              icon={<FileText size={18} />}
              label="Study Type"
              value={estimate.isCatchUp ? "Catch-Up" : "Standard"}
              detail={
                estimate.isCatchUp
                  ? "Recapture missed deductions in one year"
                  : "Applied at time of acquisition"
              }
            />
            <BreakdownCard
              icon={<TrendingUp size={18} />}
              label="Accelerated Basis"
              value={`$${estimate.totalAccelerated.toLocaleString()}`}
              detail="Total moved from 27.5-yr to shorter recovery"
            />
          </div>

          {/* Catch-up callout */}
          {estimate.isCatchUp && (
            <div className="pdc-callout pdc-callout-adobe">
              <div className="pdc-callout-icon">↩</div>
              <div>
                <div className="pdc-callout-title">
                  Your catch-up window is open
                </div>
                <div className="pdc-callout-body">
                  Because your property was purchased before 2023, you can claim
                  all missed depreciation in a single year via IRS Form 3115. No
                  amended returns needed.
                </div>
              </div>
            </div>
          )}

          {/* Purchase CTA */}
          <div className="pdc-purchase-section">
            <h3
              className="h3-component"
              style={{
                textAlign: "center",
                marginBottom: "var(--space-1)",
              }}
            >
              Get your full CPA-ready report
            </h3>
            <p
              style={{
                fontSize: 14,
                color: "var(--dust)",
                textAlign: "center",
                marginBottom: "var(--space-3)",
              }}
            >
              Your AI-powered cost segregation study, ready in minutes — not days.
            </p>

            {/* What you get */}
            <div className="pdc-what-you-get" style={{
              background: "var(--sand-light, #faf8f4)",
              border: "1px solid var(--sand-dark, #e8e2d8)",
              borderRadius: "var(--radius)",
              padding: "var(--space-3)",
              marginBottom: "var(--space-3)",
            }}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: "var(--space-2)", color: "var(--ink)" }}>
                What&apos;s included in your study
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { icon: <FileText size={14} />, text: "IRS-compliant cost segregation study (15–30 pages) — CPA and tax software ready" },
                  { icon: <Download size={14} />, text: "Detailed depreciation schedule spreadsheet — import directly into ProConnect, UltraTax, or Lacerte" },
                  { icon: <FileText size={14} />, text: "IRS Form 3115 (if applicable) — catch-up depreciation package for prior-year properties" },
                  { icon: <Clock size={14} />, text: "Delivered in minutes — not weeks. 5 minutes of your time, done." },
                ].map(({ icon, text }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "var(--ink-mid)" }}>
                    <span style={{ color: "var(--turq)", flexShrink: 0, marginTop: 1 }}>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-lg results-cta-main"
              onClick={handleCompleteMyStudy}
              disabled={checkoutLoading}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              {checkoutLoading ? (
                <><Loader2 size={18} className="spin" /> Redirecting to checkout...</>
              ) : (
                <>Complete My Study <ArrowRight size={18} /></>
              )}
            </button>
            <button
              className="btn btn-subtle"
              style={{ width: "100%", marginTop: "var(--space-2)", justifyContent: "center" }}
              onClick={handleSaveForLater}
              disabled={saveLoading}
              type="button"
            >
              {saveLoading ? "Saving..." : "Save for later"}
            </button>

            {/* ROI callout */}
            {(() => {
              const deduction = estimate.firstYearDeduction;
              const studyCost = getStudyCost(tier1Data.purchasePrice);
              const roiMultiple = deduction > 0 ? (deduction / studyCost).toFixed(0) : 0;
              return deduction > 0 ? (
                <div className="pdc-roi-callout">
                  <div className="pdc-roi-row">
                    <span>Your estimated Year 1 deduction</span>
                    <strong>${deduction.toLocaleString()}</strong>
                  </div>
                  <div className="pdc-roi-row">
                    <span>Study cost</span>
                    <strong>${studyCost.toLocaleString()}</strong>
                  </div>
                  <div className="pdc-roi-result">
                    That&apos;s a {roiMultiple}x return on your study investment
                  </div>
                </div>
              ) : null;
            })()}

            {/* Trust signals */}
            <div className="pdc-trust-strip">
              <TrustSignal
                icon={<Shield size={14} />}
                text="90-day money-back guarantee"
              />
              <TrustSignal
                icon={<Clock size={14} />}
                text="Delivered in minutes, not weeks"
              />
              <TrustSignal
                icon={<FileText size={14} />}
                text="IRS-compliant & CPA-ready"
              />
              <TrustSignal
                icon={<FileText size={14} />}
                text="Includes Form 3115 (if applicable)"
              />
            </div>

            <Link
              href="/sample-study"
              className="btn btn-outline results-cta-secondary"
            >
              <Download size={16} />
              View a sample report
            </Link>
          </div>

          {/* Disclaimer */}
          <p className="results-disclaimer">
            This estimate is for informational purposes only and does not
            constitute tax, legal, or financial advice. Estimates are
            hypothetical projections based on the data you provided and
            generalized assumptions. Actual savings depend on your specific tax
            situation, current tax law, and accurate property data. No guarantee
            of savings is made or implied. Consult a qualified CPA or tax
            attorney before making tax decisions. See our{" "}
            <Link
              href="/disclaimers"
              style={{ color: "var(--turq)", textDecoration: "underline" }}
            >
              full disclaimers
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

function RangeTier({ label, value, highlight }) {
  return (
    <div className={`results-range-tier ${highlight ? "highlight" : ""}`}>
      <div className="results-range-label">{label}</div>
      <div className="results-range-value">${value.toLocaleString()}</div>
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

function ScheduleRow({ life, label, amount, total, color }) {
  const percent = total > 0 ? Math.round((amount / total) * 100) : 0;
  return (
    <div className="pdc-schedule-row">
      <div className="pdc-schedule-life" style={{ color }}>
        {life}
      </div>
      <div className="pdc-schedule-info">
        <div className="pdc-schedule-bar-track">
          <div
            className="pdc-schedule-bar-fill"
            style={{ width: `${Math.max(percent, 2)}%`, background: color }}
          />
        </div>
        <div className="pdc-schedule-label">{label}</div>
      </div>
      <div className="pdc-schedule-amount">
        ${amount.toLocaleString()}
        <span className="pdc-schedule-pct">{percent}%</span>
      </div>
    </div>
  );
}

function TrustSignal({ icon, text }) {
  return (
    <div className="pdc-trust-signal">
      {icon}
      <span>{text}</span>
    </div>
  );
}
