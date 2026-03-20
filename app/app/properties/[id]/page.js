"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Layers,
  Percent,
} from "lucide-react";
import Badge from "@/components/ui/Badge";
import { STUDY_PRICE_DISPLAY } from "@/lib/pricing";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n) {
  if (!n) return "—";
  return "$" + Math.round(n).toLocaleString("en-US");
}

function pct(n) {
  if (n == null) return "—";
  return `${Math.round(n)}%`;
}

function getUIState(property) {
  const status = property.study_status || "estimate";
  const step   = property.step || "results";
  if (status === "complete")   return "complete";
  if (status === "processing") return "processing";
  if (step === "details")      return "refined";
  return "estimate";
}

// ═══════════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════════

export default function PropertyDetailPage({ params }) {
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/properties/${params.id}`);
        if (!res.ok) {
          if (!cancelled) setError("Property not found.");
          return;
        }
        const { property: p } = await res.json();
        if (!cancelled) setProperty(p);

        // If complete, redirect to the study viewer
        const uiState = p ? getUIState(p) : null;
        if (uiState === "complete" && p.studyId) {
          router.replace(`/app/studies/${p.studyId}`);
          return;
        }
      } catch {
        if (!cancelled) setError("Unable to load property. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [params.id, router]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <Link href="/app/properties" className="btn btn-subtle btn-sm">
            <ArrowLeft size={16} /> Properties
          </Link>
        </div>
        <SkeletonBlock h={24} w="55%" mb={12} />
        <SkeletonBlock h={14} w="40%" mb={32} />
        <SkeletonBlock h={120} mb={16} />
        <SkeletonBlock h={180} />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: "var(--space-3)" }}>
          <Link href="/app/properties" className="btn btn-subtle btn-sm">
            <ArrowLeft size={16} /> Properties
          </Link>
        </div>
        <div className="card" style={{ padding: "var(--space-5)", textAlign: "center" }}>
          <AlertTriangle size={32} style={{ color: "var(--adobe)", marginBottom: "var(--space-2)" }} />
          <h2 className="h2-section" style={{ marginBottom: 8 }}>Property Not Found</h2>
          <p style={{ color: "var(--dust)", fontSize: 14, marginBottom: "var(--space-3)" }}>
            {error || "This property could not be loaded."}
          </p>
          <Link href="/app/properties" className="btn btn-primary btn-sm">
            Back to Properties
          </Link>
        </div>
      </div>
    );
  }

  const uiState = getUIState(property);

  // Normalise fields
  const displayAddress = property.airbnb_title || property.address || "Property";
  const fullAddress    = [property.address, property.city, property.state].filter(Boolean).join(", ");
  const price          = property.purchase_price;
  const yearBuilt      = property.year_built;
  const sqft           = property.sqft;
  const beds           = property.beds;
  const baths          = property.baths;
  const type           = property.property_type;
  const use            = property.property_use;
  const estimate       = property.estimate;

  const stateBadge = {
    estimate:   { label: "Estimate",   variant: "dust" },
    refined:    { label: "Estimate",   variant: "dust" },
    processing: { label: "Generating", variant: "adobe" },
    complete:   { label: "Complete",   variant: "turq" },
  }[uiState];

  return (
    <div style={{ maxWidth: 640 }}>
      {/* ── Back ── */}
      <Link href="/app/properties" className="btn btn-subtle btn-sm" style={{ marginBottom: "var(--space-3)" }}>
        <ArrowLeft size={16} /> Properties
      </Link>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-2)", marginBottom: "var(--space-4)" }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", margin: "0 0 4px" }}>
            {displayAddress}
          </h1>
          {displayAddress !== fullAddress && fullAddress && (
            <div style={{ fontSize: 13, color: "var(--dust)" }}>{fullAddress}</div>
          )}
        </div>
        <Badge variant={stateBadge.variant}>{stateBadge.label}</Badge>
      </div>

      {/* ── Processing State ── */}
      {uiState === "processing" && <ProcessingView />}

      {/* ── Estimate / Refined ── */}
      {(uiState === "estimate" || uiState === "refined") && (
        <EstimateView
          property={property}
          estimate={estimate}
          price={price}
          yearBuilt={yearBuilt}
          sqft={sqft}
          beds={beds}
          baths={baths}
          type={type}
          use={use}
          uiState={uiState}
        />
      )}
    </div>
  );
}


// ─── Processing View ──────────────────────────────────────────────────────────

function ProcessingView() {
  return (
    <div className="card" style={{ padding: "var(--space-4)", textAlign: "center" }}>
      <Loader2 size={36} style={{ color: "var(--turq)", marginBottom: "var(--space-2)", animation: "spin 1.2s linear infinite" }} />
      <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)", margin: "0 0 8px" }}>
        Your study is being prepared
      </h2>
      <p style={{ fontSize: 13, color: "var(--dust)", lineHeight: 1.6, margin: "0 0 var(--space-3)" }}>
        Our team is generating your MACRS cost segregation report. You&apos;ll receive an email as soon as it&apos;s ready.
      </p>
      <a href="mailto:hello@abodecostseg.com" className="btn btn-subtle btn-sm">
        Questions? Contact us
      </a>
    </div>
  );
}


// ─── Estimate View ────────────────────────────────────────────────────────────

function EstimateView({ property, estimate, price, yearBuilt, sqft, beds, baths, type, use, uiState }) {
  const deduction  = estimate?.first_year_deduction;
  const savings    = estimate?.first_year_savings || (deduction ? Math.round(deduction * 0.32) : null);
  const annual     = estimate?.standard_annual_deduction;
  const multiplier = estimate?.year_one_multiplier;
  const conservative = estimate?.conservative;
  const optimistic   = estimate?.optimistic;
  const landRatio    = estimate?.land_ratio;
  const bonusRate    = estimate?.bonus_rate;

  function fmt(n) {
    if (!n) return "—";
    return "$" + Math.round(n).toLocaleString("en-US");
  }

  return (
    <>
      {/* ── Estimate summary (hero) ── */}
      {deduction ? (
        <div className="card-dark" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)" }}>
          <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.1em" }}>
            ESTIMATED YEAR 1 DEDUCTION
          </div>
          <div className="mono-value" style={{ fontSize: 36, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            ~{fmt(deduction)}
          </div>
          {conservative && optimistic && (
            <div className="mono" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>
              Range: {fmt(conservative)} – {fmt(optimistic)}
            </div>
          )}

          {savings && (
            <div style={{ marginTop: "var(--space-3)", paddingTop: "var(--space-2)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="mono" style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 4, letterSpacing: "0.1em" }}>
                ESTIMATED TAX SAVINGS
              </div>
              <div className="mono-value" style={{ fontSize: 22, fontWeight: 700, color: "var(--turq-light)" }}>
                ~{fmt(savings)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: "var(--space-4)", marginBottom: "var(--space-3)", textAlign: "center" }}>
          <TrendingUp size={28} style={{ color: "var(--turq)", marginBottom: 8 }} />
          <p style={{ fontSize: 14, color: "var(--dust)", margin: 0 }}>
            No estimate yet.{" "}
            <Link href="/quiz" style={{ color: "var(--turq)", textDecoration: "none" }}>Run the quiz</Link>{" "}
            to generate your estimate.
          </p>
        </div>
      )}

      {/* ── Estimate breakdown ── */}
      {estimate && (
        <div className="card" style={{ padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
          <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>Estimate Breakdown</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
            {price && (
              <StatRow icon={DollarSign} label="Purchase Price" value={fmt(price)} />
            )}
            {landRatio != null && (
              <StatRow icon={Percent} label="Land Ratio" value={pct(landRatio)} />
            )}
            {bonusRate != null && (
              <StatRow icon={TrendingUp} label="Bonus Depreciation" value={pct(bonusRate * 100)} />
            )}
            {annual && (
              <StatRow icon={Layers} label="Standard Annual" value={fmt(annual)} />
            )}
            {multiplier && (
              <StatRow icon={TrendingUp} label="Year 1 vs. Standard" value={`${multiplier.toFixed(1)}×`} />
            )}
          </div>
          {multiplier && (
            <p style={{ fontSize: 12, color: "var(--dust)", marginTop: "var(--space-2)", marginBottom: 0, lineHeight: 1.5 }}>
              Cost segregation accelerates ~{multiplier.toFixed(1)}× more depreciation in year one vs. straight-line.
            </p>
          )}
        </div>
      )}

      {/* ── Property details ── */}
      <div className="card" style={{ padding: "var(--space-3)", marginBottom: "var(--space-3)" }}>
        <div className="ui-label" style={{ marginBottom: "var(--space-2)" }}>Property Details</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
          {type     && <DetailRow label="Type"        value={type} />}
          {use      && <DetailRow label="Use"         value={use} />}
          {yearBuilt && <DetailRow label="Year Built" value={yearBuilt} />}
          {sqft     && <DetailRow label="Sq. Ft."     value={sqft.toLocaleString()} />}
          {beds     && <DetailRow label="Beds"        value={beds} />}
          {baths    && <DetailRow label="Baths"       value={baths} />}
        </div>
      </div>

      {/* ── CTAs ── */}
      <div className="card" style={{ padding: "var(--space-3)" }}>
        <div className="ui-label" style={{ marginBottom: 8 }}>Next Step</div>

        {uiState === "estimate" && (
          <>
            <p style={{ fontSize: 13, color: "var(--dust)", lineHeight: 1.6, margin: "0 0 var(--space-2)" }}>
              Refine your estimate by confirming property details, then order a full IRS-grade cost seg study.
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Link href={property.details_url || "/quiz"} className="btn btn-subtle btn-sm">
                <ChevronRight size={14} />
                Refine Estimate
              </Link>
              <Link href={`/api/checkout/session?propertyId=${property.id}`} className="btn btn-primary btn-sm">
                Order Full Study — {STUDY_PRICE_DISPLAY}
              </Link>
            </div>
          </>
        )}

        {uiState === "refined" && (
          <>
            <p style={{ fontSize: 13, color: "var(--dust)", lineHeight: 1.6, margin: "0 0 var(--space-2)" }}>
              Your estimate is refined. Order a full IRS-grade cost segregation study with complete MACRS analysis.
            </p>
            <Link href={`/api/checkout/session?propertyId=${property.id}`} className="btn btn-primary btn-sm">
              Order Full Study — {STUDY_PRICE_DISPLAY}
            </Link>
          </>
        )}
      </div>
    </>
  );
}


// ─── Small helpers ────────────────────────────────────────────────────────────

function StatRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
      <Icon size={14} style={{ color: "var(--turq)", marginTop: 2, flexShrink: 0 }} />
      <div>
        <div className="mono" style={{ fontSize: 10, color: "var(--dust)", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{value}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <div className="mono" style={{ fontSize: 10, color: "var(--dust)", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 500, color: "var(--ink)" }}>{value}</div>
    </div>
  );
}

function SkeletonBlock({ h, w = "100%", mb = 0 }) {
  return (
    <div style={{
      height: h, width: w,
      background: "var(--surface-2)",
      borderRadius: "var(--radius-sm)",
      marginBottom: mb,
      animation: "pulse 1.5s ease-in-out infinite",
    }} />
  );
}
