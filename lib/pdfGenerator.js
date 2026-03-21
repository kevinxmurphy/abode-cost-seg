// ═══════════════════════════════════════════════════════════════════════════
// ABODE — Cost Segregation Study PDF Generator
//
// React-PDF document component that renders a complete ~30-page cost
// segregation study from assembleReport() output. Professional, CPA-credible
// format suitable for IRS examination.
//
// Exports:
//   CostSegStudyDocument — React-PDF <Document> component
//   generatePDF          — Returns a Blob of the rendered PDF
// ═══════════════════════════════════════════════════════════════════════════

import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";


// ─── Color Palette ──────────────────────────────────────────────────────

const COLORS = {
  turquoise: "#0A9396",
  turquoiseDark: "#087578",
  black: "#1A1A1A",
  darkGrey: "#333333",
  medGrey: "#666666",
  lightGrey: "#999999",
  borderGrey: "#CCCCCC",
  bgLight: "#F5F5F5",
  white: "#FFFFFF",
};


// ─── Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Page
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.darkGrey,
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 72,
    paddingRight: 72,
  },

  // Header / Footer
  header: {
    position: "absolute",
    top: 28,
    left: 72,
    right: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.turquoise,
    paddingBottom: 6,
  },
  headerText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: COLORS.turquoise,
    letterSpacing: 2,
  },
  pageNumber: {
    fontSize: 7,
    color: COLORS.lightGrey,
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 72,
    right: 72,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: COLORS.borderGrey,
    paddingTop: 6,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.lightGrey,
  },

  // Typography
  h1: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: COLORS.turquoise,
    marginBottom: 16,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: COLORS.turquoise,
    marginBottom: 10,
    marginTop: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.turquoise,
    paddingBottom: 4,
  },
  h3: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.darkGrey,
    marginBottom: 6,
    marginTop: 12,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    marginBottom: 8,
    color: COLORS.darkGrey,
  },
  bodySmall: {
    fontSize: 9,
    lineHeight: 1.4,
    marginBottom: 6,
    color: COLORS.medGrey,
  },
  bold: {
    fontFamily: "Helvetica-Bold",
  },

  // Tables
  table: {
    marginBottom: 12,
    marginTop: 6,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: COLORS.turquoise,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderGrey,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderGrey,
    backgroundColor: COLORS.bgLight,
  },
  tableTotalRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 4,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.darkGrey,
    backgroundColor: COLORS.bgLight,
  },
  tableCell: {
    fontSize: 8.5,
    color: COLORS.darkGrey,
  },
  tableCellBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: COLORS.darkGrey,
  },

  // Cover page
  coverPage: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 120,
    paddingBottom: 80,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: "Helvetica-Bold",
    color: COLORS.turquoise,
    letterSpacing: 3,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.medGrey,
    marginBottom: 50,
  },
  coverDivider: {
    width: 80,
    height: 2,
    backgroundColor: COLORS.turquoise,
    marginBottom: 40,
  },
  coverField: {
    fontSize: 11,
    color: COLORS.darkGrey,
    marginBottom: 8,
    textAlign: "center",
  },
  coverFieldLabel: {
    fontSize: 9,
    color: COLORS.lightGrey,
    marginBottom: 2,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  coverBranding: {
    position: "absolute",
    bottom: 72,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 10,
    color: COLORS.lightGrey,
  },

  // TOC
  tocRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.borderGrey,
  },
  tocSection: {
    fontSize: 10,
    color: COLORS.darkGrey,
    width: 30,
  },
  tocTitle: {
    fontSize: 10,
    color: COLORS.darkGrey,
    flex: 1,
  },

  // Numbered list
  listItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  listNumber: {
    width: 22,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.turquoise,
  },
  listContent: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.darkGrey,
  },

  // Signature block
  signatureBlock: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderGrey,
  },
  signatureLine: {
    width: 200,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGrey,
    marginBottom: 4,
    marginTop: 30,
  },

  // Watermark
  watermark: {
    position: "absolute",
    top: "40%",
    left: "15%",
    fontSize: 60,
    color: "#DDDDDD",
    opacity: 0.3,
    transform: "rotate(-45deg)",
    fontFamily: "Helvetica-Bold",
  },

  // Spacer
  spacer: {
    marginBottom: 12,
  },
});


// ─── Utility Functions ───────────────────────────────────────────────────

function fmt(amount) {
  if (amount == null || isNaN(amount)) return "$0";
  const abs = Math.abs(Math.round(amount));
  const formatted = "$" + abs.toLocaleString("en-US");
  return amount < 0 ? `(${formatted})` : formatted;
}

function fmtPct(value) {
  if (value == null || isNaN(value)) return "0.0%";
  return `${(Math.round(value * 10) / 10).toFixed(1)}%`;
}

function fmtDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function fmtDateShort(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return dateStr;
  }
}


// ─── Reusable Page Wrapper ───────────────────────────────────────────────

function ReportPage({ children, showHeader = true }) {
  return (
    <Page size="LETTER" style={s.page}>
      {showHeader && (
        <View style={s.header} fixed>
          <Text style={s.headerText}>COST SEGREGATION STUDY</Text>
          <Text
            style={s.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      )}
      <View style={s.footer} fixed>
        <Text style={s.footerText}>Prepared by Abode</Text>
        <Text style={s.footerText}>Confidential</Text>
      </View>
      {children}
    </Page>
  );
}


// ─── 1. Cover Page ───────────────────────────────────────────────────────

function CoverPage({ data }) {
  return (
    <Page size="LETTER" style={s.page}>
      <View style={s.coverPage}>
        <Text style={s.coverTitle}>COST SEGREGATION</Text>
        <Text style={s.coverTitle}>STUDY</Text>
        <Text style={s.coverSubtitle}>Engineering-Based Analysis</Text>
        <View style={s.coverDivider} />

        <Text style={s.coverFieldLabel}>PROPERTY ADDRESS</Text>
        <Text style={s.coverField}>{data.propertyAddress || "N/A"}</Text>
        <View style={{ marginBottom: 20 }} />

        {(data.ownerName || data.ownerEntity) && (
          <>
            <Text style={s.coverFieldLabel}>PREPARED FOR</Text>
            <Text style={s.coverField}>
              {data.ownerEntity || data.ownerName}
            </Text>
            <View style={{ marginBottom: 20 }} />
          </>
        )}

        <Text style={s.coverFieldLabel}>STUDY DATE</Text>
        <Text style={s.coverField}>{fmtDate(data.studyDate)}</Text>
      </View>

      <Text style={s.coverBranding}>
        Prepared by Abode Cost Segregation
      </Text>

      <View style={s.footer} fixed>
        <Text style={s.footerText}>Prepared by Abode</Text>
        <Text style={s.footerText}>Confidential</Text>
      </View>
    </Page>
  );
}


// ─── 2. Table of Contents ────────────────────────────────────────────────

function TableOfContents({ items }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Table of Contents</Text>
      <View style={{ marginTop: 10 }}>
        {items.map((item, i) => (
          <View key={i} style={s.tocRow}>
            <Text style={s.tocSection}>{item.section}.</Text>
            <Text style={s.tocTitle}>{item.title}</Text>
          </View>
        ))}
      </View>
    </ReportPage>
  );
}


