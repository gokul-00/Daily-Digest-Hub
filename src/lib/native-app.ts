import { Capacitor } from "@capacitor/core";

/** True when running inside the Capacitor Android/iOS shell. */
export function isNativeApp() {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}
