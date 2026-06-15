import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";

import { useAuth } from "@/hooks/use-auth";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import {
  type DbDump,
  type Dump,
  type DumpType,
  dumpToRow,
  makeDump,
  rowToDump,
} from "./dumps.shared";

export type { Dump, DumpType } from "./dumps.shared";
export { activePile, startOfToday } from "./dumps.shared";

const STORAGE_KEY = "later.dumps.v2";
const LEGACY_KEY = "later.dumps.v1";

type LegacyDump = {
  id: string;
  kind: "link" | "note";
  content: string;
  createdAt: number;
};

type DumpsQueryData = {
  dumps: Dump[];
  storage: "cloud" | "local";
  warning: string | null;
};

function dumpsQueryKey(userId: string) {
  return ["dumps", userId] as const;
}

function localStorageKey(userId: string) {
  return `${STORAGE_KEY}.${userId}`;
}

function isSchemaMissingError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.message?.includes("Could not find the table") === true ||
    error.message?.includes("schema cache") === true
  );
}

function readLegacyLocal(): Dump[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const old = JSON.parse(raw) as LegacyDump[];
    return old.map((d) => ({
      id: d.id,
      type: d.kind === "note" ? "note" : "read",
      kind: d.kind === "note" ? "text" : "link",
      content: d.content,
      createdAt: d.createdAt,
      done: false,
    }));
  } catch {
    return [];
  }
}

function readLocalDumps(userId: string): Dump[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localStorageKey(userId));
    if (raw) return JSON.parse(raw) as Dump[];
    const legacy = window.localStorage.getItem(STORAGE_KEY);
    if (legacy) return JSON.parse(legacy) as Dump[];
    return readLegacyLocal();
  } catch {
    return [];
  }
}

function writeLocalDumps(userId: string, dumps: Dump[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(localStorageKey(userId), JSON.stringify(dumps));
}

function emptyQueryData(): DumpsQueryData {
  return { dumps: [], storage: "cloud", warning: null };
}

async function migrateLocalDumps(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  const local = readLocalDumps(userId);
  if (local.length === 0) return;

  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase.from("dumps").upsert(local.map((d) => dumpToRow(d, userId)));
  if (error) throw error;

  window.localStorage.removeItem(localStorageKey(userId));
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_KEY);
}

async function fetchDumps(userId: string): Promise<DumpsQueryData> {
  const supabase = getSupabaseBrowserClient();

  try {
    await migrateLocalDumps(userId);
    const { data, error } = await supabase
      .from("dumps")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return {
      dumps: (data as DbDump[]).map(rowToDump),
      storage: "cloud",
      warning: null,
    };
  } catch (err) {
    const supabaseError = err as { code?: string; message?: string };
    if (isSchemaMissingError(supabaseError)) {
      return {
        dumps: readLocalDumps(userId),
        storage: "local",
        warning:
          "Cloud database is not set up yet — saving on this device. Run supabase/migrations/001_initial.sql in your Supabase SQL editor to enable sync.",
      };
    }
    throw err;
  }
}

function getQuerySnapshot(queryClient: ReturnType<typeof useQueryClient>, userId: string) {
  return queryClient.getQueryData<DumpsQueryData>(dumpsQueryKey(userId)) ?? emptyQueryData();
}

