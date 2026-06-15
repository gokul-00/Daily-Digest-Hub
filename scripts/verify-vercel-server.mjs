import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const serverDir = join(root, ".vercel/output/functions/__server.func");
const indexPath = join(serverDir, "index.mjs");
const tslibPath = join(serverDir, "node_modules/tslib/package.json");
const libsDir = join(serverDir, "_libs");

if (!existsSync(indexPath)) {
  console.error("[verify-vercel-server] Missing", indexPath);
  process.exit(1);
}

const index = readFileSync(indexPath, "utf8");

if (existsSync(libsDir)) {
  console.error("[verify-vercel-server] _libs/ must not exist — use inlineDynamicImports: true");
  process.exit(1);
}

if (index.includes('import_tslib.default')) {
  console.error(
    "[verify-vercel-server] Inlined tslib interop detected — remove noExternals for tslib",
  );
  process.exit(1);
}

const hasExternalTslibImport =
  /import\s*\{[^}]*\}\s*from\s*["']tslib["']/.test(index) ||
  /import\s*\*\s*as\s+\w+\s*from\s*["']tslib/.test(index);

if (hasExternalTslibImport && !existsSync(tslibPath)) {
  console.error("[verify-vercel-server] index.mjs imports tslib but it was not traced into the function");
  process.exit(1);
}

console.log("[verify-vercel-server] OK — single bundle, tslib", hasExternalTslibImport ? "traced" : "inlined/none");
