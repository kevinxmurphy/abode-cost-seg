"use client";

import { useState, useCallback, useRef } from "react";

/**
 * Hook to analyze Airbnb listing images using Claude Vision.
 * Returns detection results mapped to cost seg categories,
 * plus loading/error state.
 *
 * Results are cached in sessionStorage to avoid re-analyzing on navigation.
 *
 * Usage:
 *   const { analyze, results, loading, analyzed } = useVisionAnalysis();
 *   // Call analyze(images) to start
 *   // results[categoryId] = [{ item, label, quality, confidence }]
 */
export function useVisionAnalysis() {
  const [results, setResults] = useState({}); // categoryId → detections[]
  const [rawResults, setRawResults] = useState([]); // full API response
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzed, setAnalyzed] = useState(false);
  const analyzeRef = useRef(false); // prevent double-fire

  const analyze = useCallback(async (images, propertyType) => {
    if (!images || images.length === 0 || analyzeRef.current) return;
    analyzeRef.current = true;

    // Check sessionStorage cache
    const cacheKey = buildCacheKey(images);
    const cached = getCached(cacheKey);
    if (cached) {
      setResults(cached.byCostSeg);
      setRawResults(cached.raw);
      setAnalyzed(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/vision/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          images: images.map((img) => ({
            imageUrl: img.imageUrl,
            caption: img.caption || "",
          })),
          propertyType,
        }),
      });

      if (!res.ok) {
        throw new Error(`Vision API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.success && Array.isArray(data.results)) {
        const byCostSeg = mapResultsToCostSeg(data.results);
        setResults(byCostSeg);
        setRawResults(data.results);
        setAnalyzed(true);

        // Cache for this session
        setCache(cacheKey, { byCostSeg, raw: data.results });
      }
    } catch (err) {
      console.error("[useVisionAnalysis] Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { analyze, results, rawResults, loading, error, analyzed };
}

/**
 * Map vision API results to cost seg category structure.
 * Returns: { kitchen: [...detections], bathrooms: [...], flooring: [...], ... }
 */
function mapResultsToCostSeg(apiResults) {
  const byCostSeg = {};

  for (const result of apiResults) {
    if (!result.detections || result.detections.length === 0) continue;

    for (const detection of result.detections) {
      const catId = detection.category;
      if (!catId) continue;

      if (!byCostSeg[catId]) byCostSeg[catId] = [];

      // Deduplicate by item ID
      const existing = byCostSeg[catId].find((d) => d.item === detection.item);
      if (existing) {
        // Keep the higher confidence one
        if (detection.confidence > existing.confidence) {
          Object.assign(existing, detection, { imageUrl: result.imageUrl });
        }
      } else {
        byCostSeg[catId].push({
          ...detection,
          imageUrl: result.imageUrl,
          source: "vision",
        });
      }
    }
  }

  return byCostSeg;
}

// ─── Session Cache ───

const CACHE_PREFIX = "abode_vision_";

function buildCacheKey(images) {
  // Use first 4 image URLs as cache key
  const urls = images
    .slice(0, 4)
    .map((img) => img.imageUrl || "")
    .join("|");
  // Simple hash
  let hash = 0;
  for (let i = 0; i < urls.length; i++) {
    hash = ((hash << 5) - hash + urls.charCodeAt(i)) | 0;
  }
  return CACHE_PREFIX + Math.abs(hash).toString(36);
}

function getCached(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 30 minutes
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return data.value;
  } catch {
    return null;
  }
}

function setCache(key, value) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }));
  } catch {
    // sessionStorage full — ignore
  }
}
