# Incident Reporting

A desktop app that turns messy hospital incident-export spreadsheets into a clean, trustworthy dashboard of health-and-safety trends.

Drag an `.xlsx` onto the window; the app parses it, applies a rules engine (department grouping, date normalisation, category filtering), and renders year-over-year views of incident volume, type split, sub-categories, timeframe analysis, harm rate and near-miss rate. Data never leaves the machine.

Built with [Tauri](https://tauri.app/) (Rust backend, React + TypeScript webview). The original rules engine is also available as a standalone Python script for sense-checking.

## Status

Pre-1.0 (`v0.1.x`). The Tauri app is the primary artifact; the Python scripts at the repo root are the reference implementation the Rust port was built against.

## Features

- **Drag-and-drop ingest** — the whole window is a drop target. ~1000-row files parse in under 2 seconds.
- **Rules engine** — normalises `DD-MM-YYYY` dates to ISO 8601, filters `type of incident` to `hazard` / `occ health/safety`, and groups the free-text `Department/Area` field into a two-level hierarchy via [department_mapping.csv](department_mapping.csv).
- **Dashboard** — volume over time, type split, sub-category breakdown, timeframe analysis (reporting lag and closure duration), harm rate, near-miss rate, and a data-quality panel.
- **Hierarchy drill-down** — left-rail tree (e.g. *Theatre › Theatre Suite*) filters every chart in place.
- **Offline by default** — no telemetry, no network calls except an optional GitHub release poll for update notifications.
- **Per-user install** — no admin rights required on Windows.

## Repository layout

```
app/                 Tauri desktop app
  src/               React + TypeScript frontend
  src-tauri/         Rust backend (parsing, rules engine, IPC)
ingest.py            Python: parse the sample .xlsx
mapping.py           Python: apply department grouping
reporting.py         Python: produce terminal report
main.py              Python: entrypoint tying the above together
department_mapping.csv   Source of truth for department grouping
design-brief.md      Product/design brief for the desktop app
```

## Running the desktop app

Prerequisites: [Rust toolchain](https://rustup.rs/), Node 18+, and the [Tauri v2 system dependencies](https://v2.tauri.app/start/prerequisites/) for your platform.

```sh
cd app
npm install
npm run tauri dev
```

To produce a release build:

```sh
cd app
npm run tauri build
```

Artifacts land in `app/src-tauri/target/release/bundle/`.

## Running the Python reference implementation

```sh
python -m venv myenv
source myenv/bin/activate.fish  # or activate / activate.bat
pip install pandas openpyxl
python main.py <path-to-xlsx>
```

Output is a terminal report mirroring the metrics the desktop app renders visually.

## Expected input shape

One row per incident. The rules engine reads these columns:

| Column              | Notes                                                                 |
|---------------------|-----------------------------------------------------------------------|
| Incident involved   | Categorises the person involved. Required.                             |
| Summary             | Free-text narrative.                                                   |
| Incident status     | `closed` is treated as abandoned; `completed`/`closed` use last-modified as close date. |
| Date of incident    | Accepts `DD-MM-YYYY`; normalised to ISO 8601 internally.               |
| Department/Area     | Free text; grouped via [department_mapping.csv](department_mapping.csv). |
| Date modified       | Proxy for date closed when status is completed/closed.                 |
| Created on          | Date the incident was reported.                                        |
| Result in harm?     | Boolean.                                                               |
| Near miss?          | Boolean.                                                               |
| Type of incident    | Rows outside `hazard` / `occ health/safety` are excluded.              |
| Incident type       | Sub-category used in the breakdown.                                    |

A sample file is included in the repo (`Notify-11-76-226.xlsx`) for development.

## Department grouping

Departments are mapped to a two-level hierarchy. The first token before `:` is the level-1 group (e.g. *Theatre*, *Patient Services*, *Commercial*, *Administration*); anything after the colon is level 2. See [department_mapping.csv](department_mapping.csv) for the full mapping.

## Platform support

Primary target is Windows 10/11 x64 (per-user NSIS installer). Linux and macOS builds are producible from source but not part of the release pipeline.

## Updates

The app polls its GitHub releases on launch and shows a footer status (*Up to date* / *Update available* / *Offline*). Clicking an available update opens the release page in the default browser — there is no silent auto-update.

## Privacy

The input spreadsheets are clinical and PII-adjacent. The app makes no network calls with ingested data, writes nothing to remote services, and stores parsed results only on the local disk under the user's profile.

## License

Not yet specified.
