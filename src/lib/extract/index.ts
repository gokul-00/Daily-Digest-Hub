import { createHash } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin.server";

import { classifyUrl } from "./classify";
import { extractSocialWithEscalation, extractWebWithEscalation } from "./escalate.server";
import { type ExtractedDocument, normalizeExtracted } from "./normalize";
import { extractYoutube } from "./youtube";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashUrl(url: string): string {
  return createHash("sha256").update(url).digest("hex");
}

async function readCache(url: string): Promise<ExtractedDocument | null> {
  try {
    const admin = createSupabaseAdminClient();
    const urlHash = hashUrl(url);
    const { data } = await admin
      .from("source_extractions")
      .select("*")
      .eq("url_hash", urlHash)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!data) return null;

    return {
      url: data.url,
      sourceType: data.source_type,
      title: data.title ?? undefined,
      body: data.body ?? "",
      metadata: (data.metadata as Record<string, unknown>) ?? {},
      provider: data.provider,
      status: data.status,
    };
  } catch {
    return null;
  }
}

async function writeCache(doc: ExtractedDocument): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
    await admin.from("source_extractions").upsert({
      url_hash: hashUrl(doc.url),
      url: doc.url,
      source_type: doc.sourceType,
      status: doc.status,
      provider: doc.provider,
      title: doc.title ?? null,
      body: doc.body,
      metadata: doc.metadata,
      expires_at: expiresAt,
    });
  } catch {
    // Cache is optional — ignore write failures.
  }
}

async function extractByType(url: string, sourceType: ReturnType<typeof classifyUrl>) {
  switch (sourceType) {
    case "youtube":
      return extractYoutube(url);
    case "linkedin":
      return extractSocialWithEscalation(url, "linkedin");
    case "instagram":
      return extractSocialWithEscalation(url, "instagram");
    case "web":
    default:
      return extractWebWithEscalation(url);
  }
}

export async function getOrExtract(url: string, userText?: string): Promise<ExtractedDocument> {
  const cached = await readCache(url);
  if (cached) {
    return normalizeExtracted(cached, userText);
  }

  const sourceType = classifyUrl(url);

  try {
    const raw = await extractByType(url, sourceType);
    const doc = normalizeExtracted(
      {
        url: raw.url,
        sourceType,
        title: raw.title,
        body: raw.body,
        metadata: raw.metadata,
        provider: raw.provider,
      },
      userText,
    );
    if (doc.status !== "error") {
      await writeCache(doc);
    }
    return doc;
  } catch (e) {
    return normalizeExtracted(
      {
        url,
        sourceType,
        title: undefined,
        body: "",
        metadata: {},
        provider: "none",
        error: (e as Error).message,
      },
      userText,
    );
  }
}

export type { ExtractedDocument } from "./normalize";
export { classifyUrl, extractUrls, pickPrimaryUrl } from "./classify";
export { formatExtractedForPrompt } from "./normalize";