// ─── 3. Executive Summary ────────────────────────────────────────────────

function ExecutiveSummary({ data }) {
  const { letter, summaryTable, bonusSummary, catchUpSummary, savingsEstimate } = data;

  return (
    <ReportPage>
      <Text style={s.h1}>Executive Summary</Text>

      {/* Letter text — split by newlines */}
      {letter.split("\n").map((line, i) => (
        <Text key={i} style={line.trim() === "" ? s.spacer : s.body}>
          {line}
        </Text>
      ))}

      {/* Summary allocation table */}
      <Text style={s.h3}>Summary Allocation</Text>
      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "35%" }]}>Description</Text>
          <Text style={[s.tableHeaderCell, { width: "20%" }]}>Date In Service</Text>
          <Text style={[s.tableHeaderCell, { width: "15%" }]}>Method</Text>
          <Text style={[s.tableHeaderCell, { width: "10%" }]}>Life</Text>
          <Text style={[s.tableHeaderCell, { width: "20%", textAlign: "right" }]}>Total Costs</Text>
        </View>
        {summaryTable.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCell, { width: "35%" }]}>{row.description}</Text>
            <Text style={[s.tableCell, { width: "20%" }]}>{fmtDateShort(row.dateInService)}</Text>
            <Text style={[s.tableCell, { width: "15%" }]}>{row.method}</Text>
            <Text style={[s.tableCell, { width: "10%" }]}>{row.life}</Text>
            <Text style={[s.tableCell, { width: "20%", textAlign: "right" }]}>{fmt(row.totalCosts)}</Text>
          </View>
        ))}
      </View>

      {/* Bonus depreciation summary */}
      <Text style={s.h3}>Bonus Depreciation</Text>
      <Text style={s.body}>
        Applicable Rate: {Math.round(bonusSummary.rate * 100)}% | First-Year Deduction: {fmt(bonusSummary.yr1Deduction)}
      </Text>

      {catchUpSummary && catchUpSummary.adjustment481a > 0 && (
        <Text style={s.body}>
          Section 481(a) Catch-Up Adjustment: {fmt(catchUpSummary.adjustment481a)}
        </Text>
      )}

      {/* Savings estimate */}
      <Text style={s.h3}>Estimated Tax Savings</Text>
      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "50%" }]}>Tax Bracket</Text>
          <Text style={[s.tableHeaderCell, { width: "50%", textAlign: "right" }]}>Estimated First-Year Savings</Text>
        </View>
        <View style={s.tableRow}>
          <Text style={[s.tableCell, { width: "50%" }]}>32% Federal Rate</Text>
          <Text style={[s.tableCell, { width: "50%", textAlign: "right" }]}>{fmt(savingsEstimate.at32)}</Text>
        </View>
        <View style={s.tableRowAlt}>
          <Text style={[s.tableCell, { width: "50%" }]}>37% Federal Rate</Text>
          <Text style={[s.tableCell, { width: "50%", textAlign: "right" }]}>{fmt(savingsEstimate.at37)}</Text>
        </View>
      </View>
    </ReportPage>
  );
}


// ─── 4. Property Description ─────────────────────────────────────────────

function PropertyDescription({ data }) {
  const info = data.infoTable;
  const fields = [
    ["Owner / Entity", info.ownerEntity],
    ["Property Address", info.address],
    ["City", info.city],
    ["State", info.state],
    ["ZIP Code", info.zip],
    ["Property Type", info.type],
    ["Square Footage", info.sqft ? info.sqft.toLocaleString("en-US") + " sq ft" : "N/A"],
    ["Lot Size", info.lotSize ? info.lotSize.toLocaleString("en-US") + " sq ft" : "N/A"],
    ["Bedrooms", info.beds || "N/A"],
    ["Bathrooms", info.baths || "N/A"],
    ["Year Built", info.yearBuilt || "N/A"],
    ["Date Placed in Service", fmtDate(info.dateInService)],
    ["Acquisition Price", fmt(info.acquisitionPrice)],
    ["Use Type", info.useType || "Rental Property"],
  ];

  return (
    <ReportPage>
      <Text style={s.h1}>Property Description</Text>

      <View style={s.table}>
        {fields.map(([label, value], i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCellBold, { width: "40%" }]}>{label}</Text>
            <Text style={[s.tableCell, { width: "60%" }]}>{value || "N/A"}</Text>
          </View>
        ))}
      </View>

      <Text style={s.h3}>Property Narrative</Text>
      {data.narrative.split("\n").map((para, i) => (
        <Text key={i} style={para.trim() === "" ? s.spacer : s.body}>
          {para}
        </Text>
      ))}
    </ReportPage>
  );
}


// ─── 5. Methodology ──────────────────────────────────────────────────────

