//! Port of Python `ingest.py` — reads xlsx, normalises, applies the
//! readme's filter rule, maps departments.

use std::collections::HashMap;
use std::path::Path;

use calamine::{open_workbook_auto, Data, Reader};
use chrono::NaiveDate;

use crate::mapping::DepartmentMapping;
use crate::types::Incident;

/// Columns of interest, keyed by the sheet's header text.
const COLS: &[&str] = &[
    "Serial No.",
    "Date of Incident",
    "Incident Involved",
    "Department/Area",
    "Result in Harm?",
    "Near Miss?",
    "Type of Incident",
    "Incident Type",
    "Date Modified",
    "Created On",
];

/// readme: "exclude values not in ('hazard','occ health/safety')"
const KEEP_TYPES: &[&str] = &["hazards", "occ health/safety"];

pub struct LoadResult {
    pub incidents: Vec<Incident>,
    pub total_rows: usize,
    pub dropped_rows: usize,
    pub filtered_out_rows: usize,
    pub unmapped_depts: Vec<String>,
}

pub fn load_workbook<P: AsRef<Path>>(
    path: P,
    mapping: &DepartmentMapping,
) -> Result<LoadResult, String> {
    let mut workbook = open_workbook_auto(path.as_ref())
        .map_err(|e| format!("could not open workbook: {e}"))?;
    let sheet_name = workbook
        .sheet_names()
        .first()
        .cloned()
        .ok_or_else(|| "workbook has no sheets".to_string())?;
    let range = workbook
        .worksheet_range(&sheet_name)
        .map_err(|e| format!("could not read sheet {sheet_name}: {e}"))?;

    let mut rows = range.rows();
    let header = rows.next().ok_or_else(|| "empty sheet".to_string())?;

    // Map column name -> index; error if any required column missing.
    // Keys are the &'static str entries from COLS, matched against whatever the
    // sheet's header row says.
    let mut col_idx: HashMap<&'static str, usize> = HashMap::new();
    for (i, cell) in header.iter().enumerate() {
        if let Some(name) = cell_str(cell) {
            for known in COLS {
                if *known == name {
                    col_idx.insert(*known, i);
                    break;
                }
            }
        }
    }
    for required in COLS {
        if !col_idx.contains_key(*required) {
            return Err(format!("workbook is missing column: {required}"));
        }
    }

    #[inline]
    fn get<'a>(
        col_idx: &HashMap<&'static str, usize>,
        row: &'a [Data],
        name: &str,
    ) -> Option<&'a Data> {
        col_idx.get(name).and_then(|i| row.get(*i))
    }

    let mut out = Vec::with_capacity(range.height().saturating_sub(1));
    let mut total_rows: usize = 0;
    let mut dropped_rows: usize = 0;
    let mut filtered_out_rows: usize = 0;
    let mut unmapped_set: std::collections::BTreeSet<String> = Default::default();

    for row in rows {
        total_rows += 1;

        let type_of_incident = get(&col_idx, row, "Type of Incident")
            .and_then(cell_str)
            .map(|s| s.trim().to_string())
            .unwrap_or_default();
        let type_lower = type_of_incident.to_lowercase();
        if !KEEP_TYPES.contains(&type_lower.as_str()) {
            filtered_out_rows += 1;
            continue;
        }

        let date_occurred = match get(&col_idx, row, "Date of Incident").and_then(parse_date) {
            Some(d) => d,
            None => {
                dropped_rows += 1;
                continue;
            }
        };
        let date_reported = get(&col_idx, row, "Created On").and_then(parse_date);
        let date_modified = get(&col_idx, row, "Date Modified").and_then(parse_date);

        let department_raw = get(&col_idx, row, "Department/Area")
            .and_then(cell_str)
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty());

        let (dept_level1, dept_level2) = match department_raw.as_deref() {
            Some(raw) => match mapping.map(raw) {
                Some((l1, l2)) => (l1, l2),
                None => {
                    unmapped_set.insert(raw.to_string());
                    ("(unmapped)".to_string(), Some(raw.to_string()))
                }
            },
            None => ("(unmapped)".to_string(), Some("(blank)".to_string())),
        };

        let year = date_occurred.format("%Y").to_string().parse().unwrap_or(0);
        let days_to_report = match (date_reported, date_occurred) {
            (Some(r), o) => Some((r - o).num_days()),
            _ => None,
        };
        let days_to_close = match (date_modified, date_reported) {
            (Some(m), Some(r)) => Some((m - r).num_days()),
            _ => None,
        };

        out.push(Incident {
            serial: get(&col_idx, row, "Serial No.").and_then(cell_str).map(|s| s.trim().to_string()),
            date_occurred,
            date_reported,
            date_modified,
            year,
            department_raw,
            dept_level1,
            dept_level2,
            incident_involved: get(&col_idx, row, "Incident Involved")
                .and_then(cell_str)
                .map(|s| s.trim().to_string()),
            type_of_incident_lower: type_lower,
            incident_type: get(&col_idx, row, "Incident Type")
                .and_then(cell_str)
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty()),
            harm: get(&col_idx, row, "Result in Harm?").and_then(parse_yesno),
            near_miss: get(&col_idx, row, "Near Miss?").and_then(parse_yesno),
            days_to_report,
            days_to_close,
        });
    }

    Ok(LoadResult {
        incidents: out,
        total_rows,
        dropped_rows,
        filtered_out_rows,
        unmapped_depts: unmapped_set.into_iter().collect(),
    })
}

fn cell_str(cell: &Data) -> Option<String> {
    match cell {
        Data::String(s) => Some(s.clone()),
        Data::Float(n) => Some(format_number(*n)),
        Data::Int(i) => Some(i.to_string()),
        Data::Bool(b) => Some(b.to_string()),
        _ => None,
    }
}

fn format_number(n: f64) -> String {
    if n.fract() == 0.0 {
        format!("{}", n as i64)
    } else {
        format!("{}", n)
    }
}

/// Accepts DD-MM-YYYY strings (the sheet's format) OR an Excel serial date.
fn parse_date(cell: &Data) -> Option<NaiveDate> {
    match cell {
        Data::String(s) => {
            let s = s.trim();
            if s.is_empty() {
                return None;
            }
            NaiveDate::parse_from_str(s, "%d-%m-%Y").ok()
        }
        Data::DateTime(dt) => {
            let s = dt.to_string();
            // Excel datetimes are stored as days since 1899-12-30
            // calamine 0.30 gives an ExcelDateTime; use its as_f64 and convert
            if let Ok(days) = s.parse::<f64>() {
                let epoch = NaiveDate::from_ymd_opt(1899, 12, 30)?;
                return Some(epoch + chrono::Duration::days(days as i64));
            }
            None
        }
        Data::DateTimeIso(s) => NaiveDate::parse_from_str(s, "%Y-%m-%d").ok(),
        Data::Float(days) => {
            let epoch = NaiveDate::from_ymd_opt(1899, 12, 30)?;
            Some(epoch + chrono::Duration::days(*days as i64))
        }
        _ => None,
    }
}

fn parse_yesno(cell: &Data) -> Option<bool> {
    cell_str(cell).and_then(|s| match s.trim().to_lowercase().as_str() {
        "yes" => Some(true),
        "no" => Some(false),
        _ => None,
    })
}