export function useDumps() {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;
  const [saveError, setSaveError] = useState<string | null>(null);

  const { data, isLoading, isError, error: fetchError } = useQuery({
    queryKey: userId ? dumpsQueryKey(userId) : ["dumps", "anonymous"],
    queryFn: () => fetchDumps(userId!),
    enabled: !!userId,
  });

  const dumps = data?.dumps ?? [];
  const storage = data?.storage ?? "cloud";
  const syncWarning = data?.warning ?? null;

  const addMutation = useMutation({
    mutationFn: async ({ content, type }: { content: string; type: DumpType }) => {
      const dump = makeDump(content, type);
      const snapshot = getQuerySnapshot(queryClient, userId!);

      if (snapshot.storage === "local") {
        const next = [dump, ...snapshot.dumps];
        writeLocalDumps(userId!, next);
        return dump;
      }

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("dumps").insert({
        id: dump.id,
        user_id: userId!,
        type: dump.type,
        kind: dump.kind,
        content: dump.content,
        done: dump.done,
      });
      if (error) {
        if (isSchemaMissingError(error)) {
          const next = [dump, ...readLocalDumps(userId!)];
          writeLocalDumps(userId!, next);
          queryClient.setQueryData<DumpsQueryData>(dumpsQueryKey(userId!), {
            dumps: next,
            storage: "local",
            warning:
              "Cloud database is not set up yet — saving on this device. Run supabase/migrations/001_initial.sql in your Supabase SQL editor to enable sync.",
          });
          return dump;
        }
        throw error;
      }
      return dump;
    },
    onMutate: async ({ content, type }) => {
      if (!userId) return;
      setSaveError(null);
      await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
      const previous = getQuerySnapshot(queryClient, userId);
      const dump = makeDump(content, type);
      queryClient.setQueryData<DumpsQueryData>(dumpsQueryKey(userId), {
        ...previous,
        dumps: [dump, ...previous.dumps],
      });
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (userId && ctx?.previous) {
        queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
      }
      setSaveError((err as Error).message ?? "Could not save.");
    },
    onSettled: () => {
      if (userId && storage === "cloud") {
        void queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const snapshot = getQuerySnapshot(queryClient, userId!);
      if (snapshot.storage === "local") {
        writeLocalDumps(
          userId!,
          snapshot.dumps.filter((d) => d.id !== id),
        );
        return;
      }
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from("dumps").delete().eq("id", id).eq("user_id", userId!);
      if (error) throw error;
    },
    onMutate: async (id) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
      const previous = getQuerySnapshot(queryClient, userId);
      queryClient.setQueryData<DumpsQueryData>(dumpsQueryKey(userId), {
        ...previous,
        dumps: previous.dumps.filter((d) => d.id !== id),
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (userId && ctx?.previous) {
        queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
      }
    },
    onSettled: () => {
      if (userId && storage === "cloud") {
        void queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
      }
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (id: string) => {
      const snapshot = getQuerySnapshot(queryClient, userId!);
      const dump = snapshot.dumps.find((d) => d.id === id);
      if (!dump) return;
      const nextDone = !dump.done;

      if (snapshot.storage === "local") {
        const next = snapshot.dumps.map((d) =>
          d.id === id ? { ...d, done: nextDone, doneAt: nextDone ? Date.now() : undefined } : d,
        );
        writeLocalDumps(userId!, next);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("dumps")
        .update({
          done: nextDone,
          done_at: nextDone ? new Date().toISOString() : null,
        })
        .eq("id", id)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onMutate: async (id) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
      const previous = getQuerySnapshot(queryClient, userId);
      queryClient.setQueryData<DumpsQueryData>(dumpsQueryKey(userId), {
        ...previous,
        dumps: previous.dumps.map((d) =>
          d.id === id ? { ...d, done: !d.done, doneAt: d.done ? undefined : Date.now() } : d,
        ),
      });
      return { previous };
    },
    onError: (_err, _id, ctx) => {
      if (userId && ctx?.previous) {
        queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
      }
    },
    onSettled: () => {
      if (userId && storage === "cloud") {
        void queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const trimmed = content.trim();
      const kind: Dump["kind"] = /^https?:\/\//i.test(trimmed) ? "link" : "text";
      const snapshot = getQuerySnapshot(queryClient, userId!);

      if (snapshot.storage === "local") {
        const next = snapshot.dumps.map((d) =>
          d.id === id ? { ...d, content: trimmed, kind } : d,
        );
        writeLocalDumps(userId!, next);
        return;
      }

      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase
        .from("dumps")
        .update({ content: trimmed, kind })
        .eq("id", id)
        .eq("user_id", userId!);
      if (error) throw error;
    },
    onMutate: async ({ id, content }) => {
      if (!userId) return;
      const trimmed = content.trim();
      const kind: Dump["kind"] = /^https?:\/\//i.test(trimmed) ? "link" : "text";
      await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
      const previous = getQuerySnapshot(queryClient, userId);
      queryClient.setQueryData<DumpsQueryData>(dumpsQueryKey(userId), {
        ...previous,
        dumps: previous.dumps.map((d) => (d.id === id ? { ...d, content: trimmed, kind } : d)),
      });
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (userId && ctx?.previous) {
        queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
      }
    },
    onSettled: () => {
      if (userId && storage === "cloud") {
        void queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
      }
    },
  });

  const add = useCallback(
    (content: string, type: DumpType) => {
      const trimmed = content.trim();
      if (!trimmed || !userId) return;
      addMutation.mutate({ content: trimmed, type });
    },
    [addMutation, userId],
  );

  const remove = useCallback(
    (id: string) => {
      if (!userId) return;
      removeMutation.mutate(id);
    },
    [removeMutation, userId],
  );

  const toggleDone = useCallback(
    (id: string) => {
      if (!userId) return;
      toggleMutation.mutate(id);
    },
    [toggleMutation, userId],
  );

  const update = useCallback(
    (id: string, content: string) => {
      if (!userId) return;
      updateMutation.mutate({ id, content });
    },
    [updateMutation, userId],
  );

  return {
    dumps,
    add,
    remove,
    toggleDone,
    update,
    storage,
    syncWarning,
    saveError,
    fetchError: isError ? ((fetchError as Error)?.message ?? "Could not load pile.") : null,
    hydrated: !authLoading && !!userId && !isLoading,
    ready: !authLoading && !!userId,
    isSaving: addMutation.isPending,
  };
}
