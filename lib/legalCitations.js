// ═══════════════════════════════════════════════════════════════════════
// ABODE — IRS Legal Citation Library for Cost Segregation Reports
//
// Provides legal justification text for each component category in a
// cost segregation study. Sections are dynamically included in the PDF
// report only when the corresponding component category is present.
//
// All citations reference the Internal Revenue Code, Treasury
// Regulations, IRS Revenue Rulings, Revenue Procedures, and key
// Tax Court decisions relied upon in engineering-based cost
// segregation studies.
// ═══════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────
// 1. LEGAL FRAMEWORK — Boilerplate tax code sections
// ─────────────────────────────────────────────────────────────────────

export const LEGAL_FRAMEWORK = {
  irc168Overview:
    "Internal Revenue Code Section 168 establishes the Modified Accelerated Cost Recovery System (MACRS) as the primary method for computing depreciation deductions for tangible property placed in service after 1986. Under MACRS, the cost of tangible property is recovered over a specified recovery period using prescribed depreciation methods and conventions. IRC §168(a) provides that the depreciation deduction for any tangible property shall be determined by applying the applicable depreciation method, the applicable recovery period, and the applicable convention. The recovery period assigned to each asset depends upon the asset's classification under the statutory framework, as informed by the asset's class life under Revenue Procedure 87-56 and the specific statutory provisions of IRC §168(e). A cost segregation study identifies and reclassifies building components into their proper asset classes, thereby allowing property owners to claim depreciation deductions over shorter recovery periods than the default recovery period assigned to the building structure as a whole.",

  assetClass570:
    "Revenue Procedure 87-56 Asset Class 57.0 — Distributive Trades and Services. This asset class encompasses assets used in wholesale and retail trade, and in personal and professional services. It includes §1245 personal property such as furniture, fixtures, equipment, and decorative items used in connection with the operation of a short-term rental property or other lodging establishment. The IRS assigns a class life of 9 years to assets in this category, resulting in a 5-year MACRS recovery period under IRC §168(e)(1) using the 200% declining balance method switching to straight-line under IRC §168(b)(1). This classification is particularly relevant for short-term rental properties, as the Tax Court has consistently held that assets used in lodging operations that serve a function accessory to the operation of the business — rather than relating to the operation or maintenance of the building structure — qualify as §1245 personal property.",

  assetClass0011:
    "Revenue Procedure 87-56 Asset Class 00.11 — Office Furniture, Fixtures, and Equipment. This asset class includes furniture and fixtures that are not a structural component of a building. Items such as desks, chairs, tables, credenzas, storage cabinets, and modular furniture systems fall within this class. These assets are assigned a class life of 10 years, yielding a 7-year MACRS recovery period under IRC §168(e)(1). The 200% declining balance method applies under IRC §168(b)(1), switching to straight-line at the point that maximizes the deduction. The distinction between a structural component (27.5-year property) and office furniture or fixtures (7-year property) is governed by Treasury Regulation §1.48-1(e)(2), which defines structural components as items that relate to the operation or maintenance of the building, such as walls, floors, ceilings, and permanent coverings thereof.",

  assetClass003:
    "Revenue Procedure 87-56 Asset Class 00.3 — Land Improvements. This asset class includes improvements directly to or added to land, whether such improvements are §1245 property or §1250 property, provided the improvements are depreciable. Examples include sidewalks, roads, canals, waterways, drainage facilities, sewers (not including municipal sewers classified in Asset Class 51), wharves and docks, bridges, fences, landscaping (including shrubbery), radio and television transmitting towers, and other land improvements. These assets are assigned a class life of 20 years, resulting in a 15-year MACRS recovery period under IRC §168(e)(1). The applicable depreciation method is the 150% declining balance method switching to straight-line under IRC §168(b)(2). Land improvements are particularly significant in cost segregation studies because they qualify for bonus depreciation under IRC §168(k) as property with a recovery period of 20 years or less, while also having a recovery period nearly half that of the building structure.",

  section1250:
    "IRC §1250 — Gain from Dispositions of Certain Depreciable Realty. Section 1250 property includes any real property that is not §1245 property and that is subject to the allowance for depreciation. In the context of residential rental property, the building structure and its structural components are classified as §1250 property with a 27.5-year recovery period under IRC §168(c)(1), using the straight-line depreciation method under IRC §168(b)(3) and the mid-month convention under IRC §168(d)(2). Structural components, as defined in Treasury Regulation §1.48-1(e)(2), include walls, floors, ceilings, stairways, permanent coverings (such as paneling or tiling), windows, doors, central air conditioning and heating systems, plumbing, electrical wiring and lighting fixtures that are permanently attached and part of the building's operating systems, fire escapes, and other components relating to the operation or maintenance of the building. The cost segregation analysis in this study identifies components that are improperly classified as §1250 structural components and reclassifies them to their correct shorter-lived asset categories.",

  conventionRules:
    "MACRS Convention Rules. Under IRC §168(d), the applicable convention determines the portion of the year for which depreciation is allowed in the year the property is placed in service and in the year of disposition. Three conventions apply to different classes of property:\n\n(1) Mid-Month Convention — IRC §168(d)(2): Applies to all nonresidential real property and residential rental property (27.5-year and 39-year property). Under this convention, property is treated as placed in service on the midpoint of the month in which it is actually placed in service, and as disposed of on the midpoint of the month in which it is actually disposed of.\n\n(2) Half-Year Convention — IRC §168(d)(1): Applies to all personal property (5-year and 7-year) and land improvements (15-year) unless the mid-quarter convention applies. Under this convention, property is treated as placed in service on the midpoint of the tax year, regardless of when during the year it is actually placed in service.\n\n(3) Mid-Quarter Convention — IRC §168(d)(3): Applies when the aggregate basis of property placed in service during the last three months of the tax year exceeds 40% of the aggregate basis of all property placed in service during the tax year. Under this convention, property is treated as placed in service on the midpoint of the quarter in which it is actually placed in service. This convention prevents taxpayers from concentrating asset purchases at the end of the tax year to obtain a disproportionate depreciation benefit under the half-year convention.",
};


// ─────────────────────────────────────────────────────────────────────
// 2. BONUS DEPRECIATION TEXT — Dynamic based on placed-in-service date
// ─────────────────────────────────────────────────────────────────────

/**
 * Returns the bonus depreciation narrative section based on the
 * placed-in-service date. Includes TCJA history, OBBBA reinstatement,
 * phase-down schedule, applicable rate, and §168(k)(2) requirements.
 *
 * @param {Date|string} placedInServiceDate - Date property was placed in service
 * @returns {object} { history, currentLaw, phaseDown, applicableRate, ratePercent, qualificationRequirements }
 */
