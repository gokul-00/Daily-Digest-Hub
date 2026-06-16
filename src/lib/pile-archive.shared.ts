import type { Dump, DumpType } from "./dumps.shared";

export type ArchivedDump = {
  id: string;
  type: DumpType;
  kind: "link" | "text";
  content: string;
  createdAt: number;
  done: boolean;
  doneAt?: number;
};

export type PileArchiveSummary = {
  id: string;
  digestId: string | null;
  label: string;
  itemCount: number;
  archivedAt: string;
};

export type PileArchive = PileArchiveSummary & {
  items: ArchivedDump[];
};

export const LOCAL_PILE_ARCHIVES_KEY = "later.pile-archives.v1";

export function localPileArchivesKey(userId: string) {
  return `${LOCAL_PILE_ARCHIVES_KEY}.${userId}`;
}

export function formatPileArchiveLabel(date: Date): string {
  const day = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  return `Pile — ${day}`;
}

export function dumpToArchived(dump: Dump): ArchivedDump {
  return {
    id: dump.id,
    type: dump.type,
    kind: dump.kind,
    content: dump.content,
    createdAt: dump.createdAt,
    done: dump.done,
    doneAt: dump.doneAt,
  };
}

export function archiveDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export function formatArchiveDateHeading(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function groupArchivesByDate<T extends { archivedAt: string }>(
  archives: T[],
): { date: string; heading: string; archives: T[] }[] {
  const map = new Map<string, T[]>();
  for (const archive of archives) {
    const key = archiveDateKey(archive.archivedAt);
    const list = map.get(key) ?? [];
    list.push(archive);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, items]) => ({
      date,
      heading: formatArchiveDateHeading(items[0]!.archivedAt),
      archives: items.sort(
        (a, b) => new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime(),
      ),
    }));
}
