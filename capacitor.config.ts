import type { CapacitorConfig } from "@capacitor/cli";

const PROD_URL = "https://daily-digest-hub-three.vercel.app";

const config: CapacitorConfig = {
  appId: "app.later.digest",
  appName: "Later.",
  webDir: "www",
  server: {
    url: PROD_URL,
    cleartext: false,
    allowNavigation: ["daily-digest-hub-three.vercel.app", "*.supabase.co"],
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f2ebe0",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: "#f2ebe0",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f2ebe0",
    },
  },
};

export default config;
