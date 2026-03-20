"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, ArrowLeft, CornerDownLeft } from "lucide-react";
import { QUIZ_STEPS, DISQUALIFY_MESSAGE } from "@/lib/quizData";
import { AbodeLogo } from "@/components/ui/NavBar";
import { trackQuizStarted, trackQuizCompleted } from "@/lib/analytics";
import QuizStep from "./QuizStep";
import RunningEstimate from "./RunningEstimate";

// Map lastSoldDate to a purchaseYear option value
function derivePurchaseYear(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr + "T00:00:00");
  if (isNaN(d.getTime())) return null;
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed
  const day = d.getDate();
  if (year > 2025) return "2025-post";
  if (year === 2025 && (month > 0 || day >= 20)) return "2025-post";
  if (year === 2025) return "2025-pre";
  if (year === 2024) return "2024";
  if (year === 2023) return "2023";
  return "2022-earlier";
}

export default function QuizShell({ initialAnswers = {}, initialAirbnbJob = null }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [direction, setDirection] = useState("forward");
  const [disqualified, setDisqualified] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Track quiz start on mount
  useEffect(() => { trackQuizStarted(); }, []);

  // Background Airbnb job — owned here so it persists across steps.
  // Restored from saved property when available (status "done" prevents re-fetch).
  const [airbnbJob, setAirbnbJob] = useState(
    initialAirbnbJob || { runId: null, status: "idle", listing: null }
  );

  // Build the active steps list by filtering out conditional steps
  const isAirbnbUser = answers.propertyUse === "str" || answers.propertyUse === "mtr";
  const activeSteps = QUIZ_STEPS.filter((s) => {
    if (s.id === "airbnbUrl" || s.id === "airbnbVerify") return isAirbnbUser;
    return true;
  });

  const totalSteps = activeSteps.length;
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const step = activeSteps[currentStep];

  // Both address steps share answers.propertyAddress
  const isAddressStep = step.id === "propertyAddressEntry" || step.id === "propertyAddressConfirm";
  const currentAnswer = isAddressStep ? answers.propertyAddress : answers[step.id];

  const canProceed = (() => {
    if (step.type === "airbnb-url") return true;
    if (step.type === "airbnb-verify") return true;
    if (!currentAnswer) return false;
    if (step.type === "multi") return currentAnswer.length > 0;
    if (step.type === "currency-option") return !!currentAnswer.selected;
    // Address entry: just needs a selected address (not yet confirmed)
    if (step.type === "address" && step.phase === "entry") return !!(currentAnswer?.fullAddress);
    // Address confirm: needs confirmed === true
    if (step.type === "address" || step.type === "address-confirm") return currentAnswer?.confirmed === true;
    return true;
  })();

  // ─── Fire Airbnb job when URL is submitted ────────────────────────────────
  useEffect(() => {
    const url = answers.airbnbUrl?.url;
    if (!url || airbnbJob.status !== "idle") return;

    setAirbnbJob((j) => ({ ...j, status: "starting" }));

    fetch("/api/airbnb/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.cached && data.listing) {
          setAirbnbJob({ runId: null, status: "done", listing: data.listing });
        } else if (data.runId) {
          setAirbnbJob((j) => ({ ...j, runId: data.runId, status: "running" }));
        } else {
          setAirbnbJob((j) => ({ ...j, status: "failed" }));
        }
      })
      .catch(() => setAirbnbJob((j) => ({ ...j, status: "failed" })));
  }, [answers.airbnbUrl?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Poll in background when runId is set ────────────────────────────────
  useEffect(() => {
    if (!airbnbJob.runId || airbnbJob.status !== "running") return;

    const url = answers.airbnbUrl?.url || "";
    const roomId = airbnbJob.runId; // we'll use runId to track
    const pollUrl = `/api/airbnb/poll?runId=${encodeURIComponent(airbnbJob.runId)}&listingUrl=${encodeURIComponent(url)}`;

    let attempts = 0;
    const maxAttempts = 30;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await fetch(pollUrl);
        const data = await res.json();
        if (data.status === "done" && data.listing) {
          clearInterval(interval);
          setAirbnbJob({ runId: null, status: "done", listing: data.listing });
        } else if (data.status === "failed" || attempts >= maxAttempts) {
          clearInterval(interval);
          setAirbnbJob((j) => ({ ...j, runId: null, status: "failed" }));
        }
      } catch {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          setAirbnbJob((j) => ({ ...j, runId: null, status: "failed" }));
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [airbnbJob.runId, airbnbJob.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Accuracy meter — how many optional enrichment fields are filled
  const filledSteps = Object.keys(answers).length;
  const accuracyPercent = Math.min(Math.round((filledSteps / totalSteps) * 100), 100);

  function handleAnswer(value) {
    // Both address steps write to the shared "propertyAddress" key
    const answerKey = isAddressStep ? "propertyAddress" : step.id;

    // If address step has yearBuilt, auto-derive propertyAge + purchaseYear
    const isAddressUpdate = (step.id === "propertyAddressEntry" || step.id === "propertyAddressConfirm" || step.id === "propertyAddress");
    if (isAddressUpdate && value && value.propertyDetails?.yearBuilt) {
      const yb = value.propertyDetails.yearBuilt;
      let derivedAge;
      if (yb >= 2020) derivedAge = "2020s";
      else if (yb >= 2010) derivedAge = "2010s";
      else if (yb >= 2000) derivedAge = "2000s";
      else derivedAge = "pre-2000";

      const lastSoldDate = value.propertyDetails?.lastSoldDate;
      const detectedYear = derivePurchaseYear(lastSoldDate);
      setAnswers((prev) => ({
        ...prev,
        [answerKey]: value,
        propertyAge: derivedAge,
        ...(detectedYear && !prev.purchaseYear ? { purchaseYear: detectedYear, _purchaseYearAutoDetected: lastSoldDate } : {}),
      }));
    } else {
      setAnswers((prev) => ({ ...prev, [answerKey]: value }));
    }

    // Check for disqualification
    if (step.type === "option" && step.options) {
      const selectedOpt = step.options.find(
        (opt) => (typeof opt === "object" ? opt.value : opt) === value
      );
      if (selectedOpt && selectedOpt.disqualify) {
        setDisqualified(true);
        return;
      }
    }
  }

  // Auto-advance for single-select options (Typeform-style)
  function handleAutoAdvance(value) {
    handleAnswer(value);

    // Check disqualification before advancing
    if (step.type === "option" && step.options) {
      const selectedOpt = step.options.find(
        (opt) => (typeof opt === "object" ? opt.value : opt) === value
      );
      if (selectedOpt && selectedOpt.disqualify) {
        return;
      }
    }

    // Small delay for visual feedback before auto-advancing
    setTimeout(() => {
      // Rebuild activeSteps with the new answer to account for conditional changes
      const updatedAnswers = { ...answers, [step.id]: value };
      const updatedIsAirbnbUser = updatedAnswers.propertyUse === "str" || updatedAnswers.propertyUse === "mtr";
      const updatedActiveSteps = QUIZ_STEPS.filter((s) => {
        if (s.id === "airbnbUrl" || s.id === "airbnbVerify") return updatedIsAirbnbUser;
        return true;
      });

      // Find our current position in the updated steps list
      const currentIdx = updatedActiveSteps.findIndex((s) => s.id === step.id);
      if (currentIdx < updatedActiveSteps.length - 1) {
        setDirection("forward");
        setCurrentStep(currentIdx + 1);
        setShowTooltip(false);
      } else {
        navigateToResults(updatedAnswers);
      }
    }, 350);
  }

  const navigateToResults = useCallback(
    (finalAnswers, finalAirbnbJob) => {
      const params = new URLSearchParams();
      const all = finalAnswers || answers;
      const jobState = finalAirbnbJob || airbnbJob;

      // Helper to serialize Airbnb enrichment data into URL params
      function serializeAirbnb(ab) {
        if (!ab) return;
        if (ab.title) params.set("airbnbTitle", ab.title);
        if (ab.thumbnail) params.set("airbnbThumbnail", ab.thumbnail);
        if (ab.rating) params.set("airbnbRating", String(ab.rating));
        if (ab.reviewCount) params.set("airbnbReviews", String(ab.reviewCount));
        if (ab.isSuperhost) params.set("airbnbSuperhost", "1");
        if (ab.bedrooms) params.set("airbnbBedrooms", String(ab.bedrooms));
        if (ab.baths) params.set("airbnbBaths", String(ab.baths));
        if (ab.guests) params.set("airbnbGuests", String(ab.guests));
        if (ab.propertyType) params.set("airbnbPropertyType", ab.propertyType);
        if (ab.airbnbId) params.set("airbnbId", ab.airbnbId);
        if (ab.categoryEnrichment) {
          params.set("airbnbEnrichment", JSON.stringify(ab.categoryEnrichment));
        }
        if (Array.isArray(ab.descriptionHints) && ab.descriptionHints.length > 0) {
          params.set("airbnbDescriptionHints", JSON.stringify(ab.descriptionHints));
        }
        // Serialize listing images (first 25) for amenity detection UI
        // 25 instead of 12 so pool/outdoor photos later in the gallery are included
        const imageSource = ab.allImages || ab.images;
        if (Array.isArray(imageSource) && imageSource.length > 0) {
          const imageSlice = imageSource
            .slice(0, 25)
            .map((img) => ({
              caption: typeof img === "string" ? "" : (img.caption || ""),
              imageUrl: typeof img === "string" ? img : (img.url || img.imageUrl || ""),
            }))
            .filter((img) => img.imageUrl);
          if (imageSlice.length > 0) {
            params.set("airbnbImages", JSON.stringify(imageSlice));
          }
        }
      }

      // Include Airbnb listing from background job if available
      if (jobState.listing) serializeAirbnb(jobState.listing);

      Object.entries(all).forEach(([key, val]) => {
        // Skip internal auto-detection flag
        if (key === "_purchaseYearAutoDetected") return;

        // Address type: flatten into individual params
        if (key === "propertyAddress" && val && typeof val === "object" && (val.fullAddress || val.address)) {
          params.set("address", val.fullAddress);
          params.set("city", val.city || "");
          params.set("state", val.state || "");
          params.set("zip", val.zip || "");
          if (val.propertyDetails) {
            const pd = val.propertyDetails;
            if (pd.beds) params.set("beds", pd.beds);
            if (pd.baths) params.set("baths", pd.baths);
            if (pd.sqft) params.set("sqft", pd.sqft);
            if (pd.yearBuilt) params.set("yearBuilt", pd.yearBuilt);
            if (pd.assessedLand) params.set("assessedLand", pd.assessedLand);
            if (pd.assessedImprovement) params.set("assessedImprovement", pd.assessedImprovement);
            if (pd.propertyType) params.set("propertyType", pd.propertyType);
            if (pd.lotSqft) params.set("lotSqft", pd.lotSqft);
            if (pd.lastSoldPrice) params.set("lastSoldPrice", pd.lastSoldPrice);
            if (pd.lastSoldDate) params.set("lastSoldDate", pd.lastSoldDate);
            if (pd.lat) params.set("lat", pd.lat);
            if (pd.lon) params.set("lon", pd.lon);
          }
          // Legacy: pass Airbnb data if it was attached to address (shouldn't happen in new flow)
          if (val.airbnb) serializeAirbnb(val.airbnb);
          return;
        }

        // Airbnb URL step: skip — listing data comes from airbnbJob state
        if (key === "airbnbUrl") return;
        // airbnbVerify: skip (already serialized from airbnbJob above)
        if (key === "airbnbVerify") return;

        if (Array.isArray(val)) {
          params.set(key, val.join(","));
        } else if (val && typeof val === "object" && val.selected !== undefined) {
          // currency-option type: serialize as "selected:amount"
          const amt = val.amount ? val.amount.replace(/\D/g, "") : "";
          params.set(key, amt ? `${val.selected}:${amt}` : val.selected);
        } else if (val && typeof val === "object") {
          // Skip other complex objects we don't know how to serialize
          return;
        } else {
          params.set(key, val);
        }
      });
      trackQuizCompleted({ steps: totalSteps, propertyUse: all.propertyUse });
      router.push(`/quiz/results?${params.toString()}`);
    },
    [answers, router, totalSteps]
  );

  const handleNext = useCallback(() => {
    if (!canProceed) return;
    if (currentStep < totalSteps - 1) {
      setDirection("forward");
      setCurrentStep((s) => s + 1);
      setShowTooltip(false);
    } else {
      navigateToResults();
    }
  }, [canProceed, currentStep, totalSteps, navigateToResults]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection("back");
      setCurrentStep((s) => s - 1);
      setDisqualified(false);
      setShowTooltip(false);
    }
  }, [currentStep]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Enter" && canProceed && !disqualified) {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "Backspace" && e.target.tagName !== "INPUT") {
        handleBack();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canProceed, disqualified, handleNext, handleBack]);

  if (disqualified) {
    return (
      <div className="quiz-shell">
        <div className="quiz-header">
          <Link href="/" className="quiz-logo"><AbodeLogo /></Link>
          <div />
          <Link href="/" aria-label="Close quiz">
            <X size={20} style={{ color: "var(--dust)" }} />
          </Link>
        </div>
        <div className="quiz-body">
          <div className="quiz-content" style={{ textAlign: "center" }}>
            <div className="quiz-disqualify-icon">🏠</div>
            <h2 className="quiz-question" style={{ marginBottom: "var(--space-2)" }}>
              {DISQUALIFY_MESSAGE.title}
            </h2>
            <p
              className="body-text"
              style={{
                maxWidth: "480px",
                margin: "0 auto var(--space-5)",
                color: "var(--ink-mid)",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              {DISQUALIFY_MESSAGE.body}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", alignItems: "center" }}>
              <Link href={DISQUALIFY_MESSAGE.ctaLink} className="btn btn-primary">
                {DISQUALIFY_MESSAGE.cta}
              </Link>
              <button className="btn btn-subtle" onClick={() => { setDisqualified(false); handleBack(); }}>
                <ArrowLeft size={16} />
                Go Back & Change Answer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-shell">
      {/* Header */}
      <div className="quiz-header">
        <Link href="/" className="quiz-logo"><AbodeLogo /></Link>
        <div className="quiz-header-center">
          <span className="quiz-step-count">
            {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <Link href="/" aria-label="Close quiz">
          <X size={20} style={{ color: "var(--dust)" }} />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="quiz-progress">
        <div
          className="quiz-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Running estimate widget — appears after purchase price is entered */}
      <RunningEstimate answers={answers} currentStepId={step.id} />

      {/* Step content */}
      <div className="quiz-body">
        <div className="quiz-content">
          <QuizStep
            key={step.id}
            step={step}
            value={currentAnswer}
            onChange={handleAnswer}
            onAutoAdvance={handleAutoAdvance}
            direction={direction}
            stepNumber={currentStep + 1}
            showTooltip={showTooltip}
            onToggleTooltip={() => setShowTooltip(!showTooltip)}
            answers={answers}
            airbnbJob={airbnbJob}
          />

          {/* Navigation */}
          <div className="quiz-nav">
            {currentStep > 0 ? (
              <button className="btn btn-subtle quiz-nav-back" onClick={handleBack}>
                <ArrowLeft size={16} />
                Back
              </button>
            ) : (
              <div />
            )}

            <div className="quiz-nav-right">
              {/* Accuracy meter */}
              <div className="quiz-accuracy">
                <div className="quiz-accuracy-bar">
                  <div
                    className="quiz-accuracy-fill"
                    style={{ width: `${accuracyPercent}%` }}
                  />
                </div>
                <span className="quiz-accuracy-label">
                  {accuracyPercent}% complete
                </span>
              </div>

              {step.type === "multi" || step.type === "currency" || step.type === "address" || step.type === "address-confirm" || step.type === "airbnb-verify" || step.type === "currency-option" || step.type === "tax-bracket" || step.type === "airbnb-url" || (step.type === "option" && currentAnswer) ? (
                <button
                  className="btn btn-primary quiz-nav-next"
                  onClick={handleNext}
                  disabled={!canProceed}
                >
                  {currentStep === totalSteps - 1 ? "See My Results" : "Continue"}
                  <CornerDownLeft size={14} style={{ opacity: 0.6 }} />
                </button>
              ) : null}
            </div>
          </div>

          {/* Keyboard hint */}
          <div className="quiz-keyboard-hint">
            {step.type === "option" ? (
              <span>Press <kbd>1</kbd>–<kbd>{step.options.length}</kbd> to select • <kbd>Enter</kbd> to continue</span>
            ) : step.type === "multi" ? (
              <span>Select all that apply • Press <kbd>Enter</kbd> to continue</span>
            ) : step.type === "currency-option" ? (
              <span>Select an option • Press <kbd>Enter</kbd> to continue</span>
            ) : (
              <span>Press <kbd>Enter ↵</kbd> to continue</span>
            )}
          </div>

          {/* Data use notice */}
          <p className="quiz-notice">
            {currentStep === 0
              ? "Your property data is used solely to generate your estimate. We do not sell your information. See our "
              : "This estimate is for informational purposes only and does not constitute tax advice. See our "}
            <Link href="/privacy" style={{ color: "var(--turq)", textDecoration: "underline" }}>
              Privacy Policy
            </Link>
            {" and "}
            <Link href="/disclaimers" style={{ color: "var(--turq)", textDecoration: "underline" }}>
              Disclaimers
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