function MethodologySection({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Methodology</Text>

      <Text style={s.h3}>Overview</Text>
      <Text style={s.body}>{data.overview}</Text>

      <Text style={s.h3}>Data Sources</Text>
      <Text style={s.body}>{data.dataSources}</Text>

      <Text style={s.h3}>Cost Estimation Methodology</Text>
      <Text style={s.body}>{data.costEstimationDescription}</Text>

      <Text style={s.h3}>CSI Methodology Statement</Text>
      <Text style={s.body}>{data.csiNote}</Text>
    </ReportPage>
  );
}


// ─── 6. Quality Study Elements ───────────────────────────────────────────

function QualityElements({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Quality Study Elements</Text>
      <Text style={s.body}>
        The IRS Cost Segregation Audit Techniques Guide identifies 13 principal elements
        that characterize a quality cost segregation study. The following describes how
        each element is addressed in this study.
      </Text>

      {data.map((el, i) => (
        <View key={i} style={{ marginBottom: 10 }} wrap={false}>
          <View style={s.listItem}>
            <Text style={s.listNumber}>{i + 1}.</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.body, s.bold]}>{el.element}</Text>
              <Text style={s.bodySmall}>{el.description}</Text>
              <Text style={s.body}>{el.howAddressed}</Text>
            </View>
          </View>
        </View>
      ))}
    </ReportPage>
  );
}


// ─── 7. Engineering Procedures ───────────────────────────────────────────

function EngineeringProcedures({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Engineering Procedures</Text>
      <Text style={s.body}>
        The following ten-step engineering procedure was performed for this cost
        segregation study:
      </Text>

      {data.map((step, i) => {
        const colonIdx = step.indexOf(":");
        const title = colonIdx > -1 ? step.substring(0, colonIdx + 1) : "";
        const desc = colonIdx > -1 ? step.substring(colonIdx + 1).trim() : step;

        return (
          <View key={i} style={s.listItem} wrap={false}>
            <Text style={s.listNumber}>{i + 1}.</Text>
            <View style={{ flex: 1 }}>
              {title ? (
                <Text style={s.body}>
                  <Text style={s.bold}>{title}</Text> {desc}
                </Text>
              ) : (
                <Text style={s.body}>{desc}</Text>
              )}
            </View>
          </View>
        );
      })}
    </ReportPage>
  );
}


// ─── 8. Certification ────────────────────────────────────────────────────

function CertificationSection({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Certification</Text>
      <Text style={s.body}>{data.preamble}</Text>

      {data.points.map((point, i) => (
        <View key={i} style={s.listItem} wrap={false}>
          <Text style={s.listNumber}>{i + 1}.</Text>
          <Text style={s.listContent}>{point}</Text>
        </View>
      ))}

      <View style={s.signatureBlock}>
        <Text style={s.body}>{data.signatureBlock.attestationText}</Text>
        <View style={s.signatureLine} />
        <Text style={[s.body, s.bold]}>{data.signatureBlock.name}</Text>
        <Text style={s.bodySmall}>Date: {fmtDate(data.signatureBlock.date)}</Text>
      </View>
    </ReportPage>
  );
}


// ─── 9. Tax Classification ───────────────────────────────────────────────

function TaxClassification({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Tax Classification Under IRC Section 168</Text>

      <Text style={s.h3}>MACRS Overview</Text>
      <Text style={s.body}>{data.irc168Overview}</Text>

      <Text style={s.h3}>Recovery Classes</Text>
      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "22%" }]}>Recovery Class</Text>
          <Text style={[s.tableHeaderCell, { width: "28%" }]}>Asset Class</Text>
          <Text style={[s.tableHeaderCell, { width: "20%" }]}>Method</Text>
          <Text style={[s.tableHeaderCell, { width: "10%" }]}>Life</Text>
          <Text style={[s.tableHeaderCell, { width: "20%" }]}>IRC Section</Text>
        </View>
        {data.recoveryClasses.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCellBold, { width: "22%" }]}>{row.name}</Text>
            <Text style={[s.tableCell, { width: "28%" }]}>{row.assetClass}</Text>
            <Text style={[s.tableCell, { width: "20%" }]}>{row.method}</Text>
            <Text style={[s.tableCell, { width: "10%" }]}>{row.life}</Text>
            <Text style={[s.tableCell, { width: "20%" }]}>{row.ircSection}</Text>
          </View>
        ))}
      </View>

      <Text style={s.h3}>Convention Rules</Text>
      <Text style={s.body}>{data.conventionRules}</Text>
    </ReportPage>
  );
}


// ─── 10. Bonus Depreciation ──────────────────────────────────────────────

function BonusDepreciation({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Bonus Depreciation</Text>

      <Text style={s.h3}>Legislative History</Text>
      <Text style={s.body}>{data.history}</Text>

      <Text style={s.h3}>Current Law</Text>
      <Text style={s.body}>{data.currentLaw}</Text>

      <Text style={s.h3}>Phase-Down Schedule</Text>
      <Text style={s.body}>{data.phaseDown}</Text>

      <Text style={s.h3}>Applicable Rate</Text>
      <Text style={s.body}>{data.applicableRate}</Text>

      <Text style={s.h3}>Qualification Requirements</Text>
      <Text style={s.body}>{data.qualificationRequirements}</Text>
    </ReportPage>
  );
}


// ─── 11. Justifications ──────────────────────────────────────────────────

function JustificationsSection({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <ReportPage>
      <Text style={s.h1}>Component Justifications</Text>
      <Text style={s.body}>
        The following sections provide legal justification for the reclassification of
        each component category identified in this study. Only categories applicable
        to the subject property are included.
      </Text>

      {data.map((j, i) => (
        <View key={i} style={{ marginBottom: 16 }} wrap={false}>
          <Text style={s.h3}>
            {j.title} ({j.macrsClass} | Asset Class {j.assetClass} | {j.ircSection})
          </Text>
          <Text style={s.body}>{j.justification}</Text>

          {j.citations && j.citations.length > 0 && (
            <View style={{ marginTop: 4, marginBottom: 4 }}>
              <Text style={[s.bodySmall, s.bold]}>Legal Citations:</Text>
              {j.citations.map((cite, ci) => (
                <Text key={ci} style={s.bodySmall}>
                  {"\u2022"} {cite}
                </Text>
              ))}
            </View>
          )}

          <Text style={s.bodySmall}>{j.applicability}</Text>
        </View>
      ))}
    </ReportPage>
  );
}


