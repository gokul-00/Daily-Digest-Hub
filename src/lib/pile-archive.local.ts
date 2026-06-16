import {
  type ArchivedDump,
  type PileArchive,
  type PileArchiveSummary,
  formatPileArchiveLabel,
  localPileArchivesKey,
} from "./pile-archive.shared";

export function readLocalPileArchives(userId: string): PileArchive[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localPileArchivesKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as PileArchive[];
  } catch {
    return [];
  }
}

export function writeLocalPileArchive(userId: string, archive: PileArchive) {
  if (typeof window === "undefined") return;
  const existing = readLocalPileArchives(userId).filter((a) => a.id !== archive.id);
  const next = [archive, ...existing].slice(0, 100);
  window.localStorage.setItem(localPileArchivesKey(userId), JSON.stringify(next));
}

export function createLocalPileArchive(
  userId: string,
  items: ArchivedDump[],
  digestId: string | null,
): PileArchive {
  const archivedAt = new Date();
  const archive: PileArchive = {
    id: crypto.randomUUID(),
    digestId,
    label: formatPileArchiveLabel(archivedAt),
    itemCount: items.length,
    archivedAt: archivedAt.toISOString(),
    items,
  };
  writeLocalPileArchive(userId, archive);
  return archive;
}

export function summariesFromArchives(archives: PileArchive[]): PileArchiveSummary[] {
  return archives.map(({ id, digestId, label, itemCount, archivedAt }) => ({
    id,
    digestId,
    label,
    itemCount,
    archivedAt,
  }));
}
