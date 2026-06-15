import { isJsHeavyUrl, isThinContent } from "./classify";
import { extractWithJina, hasJinaApiKey } from "./jina.server";
import { extractSocialMeta } from "./social-meta";
import { extractWebArticle } from "./web";

export type RawExtractResult = {
  url: string;
  title?: string;
  body: string;
  metadata: Record<string, unknown>;
  provider: string;
};

async function tryJinaEscalation(
  url: string,
  prior: RawExtractResult | null,
  reason: string,
): Promise<RawExtractResult | null> {
  if (!hasJinaApiKey()) return null;

  try {
    const jina = await extractWithJina(url, "browser");
    return {
      ...jina,
      metadata: {
        ...jina.metadata,
        escalatedFrom: prior?.provider ?? "none",
        escalationReason: reason,
      },
    };
  } catch {
    return null;
  }
}

export async function extractWebWithEscalation(url: string): Promise<RawExtractResult> {
  let primary: RawExtractResult | null = null;

  if (!isJsHeavyUrl(url)) {
    try {
      primary = await extractWebArticle(url);
      if (!isThinContent(primary.body)) return primary;
    } catch {
      // fall through to Jina
    }
  }

  const escalated = await tryJinaEscalation(
    url,
    primary,
    primary ? "thin_content" : isJsHeavyUrl(url) ? "js_heavy_url" : "fetch_failed",
  );
  if (escalated) return escalated;

  if (primary) return primary;
  throw new Error("Could not extract article content");
}

export async function extractSocialWithEscalation(
  url: string,
  sourceType: "linkedin" | "instagram",
): Promise<RawExtractResult> {
  let primary: RawExtractResult | null = null;

  try {
    primary = await extractSocialMeta(url, sourceType);
    if (!isThinContent(primary.body)) return primary;
  } catch {
    // fall through
  }

  const escalated = await tryJinaEscalation(url, primary, "thin_social_meta");
  if (escalated) return escalated;

  if (primary) return primary;
  throw new Error(`Could not extract ${sourceType} content`);
}