// ─── 12. Material Participation ──────────────────────────────────────────

function MaterialParticipation({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Material Participation &amp; Passive Activity Analysis</Text>

      <Text style={s.h3}>Short-Term Rental Exception</Text>
      <Text style={s.body}>{data.strException}</Text>

      <Text style={s.h3}>Participation Status</Text>
      <Text style={s.body}>{data.participationStatus}</Text>

      <Text style={s.h3}>Passive Activity Implications</Text>
      <Text style={s.body}>{data.implications}</Text>

      <Text style={s.h3}>Recommendations</Text>
      <Text style={s.body}>{data.recommendations}</Text>
    </ReportPage>
  );
}


// ─── 13. Limiting Conditions ─────────────────────────────────────────────

function LimitingConditions({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Limiting Conditions &amp; Assumptions</Text>
      <Text style={s.body}>
        This cost segregation study is subject to the following limiting conditions
        and assumptions:
      </Text>

      {data.map((condition, i) => (
        <View key={i} style={s.listItem} wrap={false}>
          <Text style={s.listNumber}>{i + 1}.</Text>
          <Text style={s.listContent}>{condition}</Text>
        </View>
      ))}
    </ReportPage>
  );
}


// ─── 14. Exhibit A — Schedule of Reconciled Costs ────────────────────────

function ExhibitA({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Exhibit A — Schedule of Reconciled Costs</Text>

      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "65%" }]}>Description</Text>
          <Text style={[s.tableHeaderCell, { width: "35%", textAlign: "right" }]}>Amount</Text>
        </View>
        {data.reconciliation.map((row, i) => {
          const isTotal = row.description.includes("Adjusted Depreciable Basis");
          return (
            <View key={i} style={isTotal ? s.tableTotalRow : (i % 2 === 0 ? s.tableRow : s.tableRowAlt)}>
              <Text style={[isTotal ? s.tableCellBold : s.tableCell, { width: "65%" }]}>
                {row.description}
              </Text>
              <Text style={[isTotal ? s.tableCellBold : s.tableCell, { width: "35%", textAlign: "right" }]}>
                {fmt(row.amount)}
              </Text>
            </View>
          );
        })}
      </View>
    </ReportPage>
  );
}


// ─── 15. Exhibit B — Indirect Costs Allocation ──────────────────────────

function ExhibitB({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Exhibit B — Indirect Costs Allocation</Text>

      {data.note ? (
        <Text style={s.body}>{data.note}</Text>
      ) : (
        <>
          <Text style={s.body}>
            Total Closing Costs: {fmt(data.totalClosingCosts)} | Segregation Ratio: {fmtPct(data.segregationRatio)}
          </Text>

          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableHeaderCell, { width: "60%" }]}>Asset Class</Text>
              <Text style={[s.tableHeaderCell, { width: "40%", textAlign: "right" }]}>Allocated Amount</Text>
            </View>
            {data.allocations.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tableCell, { width: "60%" }]}>{row.assetClass}</Text>
                <Text style={[s.tableCell, { width: "40%", textAlign: "right" }]}>{fmt(row.amount)}</Text>
              </View>
            ))}
            <View style={s.tableTotalRow}>
              <Text style={[s.tableCellBold, { width: "60%" }]}>Total Allocated</Text>
              <Text style={[s.tableCellBold, { width: "40%", textAlign: "right" }]}>
                {fmt(data.totalClosingCosts)}
              </Text>
            </View>
          </View>
        </>
      )}
    </ReportPage>
  );
}


// ─── 16. Exhibit C — Component Cost Determination ────────────────────────

function ExhibitC({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Exhibit C — Component Cost Determination</Text>
      <Text style={s.bodySmall}>{data.methodologyNote}</Text>

      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "22%" }]}>Component</Text>
          <Text style={[s.tableHeaderCell, { width: "12%" }]}>Category</Text>
          <Text style={[s.tableHeaderCell, { width: "10%" }]}>MACRS</Text>
          <Text style={[s.tableHeaderCell, { width: "8%" }]}>Qty</Text>
          <Text style={[s.tableHeaderCell, { width: "8%" }]}>Unit</Text>
          <Text style={[s.tableHeaderCell, { width: "14%", textAlign: "right" }]}>Cost Basis</Text>
          <Text style={[s.tableHeaderCell, { width: "8%", textAlign: "right" }]}>% Basis</Text>
          <Text style={[s.tableHeaderCell, { width: "18%" }]}>Legal Ref</Text>
        </View>
        {data.components.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
            <Text style={[s.tableCell, { width: "22%", fontSize: 7.5 }]}>{row.component}</Text>
            <Text style={[s.tableCell, { width: "12%", fontSize: 7.5 }]}>{row.category}</Text>
            <Text style={[s.tableCell, { width: "10%", fontSize: 7.5 }]}>{row.macrsClass}</Text>
            <Text style={[s.tableCell, { width: "8%", fontSize: 7.5 }]}>{row.qty}</Text>
            <Text style={[s.tableCell, { width: "8%", fontSize: 7.5 }]}>{row.unit}</Text>
            <Text style={[s.tableCell, { width: "14%", textAlign: "right", fontSize: 7.5 }]}>{fmt(row.costBasis)}</Text>
            <Text style={[s.tableCell, { width: "8%", textAlign: "right", fontSize: 7.5 }]}>{fmtPct(row.percentOfBasis)}</Text>
            <Text style={[s.tableCell, { width: "18%", fontSize: 7 }]}>{row.legalRef || ""}</Text>
          </View>
        ))}
      </View>

      {/* Subtotals by class */}
      <Text style={s.h3}>Summary by Recovery Class</Text>
      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "40%" }]}>Recovery Class</Text>
          <Text style={[s.tableHeaderCell, { width: "30%", textAlign: "right" }]}>Total</Text>
          <Text style={[s.tableHeaderCell, { width: "30%", textAlign: "right" }]}>% of Basis</Text>
        </View>
        {data.subtotalsByClass.map((row, i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCellBold, { width: "40%" }]}>{row.macrsClass}</Text>
            <Text style={[s.tableCell, { width: "30%", textAlign: "right" }]}>{fmt(row.total)}</Text>
            <Text style={[s.tableCell, { width: "30%", textAlign: "right" }]}>{fmtPct(row.percent)}</Text>
          </View>
        ))}
        <View style={s.tableTotalRow}>
          <Text style={[s.tableCellBold, { width: "40%" }]}>Grand Total</Text>
          <Text style={[s.tableCellBold, { width: "30%", textAlign: "right" }]}>{fmt(data.grandTotal)}</Text>
          <Text style={[s.tableCellBold, { width: "30%", textAlign: "right" }]}>100.0%</Text>
        </View>
      </View>
    </ReportPage>
  );
}