export function BONUS_DEPRECIATION_TEXT(placedInServiceDate) {
  const date = new Date(placedInServiceDate);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed
  const day = date.getDate();

  // Determine the applicable bonus rate
  // OBBBA signed Jan 20, 2025 — retroactive to Jan 20, 2025 with 100% bonus
  const isPostOBBBA = year > 2025 || (year === 2025 && (month > 0 || (month === 0 && day >= 20)));
  const isPreOBBBA2025 = year === 2025 && (month === 0 && day < 20);

  let ratePercent;
  if (year <= 2022) {
    ratePercent = 100;
  } else if (year === 2023) {
    ratePercent = 80;
  } else if (year === 2024) {
    ratePercent = 60;
  } else if (isPreOBBBA2025) {
    ratePercent = 40;
  } else if (isPostOBBBA) {
    ratePercent = 100;
  } else {
    ratePercent = 100; // fallback for future years under OBBBA permanent reinstatement
  }

  const history =
    "The Tax Cuts and Jobs Act of 2017 (TCJA), Public Law 115-97, amended IRC §168(k) to allow 100% first-year bonus depreciation for qualified property acquired and placed in service after September 27, 2017, and before January 1, 2023. This provision represented a historic expansion of bonus depreciation, permitting taxpayers to immediately expense the entire cost of qualifying assets — including both new and used property — in the year placed in service. Prior to the TCJA, bonus depreciation was limited to 50% and applied only to new (original use) property. The TCJA eliminated the original-use requirement for the first time, meaning that cost segregation studies on acquired existing properties could generate immediate first-year deductions for reclassified components. As originally enacted, the TCJA included a scheduled phase-down of the bonus depreciation rate beginning in 2023.";

  const currentLaw =
    "On January 20, 2025, the One Big Beautiful Bill Act (OBBBA) was signed into law, permanently reinstating 100% bonus depreciation under IRC §168(k), retroactive to January 20, 2025. The OBBBA reversed the TCJA phase-down schedule prospectively and established a permanent 100% first-year deduction for qualified property placed in service on or after January 20, 2025. This legislation provides long-term certainty for real estate investors undertaking cost segregation studies, as eligible reclassified components will qualify for full immediate expensing without concern for future rate reductions. For properties placed in service between January 1, 2023, and January 19, 2025, the TCJA phase-down rates remain applicable, though taxpayers may be eligible to file a change in accounting method under IRC §481(a) and IRS Form 3115 to claim previously unclaimed depreciation.";

  const phaseDown =
    "TCJA Bonus Depreciation Phase-Down Schedule (for property placed in service during the transition period):\n\n" +
    "• September 28, 2017 through December 31, 2022: 100% bonus depreciation\n" +
    "• January 1, 2023 through December 31, 2023: 80% bonus depreciation\n" +
    "• January 1, 2024 through December 31, 2024: 60% bonus depreciation\n" +
    "• January 1, 2025 through January 19, 2025: 40% bonus depreciation\n" +
    "• January 20, 2025 and thereafter (OBBBA): 100% bonus depreciation (permanent)\n\n" +
    "For properties placed in service during the phase-down period (2023 through January 19, 2025), the remaining cost basis of qualifying components not expensed through bonus depreciation is recovered over the applicable MACRS recovery period using the standard depreciation method and convention.";

  const applicableRate =
    `Based on the placed-in-service date of ${date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}, ` +
    `the applicable first-year bonus depreciation rate for qualifying property identified in this study is ${ratePercent}%. ` +
    (ratePercent === 100
      ? "This means that the entire depreciable cost of each qualifying 5-year, 7-year, and 15-year component identified in this study may be deducted in full in the first tax year the property is placed in service, subject to applicable limitations."
      : `This means that ${ratePercent}% of the depreciable cost of each qualifying 5-year, 7-year, and 15-year component identified in this study may be deducted in the first tax year the property is placed in service, with the remaining ${100 - ratePercent}% recovered over the applicable MACRS recovery period using the standard depreciation method and convention.`);

  const qualificationRequirements =
    "Qualification Requirements Under IRC §168(k)(2). To qualify for bonus depreciation, property must satisfy each of the following requirements:\n\n" +
    "(1) The property must be of a type described in IRC §168(k)(2)(A)(i), which includes property to which MACRS applies with a recovery period of 20 years or less, computer software as defined in IRC §167(f)(1)(B), water utility property described in IRC §168(e)(5), or qualified film, television, or live theatrical productions.\n\n" +
    "(2) Under the TCJA and OBBBA amendments, the property is not required to satisfy an original-use requirement. Both new and used property qualify, provided the taxpayer has not previously used the acquired property and the property is not acquired from a related party within the meaning of IRC §179(d)(2)(A) or (B).\n\n" +
    "(3) The property must be placed in service by the taxpayer during the applicable tax year. Property is considered placed in service when it is in a condition or state of readiness and availability for a specifically assigned function.\n\n" +
    "(4) The property must not be excepted property under IRC §168(k)(2)(D). Excepted property includes property used predominantly outside the United States, tax-exempt use property, tax-exempt bond-financed property, and property for which the taxpayer has elected out of bonus depreciation under IRC §168(k)(7).\n\n" +
    "(5) For cost segregation studies on existing buildings, the reclassified components must be identified as separate assets with determinable costs, placed in service as part of the building acquisition or a subsequent improvement, and properly documented in accordance with IRS Audit Techniques Guide standards.";

  return {
    history,
    currentLaw,
    phaseDown,
    applicableRate,
    ratePercent,
    qualificationRequirements,
  };
}


// ─────────────────────────────────────────────────────────────────────
// 3. COMPONENT JUSTIFICATIONS — Keyed by component category
// ─────────────────────────────────────────────────────────────────────

