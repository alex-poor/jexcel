/** Typed wrappers around the Rust `#[tauri::command]` functions.
 *
 * Each function mirrors a command in `src-tauri/src/commands.rs`.
 * Types match the Serde shapes (camelCase via `#[serde(rename)]`).
 */

import { invoke } from "@tauri-apps/api/core";
import type { SliceData, HierarchyNode } from "../data/sample";

export interface ParseSummary {
  file: string;
  parsedAt: string;
  totalRows: number;
  droppedRows: number;
  unmappedDepts: string[];
  filteredOutRows: number;
  years: number[];
}

/** Runtime check: are we inside the Tauri webview, or just a browser? */
export function isTauri(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export function parseWorkbook(path: string): Promise<ParseSummary> {
  return invoke<ParseSummary>("parse_workbook", { path });
}

export function parseSummary(): Promise<ParseSummary | null> {
  return invoke<ParseSummary | null>("parse_summary");
}

export function getHierarchy(): Promise<HierarchyNode[]> {
  return invoke<HierarchyNode[]>("get_hierarchy");
}

export interface SliceArgs {
  level1?: string;
  level2?: string;
  years?: number[];
}

export function getSlice(args: SliceArgs = {}): Promise<SliceData> {
  return invoke<SliceData>("get_slice", {
    level1: args.level1 ?? null,
    level2: args.level2 ?? null,
    years: args.years ?? null,
  });
}

export function clearWorkbook(): Promise<void> {
  return invoke<void>("clear_workbook");
}
