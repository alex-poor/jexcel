# Incident Reporting Desktop App — Design Brief

## 1. What we're building

A Windows desktop app (Tauri — Rust backend, webview frontend) that replaces a manual Excel-wrangling process for a hospital's health-and-safety team. A safety lead drags a messy incident-export `.xlsx` onto the app; the app parses it, applies a rules engine we've already built, and gives them a clean, modern dashboard showing trends across their organisation.

Today the same analysis is produced by copy-pasting into spreadsheets and writing the narrative up by hand. The target user is a clinical / risk manager — not a data analyst — and the app needs to feel like a genuine upgrade over Excel: more legible, more trustworthy, faster to act on.

## 2. Primary user

- **Role:** hospital risk / quality / H&S manager. Senior clinician background, not technical. Reports to the exec team.
- **Environment:** Windows laptop, standard-user (no admin rights to install MSIs). Often works offline. Modest screen (1440×900 common).
- **Confidence:** high with Excel and clinical systems; low with dev tooling. Must never see a terminal, config file, or stack trace.
- **Emotional stance:** cares deeply about the data (real staff injuries behind every row) and needs to trust the numbers. Visuals must feel accurate and calm, not gimmicky.

## 3. Core workflow (happy path)

1. Open app → **empty state** inviting them to drop an `.xlsx` anywhere on the window.
2. Drag a file in → brief processing state (typically <2 seconds for ~1000 rows) with a progress shimmer and a one-line data-quality summary on completion ("823 incidents parsed, 0 unmapped departments, 5 years of data loaded").
3. Land on the **dashboard** — by default showing whole-org metrics for the last 5 calendar years.
4. Use a left-hand **hierarchy picker** to drill into a level-1 group (e.g. Theatre, Patient Services, Commercial, Administration) and then a level-2 within it (e.g. Theatre › Theatre Suite, Theatre › CSSD). Selection updates every chart in place.
5. Optionally export the current view as a PDF for execs (stretch goal — flag if scope).

## 4. Screens / views

### 4.1 Landing / empty state
- Full-window drop zone. No cramped drop target — the whole app is the drop target.
- Subtle copy: what to drop, the column shape it expects, a small "learn more" affordance for the technical appendix.
- Tiny link to **check for updates** in the footer (see §7).

### 4.2 Main dashboard
Single-page layout. No navigation tabs — everything visible on scroll. Sections (in order):

1. **Header / slice selector:** current filter ("All departments" or a breadcrumb like `Theatre › Theatre Suite`), year window (editable), row count, source filename and parse timestamp.
2. **Volume over time** — primary hero chart. Incident count per year across the window. Subtle YoY delta callouts.
3. **Type split (stacked)** — Occ Health/Safety vs Hazards, % within year, one bar per year.
4. **Sub-category breakdown** — top N incident types per year. Needs to stay legible when one category dominates (Sharps Injury routinely >40%). Consider a bump chart, a heatmap, or a category-per-row table with inline bars.
5. **Timeframe analysis** — the signature visual, see §5 below. This is the chart we most want to feel "impressive".
6. **Harm rate** — % of incidents resulting in harm, per year. Line or area chart.
7. **Near-miss rate** — % logged as near-misses, per year. Twinned with harm chart so the user reads them together.
8. **Data quality panel (collapsed by default)** — total rows, rows dropped for bad dates, unmapped departments, the date range actually present.

### 4.3 Hierarchy picker (persistent left rail)
- Tree: **All** → Level 1 (e.g. Theatre) → Level 2 (e.g. Theatre Suite). Count badge next to each node ("Theatre · 115").
- Click any node → dashboard updates. Keyboard accessible.
- Needs to handle ~7 level-1 groups and ~5–10 level-2s inside each.

### 4.4 Settings
- Update-check cadence (auto on launch / manual only).
- Override the department-grouping rules (advanced; the mapping is a CSV we ship — expose an "open mapping" action).
- Reset loaded data.

## 5. The hero visualisation — "Timeframe Analysis"

We have three dates per incident:
- **Occurred** (when the event happened)
- **Reported** (when it was logged)
- **Closed** (proxy: last-modified)

