import type { DumpType } from "./dumps.shared";

export const TYPE_META: Record<
  DumpType,
  { label: string; glyph: string; hint: string; verb: string }
> = {
  read: { label: "Read", glyph: "¶", hint: "link or article to read later", verb: "Save to read" },
  todo: { label: "Todo", glyph: "✓", hint: "something to do later", verb: "Add todo" },
  idea: { label: "Idea", glyph: "✺", hint: "adhoc thought to brainstorm", verb: "Capture idea" },
  note: { label: "Note", glyph: "•", hint: "something to remember", verb: "Jot note" },
};

export const DUMP_TYPES: DumpType[] = ["read", "todo", "idea", "note"];

export function truncateLink(content: string, max = 60): string {
  if (content.length <= max) return content;
  return content.slice(0, max - 1) + "…";
}
