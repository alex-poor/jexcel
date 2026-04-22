/** Typed localStorage prefs.
 *
 * Browser localStorage persists across launches of a Tauri webview (it's
 * backed by the OS webview's profile dir), so we don't need a plugin for
 * small scalar values. If we ever need something more robust — encryption,
 * multi-user, atomic migrations — swap this file for `tauri-plugin-store`.
 */

import { useCallback, useEffect, useState } from "react";

export type YearWindowPreset = "rolling_5" | "rolling_3" | "all";

export interface LastFile {
  path: string;
  file: string;
  parsedAt: string;
}

interface Schema {
  "last-file": LastFile;
  "year-window": YearWindowPreset;
  "check-on-launch": boolean;
}

const PREFIX = "jexcel:";

function read<K extends keyof Schema>(key: K): Schema[K] | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return null;
    return JSON.parse(raw) as Schema[K];
  } catch {
    return null;
  }
}

function write<K extends keyof Schema>(key: K, value: Schema[K] | null): void {
  try {
    if (value == null) {
      localStorage.removeItem(PREFIX + key);
    } else {
      localStorage.setItem(PREFIX + key, JSON.stringify(value));
    }
  } catch {
    /* quota or privacy-mode — fine to ignore */
  }
}

/** React hook for a single pref. Synchronous read on first render + setter
 *  that also emits a storage event so other tabs/windows stay in sync. */
export function usePref<K extends keyof Schema>(
  key: K,
  fallback: Schema[K],
): [Schema[K], (v: Schema[K] | null) => void] {
  const [value, setValue] = useState<Schema[K]>(() => {
    const v = read(key);
    return v == null ? fallback : v;
  });

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== PREFIX + key) return;
      const v = read(key);
      setValue(v == null ? fallback : v);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, fallback]);

  const set = useCallback(
    (v: Schema[K] | null) => {
      write(key, v);
      setValue(v == null ? fallback : v);
    },
    [key, fallback],
  );

  return [value, set];
}

/** Non-hook variants for cases where React state isn't helpful
 *  (e.g. inside an async callback that needs to look up the current value). */
export const prefs = {
  lastFile: {
    get: () => read("last-file"),
    set: (v: LastFile | null) => write("last-file", v),
  },
  yearWindow: {
    get: (): YearWindowPreset => read("year-window") ?? "all",
    set: (v: YearWindowPreset) => write("year-window", v),
  },
  checkOnLaunch: {
    get: (): boolean => read("check-on-launch") ?? true,
    set: (v: boolean) => write("check-on-launch", v),
  },
};
