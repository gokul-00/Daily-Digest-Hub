import { activePileFromDbRows } from "./dumps.shared";
import {
  type ArchivedDump,
  type PileArchive,
  type PileArchiveSummary,
  dumpToArchived,
  formatPileArchiveLabel,
} from "./pile-archive.shared";
import { createSupabaseServerClient } from "./supabase/server";

type DbPileArchiveRow = {
  id: string;
  user_id: string;
  digest_id: string | null;
  label: string;
  items: ArchivedDump[];
  item_count: number;
  archived_at: string;
};

export function isPileArchivesTableMissing(error: { code?: string; message?: string } | null): boolean {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table") === true
  );
}

function rowToSummary(row: DbPileArchiveRow): PileArchiveSummary {
  return {
    id: row.id,
    digestId: row.digest_id,
    label: row.label,
    itemCount: row.item_count,
    archivedAt: row.archived_at,
  };
}

function rowToArchive(row: DbPileArchiveRow): PileArchive {
  return {
    ...rowToSummary(row),
    items: row.items ?? [],
  };
}

export async function archivePileItems(
  userId: string,
  items: ArchivedDump[],
  digestId: string | null,
): Promise<PileArchiveSummary | null> {
  if (items.length === 0) return null;

  const supabase = createSupabaseServerClient();
  const archivedAt = new Date();
  const label = formatPileArchiveLabel(archivedAt);

  const { data, error } = await supabase
    .from("pile_archives")
    .insert({
      user_id: userId,
      digest_id: digestId,
      label,
      items,
      item_count: items.length,
      archived_at: archivedAt.toISOString(),
    })
    .select("id, user_id, digest_id, label, items, item_count, archived_at")
    .single();

  if (error) {
    if (isPileArchivesTableMissing(error)) return null;
    throw new Error("Could not archive the pile.");
  }

  const ids = items.map((item) => item.id);
  if (ids.length > 0) {
    const { error: deleteError } = await supabase
      .from("dumps")
      .delete()
      .in("id", ids)
      .eq("user_id", userId);
    if (deleteError) {
      console.warn("[pile-archive] Archived snapshot saved but dumps not cleared:", deleteError.message);
    }
  }

  return rowToSummary(data as DbPileArchiveRow);
}

export async function archiveActivePile(digestId: string | null): Promise<PileArchiveSummary> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in to archive your pile.");

  const { data, error } = await supabase
    .from("dumps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load your pile.");

  const pile = activePileFromDbRows(data ?? []);
  if (pile.length === 0) throw new Error("Nothing in the pile to archive.");

  const archived = await archivePileItems(
    user.id,
    pile.map(dumpToArchived),
    digestId,
  );
  if (!archived) {
    throw new Error("Pile archive is not set up yet. Run supabase/migrations/004_pile_archives.sql.");
  }
  return archived;
}

export async function listPileArchivesForUser(): Promise<PileArchiveSummary[]> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("pile_archives")
    .select("id, digest_id, label, item_count, archived_at")
    .eq("user_id", user.id)
    .order("archived_at", { ascending: false })
    .limit(100);

  if (error) {
    if (isPileArchivesTableMissing(error)) return [];
    throw new Error("Could not load pile archive.");
  }

  return (data ?? []).map((row) =>
    rowToSummary({
      ...(row as DbPileArchiveRow),
      user_id: user.id,
      items: [],
    }),
  );
}

export async function getPileArchiveByDigestId(digestId: string): Promise<PileArchive | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("pile_archives")
    .select("id, digest_id, label, items, item_count, archived_at")
    .eq("user_id", user.id)
    .eq("digest_id", digestId)
    .order("archived_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isPileArchivesTableMissing(error)) return null;
    throw new Error("Could not load archived pile for this edition.");
  }

  return data ? rowToArchive({ ...(data as DbPileArchiveRow), user_id: user.id }) : null;
}

export async function getPileArchiveById(archiveId: string): Promise<PileArchive | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("pile_archives")
    .select("id, digest_id, label, items, item_count, archived_at")
    .eq("user_id", user.id)
    .eq("id", archiveId)
    .maybeSingle();

  if (error) {
    if (isPileArchivesTableMissing(error)) return null;
    throw new Error("Could not load that archive.");
  }

  return data ? rowToArchive({ ...(data as DbPileArchiveRow), user_id: user.id }) : null;
}
