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
        <Button theme={theme} onClick={onOpenSettings} ghost>
          ⚙
        </Button>
      </div>
    </div>
  );
}