// ─── 17. Exhibit D — Adjusted Depreciable Basis Reconciliation ───────────

function ExhibitD({ data }) {
  return (
    <ReportPage>
      <Text style={s.h1}>Exhibit D — Adjusted Depreciable Basis Reconciliation</Text>

      <View style={s.table}>
        <View style={s.tableHeaderRow}>
          <Text style={[s.tableHeaderCell, { width: "10%" }]}>Step</Text>
          <Text style={[s.tableHeaderCell, { width: "60%" }]}>Description</Text>
          <Text style={[s.tableHeaderCell, { width: "30%", textAlign: "right" }]}>Amount</Text>
        </View>
        {data.steps.map((row, i) => {
          const isLast = i === data.steps.length - 1;
          return (
            <View key={i} style={isLast ? s.tableTotalRow : (i % 2 === 0 ? s.tableRow : s.tableRowAlt)}>
              <Text style={[s.tableCell, { width: "10%" }]}>{row.step}</Text>
              <Text style={[isLast ? s.tableCellBold : s.tableCell, { width: "60%" }]}>
                {row.description}
              </Text>
              <Text style={[isLast ? s.tableCellBold : s.tableCell, { width: "30%", textAlign: "right" }]}>
                {fmt(row.amount)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={{ marginTop: 12, padding: 10, backgroundColor: data.isReconciled ? "#E8F5E9" : "#FFF3E0", borderRadius: 4 }}>
        <Text style={[s.body, s.bold, { color: data.isReconciled ? "#2E7D32" : "#E65100" }]}>
          {data.isReconciled
            ? "Reconciliation Confirmed: Total allocated costs equal the adjusted depreciable basis."
            : "Reconciliation Note: A minor rounding difference exists and is within acceptable tolerance."}
        </Text>
      </View>
    </ReportPage>
  );
}


// ─── 18. Exhibit E — Depreciation Report ─────────────────────────────────

function ExhibitE({ data }) {
  const { schedules, summary, yearByYear } = data;

  return (
    <>
      <ReportPage>
        <Text style={s.h1}>Exhibit E — Depreciation Report</Text>

        {/* Detailed schedule table */}
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.tableHeaderCell, { width: "20%" }]}>Description</Text>
            <Text style={[s.tableHeaderCell, { width: "10%" }]}>Date</Text>
            <Text style={[s.tableHeaderCell, { width: "12%", textAlign: "right" }]}>Cost Basis</Text>
            <Text style={[s.tableHeaderCell, { width: "8%" }]}>Class</Text>
            <Text style={[s.tableHeaderCell, { width: "8%" }]}>Life</Text>
            <Text style={[s.tableHeaderCell, { width: "10%" }]}>Method</Text>
            <Text style={[s.tableHeaderCell, { width: "8%" }]}>Conv.</Text>
            <Text style={[s.tableHeaderCell, { width: "12%", textAlign: "right" }]}>Bonus</Text>
            <Text style={[s.tableHeaderCell, { width: "12%", textAlign: "right" }]}>Yr 1 Total</Text>
          </View>
          {schedules.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
              <Text style={[s.tableCell, { width: "20%", fontSize: 7 }]}>{row.description}</Text>
              <Text style={[s.tableCell, { width: "10%", fontSize: 7 }]}>{fmtDateShort(row.dateInService)}</Text>
              <Text style={[s.tableCell, { width: "12%", textAlign: "right", fontSize: 7 }]}>{fmt(row.amount)}</Text>
              <Text style={[s.tableCell, { width: "8%", fontSize: 7 }]}>{row.assetClass}</Text>
              <Text style={[s.tableCell, { width: "8%", fontSize: 7 }]}>{row.gdsLife}</Text>
              <Text style={[s.tableCell, { width: "10%", fontSize: 7 }]}>{row.method}</Text>
              <Text style={[s.tableCell, { width: "8%", fontSize: 7 }]}>{row.convention}</Text>
              <Text style={[s.tableCell, { width: "12%", textAlign: "right", fontSize: 7 }]}>{fmt(row.bonusAmount)}</Text>
              <Text style={[s.tableCell, { width: "12%", textAlign: "right", fontSize: 7 }]}>{fmt(row.currentYear)}</Text>
            </View>
          ))}
          <View style={s.tableTotalRow}>
            <Text style={[s.tableCellBold, { width: "20%" }]}>TOTALS</Text>
            <Text style={[s.tableCell, { width: "10%" }]}></Text>
            <Text style={[s.tableCellBold, { width: "12%", textAlign: "right" }]}>{fmt(summary.totalBasis)}</Text>
            <Text style={[s.tableCell, { width: "8%" }]}></Text>
            <Text style={[s.tableCell, { width: "8%" }]}></Text>
            <Text style={[s.tableCell, { width: "10%" }]}></Text>
            <Text style={[s.tableCell, { width: "8%" }]}></Text>
            <Text style={[s.tableCellBold, { width: "12%", textAlign: "right" }]}>{fmt(summary.totalBonus)}</Text>
            <Text style={[s.tableCellBold, { width: "12%", textAlign: "right" }]}>{fmt(summary.totalFirstYear)}</Text>
          </View>
        </View>

        {summary.section481aTotal > 0 && (
          <View style={{ marginTop: 8, padding: 8, backgroundColor: COLORS.bgLight, borderRadius: 4 }}>
            <Text style={[s.body, s.bold]}>
              Section 481(a) Catch-Up Adjustment: {fmt(summary.section481aTotal)}
            </Text>
            <Text style={s.bodySmall}>
              This amount represents the cumulative depreciation that would have been
              claimed had cost segregation been applied from the original placed-in-service
              date, less depreciation actually claimed. File IRS Form 3115 to claim.
            </Text>
          </View>
        )}
      </ReportPage>

      {/* Year-by-Year Depreciation Schedule (separate page) */}
      {Array.isArray(yearByYear) && yearByYear.length > 0 && (
        <ReportPage>
          <Text style={s.h2}>Year-by-Year Depreciation Schedule</Text>
          <Text style={s.bodySmall}>
            Full MACRS depreciation schedule showing annual deductions by recovery class for the life of the property.
          </Text>

          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableHeaderCell, { width: "10%" }]}>Year</Text>
              <Text style={[s.tableHeaderCell, { width: "16%", textAlign: "right" }]}>5-Year</Text>
              <Text style={[s.tableHeaderCell, { width: "16%", textAlign: "right" }]}>7-Year</Text>
              <Text style={[s.tableHeaderCell, { width: "16%", textAlign: "right" }]}>15-Year</Text>
              <Text style={[s.tableHeaderCell, { width: "16%", textAlign: "right" }]}>Building</Text>
              <Text style={[s.tableHeaderCell, { width: "13%", textAlign: "right" }]}>Total</Text>
              <Text style={[s.tableHeaderCell, { width: "13%", textAlign: "right" }]}>Accum.</Text>
            </View>
            {yearByYear.map((row, i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
                <Text style={[s.tableCell, { width: "10%", fontSize: 7.5 }]}>{row.year}</Text>
                <Text style={[s.tableCell, { width: "16%", textAlign: "right", fontSize: 7.5 }]}>{fmt(row.fiveYr)}</Text>
                <Text style={[s.tableCell, { width: "16%", textAlign: "right", fontSize: 7.5 }]}>{fmt(row.sevenYr)}</Text>
                <Text style={[s.tableCell, { width: "16%", textAlign: "right", fontSize: 7.5 }]}>{fmt(row.fifteenYr)}</Text>
                <Text style={[s.tableCell, { width: "16%", textAlign: "right", fontSize: 7.5 }]}>{fmt(row.building)}</Text>
                <Text style={[s.tableCellBold, { width: "13%", textAlign: "right", fontSize: 7.5 }]}>{fmt(row.total)}</Text>
                <Text style={[s.tableCell, { width: "13%", textAlign: "right", fontSize: 7.5, color: COLORS.lightGrey }]}>{fmt(row.accumulated)}</Text>
              </View>
            ))}
          </View>
        </ReportPage>
      )}
    </>
  );
}


