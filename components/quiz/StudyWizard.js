"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  HelpCircle,
  AlertTriangle,
  Camera,
  Upload,
  Plus,
  Trash2,
  FileText,
  PenLine,
  Shield,
  ChevronRight,
  Image as ImageIcon,
  Tag,
  X,
} from "lucide-react";
import PropertyDetailCards from "./PropertyDetailCards";
import { AbodeLogo } from "@/components/ui/NavBar";
import { STUDY_PRICE } from "@/lib/pricing";

// ─── Wizard Step Definitions ───────────────────────────────────────────────────
const WIZARD_STEPS = [
  { id: "basics", label: "Property Basics", icon: Building2 },
  { id: "participation", label: "Material Participation", icon: Clock },
  { id: "details", label: "Property Details", icon: FileText },
  { id: "renovations", label: "Renovations", icon: Building2 },
  { id: "photos", label: "Photos & Docs", icon: Camera },
  { id: "review", label: "Review & Sign", icon: PenLine },
];

// ─── Renovation Category Options ───────────────────────────────────────────────
const RENOVATION_CATEGORIES = [
  { value: "kitchen-remodel", label: "Kitchen Remodel" },
  { value: "bathroom-remodel", label: "Bathroom Remodel" },
  { value: "new-flooring", label: "New Flooring" },
  { value: "new-roof", label: "New Roof" },
  { value: "pool-deck", label: "Added Pool / Deck" },
  { value: "landscaping", label: "Landscaping" },
  { value: "hvac-replacement", label: "HVAC Replacement" },
  { value: "solar", label: "Solar Panels" },
  { value: "addition", label: "Addition / New Structure" },
  { value: "other", label: "Other (describe below)" },
];

// ─── Photo Category Tags ───────────────────────────────────────────────────────
const PHOTO_TAGS = [
  "Kitchen",
  "Bathroom",
  "Flooring",
  "Outdoor",
  "HVAC",
  "Interior",
  "Smart Home",
  "Specialty",
  "Renovation",
  "Other",
];

// ─── Hours Options ─────────────────────────────────────────────────────────────
const HOURS_OPTIONS = [
  { value: "500+", label: "500+ hours", description: "Full material participation" },
  { value: "250-500", label: "250–500 hours", description: "Significant involvement" },
  { value: "100-250", label: "100–250 hours", description: "Moderate involvement" },
  { value: "under-100", label: "Under 100 hours", description: "Limited involvement" },
];

const PM_OPTIONS = [
  { value: "no", label: "No — I self-manage" },
  { value: "hybrid", label: "Hybrid — I use a co-host" },
  { value: "yes", label: "Yes — Full property management" },
];

// ─── Utility: Format currency ──────────────────────────────────────────────────
function formatCurrency(val) {
  if (!val && val !== 0) return "";
  const num = typeof val === "string" ? parseInt(val.replace(/\D/g, ""), 10) : val;
  if (isNaN(num)) return "";
  return num.toLocaleString("en-US");
}

function parseCurrencyInput(str) {
  return parseInt(String(str).replace(/\D/g, ""), 10) || 0;
}

// ─── Tooltip Component ─────────────────────────────────────────────────────────
function Tooltip({ text }) {
  const [show, setShow] = useState(false);

  return (
    <span
      style={{ position: "relative", display: "inline-flex", marginLeft: 4, cursor: "help" }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onClick={() => setShow((s) => !s)}
    >
      <HelpCircle size={14} style={{ color: "var(--dust)" }} />
      {show && (
        <span
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface-dark)",
            color: "#fff",
            fontSize: 12,
            lineHeight: 1.5,
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            whiteSpace: "normal",
            width: 240,
            zIndex: 100,
            boxShadow: "var(--shadow-md)",
            pointerEvents: "none",
          }}
        >
          {text}
        </span>
      )}
    </span>
  );
}

