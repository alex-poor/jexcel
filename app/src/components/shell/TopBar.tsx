import type { Theme } from "../../theme";
import { Pill } from "./Pill";
import { Button } from "./Button";

type Density = "comfortable" | "compact";

interface Props {
  theme: Theme;
  density: Density;
  breadcrumb: string[];
  rowCount: number;
  filename: string;
  parsedAt?: string;
  yearWindow: [number, number];
  onOpenSettings?: () => void;
  onNewFile?: () => void;
}

export function TopBar({
  theme,
  density,
  breadcrumb,
  rowCount,
  filename,
  yearWindow,
  onOpenSettings,
  onNewFile,
}: Props) {
  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.border}`,
        background: theme.surface,
        padding: density === "compact" ? "12px 20px" : "16px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            color: theme.ink3,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontWeight: 600,
            marginBottom: 3,
          }}
        >
          Viewing
        </div>
        <div
          style={{
            fontFamily: theme.numFont,
            fontSize: density === "compact" ? 19 : 22,
            fontWeight: 500,
            color: theme.ink,
            letterSpacing: "-0.01em",
          }}
        >
          {breadcrumb.map((b, i) => (
            <span key={i}>
              <span style={{ color: i === breadcrumb.length - 1 ? theme.ink : theme.ink3 }}>{b}</span>
              {i < breadcrumb.length - 1 && (
                <span style={{ color: theme.ink3, margin: "0 8px" }}>›</span>
              )}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Pill theme={theme} label="Year window" value={`${yearWindow[0]} – ${yearWindow[1]}`} />
        <Pill theme={theme} label="Rows" value={rowCount.toLocaleString()} />
        <Pill theme={theme} label="Source" value={filename} mono />
        <div style={{ width: 1, height: 24, background: theme.border, margin: "0 4px" }} />
        <Button theme={theme} onClick={onNewFile}>
          Load new file
        </Button>
        <button
          onClick={onOpenSettings}
          title="Settings"
          aria-label="Settings"
          style={{
            width: 34,
            height: 34,
            padding: 0,
            background: "transparent",
            border: `1px solid transparent`,
            borderRadius: 6,
            cursor: "pointer",
            color: theme.ink2,
            display: "grid",
            placeItems: "center",
            transition: "background .12s, color .12s, border-color .12s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.surfaceAlt;
            e.currentTarget.style.color = theme.ink;
            e.currentTarget.style.borderColor = theme.border;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = theme.ink2;
            e.currentTarget.style.borderColor = "transparent";
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
            <path
              d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
