"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, ChevronDown, ChevronUp, Sparkles, Camera, Eye, Loader2 } from "lucide-react";
import {
  PROPERTY_CATEGORIES,
  getPropertyDefaults,
} from "@/lib/propertyCategories";
import { mergeAirbnbDefaults } from "@/lib/airbnbParser";
import { categorizeImageByCaption, extractAmenitiesFromCaption } from "@/lib/airbnbImageAnalysis";
import { useVisionAnalysis } from "@/lib/useVisionAnalysis";

export default function PropertyDetailCards({
  propertyData,
  purchasePrice,
  onSelectionsChange,
  airbnbEnrichment,
  airbnbDescriptionHints,
  airbnbImages,
  initialSelections,
  initialConfirmedCategories,
}) {
  const [selections, setSelections] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [confirmedCategories, setConfirmedCategories] = useState(new Set());
  const [initialized, setInitialized] = useState(false);
  const [visionApplied, setVisionApplied] = useState(false);

  // Vision analysis hook
  const { analyze: runVision, results: visionResults, loading: visionLoading, analyzed: visionDone } = useVisionAnalysis();

  // Initialize with pre-populated defaults, merging Airbnb data when available
  useEffect(() => {
    if (initialized) return;

    // If caller passes pre-populated selections from a prior walkthrough, use them
    if (initialSelections && Object.keys(initialSelections).length > 0) {
      setSelections(initialSelections);
      // Mark all categories that have any selections as confirmed
      if (initialConfirmedCategories && initialConfirmedCategories.length > 0) {
        setConfirmedCategories(new Set(initialConfirmedCategories));
      } else {
        // Auto-confirm all categories that have data
        const autoConfirmed = new Set(
          Object.keys(initialSelections).reduce((cats, key) => {
            const cat = PROPERTY_CATEGORIES.find(c => Object.keys(c.items || {}).includes(key) || c.id === key.split("-")[0]);
            if (cat) cats.add(cat.id);
            return cats;
          }, new Set())
        );
        setConfirmedCategories(autoConfirmed);
      }
      setInitialized(true);
      setExpandedCategory(null); // Don't auto-expand — user already reviewed this
      return;
    }

    const heuristicDefaults = getPropertyDefaults(propertyData);
    const defaults = airbnbEnrichment
      ? mergeAirbnbDefaults(heuristicDefaults, airbnbEnrichment, airbnbDescriptionHints || [])
      : heuristicDefaults;
    setSelections(defaults);
    setInitialized(true);
    // Auto-expand first category
    setExpandedCategory("kitchen");
  }, [propertyData, initialized, airbnbEnrichment, airbnbDescriptionHints, initialSelections, initialConfirmedCategories]);

  // Trigger vision analysis when Airbnb images are available
  useEffect(() => {
    if (Array.isArray(airbnbImages) && airbnbImages.length > 0 && initialized) {
      runVision(airbnbImages, propertyData.propertyType);
    }
  }, [airbnbImages, initialized, runVision, propertyData.propertyType]);

  // Apply vision results to pre-select items (once, when results arrive)
  useEffect(() => {
    if (!visionDone || visionApplied || !initialized) return;
    setVisionApplied(true);

    setSelections((prev) => {
      const updated = { ...prev };
      // Map vision detections → item selections
      for (const [catId, detections] of Object.entries(visionResults)) {
        for (const det of detections) {
          if (det.confidence < 0.6) continue; // skip low-confidence
          applyVisionDetection(updated, catId, det);
        }
      }
      return updated;
    });
  }, [visionDone, visionApplied, initialized, visionResults]);

  // Notify parent of changes
  useEffect(() => {
    if (initialized) {
      onSelectionsChange(selections, confirmedCategories);
    }
  }, [selections, confirmedCategories, initialized, onSelectionsChange]);

  const propertyType = propertyData.propertyType || "Single Family";

  // Categorize Airbnb images by room type for inline display
  // An image can appear in multiple categories (e.g. kitchen with hardwood → kitchen + flooring)
  const imagesByCategory = {};
  if (Array.isArray(airbnbImages) && airbnbImages.length > 0) {
    // Primary room-type mapping
    const primaryMappings = {
      kitchen: "kitchen",
      bathroom: "bathrooms",
      outdoor: "outdoor",
      bedroom: "interior",
      living: "interior",
      general: null,
    };

    for (const img of airbnbImages) {
      if (!img || !img.imageUrl) continue;
      const catId = categorizeImageByCaption(img.caption);
      const amenities = extractAmenitiesFromCaption(img.caption);
      const enrichedImg = { ...img, amenities };

      // Add to primary category
      const primaryCatId = primaryMappings[catId];
      if (primaryCatId) {
        if (!imagesByCategory[primaryCatId]) imagesByCategory[primaryCatId] = [];
        imagesByCategory[primaryCatId].push(enrichedImg);
      }

      // Cross-reference: if caption mentions flooring keywords, add to flooring too
      const caption = (img.caption || "").toLowerCase();
      if (/hardwood|tile floor|laminate|carpet|vinyl|marble floor|travertine|floor/i.test(caption)) {
        if (!imagesByCategory["flooring"]) imagesByCategory["flooring"] = [];
        imagesByCategory["flooring"].push(enrichedImg);
      }
      // If caption mentions smart home features, add to smart-home
      if (/smart|thermostat|keypad|ring|camera|home theater/i.test(caption)) {
        if (!imagesByCategory["smart-home"]) imagesByCategory["smart-home"] = [];
        imagesByCategory["smart-home"].push(enrichedImg);
      }
    }
  }

  function updateSelection(itemId, value) {
    setSelections((prev) => ({ ...prev, [itemId]: value }));
  }

  function toggleMulti(itemId, optionValue) {
    setSelections((prev) => {
      const current = prev[itemId] || [];
      if (current.includes(optionValue)) {
        return { ...prev, [itemId]: current.filter((v) => v !== optionValue) };
      }
      return { ...prev, [itemId]: [...current, optionValue] };
    });
  }

  function handleConfirmCategory(catId) {
    setConfirmedCategories((prev) => {
      const next = new Set(prev);
      next.add(catId);
      return next;
    });
    // Auto-advance to next unconfirmed category
    const catIndex = PROPERTY_CATEGORIES.findIndex((c) => c.id === catId);
    const remaining = PROPERTY_CATEGORIES.slice(catIndex + 1).filter(
      (c) => !shouldSkipCategory(c) && !confirmedCategories.has(c.id)
    );
    if (remaining.length > 0) {
      setExpandedCategory(remaining[0].id);
    } else {
      setExpandedCategory(null);
    }
  }

  function handleToggleCategory(catId) {
    setExpandedCategory((prev) => (prev === catId ? null : catId));
  }

  function shouldSkipCategory(category) {
    // Skip outdoor items for condos
    if (category.id === "outdoor" && propertyType === "Condo") return false; // still show but with limited items
    return false;
  }

  function shouldShowItem(item) {
    // Check property type exclusions
    if (item.excludePropertyTypes && item.excludePropertyTypes.includes(propertyType)) {
      return false;
    }
    // Check conditional visibility
    if (item.showWhen) {
      const fieldVal = selections[item.showWhen.field];
      if (item.showWhen.notValue && fieldVal === item.showWhen.notValue) return false;
    }
    return true;
  }

  // Build vision detections per category for badge display
  const visionByCategory = visionResults || {};

  const completedCount = confirmedCategories.size;
  const totalCategories = PROPERTY_CATEGORIES.length;
  const progressPercent = Math.round((completedCount / totalCategories) * 100);

  return (
    <div className="pdc-wrapper">
      {/* Progress header */}
      <div className="pdc-progress">
        <div className="pdc-progress-bar">
          <div
            className="pdc-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="pdc-progress-text">
          {completedCount} of {totalCategories} categories reviewed
        </div>
      </div>

      {/* Category cards */}
      <div className="pdc-cards">
        {PROPERTY_CATEGORIES.map((category) => {
          const isExpanded = expandedCategory === category.id;
          const isConfirmed = confirmedCategories.has(category.id);
          const visibleItems = category.items.filter(shouldShowItem);

          return (
            <div
              key={category.id}
              className={`pdc-card ${isExpanded ? "expanded" : ""} ${isConfirmed ? "confirmed" : ""}`}
            >
              {/* Card header — always visible */}
              <button
                className="pdc-card-header"
                onClick={() => handleToggleCategory(category.id)}
                type="button"
              >
                <span className="pdc-card-icon">{category.icon}</span>
                <div className="pdc-card-title-group">
                  <span className="pdc-card-name">{category.name}</span>
                  <span className="pdc-card-desc">{category.description}</span>
                </div>
                {isConfirmed && (
                  <span className="pdc-card-check">
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
                <span className="pdc-card-chevron">
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </span>
              </button>

              {/* Card body — expandable */}
              {isExpanded && (
                <div className="pdc-card-body">
                  <div className="pdc-card-depreciation-note">
                    <Sparkles size={12} />
                    {category.depreciationNote}
                  </div>

                  {/* Airbnb photos for this category */}
                  {imagesByCategory[category.id] && imagesByCategory[category.id].length > 0 && (
                    <AirbnbPhotoStrip
                      images={imagesByCategory[category.id]}
                      categoryName={category.name}
                      visionDetections={visionByCategory[category.id]}
                      visionLoading={visionLoading}
                    />
                  )}

                  {visibleItems.map((item) => (
                    <div key={item.id} className="pdc-item">
                      <label className="pdc-item-label">{item.label}</label>

                      {item.type === "select" && (
                        <div className="pdc-select-options">
                          {item.options.map((opt) => {
                            const isSelected = selections[item.id] === opt.value;
                            return (
                              <button
                                key={opt.value}
                                className={`pdc-select-btn ${isSelected ? "selected" : ""}`}
                                onClick={() => updateSelection(item.id, opt.value)}
                                type="button"
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {item.type === "multi" && (
                        <div className="pdc-multi-options">
                          {item.options.map((opt) => {
                            const current = selections[item.id] || [];
                            const isSelected = current.includes(opt.value);
                            return (
                              <button
                                key={opt.value}
                                className={`pdc-multi-btn ${isSelected ? "selected" : ""}`}
                                onClick={() => toggleMulti(item.id, opt.value)}
                                type="button"
                              >
                                <span className="pdc-multi-check">
                                  {isSelected && <Check size={10} strokeWidth={3} />}
                                </span>
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Confirm button */}
                  <button
                    className="btn btn-primary pdc-confirm-btn"
                    onClick={() => handleConfirmCategory(category.id)}
                    type="button"
                  >
                    <Check size={14} />
                    {isConfirmed ? "Updated" : "Looks good — next"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Airbnb Photo Strip — shows relevant listing photos inside category cards ─── */
function AirbnbPhotoStrip({ images, categoryName, visionDetections, visionLoading }) {
  const [lightboxIdx, setLightboxIdx] = useState(null);

  if (!images || images.length === 0) return null;

  // Deduplicate by URL
  const unique = images.filter(
    (img, i, arr) => arr.findIndex((x) => x.imageUrl === img.imageUrl) === i
  );

  // Collect detected amenities from captions
  const detectedAmenities = [];
  const seenAmenities = new Set();
  for (const img of unique) {
    if (img.amenities) {
      for (const a of img.amenities) {
        if (!seenAmenities.has(a.amenity)) {
          seenAmenities.add(a.amenity);
          detectedAmenities.push({ label: a.amenity, source: "caption" });
        }
      }
    }
  }

  // Add vision-detected items (higher confidence, marked differently)
  if (Array.isArray(visionDetections)) {
    for (const det of visionDetections) {
      if (det.confidence >= 0.6 && !seenAmenities.has(det.label)) {
        seenAmenities.add(det.label);
        detectedAmenities.push({ label: det.label, source: "vision", quality: det.quality });
      }
    }
  }

  return (
    <div className="pdc-photo-strip">
      <div className="pdc-photo-strip-header">
        <Camera size={13} />
        <span>From your Airbnb listing</span>
        <span className="pdc-photo-strip-count">{unique.length} photo{unique.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="pdc-photo-strip-scroll">
        {unique.slice(0, 6).map((img, i) => (
          <button
            key={img.imageUrl}
            className="pdc-photo-strip-thumb"
            onClick={() => setLightboxIdx(i)}
            type="button"
            title={img.caption || `${categoryName} photo`}
          >
            <img
              src={img.imageUrl}
              alt={img.caption || `${categoryName} photo ${i + 1}`}
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {/* Detected amenities — captions + vision */}
      {(detectedAmenities.length > 0 || visionLoading) && (
        <div className="pdc-photo-strip-amenities">
          {visionLoading && (
            <span className="pdc-photo-strip-vision-loading">
              <Eye size={11} />
              Analyzing photos...
            </span>
          )}
          {!visionLoading && detectedAmenities.length > 0 && (
            <>
              <span className="pdc-photo-strip-amenities-label">
                {detectedAmenities.some((a) => a.source === "vision") ? (
                  <><Eye size={11} /> AI detected:</>
                ) : (
                  "Detected:"
                )}
              </span>
              {detectedAmenities.slice(0, 8).map((a) => (
                <span
                  key={a.label}
                  className={`pdc-photo-strip-amenity-badge ${a.source === "vision" ? "pdc-vision-badge" : ""}`}
                  title={a.quality ? `Quality: ${a.quality}` : undefined}
                >
                  {a.label}
                  {a.quality && a.quality !== "standard" && (
                    <span className="pdc-quality-indicator">{a.quality}</span>
                  )}
                </span>
              ))}
            </>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          className="pdc-photo-lightbox"
          onClick={() => setLightboxIdx(null)}
        >
          <div className="pdc-photo-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img
              src={unique[lightboxIdx].imageUrl}
              alt={unique[lightboxIdx].caption || `${categoryName} photo`}
            />
            {unique[lightboxIdx].caption && (
              <div className="pdc-photo-lightbox-caption">
                {unique[lightboxIdx].caption}
              </div>
            )}
            <div className="pdc-photo-lightbox-nav">
              {lightboxIdx > 0 && (
                <button
                  className="pdc-photo-lightbox-btn"
                  onClick={() => setLightboxIdx(lightboxIdx - 1)}
                  type="button"
                >
                  ←
                </button>
              )}
              <span className="pdc-photo-lightbox-count">
                {lightboxIdx + 1} / {unique.length}
              </span>
              {lightboxIdx < unique.length - 1 && (
                <button
                  className="pdc-photo-lightbox-btn"
                  onClick={() => setLightboxIdx(lightboxIdx + 1)}
                  type="button"
                >
                  →
                </button>
              )}
            </div>
            <button
              className="pdc-photo-lightbox-close"
              onClick={() => setLightboxIdx(null)}
              type="button"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── Vision → Selection Mapper ─── */
// Maps a vision detection to a walkthrough item selection.
// This auto-fills category options based on what the AI sees in photos.

const VISION_ITEM_MAP = {
  // Kitchen
  "granite": { item: "countertops", value: "granite" },
  "quartz": { item: "countertops", value: "quartz" },
  "marble-counter": { item: "countertops", value: "marble" },
  "laminate": { item: "countertops", value: "laminate" },
  "butcher-block": { item: "countertops", value: "butcher-block" },
  "custom-cabinets": { item: "cabinetry", value: "custom" },
  "semi-custom-cabinets": { item: "cabinetry", value: "semi-custom" },
  "stainless-steel-appliances": { item: "appliances", value: "stainless" },
  "commercial-grade-appliances": { item: "appliances", value: "commercial" },
  "tile-backsplash": { item: "backsplash", value: "tile" },
  "stone-backsplash": { item: "backsplash", value: "stone" },

  // Bathrooms (multi-select items)
  "soaking-tub": { item: "bath-features", value: "soaking-tub", multi: true },
  "walk-in-shower": { item: "bath-features", value: "walk-in-shower", multi: true },
  "dual-vanity": { item: "bath-features", value: "dual-vanity", multi: true },
  "frameless-glass": { item: "bath-features", value: "walk-in-shower", multi: true },
  "heated-floors": { item: "bath-features", value: "heated-floors", multi: true },
  "rain-shower": { item: "bath-features", value: "rain-shower", multi: true },
  "jetted-tub": { item: "bath-features", value: "soaking-tub", multi: true },

  // Flooring
  "hardwood": { item: "primary-flooring", value: "hardwood" },
  "engineered-hardwood": { item: "primary-flooring", value: "hardwood" },
  "tile": { item: "primary-flooring", value: "tile" },
  "lvp": { item: "primary-flooring", value: "lvp" },
  "carpet": { item: "primary-flooring", value: "carpet" },
  "marble-floor": { item: "primary-flooring", value: "tile" },
  "travertine": { item: "primary-flooring", value: "tile" },

  // Outdoor
  "pool": { item: "pool", value: "chlorine" },
  "saltwater-pool": { item: "pool", value: "saltwater" },
  "hot-tub": { item: "pool-features", value: "hot-tub", multi: true },
  "outdoor-kitchen": { item: "outdoor-features", value: "outdoor-kitchen", multi: true },
  "fire-pit": { item: "outdoor-features", value: "fire-pit", multi: true },
  "pergola": { item: "outdoor-features", value: "pergola", multi: true },
  "sport-court": { item: "outdoor-features", value: "sport-court", multi: true },
  "composite-deck": { item: "deck-patio", value: "composite" },
  "wood-deck": { item: "deck-patio", value: "wood" },
  "stone-patio": { item: "deck-patio", value: "stone" },

  // Interior
  "recessed-lighting": { item: "lighting", value: "recessed" },
  "chandelier": { item: "lighting", value: "chandelier" },
  "pendant": { item: "lighting", value: "pendant" },
  "gas-fireplace": { item: "interior-features", value: "fireplace", multi: true },
  "electric-fireplace": { item: "interior-features", value: "fireplace", multi: true },
  "fireplace": { item: "interior-features", value: "fireplace", multi: true },
  "crown-molding": { item: "molding-trim", value: "crown" },
  "wainscoting": { item: "molding-trim", value: "wainscoting" },
  "built-in-shelving": { item: "interior-features", value: "built-in-shelving", multi: true },
  "closet-system": { item: "interior-features", value: "closet-system", multi: true },
  "plantation-shutters": { item: "window-treatments", value: "plantation" },

  // Smart home
  "keypad-locks": { item: "smart-features", value: "smart-locks", multi: true },
  "smart-thermostat": { item: "smart-features", value: "smart-thermostat", multi: true },
  "security-cameras": { item: "security", value: "cameras" },
  "whole-home-audio": { item: "smart-features", value: "whole-home-audio", multi: true },
  "home-theater": { item: "smart-features", value: "home-theater", multi: true },

  // Specialty
  "game-room": { item: "entertainment", value: "game-room", multi: true },
  "home-gym": { item: "entertainment", value: "home-gym", multi: true },
  "sauna": { item: "entertainment", value: "sauna-steam", multi: true },
  "wine-cellar": { item: "entertainment", value: "wine-cellar", multi: true },
  "bunk-room": { item: "entertainment", value: "bunk-room", multi: true },
};

function applyVisionDetection(selections, catId, detection) {
  const mapping = VISION_ITEM_MAP[detection.item];
  if (!mapping) return;

  if (mapping.multi) {
    // Multi-select: add value if not already present
    const current = selections[mapping.item] || [];
    if (!current.includes(mapping.value) && !current.includes("none")) {
      selections[mapping.item] = [...current, mapping.value];
    }
  } else {
    // Single-select: only override if currently "none" or "standard" (don't downgrade)
    const current = selections[mapping.item];
    if (!current || current === "none" || current === "standard") {
      selections[mapping.item] = mapping.value;
    }
  }
}
