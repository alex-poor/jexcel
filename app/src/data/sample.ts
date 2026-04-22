/** Typed port of window.SAMPLE from design/tokens.js.
 *
 * This is still mock data — we're about to replace it with real parsed data
 * coming from the Rust backend. Keeping the shape identical so the UI port
 * stays unchanged when we swap sources.
 */

export type Year = number;

export interface TypeSplit {
  ohs: number;
  haz: number;
}

export interface Timeframe {
  lag: number;
  closure: number;
}

export type CountByYear = Record<Year, number>;
export type RateByYear = Record<Year, number>;
export type SubcatByYear = Record<Year, Record<string, number>>;
export type TypeSplitByYear = Record<Year, TypeSplit>;
export type TimeframeByYear = Record<Year, Timeframe>;

export interface SliceData {
  count: CountByYear;
  typeSplit: TypeSplitByYear;
  subcat: SubcatByYear;
  timeframe: TimeframeByYear;
  harmRate: RateByYear;
  nearMissRate: RateByYear;
}

export interface HierarchyNode {
  id: string;
  label: string;
  count: number;
  children?: HierarchyNode[];
}

export interface SampleShape {
  file: string;
  parsedAt: string;
  totalRows: number;
  droppedRows: number;
  unmappedDepts: number;
  years: Year[];
  org: SliceData;
  hierarchy: HierarchyNode[];
  slice: Record<string, SliceData>;
}

