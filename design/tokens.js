// Design tokens for the two aesthetic directions.
// These are plain JS objects so any React component can consume them.

window.THEMES = {
  // A. Warm Clinical — off-white paper, ink-dark text, teal accent, serif numerals
  warm: {
    name: 'Warm Clinical',
    bg: '#f6f3ee',         // paper
    surface: '#ffffff',
    surfaceAlt: '#faf7f2',
    border: '#e6e0d5',
    borderStrong: '#d4ccbc',
    ink: '#1f1b16',        // near-black
    ink2: '#4a443a',       // body
    ink3: '#7a7264',       // caption
    accent: '#0b7a74',     // deep teal
    accentSoft: '#d4ebe9',
    accentInk: '#06514d',
    // Categorical — deuteranopia-safe (teal/amber/violet/slate/rose/sand)
    cat: ['#0b7a74', '#c07a1c', '#6b5ea8', '#3d5a80', '#b8506c', '#8a8070', '#4a7a8c'],
    // Rate colors — harm is a warm amber-brown, near-miss is teal
    harm: '#b8621c',
    harmSoft: '#f3dfc8',
    nearMiss: '#0b7a74',
    nearMissSoft: '#d4ebe9',
    // Timeframe segments: lag (amber), closure (teal)
    lag: '#c07a1c',
    closure: '#0b7a74',
    sansFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    numFont: '"Newsreader", "Source Serif 4", Georgia, serif',
    monoFont: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  },
  // B. Neutral Pro — cool grey, all-sans, quietly modern
  neutral: {
    name: 'Neutral Pro',
    bg: '#f7f8fa',
    surface: '#ffffff',
    surfaceAlt: '#fbfcfd',
    border: '#e5e8ed',
    borderStrong: '#cfd4dc',
    ink: '#0f1419',
    ink2: '#3a424d',
    ink3: '#6b7380',
    accent: '#2e5bff',     // indigo-blue
    accentSoft: '#e1e8ff',
    accentInk: '#1a3ecc',
    cat: ['#2e5bff', '#d97706', '#7c3aed', '#0891b2', '#be123c', '#475569', '#059669'],
    harm: '#d97706',
    harmSoft: '#fde9c7',
    nearMiss: '#2e5bff',
    nearMissSoft: '#e1e8ff',
    lag: '#d97706',
    closure: '#2e5bff',
    sansFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    numFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    monoFont: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  },
};

// Density presets
window.DENSITIES = {
  comfortable: {
    padCard: 24,
    padSection: 20,
    rowGap: 20,
    colGap: 20,
    cardRadius: 10,
    rowHeight: 32,
  },
  compact: {
    padCard: 16,
    padSection: 14,
    rowGap: 14,
    colGap: 14,
    cardRadius: 8,
    rowHeight: 26,
  },
};

