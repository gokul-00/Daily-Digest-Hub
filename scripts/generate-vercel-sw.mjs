import { existsSync } from "node:fs";
import { join } from "node:path";
import { generateSW } from "workbox-build";

const root = process.cwd();
const staticDir = join(root, ".vercel/output/static");
const swDest = join(staticDir, "sw.js");

if (!existsSync(staticDir)) {
  console.error("[generate-vercel-sw] Missing static output:", staticDir);
  process.exit(1);
}

const { count, filePaths } = await generateSW({
  globDirectory: staticDir,
  globPatterns: ["**/*.{js,css,ico,png,svg,woff2,woff,webmanifest}"],
  swDest,
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  navigateFallback: null,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-stylesheets",
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts-webfonts",
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
  ],
});

console.log(`[generate-vercel-sw] Precached ${count} files → ${filePaths.join(", ")}`);
