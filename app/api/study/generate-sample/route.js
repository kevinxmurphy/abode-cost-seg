// ═══════════════════════════════════════════════════════
// GET /api/study/generate-sample
// Generates a sample cost seg study PDF using test property data.
// For development/review purposes only.
// ═══════════════════════════════════════════════════════

import { generateStudy } from "@/lib/reportEngine";
import { assembleReport } from "@/lib/reportAssembler";

export async function GET() {
  // Canyon Trail Resort — Indio, CA (Kevin's test property)
  const studyInputs = {
    purchasePrice: 875000,
    closingCosts: 12500,
    landValue: 148750,
    placedInServiceDate: new Date("2024-06-15"),
    acquisitionDate: new Date("2024-06-15"),
    ownerName: "Kevin Murphy",
    ownerEntity: "Canyon Trail Holdings LLC",
    propertyAddress: "74001 Desert Rose Lane, La Quinta, CA 92253",
    propertyType: "Single Family",
    sqft: 2850,
    beds: 4,
    baths: 2,
    yearBuilt: 2018,
    isFurnished: true,
    materialParticipation: {
      hours: "500+",
      usesPropertyManager: "no",
    },
    taxBracket: 32,
    wizardAnswers: {
      flooring: ["hardwood", "tile"],
      kitchen: ["granite-counters", "stainless-appliances", "tile-backsplash"],
      bathroom: ["dual-vanity", "soaker-tub"],
      outdoor: ["pool", "hot-tub", "fire-pit", "outdoor-kitchen", "patio-concrete"],
      lighting: ["recessed", "decorative-fixtures"],
      hvac: ["central-ac", "ceiling-fans"],
      specialty: ["smart-locks", "security-cameras"],
      furnishings: ["fully-furnished"],
    },
  };

  const study = generateStudy(studyInputs);

  const report = assembleReport(study, {
    ownerName: studyInputs.ownerName,
    ownerEntity: studyInputs.ownerEntity,
    attestationName: "Kevin Murphy",
    amenities: [
      "Pool (heated, saltwater)",
      "Hot tub (12-person)",
      "Outdoor kitchen with BBQ",
      "Fire pit with seating",
      "Smart home (keypad entry, security cameras)",
      "Central air conditioning",
      "Indoor gas fireplace",
      "Fully furnished (4 bedrooms, 7 beds)",
      "Stainless steel appliances",
      "Granite countertops",
      "Dual vanity bathrooms",
      "Soaker tub in master",
      "Hardwood and tile flooring",
      "Recessed and decorative lighting",
      "55\" HDTV with streaming",
      "Private fenced backyard",
    ],
    useType: "Short-Term Rental",
    lotSize: 8712,
  });

  // Generate PDF
  const { generatePDF } = await import("@/lib/pdfGenerator");
  const pdfBlob = await generatePDF(report, { preview: false });
  const buffer = await pdfBlob.arrayBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="Abode_Sample_Study_Canyon_Trail.pdf"',
      "Content-Length": String(buffer.byteLength),
    },
  });
}