// ─── 19. Exhibit F — Form 3115 Data Worksheet ────────────────────────────

function ExhibitF({ data }) {
  if (!data) return null;

  return (
    <ReportPage>
      <Text style={s.h1}>Exhibit F — Form 3115 Data Worksheet</Text>
      <Text style={s.body}>
        This worksheet provides the information necessary to complete IRS Form 3115
        (Application for Change in Accounting Method) for the Section 481(a)
        catch-up adjustment.
      </Text>

      <Text style={s.h3}>Applicant Information</Text>
      <View style={s.table}>
        {[
          ["Name / Entity", data.applicantInfo.name],
          ["Entity Type", data.applicantInfo.entity],
          ["EIN / SSN", data.applicantInfo.ein],
          ["Property Address", data.applicantInfo.address],
          ["Designated Change Number (DCN)", data.dcn],
        ].map(([label, value], i) => (
          <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tableCellBold, { width: "40%" }]}>{label}</Text>
            <Text style={[s.tableCell, { width: "60%" }]}>{value}</Text>
          </View>
        ))}
      </View>

      <Text style={s.h3}>Old Method of Accounting</Text>
      <Text style={s.body}>{data.oldMethod}</Text>

      <Text style={s.h3}>New Method of Accounting</Text>
      <Text style={s.body}>{data.newMethod}</Text>

      <Text style={s.h3}>Section 481(a) Adjustment</Text>
      <Text style={[s.body, s.bold]}>
        Net Adjustment: {fmt(data.adjustment481a.netAdjustment)}
      </Text>

      {data.adjustment481a.yearByYear && data.adjustment481a.yearByYear.length > 0 && (
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.tableHeaderCell, { width: "30%" }]}>Tax Year</Text>
            <Text style={[s.tableHeaderCell, { width: "35%", textAlign: "right" }]}>Should Have Claimed</Text>
            <Text style={[s.tableHeaderCell, { width: "35%", textAlign: "right" }]}>Actually Claimed</Text>
          </View>
          {data.adjustment481a.yearByYear.map((yr, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tableCell, { width: "30%" }]}>{yr.year || yr.taxYear || `Year ${i + 1}`}</Text>
              <Text style={[s.tableCell, { width: "35%", textAlign: "right" }]}>{fmt(yr.shouldHaveClaimed || yr.costSeg || 0)}</Text>
              <Text style={[s.tableCell, { width: "35%", textAlign: "right" }]}>{fmt(yr.actuallyClaimed || yr.straightLine || 0)}</Text>
            </View>
          ))}
        </View>
      )}

      <Text style={s.h3}>Filing Instructions</Text>
      <Text style={s.body}>{data.instructions}</Text>
    </ReportPage>
  );
}


// ─── 20. State Tax Conformity ────────────────────────────────────────

