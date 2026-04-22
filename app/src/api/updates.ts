/** Auto-update API backed by `@tauri-apps/plugin-updater`.
 *
 * The plugin fetches `latest.json` from the endpoint configured in
 * `tauri.conf.json`, verifies the signature against the embedded
 * pubkey, and hands back an `Update` object we can download + install.
 *
 * Keep this module thin — it's the boundary between "Tauri plugin"
 * and "our UI state". When `isTauri()` is false we're in Vite-only
 * dev and everything collapses to a neutral `offline` status.
 */

import { isTauri } from "./tauri";

export type UpdateStatus =
  | { state: "checking" }
  | { state: "upToDate"; currentVersion: string }
  | {
      state: "available";
      currentVersion: string;
      latestVersion: string;
      notes?: string;
    }
  | { state: "offline"; currentVersion: string; reason?: string }
  | {
      state: "downloading";
      currentVersion: string;
      latestVersion: string;
      downloaded: number;
      total: number | null;
    }
  | { state: "installed"; currentVersion: string; latestVersion: string };

type TauriUpdate = {
  version: string;
  currentVersion: string;
  body?: string | null;
  download: (
    onEvent?: (e: DownloadEvent) => void,
  ) => Promise<void>;
  downloadAndInstall: (
    onEvent?: (e: DownloadEvent) => void,
  ) => Promise<void>;
  install: () => Promise<void>;
  close: () => Promise<void>;
};

type DownloadEvent =
  | { event: "Started"; data: { contentLength?: number } }
  | { event: "Progress"; data: { chunkLength: number } }
  | { event: "Finished" };

async function loadPlugin() {
  const mod = await import("@tauri-apps/plugin-updater");
  return mod;
}

/** Probe the configured endpoint. Returns the plugin's Update object if a
 *  newer version is available; null if the app is already up to date.
 *  Throws on network / signature errors — callers handle. */
export async function probeForUpdate(): Promise<TauriUpdate | null> {
  if (!isTauri()) return null;
  const { check } = await loadPlugin();
  return (await check()) as unknown as TauriUpdate | null;
}

/** Reset: force a fresh metadata fetch (the plugin caches inside a session). */
export async function closeUpdate(update: TauriUpdate): Promise<void> {
  try {
    await update.close();
  } catch {
    /* idempotent */
  }
}

export async function relaunchApp(): Promise<void> {
  if (!isTauri()) return;
  const { relaunch } = await import("@tauri-apps/plugin-process");
  await relaunch();
}
