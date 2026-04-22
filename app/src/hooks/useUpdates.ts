/** Poll the backend for update status on mount + on manual trigger.
 *
 * Silent-fail by contract (design brief §7). The only way errors surface
 * is a flip to `offline` — there is no throwing path out of this hook.
 */

import { useCallback, useEffect, useState } from "react";
import { checkForUpdates, openReleasePage, type UpdateStatus } from "../api/updates";

export interface UseUpdatesResult {
  status: UpdateStatus | null;
  lastCheckedAt: Date | null;
  checking: boolean;
  /** Re-poll now (user clicked "Check for updates"). */
  recheck: () => void;
  /** Open the release page in the OS default browser. No-op if not Available. */
  openRelease: () => void;
}

export function useUpdates(): UseUpdatesResult {
  const [status, setStatus] = useState<UpdateStatus | null>(null);
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const run = useCallback(async () => {
    setChecking(true);
    try {
      const s = await checkForUpdates();
      setStatus(s);
    } catch {
      // checkForUpdates itself never throws in practice (Rust side collapses
      // errors to Offline), but keep this defensive.
      setStatus({ state: "offline", currentVersion: "0.0.0" });
    } finally {
      setLastCheckedAt(new Date());
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    run();
  }, [run]);

  const openRelease = useCallback(() => {
    if (status?.state === "available") {
      openReleasePage(status.releaseUrl);
    }
  }, [status]);

  return { status, lastCheckedAt, checking, recheck: run, openRelease };
}
