import { BriefItemSchema, parseBriefItems, type BriefItem } from "./exam-brief.shared";
import { createSupabaseServerClient } from "./supabase/server";

export function isExamSavedTableMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.message?.includes("Could not find the table") === true ||
    error.message?.includes("schema cache") === true ||
    error.message?.includes("exam_saved_items") === true
  );
}

async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  return { supabase, user };
}

type DbRow = {
  item_id: string;
  item: unknown;
  saved_at: string;
};

export async function listExamSavedForUser(): Promise<BriefItem[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("exam_saved_items")
    .select("item_id, item, saved_at")
    .eq("user_id", user.id)
    .order("saved_at", { ascending: false });

  if (error) {
    if (isExamSavedTableMissing(error)) return [];
    throw error;
  }

  const rows = (data ?? []) as DbRow[];
  return parseBriefItems(rows.map((r) => r.item));
}

export async function upsertExamSavedItem(item: BriefItem): Promise<BriefItem> {
  const parsed = BriefItemSchema.parse(item);
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("exam_saved_items").upsert(
    {
      user_id: user.id,
      item_id: parsed.id,
      item: parsed,
      saved_at: new Date().toISOString(),
    },
    { onConflict: "user_id,item_id" },
  );
  if (error) {
    if (isExamSavedTableMissing(error)) {
      throw new Error("Saved items table is missing. Apply migration 006_exam_saved_items.sql.");
    }
    throw error;
  }
  return parsed;
}

export async function deleteExamSavedItem(itemId: string): Promise<void> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("exam_saved_items")
    .delete()
    .eq("user_id", user.id)
    .eq("item_id", itemId);
  if (error) {
    if (isExamSavedTableMissing(error)) {
      throw new Error("Saved items table is missing. Apply migration 006_exam_saved_items.sql.");
    }
    throw error;
  }
}

/** One-shot import of local items the client still has. Skips existing item_ids. */
export async function importExamSavedItems(items: BriefItem[]): Promise<BriefItem[]> {
  const clean = parseBriefItems(items);
  if (clean.length === 0) return listExamSavedForUser();

  const { supabase, user } = await requireUser();
  const { data: existing, error: existingError } = await supabase
    .from("exam_saved_items")
    .select("item_id")
    .eq("user_id", user.id);

  if (existingError) {
    if (isExamSavedTableMissing(existingError)) return clean;
    throw existingError;
  }

  const have = new Set((existing ?? []).map((r) => r.item_id as string));
  const toInsert = clean.filter((it) => !have.has(it.id));
  if (toInsert.length > 0) {
    const { error } = await supabase.from("exam_saved_items").insert(
      toInsert.map((item) => ({
        user_id: user.id,
        item_id: item.id,
        item,
        saved_at: new Date().toISOString(),
      })),
    );
    if (error && !isExamSavedTableMissing(error)) throw error;
  }

  return listExamSavedForUser();
}