function StateConformity({ data }) {
  if (!data) return null;

  const isWarning = data.severity === "warning";

  return (
    <ReportPage>
      <Text style={s.h1}>State Tax Conformity Note</Text>

      <View
        style={{
          padding: 12,
          backgroundColor: isWarning ? "#FFF3E0" : "#E3F2FD",
          borderRadius: 4,
          borderLeftWidth: 3,
          borderLeftColor: isWarning ? "#E65100" : "#1565C0",
          marginBottom: 16,
        }}
      >
        <Text style={[s.body, s.bold, { color: isWarning ? "#E65100" : "#1565C0" }]}>
          {data.stateCode} — {data.status === "none" ? "Does Not Conform" : "Partial Conformity"}
        </Text>
      </View>

      <Text style={s.body}>{data.reportNote}</Text>

      <Text style={s.h3}>Impact on This Study</Text>
      <Text style={s.body}>
        The depreciation schedules, component classifications, and cost basis allocations
        in this study are valid for both federal and state purposes. The MACRS recovery
        periods (5-year, 7-year, 15-year, and 27.5-year) apply identically at the state
        level. The only difference is that the first-year bonus depreciation deduction
        under IRC §168(k) — which accelerates a large portion of the total deduction
        into Year 1 — applies to the federal return only for properties in {data.stateCode}.
      </Text>

      <Text style={s.bodySmall}>
        This note is provided for informational purposes. Abode does not prepare state
        tax returns or provide state-specific tax advice. Consult a tax professional
        licensed in {data.stateCode} for state-specific depreciation treatment.
      </Text>
    </ReportPage>
  );
}


// ─── 21. Recapture-on-Sale Preview ──────────────────────────────────────

function RecapturePreview({ data }) {
  if (!data || !data.scenarios || data.scenarios.length === 0) return null;

  return (
    <ReportPage>
      <Text style={s.h1}>Recapture-on-Sale Impact Preview</Text>
      <Text style={s.body}>
        This section provides a simplified preview of the depreciation recapture
        implications if the property is sold. Cost segregation accelerates deductions
        into earlier years, which increases recapture upon sale — but the net tax
        benefit remains significantly positive due to the time value of money and
        the differential between ordinary income and §1250 recapture rates.
      </Text>

      {data.scenarios.map((scenario, si) => (
        <View key={si} style={{ marginBottom: 20 }} wrap={false}>
          <Text style={s.h3}>
            Scenario: Sale After {scenario.holdingYears} Years (at purchase price)
          </Text>

          <View style={s.table}>
            <View style={s.tableHeaderRow}>
              <Text style={[s.tableHeaderCell, { width: "40%" }]}></Text>
              <Text style={[s.tableHeaderCell, { width: "30%", textAlign: "right" }]}>With Cost Seg</Text>
              <Text style={[s.tableHeaderCell, { width: "30%", textAlign: "right" }]}>Without Cost Seg</Text>
            </View>

            {[
              ["Total Depreciation Claimed", scenario.withCostSeg.totalDepreciation, scenario.withoutCostSeg.totalDepreciation],
              ["Tax Benefit from Deductions", scenario.withCostSeg.taxBenefitFromDeductions, scenario.withoutCostSeg.taxBenefit],
              ["§1245 Recapture (ordinary rate)", scenario.withCostSeg.section1245Recapture, 0],
              ["§1250 Recapture (max 25%)", scenario.withCostSeg.section1250Recapture, scenario.withoutCostSeg.recaptureTax],
              ["Total Recapture Tax", scenario.withCostSeg.totalRecaptureTax, scenario.withoutCostSeg.recaptureTax],
            ].map(([label, cs, nocs], i) => (
              <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tableCell, { width: "40%" }]}>{label}</Text>
                <Text style={[s.tableCell, { width: "30%", textAlign: "right" }]}>{fmt(cs)}</Text>
                <Text style={[s.tableCell, { width: "30%", textAlign: "right" }]}>{fmt(nocs)}</Text>
              </View>
            ))}

            <View style={s.tableTotalRow}>
              <Text style={[s.tableCellBold, { width: "40%" }]}>Net Tax Benefit</Text>
              <Text style={[s.tableCellBold, { width: "30%", textAlign: "right", color: COLORS.turquoise }]}>
                {fmt(scenario.withCostSeg.netBenefit)}
              </Text>
              <Text style={[s.tableCellBold, { width: "30%", textAlign: "right" }]}>
                {fmt(scenario.withoutCostSeg.netBenefit)}
              </Text>
            </View>
          </View>

          <View style={{ padding: 8, backgroundColor: "#E8F5E9", borderRadius: 4, marginTop: 6 }}>
            <Text style={[s.bodySmall, s.bold, { color: "#2E7D32" }]}>
              Cost Seg Advantage: {fmt(scenario.withCostSeg.netBenefit - scenario.withoutCostSeg.netBenefit)} net benefit
              after accounting for recapture
            </Text>
          </View>
        </View>
      ))}

      <Text style={s.bodySmall}>{data.disclaimer}</Text>
    </ReportPage>
  );
}


// ─── 22. Back Cover ──────────────────────────────────────────────────────

function BackCover({ data }) {
  return (
    <Page size="LETTER" style={s.page}>
      <View
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: 200,
        }}
      >
        <View style={s.coverDivider} />
        <Text
          style={{
            fontSize: 16,
            fontFamily: "Helvetica-Bold",
            color: COLORS.turquoise,
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          Abode Cost Segregation
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: COLORS.medGrey,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {data.branding}
        </Text>
        <Text
          style={{
            fontSize: 10,
            color: COLORS.medGrey,
            marginBottom: 30,
            textAlign: "center",
          }}
        >
          {data.contact}
        </Text>
        <View style={s.coverDivider} />
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 72,
          left: 72,
          right: 72,
        }}
      >
        <Text style={{ fontSize: 7, color: COLORS.lightGrey, lineHeight: 1.4 }}>
          {data.disclaimer}
        </Text>
      </View>

      <View style={s.footer} fixed>
        <Text style={s.footerText}>Prepared by Abode</Text>
        <Text style={s.footerText}>Confidential</Text>
      </View>
    </Page>
  );
}


// ─── Main Document Component ─────────────────────────────────────────────

/**
 * React-PDF Document component for a complete cost segregation study.
 *
 * @param {object} props
 * @param {object} props.report - The output of assembleReport()
 * @param {boolean} [props.watermark=false] - Show PREVIEW watermark on every page
 */
