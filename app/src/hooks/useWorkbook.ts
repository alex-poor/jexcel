/** Load + cache the parsed workbook state and the currently-viewed slice.
 *
 * Owns:
 *   - the ParseSummary returned from the backend
 *   - the department hierarchy for the sidebar
 *   - the active slice filter (level1/level2 resolved from a slice id)
 *   - the computed SliceData for the current filter
 *
 * Works in the browser (Vite-only dev) by falling back to the mock SAMPLE
 * when `isTauri()` is false, so the UI keeps working without the Rust side.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HierarchyNode, SliceData } from "../data/sample";
import { SAMPLE, findNode, resolveSlice } from "../data/sample";
import {
  getHierarchy,
  getSlice,
  isTauri,
  parseSummary,
  parseWorkbook,
  type ParseSummary,
} from "../api/tauri";

export interface WorkbookState {
  summary: ParseSummary | null;
  hierarchy: HierarchyNode[];
  sliceId: string;
  sliceData: SliceData | null;
  loading: boolean;
  error: string | null;

  loadFromPath: (path: string) => Promise<void>;
  selectSlice: (id: string) => void;
}

/** Fall-back summary when running in a browser (no Tauri backend). */
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

export function useWorkbook(): WorkbookState {
  const [summary, setSummary] = useState<ParseSummary | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyNode[]>([]);
  const [sliceId, setSliceId] = useState<string>("all");
  const [sliceData, setSliceData] = useState<SliceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bump this to invalidate any in-flight slice request when the filter changes.
  const requestSeq = useRef(0);

  /** Load hierarchy + initial "All" slice after a successful parse. */
  const refreshAfterLoad = useCallback(async () => {
    if (!isTauri()) return;
    const tree = await getHierarchy();
    setHierarchy(tree);
    setSliceId("all");
    const data = await getSlice({});
    setSliceData(data);
  }, []);

  const loadFromPath = useCallback(
    async (path: string) => {
      setLoading(true);
      setError(null);
      try {
        if (isTauri()) {
          const s = await parseWorkbook(path);
          setSummary(s);
          await refreshAfterLoad();
        } else {
          // Browser-only dev: fake it with the bundled sample.
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

  // First-mount: check if the backend already has a workbook cached
  // (e.g. from a previous launch or a dev autoload).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isTauri()) {
        // Dev in plain browser — pretend we loaded the sample.
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

  /** Refetch the slice whenever the filter changes. */
  useEffect(() => {
    if (!summary) return;
    const mySeq = ++requestSeq.current;

    if (!isTauri()) {
      const data = resolveSlice(sliceId);
      if (mySeq === requestSeq.current) setSliceData(data);
      return;
    }

    const filter = resolveFilterFromId(hierarchy, sliceId);
    getSlice(filter)
      .then((data) => {
        if (mySeq === requestSeq.current) setSliceData(data);
      })
      .catch((e) => {
        if (mySeq === requestSeq.current) setError(String(e));
      });
  }, [sliceId, hierarchy, summary]);

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
    }),
    [summary, hierarchy, sliceId, sliceData, loading, error, loadFromPath, selectSlice],
  );
}

export function findNodeInHierarchy(
  hierarchy: HierarchyNode[],
  id: string,
): HierarchyNode | null {
  return findNode(hierarchy, id);
}
