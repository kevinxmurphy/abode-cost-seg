"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Check, Info, X, MapPin, Search, Home, ChevronDown, Link2, Star, Loader2 } from "lucide-react";
import { parseAirbnbUrl, isValidAirbnbInput } from "@/lib/airbnbParser";
import {
  clientCacheGet,
  clientCacheSet,
  buildPropertyCacheKey,
  buildAirbnbCacheKey,
  sessionSave,
} from "@/lib/propertyCache";

export default function QuizStep({
  step,
  value,
  onChange,
  onAutoAdvance,
  direction,
  stepNumber,
  showTooltip,
  onToggleTooltip,
  answers,
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(false);
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [step.id]);

  // Keyboard number shortcuts for option steps
  useEffect(() => {
    if (step.type !== "option") return;
    function handleKeyDown(e) {
      const num = parseInt(e.key);
      if (num >= 1 && num <= step.options.length) {
        const opt = step.options[num - 1];
        const val = typeof opt === "object" ? opt.value : opt;
        onAutoAdvance(val);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, onAutoAdvance]);

  const animStyle = {
    opacity: mounted ? 1 : 0,
    transform: mounted
      ? "translateY(0)"
      : direction === "forward"
        ? "translateY(20px)"
        : "translateY(-20px)",
    transition: "all 400ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div ref={containerRef} style={animStyle}>
      {/* Step number badge */}
      <div className="quiz-step-badge">
        {stepNumber} →
      </div>

      {/* Question */}
      <h2 className="quiz-question">{step.question}</h2>

      {/* Subtitle */}
      {step.subtitle && (
        <p className="quiz-subtitle">{step.subtitle}</p>
      )}

      {/* Tooltip toggle */}
      {step.tooltip && (
        <div className="quiz-tooltip-wrapper">
          <button
            className={`quiz-tooltip-toggle ${showTooltip ? "active" : ""}`}
            onClick={onToggleTooltip}
            type="button"
          >
            <Info size={14} />
            {showTooltip ? "Hide details" : "Why do we ask this?"}
          </button>
          {showTooltip && (
            <div className="quiz-tooltip-content">
              <button className="quiz-tooltip-close" onClick={onToggleTooltip}>
                <X size={14} />
              </button>
              {step.tooltip}
            </div>
          )}
        </div>
      )}

      {/* Input types */}
      {step.type === "option" && (
        <>
          {step.autoDetectFrom && answers?._purchaseYearAutoDetected && (
            <div style={{
              marginBottom: "var(--space-3)",
              padding: "10px 14px",
              background: "var(--cream)",
              borderRadius: "var(--radius-sm)",
              fontSize: "13px",
              color: "var(--ink-mid)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}>
              <Info size={14} style={{ flexShrink: 0, color: "var(--turq)" }} />
              <span>
                Based on sale recorded{" "}
                {new Date(answers._purchaseYearAutoDetected + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          <OptionList
            options={step.options}
            value={value}
            onChange={onAutoAdvance}
          />
        </>
      )}

      {step.type === "multi" && (
        <MultiSelect
          options={step.options}
          value={value || []}
          onChange={onChange}
        />
      )}

      {step.type === "address" && (
        <AddressInput
          value={value || {}}
          onChange={onChange}
          placeholder={step.placeholder}
        />
      )}

      {step.type === "airbnb-url" && (
        <AirbnbUrlInput
          value={value}
          onChange={onChange}
          onAutoAdvance={onAutoAdvance}
          placeholder={step.placeholder}
          propertyAddress={answers?.propertyAddress}
        />
      )}

      {step.type === "currency" && (
        <CurrencyInput
          value={value || ""}
          onChange={onChange}
          placeholder={step.placeholder}
          validation={step.validation}
          suggestedPrice={step.id === "purchasePrice" ? answers?.propertyAddress?.propertyDetails?.lastSoldPrice : null}
          suggestedDate={step.id === "purchasePrice" ? answers?.propertyAddress?.propertyDetails?.lastSoldDate : null}
        />
      )}

      {step.type === "currency-option" && (
        <CurrencyOptionInput
          step={step}
          value={value || {}}
          onChange={onChange}
          onAutoAdvance={onAutoAdvance}
        />
      )}

      {step.type === "tax-bracket" && (
        <TaxBracketInput
          options={step.options}
          value={value || ""}
          onChange={onChange}
          onAutoAdvance={onAutoAdvance}
        />
      )}
    </div>
  );
}

function OptionList({ options, value, onChange }) {
  return (
    <div className="quiz-options-grid">
      {options.map((opt, i) => {
        const isObject = typeof opt === "object";
        const optValue = isObject ? opt.value : opt;
        const optLabel = isObject ? opt.label : opt;
        const optIcon = isObject ? opt.icon : null;
        const optBadge = isObject ? opt.badge : null;
        const optRecommended = isObject ? opt.recommended : false;
        const isSelected = value === optValue;

        return (
          <button
            key={optValue}
            className={`quiz-option ${isSelected ? "selected" : ""} ${optRecommended ? "recommended" : ""}`}
            onClick={() => onChange(optValue)}
          >
            <span className="quiz-option-key">{i + 1}</span>
            {optIcon && <span className="quiz-option-icon">{optIcon}</span>}
            <span className="quiz-option-label">{optLabel}</span>
            {optBadge && <span className="quiz-option-badge">{optBadge}</span>}
            {optRecommended && <span className="quiz-option-rec">Most common</span>}
            <span className="quiz-option-check">
              {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiSelect({ options, value, onChange }) {
  function toggle(opt) {
    const optValue = typeof opt === "object" ? opt.value : opt;
    if (optValue === "none") {
      onChange(value.includes("none") ? [] : ["none"]);
      return;
    }
    const filtered = value.filter((v) => v !== "none");
    if (filtered.includes(optValue)) {
      onChange(filtered.filter((v) => v !== optValue));
    } else {
      onChange([...filtered, optValue]);
    }
  }

  return (
    <div className="quiz-options-grid multi">
      {options.map((opt) => {
        const isObject = typeof opt === "object";
        const optValue = isObject ? opt.value : opt;
        const optLabel = isObject ? opt.label : opt;
        const optIcon = isObject ? opt.icon : null;
        const isSelected = value.includes(optValue);

        return (
          <button
            key={optValue}
            className={`quiz-option ${isSelected ? "selected" : ""}`}
            onClick={() => toggle(opt)}
          >
            <span className="quiz-option-checkbox">
              {isSelected && <Check size={12} color="#fff" strokeWidth={3} />}
            </span>
            {optIcon && <span className="quiz-option-icon">{optIcon}</span>}
            <span className="quiz-option-label">{optLabel}</span>
          </button>
        );
      })}
      <p className="quiz-multi-hint">Select all that apply</p>
    </div>
  );
}

/* ─── Address Autocomplete + Property Confirmation ─── */
function AddressInput({ value, onChange, placeholder }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(value.fullAddress ? value : null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const [manualMode, setManualMode] = useState(false);
  const [manualFields, setManualFields] = useState({ address: "", city: "", state: "", zip: "" });
  // Property lookup state
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const autocompleteTimer = useRef(null);

  useEffect(() => {
    if (inputRef.current && !selectedAddress && !manualMode) inputRef.current.focus();
  }, [selectedAddress, manualMode]);

  // Fetch autocomplete suggestions from Google Places via our API proxy
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    // Debounce — wait 250ms after last keystroke
    clearTimeout(autocompleteTimer.current);
    autocompleteTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        const preds = data.predictions || [];

        // Map Google predictions to our suggestion format
        const mapped = preds.map((p) => ({
          placeId: p.placeId,
          address: p.mainText,
          subtitle: p.secondaryText,
          description: p.description,
        }));

        setSuggestions(mapped);
        setShowDropdown(true);
        setHighlightIdx(-1);
      } catch {
        // API down — show dropdown with just manual entry option
        setSuggestions([]);
        setShowDropdown(true);
        setHighlightIdx(-1);
      }
    }, 250);

    return () => clearTimeout(autocompleteTimer.current);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Parse a free-form address string into components (best effort)
  function parseAddressString(raw) {
    const trimmed = raw.trim();
    // Try to match: "123 Main St, City, ST 12345" or "123 Main St, City, ST"
    const match = trimmed.match(/^(.+?),\s*(.+?),\s*([A-Za-z]{2})\s*(\d{5})?$/);
    if (match) {
      return { address: match[1].trim(), city: match[2].trim(), state: match[3].toUpperCase(), zip: (match[4] || "").trim() };
    }
    // Try: "123 Main St City ST 12345"
    const match2 = trimmed.match(/^(.+?)\s+([A-Za-z]+)\s+([A-Za-z]{2})\s+(\d{5})$/);
    if (match2) {
      return { address: match2[1].trim(), city: match2[2].trim(), state: match2[3].toUpperCase(), zip: match2[4].trim() };
    }
    // Fallback — use the whole string as the address
    return { address: trimmed, city: "", state: "", zip: "" };
  }

  async function handleSelect(suggestion) {
    setShowDropdown(false);
    setQuery("");
    setManualMode(false);
    setLookupError("");

    // If suggestion has a placeId, resolve full address components from Places API first
    let resolvedComponents = null;
    if (suggestion.placeId) {
      try {
        const res = await fetch(`/api/places/details?placeId=${suggestion.placeId}`);
        const data = await res.json();
        if (data.result && !data.fallback) {
          resolvedComponents = data.result;
        }
      } catch {
        // Places details failed — fall through to manual parse
      }
    }

    // Build address object from resolved components or raw suggestion
    const address = resolvedComponents?.address || suggestion.address || "";
    const city = resolvedComponents?.city || suggestion.city || "";
    const state = resolvedComponents?.state || suggestion.state || "";
    const zip = resolvedComponents?.zip || suggestion.zip || "";
    const fullAddress = resolvedComponents?.fullAddress ||
      `${address}, ${city}, ${state} ${zip}`.trim();

    // Set a provisional selected state immediately (with empty property details)
    // so the UI shows the property card right away, then fills in details
    const provisional = {
      address,
      city,
      state,
      zip,
      fullAddress,
      confirmed: false,
      propertyDetails: {
        beds: 0, baths: 0, sqft: 0, yearBuilt: 0, lotSqft: 0,
        assessedLand: 0, assessedImprovement: 0, propertyType: "Single Family",
        lastSoldPrice: 0, lastSoldDate: null, lat: null, lon: null,
      },
    };
    setSelectedAddress(provisional);
    onChange(provisional);

    // Trigger Zillow property lookup in background
    await lookupPropertyDetails({ address, city, state, zip, fullAddress });
  }

  async function lookupPropertyDetails({ address, city, state, zip, fullAddress }) {
    if (!address || !state) return;

    // Check client cache first (avoids API call if user revisits this step)
    const cacheKey = buildPropertyCacheKey(fullAddress || `${address} ${city} ${state} ${zip}`);
    const cached = clientCacheGet(cacheKey);
    if (cached) {
      const withCached = {
        address, city, state, zip, fullAddress,
        confirmed: false,
        propertyDetails: {
          beds: cached.beds || 0,
          baths: cached.baths || 0,
          sqft: cached.sqft || 0,
          yearBuilt: cached.yearBuilt || 0,
          lotSqft: cached.lotSqft || 0,
          assessedLand: cached.assessedLand || 0,
          assessedImprovement: cached.assessedImprovement || 0,
          propertyType: cached.propertyType || "Single Family",
          lastSoldPrice: cached.lastSoldPrice || 0,
          lastSoldDate: cached.lastSoldDate || null,
          lat: cached.lat || null,
          lon: cached.lon || null,
        },
        _zillow: cached,
      };
      setSelectedAddress(withCached);
      onChange(withCached);
      return;
    }

    setLookupLoading(true);
    try {
      const res = await fetch("/api/property/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, city, state, zip, fullAddress }),
      });
      const data = await res.json();

      if (data.property && data.source !== "not_configured") {
        const prop = data.property;

        // Cache in localStorage for reuse
        clientCacheSet(cacheKey, prop);

        // Also save to session for profile creation
        sessionSave("lastLookedUpProperty", prop);

        const enriched = {
          address, city, state, zip, fullAddress,
          confirmed: false,
          propertyDetails: {
            beds: prop.beds || 0,
            baths: prop.baths || 0,
            sqft: prop.sqft || 0,
            yearBuilt: prop.yearBuilt || 0,
            lotSqft: prop.lotSqft || 0,
            assessedLand: prop.assessedLand || 0,
            assessedImprovement: prop.assessedImprovement || 0,
            propertyType: prop.propertyType || "Single Family",
            lastSoldPrice: prop.lastSoldPrice || 0,
            lastSoldDate: prop.lastSoldDate || null,
            lat: prop.lat || null,
            lon: prop.lon || null,
          },
          _zillow: prop,
        };
        setSelectedAddress(enriched);
        onChange(enriched);
      }
      // If fallback: true or property: null, keep provisional (manual entry remains)
    } catch {
      // Network error — keep provisional, user can edit manually
    } finally {
      setLookupLoading(false);
    }
  }

  function handleFreeformSubmit() {
    // User typed an address that doesn't match our mock data — parse and accept it
    const parsed = parseAddressString(query);
    handleSelect(parsed);
  }

  function handleManualSubmit() {
    const { address, city, state, zip } = manualFields;
    if (!address.trim()) return;
    handleSelect({ address: address.trim(), city: city.trim(), state: state.trim().toUpperCase(), zip: zip.trim() });
  }

  function handleConfirm() {
    const confirmed = { ...selectedAddress, confirmed: true };
    if (isEditing) {
      confirmed.propertyDetails = { ...confirmed.propertyDetails, ...editData };
      setIsEditing(false);
    }
    setSelectedAddress(confirmed);
    onChange(confirmed);
  }

  function handleEditToggle() {
    if (isEditing) {
      handleConfirm();
    } else {
      setEditData({ ...selectedAddress.propertyDetails });
      setIsEditing(true);
    }
  }

  function handleChangeAddress() {
    setSelectedAddress(null);
    setQuery("");
    setManualMode(false);
    setManualFields({ address: "", city: "", state: "", zip: "" });
    onChange({});
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function handleKeyDown(e) {
    if (!showDropdown || suggestions.length === 0) {
      // If Enter is pressed with a query but no suggestions, submit freeform
      if (e.key === "Enter" && query.length >= 3) {
        e.preventDefault();
        e.stopPropagation();
        handleFreeformSubmit();
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (highlightIdx >= 0) {
        handleSelect(suggestions[highlightIdx]);
      } else if (query.length >= 3) {
        handleFreeformSubmit();
      }
    }
  }

  // ─── Manual entry form ───
  if (manualMode) {
    return (
      <div className="quiz-address-wrapper">
        <div className="quiz-manual-address-form">
          <div className="quiz-manual-field">
            <label className="quiz-property-label">Street Address</label>
            <input
              type="text"
              className="quiz-address-input"
              value={manualFields.address}
              onChange={(e) => setManualFields({ ...manualFields, address: e.target.value })}
              placeholder="123 Main St"
              autoFocus
              autoComplete="off"
            />
          </div>
          <div className="quiz-manual-row">
            <div className="quiz-manual-field" style={{ flex: 2 }}>
              <label className="quiz-property-label">City</label>
              <input
                type="text"
                className="quiz-address-input"
                value={manualFields.city}
                onChange={(e) => setManualFields({ ...manualFields, city: e.target.value })}
                placeholder="City"
                autoComplete="off"
              />
            </div>
            <div className="quiz-manual-field" style={{ flex: 1 }}>
              <label className="quiz-property-label">State</label>
              <input
                type="text"
                className="quiz-address-input"
                value={manualFields.state}
                onChange={(e) => setManualFields({ ...manualFields, state: e.target.value })}
                placeholder="ST"
                maxLength={2}
                autoComplete="off"
              />
            </div>
            <div className="quiz-manual-field" style={{ flex: 1 }}>
              <label className="quiz-property-label">ZIP</label>
              <input
                type="text"
                className="quiz-address-input"
                value={manualFields.zip}
                onChange={(e) => setManualFields({ ...manualFields, zip: e.target.value })}
                placeholder="00000"
                maxLength={5}
                inputMode="numeric"
                autoComplete="off"
              />
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{ marginTop: "var(--space-2)", width: "100%" }}
            onClick={handleManualSubmit}
            disabled={!manualFields.address.trim()}
          >
            <Search size={16} />
            Look Up Property
          </button>
        </div>
        <button
          className="quiz-tooltip-toggle"
          style={{ marginTop: "var(--space-2)" }}
          onClick={() => setManualMode(false)}
          type="button"
        >
          Back to address search
        </button>
      </div>
    );
  }

  // ─── Property confirmation card ───
  if (selectedAddress) {
    const pd = isEditing ? editData : selectedAddress.propertyDetails;
    const hasData = pd && pd.sqft > 0;
    const dataSource = selectedAddress._zillow?.source === "zillow"
      ? "Zillow / Public records"
      : "Public records";

    return (
      <div className="quiz-address-wrapper">
        <div className="quiz-property-card">
          {/* Street View Placeholder */}
          <div className="quiz-property-streetview">
            {lookupLoading ? (
              <Loader2 size={24} className="quiz-airbnb-spinner" />
            ) : (
              <Home size={32} strokeWidth={1.5} />
            )}
            <span style={{ fontWeight: 500, color: "var(--ink-mid)" }}>
              {selectedAddress.fullAddress}
            </span>
            <span style={{ fontSize: 11, opacity: 0.6 }}>
              {lookupLoading
                ? "Looking up property records..."
                : "Street view — available with full study"}
            </span>
          </div>

          <div className="quiz-property-details">
            {hasData ? (
              <>
                <div className="quiz-property-source">
                  <MapPin size={12} />
                  {dataSource} — {selectedAddress.city}
                </div>

                <div className="quiz-property-grid">
                  <div>
                    <div className="quiz-property-label">Beds</div>
                    {isEditing ? (
                      <input type="number" className="quiz-property-edit-input" value={editData.beds || ""}
                        onChange={(e) => setEditData({ ...editData, beds: parseInt(e.target.value) || 0 })} />
                    ) : (
                      <div className="quiz-property-value">{pd.beds}</div>
                    )}
                  </div>
                  <div>
                    <div className="quiz-property-label">Baths</div>
                    {isEditing ? (
                      <input type="number" step="0.5" className="quiz-property-edit-input" value={editData.baths || ""}
                        onChange={(e) => setEditData({ ...editData, baths: parseFloat(e.target.value) || 0 })} />
                    ) : (
                      <div className="quiz-property-value">{pd.baths}</div>
                    )}
                  </div>
                  <div>
                    <div className="quiz-property-label">Sq Ft</div>
                    {isEditing ? (
                      <input type="number" className="quiz-property-edit-input" value={editData.sqft || ""}
                        onChange={(e) => setEditData({ ...editData, sqft: parseInt(e.target.value) || 0 })} />
                    ) : (
                      <div className="quiz-property-value">{pd.sqft?.toLocaleString()}</div>
                    )}
                  </div>
                  <div>
                    <div className="quiz-property-label">Year Built</div>
                    {isEditing ? (
                      <input type="number" className="quiz-property-edit-input" value={editData.yearBuilt || ""}
                        onChange={(e) => setEditData({ ...editData, yearBuilt: parseInt(e.target.value) || 0 })} />
                    ) : (
                      <div className="quiz-property-value">{pd.yearBuilt}</div>
                    )}
                  </div>
                  <div>
                    <div className="quiz-property-label">Type</div>
                    {isEditing ? (
                      <select className="quiz-property-edit-input" value={editData.propertyType || "Single Family"}
                        onChange={(e) => setEditData({ ...editData, propertyType: e.target.value })}>
                        <option>Single Family</option>
                        <option>Condo</option>
                        <option>Townhouse</option>
                        <option>Multi-Family</option>
                        <option>Cabin</option>
                        <option>Other</option>
                      </select>
                    ) : (
                      <div className="quiz-property-value">{pd.propertyType}</div>
                    )}
                  </div>
                  <div>
                    <div className="quiz-property-label">Lot</div>
                    {isEditing ? (
                      <input type="number" className="quiz-property-edit-input" value={editData.lotSqft || ""}
                        onChange={(e) => setEditData({ ...editData, lotSqft: parseInt(e.target.value) || 0 })} />
                    ) : (
                      <div className="quiz-property-value">{pd.lotSqft ? `${pd.lotSqft?.toLocaleString()} sqft` : "—"}</div>
                    )}
                  </div>
                  <div>
                    <div className="quiz-property-label">Assessed Land</div>
                    <div className="quiz-property-value">{pd.assessedLand ? `$${pd.assessedLand?.toLocaleString()}` : "—"}</div>
                  </div>
                  <div>
                    <div className="quiz-property-label">Assessed Improvement</div>
                    <div className="quiz-property-value">{pd.assessedImprovement ? `$${pd.assessedImprovement?.toLocaleString()}` : "—"}</div>
                  </div>
                </div>

                <div className="quiz-property-actions">
                  {!selectedAddress.confirmed ? (
                    <>
                      <button className="btn btn-primary quiz-property-confirm-btn" onClick={handleConfirm}>
                        <Check size={16} />
                        Yes, this is my property
                      </button>
                      <button className="btn btn-subtle" onClick={handleEditToggle}>
                        {isEditing ? "Save changes" : "Edit details"}
                      </button>
                    </>
                  ) : (
                    <div className="quiz-property-confirmed">
                      <Check size={14} />
                      Property confirmed
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="quiz-property-manual-entry">
                <div className="quiz-property-source" style={{ justifyContent: "center", color: "var(--dust)" }}>
                  <MapPin size={12} />
                  No public records found — enter details for a better estimate
                </div>
                <div className="quiz-property-grid">
                  <div>
                    <div className="quiz-property-label">Beds</div>
                    <input type="number" className="quiz-property-edit-input" value={editData.beds || ""}
                      placeholder="—"
                      onChange={(e) => {
                        const updated = { ...editData, beds: parseInt(e.target.value) || 0 };
                        setEditData(updated);
                      }} />
                  </div>
                  <div>
                    <div className="quiz-property-label">Baths</div>
                    <input type="number" step="0.5" className="quiz-property-edit-input" value={editData.baths || ""}
                      placeholder="—"
                      onChange={(e) => {
                        const updated = { ...editData, baths: parseFloat(e.target.value) || 0 };
                        setEditData(updated);
                      }} />
                  </div>
                  <div>
                    <div className="quiz-property-label">Sq Ft</div>
                    <input type="number" className="quiz-property-edit-input" value={editData.sqft || ""}
                      placeholder="e.g. 2000"
                      onChange={(e) => {
                        const updated = { ...editData, sqft: parseInt(e.target.value) || 0 };
                        setEditData(updated);
                      }} />
                  </div>
                  <div>
                    <div className="quiz-property-label">Year Built</div>
                    <input type="number" className="quiz-property-edit-input" value={editData.yearBuilt || ""}
                      placeholder="e.g. 2010"
                      onChange={(e) => {
                        const updated = { ...editData, yearBuilt: parseInt(e.target.value) || 0 };
                        setEditData(updated);
                      }} />
                  </div>
                  <div>
                    <div className="quiz-property-label">Type</div>
                    <select className="quiz-property-edit-input" value={editData.propertyType || "Single Family"}
                      onChange={(e) => setEditData({ ...editData, propertyType: e.target.value })}>
                      <option>Single Family</option>
                      <option>Condo</option>
                      <option>Townhouse</option>
                      <option>Multi-Family</option>
                      <option>Cabin</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="quiz-property-label">Lot (sqft)</div>
                    <input type="number" className="quiz-property-edit-input" value={editData.lotSqft || ""}
                      placeholder="optional"
                      onChange={(e) => setEditData({ ...editData, lotSqft: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: "var(--dust)", textAlign: "center", margin: "var(--space-2) 0 0" }}>
                  Optional — improves accuracy but you can skip details you don&apos;t know
                </p>
                <div className="quiz-property-actions">
                  <button className="btn btn-primary quiz-property-confirm-btn" onClick={() => {
                    const confirmed = {
                      ...selectedAddress,
                      confirmed: true,
                      propertyDetails: {
                        ...selectedAddress.propertyDetails,
                        ...editData,
                      },
                    };
                    setSelectedAddress(confirmed);
                    onChange(confirmed);
                  }}>
                    <Check size={16} />
                    Confirm & Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change address link */}
        <button
          className="quiz-tooltip-toggle"
          style={{ marginTop: "var(--space-2)" }}
          onClick={handleChangeAddress}
          type="button"
        >
          Search for a different address
        </button>
      </div>
    );
  }

  // ─── Autocomplete search phase ───
  return (
    <div className="quiz-address-wrapper" ref={dropdownRef}>
      <div className="quiz-address-input-group">
        <Search size={18} className="quiz-address-icon" />
        <input
          ref={inputRef}
          type="text"
          className="quiz-address-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
        />
      </div>

      {showDropdown && (
        <div className="quiz-address-dropdown">
          {suggestions.map((s, i) => (
            <button
              key={s.placeId || `${s.address}-${i}`}
              className={`quiz-address-option ${i === highlightIdx ? "highlighted" : ""}`}
              onClick={() => handleSelect(s)}
              onMouseEnter={() => setHighlightIdx(i)}
            >
              <MapPin size={14} className="quiz-address-option-icon" />
              <div>
                <div className="quiz-address-option-main">{s.address}</div>
                <div className="quiz-address-option-sub">
                  {s.subtitle || [s.city, s.state, s.zip].filter(Boolean).join(", ")}
                </div>
              </div>
            </button>
          ))}

          {/* Always show freeform / manual options when typing */}
          {query.length >= 3 && (
            <div className="quiz-address-freeform">
              <button
                className="quiz-address-option"
                onClick={handleFreeformSubmit}
              >
                <Search size={14} className="quiz-address-option-icon" />
                <div>
                  <div className="quiz-address-option-main">Use &ldquo;{query}&rdquo;</div>
                  <div className="quiz-address-option-sub">Continue with this address</div>
                </div>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual entry toggle — always visible */}
      <button
        className="quiz-tooltip-toggle"
        style={{ marginTop: "var(--space-2)" }}
        onClick={() => setManualMode(true)}
        type="button"
      >
        Enter my address manually instead
      </button>
    </div>
  );
}

/* ─── Currency Input with debounced validation ─── */
function CurrencyInput({ value, onChange, placeholder, validation, suggestedPrice, suggestedDate }) {
  const [warning, setWarning] = useState("");
  const [tier, setTier] = useState("");
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  const hasAppliedSuggestion = useRef(false);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Pre-fill with suggested price on mount if no existing value
  useEffect(() => {
    if (suggestedPrice && suggestedPrice > 0 && !value && !hasAppliedSuggestion.current) {
      hasAppliedSuggestion.current = true;
      const formatted = Number(suggestedPrice).toLocaleString();
      onChange(formatted);
    }
  }, [suggestedPrice, value, onChange]);

  function formatCurrency(raw) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString();
  }

  const updateFeedback = useCallback((numValue) => {
    if (!numValue || numValue === 0) {
      setTier("");
      setWarning("");
      return;
    }

    // Only show validation/tier once value looks "complete" (6+ digits or after delay)
    if (validation) {
      if (numValue < validation.min) {
        setWarning(validation.minMessage);
        setTier("");
      } else if (numValue > validation.max) {
        setWarning(validation.maxMessage);
        setTier("");
      } else {
        setWarning("");
        if (numValue >= 1500000) setTier("Premium property — maximum savings potential");
        else if (numValue >= 750000) setTier("Strong candidate for cost segregation");
        else if (numValue >= 300000) setTier("Good savings potential");
        else if (numValue >= 100000) setTier("Moderate savings potential");
        else setTier("");
      }
    } else {
      setWarning("");
      setTier("");
    }
  }, [validation]);

  function handleChange(e) {
    const formatted = formatCurrency(e.target.value);
    onChange(formatted);

    // Clear existing timer
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const numValue = formatted ? parseInt(formatted.replace(/\D/g, ""), 10) : 0;

    // If value has 6+ digits, show feedback immediately
    if (numValue >= 100000) {
      updateFeedback(numValue);
    } else {
      // Otherwise debounce for 1.5s so we don't flash errors while typing
      setTier("");
      setWarning("");
      debounceRef.current = setTimeout(() => {
        updateFeedback(numValue);
      }, 1500);
    }
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="quiz-currency-wrapper">
      <div className="quiz-currency-input-group">
        <span className="quiz-currency-symbol">$</span>
        <input
          ref={inputRef}
          type="text"
          className="quiz-currency-input"
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          inputMode="numeric"
          autoComplete="off"
        />
      </div>
      {tier && !warning && (
        <div className="quiz-currency-tier">{tier}</div>
      )}
      {warning && (
        <div className="quiz-currency-warning">{warning}</div>
      )}
      {suggestedPrice > 0 && suggestedDate && (
        <div style={{
          marginTop: "var(--space-2)",
          fontSize: "13px",
          color: "var(--dust)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
        }}>
          <span>
            Based on the last recorded sale of ${Number(suggestedPrice).toLocaleString()} on{" "}
            {new Date(suggestedDate + "T00:00:00").toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {value !== Number(suggestedPrice).toLocaleString() && (
            <button
              type="button"
              onClick={() => onChange(Number(suggestedPrice).toLocaleString())}
              style={{
                background: "none",
                border: "none",
                color: "var(--turq)",
                fontSize: "13px",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                fontFamily: "inherit",
              }}
            >
              Use this
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Currency + Option combo (renovations/furnishings) ─── */
function CurrencyOptionInput({ step, value, onChange }) {
  // value = { selected: "yes"|"none", amount: "75,000" }
  const selected = value.selected || "";
  const amount = value.amount || "";

  function handleOptionSelect(optValue) {
    onChange({ ...value, selected: optValue, amount: optValue === "none" ? "" : amount });
  }

  function handleAmountChange(e) {
    const digits = e.target.value.replace(/\D/g, "");
    const formatted = digits ? Number(digits).toLocaleString() : "";
    onChange({ ...value, amount: formatted });
  }

  const showAmountInput = selected === "yes";

  return (
    <div className="quiz-currency-option-wrapper">
      <div className="quiz-options-grid">
        {step.options.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              className={`quiz-option ${isSelected ? "selected" : ""}`}
              onClick={() => handleOptionSelect(opt.value)}
            >
              <span className="quiz-option-key">{i + 1}</span>
              {opt.icon && <span className="quiz-option-icon">{opt.icon}</span>}
              <span className="quiz-option-label">{opt.label}</span>
              <span className="quiz-option-check">
                {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>

      {showAmountInput && (
        <div className="quiz-followup-amount" style={{ marginTop: "var(--space-3)" }}>
          <label className="quiz-followup-label">
            {step.followUpLabel}
          </label>
          {step.followUpHint && (
            <p className="quiz-followup-hint">{step.followUpHint}</p>
          )}
          <div className="quiz-currency-input-group" style={{ maxWidth: 360 }}>
            <span className="quiz-currency-symbol" style={{ fontSize: 20 }}>$</span>
            <input
              type="text"
              className="quiz-currency-input"
              style={{ fontSize: 20, padding: "12px 14px 12px 36px" }}
              value={amount}
              onChange={handleAmountChange}
              placeholder={step.followUpPlaceholder}
              inputMode="numeric"
              autoComplete="off"
              autoFocus
            />
          </div>
          {amount && (
            <div className="quiz-currency-tier" style={{ marginTop: 6 }}>
              {getAmountContext(step.id, amount)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Airbnb / VRBO URL Input (separate step) ─── */
function AirbnbUrlInput({ value, onChange, onAutoAdvance, placeholder, propertyAddress }) {
  const [url, setUrl] = useState(value?.url || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [urlHint, setUrlHint] = useState("");
  const [listingData, setListingData] = useState(value?.listing || null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !listingData) inputRef.current.focus();
  }, [listingData]);

  async function fetchListing(urlToFetch) {
    const roomId = parseAirbnbUrl(urlToFetch);
    if (!roomId) {
      setError("Please enter a valid Airbnb listing URL (e.g. airbnb.com/rooms/12345)");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Check client cache first
      const cacheKey = buildAirbnbCacheKey(roomId);
      const cached = clientCacheGet(cacheKey);

      let listing;
      if (cached) {
        listing = cached;
      } else {
        const res = await fetch("/api/airbnb/lookup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlToFetch }),
        });
        const data = await res.json();

        if (data.fallback || !data.listing) {
          setError(data.message || "Could not fetch listing. You can skip this step and continue.");
          return;
        }

        listing = data.listing;
        clientCacheSet(cacheKey, listing);
        sessionSave("lastAirbnbListing", listing);
      }

      setListingData(listing);
      onChange({ url: urlToFetch, listing });
    } catch {
      setError("Could not fetch listing. Please check the URL and try again, or skip this step.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData?.getData("text") || "";
    if (isValidAirbnbInput(pasted)) {
      e.preventDefault(); // prevent browser from also firing onChange with doubled value
      setUrl(pasted);
      setTimeout(() => fetchListing(pasted), 50);
    }
  }

  function handleSkip() {
    onChange(null);
    onAutoAdvance(null);
  }

  function handleClear() {
    setListingData(null);
    setUrl("");
    setError("");
    onChange(null);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ─── Listing confirmed: show card ───
  if (listingData) {
    return (
      <div className="quiz-address-wrapper">
        <div className="quiz-airbnb-card">
          {/* Hero image */}
          <div className="quiz-airbnb-hero">
            <img
              src={listingData.thumbnail}
              alt={listingData.title}
              className="quiz-airbnb-hero-img"
            />
            {listingData.isSuperhost && (
              <span className="quiz-airbnb-superhost">Superhost</span>
            )}
          </div>

          {/* Property info */}
          <div className="quiz-airbnb-info">
            <h3 className="quiz-airbnb-title">{listingData.title}</h3>
            <p className="quiz-airbnb-location">
              {listingData.city}, {listingData.stateFull || listingData.state}
            </p>

            {/* Rating & reviews */}
            <div className="quiz-airbnb-social-proof">
              <div className="quiz-airbnb-rating">
                <Star size={14} fill="var(--turq)" stroke="var(--turq)" />
                <span className="quiz-airbnb-rating-value">{listingData.rating}</span>
                <span className="quiz-airbnb-rating-dot">&middot;</span>
                <span className="quiz-airbnb-reviews">{listingData.reviewCount} reviews</span>
              </div>
              <div className="quiz-airbnb-compliment">
                Sweet property! Looks like you&apos;re doing great with {listingData.reviewCount} reviews and a {listingData.rating}-star rating
              </div>
            </div>

            {/* Specs */}
            <div className="quiz-airbnb-specs">
              <span>{listingData.bedrooms} bed{listingData.bedrooms !== 1 ? "s" : ""}</span>
              <span className="quiz-airbnb-spec-dot">&middot;</span>
              <span>{listingData.baths} bath{listingData.baths !== 1 ? "s" : ""}</span>
              <span className="quiz-airbnb-spec-dot">&middot;</span>
              <span>{listingData.guests} guests</span>
              <span className="quiz-airbnb-spec-dot">&middot;</span>
              <span>{listingData.propertyType}</span>
            </div>

            {/* Amenity highlights */}
            {listingData.amenitySummary && (
              <div className="quiz-airbnb-amenity-badges">
                {getTopAmenities(listingData).map((a) => (
                  <span key={a} className="quiz-airbnb-amenity-badge">{a}</span>
                ))}
              </div>
            )}
          </div>

          {/* Confirmed indicator */}
          <div className="quiz-airbnb-actions">
            <div className="quiz-property-confirmed">
              <Check size={14} />
              Listing linked — nice property!
            </div>
          </div>
        </div>

        <button
          className="quiz-tooltip-toggle"
          style={{ marginTop: "var(--space-2)" }}
          onClick={handleClear}
          type="button"
        >
          Use a different listing
        </button>
      </div>
    );
  }

  // ─── URL input phase ───
  return (
    <div className="quiz-address-wrapper">
      <div className="quiz-airbnb-input-group">
        <Link2 size={18} className="quiz-address-icon" />
        <input
          ref={inputRef}
          type="text"
          className="quiz-address-input"
          value={url}
          onChange={(e) => {
            const v = e.target.value;
            setUrl(v);
            setError("");
            if (v.length > 10 && !v.includes("airbnb.com")) {
              setUrlHint("Tip: Paste a URL like airbnb.com/rooms/12345");
            } else {
              setUrlHint("");
            }
          }}
          onPaste={handlePaste}
          onKeyDown={(e) => {
            if (e.key === "Enter" && url) {
              e.preventDefault();
              e.stopPropagation();
              fetchListing(url);
            }
          }}
          placeholder={placeholder || "Paste your Airbnb listing URL..."}
          autoComplete="off"
          disabled={loading}
        />
        {loading && (
          <div className="quiz-airbnb-loading">
            <Loader2 size={18} className="quiz-airbnb-spinner" />
          </div>
        )}
      </div>

      {loading && (
        <div className="quiz-airbnb-skeleton">
          <div className="quiz-airbnb-skeleton-hero" />
          <div className="quiz-airbnb-skeleton-bar" style={{ width: "75%" }} />
          <div className="quiz-airbnb-skeleton-bar" style={{ width: "50%" }} />
          <div className="quiz-airbnb-skeleton-row">
            <div className="quiz-airbnb-skeleton-bar" />
            <div className="quiz-airbnb-skeleton-bar" />
            <div className="quiz-airbnb-skeleton-bar" />
          </div>
          <div className="quiz-airbnb-loading-text">
            <span>Pulling your listing photos, amenities, and property details...</span>
          </div>
        </div>
      )}

      {urlHint && !error && !loading && (
        <div className="quiz-airbnb-url-hint" style={{ marginTop: 8, fontSize: 13, color: "var(--dust)" }}>
          {urlHint}
        </div>
      )}

      {error && (
        <div className="quiz-currency-warning" style={{ marginTop: 8 }}>
          {error}
        </div>
      )}

      {!loading && url && !error && (
        <button
          className="btn btn-primary"
          style={{ marginTop: "var(--space-2)", width: "100%" }}
          onClick={() => fetchListing(url)}
        >
          <Search size={16} />
          Fetch Listing
        </button>
      )}

      {/* Skip button — prominent since this step is optional */}
      <button
        className="btn btn-subtle"
        style={{
          marginTop: "var(--space-3)",
          width: "100%",
          justifyContent: "center",
          fontSize: "15px",
        }}
        onClick={handleSkip}
        type="button"
      >
        Skip this step
      </button>

      {/* Help find listing using property address */}
      {propertyAddress && (propertyAddress.address || propertyAddress.city) && (
        <div style={{ marginTop: "var(--space-2)", textAlign: "center", fontSize: 13, color: "var(--dust)" }}>
          Not sure of your URL?{" "}
          <a
            href={`https://www.airbnb.com/s/${encodeURIComponent(
              [propertyAddress.address, propertyAddress.city, propertyAddress.state]
                .filter(Boolean)
                .join(", ")
            )}/homes`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--turq)", fontWeight: 500 }}
          >
            Search Airbnb for your property →
          </a>
        </div>
      )}
    </div>
  );
}

// Pick top cost-seg-relevant amenities for badge display
function getTopAmenities(airbnbData) {
  const highlights = [];
  const enrichment = airbnbData.categoryEnrichment || {};

  if (enrichment.pool && enrichment.pool !== "none") highlights.push("Pool");
  if (enrichment["pool-features"]?.includes("hot-tub")) highlights.push("Hot Tub");
  if (enrichment["outdoor-features"]?.includes("outdoor-kitchen")) highlights.push("Outdoor Kitchen");
  if (enrichment["outdoor-features"]?.includes("fire-pit")) highlights.push("Fire Pit");
  if (enrichment["interior-features"]?.includes("fireplace")) highlights.push("Fireplace");
  if (enrichment.security === "professional") highlights.push("Security System");
  if (enrichment["smart-features"]?.includes("smart-locks")) highlights.push("Smart Locks");
  if (enrichment["hvac-type"]?.includes("central")) highlights.push("Central AC");
  if (enrichment.entertainment?.includes("game-room")) highlights.push("Game Room");

  return highlights.slice(0, 6);
}

function getAmountContext(stepId, amount) {
  const num = parseInt(amount.replace(/\D/g, ""), 10) || 0;
  if (stepId === "renovations") {
    if (num >= 100000) return "Major renovation — significant additional depreciable assets";
    if (num >= 50000) return "Substantial updates — strong impact on your study";
    if (num >= 20000) return "Moderate updates — adds to your depreciable basis";
    if (num >= 5000) return "Minor updates noted";
    return "";
  }
  if (stepId === "furnishings") {
    if (num >= 80000) return "Premium furnishing package — substantial 5/7-year property";
    if (num >= 40000) return "Well-furnished STR — strong bonus depreciation opportunity";
    if (num >= 15000) return "Standard furnishing package";
    if (num >= 5000) return "Basic furnishings noted";
    return "";
  }
  return "";
}

/* ─── Tax Bracket Input with income fallback ─── */
// 2024 MFJ brackets
const INCOME_BRACKETS = [
  { min: 0, max: 23200, rate: 10 },
  { min: 23201, max: 94300, rate: 12 },
  { min: 94301, max: 201050, rate: 22 },
  { min: 201051, max: 383900, rate: 24 },
  { min: 383901, max: 487450, rate: 32 },
  { min: 487451, max: 731200, rate: 35 },
  { min: 731201, max: Infinity, rate: 37 },
];

function bracketFromIncome(income) {
  for (const b of INCOME_BRACKETS) {
    if (income >= b.min && income <= b.max) return String(b.rate);
  }
  return "32";
}

function TaxBracketInput({ options, value, onChange, onAutoAdvance }) {
  const [mode, setMode] = useState("brackets"); // "brackets" | "income"
  const [income, setIncome] = useState("");
  const [derivedBracket, setDerivedBracket] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  function handleBracketSelect(val) {
    onAutoAdvance(val);
  }

  function handleIncomeChange(e) {
    const digits = e.target.value.replace(/\D/g, "");
    const formatted = digits ? Number(digits).toLocaleString() : "";
    setIncome(formatted);

    if (digits && parseInt(digits) >= 30000) {
      const bracket = bracketFromIncome(parseInt(digits));
      setDerivedBracket(bracket);
      onChange(bracket);
    } else {
      setDerivedBracket(null);
    }
  }

  if (mode === "income") {
    return (
      <div className="quiz-tax-bracket-wrapper">
        <label className="quiz-followup-label">
          Approximate household taxable income (2024)
        </label>
        <p className="quiz-followup-hint">
          We&apos;ll calculate your bracket. This is never stored or shared.
        </p>
        <div className="quiz-currency-input-group" style={{ maxWidth: 360 }}>
          <span className="quiz-currency-symbol" style={{ fontSize: 20 }}>$</span>
          <input
            type="text"
            className="quiz-currency-input"
            style={{ fontSize: 20, padding: "12px 14px 12px 36px" }}
            value={income}
            onChange={handleIncomeChange}
            placeholder="e.g. 250,000"
            inputMode="numeric"
            autoComplete="off"
            autoFocus
          />
        </div>
        {derivedBracket && (
          <div className="quiz-currency-tier" style={{ marginTop: 8 }}>
            That puts you in the <strong>{derivedBracket}% federal bracket</strong> (married filing jointly)
          </div>
        )}
        <button
          className="quiz-tooltip-toggle"
          style={{ marginTop: 12 }}
          onClick={() => setMode("brackets")}
          type="button"
        >
          I&apos;d rather pick my bracket directly
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-tax-bracket-wrapper">
      <div className="quiz-options-grid">
        {options.map((opt, i) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              className={`quiz-option ${isSelected ? "selected" : ""} ${opt.recommended ? "recommended" : ""}`}
              onClick={() => handleBracketSelect(opt.value)}
            >
              <span className="quiz-option-key">{i + 1}</span>
              <span className="quiz-option-label">
                <strong>{opt.label}</strong>
                <span style={{ color: "var(--dust)", fontSize: 13, marginLeft: 8 }}>
                  {opt.detail}
                </span>
              </span>
              {opt.recommended && <span className="quiz-option-rec">Most common</span>}
              <span className="quiz-option-check">
                {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <button
        className="quiz-tooltip-toggle"
        style={{ marginTop: 12 }}
        onClick={() => setMode("income")}
        type="button"
      >
        I don&apos;t know my bracket — let me enter my income instead
      </button>

      {/* How to find your bracket */}
      <button
        className="quiz-tooltip-toggle"
        style={{ marginTop: 8 }}
        onClick={() => setShowHelp((v) => !v)}
        type="button"
      >
        {showHelp ? "Hide" : "How do I find my bracket?"}
      </button>
      {showHelp && (
        <div className="quiz-tax-bracket-help">
          <p>Your <strong>marginal bracket</strong> is your highest federal rate — not your effective (average) rate.</p>
          <p style={{ marginTop: 6 }}>
            <strong>3 ways to find it:</strong>
          </p>
          <ol style={{ paddingLeft: 18, marginTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
            <li>Check your last <strong>Form 1040</strong> — divide line 24 (tax) by line 15 (taxable income) to approximate it</li>
            <li>Look at box 2 of your <strong>W-2</strong> for federal withholding (rough proxy)</li>
            <li>Use the income calculator above — enter your household taxable income and we&apos;ll derive it</li>
          </ol>
          <p style={{ marginTop: 8, color: "var(--dust)", fontSize: 12 }}>
            Most STR investors with $300K–$600K household income fall in the <strong>32% bracket</strong> (married filing jointly, 2024).{" "}
            <a
              href="https://www.irs.gov/newsroom/irs-provides-tax-inflation-adjustments-for-tax-year-2024"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "var(--turq)" }}
            >
              See IRS 2024 brackets →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
