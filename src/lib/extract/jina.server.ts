export type JinaExtractResult = {
  url: string;
  title?: string;
  body: string;
  metadata: Record<string, unknown>;
  provider: "jina";
};

type JinaResponse = {
  data?: {
    title?: string;
    url?: string;
    content?: string;
    description?: string;
  };
  title?: string;
  url?: string;
  content?: string;
  description?: string;
};

export function hasJinaApiKey(): boolean {
  return Boolean(process.env.JINA_API_KEY?.trim());
}

/** Browser-rendered fetch via Jina Reader — for JS-heavy pages and chat share links. */
export async function extractWithJina(
  url: string,
  engine: "browser" | "direct" = "browser",
): Promise<JinaExtractResult> {
  const apiKey = process.env.JINA_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("JINA_API_KEY is not configured");
  }

  const res = await fetch("https://r.jina.ai/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Engine": engine,
      "X-Return-Format": "markdown",
    },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(90_000),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Jina Reader HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
  }

  const json = (await res.json()) as JinaResponse;
  const data = json.data ?? json;
  const body = (data.content ?? "").trim();

  if (!body) {
    throw new Error("Jina Reader returned empty content");
  }

  return {
    url: data.url ?? url,
    title: data.title,
    body,
    metadata: {
      engine,
      description: data.description,
    },
    provider: "jina",
  };
}