The report shows, per year:
- Average days between Occurred → Reported ("reporting lag")
- Average days between Reported → Closed ("closure duration")

Example: 2024 — 8.54 days → 76.61 days. 2025 — 1.41 days → 61.38 days. 2026 — 8.00 days → 14.83 days. These are meaningful operational numbers the team acts on.

**We want this chart to be the standout.** Possible directions (pick the strongest, we're not prescribing):
- A horizontal timeline per year with two segments (lag + closure) on a shared time axis, so a shorter bar visibly means a better year.
- A slope / trajectory chart showing both metrics moving over years on the same axes.
- An animated reveal on first load (restrained — one pass, no loops).

Constraints:
- Must stay legible if the window covers only 3 years or stretches to 5+.
- Must tolerate the occasional empty year (some slices have 0 rows in a year).
- Tooltips must give the exact number in days, not a rounded approximation.

## 6. Chart-library choice (for the designer to weigh in on)

Frontend will be a webview, so any of D3, Recharts, ECharts, Visx, or Observable Plot are fair game. We'd love a recommendation. Priorities: crisp type, smooth resize, accessible tooltips, print-friendly (for the PDF export stretch). Avoid anything that looks like a 2015 Bootstrap demo.

## 7. "Check for updates" widget

- Polls the app's GitHub repo releases API on launch (and on click).
- Footer status shows one of: *Up to date · You're on v1.2.0*, *Update available — v1.3.0 (download)*, *Offline*.
- Clicking "download" opens the GitHub release page in the default browser; **no auto-update mechanism** (keeps us out of admin-install territory).
- Failure to reach GitHub must be silent — never a blocking modal.

## 8. Non-negotiable constraints

- **Install without admin rights.** Ship a per-user installer (Tauri supports NSIS per-user) or a portable .exe. No MSI, no services, no registry writes to HKLM.
- **Fully offline-capable.** No telemetry, no network calls except the GitHub release poll above. Data never leaves the machine — the spreadsheet is clinical and PII-adjacent.
- **Windows 10/11, x64.** Single primary target.
- **Font sizes big enough for a tired clinician at the end of a shift.** Assume 14px minimum body, 16px preferred.
- **Colour palette must work for someone with deuteranopia.** Do not encode "harm / no-harm" with red/green alone.

## 9. Tone & aesthetic

- **Clinical-modern**, not corporate-dashboard. Think: a well-designed healthcare product, not a finance BI tool.
- Calm, trustworthy, a bit optimistic — the team is doing important work and the app should feel like it respects that.
- Light mode primary; dark mode if cheap. Not a priority.
- Typography-forward. We'd rather see confident numbers and clean type than decorative chrome.
- Avoid: emoji used as iconography, hospital clip-art, "dashboardy" gradients, Lottie animations for their own sake.

## 10. Data shapes the designer should know about

Row count: ~800–1500 after filtering. Years in a typical window: 3–5. Level-1 groups: 6–8. Level-2 groups per level-1: 1–10. Some slices have zero rows in some years — the UI must not break or look broken when that happens.

Filters always compose as: **(department hierarchy) ∧ (year window)**. The year window is editable (default: last 5 calendar years, rolls automatically).

## 11. Out of scope for v1

- Multi-user / cloud sync.
- Editing incidents inside the app.
- Deriving category from free-text summary (that's an ML task for later).
- Non-Windows builds.
- Auth / login.

## 12. Deliverables we'd love back

1. Hi-fi mockups of the three screens (landing, dashboard, settings).
2. A specific recommendation + mock for the Timeframe Analysis hero chart.
3. Component inventory and a minimal token set (colour, spacing, type) we can codify as CSS variables.
4. Empty-state, loading-state, and error-state treatments for the dashboard.
5. Chart-library recommendation with one paragraph of reasoning.

---

**Reference implementation.** A working Python rules engine already produces every metric in this brief from the sample file `Notify-11-76-226.xlsx`. The Tauri port will reimplement the same transforms in Rust; the metrics and their semantics are settled. The designer's job is to make them readable, trustworthy, and, where possible, memorable.
