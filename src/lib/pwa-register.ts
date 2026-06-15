/** Client-only service worker registration for PWA install + asset caching. */
export function registerPwa() {
  if (typeof window === "undefined") return;

  void import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({
      immediate: true,
      onRegistered(registration) {
        if (import.meta.env.DEV && registration) {
          console.info("[PWA] Service worker registered");
        }
      },
      onRegisterError(error) {
        console.warn("[PWA] Service worker registration failed", error);
      },
    });
  });
}
