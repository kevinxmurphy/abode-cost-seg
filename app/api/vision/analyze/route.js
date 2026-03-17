// ═══════════════════════════════════════════════════════
// POST /api/vision/analyze — AI Image Analysis
// ═══════════════════════════════════════════════════════
// Analyzes Airbnb listing photos using Claude Vision to detect
// fixtures, finishes, materials, and amenities relevant to
// cost segregation asset classification.
//
// Input:  { images: [{ imageUrl, caption }], propertyType? }
// Output: { results: [{ imageUrl, category, detections }] }

import { NextResponse } from "next/server";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Cost seg detection prompt — tells Claude exactly what to look for
const SYSTEM_PROMPT = `You are a cost segregation property analyst. You analyze photos of rental properties to identify depreciable assets and their quality levels.

For each image, identify ALL visible items from these categories:

KITCHEN: countertop material (granite, quartz, marble, laminate, butcher-block), cabinet quality (custom, semi-custom, stock, painted, stained), appliances (stainless-steel, standard, commercial-grade), backsplash (tile, stone, none)

BATHROOMS: fixtures quality (standard, upgraded, luxury), features (soaking-tub, walk-in-shower, dual-vanity, frameless-glass, heated-floors, rain-shower, jetted-tub), tile work (floor-to-ceiling, accent-wall, standard)

FLOORING: material (hardwood, engineered-hardwood, tile, lvp, carpet, marble, travertine, concrete, slate), condition (new, good, worn)

OUTDOOR: pool (CRITICAL — detect ANY pool: swimming pool, pool area, water visible, pool furniture/lounge chairs around water, pool tile, pool coping, infinity edge, plunge pool — if you see ANY water feature that could be a pool, flag it as pool; also detect saltwater vs chlorine pool, hot-tub/jacuzzi/spa, deck-patio material (composite, wood, stone, concrete, travertine), outdoor-kitchen, built-in-grill, fire-pit, pergola/covered-patio, landscaping quality (professional, basic), fencing (wrought-iron, wood, block-wall, vinyl)

HVAC: visible systems (mini-split, central, ceiling-fan, wall-unit)

INTERIOR: lighting (recessed, chandelier, pendant, track, sconce), fireplace (gas, wood, electric), crown-molding, wainscoting, accent-walls, window-treatments (plantation-shutters, motorized-blinds, curtains), built-in-shelving, closet-system

SMART HOME: keypad-locks, security-cameras, smart-thermostat, whole-home-audio speakers, home-theater

SPECIALTY: game-room, home-gym, wine-cellar, sauna, bunk-room

Respond ONLY with valid JSON. No markdown, no explanation.`;

const USER_PROMPT = `Analyze this property photo. Return a JSON object with:
{
  "room_type": "kitchen|bathroom|bedroom|living|outdoor|laundry|hallway|other",
  "detections": [
    {
      "item": "short-id",
      "label": "Human readable name",
      "category": "kitchen|bathrooms|flooring|outdoor|hvac|interior|smart-home|specialty",
      "quality": "standard|upgraded|premium|luxury",
      "confidence": 0.0-1.0
    }
  ]
}

Only include items you can clearly see. Set confidence based on visibility (0.9+ = clearly visible, 0.7-0.9 = likely, 0.5-0.7 = possible).`;

/**
 * Analyze a batch of images (up to 5 at a time to manage API costs).
 */
export async function POST(request) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "Vision API not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { images, propertyType } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { success: false, error: "No images provided" },
        { status: 400 }
      );
    }

    // Limit to 8 images per request to control costs
    const imagesToAnalyze = images.slice(0, 8);

    // Analyze images in parallel (batch of up to 4 concurrent)
    const batchSize = 4;
    const results = [];

    for (let i = 0; i < imagesToAnalyze.length; i += batchSize) {
      const batch = imagesToAnalyze.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((img) => analyzeImage(apiKey, img, propertyType))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const img = batch[j];
        if (result.status === "fulfilled" && result.value) {
          results.push({
            imageUrl: img.imageUrl,
            caption: img.caption || "",
            ...result.value,
          });
        } else {
          // Fallback: return caption-based analysis
          results.push({
            imageUrl: img.imageUrl,
            caption: img.caption || "",
            room_type: "other",
            detections: [],
            error: result.reason?.message || "Analysis failed",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
      analyzed: results.filter((r) => !r.error).length,
      total: results.length,
    });
  } catch (error) {
    console.error("[vision/analyze] Error:", error.message);
    return NextResponse.json(
      { success: false, error: "Image analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * Analyze a single image using Claude Vision.
 */
async function analyzeImage(apiKey, img, propertyType) {
  const captionContext = img.caption ? ` The listing caption for this photo is: "${img.caption}".` : "";
  const typeContext = propertyType ? ` This is a ${propertyType} property.` : "";

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: img.imageUrl,
              },
            },
            {
              type: "text",
              text: USER_PROMPT + captionContext + typeContext,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("[vision/analyze] Claude API error:", response.status, err);
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "";

  // Parse JSON from response (handle potential markdown wrapping)
  try {
    const jsonStr = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(jsonStr);
    return {
      room_type: parsed.room_type || "other",
      detections: Array.isArray(parsed.detections) ? parsed.detections : [],
    };
  } catch (parseError) {
    console.error("[vision/analyze] JSON parse error:", parseError.message, "Raw:", text.slice(0, 200));
    return { room_type: "other", detections: [] };
  }
}
