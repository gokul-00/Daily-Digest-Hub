import type { DumpType } from "./dumps.shared";

export type SharePayload = {
  title?: string;
  text?: string;
  url?: string;
};

export type ParsedShare = {
  content: string;
  type: DumpType;
};

export const LAST_SHARE_KEY = "later.last-share";
export const SHARE_DEDUPE_MS = 60_000;

function trimOptional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export function parseSharePayload(payload: SharePayload): ParsedShare | null {
  const url = trimOptional(payload.url);
  const text = trimOptional(payload.text);
  const title = trimOptional(payload.title);

  let content = url ?? text ?? title;
  if (!content) return null;

  if (url && text && text !== url && !text.includes(url)) {
    content = `${text}\n${url}`;
  } else if (!url && text && title && title !== text) {
    content = `${title}\n${text}`;
  }

  const isUrl = /^https?:\/\//i.test(content.split("\n").pop()?.trim() ?? content);
  return {
    content,
    type: isUrl ? "read" : "note",
  };
}

export function isDuplicateShare(content: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = sessionStorage.getItem(LAST_SHARE_KEY);
    if (!raw) return false;
    const last = JSON.parse(raw) as { content: string; at: number };
    return last.content === content && Date.now() - last.at < SHARE_DEDUPE_MS;
  } catch {
    return false;
  }
}

export function markShareHandled(content: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(LAST_SHARE_KEY, JSON.stringify({ content, at: Date.now() }));
}
