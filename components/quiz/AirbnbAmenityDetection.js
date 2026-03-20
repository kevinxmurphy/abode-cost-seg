"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Image as ImageIcon,
  ScanSearch,
  MoveRight,
  Upload,
  MessageSquarePlus,
  TriangleAlert,
} from "lucide-react";
import {
  buildRoomCards,
  mergeVisionIntoRoomCards,
  getConfidenceInfo,
} from "@/lib/airbnbImageAnalysis";

// Room categories available for reassignment
const REASSIGN_CATEGORIES = [
  { id: "kitchen", label: "Kitchen" },
  { id: "bathroom", label: "Bathroom" },
  { id: "bedroom", label: "Bedroom" },
  { id: "outdoor", label: "Outdoor / Pool" },
  { id: "living", label: "Living Area" },
  { id: "furniture", label: "Furniture / Personal Property" },
  { id: "general", label: "General / Other" },
];

/**
 * AirbnbAmenityDetection — Visual grid of room photos with detected amenities
 *
 * Shows listing images grouped by room/area type, with detected amenities
 * mapped to cost segregation categories. Supports:
 * - Caption + AI vision-based amenity detection
 * - Manual image reassignment to correct room
 * - Per-room notes / context
 * - Additional image uploads
 */
export default function AirbnbAmenityDetection({ airbnbEnrichment, airbnbImages }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [visionResults, setVisionResults] = useState(null);
  const [visionLoading, setVisionLoading] = useState(false);

  // Image overrides: { imageUrl → catId } for user-reassigned images
  const [imageOverrides, setImageOverrides] = useState({});

  // Per-card notes: { cardId → string }
  const [cardNotes, setCardNotes] = useState({});

  // Per-card uploaded images: { cardId → [{ name, dataUrl }] }
  const [cardUploads, setCardUploads] = useState({});

  // Build images with override metadata applied
  const imagesWithOverrides = useMemo(() => {
    if (!Array.isArray(airbnbImages)) return [];
    return airbnbImages.map((img) => ({
      ...img,
      _overrideCat: imageOverrides[img.imageUrl] || null,
    }));
  }, [airbnbImages, imageOverrides]);

  // Build base room cards (respects _overrideCat from imageOverrides)
  const baseRoomCards = useMemo(
    () => buildRoomCards(imagesWithOverrides, airbnbEnrichment),
    [imagesWithOverrides, airbnbEnrichment]
  );

  // Merge vision results into room cards when available
  const roomCards = useMemo(() => {
    const merged = visionResults
      ? mergeVisionIntoRoomCards(baseRoomCards, visionResults)
      : baseRoomCards;

    // Attach uploaded images to each card
    return merged.map((card) => ({
      ...card,
      uploads: cardUploads[card.id] || [],
    }));
  }, [baseRoomCards, visionResults, cardUploads]);

  // Fire Claude Vision analysis on mount (up to 8 images)
  useEffect(() => {
    if (!Array.isArray(airbnbImages) || airbnbImages.length === 0) return;

    const imagesToAnalyze = airbnbImages
      .filter((img) => img && img.imageUrl)
      .slice(0, 8);

    if (imagesToAnalyze.length === 0) return;

    setVisionLoading(true);

    fetch("/api/vision/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ images: imagesToAnalyze }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && Array.isArray(data.results)) {
          setVisionResults(data.results);
        }
      })
      .catch(() => {
        // Vision is best-effort — caption-based detection still works
      })
      .finally(() => {
        setVisionLoading(false);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // If no meaningful data, don't render
  if (!roomCards || roomCards.length === 0) return null;

  const totalAmenities = roomCards.reduce(
    (sum, card) => sum + card.amenities.length,
    0
  );

  function handleCardToggle(cardId) {
    setExpandedCardId((prev) => (prev === cardId ? null : cardId));
  }

  function openLightbox(imageUrl, caption) {
    setLightboxImage({ url: imageUrl, caption });
  }

  function closeLightbox() {
    setLightboxImage(null);
  }

  function handleReassignImage(imageUrl, newCatId) {
    setImageOverrides((prev) => ({
      ...prev,
      [imageUrl]: newCatId,
    }));
  }

  function handleNoteChange(cardId, value) {
    setCardNotes((prev) => ({ ...prev, [cardId]: value }));
  }

  function handleUpload(cardId, files) {
    if (!files || files.length === 0) return;
    const newUploads = [];
    let loaded = 0;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newUploads.push({ name: file.name, dataUrl: e.target.result });
        loaded++;
        if (loaded === files.length) {
          setCardUploads((prev) => ({
            ...prev,
            [cardId]: [...(prev[cardId] || []), ...newUploads],
          }));
        }
      };
      reader.readAsDataURL(file);
    });
  }

  return (
    <div className="airbnb-detection">
      {/* Collapsible header */}
      <button
        type="button"
        className="airbnb-detection-header"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
      >
        <div className="airbnb-detection-header-left">
          <Sparkles size={16} className="airbnb-detection-icon" />
          <div>
            <span className="airbnb-detection-title">
              Detected from your Airbnb listing
            </span>
            <span className="airbnb-detection-meta">
              {roomCards.length} area{roomCards.length !== 1 ? "s" : ""} &middot;{" "}
              {totalAmenities} amenit{totalAmenities !== 1 ? "ies" : "y"} detected
              {visionLoading && (
                <span className="airbnb-detection-scanning">
                  &middot;{" "}
                  <ScanSearch
                    size={11}
                    style={{ display: "inline", verticalAlign: "middle" }}
                  />{" "}
                  AI scanning photos…
                </span>
              )}
              {!visionLoading && visionResults && (
                <span className="airbnb-detection-scanned">
                  &middot; AI-enhanced
                </span>
              )}
            </span>
          </div>
        </div>
        <span className="airbnb-detection-toggle">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {/* Room grid */}
      {isExpanded && (
        <div className="airbnb-detection-body">
          <div className="airbnb-room-grid">
            {roomCards.map((card) => (
              <RoomCard
                key={card.id}
                card={card}
                isExpanded={expandedCardId === card.id}
                note={cardNotes[card.id] || ""}
                onToggle={() => handleCardToggle(card.id)}
                onImageClick={openLightbox}
                onReassignImage={handleReassignImage}
                onNoteChange={(val) => handleNoteChange(card.id, val)}
                onUpload={(files) => handleUpload(card.id, files)}
                currentOverrides={imageOverrides}
              />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="airbnb-detection-disclaimer">
            <AlertCircle size={13} />
            <span>
              {visionResults
                ? "AI image analysis complete. Move misclassified photos to the correct room, then confirm details in the walkthrough below."
                : "Amenity detection is AI-assisted. If photos are in the wrong area, use the Move button on each image. Add notes or photos to help your cost seg specialist."}
            </span>
          </div>
        </div>
      )}

      {/* Lightbox overlay for full-size image */}
      {lightboxImage && (
        <div
          className="airbnb-lightbox"
          onClick={closeLightbox}
          role="dialog"
          aria-label="Full size image"
        >
          <button
            type="button"
            className="airbnb-lightbox-close"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div
            className="airbnb-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={lightboxImage.url}
              alt={lightboxImage.caption || "Listing photo"}
              className="airbnb-lightbox-img"
            />
            {lightboxImage.caption && (
              <div className="airbnb-lightbox-caption">
                {lightboxImage.caption}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


/**
 * Individual room card — shows thumbnail, label, amenities, and confidence badges
 */
function RoomCard({
  card,
  isExpanded,
  note,
  onToggle,
  onImageClick,
  onReassignImage,
  onNoteChange,
  onUpload,
  currentOverrides,
}) {
  const primaryImage = card.images[0];
  const hasMultipleImages = card.images.length > 1;
  const highConfidenceCount = card.amenities.filter((a) => a.confidence === "high").length;
  const allImages = [...card.images, ...(card.uploads || []).map((u) => ({ imageUrl: u.dataUrl, caption: u.name }))];

  // Count images with vision mismatch warnings
  const mismatchCount = card.images.filter((img) => img._visionCat && !currentOverrides[img.imageUrl]).length;

  return (
    <div className={`airbnb-room-card ${isExpanded ? "expanded" : ""}`}>
      {/* Thumbnail + label header */}
      <button
        type="button"
        className="airbnb-room-card-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <div className="airbnb-room-img-wrap">
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={card.label}
              className="airbnb-room-img"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.classList.add("airbnb-room-img-fallback");
              }}
            />
          ) : (
            <div className="airbnb-room-img-fallback">
              <ImageIcon size={20} />
            </div>
          )}
          {allImages.length > 1 && (
            <span className="airbnb-room-img-count">+{allImages.length - 1}</span>
          )}
        </div>

        <div className="airbnb-room-card-info">
          <span className="airbnb-room-label">{card.label}</span>
          <span className="airbnb-room-amenity-count">
            {card.amenities.length} item{card.amenities.length !== 1 ? "s" : ""} detected
            {highConfidenceCount > 0 && (
              <span className="airbnb-room-confirmed-count">
                &middot; {highConfidenceCount} confirmed
              </span>
            )}
            {mismatchCount > 0 && (
              <span className="airbnb-room-mismatch-warning">
                &middot; <TriangleAlert size={10} style={{ display: "inline", verticalAlign: "middle" }} /> {mismatchCount} photo{mismatchCount > 1 ? "s" : ""} may be misplaced
              </span>
            )}
          </span>
        </div>

        <span className="airbnb-room-card-chevron">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="airbnb-room-card-body">
          {/* Action bar */}
          <div className="airbnb-card-actions">
            <label className="airbnb-card-action-btn" title="Upload additional photos for this area">
              <Upload size={12} />
              Add photo
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => onUpload(e.target.files)}
              />
            </label>
          </div>

          {/* Image gallery (multiple images) */}
          {allImages.length > 1 && (
            <div className="airbnb-room-gallery">
              {allImages.map((img, idx) => (
                <GalleryThumb
                  key={idx}
                  img={img}
                  cardCategory={card.category}
                  currentOverride={currentOverrides[img.imageUrl]}
                  onImageClick={onImageClick}
                  onReassign={onReassignImage}
                />
              ))}
            </div>
          )}

          {/* Single image — clickable for full size */}
          {allImages.length === 1 && allImages[0] && (
            <SingleImageWithActions
              img={allImages[0]}
              cardCategory={card.category}
              label={card.label}
              currentOverride={currentOverrides[allImages[0].imageUrl]}
              onImageClick={onImageClick}
              onReassign={onReassignImage}
            />
          )}

          {/* No images placeholder */}
          {allImages.length === 0 && (
            <div className="airbnb-room-no-images">
              <ImageIcon size={14} />
              No photos found for this area — upload photos below or this area was detected from amenity data.
            </div>
          )}

          {/* Amenity list */}
          {card.amenities.length > 0 ? (
            <ul className="airbnb-room-amenities">
              {card.amenities.map((amenity, idx) => (
                <li key={idx} className="airbnb-room-amenity-item">
                  <ConfidenceBadge confidence={amenity.confidence} />
                  <span className="airbnb-room-amenity-name">{amenity.name}</span>
                  {amenity.costSegCategory && (
                    <span className="airbnb-room-amenity-cat">
                      {amenity.costSegCategory}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="airbnb-room-no-amenities">
              No specific amenities detected for this area. Add details in the walkthrough below or use the notes field.
            </div>
          )}

          {/* Notes / context */}
          <div className="airbnb-card-notes">
            <textarea
              className="airbnb-card-notes-input"
              placeholder="Add context or details (e.g. tile countertop, mid-range appliances, pool heater brand, roofing material…)"
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              rows={2}
            />
          </div>

          {/* Cost seg category link */}
          {card.costSegCategories.length > 0 && (
            <div className="airbnb-room-costseg-link">
              Maps to: {card.costSegCategories.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


/**
 * Gallery thumbnail with move/reassign action overlay
 */
function GalleryThumb({ img, cardCategory, currentOverride, onImageClick, onReassign }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const isMismatched = img._visionCat && img._visionCat !== cardCategory && !currentOverride;

  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div
      className="airbnb-room-gallery-thumb"
      style={isMismatched ? { borderColor: "var(--adobe)" } : undefined}
    >
      <img
        src={img.imageUrl}
        alt={img.caption || "Listing photo"}
        loading="lazy"
        onClick={() => onImageClick(img.imageUrl, img.caption)}
        style={{ cursor: "pointer" }}
      />

      {/* Move button overlay */}
      <div className="airbnb-img-actions">
        <button
          type="button"
          className="airbnb-img-move-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((v) => !v);
          }}
          title="Move to different room"
        >
          <MoveRight size={10} />
          Move
        </button>
      </div>

      {/* AI mismatch hint */}
      {isMismatched && (
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: 3,
            background: "rgba(184,80,48,0.85)",
            color: "#fff",
            fontSize: 9,
            padding: "1px 4px",
            borderRadius: 3,
            fontFamily: "var(--font-primary)",
            pointerEvents: "none",
          }}
        >
          AI: {img._visionCatLabel}?
        </div>
      )}

      {/* Eye overlay */}
      <span
        className="airbnb-room-gallery-zoom"
        onClick={() => onImageClick(img.imageUrl, img.caption)}
      >
        <Eye size={12} />
      </span>

      {/* Dropdown for reassignment */}
      {showDropdown && (
        <div className="airbnb-move-dropdown" ref={dropdownRef}>
          {REASSIGN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`airbnb-move-dropdown-item ${
                (currentOverride || cardCategory) === cat.id ? "active" : ""
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onReassign(img.imageUrl, cat.id);
                setShowDropdown(false);
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


/**
 * Single full-width image with move/reassign action overlay
 */
function SingleImageWithActions({ img, cardCategory, label, currentOverride, onImageClick, onReassign }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const isMismatched = img._visionCat && img._visionCat !== cardCategory && !currentOverride;

  useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div
      className="airbnb-room-full-img-btn"
      style={isMismatched ? { outline: "2px solid var(--adobe)" } : undefined}
    >
      <img
        src={img.imageUrl}
        alt={label}
        className="airbnb-room-full-img"
        loading="lazy"
        onClick={() => onImageClick(img.imageUrl, img.caption)}
        style={{ cursor: "pointer" }}
      />

      <div className="airbnb-img-actions">
        <button
          type="button"
          className="airbnb-img-move-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdown((v) => !v);
          }}
          title="Move to different room"
        >
          <MoveRight size={10} />
          Move
        </button>

        {showDropdown && (
          <div
            className="airbnb-move-dropdown"
            ref={dropdownRef}
            onClick={(e) => e.stopPropagation()}
          >
            {REASSIGN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`airbnb-move-dropdown-item ${
                  (currentOverride || cardCategory) === cat.id ? "active" : ""
                }`}
                onClick={() => {
                  onReassign(img.imageUrl, cat.id);
                  setShowDropdown(false);
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <span
        className="airbnb-room-gallery-zoom"
        onClick={() => onImageClick(img.imageUrl, img.caption)}
      >
        <Eye size={14} />
      </span>
    </div>
  );
}


/**
 * Confidence indicator badge — high / medium / low
 */
function ConfidenceBadge({ confidence }) {
  const info = getConfidenceInfo(confidence);

  const iconMap = {
    high: <CheckCircle size={12} />,
    medium: <HelpCircle size={12} />,
    low: <AlertCircle size={12} />,
  };

  return (
    <span
      className={`airbnb-confidence-badge airbnb-confidence-${confidence}`}
      title={info.description}
    >
      {iconMap[confidence] || iconMap.medium}
      <span className="airbnb-confidence-label">{info.label}</span>
    </span>
  );
}
