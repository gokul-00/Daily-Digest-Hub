import metascraper from "metascraper";
import metascraperAuthor from "metascraper-author";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperTitle from "metascraper-title";

import type { SourceType } from "./classify";

const scraper = metascraper([
  metascraperTitle(),
  metascraperDescription(),
  metascraperAuthor(),
  metascraperDate(),
]);

export type SocialMetaResult = {
  url: string;
  title?: string;
  body: string;
  metadata: Record<string, unknown>;
  provider: "metascraper";
};

export async function extractSocialMeta(
  url: string,
  sourceType: Extract<SourceType, "linkedin" | "instagram">,
): Promise<SocialMetaResult> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; LaterBot/1.0; +https://later.app)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${url}`);
  }

  const html = await res.text();
  const metadata = await scraper({ html, url });

  const parts = [metadata.title, metadata.description, metadata.author].filter(Boolean).map(String);

  return {
    url,
    title: metadata.title ?? undefined,
    body: parts.join("\n\n"),
    metadata: {
      sourceType,
      author: metadata.author,
      date: metadata.date,
      description: metadata.description,
    },
    provider: "metascraper",
  };
}
