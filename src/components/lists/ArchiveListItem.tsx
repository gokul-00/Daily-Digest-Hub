import { Link } from "@tanstack/react-router";

import { ArchivedItemRow } from "@/components/pile/ArchivedItemRow";
import { TruncatedList } from "@/components/lists/SectionHeading";
import type { ArchivedDump } from "@/lib/pile-archive.shared";
import type { PileArchiveSummary } from "@/lib/pile-archive.shared";

type ArchiveListItemProps = {
  archive: PileArchiveSummary;
  expanded: boolean;
  expandedItems: ArchivedDump[] | null;
  previewItems?: ArchivedDump[];
  onToggle: () => void;
};

export function ArchiveListItem({
  archive,
  expanded,
  expandedItems,
  previewItems = [],
  onToggle,
}: ArchiveListItemProps) {
  return (
    <div className="rounded-md border border-border/60 bg-background/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full flex-col gap-2 px-4 py-3 text-left transition hover:bg-background/60"
      >
        <div className="flex w-full flex-wrap items-baseline justify-between gap-2">
          <span className="font-display text-base text-ink">{archive.label}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
            {archive.itemCount} items
            {archive.digestId ? " · linked to edition" : ""}
          </span>
        </div>
        {!expanded && previewItems.length > 0 && (
          <div className="space-y-1 border-t border-border/30 pt-2">
            {previewItems.slice(0, 2).map((item) => (
              <ArchivedItemRow key={item.id} item={item} preview />
            ))}
          </div>
        )}
      </button>
      {archive.digestId && (
        <div className="border-t border-border/40 px-4 py-2">
          <Link
            to="/digest/$id"
            params={{ id: archive.digestId }}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
          >
            Open evening edition →
          </Link>
        </div>
      )}
      {expanded && expandedItems && (
        <ul className="space-y-2 border-t border-border/40 px-4 py-3">
          {expandedItems.map((item) => (
            <li key={item.id}>
              <ArchivedItemRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type ArchiveDateGroupProps = {
  heading: string;
  archives: PileArchiveSummary[];
  expandedArchiveId: string | null;
  expandedArchiveItems: ArchivedDump[] | null;
  archivePreviews: Record<string, ArchivedDump[]>;
  onToggleArchive: (id: string) => void;
};

export function ArchiveDateGroup({
  heading,
  archives,
  expandedArchiveId,
  expandedArchiveItems,
  archivePreviews,
  onToggleArchive,
}: ArchiveDateGroupProps) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia">{heading}</p>
      <div className="mt-3">
        <TruncatedList
          items={archives}
          previewCount={3}
          listClassName="space-y-2"
          expandLabel={(total) => `View all ${total} archives`}
          getKey={(a) => a.id}
          renderItem={(archive) => (
            <ArchiveListItem
              archive={archive}
              expanded={expandedArchiveId === archive.id}
              expandedItems={expandedArchiveId === archive.id ? expandedArchiveItems : null}
              previewItems={archivePreviews[archive.id]}
              onToggle={() => onToggleArchive(archive.id)}
            />
          )}
        />
      </div>
    </div>
  );
}
