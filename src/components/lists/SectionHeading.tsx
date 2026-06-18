import { useState, type ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  count?: number;
  className?: string;
};

export function SectionHeading({ title, count, className = "" }: SectionHeadingProps) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between">
        <h3 className="font-display text-2xl tracking-tight text-ink">{title}</h3>
        {count !== undefined && (
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
            {count.toString().padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-3 h-px w-full rule-line" />
    </div>
  );
}

type TruncatedListProps<T> = {
  items: T[];
  previewCount: number;
  renderItem: (item: T, index: number, expanded: boolean) => ReactNode;
  getKey: (item: T) => string;
  listClassName?: string;
  expandLabel?: (total: number) => string;
};

export function TruncatedList<T>({
  items,
  previewCount,
  renderItem,
  getKey,
  listClassName = "space-y-3",
  expandLabel = (total) => `View all ${total}`,
}: TruncatedListProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, previewCount);
  const hasMore = items.length > previewCount;

  return (
    <>
      <ul className={listClassName}>
        {visible.map((item, i) => (
          <li key={getKey(item)}>{renderItem(item, i, expanded)}</li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
        >
          {expanded ? "Show less" : expandLabel(items.length)}
        </button>
      )}
    </>
  );
}

type TruncatedGroupsProps<T> = {
  groups: T[];
  previewCount: number;
  renderGroup: (group: T) => ReactNode;
  getKey: (group: T) => string;
  expandLabel?: (total: number) => string;
};

export function TruncatedGroups<T>({
  groups,
  previewCount,
  renderGroup,
  getKey,
  expandLabel = (total) => `View all ${total} dates`,
}: TruncatedGroupsProps<T>) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? groups : groups.slice(0, previewCount);
  const hasMore = groups.length > previewCount;

  return (
    <>
      <div className="space-y-8">
        {visible.map((group) => (
          <div key={getKey(group)}>{renderGroup(group)}</div>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
        >
          {expanded ? "Show fewer dates" : expandLabel(groups.length)}
        </button>
      )}
    </>
  );
}