export const SAMPLE: SampleShape = {
  file: "Notify-11-76-226.xlsx",
  parsedAt: "2026-04-22 09:14",
  totalRows: 4127,
  droppedRows: 3,
  unmappedDepts: 0,
  years: [2022, 2023, 2024, 2025, 2026],
  org: {
    count: { 2022: 1031, 2023: 1145, 2024: 1208, 2025: 1094, 2026: 649 },
    typeSplit: {
      2022: { ohs: 0.71, haz: 0.29 },
      2023: { ohs: 0.68, haz: 0.32 },
      2024: { ohs: 0.66, haz: 0.34 },
      2025: { ohs: 0.64, haz: 0.36 },
      2026: { ohs: 0.62, haz: 0.38 },
    },
    // Proportions modelled on the real Notify dataset (Sharps climbing while
    // Needlestick disappears from 2024, etc.), scaled up to this mock's
    // larger org-wide totals. The per-row SubcatTable bars need year-over-
    // year variance to show anything interesting — keep it spiky, not flat.
    subcat: {
      2022: { "Sharps Injury": 182, "Manual Handling": 86, "Slip / Trip / Fall": 97, "Psychological": 107, "Exposure": 54, "Needlestick": 64, "Patient-Related Manual Handling": 43, "Struck By Object": 32, "Superficial Injury": 64, "Other": 302 },
      2023: { "Sharps Injury": 245, "Manual Handling": 145, "Slip / Trip / Fall": 103, "Psychological": 88, "Exposure": 114, "Needlestick": 23, "Patient-Related Manual Handling": 22, "Struck By Object": 114, "Superficial Injury": 91, "Other": 200 },
      2024: { "Sharps Injury": 264, "Manual Handling": 209, "Slip / Trip / Fall": 110, "Psychological": 55, "Exposure": 77, "Needlestick": 0, "Patient-Related Manual Handling": 55, "Struck By Object": 66, "Superficial Injury": 88, "Other": 284 },
      2025: { "Sharps Injury": 195, "Manual Handling": 152, "Slip / Trip / Fall": 76, "Psychological": 120, "Exposure": 87, "Needlestick": 0, "Patient-Related Manual Handling": 65, "Struck By Object": 65, "Superficial Injury": 22, "Other": 312 },
      2026: { "Sharps Injury": 93, "Manual Handling": 74, "Slip / Trip / Fall": 44, "Psychological": 19, "Exposure": 93, "Needlestick": 0, "Patient-Related Manual Handling": 19, "Struck By Object": 56, "Superficial Injury": 37, "Other": 214 },
    },
    timeframe: {
      2022: { lag: 12.4, closure: 88.2 },
      2023: { lag: 10.8, closure: 82.1 },
      2024: { lag: 8.54, closure: 76.61 },
      2025: { lag: 1.41, closure: 61.38 },
      2026: { lag: 8.0, closure: 14.83 },
    },
    harmRate: { 2022: 0.142, 2023: 0.138, 2024: 0.128, 2025: 0.118, 2026: 0.112 },
    nearMissRate: { 2022: 0.214, 2023: 0.241, 2024: 0.268, 2025: 0.301, 2026: 0.322 },
  },
  hierarchy: [
    { id: "theatre", label: "Theatre", count: 1158, children: [
      { id: "theatre-suite", label: "Theatre Suite", count: 612 },
      { id: "cssd", label: "CSSD", count: 214 },
      { id: "anaesthetics", label: "Anaesthetics", count: 188 },
      { id: "recovery", label: "Recovery", count: 144 },
    ]},
    { id: "patient-services", label: "Patient Services", count: 1740, children: [
      { id: "ward-a", label: "Ward A", count: 382 },
      { id: "ward-b", label: "Ward B", count: 341 },
      { id: "outpatients", label: "Outpatients", count: 298 },
      { id: "imaging", label: "Imaging", count: 261 },
      { id: "pharmacy", label: "Pharmacy", count: 246 },
      { id: "physio", label: "Physiotherapy", count: 212 },
    ]},
    { id: "commercial", label: "Commercial", count: 418, children: [
      { id: "catering", label: "Catering", count: 184 },
      { id: "retail", label: "Retail", count: 141 },
      { id: "estates", label: "Estates", count: 93 },
    ]},
    { id: "administration", label: "Administration", count: 296, children: [
      { id: "hr", label: "HR", count: 88 },
      { id: "finance", label: "Finance", count: 72 },
      { id: "it", label: "IT", count: 81 },
      { id: "governance", label: "Governance", count: 55 },
    ]},
    { id: "facilities", label: "Facilities", count: 372, children: [
      { id: "housekeeping", label: "Housekeeping", count: 168 },
      { id: "maintenance", label: "Maintenance", count: 121 },
      { id: "security", label: "Security", count: 83 },
    ]},
    { id: "diagnostics", label: "Diagnostics", count: 143, children: [
      { id: "pathology", label: "Pathology", count: 88 },
      { id: "radiology-support", label: "Radiology Support", count: 55 },
    ]},
  ],
  slice: {
    "theatre-suite": {
      count: { 2022: 138, 2023: 144, 2024: 155, 2025: 112, 2026: 63 },
      typeSplit: {
        2022: { ohs: 0.82, haz: 0.18 },
        2023: { ohs: 0.80, haz: 0.20 },
        2024: { ohs: 0.78, haz: 0.22 },
        2025: { ohs: 0.76, haz: 0.24 },
        2026: { ohs: 0.74, haz: 0.26 },
      },
      // Theatre Suite: sharps-dominant (30-40% range), needlestick dies off
      // after 2023, manual handling climbs 2022→2024 then eases. More varied
      // than the previous flat mock so the table actually tells a story.
      subcat: {
        2022: { "Sharps Injury": 48, "Manual Handling": 18, "Slip / Trip / Fall": 15, "Psychological": 8, "Exposure": 15, "Struck By Object": 6, "Needlestick": 10, "Other": 18 },
        2023: { "Sharps Injury": 58, "Manual Handling": 22, "Slip / Trip / Fall": 12, "Psychological": 6, "Exposure": 18, "Struck By Object": 8, "Needlestick": 3, "Other": 17 },
        2024: { "Sharps Injury": 65, "Manual Handling": 30, "Slip / Trip / Fall": 12, "Psychological": 4, "Exposure": 14, "Struck By Object": 10, "Needlestick": 0, "Other": 20 },
        2025: { "Sharps Injury": 44, "Manual Handling": 22, "Slip / Trip / Fall": 8, "Psychological": 8, "Exposure": 12, "Struck By Object": 6, "Needlestick": 0, "Other": 12 },
        2026: { "Sharps Injury": 20, "Manual Handling": 12, "Slip / Trip / Fall": 5, "Psychological": 3, "Exposure": 8, "Struck By Object": 4, "Needlestick": 0, "Other": 11 },
      },
      timeframe: {
        2022: { lag: 9.8, closure: 92.1 },
        2023: { lag: 8.2, closure: 85.4 },
        2024: { lag: 6.1, closure: 71.3 },
        2025: { lag: 0.9, closure: 54.8 },
        2026: { lag: 4.2, closure: 11.6 },
      },
      harmRate: { 2022: 0.181, 2023: 0.174, 2024: 0.161, 2025: 0.143, 2026: 0.127 },
      nearMissRate: { 2022: 0.168, 2023: 0.194, 2024: 0.221, 2025: 0.268, 2026: 0.302 },
    },
  },
};