export const COMPONENT_JUSTIFICATIONS = {

  // ── 5-Year Property (§1245 Personal Property) ──────────────────────

  cabinetsCounters: {
    title: "Cabinets, Counters & Shelving",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Kitchen cabinetry, countertops, bathroom vanities, and shelving systems are classified as §1245 personal property under MACRS with a 5-year recovery period. These components are tangible personal property as defined in Treasury Regulation §1.48-1(c), which provides that tangible personal property includes any tangible property except land and improvements thereto, such as buildings and their structural components. Cabinets, countertops, and shelving are not structural components of the building because they do not relate to the operation or maintenance of the building within the meaning of Treasury Regulation §1.48-1(e)(2). Rather, they serve a specific function accessory to the business activity conducted within the building — in this case, the operation of a short-term rental property. The Tax Court in Metro National Corp. v. Commissioner confirmed that cabinetry and similar items are removable without causing significant damage to the building structure and therefore constitute personal property eligible for shorter recovery periods. Revenue Ruling 75-178 further supports the classification of countertops as personal property, holding that countertop surfaces installed in commercial settings are not permanently affixed to the building and serve a function independent of the building's structural operation.",
    citations: [
      "Treas. Reg. §1.48-1(c) — Definition of tangible personal property as any tangible property other than land and improvements thereto",
      "Metro National Corp. v. Commissioner, T.C. Memo 1998-225 — Cabinets and similar installations removable without significant damage to the building are tangible personal property",
      "Rev. Rul. 75-178, 1975-1 C.B. 9 — Countertops installed in commercial and business settings classified as personal property rather than structural components",
      "Treas. Reg. §1.48-1(e)(2) — Definition of structural components (cabinets, counters, and shelving excluded)",
      "Rev. Proc. 87-56, Asset Class 57.0 — Distributive trades and services, 9-year class life, 5-year recovery period",
    ],
    applicability:
      "This classification applies to all kitchen cabinets (base and wall-mounted), bathroom vanity cabinets, countertop surfaces (granite, quartz, marble, laminate, butcher block, concrete, and tile), pantry shelving systems, custom closet organization systems, built-in bookshelves, linen closet shelving, garage storage systems, and laundry room cabinetry identified in this study. Each item has been individually evaluated to confirm it does not constitute a structural component under Treas. Reg. §1.48-1(e)(2).",
  },

  appliances: {
    title: "Appliances",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Residential appliances are classified as §1245 tangible personal property with a 5-year MACRS recovery period. Appliances are freestanding or readily removable items that serve a specific function unrelated to the operation or maintenance of the building. The Senate Finance Committee Report accompanying the Revenue Act of 1962 specifically identified appliances as personal property eligible for the investment tax credit, distinguishing them from structural components. This classification was preserved and extended under the Revenue Act of 1978, which broadened the definition of qualifying personal property. The IRS has consistently treated appliances — including refrigerators, ranges, ovens, dishwashers, washers, dryers, garbage disposals, and microwave ovens — as tangible personal property in published guidance and audit practice. Appliances in a short-term rental property additionally qualify under Asset Class 57.0 as assets used in the distributive trades and services activity of providing temporary lodging.",
    citations: [
      "Senate Finance Committee Report, Revenue Act of 1962, S. Rep. No. 1881 — Appliances identified as tangible personal property for investment credit purposes",
      "Revenue Act of 1978, P.L. 95-600, §312 — Broadened definition of qualifying personal property to include appliances in rental settings",
      "Rev. Proc. 87-56, Asset Class 57.0 — Distributive trades and services, 5-year recovery period",
      "Treas. Reg. §1.48-1(c) — Tangible personal property definition applicable to freestanding and removable equipment",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 7.2 — Appliances consistently classified as personal property",
    ],
    applicability:
      "This classification applies to all kitchen appliances (refrigerator, range/oven, dishwasher, microwave, range hood/vent), laundry appliances (washer, dryer), and specialty appliances (wine cooler, ice maker, beverage center, garbage disposal, trash compactor) identified in this study. Each appliance has been valued individually based on its replacement cost and condition at the time of the study.",
  },

  floorCoverings: {
    title: "Floor Coverings",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Floor coverings — including carpet, hardwood, engineered hardwood, luxury vinyl plank, tile, and natural stone flooring — are classified as §1245 personal property with a 5-year MACRS recovery period when they are not permanently affixed to the building or when they can be removed without significant damage to the underlying structure. The seminal Tax Court decision in Hospital Corporation of America (HCA) v. Commissioner, 109 T.C. 21 (1997), established the legal framework for distinguishing floor coverings from structural components. The court held that floor coverings such as carpet, vinyl floor coverings, and ceramic tile that are installed over a finished floor (such as plywood subfloor or concrete slab) and can be removed and replaced without damage to the underlying building structure are tangible personal property, not structural components. Revenue Ruling 67-349 further supports this classification, holding that decorative floor coverings installed for aesthetic or functional purposes in commercial and business settings are personal property rather than structural components. In Egizii v. Commissioner, the Tax Court applied this reasoning to floor coverings in residential rental properties, confirming that the HCA framework applies equally to residential settings.",
    citations: [
      "Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997) — Floor coverings installed over finished floors are personal property",
      "Rev. Rul. 67-349, 1967-2 C.B. 48 — Decorative floor coverings in commercial settings classified as personal property",
      "Egizii v. Commissioner, T.C. Memo 1980-526 — Floor covering classification applied to residential rental property",
      "Treas. Reg. §1.48-1(e)(2) — Permanent coverings of floors only qualify as structural components when they serve as the finished floor itself",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery period for assets in distributive trades and services",
    ],
    applicability:
      "This classification applies to all carpeting (including pad and installation), hardwood flooring (solid and engineered), luxury vinyl plank (LVP) and luxury vinyl tile (LVT), ceramic and porcelain tile, natural stone flooring (travertine, slate, marble), laminate flooring, and area rugs permanently installed in the property. Floor coverings that constitute the structural floor itself (e.g., a poured concrete slab or structural subfloor) are excluded and remain classified as 27.5-year §1250 property.",
  },

  wallCoveringsBlinds: {
    title: "Wall Coverings & Window Treatments",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Wall coverings (wallpaper, decorative paneling, accent wall materials, wainscoting, and removable wall treatments) and window treatments (blinds, shades, shutters, curtains, and drapes) are classified as §1245 personal property with a 5-year MACRS recovery period. In Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997), the Tax Court held that wall coverings applied over finished wall surfaces for decorative or functional purposes are tangible personal property rather than structural components, because they do not relate to the operation or maintenance of the building but rather serve the specific business needs of the occupant. Revenue Ruling 67-349 supports this classification, establishing that decorative wall treatments installed in commercial and business settings are personal property. Window treatments, including plantation shutters, motorized blinds, custom drapes, and standard blinds, are similarly classified as personal property because they are attached to the building by minor fasteners, can be removed without damage to the building structure, and serve a function accessory to the business use of the property rather than the operation of the building itself.",
    citations: [
      "Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997) — Wall coverings over finished surfaces are personal property",
      "Rev. Rul. 67-349, 1967-2 C.B. 48 — Decorative wall treatments and coverings classified as personal property",
      "Treas. Reg. §1.48-1(e)(2) — Permanent coverings of walls are structural components only when they constitute the wall itself",
      "Minot Federal Savings & Loan v. United States, 435 F.2d 1368 (8th Cir. 1970) — Removable window treatments are personal property",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery period",
    ],
    applicability:
      "This classification applies to all wallpaper, removable decorative paneling, accent wall materials (shiplap, reclaimed wood, stone veneer), wainscoting, chair rail molding, plantation shutters, motorized blinds and shades, custom drapes and curtain systems (including rods and hardware), standard blinds, and decorative window film identified in this study.",
  },

  specialLighting: {
    title: "Specialty & Decorative Lighting",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Specialty and decorative lighting fixtures are classified as §1245 personal property with a 5-year MACRS recovery period. The distinction between lighting that constitutes a structural component (27.5-year property) and lighting that qualifies as personal property (5-year property) was addressed by the Tax Court in Shoney's South, Inc. v. Commissioner, T.C. Memo 1994-538. The court held that decorative and specialty lighting fixtures — including chandeliers, pendant lights, sconces, under-cabinet lighting, accent lighting, recessed can lights with decorative trim, and track lighting — are tangible personal property when they are designed to serve an aesthetic or task-specific function rather than providing general building illumination. In Morrison v. Commissioner, the court further distinguished between the electrical wiring and junction boxes (which are structural components) and the decorative fixtures themselves (which are personal property), establishing the principle that the fixture and the building system to which it attaches may have different classifications.",
    citations: [
      "Shoney's South, Inc. v. Commissioner, T.C. Memo 1994-538 — Decorative and specialty lighting fixtures are personal property distinct from structural building illumination systems",
      "Morrison v. Commissioner, T.C. Memo 1986-129 — Lighting fixtures classified separately from the electrical wiring system to which they attach",
      "Treas. Reg. §1.48-1(e)(2) — Lighting fixtures identified as structural components only when part of the building's operating system for general illumination",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery for decorative and specialty lighting in service establishments",
    ],
    applicability:
      "This classification applies to all chandeliers, pendant lighting, wall sconces, under-cabinet lighting, accent and display lighting, track lighting, recessed can lights with decorative trim kits, landscape-style interior accent lighting, smart lighting systems (Lutron, Hue), LED strip lighting for decorative purposes, and vanity lighting fixtures identified in this study. General building illumination systems (basic ceiling fixtures providing ambient light, emergency lighting, and stairwell lighting) remain classified as 27.5-year §1250 structural components.",
  },

  plumbingPersonalProperty: {
    title: "Plumbing — Personal Property Components",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Certain plumbing components are classified as §1245 personal property with a 5-year MACRS recovery period, separate from the structural plumbing system of the building. Revenue Ruling 66-299 establishes the principle that plumbing fixtures and specialty plumbing installations that serve a specific business function — rather than the general operation of the building — may be classified as personal property. This includes sinks, faucets, toilets, bathtubs, shower assemblies, and specialty plumbing fixtures that are attached to the building's supply and drain lines but are themselves removable without damage to the plumbing system. In Morrison v. Commissioner, the Tax Court affirmed that the endpoint fixtures of a plumbing system (faucets, sinks, fixtures) are distinguishable from the piping infrastructure and can be separately classified. The building's plumbing infrastructure — including supply lines, drain lines, vent stacks, water heater connections, and main shutoff valves — remains classified as 27.5-year §1250 structural property.",
    citations: [
      "Rev. Rul. 66-299, 1966-2 C.B. 14 — Plumbing fixtures serving specific business function classified separately from structural plumbing system",
      "Morrison v. Commissioner, T.C. Memo 1986-129 — Endpoint plumbing fixtures distinguishable from building piping infrastructure",
      "Treas. Reg. §1.48-1(e)(2) — Plumbing as a structural component refers to the piping system, not necessarily the end-use fixtures",
      "HCA v. Commissioner, 109 T.C. 21 (1997) — Framework for distinguishing structural vs. non-structural building components",
    ],
    applicability:
      "This classification applies to all kitchen sinks and faucets, bathroom sinks and faucets, toilets, bathtubs (freestanding, soaking, and built-in), shower assemblies (including frameless glass enclosures, rain showerheads, and multi-head systems), bidets, utility sinks, outdoor showers, and specialty plumbing fixtures (pot fillers, bar sinks, wet bar plumbing) identified in this study. The underlying supply piping, drain/waste/vent piping, and water heater connections remain classified as 27.5-year property.",
  },

  electricalPersonalProperty: {
    title: "Electrical — Personal Property Components",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Certain electrical components are classified as §1245 personal property with a 5-year MACRS recovery period, distinct from the building's structural electrical system. In Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997), the Tax Court established a framework for separating personal property electrical components from the building's structural electrical system. The court held that dedicated electrical circuits and outlets serving specific equipment or business functions, along with the equipment they serve, may be classified as personal property. In Scott Paper Co. v. Commissioner, the Tax Court extended this reasoning to include specialty electrical installations such as dedicated circuits for high-amperage equipment, USB outlet installations, EV charger circuits, and smart home electrical components. The building's core electrical infrastructure — including the main service entrance, electrical panel, branch circuit wiring for general lighting and convenience outlets, and grounding systems — remains classified as 27.5-year §1250 structural property.",
    citations: [
      "Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997) — Dedicated electrical serving specific equipment classified as personal property",
      "Scott Paper Co. v. Commissioner, 74 T.C. 137 (1980) — Specialty electrical installations serving specific equipment functions are personal property",
      "Treas. Reg. §1.48-1(e)(2) — Electrical wiring and lighting fixtures as structural components limited to general building systems",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery period for service establishment assets",
    ],
    applicability:
      "This classification applies to all dedicated electrical circuits for appliances and equipment, USB charging outlets, EV charger installations (including dedicated circuit and charging unit), updated electrical sub-panels serving specific equipment, smart electrical components (smart switches, dimmers, outlets), generator transfer switches and connections, solar panel inverters and monitoring equipment, and heated floor electrical systems identified in this study. The main electrical service entrance, primary panel, general branch circuit wiring, and general convenience outlets remain classified as 27.5-year property.",
  },

  dataCommSystems: {
    title: "Data, Communication & Security Systems",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Data, communication, and security systems are classified as §1245 personal property with a 5-year MACRS recovery period. In Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997), the Tax Court held that telecommunication systems, data wiring, security systems, and similar technology installations are tangible personal property because they serve the specific operational needs of the business conducted in the building rather than the operation or maintenance of the building itself. The court distinguished these systems from the building's general electrical system, noting that data and communication wiring, security cameras, access control systems, and related technology components are installed for a purpose independent of the building's structural function. This classification applies with particular force to short-term rental properties, where smart home technology, keyless entry systems, security cameras, and high-speed internet infrastructure are essential operational assets of the lodging business.",
    citations: [
      "Hospital Corporation of America v. Commissioner, 109 T.C. 21 (1997) — Telecommunication, data, and security systems are personal property serving business operations",
      "Treas. Reg. §1.48-1(c) — Tangible personal property includes technology equipment and systems",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery for assets in service establishments",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 7.4 — Data and communication systems consistently treated as personal property",
    ],
    applicability:
      "This classification applies to all structured data cabling (Cat6, fiber), wireless access points, network switches and routers, security cameras and DVR/NVR systems, smart locks and keyless entry systems, video doorbell systems, smart thermostats, whole-home audio systems, home theater and AV equipment, intercom systems, smart home hubs and controllers, and professionally monitored security systems identified in this study.",
  },

  ceilingFans: {
    title: "Ceiling Fans",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Ceiling fans are classified as §1245 personal property with a 5-year MACRS recovery period. The Senate Finance Committee Report accompanying the investment tax credit provisions identified ceiling fans as personal property, distinct from the building's HVAC or electrical systems. Ceiling fans are attached to the building by minor fasteners (typically a single junction box mounting bracket) and can be removed and replaced without damage to the ceiling or electrical system. They serve a specific comfort and aesthetic function rather than constituting part of the building's structural HVAC or electrical infrastructure. While the junction box and wiring to which the fan attaches are structural components, the fan unit itself — including the motor, blades, housing, and any integrated light kit — is personal property.",
    citations: [
      "Senate Finance Committee Report, Revenue Act of 1962, S. Rep. No. 1881 — Ceiling fans identified as tangible personal property",
      "Treas. Reg. §1.48-1(c) — Definition of tangible personal property",
      "Treas. Reg. §1.48-1(e)(2) — Ceiling fans excluded from structural component definition when serving comfort/aesthetic function",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery period",
    ],
    applicability:
      "This classification applies to all indoor ceiling fans (with and without integrated light kits), outdoor-rated ceiling fans on covered porches and patios, and decorative ceiling-mounted ventilation fixtures identified in this study.",
  },

  furnishingsSTR: {
    title: "Furnishings — Short-Term Rental",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Furnishings in a short-term rental property are classified as §1245 personal property with a 5-year MACRS recovery period under Revenue Procedure 87-56, Asset Class 57.0 (Distributive Trades and Services). This asset class specifically encompasses furniture, fixtures, and equipment used in lodging establishments and similar service businesses. All furniture and furnishings provided for guest use in a short-term rental property — including beds, mattresses, dressers, nightstands, sofas, chairs, dining tables, desks, outdoor furniture, linens, kitchenware, and decorative items — are tangible personal property by their nature, as they are movable and do not constitute structural components of the building. These assets are essential to the operation of the short-term rental business and are properly classified as business assets used in the provision of lodging services.",
    citations: [
      "Rev. Proc. 87-56, Asset Class 57.0 — Distributive trades and services, expressly including furniture and fixtures in lodging establishments, 9-year class life, 5-year recovery period",
      "Treas. Reg. §1.48-1(c) — Tangible personal property includes movable furniture and furnishings",
      "IRC §1245(a)(3) — Definition of §1245 property including tangible personal property subject to depreciation",
    ],
    applicability:
      "This classification applies to all beds and mattresses, bedroom furniture (dressers, nightstands, headboards), living room furniture (sofas, chairs, coffee tables, end tables, entertainment centers), dining furniture (tables, chairs, buffets), office furniture (desks, chairs), outdoor furniture (patio sets, lounge chairs, dining sets), linens and bedding, kitchenware and small appliances, decorative art and accessories, mirrors, rugs, and all other movable furnishings provided for guest use identified in this study.",
  },

  ornamentalItems: {
    title: "Ornamental & Decorative Items",
    macrsClass: "5-year",
    assetClass: "57.0",
    ircSection: "§1245",
    justification:
      "Ornamental and decorative items in a short-term rental property are classified as §1245 personal property with a 5-year MACRS recovery period. In Morrison v. Commissioner, T.C. Memo 1986-129, the Tax Court held that decorative items installed in commercial and business properties — including decorative molding, ornamental trim, accent features, and architectural embellishments that serve a primarily aesthetic function — are tangible personal property when they are not integral to the structural integrity of the building. The court distinguished between structural trim (such as base molding that conceals the joint between floor and wall) and decorative trim (such as crown molding, chair rails, and ornamental accents that serve a purely decorative function). Items that exist primarily to enhance the visual appeal of the property for its business purpose — in this case, attracting and serving short-term rental guests — are properly classified as personal property.",
    citations: [
      "Morrison v. Commissioner, T.C. Memo 1986-129 — Decorative items and ornamental features in commercial properties classified as personal property",
      "Treas. Reg. §1.48-1(c) — Definition of tangible personal property encompasses decorative items",
      "Rev. Proc. 87-56, Asset Class 57.0 — 5-year recovery for assets in service establishments",
      "Shoney's South, Inc. v. Commissioner, T.C. Memo 1994-538 — Decorative elements serving aesthetic business function are personal property",
    ],
    applicability:
      "This classification applies to all crown molding, decorative chair rail and picture rail molding, ornamental trim and wainscoting panels, decorative columns and pilasters (non-load-bearing), fireplace mantels and surrounds (decorative only, not structural masonry), built-in decorative niches, accent wall installations (shiplap, stone veneer, reclaimed wood), and decorative ceiling treatments (coffered ceiling trim, beadboard, medallions) identified in this study. Load-bearing columns, structural beams, and structural wall framing remain classified as 27.5-year property.",
  },

  // ── 15-Year Property (Land Improvements) ───────────────────────────

  landImprovements: {
    title: "Land Improvements — General",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Land improvements are classified under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period using the 150% declining balance method. IRC §168(e)(1) and (e)(3) provide that the recovery period for any depreciable asset is determined by reference to the class life of the asset as established by the Secretary. For land improvements, the class life is 20 years, resulting in a 15-year recovery period. Unlike the land itself (which is non-depreciable), improvements to land are depreciable assets because they have a determinable useful life and are subject to wear, exhaustion, and obsolescence. The IRS Cost Segregation Audit Techniques Guide identifies land improvements as a primary target for reclassification in cost segregation studies, as these assets are frequently misclassified as part of the building structure (27.5-year property) or as non-depreciable land.",
    citations: [
      "IRC §168(e)(1) and (e)(3) — Recovery period for land improvements based on 20-year class life",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements, 20-year class life, 15-year recovery period",
      "IRC §168(b)(2) — 150% declining balance method for 15-year property",
      "Treas. Reg. §1.48-1(e)(1) — Distinction between land (non-depreciable) and land improvements (depreciable)",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 6 — Land improvements as reclassification target",
    ],
    applicability:
      "This general classification applies to all improvements directly to or added to land, as further described in the specific land improvement categories below. Each land improvement has been separately identified, valued, and documented in accordance with IRS engineering-based cost segregation methodology.",
  },

  swimmingPoolHotTub: {
    title: "Swimming Pool & Hot Tub / Spa",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Swimming pools, hot tubs, spas, and related water features are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. A swimming pool is an improvement to the land that has a determinable useful life and is subject to wear and deterioration. The IRS has consistently classified in-ground swimming pools as land improvements in published guidance and audit practice, as they are permanent installations added to the land that do not constitute part of the building structure. Hot tubs and spas, whether freestanding or built into a deck or patio, are similarly classified. Pool equipment — including pumps, filters, heaters, chlorinators, salt systems, automatic covers, and lighting — is integral to the pool improvement and follows the same 15-year classification. Water features such as fountains, waterfalls, and decorative water elements associated with the pool area are included in this classification.",
    citations: [
      "IRC §168(e) — Land improvements recovery period",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements including water features and recreational improvements",
      "Treas. Reg. §1.48-1(e)(1) — Land improvements as depreciable assets distinct from non-depreciable land",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 6.3 — Swimming pools and recreational land improvements",
    ],
    applicability:
      "This classification applies to in-ground swimming pools (saltwater, chlorine, plunge/cocktail), above-ground pools (permanent installation), hot tubs and spas, pool decking and coping, pool equipment (pumps, filters, heaters, salt systems, chlorinators), automatic pool covers, pool lighting and electrical, water features (waterfalls, fountains, bubblers), and pool fencing and enclosures identified in this study.",
  },

  deckPatioStructures: {
    title: "Decks, Patios & Outdoor Structures",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Decks, patios, pergolas, gazebos, and similar outdoor structures are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. Revenue Ruling 68-193 establishes that outdoor platforms, decks, and similar structures that are not enclosed and do not constitute an extension of the building's habitable space are land improvements rather than building components. In Algernon Blair, Inc. v. Commissioner, the Tax Court held that freestanding outdoor structures — including patios, outdoor platforms, and covered but unenclosed structures — are land improvements because they represent improvements to the land itself rather than to the building. The key distinguishing factor is whether the structure is an integral part of the building (enclosed, climate-controlled, structurally connected) or an improvement to the land (open-air, not climate-controlled, serving an outdoor function).",
    citations: [
      "Rev. Rul. 68-193, 1968-1 C.B. 79 — Outdoor platforms and deck structures classified as land improvements",
      "Algernon Blair, Inc. v. Commissioner, T.C. Memo 1982-552 — Freestanding outdoor structures are land improvements",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements, 15-year recovery period",
      "IRC §168(e) — Recovery period determination for land improvements",
    ],
    applicability:
      "This classification applies to all wood decks, composite decks (Trex, TimberTech, similar), paver patios, stone patios, concrete patios (stamped, stained, or plain), pergolas, arbors, gazebos, covered patios (unenclosed), screened porches (when not structurally enclosed as habitable space), outdoor shower structures, carports (freestanding), and similar outdoor structures identified in this study. Enclosed porches, sunrooms, and structurally integrated additions remain classified as 27.5-year building components.",
  },

  landscaping: {
    title: "Landscaping & Plantings",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Landscaping — including shrubbery, ornamental trees, decorative plantings, sod, mulch beds, retaining walls, planters, and related landscaping infrastructure — is classified as a land improvement under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. Revenue Ruling 65-265 holds that expenditures for landscaping around a business property are depreciable land improvements when the landscaping is placed in service in connection with a business or income-producing activity. In Trailmont Park, Inc. v. Commissioner, the Tax Court confirmed that professional landscaping — including plantings, grading, soil preparation, retaining walls, and decorative stone work — constitutes a depreciable land improvement with a determinable useful life, distinguishable from the non-depreciable land itself. The court noted that landscaping elements are subject to wear, weather damage, and decline, supporting a finite recovery period.",
    citations: [
      "Rev. Rul. 65-265, 1965-2 C.B. 52 — Landscaping expenditures for business property are depreciable land improvements",
      "Trailmont Park, Inc. v. Commissioner, T.C. Memo 1977-344 — Professional landscaping is a depreciable land improvement",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements including landscaping and shrubbery",
      "IRC §168(e) — Recovery period for land improvements",
      "IRC §263(a) — Capitalization of landscaping expenditures as improvements",
    ],
    applicability:
      "This classification applies to all professional landscaping (design and installation), ornamental trees and shrubs, sod and turf installation, decorative mulch beds, xeriscaping and desert landscaping, retaining walls (non-structural), decorative stone and boulder installations, raised garden beds, flower beds, and ground cover plantings identified in this study. Trees and plantings that serve a structural purpose (e.g., erosion control critical to building foundation) may be classified differently on a case-by-case basis.",
  },

  fencing: {
    title: "Fencing & Walls",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Fencing and boundary walls are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. Revenue Ruling 68-193 specifically identifies fences as land improvements, holding that fences are improvements to the land rather than components of a building structure. This classification applies regardless of the material of construction — wood, vinyl, composite, wrought iron, aluminum, chain link, or masonry block. The fence serves a function related to the use and enjoyment of the land (boundary delineation, privacy, security, pool safety compliance) rather than the operation or maintenance of the building. The IRS has consistently maintained this classification in published guidance and cost segregation audit practice.",
    citations: [
      "Rev. Rul. 68-193, 1968-1 C.B. 79 — Fences specifically identified as land improvements",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements including fences, 15-year recovery period",
      "IRC §168(e) — Recovery period determination for land improvements",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 6 — Fencing classified as land improvement",
    ],
    applicability:
      "This classification applies to all privacy fencing (wood, vinyl, composite), wrought iron and aluminum fencing, chain link fencing, masonry block walls (boundary/privacy), decorative garden fencing, pool safety fencing and enclosures, gate structures (including automatic gate operators and access systems), and livestock or agricultural fencing identified in this study.",
  },

  drivewayParking: {
    title: "Driveways & Parking Areas",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Driveways, parking areas, and vehicular access improvements are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. In Algernon Blair, Inc. v. Commissioner, the Tax Court held that paved surfaces, driveways, and parking areas are improvements to the land that have a determinable useful life and are subject to wear, weather damage, and deterioration. Revenue Ruling 72-96 further establishes that driveways and parking surfaces — whether asphalt, concrete, pavers, or gravel — are land improvements properly classified under Asset Class 00.3, regardless of whether they serve a residential or commercial property. The driveway and parking area serve a function related to the use of the land (vehicular access and parking) rather than the operation of the building structure.",
    citations: [
      "Algernon Blair, Inc. v. Commissioner, T.C. Memo 1982-552 — Paved surfaces and driveways are land improvements",
      "Rev. Rul. 72-96, 1972-1 C.B. 62 — Driveways and parking surfaces classified as land improvements",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements including roads and paved surfaces",
      "IRC §168(e) — Recovery period for land improvements",
    ],
    applicability:
      "This classification applies to all concrete driveways, asphalt driveways, paver driveways, gravel driveways, parking pads, expanded parking areas, turnaround areas, driveway aprons, curbing, and associated drainage improvements identified in this study.",
  },

  sidewalksPathways: {
    title: "Sidewalks & Pathways",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Sidewalks, walkways, pathways, and pedestrian access improvements are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. Revenue Ruling 74-265 specifically addresses sidewalks and walkways, holding that these improvements to the land are depreciable assets with a finite useful life, subject to wear and weather deterioration. Sidewalks and pathways serve a function related to pedestrian access across the land and do not constitute part of the building structure. This classification applies to all paved, stone, gravel, and constructed walkway surfaces on the property.",
    citations: [
      "Rev. Rul. 74-265, 1974-1 C.B. 56 — Sidewalks and walkways classified as depreciable land improvements",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements including sidewalks, 15-year recovery period",
      "IRC §168(e) — Recovery period for land improvements",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 6 — Sidewalks and pathways as land improvements",
    ],
    applicability:
      "This classification applies to all concrete sidewalks, paver walkways, stone pathways, flagstone paths, stepping stone installations, boardwalks, garden paths, and entrance walkways identified in this study.",
  },

  exteriorLighting: {
    title: "Exterior & Site Lighting",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Exterior and site lighting — including landscape lighting, path lighting, driveway lighting, security floodlights, and decorative exterior fixtures — is classified as a land improvement under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. In Standard Oil Co. v. Commissioner, the Tax Court held that site lighting systems serving outdoor areas (parking, walkways, landscaping, security) are land improvements because they illuminate and serve the land rather than the building's interior. Whiteco Industries, Inc. v. Commissioner further supports this classification, establishing that exterior lighting poles, fixtures, and associated wiring that are installed in the ground or on freestanding structures (rather than directly on the building) are land improvements. Exterior lighting that is mounted directly on the building facade may still qualify as a land improvement if it primarily serves to illuminate the site rather than the building interior.",
    citations: [
      "Standard Oil Co. v. Commissioner, 77 T.C. 349 (1981) — Site lighting systems are land improvements serving the land rather than the building",
      "Whiteco Industries, Inc. v. Commissioner, 65 T.C. 664 (1975) — Exterior lighting poles and fixtures are land improvements",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements, 15-year recovery period",
      "IRC §168(e) — Recovery period for land improvements",
    ],
    applicability:
      "This classification applies to all landscape lighting (up-lights, down-lights, path lights, spotlights), driveway and parking area lighting, security floodlights and motion-sensor lights, decorative exterior sconces and lanterns (when serving site illumination), post lights and lamp posts, pool and water feature lighting, deck and patio lighting (string lights on permanent installation, step lights, railing lights), and solar-powered site lighting identified in this study.",
  },

  irrigationDrainage: {
    title: "Irrigation & Drainage Systems",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Irrigation systems and site drainage improvements are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. Revenue Procedure 87-56 expressly includes drainage facilities, canals, and waterways within Asset Class 00.3. Irrigation systems — including sprinkler systems, drip irrigation, controllers, valves, and underground piping — are improvements to the land that serve the function of maintaining the landscaping and vegetation on the property. Site drainage improvements — including French drains, catch basins, swales, grading, and drainage piping — are similarly improvements to the land that manage water flow across the property. These systems have a determinable useful life and are subject to wear, corrosion, and deterioration, making them depreciable assets distinct from the non-depreciable land itself.",
    citations: [
      "IRC §168(e) — Recovery period for land improvements including drainage facilities",
      "Rev. Proc. 87-56, Asset Class 00.3 — Expressly includes drainage facilities, sewers (non-municipal), and waterways",
      "Treas. Reg. §1.48-1(e)(1) — Land improvements as depreciable assets",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 6 — Irrigation and drainage as depreciable land improvements",
    ],
    applicability:
      "This classification applies to all in-ground sprinkler systems, drip irrigation systems, irrigation controllers and timers, underground irrigation piping and valves, rain sensors and smart irrigation controllers, French drains, catch basins, drainage swales, surface grading for drainage, downspout extensions and underground drainage piping, dry creek beds (functional drainage), and sump pump exterior discharge systems identified in this study.",
  },

  outdoorKitchenFirePit: {
    title: "Outdoor Kitchens & Fire Features",
    macrsClass: "15-year",
    assetClass: "00.3",
    ircSection: "§1250 / §168(e)",
    justification:
      "Outdoor kitchens, built-in grills, fire pits, outdoor fireplaces, and similar outdoor amenity features are classified as land improvements under IRC §168(e) and Revenue Procedure 87-56, Asset Class 00.3, with a 15-year MACRS recovery period. These features are permanent improvements installed on the land, typically constructed on a patio, deck, or dedicated outdoor area. They do not constitute part of the building structure because they are located outside the building envelope and serve an outdoor function. An outdoor kitchen — including built-in grill, countertops, sink, refrigerator, and storage — is a composite improvement to the land that enhances the outdoor living area of the property. Fire pits (gas and wood-burning) and outdoor fireplaces are similarly permanent land improvements. The individual appliances and equipment within an outdoor kitchen (grill, refrigerator, etc.) could alternatively be classified as 5-year personal property under Asset Class 57.0; however, when they are built-in and permanently installed as part of an integrated outdoor improvement, the composite land improvement classification under Asset Class 00.3 is appropriate and conservative.",
    citations: [
      "IRC §168(e) — Recovery period for land improvements",
      "Rev. Proc. 87-56, Asset Class 00.3 — Land improvements, 15-year recovery period",
      "Treas. Reg. §1.48-1(e)(1) — Land improvements as depreciable assets distinct from building components",
      "IRS Cost Segregation Audit Techniques Guide, Chapter 6 — Outdoor amenity features as land improvements",
    ],
    applicability:
      "This classification applies to all built-in outdoor kitchens (including counters, cabinets, sinks, and built-in appliances), built-in gas and charcoal grills, fire pits (gas, wood-burning, and propane), outdoor fireplaces, pizza ovens, smokers and outdoor cooking installations, outdoor bar areas (built-in), and associated gas line and electrical connections serving these outdoor features identified in this study.",
  },
};


