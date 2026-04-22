/** Update-check API — mirrors `src-tauri/src/updates.rs`. */

import { invoke } from "@tauri-apps/api/core";
import { isTauri } from "./tauri";

export type UpdateStatus =
  | { state: "upToDate"; currentVersion: string }
  | {
      state: "available";
      currentVersion: string;
      latestVersion: string;
      releaseUrl: string;
    }
  | { state: "offline"; currentVersion: string };

export function checkForUpdates(): Promise<UpdateStatus> {
  if (!isTauri()) {
    // Browser-only dev: pretend offline so the widget renders something
    // neutral without needing a network round-trip.
    return Promise.resolve({ state: "offline", currentVersion: "0.1.0" });
  }
  return invoke<UpdateStatus>("check_for_updates");
}

export async function openReleasePage(url: string): Promise<void> {
  if (!isTauri()) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const { openUrl } = await import("@tauri-apps/plugin-opener");
  await openUrl(url);
}
