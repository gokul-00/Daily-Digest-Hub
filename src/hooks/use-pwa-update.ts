import { useCallback, useEffect, useState } from "react";

import { applyPwaUpdate, onPwaNeedRefresh } from "@/lib/pwa-update";

const DISMISS_KEY = "later-pwa-update-dismissed";

function wasDismissedForSession(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function usePwaUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [dismissed, setDismissed] = useState(wasDismissedForSession);

  useEffect(() => onPwaNeedRefresh(() => setNeedRefresh(true)), []);

  const dismiss = useCallback(() => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const update = useCallback(() => {
    applyPwaUpdate();
  }, []);

  return {
    visible: needRefresh && !dismissed,
    update,
    dismiss,
  };
}
