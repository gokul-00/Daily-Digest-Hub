import { z } from "zod";

import type { AiUsageMetrics } from "./ai-usage";

export type { AiUsageMetrics } from "./ai-usage";

const SourceSchema = z.object({
  url: z.string(),
  label: z.string(),
});

const ReadItemSchema = z.object({
  title: z.string(),
  tldr: z.string(),
  keyPoints: z.array(z.string()),
  category: z.string(),
  tags: z.array(z.string()),
  worthDeepDive: z.boolean(),
  sources: z.array(SourceSchema),
});

const TodoItemSchema = z.object({
  task: z.string(),
  context: z.string(),
  when: z.string(),
  priority: z.enum(["high", "medium", "low"]),
  tags: z.array(z.string()),
});

const IdeaItemSchema = z.object({
  title: z.string(),
  seed: z.string(),
  expand: z.string(),
  tags: z.array(z.string()),
});

const NoteItemSchema = z.object({
  title: z.string(),
  body: z.string(),
  tags: z.array(z.string()),
});

export const DigestSchema = z.object({
  overview: z.string(),
  themes: z.array(z.string()),
  reading: z.array(ReadItemSchema),
  todos: z.array(TodoItemSchema),
  ideas: z.array(IdeaItemSchema),
  notes: z.array(NoteItemSchema),
});

export type Digest = z.infer<typeof DigestSchema>;

export type DigestArtifactSummary = {
  id: string;
  createdAt: string;
  title: string;
  dumpCount: number;
  overview?: string;
};

export type DigestArtifact = DigestArtifactSummary & {
  digest: Digest;
  usage?: AiUsageMetrics;
};

export type GenerateDigestResult = {
  digest: Digest;
  artifact: DigestArtifactSummary;
  usage: AiUsageMetrics;
};

export function formatArtifactTitle(date: Date): string {
  const day = date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const time = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `Evening edition — ${day} · ${time}`;
}

export const LOCAL_ARTIFACTS_KEY = "later.artifacts.v1";

export function localArtifactsKey(userId: string) {
  return `${LOCAL_ARTIFACTS_KEY}.${userId}`;
}

export function readLocalArtifacts(userId: string): DigestArtifact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(localArtifactsKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DigestArtifact[];
    return parsed.map((a) => ({ ...a, digest: DigestSchema.parse(a.digest) }));
  } catch {
    return [];
  }
}

export function writeLocalArtifact(userId: string, artifact: DigestArtifact) {
  if (typeof window === "undefined") return;
  const existing = readLocalArtifacts(userId).filter((a) => a.id !== artifact.id);
  const next = [artifact, ...existing].slice(0, 50);
  window.localStorage.setItem(localArtifactsKey(userId), JSON.stringify(next));
}

export function summariesFromArtifacts(artifacts: DigestArtifact[]): DigestArtifactSummary[] {
  return artifacts.map(({ id, createdAt, title, dumpCount, overview }) => ({
    id,
    createdAt,
    title,
    dumpCount,
    overview,
  }));
}