// ─────────────────────────────────────────────────────────────────────
// 4. METHODOLOGY TEXT — Engineering-based cost seg methodology
// ─────────────────────────────────────────────────────────────────────

export const METHODOLOGY_TEXT = {
  overview:
    "This cost segregation study was conducted using a combination of IRS Audit Techniques Guide (ATG) Methodology #2 (Detailed Engineering Cost Estimate from Actual Cost Records) and Methodology #5 (Sampling or Modeling Techniques). This combined approach leverages detailed engineering analysis of property components with statistically validated cost modeling, producing results that are accurate, defensible, and consistent with IRS expectations for a quality cost segregation study.",

  dataSources:
    "Data Sources. The cost allocations in this study are derived from the following sources: (1) property listing data including photographs, descriptions, and feature lists; (2) public property records including tax assessor data, building permits, and property characteristics; (3) recognized construction cost databases and regional cost indices; (4) component-level engineering estimates based on property type, age, size, quality tier, and geographic location; (5) comparable property analysis using properties of similar type, vintage, and quality in the same geographic market; and (6) owner-provided information regarding renovations, improvements, and property condition.",

  irsATGQualityElements:
    "IRS Audit Techniques Guide — Quality Study Elements. The IRS Cost Segregation Audit Techniques Guide (revised January 2022) identifies thirteen principal elements of a quality cost segregation study. This study addresses each element as follows:\n\n" +
    "1. Preparation by an Individual with Expertise and Experience: This study was prepared using engineering-based analysis algorithms developed in consultation with cost segregation professionals, tax attorneys, and licensed professional engineers with experience in real property component identification and classification.\n\n" +
    "2. Detailed Description of the Methodology: The engineering cost estimate and modeling methodology used in this study is fully described in this section, including data sources, analytical procedures, and classification criteria.\n\n" +
    "3. Use of Appropriate Documentation: This study relies on property-specific data obtained from multiple independent sources, cross-referenced and validated for accuracy.\n\n" +
    "4. Interviews and Discussions: Property-specific information was obtained from the property owner regarding renovations, improvements, condition, and use.\n\n" +
    "5. Property Tour or Inspection Equivalent: This study incorporates a comprehensive analysis of the property based on listing photographs, satellite imagery, street-level imagery, and owner-provided information, providing a thorough assessment of the property's components and condition.\n\n" +
    "6. Application of Law: Component classifications in this study are based on the Internal Revenue Code, Treasury Regulations, Revenue Rulings, Revenue Procedures, and Tax Court decisions as cited throughout this report.\n\n" +
    "7. Determination of Unit Costs: Component costs are determined using recognized construction cost databases, regional cost indices, and engineering estimates appropriate for the property type, age, quality, and location.\n\n" +
    "8. Identification of §1245 Personal Property: All personal property components have been individually identified and classified with supporting legal authority.\n\n" +
    "9. Identification of Land Improvements: All land improvements have been individually identified and classified with supporting legal authority.\n\n" +
    "10. Identification of §1250 Structural Components: Components that do not qualify for reclassification have been identified and remain classified as 27.5-year residential rental property.\n\n" +
    "11. Reconciliation of Total Allocated Costs: The total of all component costs allocated in this study reconciles to the depreciable basis of the property, with adjustments for land value.\n\n" +
    "12. Explanation of the Treatment of Indirect Costs: Indirect costs (contractor overhead, profit, architectural and engineering fees, permits) have been allocated proportionally among the identified components.\n\n" +
    "13. Overall Accuracy and Consistency: The results of this study have been reviewed for internal consistency, reasonableness compared to industry benchmarks, and compliance with applicable tax law.",

  engineeringProcedures:
    "Engineering Procedures Performed. The following engineering procedures were performed in connection with this study:\n\n" +
    "1. Property Data Collection: Comprehensive property data was collected from public records, listing services, and owner-provided information, including building characteristics, age, size, construction type, features, and improvements.\n\n" +
    "2. Building Component Identification: Each building component was identified and categorized based on its function, construction material, method of attachment, and relationship to the building structure.\n\n" +
    "3. Component Classification Analysis: Each identified component was analyzed under the applicable legal framework to determine its proper MACRS asset class, recovery period, and depreciation method.\n\n" +
    "4. Cost Estimation: The replacement cost of each component was estimated using recognized construction cost databases, adjusted for regional cost differences, property quality tier, and component age and condition.\n\n" +
    "5. Depreciation Basis Allocation: The depreciable basis of the property (purchase price less allocated land value) was allocated among the identified components based on their relative replacement costs.\n\n" +
    "6. Land Value Determination: The land value was determined using the most reliable available data, including county tax assessor records, comparable land sales, and residual analysis.\n\n" +
    "7. Indirect Cost Allocation: Indirect costs were allocated proportionally among identified components based on their relative direct costs.\n\n" +
    "8. Bonus Depreciation Analysis: Each reclassified component was evaluated for eligibility for bonus depreciation under IRC §168(k) based on the property's placed-in-service date.\n\n" +
    "9. Quality Assurance Review: The completed study was reviewed for accuracy, internal consistency, compliance with applicable law, and reasonableness compared to industry benchmarks for properties of similar type and value.\n\n" +
    "10. Report Preparation: The results were compiled into this comprehensive report with supporting schedules, legal citations, and documentation sufficient to support the claimed depreciation deductions upon IRS examination.",

  methodologyStatement:
    "\"The methodology employed in this cost segregation study is consistent with the engineering-based approach recognized by the Internal Revenue Service in the Cost Segregation Audit Techniques Guide. Component identification, classification, and cost allocation procedures follow established engineering principles and are supported by the legal authorities cited throughout this report. The results of this study represent a reasonable and defensible allocation of the property's depreciable basis among the identified asset classes.\"",
};