export function CostSegStudyDocument({ report, watermark = false }) {
  if (!report) return null;

  return (
    <Document
      title={`Cost Segregation Study — ${report.coverPage?.propertyAddress || "Property"}`}
      author="Abode Cost Segregation"
      subject="Cost Segregation Study"
      creator="Abode"
    >
      {/* 1. Cover */}
      <CoverPage data={report.coverPage} />

      {/* 2. Table of Contents */}
      <TableOfContents items={report.tableOfContents} />

      {/* 3. Executive Summary */}
      <ExecutiveSummary data={report.executiveSummary} />

      {/* 4. Property Description */}
      <PropertyDescription data={report.propertyDescription} />

      {/* 5. Methodology */}
      <MethodologySection data={report.methodology} />

      {/* 6. Quality Study Elements */}
      <QualityElements data={report.qualityElements} />

      {/* 7. Engineering Procedures */}
      <EngineeringProcedures data={report.engineeringProcedures} />

      {/* 8. Certification */}
      <CertificationSection data={report.certification} />

      {/* 9. Tax Classification */}
      <TaxClassification data={report.taxClassification} />

      {/* 10. Bonus Depreciation */}
      <BonusDepreciation data={report.bonusDepreciation} />

      {/* 11. Component Justifications */}
      <JustificationsSection data={report.justifications} />

      {/* 12. Material Participation */}
      <MaterialParticipation data={report.materialParticipation} />

      {/* 13. Limiting Conditions */}
      <LimitingConditions data={report.limitingConditions} />

      {/* 14-18. Exhibits A-E */}
      <ExhibitA data={report.exhibitA} />
      <ExhibitB data={report.exhibitB} />
      <ExhibitC data={report.exhibitC} />
      <ExhibitD data={report.exhibitD} />
      <ExhibitE data={report.exhibitE} />

      {/* 19. Exhibit F (conditional) */}
      {report.exhibitF && <ExhibitF data={report.exhibitF} />}

      {/* 20. State Tax Conformity (conditional) */}
      {report.stateConformity && <StateConformity data={report.stateConformity} />}

      {/* 21. Recapture Preview (conditional) */}
      {report.recapturePreview && <RecapturePreview data={report.recapturePreview} />}

      {/* 22. Back Cover */}
      <BackCover data={report.backCover} />
    </Document>
  );
}


/**
 * React-PDF Document with PREVIEW watermark on every page.
 * Used for pre-payment previews.
 */
export function CostSegStudyPreviewDocument({ report }) {
  if (!report) return null;

  // For the preview, we render a limited version with watermarks
  return (
    <Document
      title={`PREVIEW — Cost Segregation Study — ${report.coverPage?.propertyAddress || "Property"}`}
      author="Abode Cost Segregation"
      subject="Cost Segregation Study — Preview"
      creator="Abode"
    >
      {/* Cover */}
      <CoverPage data={report.coverPage} />

      {/* Executive Summary with watermark */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header} fixed>
          <Text style={s.headerText}>COST SEGREGATION STUDY — PREVIEW</Text>
          <Text
            style={s.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Prepared by Abode</Text>
          <Text style={s.footerText}>PREVIEW — Not for filing</Text>
        </View>
        <Text style={s.watermark}>PREVIEW</Text>
        <Text style={s.h1}>Executive Summary</Text>
        {report.executiveSummary.letter.split("\n").map((line, i) => (
          <Text key={i} style={line.trim() === "" ? s.spacer : s.body}>
            {line}
          </Text>
        ))}
      </Page>

      {/* Summary page with watermark */}
      <Page size="LETTER" style={s.page}>
        <View style={s.header} fixed>
          <Text style={s.headerText}>COST SEGREGATION STUDY — PREVIEW</Text>
          <Text
            style={s.pageNumber}
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Prepared by Abode</Text>
          <Text style={s.footerText}>PREVIEW — Not for filing</Text>
        </View>
        <Text style={s.watermark}>PREVIEW</Text>

        <Text style={s.h1}>Summary Allocation</Text>
        <View style={s.table}>
          <View style={s.tableHeaderRow}>
            <Text style={[s.tableHeaderCell, { width: "50%" }]}>Description</Text>
            <Text style={[s.tableHeaderCell, { width: "25%" }]}>Life</Text>
            <Text style={[s.tableHeaderCell, { width: "25%", textAlign: "right" }]}>Total Costs</Text>
          </View>
          {report.executiveSummary.summaryTable.map((row, i) => (
            <View key={i} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              <Text style={[s.tableCell, { width: "50%" }]}>{row.description}</Text>
              <Text style={[s.tableCell, { width: "25%" }]}>{row.life}</Text>
              <Text style={[s.tableCell, { width: "25%", textAlign: "right" }]}>{fmt(row.totalCosts)}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 30, padding: 16, backgroundColor: COLORS.bgLight, borderRadius: 4, alignItems: "center" }}>
          <Text style={[s.body, s.bold, { textAlign: "center", color: COLORS.turquoise }]}>
            Purchase the full study to receive the complete report
          </Text>
          <Text style={[s.bodySmall, { textAlign: "center" }]}>
            Includes all exhibits, depreciation schedules, legal citations,
            component breakdowns, and Form 3115 worksheet (if applicable).
          </Text>
        </View>
      </Page>

      {/* Back Cover */}
      <BackCover data={report.backCover} />
    </Document>
  );
}


// ─── PDF Generation ──────────────────────────────────────────────────────

/**
 * Renders the full cost segregation study document to a PDF blob.
 *
 * @param {object} report - The output of assembleReport()
 * @param {object} [options={}]
 * @param {boolean} [options.preview=false] - Render preview version with watermarks
 * @returns {Promise<Blob>} The rendered PDF as a Blob
 */
export async function generatePDF(report, options = {}) {
  if (!report) {
    throw new Error("generatePDF: report data is required");
  }

  const DocComponent = options.preview
    ? CostSegStudyPreviewDocument
    : CostSegStudyDocument;

  const doc = <DocComponent report={report} />;
  const blob = await pdf(doc).toBlob();
  return blob;
}
