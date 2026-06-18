import { useState } from "react";

import { truncateLink } from "@/lib/dump-types";
import type { Dump } from "@/lib/dumps.shared";

type DumpRowProps = {
  dump: Dump;
  index: number;
  preview?: boolean;
  onRemove: () => void;
  onToggle: () => void;
  onSave: (content: string) => void;
};

export function DumpRow({
  dump,
  index,
  preview = false,
  onRemove,
  onToggle,
  onSave,
}: DumpRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(dump.content);
  const time = new Date(dump.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isLink = dump.kind === "link";
  const display =
    preview && isLink
      ? truncateLink(dump.content)
      : isLink && dump.content.length > 80
        ? dump.content.slice(0, 77) + "…"
        : dump.content;

  function commit() {
    const v = draft.trim();
    if (!v) return;
    if (v !== dump.content) onSave(v);
    setEditing(false);
  }
  function cancel() {
    setDraft(dump.content);
    setEditing(false);
  }

  return (
    <div className="group grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 border-b border-border/60 pb-3 sm:grid-cols-[1.75rem_1fr_auto] sm:gap-3">
      <button
        onClick={onToggle}
        aria-label={dump.done ? "Mark open" : "Mark done"}
        className={
          "mt-1 grid h-5 w-5 place-items-center rounded-sm border font-mono text-[10px] transition " +
          (dump.done
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-background/40 text-transparent hover:text-marginalia")
        }
      >
        ✓
      </button>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          <span>{index.toString().padStart(2, "0")}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-md border border-border bg-background/60 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <div className="flex gap-2">
              <button
                onClick={commit}
                className="rounded-md bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground hover:bg-accent"
              >
                Save
              </button>
              <button
                onClick={cancel}
                className="rounded-md border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isLink ? (
          <a
            href={dump.content}
            target="_blank"
            rel="noreferrer"
            className={
              "break-all font-mono text-sm hover:text-accent " +
              (dump.done ? "text-ink-soft line-through" : "text-ink") +
              (preview ? " line-clamp-1" : "")
            }
          >
            {display}
          </a>
        ) : (
          <p
            className={
              "font-display text-base leading-snug " +
              (dump.done ? "text-ink-soft line-through" : "text-ink") +
              (preview ? " line-clamp-2" : " whitespace-pre-wrap")
            }
          >
            {display}
          </p>
        )}
      </div>
      {!editing && (
        <div className="col-span-2 flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft sm:col-span-1 sm:flex-col sm:items-end sm:gap-1 sm:opacity-60 sm:transition sm:group-hover:opacity-100">
          <button
            onClick={() => {
              setDraft(dump.content);
              setEditing(true);
            }}
            aria-label="Edit"
            className="touch-target inline-flex items-center hover:text-accent"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove"
            className="touch-target inline-flex items-center hover:text-destructive"
          >
            Discard
          </button>
        </div>
      )}
    </div>
  );
}