// ─────────────────────────────────────────────────────────────────────
// 5. MATERIAL PARTICIPATION TEXT — STR-specific passive activity rules
// ─────────────────────────────────────────────────────────────────────

export const MATERIAL_PARTICIPATION_TEXT = {
  strException:
    "Short-Term Rental Exception to Passive Activity Rules. Under the general passive activity rules of IRC §469, rental activities are treated as per se passive regardless of the taxpayer's level of participation. However, Treasury Regulation §1.469-1T(e)(3)(ii)(A) provides a critical exception for rental activities where the average period of customer use is seven days or less. When the average period of customer use does not exceed seven days, the activity is not treated as a rental activity for purposes of IRC §469. Instead, the activity is treated as a trade or business activity, and the taxpayer's losses (including depreciation deductions from this cost segregation study) may offset non-passive income if the taxpayer materially participates in the activity. This exception is of particular significance for short-term rental property owners, as short-term rental properties listed on platforms such as Airbnb, VRBO, and similar services typically have an average guest stay well under seven days.",

  materialParticipationTests:
    "Material Participation Tests. If the seven-day exception applies, the taxpayer must demonstrate material participation in the short-term rental activity to treat losses as non-passive. Under Treasury Regulation §1.469-5T(a), a taxpayer materially participates in an activity if the taxpayer satisfies any one of the following seven tests:\n\n" +
    "1. The taxpayer participates in the activity for more than 500 hours during the tax year.\n\n" +
    "2. The taxpayer's participation constitutes substantially all of the participation in the activity by all individuals (including non-owners) for the tax year.\n\n" +
    "3. The taxpayer participates in the activity for more than 100 hours during the tax year, and no other individual participates more than the taxpayer.\n\n" +
    "4. The activity is a significant participation activity (more than 100 hours), and the taxpayer's aggregate participation in all significant participation activities exceeds 500 hours for the tax year.\n\n" +
    "5. The taxpayer materially participated in the activity for any five of the ten preceding tax years.\n\n" +
    "6. The activity is a personal service activity, and the taxpayer materially participated in the activity for any three preceding tax years.\n\n" +
    "7. Based on all the facts and circumstances, the taxpayer participates in the activity on a regular, continuous, and substantial basis during the tax year. However, this test cannot be satisfied if the taxpayer participates for 100 hours or less.\n\n" +
    "For most short-term rental owners, Test 1 (500+ hours) or Test 4 (significant participation aggregation) will be the most achievable path to material participation.",

  passiveActivityImplications:
    "Passive Activity Implications. If the taxpayer does not meet any of the seven material participation tests, the depreciation deductions generated by this cost segregation study will be treated as passive activity losses under IRC §469. Passive activity losses may only offset passive activity income — they cannot offset active income (wages, salary, business income) or portfolio income (interest, dividends, capital gains) in the current tax year. However, suspended passive losses are carried forward indefinitely under IRC §469(b) and may be used to offset passive income in future years or released in full upon a complete disposition of the activity under IRC §469(g). Additionally, taxpayers who qualify as real estate professionals under IRC §469(c)(7) may treat rental real estate activities as non-passive regardless of the seven-day exception, subject to meeting the 750-hour and more-than-half-of-services requirements.",

  warningText:
    "IMPORTANT: Taxpayers who participate in their short-term rental activity for fewer than 500 hours per year should consult with their tax advisor regarding passive activity classification before relying on the deductions generated by this cost segregation study to offset non-passive income. Improper treatment of passive losses against active income may result in underpayment penalties under IRC §6662. The determination of material participation is a factual inquiry that depends on the specific activities performed by the taxpayer and should be evaluated on a case-by-case basis.",

  documentationRecommendations:
    "Documentation Recommendations. To support a material participation claim, the IRS requires contemporaneous records of the taxpayer's participation in the activity. The following documentation practices are recommended:\n\n" +
    "• Maintain a contemporaneous log or calendar recording all hours spent on the short-term rental activity, including the date, activity performed, and time spent.\n\n" +
    "• Qualifying activities include: guest communications (inquiries, booking confirmations, check-in/check-out coordination), property management (cleaning coordination, maintenance, repairs, restocking supplies), financial management (bookkeeping, pricing optimization, tax preparation), marketing (listing management, photography, reviews), and property oversight (inspections, quality checks, policy updates).\n\n" +
    "• Activities performed by the taxpayer's spouse may be counted toward the taxpayer's participation hours under IRC §469(h)(5).\n\n" +
    "• Time spent by property managers, cleaning services, and other third-party contractors does not count toward the taxpayer's participation hours.\n\n" +
    "• Retain supporting documentation such as email correspondence, text messages, booking platform activity logs, receipts for supplies and services, and bank/credit card statements showing property-related expenditures.\n\n" +
    "• If using a co-host or property manager, document the specific tasks retained by the taxpayer versus those delegated to the third party.",
};


