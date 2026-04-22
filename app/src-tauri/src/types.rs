//! Shared data types. Serde renames land them in camelCase so the frontend
//! consumes the same shape as the existing `sample.ts` mock.

use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

/// One row from the spreadsheet, already normalised and mapped.
#[derive(Debug, Clone)]
pub struct Incident {
    pub serial: Option<String>,
    pub date_occurred: NaiveDate,
    pub date_reported: Option<NaiveDate>,
    pub date_modified: Option<NaiveDate>,
    pub year: i32,
    pub department_raw: Option<String>,
    pub dept_level1: String,
    pub dept_level2: Option<String>,
    pub incident_involved: Option<String>,
    pub type_of_incident_lower: String,
    pub incident_type: Option<String>,
    pub harm: Option<bool>,
    pub near_miss: Option<bool>,
    pub days_to_report: Option<i64>,
    pub days_to_close: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TypeSplit {
    pub ohs: f64,
    pub haz: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Timeframe {
    pub lag: f64,
    pub closure: f64,
}

/// Matches the `SliceData` interface in `app/src/data/sample.ts`.
#[derive(Debug, Clone, Serialize)]
pub struct SliceData {
    pub count: BTreeMap<i32, usize>,
    #[serde(rename = "typeSplit")]
    pub type_split: BTreeMap<i32, TypeSplit>,
    pub subcat: BTreeMap<i32, BTreeMap<String, usize>>,
    pub timeframe: BTreeMap<i32, Timeframe>,
    #[serde(rename = "harmRate")]
    pub harm_rate: BTreeMap<i32, f64>,
    #[serde(rename = "nearMissRate")]
    pub near_miss_rate: BTreeMap<i32, f64>,
}

/// Matches the `HierarchyNode` interface.
#[derive(Debug, Clone, Serialize)]
pub struct HierarchyNode {
    pub id: String,
    pub label: String,
    pub count: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub children: Option<Vec<HierarchyNode>>,
}

/// Returned from `parse_workbook` — a lightweight summary for the UI.
#[derive(Debug, Clone, Serialize)]
pub struct ParseSummary {
    pub file: String,
    #[serde(rename = "parsedAt")]
    pub parsed_at: String,
    #[serde(rename = "totalRows")]
    pub total_rows: usize,
    #[serde(rename = "droppedRows")]
    pub dropped_rows: usize,
    #[serde(rename = "unmappedDepts")]
    pub unmapped_depts: Vec<String>,
    #[serde(rename = "filteredOutRows")]
    pub filtered_out_rows: usize,
    pub years: Vec<i32>,
}
