import type { ReactNode } from "react";
import type { Theme } from "../theme";
import { Button } from "../components/shell/Button";
import { UpdateFooter } from "../components/shell/UpdateFooter";
import type { UseUpdatesResult } from "../hooks/useUpdates";
import type { ParseSummary } from "../api/tauri";
import { usePref, type YearWindowPreset } from "../lib/prefs";

interface Props {
  theme: Theme;
  onClose?: () => void;
  summary: ParseSummary | null;
  updates: UseUpdatesResult;
  /** Unload the current workbook and clear the last-file record. */
  onUnload: () => void;
}

const YEAR_WINDOW_LABELS: Record<YearWindowPreset, string> = {
  rolling_5: "Last 5 calendar years (rolling)",
  rolling_3: "Last 3 years",
  all: "All available",
};

function formatWhen(d: Date | null): string {
  if (!d) return "never";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function SettingsScreen({ theme, onClose, summary, updates, onUnload }: Props) {
  const [checkOnLaunch, setCheckOnLaunch] = usePref("check-on-launch", true);
  const [yearWindow, setYearWindow] = usePref<"year-window">("year-window", "rolling_5");

  const currentVersion =
    updates.status.state === "checking" ? null : updates.status.currentVersion;

  const updatesLine = (() => {
    switch (updates.status.state) {
      case "checking":
        return "Checking for updates…";
      case "upToDate":
        return "up to date";
      case "available":
        return `v${updates.status.latestVersion} available`;
      case "downloading":
        return "downloading…";
      case "installed":
        return "installed · restarting";
      case "offline":
        return "offline";
    }
  })();
  const updatesColor =
    updates.status.state === "upToDate" || updates.status.state === "installed"
      ? theme.accent
      : updates.status.state === "available"
        ? theme.harm
        : theme.ink3;

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        fontFamily: theme.sansFont,
      }}
    >
      <div
        style={{
          padding: "16px 24px",
          borderBottom: `1px solid ${theme.border}`,
          background: theme.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              color: theme.ink3,
              textTransform: "uppercase",
              fontWeight: 600,
              letterSpacing: "0.04em",
            }}
          >
            Settings
          </div>
          <div
            style={{
              fontFamily: theme.numFont,
              fontSize: 22,
              fontWeight: 500,
              color: theme.ink,
              letterSpacing: "-0.01em",
              marginTop: 2,
            }}
          >
            Preferences
          </div>
        </div>
        <Button theme={theme} onClick={onClose}>
          Close
        </Button>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: theme.bg, padding: 24 }}>
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
          <SettingGroup
            theme={theme}
            title="Updates"
            subtitle="The app checks GitHub for a new release. No auto-update."
          >
            <SettingRow
              theme={theme}
              label="Check on launch"
              control={
                <Toggle
                  theme={theme}
                  on={checkOnLaunch}
                  onToggle={() => setCheckOnLaunch(!checkOnLaunch)}
                />
              }
            />
            <SettingRow
              theme={theme}
              label="Manual check"
              control={
                <Button
                  theme={theme}
                  onClick={updates.recheck}
                >
                  {updates.status.state === "checking" ? "Checking…" : "Check now"}
                </Button>
              }
            />
            <div
              style={{
                fontSize: 12,
                color: theme.ink3,
                padding: "8px 4px 0",
                borderTop: `1px solid ${theme.border}`,
                marginTop: 4,
              }}
            >
              {currentVersion ? (
                <>
                  Current version{" "}
                  <span style={{ color: theme.ink, fontFamily: theme.monoFont }}>
                    v{currentVersion}
                  </span>{" "}
                  · Last checked {formatWhen(updates.lastCheckedAt)} —{" "}
                  <span style={{ color: updatesColor }}>{updatesLine}</span>
                </>
              ) : (
                <>Last checked {formatWhen(updates.lastCheckedAt)} — {updatesLine}</>
              )}
            </div>
          </SettingGroup>

          <SettingGroup
            theme={theme}
            title="Department mapping"
            subtitle="CSV that maps raw department strings to the two-level hierarchy."
          >
            <SettingRow
              theme={theme}
              label="Mapping source"
              value={
                <code style={{ fontFamily: theme.monoFont, fontSize: 12, color: theme.ink2 }}>
                  embedded · 39 rows
                </code>
              }
              control={<Button theme={theme} disabled>Open mapping</Button>}
            />
            <SettingRow
              theme={theme}
              label="Override with a custom mapping"
              value={<span style={{ fontSize: 12, color: theme.ink3 }}>Not yet supported — raise an issue if you need this.</span>}
              control={<Button theme={theme} disabled>Reset</Button>}
            />
          </SettingGroup>

          <SettingGroup theme={theme} title="Data" subtitle="Nothing ever leaves this machine.">
            <SettingRow
              theme={theme}
              label="Current file"
              value={
                summary ? (
                  <code style={{ fontFamily: theme.monoFont, fontSize: 12, color: theme.ink2 }}>
                    {summary.file} · {summary.totalRows.toLocaleString()} rows · parsed {summary.parsedAt}
                  </code>
                ) : (
                  <span style={{ fontSize: 12, color: theme.ink3 }}>No file loaded</span>
                )
              }
            />
            <SettingRow
              theme={theme}
              label="Default year window"
              control={
                <select
                  value={yearWindow}
                  onChange={(e) => setYearWindow(e.target.value as YearWindowPreset)}
                  style={{
                    padding: "6px 10px",
                    fontSize: 13,
                    fontFamily: theme.sansFont,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    background: theme.surface,
                    color: theme.ink,
                  }}
                >
                  {(Object.keys(YEAR_WINDOW_LABELS) as YearWindowPreset[]).map((k) => (
                    <option key={k} value={k}>
                      {YEAR_WINDOW_LABELS[k]}
                    </option>
                  ))}
                </select>
              }
            />
            <SettingRow
              theme={theme}
              label="Clear loaded data"
              value={<span style={{ fontSize: 12, color: theme.ink3 }}>Removes the in-memory parse and forgets the last-file record.</span>}
              control={<Button theme={theme} onClick={onUnload} disabled={!summary}>Unload</Button>}
            />
          </SettingGroup>

          <SettingGroup theme={theme} title="About">
            <div style={{ padding: "6px 4px", fontSize: 13, color: theme.ink2, lineHeight: 1.6 }}>
              This app was forged in a disused laundry cupboard by a consortium of seventeen
              heritage-breed hamsters and one sleep-deprived risk manager who had been
              thwarted, one too many times, by a pivot table with opinions. When the
              spreadsheet refused to ungroup for the fourth consecutive Tuesday, the decision
              was made: ingest the chaos, banish the merged cells, and produce reporting so
              reliable it could be framed and hung in a boardroom next to a very serious
              painting of a ship.
              <br /><br />
              No hamsters were harmed in its production, although two developed strong
              opinions about mixed date formats and now refuse to look at anything older
              than ISO&nbsp;9601. The software is offered to hospitals on the understanding
              that any incident involving a hamster, a laundry cupboard, or a pivot table
              with opinions must be logged in the usual way.
            </div>
            <div style={{ display: "flex", gap: 16, fontSize: 12, color: theme.accent, marginTop: 8 }}>
              <span>Release notes</span>
              <span>Technical appendix</span>
              <span>Licences</span>
            </div>
          </SettingGroup>
        </div>
      </div>
      <UpdateFooter theme={theme} updates={updates} />
    </div>
  );
}

function SettingGroup({
  theme,
  title,
  subtitle,
  children,
}: {
  theme: Theme;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 10,
        padding: 22,
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <div
          style={{
            fontFamily: theme.numFont,
            fontSize: 16,
            fontWeight: 600,
            color: theme.ink,
          }}
        >
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 12, color: theme.ink3, marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
}

function SettingRow({
  theme,
  label,
  value,
  control,
}: {
  theme: Theme;
  label: string;
  value?: ReactNode;
  control?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 4px",
        borderTop: `1px solid ${theme.border}`,
        gap: 12,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <div style={{ fontSize: 13, color: theme.ink }}>{label}</div>
        {value && <div>{value}</div>}
      </div>
      <div>{control}</div>
    </div>
  );
}

function Toggle({ theme, on, onToggle }: { theme: Theme; on: boolean; onToggle?: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 34,
        height: 20,
        borderRadius: 10,
        background: on ? theme.accent : theme.borderStrong,
        position: "relative",
        transition: "background .15s",
        cursor: onToggle ? "pointer" : "default",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 2,
          left: on ? 16 : 2,
          width: 16,
          height: 16,
          borderRadius: 8,
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.2)",
          transition: "left .15s",
        }}
      />
    </div>
  );
}
