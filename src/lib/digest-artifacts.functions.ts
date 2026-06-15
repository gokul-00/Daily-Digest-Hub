import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  DigestSchema,
  type Digest,
  type DigestArtifact,
  type DigestArtifactSummary,
  formatArtifactTitle,
} from "./digest.shared";
import { createSupabaseServerClient } from "./supabase/server";

type DbDigestRow = {
  id: string;
  user_id: string;
  payload: Digest;
  dump_count: number;
  title: string | null;
  created_at: string;
};

function rowToSummary(row: DbDigestRow): DigestArtifactSummary {
  const digest = DigestSchema.parse(row.payload);
  return {
    id: row.id,
    createdAt: row.created_at,
    title: row.title ?? formatArtifactTitle(new Date(row.created_at)),
    dumpCount: row.dump_count,
    overview: digest.overview,
  };
}

function rowToArtifact(row: DbDigestRow, usage?: DigestArtifact["usage"]): DigestArtifact {
  const digest = DigestSchema.parse(row.payload);
  return {
    ...rowToSummary(row),
    digest,
    usage,
  };
}

function isDigestsTableMissing(error: { code?: string; message?: string } | null): boolean {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table") === true
  );
}

export const listArtifacts = createServerFn({ method: "POST" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { artifacts: [] as DigestArtifactSummary[] };

  const { data, error } = await supabase
    .from("digests")
    .select("id, created_at, title, dump_count, payload")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    if (isDigestsTableMissing(error)) return { artifacts: [] };
    throw new Error("Could not load past editions.");
  }

  return {
    artifacts: (data as DbDigestRow[]).map(rowToSummary),
  };
});

const ArtifactIdSchema = z.object({ id: z.string().uuid() });

export const getArtifact = createServerFn({ method: "POST" })
  .validator((input: unknown) => ArtifactIdSchema.parse(input))
  .handler(async ({ data }): Promise<DigestArtifact | null> => {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: row, error } = await supabase
      .from("digests")
      .select("id, created_at, title, dump_count, payload")
      .eq("user_id", user.id)
      .eq("id", data.id)
      .maybeSingle();

    if (error) {
      if (isDigestsTableMissing(error)) return null;
      throw new Error("Could not load that edition.");
    }
    if (!row) return null;

    const { fetchUsageForDigest } = await import("./ai-usage.server");
    const usage = await fetchUsageForDigest(data.id);
    return rowToArtifact(row as DbDigestRow, usage ?? undefined);
  });
