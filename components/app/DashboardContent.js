"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  ArrowRight,
  Home,
  FileText,
  DollarSign,
  TrendingUp,
  Building2,
} from "lucide-react";
import Badge from "@/components/ui/Badge";

/* ── Static Data ── */

function buildSummaryStats(properties, study) {
  const completeCount = properties.filter(
    (p) => p.studyStatus === "complete" || p.step === "purchased"
  ).length;

  // Calculate totals from saved property estimates
  let totalSavings = 0;
  let totalDeduction = 0;
  let estimateCount = 0;
  for (const p of properties) {
    // Support both DB (snake_case) and legacy localStorage (camelCase) shapes
    const deduction = p.estimate?.first_year_deduction || p.estimate?.firstYearDeduction;
    const savings = p.estimate?.first_year_savings || p.estimate?.firstYearSavings;
    if (deduction) {
      totalDeduction += deduction;
      totalSavings += savings || Math.round(deduction * 0.32);
      estimateCount++;
    }
  }

  // Fall back to mock study data if no saved estimates
  if (estimateCount === 0 && study) {
    totalSavings = study.estimatedTaxSavings;
    totalDeduction = study.firstYearDeduction;
  }

  const avgDeduction = estimateCount > 0 ? Math.round(totalDeduction / estimateCount) : totalDeduction;

  return [
    { label: "Properties", value: String(properties.length), icon: Home },
    { label: "Studies Complete", value: String(completeCount), icon: FileText },
    {
      label: "Est. Tax Savings",
      value: totalSavings ? `$${totalSavings.toLocaleString()}` : "$0",
      icon: DollarSign,
    },
    {
      label: "Avg. Deduction",
      value: avgDeduction ? `$${avgDeduction.toLocaleString()}` : "$0",
      icon: TrendingUp,
    },
  ];
}

