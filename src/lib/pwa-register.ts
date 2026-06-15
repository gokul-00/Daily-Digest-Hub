/** Client-only service worker registration for PWA install + asset caching. */
export function registerPwa() {
  if (typeof window === "undefined") return;

  if (import.meta.env.DEV) {
    // TanStack Start SSR has no index.html — trigger vite-plugin-pwa's dev SW via HMR.
    void import("virtual:pwa-entry-point-loaded")
      .then((mod) => mod.default())
      .catch((error) => {
        console.warn("[PWA] Dev service worker registration failed", error);
      });
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