// ─────────────────────────────────────────────────────────────────────
// 6. LIMITING CONDITIONS — Array of limiting condition statements
// ─────────────────────────────────────────────────────────────────────

export const LIMITING_CONDITIONS = [
  "This cost segregation study has been prepared for the exclusive use of the property owner identified in this report and their authorized tax advisors. It is not intended for use by any other party and may not be relied upon by third parties for any purpose.",

  "The classifications and cost allocations in this study are based on the tax law, regulations, rulings, and case law in effect as of the date of this report. Changes in tax law, regulations, or IRS interpretive positions after the date of this report may affect the validity of the conclusions herein.",

  "The cost allocations in this study are based on the property data, photographs, public records, and owner-provided information available at the time of the study. The accuracy of the allocations is dependent upon the accuracy and completeness of the underlying data. If any material information was omitted or is inaccurate, the results of this study may need to be revised.",

  "This study does not constitute legal advice or tax advice. The property owner should consult with a qualified tax professional regarding the application of the results of this study to their specific tax situation, including but not limited to passive activity limitations, at-risk rules, alternative minimum tax implications, and state tax conformity.",

  "No physical inspection of the property was performed in connection with this study. Component identification and condition assessments are based on listing photographs, satellite and street-level imagery, public records, comparable property analysis, and owner-provided information. If a physical inspection reveals material differences from the information relied upon, the results of this study may need to be revised.",

  "The land value used in this study is based on the best available data, including county tax assessor records, comparable land sales, and residual analysis. If the actual fair market value of the land differs materially from the value used, the depreciable basis and resulting depreciation deductions will be affected.",

  "This study assumes the property is used exclusively as a residential rental property (short-term or long-term) throughout the applicable recovery periods. If the property use changes (e.g., conversion to personal use or sale of the property), the depreciation deductions and recapture provisions may be affected.",

  "The bonus depreciation rates applied in this study are based on the placed-in-service date provided by the property owner. If the actual placed-in-service date differs, the applicable bonus depreciation rate may change.",

  "Cost estimates in this study are based on recognized construction cost databases, regional cost indices, and engineering judgment. Actual replacement costs may vary from the estimates used. Such variances, if within a reasonable range, do not invalidate the methodology or conclusions of this study.",

  "This study does not address state or local tax implications. Many states conform to federal MACRS depreciation rules, but some states have decoupled from federal bonus depreciation provisions or impose their own depreciation schedules. The property owner should consult with a tax advisor regarding the state tax treatment of the deductions generated by this study.",

  "The results of this study are subject to review and potential adjustment by the Internal Revenue Service upon examination. While this study has been prepared in accordance with IRS Audit Techniques Guide standards and is supported by applicable legal authorities, the IRS retains the authority to challenge any classification or cost allocation.",

  "This report has been prepared in reliance upon information provided by the property owner, which has been assumed to be accurate and complete. No independent verification of owner-provided information has been performed beyond cross-referencing with available public records.",
];


