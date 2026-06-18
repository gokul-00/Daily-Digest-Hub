const PWA_NEED_REFRESH = "later-pwa-need-refresh";

let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | undefined;

export function onPwaNeedRefresh(listener: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(PWA_NEED_REFRESH, listener);
  return () => window.removeEventListener(PWA_NEED_REFRESH, listener);
}

export function applyPwaUpdate() {
  void applyUpdate?.(true);
}

export function setPwaUpdateHandler(handler: (reloadPage?: boolean) => Promise<void>) {
  applyUpdate = handler;
}

export function notifyPwaNeedRefresh() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PWA_NEED_REFRESH));
}
