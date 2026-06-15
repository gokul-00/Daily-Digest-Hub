import type { SourceType } from "./classify";

export type ExtractedDocument = {
  url: string;
  sourceType: SourceType;
  title?: string;
  body: string;
  metadata: Record<string, unknown>;
  provider: string;
  status: "ok" | "error" | "partial";
  error?: string;
};

const MAX_BODY_CHARS = 8000;

export function truncateBody(body: string, max = MAX_BODY_CHARS): string {
  const trimmed = body.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function mergeUserText(body: string, userText?: string): string {
  const parts = [body.trim()];
  const note = userText?.trim();
  if (note && !body.includes(note)) {
    parts.push(`User note: ${note}`);
  }
  return parts.filter(Boolean).join("\n\n");
}

export function normalizeExtracted(
  input: {
    url: string;
    sourceType: SourceType;
    title?: string;
    body: string;
    metadata?: Record<string, unknown>;
    provider: string;
    error?: string;
  },
  userText?: string,
): ExtractedDocument {
  const merged = mergeUserText(input.body, userText);
  const body = truncateBody(merged);
  const status: ExtractedDocument["status"] = input.error
    ? "error"
    : body.length > 0
      ? "ok"
      : "partial";

  return {
    url: input.url,
    sourceType: input.sourceType,
    title: input.title,
    body,
    metadata: input.metadata ?? {},
    provider: input.provider,
    status,
    error: input.error,
  };
}

export function formatExtractedForPrompt(doc: ExtractedDocument): string {
  const lines = [`[Extracted ${doc.url}]`, `Source: ${doc.sourceType} via ${doc.provider}`];
  if (doc.title) lines.push(`Title: ${doc.title}`);
  if (doc.error) lines.push(`Error: ${doc.error}`);
  if (doc.body) lines.push(doc.body);
  return lines.join("\n");
}
