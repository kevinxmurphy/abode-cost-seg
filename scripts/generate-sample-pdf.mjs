#!/usr/bin/env node
// ═══════════════════════════════════════════════════════
// Generate a sample cost seg study PDF for review.
// Usage: node scripts/generate-sample-pdf.mjs
// Output: sample_study.pdf in project root
// ═══════════════════════════════════════════════════════

import { generateStudy } from "../lib/reportEngine.js";
import { assembleReport } from "../lib/reportAssembler.js";
import { generatePDF } from "../lib/pdfGenerator.js";
import { writeFile } from "fs/promises";

// Use Canyon Trail Resort (your test property in Indio, CA)
const studyInputs = {
  purchasePrice: 875000,
  closingCosts: 12500,
  landValue: 148750, // 17% of purchase price
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

console.log("Generating study...");
const study = generateStudy(studyInputs);

console.log("Assembling report...");
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

console.log("Rendering PDF...");
const pdfBlob = await generatePDF(report, { preview: false });

// Convert Blob to Buffer and write to file
const arrayBuffer = await pdfBlob.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

await writeFile("sample_study.pdf", buffer);
console.log(`\nDone! PDF written to sample_study.pdf (${(buffer.length / 1024).toFixed(0)} KB)`);

// Print key numbers
console.log("\n── Study Summary ──");
console.log(`Purchase Price:       $${study.basis.purchasePrice.toLocaleString()}`);
console.log(`Depreciable Basis:    $${study.basis.adjustedBasis.toLocaleString()}`);
console.log(`Land Value:           $${study.basis.landValue.toLocaleString()}`);
console.log(`Bonus Rate:           ${study.depreciation.bonusRate * 100}%`);
console.log(`First-Year Deduction: $${study.depreciation.totalFirstYearDeduction.toLocaleString()}`);
console.log(`Est. Tax Savings:     $${study.savings.firstYearSavings.toLocaleString()}`);
if (study.catchUp) {
  console.log(`481(a) Adjustment:    $${study.catchUp.adjustment.toLocaleString()}`);
}
console.log(`Convention:           ${study.depreciation.convention}`);
console.log(`Study ID:             ${study.meta.studyId}`);

// State conformity note
if (report.stateConformity) {
  console.log(`\nState Note: ${report.stateConformity.stateCode} — ${report.stateConformity.status}`);
}

// Recapture preview
if (report.recapturePreview) {
  for (const s of report.recapturePreview.scenarios) {
    console.log(`\nRecapture @ ${s.holdingYears}yr: CS advantage = $${s.advantage.toLocaleString()}`);
  }
}
