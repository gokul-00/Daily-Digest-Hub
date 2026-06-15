export type SourceType = "youtube" | "linkedin" | "instagram" | "web" | "unknown";

/** Minimum extracted chars before we consider content usable without Jina escalation. */
export const THIN_CONTENT_THRESHOLD = 400;

const JS_HEAVY_PATTERNS: RegExp[] = [
  /^gemini\.google\.com$/i,
  /^chatgpt\.com$/i,
  /^chat\.openai\.com$/i,
  /^claude\.ai$/i,
  /^perplexity\.ai$/i,
  /^copilot\.microsoft\.com$/i,
  /^notion\.(so|site)$/i,
  /^docs\.google\.com$/i,
];

export function isJsHeavyUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    const path = new URL(url).pathname.toLowerCase();
    if (!JS_HEAVY_PATTERNS.some((re) => re.test(host))) return false;
    // Share / app routes — skip bare homepages
    if (host === "gemini.google.com" && path.startsWith("/share")) return true;
    if (host === "chatgpt.com" && path.includes("/share")) return true;
    if (host === "chat.openai.com" && path.includes("/share")) return true;
    if (host === "claude.ai" && (path.includes("/share") || path.includes("/chat"))) return true;
    if (host === "perplexity.ai" && path.includes("/search")) return true;
    if (host === "notion.so" || host === "notion.site") return true;
    if (host === "docs.google.com") return path.includes("/document") || path.includes("/spreadsheets");
    return path.length > 1;
  } catch {
    return false;
  }
}

export function isThinContent(body: string): boolean {
  return body.trim().length < THIN_CONTENT_THRESHOLD;
}

export function classifyUrl(url: string): SourceType {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "").toLowerCase();

    if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
    if (host.endsWith("linkedin.com")) return "linkedin";
    if (host.endsWith("instagram.com")) return "instagram";
    if (host.endsWith("twitter.com") || host === "x.com") return "web";
    return "web";
  } catch {
    return "unknown";
  }
}

export function extractUrls(text: string): string[] {
  const re = /https?:\/\/[^\s)]+/gi;
  return Array.from(new Set(text.match(re) ?? []));
}

export function pickPrimaryUrl(text: string): string | null {
  const urls = extractUrls(text);
  return urls[0] ?? null;
}
