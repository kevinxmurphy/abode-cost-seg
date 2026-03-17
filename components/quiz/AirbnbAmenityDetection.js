"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import {
  buildRoomCards,
  getConfidenceInfo,
} from "@/lib/airbnbImageAnalysis";

/**
 * AirbnbAmenityDetection — Visual grid of room photos with detected amenities
 *
 * Shows listing images grouped by room/area type, with detected amenities
 * mapped to cost segregation categories. Uses caption text matching for
 * detection; actual AI image recognition is Phase 2.
 *
 * @param {Object} props
 * @param {Object|null} props.airbnbEnrichment — parsed enrichment JSON with category-level amenity data
 * @param {Array<{caption: string, imageUrl: string}>} props.airbnbImages — listing photos
 */
export default function AirbnbAmenityDetection({ airbnbEnrichment, airbnbImages }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Build room cards from images + enrichment data
  const roomCards = useMemo(
    () => buildRoomCards(airbnbImages, airbnbEnrichment),
    [airbnbImages, airbnbEnrichment]
  );

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
                onToggle={() => handleCardToggle(card.id)}
                onImageClick={openLightbox}
              />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="airbnb-detection-disclaimer">
            <AlertCircle size={13} />
            <span>
              Amenity detection is AI-assisted and should be verified.
              Review each category in the walkthrough below for accuracy.
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
function RoomCard({ card, isExpanded, onToggle, onImageClick }) {
  const primaryImage = card.images[0];
  const hasMultipleImages = card.images.length > 1;
  const highConfidenceCount = card.amenities.filter((a) => a.confidence === "high").length;

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
          {hasMultipleImages && (
            <span className="airbnb-room-img-count">
              +{card.images.length - 1}
            </span>
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
          </span>
        </div>

        <span className="airbnb-room-card-chevron">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="airbnb-room-card-body">
          {/* Image gallery (if multiple images) */}
          {hasMultipleImages && (
            <div className="airbnb-room-gallery">
              {card.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="airbnb-room-gallery-thumb"
                  onClick={() => onImageClick(img.imageUrl, img.caption)}
                  aria-label={`View ${img.caption || "photo"} full size`}
                >
                  <img
                    src={img.imageUrl}
                    alt={img.caption || `${card.label} photo ${idx + 1}`}
                    loading="lazy"
                  />
                  <span className="airbnb-room-gallery-zoom">
                    <Eye size={12} />
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Single image — clickable for full size */}
          {!hasMultipleImages && primaryImage && (
            <button
              type="button"
              className="airbnb-room-full-img-btn"
              onClick={() => onImageClick(primaryImage.imageUrl, primaryImage.caption)}
              aria-label="View full size"
            >
              <img
                src={primaryImage.imageUrl}
                alt={card.label}
                className="airbnb-room-full-img"
                loading="lazy"
              />
              <span className="airbnb-room-gallery-zoom">
                <Eye size={14} />
              </span>
            </button>
          )}

          {/* Amenity list */}
          {card.amenities.length > 0 ? (
            <ul className="airbnb-room-amenities">
              {card.amenities.map((amenity, idx) => (
                <li key={idx} className="airbnb-room-amenity-item">
                  <ConfidenceBadge confidence={amenity.confidence} />
                  <span className="airbnb-room-amenity-name">
                    {amenity.name}
                  </span>
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
              No specific amenities detected for this area.
              You can add details in the walkthrough below.
            </div>
          )}

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