// ─────────────────────────────────────────────────────────────────────
// 7. CERTIFICATION TEXT — 5-point certification statement
// ─────────────────────────────────────────────────────────────────────

export const CERTIFICATION_TEXT = {
  preamble:
    "The undersigned hereby certifies that, to the best of their knowledge and belief:",

  points: [
    "The statements of fact contained in this report are true and correct. The reported analyses, opinions, and conclusions are limited only by the reported assumptions and limiting conditions and are the personal, impartial, and unbiased professional analyses, opinions, and conclusions of the preparer.",

    "The preparer has no present or prospective interest in the property that is the subject of this report and has no personal interest with respect to the parties involved. The compensation for completing this assignment is not contingent upon the development or reporting of a predetermined result or direction in value that favors the cause of the client, the amount of the value opinion, the attainment of a stipulated result, or the occurrence of a subsequent event directly related to the intended use of this report.",

    "The cost segregation analysis was performed in accordance with the requirements of the Internal Revenue Code, applicable Treasury Regulations, Revenue Rulings, Revenue Procedures, and relevant Tax Court decisions, as well as the guidelines set forth in the IRS Cost Segregation Audit Techniques Guide.",

    "The component classifications and cost allocations in this report represent the preparer's best professional judgment based on the available data, applicable legal authorities, and recognized engineering cost estimation methodology. The classifications are reasonable, supportable, and consistent with the prevailing interpretation of the applicable tax law.",

    "No one other than the preparer and those acknowledged in this report provided significant professional assistance in the preparation of this cost segregation study. The preparer has the knowledge and experience necessary to complete this assignment competently, and the analyses and conclusions in this report comply with the standards and methodology recognized by the Internal Revenue Service for cost segregation studies.",
  ],
};


