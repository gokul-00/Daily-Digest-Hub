import { createServerFn } from "@tanstack/react-start";
import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

import { activePileFromDbRows } from "./dumps.shared";
import { buildAiUsageMetrics, type AiUsageMetrics } from "./ai-usage";
import {
  DigestSchema,
  type Digest,
  type DigestArtifactSummary,
  type GenerateDigestResult,
  formatArtifactTitle,
} from "./digest.shared";
import { extractUrls, formatExtractedForPrompt, getOrExtract } from "./extract/index";
import { createSupabaseServerClient } from "./supabase/server";

export type { Digest, DigestArtifactSummary, GenerateDigestResult, AiUsageMetrics };
export type { DigestArtifact } from "./digest.shared";
export { DigestSchema } from "./digest.shared";

const DumpInputSchema = z.object({
  id: z.string(),
  type: z.enum(["read", "todo", "idea", "note"]),
  kind: z.enum(["link", "text"]),
  content: z.string().min(1).max(8000),
  createdAt: z.number(),
  done: z.boolean().optional(),
});

const InputSchema = z.object({
  dumps: z.array(DumpInputSchema).min(1).max(80).optional(),
});

type DumpInput = z.infer<typeof DumpInputSchema>;

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

function isDigestsTableMissing(error: { code?: string; message?: string } | null): boolean {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table") === true
  );
}

async function saveArtifact(
  userId: string,
  digest: Digest,
  dumpCount: number,
): Promise<DigestArtifactSummary> {
  const createdAt = new Date();
  const title = formatArtifactTitle(createdAt);
  const supabase = createSupabaseServerClient();

  const base = {
    user_id: userId,
    payload: digest,
    dump_count: dumpCount,
  };

  let result = await supabase
    .from("digests")
    .insert({ ...base, title })
    .select("id, created_at, title, dump_count, payload")
    .single();

  if (result.error?.message?.includes("title")) {
    result = await supabase
      .from("digests")
      .insert(base)
      .select("id, created_at, title, dump_count, payload")
      .single();
  }

  const { data, error } = result;

  if (error) {
    if (isDigestsTableMissing(error)) {
      const id = crypto.randomUUID();
      return {
        id,
        createdAt: createdAt.toISOString(),
        title,
        dumpCount,
        overview: digest.overview,
      };
    }
    throw new Error("Could not save this edition to your account.");
  }

  return rowToSummary(data as DbDigestRow);
}

async function loadDumpsForUser(payloadDumps: DumpInput[] | undefined): Promise<DumpInput[]> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data, error } = await supabase
      .from("dumps")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw new Error("Could not load dumps from your account.");
    const pile = activePileFromDbRows(data ?? []);
    if (pile.length === 0) {
      throw new Error("Nothing in the pile yet.");
    }
    return pile.map((d) => ({
      id: d.id,
      type: d.type,
      kind: d.kind,
      content: d.content,
      createdAt: d.createdAt,
      done: d.done,
    }));
  }

  if (!payloadDumps?.length) {
    throw new Error("Nothing in the pile yet.");
  }
  return payloadDumps;
}

export const generateDigest = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateDigestResult> => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

    const dumps = await loadDumpsForUser(data.dumps);

    const urlToUserText = new Map<string, string>();
    for (const d of dumps) {
      if (d.type !== "read") continue;
      for (const url of extractUrls(d.content)) {
        if (!urlToUserText.has(url)) {
          urlToUserText.set(url, d.content.replace(url, "").trim());
        }
      }
    }

    const urlList = Array.from(urlToUserText.keys()).slice(0, 30);
    const settled = await Promise.allSettled(
      urlList.map((url) => getOrExtract(url, urlToUserText.get(url))),
    );
    const byUrl = new Map(
      settled.map((result, i) => {
        const url = urlList[i];
        if (result.status === "fulfilled") return [url, result.value] as const;
        return [
          url,
          {
            url,
            sourceType: "unknown" as const,
            body: "",
            metadata: {},
            provider: "none",
            status: "error" as const,
            error: result.reason?.message ?? "Extraction failed",
          },
        ] as const;
      }),
    );

    const groups: Record<string, DumpInput[]> = {
      read: [],
      todo: [],
      idea: [],
      note: [],
    };
    for (const d of dumps) groups[d.type].push(d);

    const lines: string[] = [];
    for (const type of ["read", "todo", "idea", "note"] as const) {
      const items = groups[type];
      if (items.length === 0) continue;
      lines.push(`### ${type.toUpperCase()} ITEMS`);
      items.forEach((d, i) => {
        lines.push(`-- ${type} #${i + 1}${d.done ? " [DONE]" : ""} --`);
        lines.push(d.content.trim());
        if (type === "read") {
          for (const u of extractUrls(d.content)) {
            const doc = byUrl.get(u);
            if (doc) lines.push(formatExtractedForPrompt(doc));
          }
        }
        lines.push("");
      });
    }

    const prompt = `EOD pile:\n\n${lines.join("\n")}`;
    const modelId = "claude-haiku-4-5";
    const startedAt = Date.now();

    const { object, usage } = await generateObject({
      model: anthropic(modelId),
      schema: DigestSchema,
      maxOutputTokens: 10000,
      system:
        "You are an end-of-day personal assistant. Input is a mixed pile of READ items (links/articles to summarize), TODO items (things the user wants to do later), IDEA items (adhoc thoughts to brainstorm), and NOTE items (things to remember). For each section: READ -> abstract digest with sources; TODO -> normalize the task, infer when/priority; IDEA -> echo the seed and offer angles to explore; NOTE -> tighten the wording. Calm, editorial, no fluff. If a section has no items, return an empty array for it.",
      prompt,
    });

    const aiUsage = buildAiUsageMetrics({
      model: modelId,
      usage,
      dumpCount: dumps.length,
      urlCount: urlList.length,
      promptChars: prompt.length,
      durationMs: Date.now() - startedAt,
    });

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let artifact: DigestArtifactSummary;
    if (user) {
      artifact = await saveArtifact(user.id, object, dumps.length);
      const { recordAiUsageEvent } = await import("./ai-usage.server");
      await recordAiUsageEvent({
        userId: user.id,
        digestId: artifact.id,
        usage: aiUsage,
      });
      const { archivePileItems } = await import("./pile-archive.server");
      await archivePileItems(
        user.id,
        dumps.map((d) => ({
          id: d.id,
          type: d.type,
          kind: d.kind,
          content: d.content,
          createdAt: d.createdAt,
          done: d.done ?? false,
        })),
        artifact.id,
      );
    } else {
      const createdAt = new Date();
      artifact = {
        id: crypto.randomUUID(),
        createdAt: createdAt.toISOString(),
        title: formatArtifactTitle(createdAt),
        dumpCount: dumps.length,
        overview: object.overview,
      };
    }

    return { digest: object, artifact, usage: aiUsage };
  });

export { getArtifact, listArtifacts } from "./digest-artifacts.functions";
