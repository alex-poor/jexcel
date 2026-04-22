/** Load + cache the parsed workbook state and the currently-viewed slice.
 *
 * Owns:
 *   - the ParseSummary returned from the backend
 *   - the department hierarchy for the sidebar
 *   - the active slice filter (level1/level2 resolved from a slice id)
 *   - the computed SliceData for the current filter
 *
 * Also persists the last-loaded file record to localStorage so the Landing
 * screen can offer a one-click reload on next launch. Cleared via `unload()`.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HierarchyNode, SliceData } from "../data/sample";
import { findNode, resolveSlice, SAMPLE } from "../data/sample";
import {
  clearWorkbook,
  getHierarchy,
  getSlice,
  isTauri,
  parseSummary,
  parseWorkbook,
  type ParseSummary,
} from "../api/tauri";
import { prefs } from "../lib/prefs";

export interface WorkbookState {
  summary: ParseSummary | null;
  hierarchy: HierarchyNode[];
  sliceId: string;
  sliceData: SliceData | null;
  loading: boolean;
  error: string | null;

  loadFromPath: (path: string) => Promise<void>;
  selectSlice: (id: string) => void;
  unload: () => Promise<void>;
}

export interface UseWorkbookOptions {
  /** Years to aggregate over. `null` means "backend default" (rolling 5y). */
  years?: number[] | null;
}

function fakeSummary(): ParseSummary {
  return {
    file: SAMPLE.file,
    parsedAt: SAMPLE.parsedAt,
    totalRows: SAMPLE.totalRows,
    droppedRows: SAMPLE.droppedRows,
    filteredOutRows: 0,
    unmappedDepts: [],
    years: SAMPLE.years,
  };
}

function resolveFilterFromId(
  hierarchy: HierarchyNode[],
  id: string,
): { level1?: string; level2?: string } {
  if (id === "all") return {};
  for (const l1 of hierarchy) {
    if (l1.id === id) return { level1: l1.label };
    for (const l2 of l1.children ?? []) {
      if (l2.id === id) return { level1: l1.label, level2: l2.label };
    }
  }
  return {};
}

export function useWorkbook(options: UseWorkbookOptions = {}): WorkbookState {
  const [summary, setSummary] = useState<ParseSummary | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [sliceId, setSliceId] = useState<string>("all");
  const [sliceData, setSliceData] = useState<SliceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestSeq = useRef(0);

  // Stable key so changing a years-array reference doesn't thrash the
  // slice effect if the values haven't changed.
  const yearsKey = options.years ? options.years.join(",") : "default";

  const refreshAfterLoad = useCallback(async () => {
    if (!isTauri()) return;
    const tree = await getHierarchy();
    setHierarchy(tree);
    setSliceId("all");
    const data = await getSlice({ years: options.years ?? undefined });
    setSliceData(data);
    // deps intentionally exclude options.years — the next filter-change
    // effect will pick up the current years. Re-running this after mount
    // isn't useful anyway; it's fire-once per load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFromPath = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        if (isTauri()) {
          const s = await parseWorkbook(path);
          setSummary(s);
          prefs.lastFile.set({ path, file: s.file, parsedAt: s.parsedAt });
          await refreshAfterLoad();
        } else {
          setSummary(fakeSummary());
          setHierarchy(SAMPLE.hierarchy);
          setSliceId("all");
          setSliceData(SAMPLE.org);
        }
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    },
    [refreshAfterLoad],
  );

  const unload = useCallback(async () => {
    if (isTauri()) {
      try {
        await clearWorkbook();
      } catch {
        /* forgive — we're resetting */
      }
    }
    prefs.lastFile.set(null);
    setSummary(null);
    setHierarchy([]);
    setSliceId("all");
    setSliceData(null);
    setError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isTauri()) {
        if (!cancelled) {
          setSummary(fakeSummary());
          setHierarchy(SAMPLE.hierarchy);
          setSliceData(SAMPLE.org);
        }
        return;
      }
      try {
        const s = await parseSummary();
        if (!cancelled && s) {
          setSummary(s);
          await refreshAfterLoad();
        }
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshAfterLoad]);

  /** Refetch slice when filter or year window changes. */
  useEffect(() => {
    if (!summary) return;
    const mySeq = ++requestSeq.current;

    if (!isTauri()) {
      const data = resolveSlice(sliceId);
      if (mySeq === requestSeq.current) setSliceData(data);
      return;
    }

    const filter = resolveFilterFromId(hierarchy, sliceId);
    getSlice({ ...filter, years: options.years ?? undefined })
      .then((data) => {
        if (mySeq === requestSeq.current) setSliceData(data);
      })
      .catch((e) => {
        if (mySeq === requestSeq.current) setError(String(e));
      });
    // yearsKey stands in for options.years as a stable dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliceId, hierarchy, summary, yearsKey]);

  const selectSlice = useCallback((id: string) => setSliceId(id), []);

  return useMemo(
    () => ({
      summary,
      hierarchy,
      sliceId,
      sliceData,
      loading,
      error,
      loadFromPath,
      selectSlice,
      unload,
    }),
    [
      summary,
      hierarchy,
      sliceId,
      sliceData,
      loading,
      error,
      loadFromPath,
      selectSlice,
      unload,
    ],
  );
}

export function findNodeInHierarchy(
  hierarchy: HierarchyNode[],
  id: string,
): HierarchyNode | null {
  return findNode(hierarchy, id);
}
