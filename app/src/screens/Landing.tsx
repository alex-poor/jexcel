import { useState } from "react";
import type { Theme } from "../theme";
import { UpdateFooter } from "../components/shell/UpdateFooter";
import { isTauri } from "../api/tauri";
import type { UseUpdatesResult } from "../hooks/useUpdates";
import type { LastFile } from "../lib/prefs";

interface Props {
  theme: Theme;
  /** Called with an absolute path when the user picks or drops a file. */
  onPathChosen?: (path: string) => void;
  variant?: "default" | "processing";
  updates: UseUpdatesResult;
  lastFile?: LastFile | null;
}

export function LandingScreen({
  theme,
  onPathChosen,
  variant = "default",
  updates,
  lastFile,
}: Props) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    // Browser drop gives us a File object (no path). The real path comes
    // via Tauri's drag-drop webview event, handled higher up in App.tsx.
    // This web-level handler is a no-op so the browser doesn't navigate.
  };

  async function pickFile() {
    if (!isTauri()) {
      // Browser-only dev: trigger the mock load path
      onPathChosen?.(":mock:");
      return;
    }
    const { open } = await import("@tauri-apps/plugin-dialog");
    const selected = await open({
      multiple: false,
      filters: [{ name: "Excel", extensions: ["xlsx", "xlsm", "xls"] }],
    });
    if (typeof selected === "string" && selected) {
      onPathChosen?.(selected);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        position: "relative",
        background: theme.bg,
        display: "flex",
        flexDirection: "column",
        fontFamily: theme.sansFont,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <div
        style={{
          padding: "14px 24px",
          borderBottom: `1px solid ${theme.border}`,
          background: theme.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: theme.numFont,
            fontSize: 15,
            fontWeight: 600,
            color: theme.ink,
            letterSpacing: "-0.005em",
          }}
        >
          Incident Reporting
        </div>
        <div style={{ fontSize: 12, color: theme.ink3 }}>No file loaded</div>
      </div>

      <div
        style={{
          flex: 1,
          display: "grid",
          placeItems: "center",
          padding: 32,
          background: dragging ? theme.accentSoft : "transparent",
          transition: "background .15s",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 20,
            border: `2px dashed ${dragging ? theme.accent : theme.border}`,
            borderRadius: 12,
            pointerEvents: "none",
          }}
        />

        <div style={{ textAlign: "center", maxWidth: 560, padding: 24 }}>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 28 }}>
            <svg width="88" height="96" viewBox="0 0 88 96" fill="none">
              <rect
                x="16"
                y="12"
                width="56"
                height="72"
                rx="6"
                fill={theme.surface}
                stroke={theme.borderStrong}
                strokeWidth="1.5"
              />
              <line x1="26" y1="28" x2="62" y2="28" stroke={theme.border} strokeWidth="1.5" />
              <line x1="26" y1="38" x2="58" y2="38" stroke={theme.border} strokeWidth="1.5" />
              <line x1="26" y1="48" x2="62" y2="48" stroke={theme.border} strokeWidth="1.5" />
              <line x1="26" y1="58" x2="48" y2="58" stroke={theme.border} strokeWidth="1.5" />
              <circle cx="44" cy="72" r="14" fill={theme.accent} />
              <path
                d="M44 66 L44 78 M38 72 L44 66 L50 72"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>

          <div
            style={{
              fontFamily: theme.numFont,
              fontSize: 32,
              fontWeight: 500,
              color: theme.ink,
              letterSpacing: "-0.015em",
              lineHeight: 1.15,
            }}
          >
            Drop an incident export anywhere to begin
          </div>
          <div style={{ fontSize: 15, color: theme.ink2, marginTop: 14, lineHeight: 1.5 }}>
            This app reads your Notify{" "}
            <code
              style={{
                fontFamily: theme.monoFont,
                background: theme.surfaceAlt,
                padding: "1px 6px",
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              .xlsx
            </code>{" "}
            export, maps departments to your hierarchy, and shows five-year trends. Nothing leaves this
            laptop.
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 28 }}>
            <button
              onClick={pickFile}
              style={{
                padding: "10px 18px",
                background: theme.accent,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: theme.sansFont,
              }}
            >
              Choose a file…
            </button>
            {lastFile && (
              <button
                onClick={() => onPathChosen?.(lastFile.path)}
                title={lastFile.path}
                style={{
                  padding: "10px 18px",
                  background: theme.surface,
                  color: theme.ink2,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 6,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: theme.sansFont,
                }}
              >
                Use last file · {lastFile.file}
              </button>
            )}
          </div>

          <div
            style={{
              marginTop: 42,
              padding: 16,
              background: theme.surfaceAlt,
              border: `1px solid ${theme.border}`,
              borderRadius: 8,
              textAlign: "left",
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: theme.ink3,
                textTransform: "uppercase",
                fontWeight: 600,
                letterSpacing: "0.04em",
                marginBottom: 8,
              }}
            >
              Expected columns
            </div>
            <div
              style={{
                fontFamily: theme.monoFont,
                fontSize: 12,
                color: theme.ink2,
                lineHeight: 1.6,
              }}
            >
              Incident ID · Department · Occurred · Reported · Closed · Type · Sub-category · Harm ·
              Near-miss
            </div>
            <div style={{ fontSize: 12, color: theme.ink3, marginTop: 8 }}>
              Other columns are preserved but unused.{" "}
              <a style={{ color: theme.accent, cursor: "pointer" }}>Learn more</a>
            </div>
          </div>
        </div>

        {variant === "processing" && (
          <div
            style={{
              position: "absolute",
              inset: 20,
              background: `${theme.bg}f0`,
              borderRadius: 12,
              display: "grid",
              placeItems: "center",
            }}
          >
            <div style={{ textAlign: "center", maxWidth: 480 }}>
              <div
                style={{
                  fontFamily: theme.numFont,
                  fontSize: 20,
                  fontWeight: 500,
                  color: theme.ink,
                  marginBottom: 18,
                }}
              >
                Parsing Notify-11-76-226.xlsx…
              </div>
              <div
                style={{
                  width: 400,
                  height: 6,
                  background: theme.surfaceAlt,
                  borderRadius: 3,
                  overflow: "hidden",
                  margin: "0 auto",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    height: "100%",
                    width: "60%",
                    background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                    animation: "shimmer 1.4s linear infinite",
                  }}
                />
              </div>
              <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
              <div
                style={{
                  fontSize: 12,
                  color: theme.ink3,
                  marginTop: 16,
                  fontFamily: theme.monoFont,
                }}
              >
                Mapping departments · 514 / 4 127 rows
              </div>
            </div>
          </div>
        )}
      </div>

      <UpdateFooter theme={theme} updates={updates} />
    </div>
  );
}