// Sample data — uses the brief's example figures where available,
// fills in plausible rest for a ~1100-incident/year mid-size hospital.
window.SAMPLE = {
  file: 'Notify-11-76-226.xlsx',
  parsedAt: '2026-04-22 09:14',
  totalRows: 4127,
  droppedRows: 3,
  unmappedDepts: 0,
  years: [2022, 2023, 2024, 2025, 2026],
  // Whole-org series
  org: {
    count: { 2022: 1031, 2023: 1145, 2024: 1208, 2025: 1094, 2026: 649 }, // 2026 partial
    // Type split — Occ Health/Safety vs Hazards (% within year)
    typeSplit: {
      2022: { ohs: 0.71, haz: 0.29 },
      2023: { ohs: 0.68, haz: 0.32 },
      2024: { ohs: 0.66, haz: 0.34 },
      2025: { ohs: 0.64, haz: 0.36 },
      2026: { ohs: 0.62, haz: 0.38 },
    },
    // Sub-category counts — illustrative, sharps dominates
    subcat: {
      2022: { 'Sharps Injury': 465, 'Slip / Trip / Fall': 128, 'Manual Handling': 112, 'Violence & Aggression': 89, 'Chemical Exposure': 54, 'Other': 183 },
      2023: { 'Sharps Injury': 502, 'Slip / Trip / Fall': 146, 'Manual Handling': 128, 'Violence & Aggression': 104, 'Chemical Exposure': 61, 'Other': 204 },
      2024: { 'Sharps Injury': 548, 'Slip / Trip / Fall': 151, 'Manual Handling': 133, 'Violence & Aggression': 114, 'Chemical Exposure': 58, 'Other': 204 },
      2025: { 'Sharps Injury': 489, 'Slip / Trip / Fall': 140, 'Manual Handling': 121, 'Violence & Aggression': 98, 'Chemical Exposure': 52, 'Other': 194 },
      2026: { 'Sharps Injury': 287, 'Slip / Trip / Fall': 82, 'Manual Handling': 71, 'Violence & Aggression': 61, 'Chemical Exposure': 31, 'Other': 117 },
    },
    // Hero: Timeframe Analysis — days
    timeframe: {
      2022: { lag: 12.4, closure: 88.2 },
      2023: { lag: 10.8, closure: 82.1 },
      2024: { lag: 8.54, closure: 76.61 },
      2025: { lag: 1.41, closure: 61.38 },
      2026: { lag: 8.00, closure: 14.83 }, // YTD
    },
    // Harm & near-miss rates (%)
    harmRate:    { 2022: 0.142, 2023: 0.138, 2024: 0.128, 2025: 0.118, 2026: 0.112 },
    nearMissRate:{ 2022: 0.214, 2023: 0.241, 2024: 0.268, 2025: 0.301, 2026: 0.322 },
  },
  // Hierarchy — level-1 with level-2 children + counts (summed across window)
  hierarchy: [
    { id: 'theatre', label: 'Theatre', count: 1158, children: [
      { id: 'theatre-suite', label: 'Theatre Suite', count: 612 },
      { id: 'cssd', label: 'CSSD', count: 214 },
      { id: 'anaesthetics', label: 'Anaesthetics', count: 188 },
      { id: 'recovery', label: 'Recovery', count: 144 },
    ]},
    { id: 'patient-services', label: 'Patient Services', count: 1740, children: [
      { id: 'ward-a', label: 'Ward A', count: 382 },
      { id: 'ward-b', label: 'Ward B', count: 341 },
      { id: 'outpatients', label: 'Outpatients', count: 298 },
      { id: 'imaging', label: 'Imaging', count: 261 },
      { id: 'pharmacy', label: 'Pharmacy', count: 246 },
      { id: 'physio', label: 'Physiotherapy', count: 212 },
    ]},
    { id: 'commercial', label: 'Commercial', count: 418, children: [
      { id: 'catering', label: 'Catering', count: 184 },
      { id: 'retail', label: 'Retail', count: 141 },
      { id: 'estates', label: 'Estates', count: 93 },
    ]},
    { id: 'administration', label: 'Administration', count: 296, children: [
      { id: 'hr', label: 'HR', count: 88 },
      { id: 'finance', label: 'Finance', count: 72 },
      { id: 'it', label: 'IT', count: 81 },
      { id: 'governance', label: 'Governance', count: 55 },
    ]},
    { id: 'facilities', label: 'Facilities', count: 372, children: [
      { id: 'housekeeping', label: 'Housekeeping', count: 168 },
      { id: 'maintenance', label: 'Maintenance', count: 121 },
      { id: 'security', label: 'Security', count: 83 },
    ]},
    { id: 'diagnostics', label: 'Diagnostics', count: 143, children: [
      { id: 'pathology', label: 'Pathology', count: 88 },
      { id: 'radiology-support', label: 'Radiology Support', count: 55 },
    ]},
  ],
  // A realistic slice — Theatre › Theatre Suite
  slice: {
    'theatre-suite': {
      count: { 2022: 138, 2023: 144, 2024: 155, 2025: 112, 2026: 63 },
      typeSplit: {
        2022: { ohs: 0.82, haz: 0.18 },
        2023: { ohs: 0.80, haz: 0.20 },
        2024: { ohs: 0.78, haz: 0.22 },
        2025: { ohs: 0.76, haz: 0.24 },
        2026: { ohs: 0.74, haz: 0.26 },
      },
      subcat: {
        2022: { 'Sharps Injury': 91, 'Chemical Exposure': 12, 'Manual Handling': 11, 'Slip / Trip / Fall': 10, 'Violence & Aggression': 4, 'Other': 10 },
        2023: { 'Sharps Injury': 98, 'Chemical Exposure': 14, 'Manual Handling': 12, 'Slip / Trip / Fall': 9, 'Violence & Aggression': 3, 'Other': 8 },
        2024: { 'Sharps Injury': 108, 'Chemical Exposure': 13, 'Manual Handling': 12, 'Slip / Trip / Fall': 11, 'Violence & Aggression': 3, 'Other': 8 },
        2025: { 'Sharps Injury': 75, 'Chemical Exposure': 11, 'Manual Handling': 9, 'Slip / Trip / Fall': 8, 'Violence & Aggression': 2, 'Other': 7 },
        2026: { 'Sharps Injury': 41, 'Chemical Exposure': 7, 'Manual Handling': 6, 'Slip / Trip / Fall': 4, 'Violence & Aggression': 1, 'Other': 4 },
      },
      timeframe: {
        2022: { lag: 9.8, closure: 92.1 },
        2023: { lag: 8.2, closure: 85.4 },
        2024: { lag: 6.1, closure: 71.3 },
        2025: { lag: 0.9, closure: 54.8 },
        2026: { lag: 4.2, closure: 11.6 },
      },
      harmRate:    { 2022: 0.181, 2023: 0.174, 2024: 0.161, 2025: 0.143, 2026: 0.127 },
      nearMissRate:{ 2022: 0.168, 2023: 0.194, 2024: 0.221, 2025: 0.268, 2026: 0.302 },
    }
  }
};

// Helpers
window.fmtInt = (n) => n == null ? '—' : n.toLocaleString('en-GB');
window.fmtPct = (n, digits=1) => n == null ? '—' : (n*100).toFixed(digits) + '%';
window.fmtDays = (n, digits=2) => n == null ? '—' : n.toFixed(digits);
window.deltaPct = (curr, prev) => {
  if (prev == null || prev === 0 || curr == null) return null;
  return (curr - prev) / prev;
};
