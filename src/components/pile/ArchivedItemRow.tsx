import { TYPE_META, truncateLink } from "@/lib/dump-types";
import type { ArchivedDump } from "@/lib/pile-archive.shared";

type ArchivedItemRowProps = {
  item: ArchivedDump;
  preview?: boolean;
  className?: string;
};

export function ArchivedItemRow({ item, preview = false, className = "" }: ArchivedItemRowProps) {
  const isLink = item.kind === "link";
  const content = preview && isLink ? truncateLink(item.content) : item.content;

  return (
    <div
      className={
        "font-mono text-xs leading-relaxed " +
        (item.done ? "text-ink-soft line-through" : "text-ink-soft") +
        (className ? ` ${className}` : "")
    }
    >
      <span className="mr-2 text-accent">{TYPE_META[item.type].glyph}</span>
      {isLink ? (
        <a
          href={item.content}
          target="_blank"
          rel="noreferrer"
          className={
            "break-all hover:text-accent " + (preview ? "line-clamp-1" : "")
          }
        >
          {content}
        </a>
      ) : (
        <span className={preview ? "line-clamp-2" : "whitespace-pre-wrap"}>{content}</span>
      )}
    </div>
  );
}
