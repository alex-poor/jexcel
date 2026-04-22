import { useEffect, useMemo, useState } from "react";
import { THEMES } from "./theme";
import { Sidebar } from "./components/shell/Sidebar";
import { LandingScreen } from "./screens/Landing";
import { Dashboard } from "./screens/Dashboard";
import { SettingsScreen } from "./screens/Settings";
import { useWorkbook } from "./hooks/useWorkbook";
import { useUpdates } from "./hooks/useUpdates";
import { usePref, prefs, type YearWindowPreset } from "./lib/prefs";
import { isTauri } from "./api/tauri";

type View = "dashboard" | "settings";

/** Turn the preset into a concrete years array (or null for the backend default). */
function yearsFromPreset(
  preset: YearWindowPreset,
  availableYears: number[] | undefined,
): number[] | null {
  if (preset === "rolling_5") return null; // backend default = rolling 5
  if (preset === "rolling_3") {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y];
  }
  if (preset === "all") return availableYears ?? null;
  return null;
}

export default function App() {
  const theme = THEMES.warm;
  const density: "comfortable" | "compact" = "comfortable";

  const [checkOnLaunch] = usePref("check-on-launch", true);
  const [yearPreset] = usePref<"year-window">("year-window", "rolling_5");

  // Kept in state so we can widen it once the workbook summary lands (needed
  // for the "all" preset, which depends on the years present in the data).
  // `null` means "let the Rust backend apply its default window".
  const [yearsOverride, setYearsOverride] = useState<number[] | null>(() =>
    yearsFromPreset(yearPreset, undefined),
  );

  const wb = useWorkbook({ years: yearsOverride });
  const updates = useUpdates({ autoCheck: checkOnLaunch });

  const [view, setView] = useState<View>("dashboard");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Resync the years window whenever the preset changes or a new summary
  // arrives (so "all" can pick up the real list of years in the data).
  const summaryYearsKey = wb.summary?.years.join(",") ?? "";
  useEffect(() => {
    setYearsOverride(yearsFromPreset(yearPreset, wb.summary?.years));
    // summaryYearsKey stands in for wb.summary.years reference stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yearPreset, summaryYearsKey]);

  // Auto-expand the first level-1 group when hierarchy arrives.
  useEffect(() => {
    if (wb.hierarchy.length > 0 && Object.keys(expanded).length === 0) {
      setExpanded({ [wb.hierarchy[0].id]: true });
    }
  }, [wb.hierarchy, expanded]);

  // Tauri's native drag-drop gives us a real file path (browser drops don't).
  useEffect(() => {
    if (!isTauri()) return;
    let unlisten: (() => void) | undefined;
    (async () => {
      const { getCurrentWebview } = await import("@tauri-apps/api/webview");
      const webview = getCurrentWebview();
      const u = await webview.onDragDropEvent((event) => {
        if (event.payload.type === "drop") {
          const path = event.payload.paths[0];
          if (path) wb.loadFromPath(path);
        }
      });
      unlisten = u;
    })();
    return () => {
      if (unlisten) unlisten();
    };
  }, [wb]);

  const onToggle = (id: string) => setExpanded((m) => ({ ...m, [id]: !m[id] }));

  const lastFile = useMemo(() => prefs.lastFile.get(), [wb.summary?.file]);

  // No workbook → landing screen.
  if (!wb.summary || !wb.sliceData) {
    return (
      <div
        style={{ height: "100vh", background: theme.bg, display: "flex", flexDirection: "column" }}
      >
        <LandingScreen
          theme={theme}
          onPathChosen={(path) => wb.loadFromPath(path)}
          variant={wb.loading ? "processing" : "default"}
          updates={updates}
          lastFile={lastFile}
        />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", background: theme.bg, color: theme.ink }}>
      {view !== "settings" && (
        <Sidebar
          theme={theme}
          density={density}
          hierarchy={wb.hierarchy}
          selected={wb.sliceId}
          onSelect={wb.selectSlice}
          expanded={expanded}
          onToggle={onToggle}
        />
      )}
      {view === "dashboard" && (
        <Dashboard
          theme={theme}
          density={density}
          sliceId={wb.sliceId}
          sliceData={wb.sliceData}
          hierarchy={wb.hierarchy}
          summary={wb.summary}
          updates={updates}
          onOpenSettings={() => setView("settings")}
          onNewFile={() => wb.unload()}
        />
      )}
      {view === "settings" && (
        <SettingsScreen
          theme={theme}
          summary={wb.summary}
          updates={updates}
          onUnload={() => {
            wb.unload();
            setView("dashboard");
          }}
          onClose={() => setView("dashboard")}
        />
      )}
    </div>
  );
}
