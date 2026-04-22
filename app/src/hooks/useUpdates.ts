/** Wraps `probeForUpdate` + `downloadAndInstall` in a UI-shaped state
 *  machine for the footer. Silent-fail on network errors (design brief §7).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  probeForUpdate,
  relaunchApp,
  type UpdateStatus,
} from "../api/updates";
import { isTauri } from "../api/tauri";

export interface UseUpdatesResult {
  status: UpdateStatus;
  lastCheckedAt: Date | null;
  recheck: () => void;
  /** Download + install the currently-known update, then relaunch. */
  downloadAndInstall: () => Promise<void>;
}

export interface UseUpdatesOptions {
  /** When false, skip the automatic check on mount. Manual `recheck()`
   *  still works. Default: true. */
  autoCheck?: boolean;
}

// Browser-only dev fallback: never actually "up to date" because we have no
// way to probe; showing "offline" keeps the footer neutral and honest.
const DEV_OFFLINE: UpdateStatus = { state: "offline", currentVersion: "0.1.0" };

export function useUpdates(options: UseUpdatesOptions = {}): UseUpdatesResult {
  const autoCheck = options.autoCheck ?? true;
  const [status, setStatus] = useState<UpdateStatus>(
    isTauri() && autoCheck ? { state: "checking" } : DEV_OFFLINE,
  );
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  // Hold the plugin's Update object between probe and install so the
  // download button doesn't have to re-probe.
  const pendingRef = useRef<Awaited<ReturnType<typeof probeForUpdate>>>(null);

  const recheck = useCallback(async () => {
    if (!isTauri()) {
      setStatus(DEV_OFFLINE);
      setLastCheckedAt(new Date());
      return;
    }
    setStatus({ state: "checking" });
    try {
      const update = await probeForUpdate();
      if (update == null) {
        // Plugin returns null when the installed version matches the
        // manifest — i.e. genuinely up to date.
        setStatus({ state: "upToDate", currentVersion: appVersion() });
        pendingRef.current = null;
      } else {
        pendingRef.current = update;
        setStatus({
          state: "available",
          currentVersion: update.currentVersion,
          latestVersion: update.version,
          notes: update.body ?? undefined,
        });
      }
    } catch (e) {
      // Network error / signature mismatch / missing manifest — all collapse
      // to Offline so the UI never shows a scary modal.
      setStatus({
        state: "offline",
        currentVersion: appVersion(),
        reason: String(e),
      });
      pendingRef.current = null;
    } finally {
      setLastCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    if (autoCheck) recheck();
  }, [autoCheck, recheck]);

  const downloadAndInstall = useCallback(async () => {
    const update = pendingRef.current;
    if (!update) return;
    const currentVersion = update.currentVersion;
    const latestVersion = update.version;
    try {
      let total: number | null = null;
      let downloaded = 0;
      setStatus({
        state: "downloading",
        currentVersion,
        latestVersion,
        downloaded: 0,
        total: null,
      });
      await update.downloadAndInstall((e) => {
        if (e.event === "Started") {
          total = e.data.contentLength ?? null;
        } else if (e.event === "Progress") {
          downloaded += e.data.chunkLength;
          setStatus({
            state: "downloading",
            currentVersion,
            latestVersion,
            downloaded,
            total,
          });
        }
      });
      setStatus({ state: "installed", currentVersion, latestVersion });
      // Give the user a moment to see the confirmation before restart.
      setTimeout(() => void relaunchApp(), 800);
    } catch (e) {
      setStatus({
        state: "offline",
        currentVersion,
        reason: `install failed: ${e}`,
      });
    }
  }, []);

  return { status, lastCheckedAt, recheck, downloadAndInstall };
}

/** Best-effort read of the compiled app version for display while offline.
 *  The authoritative source is `update.currentVersion` — this is only for
 *  the empty-state before we've successfully probed. */
function appVersion(): string {
  // Vite injects nothing reliable here; the plugin reports a real value
  // whenever it's called, and that takes over once we're in Tauri mode.
  return "0.1.0";
}