// ─── Currency Input Component ──────────────────────────────────────────────────
function CurrencyInput({ value, onChange, placeholder, style }) {
  const [displayValue, setDisplayValue] = useState(
    value ? `$${formatCurrency(value)}` : ""
  );

  function handleChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, "");
    const num = parseInt(raw, 10) || 0;
    setDisplayValue(raw ? `$${parseInt(raw, 10).toLocaleString("en-US")}` : "");
    onChange(num);
  }

  function handleBlur() {
    if (value) {
      setDisplayValue(`$${formatCurrency(value)}`);
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      className="input"
      value={displayValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder || "$0"}
      style={style}
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STUDY WIZARD — Main Component
// ═══════════════════════════════════════════════════════════════════════════════

export default function StudyWizard({
  tier1Data,
  airbnb,
  airbnbEnrichment,
  airbnbImages,
  streetViewUrl,
  initialDetailSelections,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);

  // ─── Step 1: Property Basics ─────────────────────────────────────────────
  const [basics, setBasics] = useState({
    address: tier1Data?.address || "",
    sqft: tier1Data?.sqft || 0,
    beds: tier1Data?.beds || "",
    baths: tier1Data?.baths || "",
    yearBuilt: tier1Data?.yearBuilt || 2010,
    purchasePrice: tier1Data?.purchasePrice || 0,
    purchaseYear: tier1Data?.purchaseYear || "2024",
    ownerEntity: "",
    closingCosts: 0,
    placedInServiceDate: "",
    landValueOverride: tier1Data?.assessedLand || 0,
  });

  // ─── Step 2: Material Participation ──────────────────────────────────────
  const [participation, setParticipation] = useState({
    hoursPerYear: "",
    propertyManager: "",
  });

  // ─── Step 3: Property Detail Cards ───────────────────────────────────────
  const [detailSelections, setDetailSelections] = useState({});
  const [confirmedCount, setConfirmedCount] = useState(0);

  // ─── Step 4: Renovations ─────────────────────────────────────────────────
  const [hasRenovations, setHasRenovations] = useState(null);
  const [renovations, setRenovations] = useState([]);

  // ─── Step 5: Photos ──────────────────────────────────────────────────────
  const [uploadedPhotos, setUploadedPhotos] = useState([]);

  // ─── Step 6: Review & Sign ───────────────────────────────────────────────
  const [signatureName, setSignatureName] = useState("");
  const [attestation, setAttestation] = useState(false);
  const [noTaxAdvice, setNoTaxAdvice] = useState(false);

  // ─── Pre-populate owner name from auth session ───────────────────────────
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          const fullName = data.user.name || data.user.email || "";
          // Only set if user hasn't typed anything yet
          setBasics((prev) => ({
            ...prev,
            ownerEntity: prev.ownerEntity || fullName,
          }));
          setSignatureName((prev) => prev || fullName);
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Navigation ──────────────────────────────────────────────────────────
  function goToStep(idx) {
    if (idx >= 0 && idx <= WIZARD_STEPS.length - 1 && idx <= highestStep + 1) {
      setCurrentStep(idx);
      if (idx > highestStep) setHighestStep(idx);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function goNext() {
    goToStep(currentStep + 1);
  }

  function goBack() {
    goToStep(currentStep - 1);
  }

  // ─── Detail cards callback ───────────────────────────────────────────────
  const handleSelectionsChange = useCallback((selections, confirmed) => {
    setDetailSelections(selections);
    setConfirmedCount(confirmed.size);
  }, []);

  // ─── Renovation helpers ──────────────────────────────────────────────────
  function addRenovation() {
    setRenovations((prev) => [
      ...prev,
      { id: Date.now(), category: "", cost: 0, date: "" },
    ]);
  }

  function updateRenovation(id, field, value) {
    setRenovations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  }

  function removeRenovation(id) {
    setRenovations((prev) => prev.filter((r) => r.id !== id));
  }

  // ─── Photo upload stub ───────────────────────────────────────────────────
  function handlePhotoDrop(e) {
    e.preventDefault();
    // STUB: In production, upload to S3/Cloudflare R2
    // For now, create object URLs for preview
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (!files) return;

    const newPhotos = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        id: Date.now() + Math.random(),
        file: f,
        preview: URL.createObjectURL(f),
        name: f.name,
        tag: "",
      }));
    setUploadedPhotos((prev) => [...prev, ...newPhotos]);
  }

  function tagPhoto(photoId, tag) {
    setUploadedPhotos((prev) =>
      prev.map((p) => (p.id === photoId ? { ...p, tag } : p))
    );
  }

  function removePhoto(photoId) {
    setUploadedPhotos((prev) => {
      const photo = prev.find((p) => p.id === photoId);
      if (photo?.preview) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== photoId);
    });
  }

  // ─── Participation warning logic ─────────────────────────────────────────
  const showParticipationWarning =
    participation.hoursPerYear &&
    participation.hoursPerYear !== "500+" &&
    participation.propertyManager === "yes";

  // ─── Assemble final studyInputs ──────────────────────────────────────────
  function assembleStudyInputs() {
    // Compute land value: override or assessed
    const landValue =
      basics.landValueOverride > 0
        ? basics.landValueOverride
        : tier1Data?.assessedLand || 0;

    // Resolve purchaseYear codes (e.g. "2022-earlier", "2025-post") to real year
    function resolveYear(yr) {
      if (!yr) return "2024";
      if (yr === "2022-earlier") return "2022";
      if (yr === "2025-post" || yr === "2025-pre") return "2025";
      return yr; // "2024", "2023", etc. are already valid
    }
    const yearStr = resolveYear(basics.purchaseYear);

    return {
      // Property basics
      purchasePrice: basics.purchasePrice,
      closingCosts: basics.closingCosts,
      landValue,
      placedInServiceDate:
        basics.placedInServiceDate ||
        `${yearStr}-01-15`,
      acquisitionDate: `${yearStr}-01-15`,
      ownerName: signatureName,
      ownerEntity: basics.ownerEntity,
      propertyAddress: basics.address,
      propertyType: tier1Data?.propertyType || "Single Family",
      sqft: basics.sqft,
      beds: parseInt(basics.beds, 10) || 0,
      baths: parseFloat(basics.baths) || 0,
      yearBuilt: basics.yearBuilt,
      isFurnished: true,

      // Material participation
      materialParticipation: participation.hoursPerYear === "500+",
      participationHours: participation.hoursPerYear,
      usesPropertyManager: participation.propertyManager,

      // Wizard answers (from PropertyDetailCards)
      wizardAnswers: detailSelections,

      // Renovations
      renovations:
        hasRenovations && renovations.length > 0
          ? renovations.filter((r) => r.category && r.cost > 0)
          : [],

      // Photos (file references for upload)
      photos: uploadedPhotos.map((p) => ({
        name: p.name,
        tag: p.tag,
        file: p.file,
      })),

      // Attestation
      signatureName,
      attestationAccepted: attestation,
      noTaxAdviceAccepted: noTaxAdvice,

      // Airbnb context
      airbnbId: airbnb?.airbnbId || "",
      airbnbTitle: airbnb?.title || "",
    };
  }

  function handleComplete() {
    const studyInputs = assembleStudyInputs();
    onComplete(studyInputs);
  }

  // ─── Assessed land display for tooltip ───────────────────────────────────
  const assessedLandDisplay =
    tier1Data?.assessedLand > 0
      ? `County assessed land value: $${tier1Data.assessedLand.toLocaleString()}`
      : "Enter the land portion of your property value. Check your county tax assessment or closing statement.";

  const assessedImprovementDisplay =
    tier1Data?.assessedImprovement > 0
      ? ` | Improvements: $${tier1Data.assessedImprovement.toLocaleString()}`
      : "";

  // ─── Progress ────────────────────────────────────────────────────────────
  const progressPercent = Math.round(
    ((currentStep + 1) / WIZARD_STEPS.length) * 100
  );

  const step = WIZARD_STEPS[currentStep];

  // ─── Property data for PropertyDetailCards ───────────────────────────────
  const propertyData = useMemo(
    () => ({
      propertyType: tier1Data?.propertyType || "Single Family",
      yearBuilt: basics.yearBuilt,
      purchasePrice: basics.purchasePrice,
      state: tier1Data?.state || "",
    }),
    [tier1Data, basics.yearBuilt, basics.purchasePrice]
  );

  // ─── Can proceed checks ─────────────────────────────────────────────────
  const canProceedFromReview =
    signatureName.trim().length >= 2 && attestation && noTaxAdvice;

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div className="quiz-shell">
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <div className="quiz-header">
        <span className="quiz-logo"><AbodeLogo /></span>
        <div
          className="pdc-phase-label"
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <FileText size={14} />
          <span>Cost Segregation Study</span>
        </div>
        <div style={{ fontSize: 13, color: "var(--dust)", fontFamily: "var(--font-mono)" }}>
          Step {currentStep + 1} of {WIZARD_STEPS.length}
        </div>
      </div>

      {/* ─── Progress Bar ───────────────────────────────────────────────── */}
      <div className="quiz-progress">
        <div
          className="quiz-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* ─── Step Indicators ────────────────────────────────────────────── */}
      <div style={styles.stepIndicators}>
        {WIZARD_STEPS.map((s, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;
          const isClickable = idx <= highestStep + 1;
          const StepIcon = s.icon;

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => isClickable && goToStep(idx)}
              style={{
                ...styles.stepDot,
                background: isActive
                  ? "var(--turq)"
                  : isCompleted
                    ? "var(--turq-light)"
                    : "var(--surface-2)",
                color: isActive
                  ? "#fff"
                  : isCompleted
                    ? "var(--turq-mid)"
                    : "var(--dust)",
                cursor: isClickable ? "pointer" : "default",
                opacity: isClickable ? 1 : 0.5,
                borderColor: isActive ? "var(--turq)" : "transparent",
              }}
              title={s.label}
            >
              {isCompleted ? (
                <Check size={14} strokeWidth={3} />
              ) : (
                <StepIcon size={14} />
              )}
              <span style={styles.stepDotLabel}>{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Step Body ──────────────────────────────────────────────────── */}
      <div
        className="quiz-body"
        style={{ alignItems: "flex-start", paddingTop: "var(--space-4)" }}
      >
        <div style={{ maxWidth: 680, width: "100%", margin: "0 auto" }}>
          {/* ═══ STEP 1: Property Basics ═══ */}
          {step.id === "basics" && (
            <StepBasics
              basics={basics}
              setBasics={setBasics}
              tier1Data={tier1Data}
              streetViewUrl={streetViewUrl}
              assessedLandTooltip={assessedLandDisplay + assessedImprovementDisplay}
            />
          )}

          {/* ═══ STEP 2: Material Participation ═══ */}
          {step.id === "participation" && (
            <StepParticipation
              participation={participation}
              setParticipation={setParticipation}
              showWarning={showParticipationWarning}
            />
          )}

          {/* ═══ STEP 3: Property Details (existing cards) ═══ */}
          {step.id === "details" && (
            <StepDetails
              propertyData={propertyData}
              purchasePrice={basics.purchasePrice}
              onSelectionsChange={handleSelectionsChange}
              airbnbEnrichment={airbnbEnrichment}
              airbnbImages={airbnbImages}
              confirmedCount={confirmedCount}
              initialSelections={initialDetailSelections}
            />
          )}

          {/* ═══ STEP 4: Renovations ═══ */}
          {step.id === "renovations" && (
            <StepRenovations
              hasRenovations={hasRenovations}
              setHasRenovations={setHasRenovations}
              renovations={renovations}
              addRenovation={addRenovation}
              updateRenovation={updateRenovation}
              removeRenovation={removeRenovation}
            />
          )}

          {/* ═══ STEP 5: Photos & Documentation ═══ */}
          {step.id === "photos" && (
            <StepPhotos
              airbnbImages={airbnbImages}
              airbnb={airbnb}
              uploadedPhotos={uploadedPhotos}
              handlePhotoDrop={handlePhotoDrop}
              tagPhoto={tagPhoto}
              removePhoto={removePhoto}
            />
          )}

          {/* ═══ STEP 6: Review & Sign ═══ */}
          {step.id === "review" && (
            <StepReview
              basics={basics}
              tier1Data={tier1Data}
              participation={participation}
              confirmedCount={confirmedCount}
              hasRenovations={hasRenovations}
              renovations={renovations}
              uploadedPhotos={uploadedPhotos}
              airbnbImages={airbnbImages}
              signatureName={signatureName}
              setSignatureName={setSignatureName}
              attestation={attestation}
              setAttestation={setAttestation}
              noTaxAdvice={noTaxAdvice}
              setNoTaxAdvice={setNoTaxAdvice}
            />
          )}

          {/* ─── Navigation Buttons ─────────────────────────────────────── */}
          <div style={styles.navRow}>
            {currentStep > 0 && (
              <button
                type="button"
                className="btn btn-subtle"
                onClick={goBack}
                style={{ gap: 6 }}
              >
                <ArrowLeft size={16} />
                Back
              </button>
            )}
            <div style={{ flex: 1 }} />
            {/* Skip for now — available on all optional steps (not basics or review) */}
            {currentStep > 0 && currentStep < WIZARD_STEPS.length - 1 && (
              <button
                type="button"
                className="btn btn-subtle"
                onClick={goNext}
                style={{ gap: 6, marginRight: 10, fontSize: 13, color: "var(--dust)" }}
              >
                Skip for now
              </button>
            )}
            {currentStep < WIZARD_STEPS.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={goNext}
                style={{ gap: 8 }}
              >
                Continue
                <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={handleComplete}
                disabled={!canProceedFromReview}
                style={{
                  gap: 8,
                  opacity: canProceedFromReview ? 1 : 0.5,
                  cursor: canProceedFromReview ? "pointer" : "not-allowed",
                }}
              >
                Generate My Study — ${STUDY_PRICE}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 1: Property Basics Confirmation
// ═══════════════════════════════════════════════════════════════════════════════

function StepBasics({ basics, setBasics, tier1Data, streetViewUrl, assessedLandTooltip }) {
  function update(field, value) {
    setBasics((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <div className="pdc-intro">
        <div className="quiz-step-badge">
          <Building2 size={12} />
          Step 1 of 6
        </div>
        <h1 className="h2-component">Confirm your property details</h1>
        <p className="pdc-intro-sub">
          We&apos;ve pre-populated these from your earlier search. Review and
          correct anything that doesn&apos;t match — accuracy here improves your
          study.
        </p>
      </div>

      {/* Street View preview */}
      {streetViewUrl && (
        <div style={styles.streetView}>
          <img
            src={streetViewUrl}
            alt="Property street view"
            style={styles.streetViewImg}
            onError={(e) => {
              e.target.parentElement.style.display = "none";
            }}
          />
        </div>
      )}

      <div style={styles.formGrid}>
        {/* Address */}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label className="label">Property Address</label>
          <input
            type="text"
            className="input"
            value={basics.address}
            onChange={(e) => update("address", e.target.value)}
          />
        </div>

        {/* Sqft */}
        <div className="field">
          <label className="label">Square Footage</label>
          <input
            type="number"
            className="input"
            value={basics.sqft || ""}
            onChange={(e) => update("sqft", parseInt(e.target.value, 10) || 0)}
          />
        </div>

        {/* Year Built */}
        <div className="field">
          <label className="label">Year Built</label>
          <input
            type="number"
            className="input"
            value={basics.yearBuilt || ""}
            onChange={(e) =>
              update("yearBuilt", parseInt(e.target.value, 10) || 0)
            }
          />
        </div>

        {/* Beds */}
        <div className="field">
          <label className="label">Bedrooms</label>
          <input
            type="text"
            className="input"
            value={basics.beds}
            onChange={(e) => update("beds", e.target.value)}
          />
        </div>

        {/* Baths */}
        <div className="field">
          <label className="label">Bathrooms</label>
          <input
            type="text"
            className="input"
            value={basics.baths}
            onChange={(e) => update("baths", e.target.value)}
          />
        </div>

        {/* Purchase Price */}
        <div className="field">
          <label className="label">Purchase Price</label>
          <CurrencyInput
            value={basics.purchasePrice}
            onChange={(val) => update("purchasePrice", val)}
            placeholder="$500,000"
          />
        </div>

        {/* Purchase Year */}
        <div className="field">
          <label className="label">Purchase Year</label>
          <select
            className="select"
            value={basics.purchaseYear}
            onChange={(e) => update("purchaseYear", e.target.value)}
          >
            <option value="2025-post">2025 (post-OBBBA)</option>
            <option value="2025-pre">2025 (pre-OBBBA)</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022-earlier">2022 or earlier</option>
          </select>
        </div>

        {/* Divider */}
        <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--border)", margin: "var(--space-1) 0" }} />

        {/* Owner / Entity Name */}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label className="label">
            Owner / Entity Name
            <Tooltip text="Enter the legal name on the deed — your name or LLC/trust name. This appears on the study." />
          </label>
          <input
            type="text"
            className="input"
            value={basics.ownerEntity}
            onChange={(e) => update("ownerEntity", e.target.value)}
            placeholder="e.g., John Smith or Smith Family Trust LLC"
          />
        </div>

        {/* Closing Costs */}
        <div className="field">
          <label className="label">
            Closing Costs
            <span style={{ fontWeight: 400, color: "var(--dust)", marginLeft: 4 }}>
              (optional)
            </span>
            <Tooltip text="Closing costs are added to your depreciable basis, increasing your deduction. Find this on your HUD-1 or closing statement." />
          </label>
          <CurrencyInput
            value={basics.closingCosts}
            onChange={(val) => update("closingCosts", val)}
            placeholder="$0"
          />
        </div>

        {/* Placed in Service Date */}
        <div className="field">
          <label className="label">
            Placed in Service Date
            <Tooltip text="The date you first made the property available for rent. This determines your depreciation start month." />
          </label>
          <input
            type="date"
            className="input"
            value={basics.placedInServiceDate}
            onChange={(e) => update("placedInServiceDate", e.target.value)}
          />
        </div>

        {/* Land Value Override */}
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label className="label">
            Land Value
            <Tooltip text={assessedLandTooltip} />
          </label>
          <CurrencyInput
            value={basics.landValueOverride}
            onChange={(val) => update("landValueOverride", val)}
            placeholder="$0"
          />
          {tier1Data?.assessedLand > 0 && (
            <span style={{ fontSize: 12, color: "var(--dust)", marginTop: 4, display: "block" }}>
              County assessed: ${tier1Data.assessedLand.toLocaleString()}
              {tier1Data?.assessedImprovement > 0 &&
                ` | Improvements: $${tier1Data.assessedImprovement.toLocaleString()}`}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 2: Material Participation Assessment
// ═══════════════════════════════════════════════════════════════════════════════

function StepParticipation({ participation, setParticipation, showWarning }) {
  function update(field, value) {
    setParticipation((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div>
      <div className="pdc-intro">
        <div className="quiz-step-badge">
          <Clock size={12} />
          Step 2 of 6
        </div>
        <h1 className="h2-component">Material participation</h1>
        <p className="pdc-intro-sub">
          This helps determine whether your rental losses can offset other
          income. Short-term rentals with material participation have significant
          tax advantages.
        </p>
      </div>

      {/* Educational callout */}
      <div className="pdc-callout" style={styles.educationalCallout}>
        <div className="pdc-callout-icon">
          <Shield size={16} />
        </div>
        <div>
          <div className="pdc-callout-title">STR 7-Day Exception</div>
          <div className="pdc-callout-body">
            Short-term rentals (average stay under 7 days) are <strong>not subject
            to passive activity rules</strong> if you materially participate. This
            means depreciation deductions can offset your W-2, business, and other
            active income — not just rental income. The IRS requires 500+ hours of
            material participation for the strongest position.
          </div>
        </div>
      </div>

      {/* Hours per year */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label className="label" style={{ marginBottom: "var(--space-2)", fontSize: 15 }}>
          How many hours per year do you spend managing this property?
        </label>
        <div style={styles.radioGroup}>
          {HOURS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pdc-select-btn ${participation.hoursPerYear === opt.value ? "selected" : ""}`}
              onClick={() => update("hoursPerYear", opt.value)}
              style={styles.radioOption}
            >
              {participation.hoursPerYear === opt.value && (
                <Check size={12} strokeWidth={3} />
              )}
              <div>
                <div style={{ fontWeight: 500 }}>{opt.label}</div>
                <div style={{ fontSize: 12, color: "var(--dust)", fontWeight: 400 }}>
                  {opt.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Property management */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label className="label" style={{ marginBottom: "var(--space-2)", fontSize: 15 }}>
          Do you use a property management company?
        </label>
        <div style={styles.radioGroup}>
          {PM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`pdc-select-btn ${participation.propertyManager === opt.value ? "selected" : ""}`}
              onClick={() => update("propertyManager", opt.value)}
              style={styles.radioOption}
            >
              {participation.propertyManager === opt.value && (
                <Check size={12} strokeWidth={3} />
              )}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Warning for low hours + PM */}
      {showWarning && (
        <div
          style={{
            display: "flex",
            gap: 12,
            padding: "14px 16px",
            background: "#FEF6E7",
            border: "1px solid #F5D47B",
            borderRadius: "var(--radius-md)",
          }}
        >
          <AlertTriangle
            size={18}
            style={{ color: "#B8860B", flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-mid)" }}>
            <strong style={{ color: "var(--ink)" }}>
              Material participation may be limited.
            </strong>{" "}
            Using a full property management company with fewer than 500 hours
            of personal involvement may weaken your material participation
            claim. Your CPA can help you document qualifying activities
            (guest communication, pricing adjustments, maintenance oversight,
            etc.) to strengthen your position.
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 3: Property Details (wraps existing PropertyDetailCards)
// ═══════════════════════════════════════════════════════════════════════════════

function StepDetails({
  propertyData,
  purchasePrice,
  onSelectionsChange,
  airbnbEnrichment,
  airbnbImages,
  confirmedCount,
  initialSelections,
}) {
  const hasPreFill = initialSelections && Object.keys(initialSelections).length > 0;

  return (
    <div>
      <div className="pdc-intro">
        <div className="quiz-step-badge">
          <FileText size={12} />
          Step 3 of 6
        </div>
        <h1 className="h2-component">
          {hasPreFill ? "Confirm your property details" : "Tell us about your property"}
        </h1>
        <p className="pdc-intro-sub">
          {hasPreFill
            ? "We've pre-filled this from your earlier walkthrough. Review each category and adjust anything that's changed — or click Continue if everything looks right."
            : "Review each category and adjust anything that doesn't match. The more detail you provide, the more accurate and defensible your study."}
        </p>
      </div>

      <PropertyDetailCards
        propertyData={propertyData}
        purchasePrice={purchasePrice}
        onSelectionsChange={onSelectionsChange}
        airbnbEnrichment={airbnbEnrichment}
        airbnbDescriptionHints={[]}
        airbnbImages={airbnbImages || []}
        initialSelections={initialSelections}
      />

      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "var(--dust)",
          marginTop: "var(--space-2)",
        }}
      >
        You&apos;ve reviewed {confirmedCount} of 8 categories
        {confirmedCount >= 6
          ? " — great detail!"
          : confirmedCount >= 3
            ? " — keep going for better accuracy"
            : " — the more you review, the more accurate your study"}
      </p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 4: Renovations & Improvements
// ═══════════════════════════════════════════════════════════════════════════════

function StepRenovations({
  hasRenovations,
  setHasRenovations,
  renovations,
  addRenovation,
  updateRenovation,
  removeRenovation,
}) {
  return (
    <div>
      <div className="pdc-intro">
        <div className="quiz-step-badge">
          <Building2 size={12} />
          Step 4 of 6
        </div>
        <h1 className="h2-component">Renovations & improvements</h1>
        <p className="pdc-intro-sub">
          Post-purchase improvements increase your depreciable basis and can be
          separately classified for accelerated depreciation.
        </p>
      </div>

      {/* Yes / No toggle */}
      <div style={{ marginBottom: "var(--space-4)" }}>
        <label className="label" style={{ marginBottom: "var(--space-2)", fontSize: 15 }}>
          Have you made any improvements since purchasing this property?
        </label>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            className={`pdc-select-btn ${hasRenovations === true ? "selected" : ""}`}
            onClick={() => {
              setHasRenovations(true);
              if (renovations.length === 0) addRenovation();
            }}
            style={{ flex: 1, padding: "14px 20px", justifyContent: "center" }}
          >
            {hasRenovations === true && <Check size={12} strokeWidth={3} />}
            Yes
          </button>
          <button
            type="button"
            className={`pdc-select-btn ${hasRenovations === false ? "selected" : ""}`}
            onClick={() => setHasRenovations(false)}
            style={{ flex: 1, padding: "14px 20px", justifyContent: "center" }}
          >
            {hasRenovations === false && <Check size={12} strokeWidth={3} />}
            No
          </button>
        </div>
      </div>

      {/* Renovation items */}
      {hasRenovations && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {renovations.map((reno, idx) => (
            <div key={reno.id} style={styles.renovationCard}>
              <div style={styles.renovationCardHeader}>
                <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)" }}>
                  Improvement {idx + 1}
                </span>
                {renovations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRenovation(reno.id)}
                    style={styles.removeBtn}
                    title="Remove"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div style={styles.renovationGrid}>
                <div className="field">
                  <label className="label">Category</label>
                  <select
                    className="select"
                    value={reno.category}
                    onChange={(e) =>
                      updateRenovation(reno.id, "category", e.target.value)
                    }
                  >
                    <option value="">Select category...</option>
                    {RENOVATION_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label className="label">Approximate Cost</label>
                  <CurrencyInput
                    value={reno.cost}
                    onChange={(val) =>
                      updateRenovation(reno.id, "cost", val)
                    }
                    placeholder="$0"
                  />
                </div>

                <div className="field">
                  <label className="label">Date of Improvement</label>
                  <input
                    type="date"
                    className="input"
                    value={reno.date}
                    onChange={(e) =>
                      updateRenovation(reno.id, "date", e.target.value)
                    }
                  />
                </div>

                {/* "Other" description field */}
                {reno.category === "other" && (
                  <div className="field" style={{ gridColumn: "1 / -1" }}>
                    <label className="label">Describe the improvement</label>
                    <input
                      type="text"
                      className="input"
                      value={reno.description || ""}
                      onChange={(e) =>
                        updateRenovation(reno.id, "description", e.target.value)
                      }
                      placeholder="e.g., Converted garage to studio apartment"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            className="btn btn-subtle"
            onClick={addRenovation}
            style={{ alignSelf: "flex-start", gap: 6 }}
          >
            <Plus size={14} />
            Add another improvement
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 5: Photos & Documentation
// ═══════════════════════════════════════════════════════════════════════════════

function StepPhotos({
  airbnbImages,
  airbnb,
  uploadedPhotos,
  handlePhotoDrop,
  tagPhoto,
  removePhoto,
}) {
  const hasAirbnbPhotos = Array.isArray(airbnbImages) && airbnbImages.length > 0;

  return (
    <div>
      <div className="pdc-intro">
        <div className="quiz-step-badge">
          <Camera size={12} />
          Step 5 of 6
        </div>
        <h1 className="h2-component">Photos & documentation</h1>
        <p className="pdc-intro-sub">
          Photos strengthen your study by providing visual documentation of
          property components. This supports your deductions in the event of
          an IRS review.
        </p>
      </div>

      {/* Callout */}
      <div className="pdc-callout" style={styles.educationalCallout}>
        <div className="pdc-callout-icon">
          <Camera size={16} />
        </div>
        <div>
          <div className="pdc-callout-title">Photos strengthen your study</div>
          <div className="pdc-callout-body">
            Visual documentation of kitchen finishes, bathroom fixtures,
            flooring, outdoor improvements, and other depreciable components
            adds credibility and audit protection to your cost segregation
            study.
          </div>
        </div>
      </div>

      {/* Airbnb photos */}
      {hasAirbnbPhotos && (
        <div style={{ marginBottom: "var(--space-4)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "var(--space-2)" }}>
            <ImageIcon size={16} style={{ color: "var(--turq)" }} />
            <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)" }}>
              From your Airbnb listing
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--dust)",
                background: "var(--surface)",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              {airbnbImages.length} photos
            </span>
          </div>
          <div style={styles.photoGrid}>
            {airbnbImages.slice(0, 12).map((img, i) => (
              <div key={img.imageUrl || i} style={styles.photoThumb}>
                <img
                  src={img.imageUrl}
                  alt={img.caption || `Listing photo ${i + 1}`}
                  style={styles.photoThumbImg}
                  loading="lazy"
                />
                {img.caption && (
                  <div style={styles.photoCaption}>{img.caption}</div>
                )}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "var(--dust)", marginTop: 8 }}>
            These photos will be automatically included in your study.
          </p>
        </div>
      )}

      {/* Upload area */}
      <div style={{ marginBottom: "var(--space-3)" }}>
        <label className="label" style={{ marginBottom: "var(--space-2)" }}>
          Additional photos
          <span style={{ fontWeight: 400, color: "var(--dust)", marginLeft: 4 }}>
            (optional)
          </span>
        </label>

        <div
          style={styles.dropZone}
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.style.borderColor = "var(--turq)";
            e.currentTarget.style.background = "var(--turq-bg)";
          }}
          onDragLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-strong)";
            e.currentTarget.style.background = "var(--surface-raised)";
          }}
          onDrop={(e) => {
            e.currentTarget.style.borderColor = "var(--border-strong)";
            e.currentTarget.style.background = "var(--surface-raised)";
            handlePhotoDrop(e);
          }}
          onClick={() => document.getElementById("sw-photo-input")?.click()}
        >
          <Upload size={24} style={{ color: "var(--dust)", marginBottom: 8 }} />
          <div style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)", marginBottom: 4 }}>
            Drag & drop photos here
          </div>
          <div style={{ fontSize: 13, color: "var(--dust)" }}>
            or click to browse — JPG, PNG, HEIC accepted
          </div>
          {/* Hidden file input — no capture attr so desktop gets file picker */}
          <input
            id="sw-photo-input"
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={handlePhotoDrop}
          />
        </div>

        {/* Mobile camera button — separate input with capture for direct camera access */}
        <button
          type="button"
          className="btn btn-subtle"
          style={{ marginTop: 10, gap: 6, display: "flex", alignItems: "center" }}
          onClick={() => document.getElementById("sw-camera-input")?.click()}
        >
          <Camera size={14} />
          Take a photo
          <span style={{ fontSize: 11, color: "var(--dust)", marginLeft: 2 }}>(mobile)</span>
        </button>
        <input
          id="sw-camera-input"
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: "none" }}
          onChange={handlePhotoDrop}
        />
      </div>

      {/* Uploaded photos with tagging */}
      {uploadedPhotos.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
          <span style={{ fontWeight: 500, fontSize: 14, color: "var(--ink)" }}>
            Uploaded ({uploadedPhotos.length})
          </span>
          <div style={styles.photoGrid}>
            {uploadedPhotos.map((photo) => (
              <div key={photo.id} style={styles.uploadedPhotoCard}>
                <div style={{ position: "relative" }}>
                  <img
                    src={photo.preview}
                    alt={photo.name}
                    style={styles.photoThumbImg}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.id)}
                    style={styles.photoRemoveBtn}
                    title="Remove photo"
                  >
                    <X size={12} />
                  </button>
                </div>
                <select
                  className="select"
                  value={photo.tag}
                  onChange={(e) => tagPhoto(photo.id, e.target.value)}
                  style={{ fontSize: 12, padding: "4px 8px", marginTop: 4 }}
                >
                  <option value="">Tag category...</option>
                  {PHOTO_TAGS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STEP 6: Review & Attestation
// ═══════════════════════════════════════════════════════════════════════════════

function StepReview({
  basics,
  tier1Data,
  participation,
  confirmedCount,
  hasRenovations,
  renovations,
  uploadedPhotos,
  airbnbImages,
  signatureName,
  setSignatureName,
  attestation,
  setAttestation,
  noTaxAdvice,
  setNoTaxAdvice,
}) {
  const validRenos = renovations.filter((r) => r.category && r.cost > 0);
  const totalRenoCost = validRenos.reduce((sum, r) => sum + r.cost, 0);
  const airbnbPhotoCount = Array.isArray(airbnbImages) ? airbnbImages.length : 0;
  const totalPhotos = airbnbPhotoCount + uploadedPhotos.length;

  return (
    <div>
      <div className="pdc-intro">
        <div className="quiz-step-badge">
          <PenLine size={12} />
          Step 6 of 6
        </div>
        <h1 className="h2-component">Review & sign</h1>
        <p className="pdc-intro-sub">
          Review the information below, then sign to confirm accuracy. Your
          study will be generated immediately after payment.
        </p>
      </div>

      {/* Summary table */}
      <div style={styles.reviewTable}>
        <ReviewSection title="Property">
          <ReviewRow label="Address" value={basics.address || "—"} />
          <ReviewRow label="Square footage" value={basics.sqft ? `${basics.sqft.toLocaleString()} sqft` : "—"} />
          <ReviewRow label="Beds / Baths" value={`${basics.beds || "—"} / ${basics.baths || "—"}`} />
          <ReviewRow label="Year built" value={basics.yearBuilt || "—"} />
          <ReviewRow label="Property type" value={tier1Data?.propertyType || "Single Family"} />
        </ReviewSection>

        <ReviewSection title="Financial">
          <ReviewRow label="Purchase price" value={basics.purchasePrice ? `$${basics.purchasePrice.toLocaleString()}` : "—"} />
          <ReviewRow label="Closing costs" value={basics.closingCosts ? `$${basics.closingCosts.toLocaleString()}` : "$0"} />
          <ReviewRow label="Land value" value={basics.landValueOverride ? `$${basics.landValueOverride.toLocaleString()}` : "County assessed"} />
          <ReviewRow label="Purchase year" value={basics.purchaseYear} />
          <ReviewRow label="Placed in service" value={basics.placedInServiceDate || "Estimated from purchase year"} />
          <ReviewRow label="Owner / Entity" value={basics.ownerEntity || "—"} />
        </ReviewSection>

        <ReviewSection title="Participation">
          <ReviewRow
            label="Hours per year"
            value={
              HOURS_OPTIONS.find((h) => h.value === participation.hoursPerYear)?.label ||
              "Not specified"
            }
          />
          <ReviewRow
            label="Property manager"
            value={
              PM_OPTIONS.find((p) => p.value === participation.propertyManager)?.label ||
              "Not specified"
            }
          />
        </ReviewSection>

        <ReviewSection title="Property Details">
          <ReviewRow
            label="Categories reviewed"
            value={`${confirmedCount} of 8`}
          />
        </ReviewSection>

        <ReviewSection title="Renovations">
          {hasRenovations && validRenos.length > 0 ? (
            <>
              {validRenos.map((r, i) => (
                <ReviewRow
                  key={r.id}
                  label={
                    RENOVATION_CATEGORIES.find((c) => c.value === r.category)
                      ?.label || r.category
                  }
                  value={`$${r.cost.toLocaleString()}${r.date ? ` (${r.date})` : ""}`}
                />
              ))}
              <ReviewRow
                label="Total improvements"
                value={`$${totalRenoCost.toLocaleString()}`}
                bold
              />
            </>
          ) : (
            <ReviewRow label="Improvements" value="None reported" />
          )}
        </ReviewSection>

        <ReviewSection title="Documentation">
          <ReviewRow label="Total photos" value={`${totalPhotos} photos`} />
          {airbnbPhotoCount > 0 && (
            <ReviewRow label="Airbnb photos" value={airbnbPhotoCount} />
          )}
          {uploadedPhotos.length > 0 && (
            <ReviewRow label="Uploaded photos" value={uploadedPhotos.length} />
          )}
        </ReviewSection>
      </div>

      {/* Signature */}
      <div style={{ marginTop: "var(--space-4)", marginBottom: "var(--space-3)" }}>
        <label className="label" style={{ marginBottom: "var(--space-2)" }}>
          <PenLine size={14} style={{ marginRight: 4, verticalAlign: "middle" }} />
          Digital Signature
        </label>
        <p style={{ fontSize: 13, color: "var(--dust)", marginBottom: "var(--space-2)" }}>
          Type your full legal name as it appears on the property deed.
        </p>
        <input
          type="text"
          className="input"
          value={signatureName}
          onChange={(e) => setSignatureName(e.target.value)}
          placeholder="Full legal name"
          style={{
            fontFamily: "var(--font-primary)",
            fontStyle: "italic",
            fontSize: 18,
            letterSpacing: "-0.01em",
          }}
        />
        {signatureName.trim().length > 0 && (
          <div
            style={{
              marginTop: "var(--space-2)",
              padding: "12px 16px",
              background: "var(--surface)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-primary)",
              fontStyle: "italic",
              fontSize: 20,
              color: "var(--ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {signatureName}
          </div>
        )}
      </div>

      {/* Attestation checkboxes */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={attestation}
            onChange={(e) => setAttestation(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-mid)" }}>
            I attest that the information provided above is true and accurate to
            the best of my knowledge. I understand that the accuracy of my cost
            segregation study depends on the accuracy of the information I have
            provided. I authorize Abode to use this information to prepare a cost
            segregation study for the property described above.
          </span>
        </label>

        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={noTaxAdvice}
            onChange={(e) => setNoTaxAdvice(e.target.checked)}
            style={styles.checkbox}
          />
          <span style={{ fontSize: 13, lineHeight: 1.6, color: "var(--ink-mid)" }}>
            I understand that this cost segregation study does not constitute tax,
            legal, or financial advice. I will consult with a qualified CPA or tax
            professional before making any tax decisions based on this study.
            Estimates are projections based on data provided and generalized
            assumptions.
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── Review sub-components ─────────────────────────────────────────────────────

function ReviewSection({ title, children }) {
  return (
    <div style={{ marginBottom: "var(--space-3)" }}>
      <div
        style={{
          fontWeight: 600,
          fontSize: 13,
          color: "var(--turq)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 8,
          paddingBottom: 6,
          borderBottom: "1px solid var(--border)",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ReviewRow({ label, value, bold }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "6px 0",
        fontSize: 14,
        gap: 16,
      }}
    >
      <span style={{ color: "var(--dust)", flexShrink: 0 }}>{label}</span>
      <span
        style={{
          color: "var(--ink)",
          textAlign: "right",
          fontWeight: bold ? 600 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INLINE STYLES (matches existing design system tokens)
// ═══════════════════════════════════════════════════════════════════════════════

const styles = {
  stepIndicators: {
    display: "flex",
    gap: 4,
    padding: "12px var(--space-4)",
    overflowX: "auto",
    background: "var(--surface-raised)",
    borderBottom: "1px solid var(--border)",
  },
  stepDot: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: "var(--radius-pill)",
    border: "2px solid transparent",
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "var(--font-primary)",
    whiteSpace: "nowrap",
    transition: "all 200ms ease",
    flexShrink: 0,
  },
  stepDotLabel: {
    display: "none",
  },
  navRow: {
    display: "flex",
    alignItems: "center",
    gap: "var(--space-2)",
    marginTop: "var(--space-5)",
    paddingTop: "var(--space-3)",
    borderTop: "1px solid var(--border)",
    paddingBottom: "var(--space-6)",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-2) var(--space-3)",
  },
  streetView: {
    borderRadius: "var(--radius-md)",
    overflow: "hidden",
    marginBottom: "var(--space-3)",
    boxShadow: "var(--shadow-sm)",
  },
  streetViewImg: {
    width: "100%",
    height: 200,
    objectFit: "cover",
    display: "block",
  },
  educationalCallout: {
    marginBottom: "var(--space-4)",
    background: "var(--turq-bg)",
    border: "1px solid var(--turq-light)",
    borderRadius: "var(--radius-md)",
    display: "flex",
    gap: 12,
    padding: "14px 16px",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  radioOption: {
    textAlign: "left",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  renovationCard: {
    background: "var(--surface-raised)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-2) var(--space-3)",
  },
  renovationCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "var(--space-2)",
  },
  renovationGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "var(--space-2) var(--space-3)",
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--dust)",
    padding: 4,
    borderRadius: "var(--radius-sm)",
    display: "flex",
    alignItems: "center",
  },
  photoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: 8,
  },
  photoThumb: {
    borderRadius: "var(--radius-sm)",
    overflow: "hidden",
    position: "relative",
  },
  photoThumbImg: {
    width: "100%",
    height: 90,
    objectFit: "cover",
    display: "block",
    borderRadius: "var(--radius-sm)",
  },
  photoCaption: {
    fontSize: 10,
    color: "var(--dust)",
    padding: "4px 6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  dropZone: {
    border: "2px dashed var(--border-strong)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-4)",
    textAlign: "center",
    cursor: "pointer",
    background: "var(--surface-raised)",
    transition: "all 200ms ease",
  },
  uploadedPhotoCard: {
    display: "flex",
    flexDirection: "column",
  },
  photoRemoveBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
  reviewTable: {
    background: "var(--surface-raised)",
    border: "1px solid var(--border-strong)",
    borderRadius: "var(--radius-md)",
    padding: "var(--space-3)",
  },
  checkboxLabel: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    cursor: "pointer",
    padding: "12px 16px",
    background: "var(--surface-raised)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-md)",
  },
  checkbox: {
    width: 18,
    height: 18,
    flexShrink: 0,
    marginTop: 2,
    accentColor: "var(--turq)",
    cursor: "pointer",
  },
};

// ─── Media query workaround: show step labels on wider screens ─────────────
// Since we use inline styles, we add a small <style> tag for responsive behavior
if (typeof document !== "undefined") {
  const styleId = "sw-responsive";
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement("style");
    styleEl.id = styleId;
    styleEl.textContent = `
      @media (min-width: 768px) {
        .quiz-shell [style] .sw-step-label-hidden {
          display: inline !important;
        }
      }
      @media (max-width: 640px) {
        .quiz-shell .sw-form-grid-responsive {
          grid-template-columns: 1fr !important;
        }
      }
    `;
    document.head.appendChild(styleEl);
  }
}