/** Derive recent activity from real property data */
function buildActivity(properties) {
  if (!properties || properties.length === 0) return [];
  const items = [];
  for (const p of properties) {
    const addr = p.airbnb_title || p.airbnbTitle || p.address || "Property";
    const step = p.study_status || p.step || p.studyStatus || "estimate";
    if (step === "complete" || step === "purchased") {
      items.push({ id: `act_${p.id}_complete`, text: `Cost seg study completed for ${addr}`, type: "complete", sortDate: p.updated_at || p.created_at });
    } else if (step === "processing") {
      items.push({ id: `act_${p.id}_processing`, text: `Study in progress for ${addr}`, type: "processing", sortDate: p.updated_at || p.created_at });
    } else {
      items.push({ id: `act_${p.id}_added`, text: `Property added: ${addr}`, type: "info", sortDate: p.created_at || p.updated_at });
    }
  }
  items.sort((a, b) => (b.sortDate || "").localeCompare(a.sortDate || ""));
  return items.slice(0, 5).map((item) => ({
    ...item,
    time: item.sortDate ? formatRelative(item.sortDate) : "",
  }));
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

/* ── Component ── */

export default function DashboardContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [dbProperties, setDbProperties] = useState(null); // null = not loaded yet

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        // 1. Check session
        const sessionRes = await fetch("/api/auth/session");
        if (!sessionRes.ok || cancelled) return;
        const sessionData = await sessionRes.json();
        if (!sessionData?.user) return;
        if (!cancelled) setUser(sessionData.user);

        // 2. Load properties from Supabase
        const propsRes = await fetch("/api/properties");
        if (!cancelled && propsRes.ok) {
          const propsData = await propsRes.json();
          setDbProperties(propsData.properties || []);
        }
      } catch {
        // Treated as unauthenticated / empty
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
          setLoading(false);
        }
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="dash-loading" role="status" aria-label="Loading dashboard">
        <div className="dash-spinner" />
      </div>
    );
  }

  if (authChecked && !user) {
    return <SignInPrompt />;
  }

  const properties = dbProperties || [];
  const summaryStats = buildSummaryStats(
    properties.map((p) => ({
      ...p,
      estimate: p.estimate,
      studyStatus: p.study_status || p.step || "estimate",
    })),
    null
  );
  const hasProperties = properties.length > 0;
  const activity = buildActivity(properties);

  return (
    <div>
      {/* Header */}
      <div className="dash-header">
        <div className="eyebrow">Dashboard</div>
        <h1 className="dash-title">Welcome back, {user.name}</h1>
      </div>

      {/* Summary stats */}
      <div className="dash-stats">
        {summaryStats.map((stat) => (
          <div key={stat.label} className="stat-card dash-stat-card">
            <div className="dash-stat-header">
              <stat.icon size={16} className="dash-stat-icon" strokeWidth={1.5} />
              <span className="dash-stat-label">{stat.label}</span>
            </div>
            <div className="dash-stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Properties */}
      <section className="dash-section">
        <div className="dash-section-header">
          <h2 className="h3-component">Your Properties</h2>
          <Link href="/app/properties/new" className="btn btn-primary btn-sm">
            <Plus size={16} />
            Add Property
          </Link>
        </div>

        {hasProperties ? (
          <div className="dash-property-list">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>

      {/* Recent Activity */}
      {activity.length > 0 && (
        <section className="dash-section">
          <div className="dash-section-header">
            <h2 className="h3-component">Recent Activity</h2>
          </div>
          <div className="dash-activity-list">
            {activity.map((item) => (
              <div key={item.id} className="dash-activity-item">
                <div className={`dash-activity-dot ${item.type}`} aria-hidden="true" />
                <div className="dash-activity-content">
                  <div className="dash-activity-text">{item.text}</div>
                  <div className="dash-activity-time">{item.time}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Sub-components ── */

function PropertyCard({ property }) {
  if (!property) return null;

  // Determine status — DB uses study_status + step, mocks use studyStatus
  const step = property.study_status || property.step || property.studyStatus || "estimate";
  const statusMap = {
    results: { label: "Estimate", variant: "dust" },
    details: { label: "In Progress", variant: "adobe" },
    purchased: { label: "Complete", variant: "turq" },
    estimate: { label: "Estimate", variant: "dust" },
    complete: { label: "Complete", variant: "turq" },
    processing: { label: "Processing", variant: "adobe" },
    pending: { label: "Pending", variant: "dust" },
  };
  const status = statusMap[step] || statusMap.estimate;

  // Determine link
  let href = `/app/properties/${property.id}`;
  if (property.detailsUrl || property.details_url) {
    href = property.detailsUrl || property.details_url;
  } else if (property.studyId) {
    href = `/app/studies/${property.studyId}`;
  }

  // Support both DB (snake_case) and mock (camelCase) fields
  const displayAddress = property.airbnb_title || property.airbnbTitle || property.address || "Property";
  const purchasePrice = property.purchase_price || property.purchasePrice;
  const displayPrice = purchasePrice ? `$${Number(purchasePrice).toLocaleString()}` : "—";
  const yearBuilt = property.year_built || property.yearBuilt;
  const propertyType = property.property_type || property.propertyType;

  // Show estimate value if available (DB = snake_case, legacy = camelCase)
  const deduction = property.estimate?.first_year_deduction || property.estimate?.firstYearDeduction;

  return (
    <Link href={href} className="card dash-property-card">
      <div className="dash-property-info">
        <div className="dash-property-address">{displayAddress}</div>
        <div className="dash-property-meta">
          {displayPrice}
          {yearBuilt ? ` · Built ${yearBuilt}` : ""}
          {propertyType ? ` · ${propertyType}` : ""}
        </div>
        {deduction && (
          <div className="dash-property-deduction">
            Est. Year 1: ${deduction.toLocaleString()}
          </div>
        )}
      </div>

      <div className="dash-property-actions">
        <Badge variant={status.variant}>
          {status.label}
        </Badge>
        <ArrowRight size={16} className="dash-property-arrow" />
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="dash-empty">
      <Building2 size={40} className="dash-empty-icon" aria-hidden="true" />
      <h3 className="dash-empty-title">No properties yet</h3>
      <p className="dash-empty-text">
        Start your first cost segregation estimate and discover your potential
        tax savings.
      </p>
      <Link href="/quiz" className="btn btn-primary">
        Get Your Free Estimate
      </Link>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="dash-signin">
      <Building2
        size={48}
        style={{ color: "var(--turq)", marginBottom: "var(--space-3)" }}
        aria-hidden="true"
      />
      <h1 className="dash-signin-title">Sign in to view your dashboard</h1>
      <p className="dash-signin-text">
        Get a free cost segregation estimate for your short-term rental property
        and see how much you could save on taxes.
      </p>
      <Link href="/quiz" className="btn btn-primary btn-lg">
        Get Started
      </Link>
    </div>
  );
}
