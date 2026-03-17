"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewPropertyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    purchasePrice: "",
    yearBuilt: "",
    propertyType: "Short-Term Rental",
    squareFootage: "",
  });

  function handleChange(field, value) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // STUB: No real submission — redirect to dashboard with success
    alert("Property added! (This is a stub — no data is saved.)");
    router.push("/app/dashboard");
  }

  return (
    <div style={{ maxWidth: "560px" }}>
      <Link
        href="/app/properties"
        className="btn btn-subtle btn-sm"
        style={{ marginBottom: "var(--space-3)" }}
      >
        <ArrowLeft size={16} />
        Back to Properties
      </Link>

      <div className="eyebrow" style={{ marginBottom: "4px" }}>
        New Property
      </div>
      <h1 className="h2-section" style={{ marginBottom: "var(--space-5)" }}>
        Add a Property
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label className="label">Street Address</label>
          <input
            className="input"
            placeholder="123 Main St"
            value={formData.address}
            onChange={(e) => handleChange("address", e.target.value)}
            required
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--space-2)" }}>
          <div className="field">
            <label className="label">City</label>
            <input
              className="input"
              placeholder="La Quinta"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">State</label>
            <input
              className="input"
              placeholder="CA"
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              required
              maxLength={2}
            />
          </div>
          <div className="field">
            <label className="label">ZIP</label>
            <input
              className="input"
              placeholder="92253"
              value={formData.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
              required
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-2)" }}>
          <div className="field">
            <label className="label">Purchase Price</label>
            <input
              className="input"
              placeholder="$875,000"
              value={formData.purchasePrice}
              onChange={(e) => handleChange("purchasePrice", e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label className="label">Year Built</label>
            <input
              className="input"
              placeholder="2018"
              value={formData.yearBuilt}
              onChange={(e) => handleChange("yearBuilt", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="field">
          <label className="label">Square Footage</label>
          <input
            className="input"
            placeholder="2,850"
            value={formData.squareFootage}
            onChange={(e) => handleChange("squareFootage", e.target.value)}
            style={{ maxWidth: "200px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
          <button type="submit" className="btn btn-primary">
            Add Property
          </button>
          <Link href="/app/properties" className="btn btn-outline">
            Cancel
          </Link>
        </div>

        <p className="mono" style={{ color: "var(--dust)", marginTop: "var(--space-3)", fontSize: "10px" }}>
          {/* STUB: No actual property data is saved in this phase */}
          Property data is stored securely and used only for your cost segregation study.
        </p>
      </form>
    </div>
  );
}
