import type { Theme } from "../../theme";
import { useUpdates } from "../../hooks/useUpdates";

interface Props {
  theme: Theme;
}

function formatClock(d: Date): string {
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function UpdateFooter({ theme }: Props) {
  const { status, lastCheckedAt, checking, recheck, openRelease } = useUpdates();

  const label = (() => {
    if (checking && !status) return "Checking for updates…";
    if (!status) return "";
    switch (status.state) {
      case "upToDate":
        return `You're on v${status.currentVersion} · up to date`;
      case "available":
        return `Update available — v${status.latestVersion} (you're on v${status.currentVersion})`;
      case "offline":
        return `Offline — last checked ${lastCheckedAt ? formatClock(lastCheckedAt) : "never"}`;
    }
  })();

  const dot = (() => {
    if (!status) return theme.ink3;
    switch (status.state) {
      case "upToDate":
        return theme.accent;
      case "available":
        return theme.harm;
      case "offline":
        return theme.ink3;
    }
  })();

  const textColor = status?.state === "available" ? theme.accentInk : theme.ink3;

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
        {status?.state === "available" && (
          <a
            onClick={openRelease}
            style={{
              color: theme.accent,
              textDecoration: "none",
              fontWeight: 600,
              marginLeft: 4,
              cursor: "pointer",
            }}
          >
            download →
          </a>
        )}
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <span>Local data only · no telemetry</span>
        <span
          onClick={recheck}
          style={{
            color: theme.ink3,
            cursor: "pointer",
            opacity: checking ? 0.5 : 1,
          }}
          title="Re-poll GitHub for a newer release"
        >
          {checking ? "Checking…" : "Check for updates"}
        </span>
      </div>
    </div>
  );
}