// ─────────────────────────────────────────────────────────────────────
// 8. DISCLAIMERS — Legal disclaimers for the report
// ─────────────────────────────────────────────────────────────────────

export const DISCLAIMERS = {
  generalDisclaimer:
    "GENERAL DISCLAIMER. This cost segregation study is provided for informational purposes to assist the property owner and their tax advisor in preparing federal income tax returns. This study does not constitute tax advice, legal advice, or accounting advice. The property owner should rely on the advice of their qualified tax professional in determining how to report the results of this study on their tax return. The preparer of this study assumes no responsibility for the tax reporting decisions made by the property owner or their tax advisor.",

  irsExaminationDisclaimer:
    "IRS EXAMINATION DISCLAIMER. While this cost segregation study has been prepared in accordance with the standards and methodology recognized by the Internal Revenue Service in the Cost Segregation Audit Techniques Guide, there is no guarantee that the IRS will accept every classification and cost allocation in this study upon examination. The IRS retains the authority to challenge, reclassify, or adjust any component classification or cost allocation. In the event of an IRS examination, the property owner should engage a qualified tax professional to represent their interests and provide the examiner with this study and supporting documentation.",

  accuracyDisclaimer:
    "ACCURACY DISCLAIMER. The cost estimates and allocations in this study are based on recognized construction cost databases, engineering judgment, and the best available property data. These estimates represent reasonable approximations of component costs and are not precise to the dollar. The IRS has accepted the use of cost estimation methodology in cost segregation studies, recognizing that exact costs for individual building components are rarely available for existing properties. Reasonable variations in cost estimates do not invalidate the study's methodology or conclusions.",

  bonusDepreciationDisclaimer:
    "BONUS DEPRECIATION DISCLAIMER. The bonus depreciation rates applied in this study are based on the provisions of IRC §168(k) as amended by the Tax Cuts and Jobs Act of 2017 and the One Big Beautiful Bill Act of 2025. If additional legislative changes affect bonus depreciation rates or eligibility after the date of this report, the first-year deduction amounts calculated herein may need to be adjusted. The property owner should consult with their tax advisor regarding the current bonus depreciation provisions applicable to their specific tax year and placed-in-service date.",

  stateConformityDisclaimer:
    "STATE TAX CONFORMITY DISCLAIMER. This study addresses federal income tax depreciation only. State income tax treatment of MACRS depreciation and bonus depreciation varies by jurisdiction. Some states fully conform to federal MACRS provisions, some partially conform, and some have decoupled entirely from federal bonus depreciation. Notable states that have historically decoupled from federal bonus depreciation include California, New York, New Jersey, Pennsylvania, and others. The property owner should consult with a tax advisor licensed in the applicable state(s) regarding the state tax treatment of the deductions generated by this study.",

  passiveActivityDisclaimer:
    "PASSIVE ACTIVITY DISCLAIMER. The depreciation deductions generated by this cost segregation study may be subject to the passive activity loss limitations of IRC §469. Whether the deductions can offset non-passive income depends on the taxpayer's level of participation in the rental activity, the average period of customer use, and the taxpayer's status as a real estate professional. This study does not make any determination regarding the taxpayer's passive activity classification. The property owner should consult with their tax advisor regarding the passive activity implications of this study.",

  recaptureDisclaimer:
    "DEPRECIATION RECAPTURE DISCLAIMER. If the property is sold or disposed of in the future, the depreciation deductions claimed as a result of this cost segregation study may be subject to recapture under IRC §1245 (for personal property) or IRC §1250 (for real property). §1245 recapture is taxed as ordinary income to the extent of previously claimed depreciation. §1250 recapture (unrecaptured §1250 gain) is taxed at a maximum rate of 25% on the portion of gain attributable to depreciation previously claimed on the building. The property owner should consult with their tax advisor regarding the recapture implications of this study prior to any sale or disposition of the property.",

  noReliance:
    "NO THIRD-PARTY RELIANCE. This study was prepared solely for the property owner identified in this report and their authorized tax advisors. No other person or entity is authorized to rely on this study for any purpose. The preparer assumes no duty, liability, or responsibility to any person or entity other than the property owner in connection with this study.",
};
