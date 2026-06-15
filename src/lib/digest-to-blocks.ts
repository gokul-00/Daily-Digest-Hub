import type { Digest } from "@/lib/digest.shared";
import { readingBlockId, todoBlockId } from "@/lib/digest-interactions";

export type DigestBlock =
  | { type: "page_title"; title: string; meta: string; itemCount: number }
  | { type: "callout"; label: string; text: string }
  | { type: "tags"; label: string; items: string[] }
  | { type: "section"; icon: string; label: string; count: number; sectionKey?: "reading" | "todos" | "ideas" | "notes" }
  | { type: "reading"; blockId: string; index: number; item: Digest["reading"][number] }
  | { type: "todo"; blockId: string; item: Digest["todos"][number] }
  | { type: "idea"; item: Digest["ideas"][number] }
  | { type: "note"; item: Digest["notes"][number] }
  | { type: "divider" };

export function digestToBlocks(
  digest: Digest,
  meta: { title: string; createdAt: string; dumpCount: number },
): DigestBlock[] {
  const blocks: DigestBlock[] = [
    {
      type: "page_title",
      title: meta.title,
      meta: new Date(meta.createdAt).toLocaleString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
      itemCount: meta.dumpCount,
    },
    { type: "callout", label: "The gist", text: digest.overview },
  ];

  if (digest.themes.length > 0) {
    blocks.push({ type: "tags", label: "Themes", items: digest.themes });
  }

  if (digest.reading.length > 0) {
    blocks.push({
      type: "section",
      icon: "¶",
      label: "Reading",
      count: digest.reading.length,
      sectionKey: "reading",
    });
    digest.reading.forEach((item, index) => {
      blocks.push({ type: "reading", blockId: readingBlockId(index), index: index + 1, item });
    });
  }

  if (digest.todos.length > 0) {
    blocks.push({ type: "divider" });
    blocks.push({
      type: "section",
      icon: "✓",
      label: "Todos",
      count: digest.todos.length,
      sectionKey: "todos",
    });
    digest.todos.forEach((item, index) => {
      blocks.push({ type: "todo", blockId: todoBlockId(index), item });
    });
  }

  if (digest.ideas.length > 0) {
    blocks.push({ type: "divider" });
    blocks.push({ type: "section", icon: "✺", label: "Ideas to explore", count: digest.ideas.length });
    digest.ideas.forEach((item) => blocks.push({ type: "idea", item }));
  }

  if (digest.notes.length > 0) {
    blocks.push({ type: "divider" });
    blocks.push({ type: "section", icon: "•", label: "Notes", count: digest.notes.length });
    digest.notes.forEach((item) => blocks.push({ type: "note", item }));
  }

  return blocks;
}
