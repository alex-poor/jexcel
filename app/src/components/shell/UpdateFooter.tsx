import type { Theme } from "../../theme";
import type { UseUpdatesResult } from "../../hooks/useUpdates";

interface Props {
  theme: Theme;
  updates: UseUpdatesResult;
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function UpdateFooter({ theme, updates }: Props) {
  const { status, lastCheckedAt, recheck, downloadAndInstall } = updates;

  const label = (() => {
    switch (status.state) {
      case "checking":
        return "Checking for updates…";
      case "upToDate":
        return `You're on v${status.currentVersion} · up to date`;
      case "available":
        return `Update available — v${status.latestVersion} (you're on v${status.currentVersion})`;
      case "downloading": {
        const total = status.total;
        const pct = total ? Math.round((status.downloaded / total) * 100) : null;
        return total
          ? `Downloading v${status.latestVersion} · ${formatBytes(status.downloaded)} / ${formatBytes(total)}${pct != null ? ` · ${pct}%` : ""}`
          : `Downloading v${status.latestVersion} · ${formatBytes(status.downloaded)}`;
      }
      case "installed":
        return `Installed v${status.latestVersion} · restarting…`;
      case "offline":
        return `Offline — last checked ${lastCheckedAt ? formatClock(lastCheckedAt) : "never"}`;
    }
  })();

  const dot = (() => {
    switch (status.state) {
      case "checking":
      case "downloading":
        return theme.lag;
      case "upToDate":
      case "installed":
        return theme.accent;
      case "available":
        return theme.harm;
      case "offline":
        return theme.ink3;
    }
  })();

  const textColor =
    status.state === "available" || status.state === "downloading"
      ? theme.accentInk
      : theme.ink3;

  return (
    <div
      style={{
        padding: "8px 20px",
        borderTop: `1px solid ${theme.border}`,
        background: theme.surface,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: 11,
        color: theme.ink3,
        fontFamily: theme.sansFont,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: 3, background: dot }} />
        <span style={{ color: textColor }}>{label}</span>
        {status.state === "available" && (
          <a
            onClick={downloadAndInstall}
            style={{
              color: theme.accent,
              textDecoration: "none",
              fontWeight: 600,
              marginLeft: 4,
              cursor: "pointer",
            }}
          >
            download &amp; install →
          </a>
        )}
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span>Local data only · no telemetry</span>
        <span
          onClick={recheck}
          style={{
            color: theme.ink3,
            cursor: status.state === "checking" ? "default" : "pointer",
            opacity: status.state === "checking" ? 0.5 : 1,
          }}
          title="Re-poll the release manifest"
        >
          {status.state === "checking" ? "Checking…" : "Check for updates"}
        </span>
      </div>
    </div>
  );
}
