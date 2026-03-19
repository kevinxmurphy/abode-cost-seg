# 05 — Missing Components

**Priority:** P2 — Completeness
**Effort:** Small (1 hr)
**Files:** `lib/reportEngine.js`, `lib/propertyCategories.js`

---

## The CPA's Take

> "Your 43-component list covers 90% of what I see in residential STRs. But
> there are a few categories that come up regularly in specific markets that
> you're missing. A lakefront STR without a dock allocation is leaving money
> on the table. A rural mountain cabin without septic is wrong. And solar is
> everywhere now."

---

## Components to Add

### 15-Year Land Improvements (Asset Class 00.3)

```js
{
  id: "septic-system",
  name: "Septic System",
  category: "outdoor",
  macrsClass: 15,
  assetClass: "00.3",
  legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
  description: "Septic tank, drain field, distribution box, pump station, and associated piping",
  typicalPercentRange: [0.5, 2.5],
  weight: 1.5,
},
{
  id: "dock-seawall",
  name: "Dock, Pier & Seawall",
  category: "outdoor",
  macrsClass: 15,
  assetClass: "00.3",
  legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; wharves and docks expressly listed",
  description: "Boat dock, pier, seawall, bulkhead, boat lift, dock lighting, cleats",
  typicalPercentRange: [0.5, 4.0],
  weight: 2.5,
},
{
  id: "well-system",
  name: "Well & Water System",
  category: "outdoor",
  macrsClass: 15,
  assetClass: "00.3",
  legalCitation: "Rev. Proc. 87-56, Asset Class 00.3; Sec. 1250 land improvement",
  description: "Well casing, pump, pressure tank, water treatment, supply line from well to building",
  typicalPercentRange: [0.3, 1.5],
  weight: 0.8,
},
```

### 5-Year Personal Property (Asset Class 57.0)

```js
{
  id: "solar-equipment",
  name: "Solar Panel Equipment",
  category: "systems",
  macrsClass: 5,
  assetClass: "57.0",
  legalCitation: "IRC §168(e)(3)(B)(vi); 5-year recovery for solar energy property",
  description: "Solar panels, inverters, monitoring systems, racking (but not structural roof mounts)",
  typicalPercentRange: [0.5, 3.0],
  weight: 1.5,
},
{
  id: "generator",
  name: "Standby Generator",
  category: "systems",
  macrsClass: 5,
  assetClass: "57.0",
  legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; removable power equipment",
  description: "Whole-house or portable standby generator, transfer switch, fuel connections",
  typicalPercentRange: [0.2, 1.0],
  weight: 0.6,
},
{
  id: "central-vacuum",
  name: "Central Vacuum System",
  category: "interior",
  macrsClass: 5,
  assetClass: "57.0",
  legalCitation: "Rev. Proc. 87-56, Asset Class 57.0; removable building equipment",
  description: "Central vacuum unit, piping, inlets, hose and attachment kit",
  typicalPercentRange: [0.1, 0.4],
  weight: 0.3,
},
```

---

## Wizard Integration (`propertyCategories.js`)

Add to the **HVAC & Systems** category:

```js
{
  id: "solar",
  label: "Solar Panels",
  type: "select",
  options: [
    { value: "owned", label: "Owned system" },
    { value: "leased", label: "Leased (not depreciable)" },
    { value: "none", label: "No solar" },
  ],
},
{
  id: "generator",
  label: "Standby Generator",
  type: "select",
  options: [
    { value: "whole-house", label: "Whole-house generator" },
    { value: "portable", label: "Portable generator" },
    { value: "none", label: "None" },
  ],
},
```

Add to the **Outdoor** category:

```js
{
  id: "waterfront",
  label: "Waterfront Features",
  type: "multi-select",
  options: [
    { value: "dock", label: "Dock / Pier" },
    { value: "seawall", label: "Seawall / Bulkhead" },
    { value: "boat-lift", label: "Boat Lift" },
    { value: "none", label: "None" },
  ],
},
{
  id: "water-system",
  label: "Water / Septic",
  type: "multi-select",
  options: [
    { value: "septic", label: "Septic system" },
    { value: "well", label: "Private well" },
    { value: "none", label: "Municipal water/sewer" },
  ],
},
```

---

## Weight Adjustments in `distributeWithinClass()`

Add cases for new components:

```js
case "solar-equipment":
  if (w.solar === "owned") weight *= 2.0;
  else if (w.solar === "leased" || w.solar === "none" || !w.solar) weight *= 0.01;
  break;

case "generator":
  if (w.generator === "whole-house") weight *= 2.0;
  else if (w.generator === "portable") weight *= 0.8;
  else weight *= 0.01;
  break;

case "dock-seawall":
  if (Array.isArray(w.waterfront) && w.waterfront.some(f => f !== "none")) {
    weight *= 1.5;
    if (w.waterfront.includes("boat-lift")) weight *= 1.3;
  } else {
    weight *= 0.01;
  }
  break;

case "septic-system":
  if (Array.isArray(w["water-system"]) && w["water-system"].includes("septic")) weight *= 2.0;
  else weight *= 0.01;
  break;

case "well-system":
  if (Array.isArray(w["water-system"]) && w["water-system"].includes("well")) weight *= 2.0;
  else weight *= 0.01;
  break;
```

---

## Legal Citations to Add (`legalCitations.js`)

### Solar Energy Property
```js
solarEquipment: {
  title: "Solar Energy Property",
  macrsClass: "5-year",
  assetClass: "48.13 / 57.0",
  ircSection: "§168(e)(3)(B)(vi)",
  justification: "Solar energy property is specifically designated as 5-year MACRS property under IRC §168(e)(3)(B)(vi), as amended by the Energy Policy Act of 2005 and extended by subsequent legislation...",
  // Note: if ITC is claimed, basis must be reduced by 50% of ITC under §50(c)
}
```

### Dock/Seawall
```js
dockSeawall: {
  title: "Docks, Piers & Seawalls",
  macrsClass: "15-year",
  assetClass: "00.3",
  ircSection: "§1250 / §168(e)",
  justification: "Revenue Procedure 87-56, Asset Class 00.3, expressly lists 'wharves and docks' as land improvements with a 20-year class life and 15-year MACRS recovery period...",
}
```

---

## Acceptance Criteria

- [ ] 6 new components added to COMPONENT_MASTER_LIST
- [ ] Wizard fields added for solar, generator, waterfront, and water/septic
- [ ] Weight adjustments in distributeWithinClass() for new components
- [ ] Default weight near zero when feature is absent (don't inflate allocation)
- [ ] Legal citation entries for solar and dock/seawall
- [ ] Component-to-justification mapping updated in reportAssembler.js
- [ ] Solar leased scenario explicitly produces $0 allocation with note