/** Find a hierarchy node by id. */
export function findNode(tree: HierarchyNode[], id: string): HierarchyNode | null {
  for (const n of tree) {
    if (n.id === id) return n;
    if (n.children) {
      const c = findNode(n.children, id);
      if (c) return c;
    }
  }
  return null;
}

/** Path from root to node (inclusive). */
export function findPath(tree: HierarchyNode[], id: string): HierarchyNode[] {
  for (const n of tree) {
    if (n.id === id) return [n];
    if (n.children) {
      const sub = findPath(n.children, id);
      if (sub.length) return [n, ...sub];
    }
  }
  return [];
}

/** Synthesise a scaled slice from org totals — used for level-1 nodes
 *  until we wire real per-slice data from the backend. */
export function scaleOrg(org: SliceData, scale: number, key: string): SliceData {
  const seed = key ? key.charCodeAt(0) : 0;
  const jitter = (y: number, k: string) => 1 + ((y * 31 + seed + k.length) % 7 - 3) * 0.02;

  const scaleCounts = (m: CountByYear): CountByYear =>
    Object.fromEntries(
      Object.entries(m).map(([y, v]) => [Number(y), Math.round(v * scale * jitter(Number(y), "c"))]),
    ) as CountByYear;

  const scaleRates = (m: RateByYear, k: string): RateByYear =>
    Object.fromEntries(
      Object.entries(m).map(([y, v]) => [Number(y), v * jitter(Number(y), k)]),
    ) as RateByYear;

  const scaleSub = (m: SubcatByYear): SubcatByYear =>
    Object.fromEntries(
      Object.entries(m).map(([y, cats]) => [
        Number(y),
        Object.fromEntries(
          Object.entries(cats).map(([cat, v]) => [cat, Math.round(v * scale * jitter(Number(y), cat))]),
        ),
      ]),
    ) as SubcatByYear;

  const scaleSplit = (m: TypeSplitByYear): TypeSplitByYear =>
    Object.fromEntries(
      Object.entries(m).map(([y, d]) => {
        const ohs = Math.min(0.95, Math.max(0.3, d.ohs * jitter(Number(y), "o")));
        return [Number(y), { ohs, haz: 1 - ohs }];
      }),
    ) as TypeSplitByYear;

  const scaleTf = (m: TimeframeByYear): TimeframeByYear =>
    Object.fromEntries(
      Object.entries(m).map(([y, d]) => [
        Number(y),
        { lag: d.lag * jitter(Number(y), "l"), closure: d.closure * jitter(Number(y), "c") },
      ]),
    ) as TimeframeByYear;

  return {
    count: scaleCounts(org.count),
    typeSplit: scaleSplit(org.typeSplit),
    subcat: scaleSub(org.subcat),
    timeframe: scaleTf(org.timeframe),
    harmRate: scaleRates(org.harmRate, "h"),
    nearMissRate: scaleRates(org.nearMissRate, "n"),
  };
}

/** Pick or synthesise a slice for a given id. */
export function resolveSlice(id: string): SliceData {
  if (id === "all" || id === "root") return SAMPLE.org;
  if (SAMPLE.slice[id]) return SAMPLE.slice[id];
  const node = findNode(SAMPLE.hierarchy, id);
  const totalCount = SAMPLE.hierarchy.reduce((a, b) => a + b.count, 0);
  const scale = node ? node.count / totalCount : 1;
  return scaleOrg(SAMPLE.org, scale, id);
}
