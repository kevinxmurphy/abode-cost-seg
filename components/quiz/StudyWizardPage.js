"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import StudyWizard from "./StudyWizard";
import { generateStudy } from "@/lib/reportEngine";
import { assembleReport } from "@/lib/reportAssembler";
import { AbodeLogo } from "@/components/ui/NavBar";

/**
 * StudyWizardPage — Wrapper that parses URL params (from quiz results / property details)
 * and renders the full StudyWizard. On completion, generates the study and stores it.
 */
export default function StudyWizardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [studyResult, setStudyResult] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Payment gate — user must arrive with paid=1 or session_id from Stripe
  const isPaid = searchParams.get("paid") === "1" || !!searchParams.get("session_id");

  // ─── Parse tier 1 data from URL params ──────────────────────────────────────
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
    purchasePrice: parseInt(
      String(searchParams.get("purchasePrice") || "500000").replace(/\D/g, ""),
      10
    ),
    purchaseYear: searchParams.get("purchaseYear") || "2024",
    assessedLand: parseInt(searchParams.get("assessedLand") || "0", 10),
    assessedImprovement: parseInt(
      searchParams.get("assessedImprovement") || "0",
      10
    ),
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
        ? `/api/streetview?address=${encodeURIComponent(tier1Data.address)}`
        : null;

  // Parse Airbnb data
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

  // Parse enrichment JSON
  let airbnbEnrichment = null;
  if (airbnb.enrichment) {
    try {
      airbnbEnrichment = JSON.parse(airbnb.enrichment);
    } catch (e) {
      /* fallback to defaults */
    }
  }

  // Parse detail selections passed from the walkthrough (pre-fill wizard Step 3)
  let initialDetailSelections = null;
  const detailSelectionsRaw = searchParams.get("detailSelections") || "";
  if (detailSelectionsRaw) {
    try {
      const parsed = JSON.parse(detailSelectionsRaw);
      if (parsed && typeof parsed === "object") {
        initialDetailSelections = parsed;
      }
    } catch (e) {
      /* ignore */
    }
  }

  // Parse Airbnb images
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
      /* ignore */
    }
  }

  // ─── Handle wizard completion ──────────────────────────────────────────────
  const handleComplete = useCallback(
    async (studyInputs) => {
      setGenerating(true);

      try {
        // Determine placed-in-service date
        // studyInputs.placedInServiceDate is already a valid ISO date string
        // (assembleStudyInputs resolves "2022-earlier" etc. to real years)
        const pisDate = studyInputs.placedInServiceDate
          ? new Date(studyInputs.placedInServiceDate)
          : new Date(`${tier1Data.purchaseYear.replace(/[^0-9]/g, "").slice(0, 4) || "2024"}-06-15`);

        const acqDate = studyInputs.acquisitionDate
          ? new Date(studyInputs.acquisitionDate)
          : pisDate;

        // Compute land value
        let landValue = 0;
        if (studyInputs.landValue) {
          landValue = parseInt(
            String(studyInputs.landValue).replace(/\D/g, ""),
            10
          );
        } else if (
          tier1Data.assessedLand > 0 &&
          tier1Data.assessedImprovement > 0
        ) {
          const total =
            tier1Data.assessedLand + tier1Data.assessedImprovement;
          const landRatio = tier1Data.assessedLand / total;
          landValue = Math.round(
            studyInputs.purchasePrice * Math.max(0.08, Math.min(landRatio, 0.45))
          );
        } else {
          landValue = Math.round(studyInputs.purchasePrice * 0.17);
        }

        // Generate the study
        const study = generateStudy({
          purchasePrice:
            parseInt(
              String(studyInputs.purchasePrice).replace(/\D/g, ""),
              10
            ) || tier1Data.purchasePrice,
          closingCosts:
            parseInt(
              String(studyInputs.closingCosts || "0").replace(/\D/g, ""),
              10
            ) || 0,
          landValue,
          placedInServiceDate: pisDate,
          acquisitionDate: acqDate,
          ownerName: studyInputs.ownerName || "",
          ownerEntity: studyInputs.ownerEntity || "",
          propertyAddress:
            studyInputs.address || tier1Data.address || "Property Address",
          propertyType: studyInputs.propertyType || tier1Data.propertyType,
          sqft: studyInputs.sqft || tier1Data.sqft,
          beds: studyInputs.beds || tier1Data.beds,
          baths: studyInputs.baths || tier1Data.baths,
          yearBuilt: studyInputs.yearBuilt || tier1Data.yearBuilt,
          isFurnished: studyInputs.isFurnished !== false,
          materialParticipation: studyInputs.materialParticipation || {
            hours: "500+",
            usesPropertyManager: "no",
          },
          wizardAnswers: studyInputs.wizardAnswers || {},
          taxBracket: studyInputs.taxBracket || 32,
        });

        // Assemble the full report
        const report = assembleReport(study, {
          photos: studyInputs.photos || [],
          attestation: studyInputs.attestation || {},
          amenities: studyInputs.amenities || [],
          renovations: studyInputs.renovations || [],
        });

        const studyPayload = { study, report, createdAt: new Date().toISOString() };

        // Persist study to Supabase (fire-and-forget for UI, but capture studyId)
        const propertyId = searchParams.get("propertyId") || null;
        let savedStudyId = null;
        try {
          const saveRes = await fetch("/api/study/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              propertyId,
              studyData: study,
              reportData: report,
              wizardInputs: studyInputs,
              attestation: studyInputs.attestation || null,
            }),
          });
          const saveData = await saveRes.json();
          if (saveData.studyId) {
            savedStudyId = saveData.studyId;
            studyPayload.studyId = savedStudyId;
          }
        } catch (saveErr) {
          console.warn("Could not save study to Supabase:", saveErr);
        }

        // Also cache in sessionStorage as fallback
        try {
          sessionStorage.setItem(
            "abode_latest_study",
            JSON.stringify({ ...studyPayload, study_data: study })
          );
        } catch (e) {
          console.warn("Could not store study in sessionStorage:", e);
        }

        setStudyResult(studyPayload);

        // Send study-complete email (fire-and-forget — don't block UI)
        const totalComponents =
          (study.allocation.fiveYear?.components?.length || 0) +
          (study.allocation.sevenYear?.components?.length || 0) +
          (study.allocation.fifteenYear?.components?.length || 0);
        fetch("/api/email/study-complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            propertyAddress: study.property?.propertyAddress || tier1Data.address || "",
            firstYearDeduction: study.depreciation?.totalFirstYearDeduction || 0,
            taxSavings: Math.round((study.depreciation?.totalFirstYearDeduction || 0) * 0.32),
            totalComponents,
          }),
        }).catch(() => {}); // never surface email errors to user
      } catch (err) {
        console.error("Study generation failed:", err);
        alert("Something went wrong generating your study. Please try again.");
      } finally {
        setGenerating(false);
      }
    },
    [tier1Data, router]
  );

  // ─── Payment gate — redirect to details if not paid ──────────────────────
  // Only enforce in production-like envs; dev can bypass with ?paid=1
  if (!isPaid && !studyResult && !generating) {
    return (
      <div className="quiz-shell">
        <div className="quiz-header">
          <Link href="/" className="quiz-logo"><AbodeLogo /></Link>
        </div>
        <div className="quiz-body" style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: "var(--space-3)" }}>
          <h2 className="h2-component">Payment required</h2>
          <p style={{ color: "var(--dust)", fontSize: 15, maxWidth: 420, margin: "0 auto" }}>
            You need to complete checkout before starting your study.
          </p>
          <Link href="/quiz/details" className="btn btn-primary btn-lg" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            Back to My Estimate
          </Link>
        </div>
      </div>
    );
  }

  // ─── Post-generation — study is complete ──────────────────────────────────
  if (studyResult) {
    const s = studyResult.study;
    const totalComponents =
      s.allocation.fiveYear.components.length +
      s.allocation.sevenYear.components.length +
      s.allocation.fifteenYear.components.length;
    const totalReclassPercent = Math.round(
      s.allocation.fiveYear.percent +
      s.allocation.sevenYear.percent +
      s.allocation.fifteenYear.percent
    );

    return (
      <div className="quiz-shell quiz-results-shell">
        <div className="quiz-header">
          <Link href="/" className="quiz-logo"><AbodeLogo /></Link>
        </div>
        <div
          className="quiz-body"
          style={{ alignItems: "center", justifyContent: "center", textAlign: "center", gap: "var(--space-3)", padding: "var(--space-6) var(--space-3)" }}
        >
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--turq-bg)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
            <span style={{ fontSize: 32 }}>✓</span>
          </div>

          <div>
            <h1 className="h2-component" style={{ marginBottom: "var(--space-1)" }}>Your study is complete</h1>
            <p style={{ color: "var(--dust)", fontSize: 15, maxWidth: 480, margin: "0 auto", lineHeight: 1.6 }}>
              IRS-grade cost segregation study generated for{" "}
              <strong>{s.property.propertyAddress || "your property"}</strong>.
            </p>
          </div>

          {/* Key numbers */}
          <div
            style={{
              background: "var(--surface)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              maxWidth: 420,
              width: "100%",
              margin: "0 auto",
              textAlign: "left",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "var(--space-3)",
            }}
          >
            {[
              { label: "Year 1 Deduction", value: `$${s.depreciation.totalFirstYearDeduction.toLocaleString()}`, highlight: true },
              { label: "Reclassified", value: `${totalReclassPercent}%` },
              { label: "Components", value: totalComponents },
              { label: "Reconciled", value: s.reconciliation.isReconciled ? "✓ Yes" : "⚠ Check" },
            ].map(({ label, value, highlight }) => (
              <div key={label}>
                <div style={{ fontSize: 12, color: "var(--dust)", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: highlight ? "var(--turq)" : "var(--ink)" }}>{value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", maxWidth: 400, width: "100%", margin: "0 auto" }}>
            <Link
              href={studyResult.studyId ? `/app/studies/${studyResult.studyId}` : "/app/dashboard"}
              className="btn btn-primary btn-lg"
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              View Your Study <ArrowRight size={18} />
            </Link>
            <Link href="/app/dashboard" className="btn btn-subtle" style={{ width: "100%", justifyContent: "center", fontSize: 13 }}>
              Go to Dashboard
            </Link>
          </div>

          <p style={{ color: "var(--dust)", fontSize: 12 }}>
            Your report is saved to your dashboard. Questions?{" "}
            <a href="mailto:support@abodecostseg.com" style={{ color: "var(--turq)" }}>support@abodecostseg.com</a>
          </p>
        </div>
      </div>
    );
  }

  // ─── Generating state ─────────────────────────────────────────────────────
  if (generating) {
    return (
      <div className="quiz-shell">
        <div className="quiz-header">
          <Link href="/" className="quiz-logo">
            <AbodeLogo />
          </Link>
        </div>
        <div
          className="quiz-body"
          style={{
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: "var(--space-3)",
          }}
        >
          <div className="loading-spinner" />
          <h2 className="h3-component">Generating your study...</h2>
          <p style={{ color: "var(--dust)", fontSize: 14 }}>
            Analyzing {tier1Data.sqft > 0 ? `${tier1Data.sqft.toLocaleString()} sqft of` : "your"}{" "}
            property components, calculating MACRS schedules, and assembling
            your report.
          </p>
        </div>
      </div>
    );
  }

  // ─── Render the wizard ────────────────────────────────────────────────────
  return (
    <StudyWizard
      tier1Data={tier1Data}
      airbnb={airbnb}
      airbnbEnrichment={airbnbEnrichment}
      airbnbImages={airbnbImages}
      streetViewUrl={streetViewUrl}
      initialDetailSelections={initialDetailSelections}
      onComplete={handleComplete}
    />
  );
}
