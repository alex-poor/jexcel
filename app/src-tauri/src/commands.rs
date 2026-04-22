//! Tauri commands exposed to the frontend.

use std::path::PathBuf;
use std::sync::RwLock;

use chrono::Local;

use crate::ingest::{load_workbook, LoadResult};
use crate::mapping::DepartmentMapping;
use crate::report::{aggregate, build_hierarchy, default_years_window, years_in_data, Filter};
use crate::types::{HierarchyNode, Incident, ParseSummary, SliceData};
use crate::updates::{check as check_updates_inner, UpdateStatus};

pub struct AppState {
    pub mapping: DepartmentMapping,
    pub workbook: RwLock<Option<LoadedWorkbook>>,
}

pub struct LoadedWorkbook {
    pub file: String,
    pub parsed_at: String,
    pub total_rows: usize,
    pub dropped_rows: usize,
    pub filtered_out_rows: usize,
    pub unmapped_depts: Vec<String>,
    pub incidents: Vec<Incident>,
    pub years_available: Vec<i32>,
}

impl AppState {
    pub fn new() -> Result<Self, String> {
        Ok(Self {
            mapping: DepartmentMapping::load_embedded()?,
            workbook: RwLock::new(None),
        })
    }

    fn install(&self, path: &str, res: LoadResult) -> ParseSummary {
        let file = PathBuf::from(path)
            .file_name()
            .and_then(|s| s.to_str())
            .unwrap_or(path)
            .to_string();
        let parsed_at = Local::now().format("%Y-%m-%d %H:%M").to_string();
        let years_available = years_in_data(&res.incidents);
        let summary = ParseSummary {
            file: file.clone(),
            parsed_at: parsed_at.clone(),
            total_rows: res.total_rows,
            dropped_rows: res.dropped_rows,
            unmapped_depts: res.unmapped_depts.clone(),
            filtered_out_rows: res.filtered_out_rows,
            years: years_available.clone(),
        };
        let mut guard = self.workbook.write().unwrap();
        *guard = Some(LoadedWorkbook {
            file,
            parsed_at,
            total_rows: res.total_rows,
            dropped_rows: res.dropped_rows,
            filtered_out_rows: res.filtered_out_rows,
            unmapped_depts: res.unmapped_depts,
            incidents: res.incidents,
            years_available,
        });
        summary
    }
}

#[tauri::command]
pub fn parse_workbook(
    path: String,
    state: tauri::State<'_, AppState>,
) -> Result<ParseSummary, String> {
    let res = load_workbook(&path, &state.mapping)?;
    Ok(state.install(&path, res))
}

#[tauri::command]
pub fn parse_summary(state: tauri::State<'_, AppState>) -> Option<ParseSummary> {
    let guard = state.workbook.read().unwrap();
    guard.as_ref().map(|w| ParseSummary {
        file: w.file.clone(),
        parsed_at: w.parsed_at.clone(),
        total_rows: w.total_rows,
        dropped_rows: w.dropped_rows,
        filtered_out_rows: w.filtered_out_rows,
        unmapped_depts: w.unmapped_depts.clone(),
        years: w.years_available.clone(),
    })
}

#[tauri::command]
pub fn get_hierarchy(state: tauri::State<'_, AppState>) -> Vec<HierarchyNode> {
    let guard = state.workbook.read().unwrap();
    match guard.as_ref() {
        Some(w) => build_hierarchy(&w.incidents),
        None => Vec::new(),
    }
}

#[tauri::command]
pub fn get_slice(
    level1: Option<String>,
    level2: Option<String>,
    years: Option<Vec<i32>>,
    state: tauri::State<'_, AppState>,
) -> Result<SliceData, String> {
    let guard = state.workbook.read().unwrap();
    let wb = guard.as_ref().ok_or_else(|| "no workbook loaded".to_string())?;

    let years_window = years.unwrap_or_else(|| default_years_window(Local::now().format("%Y").to_string().parse().unwrap_or(2026)));

    // Years are supplied separately to `aggregate` so the window drives
    // empty-year inclusion. Filter only carries level1/level2.
    let filter = Filter {
        level1: level1.as_deref(),
        level2: level2.as_deref(),
        years: None,
    };
    Ok(aggregate(&wb.incidents, &filter, &years_window))
}

#[tauri::command]
pub async fn check_for_updates() -> UpdateStatus {
    check_updates_inner().await
}
