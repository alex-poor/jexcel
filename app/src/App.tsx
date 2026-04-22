import { useEffect, useState } from "react";
import { THEMES } from "./theme";
import { Sidebar } from "./components/shell/Sidebar";
import { LandingScreen } from "./screens/Landing";
import { Dashboard } from "./screens/Dashboard";
import { SettingsScreen } from "./screens/Settings";
import { useWorkbook } from "./hooks/useWorkbook";
import { isTauri } from "./api/tauri";

type View = "dashboard" | "settings";

export default function App() {
  const theme = THEMES.warm;
  const density: "comfortable" | "compact" = "comfortable";

  const wb = useWorkbook();
  const [view, setView] = useState<View>("dashboard");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Auto-expand the first level-1 group when hierarchy arrives so the user
  // sees something useful straight away.
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
          onOpenSettings={() => setView("settings")}
          onNewFile={() => wb.loadFromPath(":mock:")}
        />
      )}
      {view === "settings" && (
        <SettingsScreen theme={theme} onClose={() => setView("dashboard")} />
      )}
    </div>
  );
}
