import { extract } from "@extractus/article-extractor";

import type { SourceType } from "./classify";

export type WebExtractResult = {
  url: string;
  title?: string;
  body: string;
  metadata: Record<string, unknown>;
  provider: "article-extractor";
};

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractWebArticle(url: string): Promise<WebExtractResult> {
  const article = await extract(url);
  if (!article) {
    throw new Error("Could not extract article content");
  }

  const body = article.content ? htmlToText(article.content) : (article.description ?? "").trim();

  return {
    url: article.url ?? url,
    title: article.title,
    body: body || article.description || "",
    metadata: {
      sourceType: "web" satisfies SourceType,
      author: article.author,
      published: article.published,
      description: article.description,
      image: article.image,
    },
    provider: "article-extractor",
  };
}
