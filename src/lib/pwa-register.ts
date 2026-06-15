/** Client-only service worker registration for PWA install + asset caching. */
export function registerPwa() {
  if (typeof window === "undefined") return;

  if (import.meta.env.DEV) {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker
        .register("/dev-sw.js?dev-sw", { scope: "/", type: "classic" })
        .then((registration) => {
          if (registration) console.info("[PWA] Service worker registered");
        })
        .catch((error) => {
          console.warn("[PWA] Service worker registration failed", error);
        });
    }
    return;
  }

  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(registration) {
        if (registration) {
          console.info("[PWA] Service worker registered");
        }
      },
      onRegisterError(error) {
        console.warn("[PWA] Service worker registration failed", error);
      },
    });
  });
}
