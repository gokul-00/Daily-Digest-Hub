import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

import { buildAiUsageMetrics } from "./ai-usage";
import { normalizeSourceUrl } from "./exam-sources";
import { createSupabaseAdminClient } from "./supabase/admin.server";

export const ExamEnum = z.enum(["upsc", "banking", "ssc", "state_psc"]);
export type Exam = z.infer<typeof ExamEnum>;

/** All exam categories (tags) generated once per day. */
export const ALL_EXAM_CATEGORIES: Exam[] = ["upsc", "banking", "ssc", "state_psc"];

export const EXAM_LABEL: Record<Exam, string> = {
  upsc: "UPSC Civil Services",
  banking: "Banking (SBI/IBPS/RBI)",
  ssc: "SSC (CGL/CHSL)",
  state_psc: "State PSC",
};

const RelevanceEnum = z.enum(["high", "med", "low", "skip"]);

const MCQSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).length(4),
  answerIndex: z.number().int().min(0).max(3),
  explanation: z.string(),
});

const BriefItemSchema = z.object({
  id: z.string(),
  headline: z.string(),
  whatHappened: z.string(),
  whyItMatters: z.string(),
  examRelevance: z.object({
    upsc: RelevanceEnum,
    banking: RelevanceEnum,
    ssc: RelevanceEnum,
    state_psc: RelevanceEnum,
  }),
  topicTags: z.array(z.string()),
  staticLinks: z.array(z.string()),
  sources: z.array(
    z.object({
      url: z.string(),
      label: z.string(),
      publishedAt: z.string().optional(),
    }),
  ),
  mcq: MCQSchema,
});

const BriefSchema = z.object({
  items: z.array(BriefItemSchema).min(1).max(12),
});

export type Brief = z.infer<typeof BriefSchema>;

export type StoredBrief = {
  date: string;
  exam: Exam;
  items: z.infer<typeof BriefItemSchema>[];
  generatedAt: number;
};

export type EnsureDailyBriefResult = StoredBrief & {
  status: "cached" | "generated";
};

export type CategoryBriefResult = {
  exam: Exam;
  category: Exam;
  status: "cached" | "generated" | "error";
  itemCount?: number;
  generatedAt?: number;
  error?: string;
};

type Tier = 1 | 2 | 3;
const FEEDS: { url: string; label: string; weight: number; tier: Tier }[] = [
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3", label: "PIB — All Releases", weight: 5, tier: 1 },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=32", label: "PIB — Finance", weight: 5, tier: 1 },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=13", label: "PIB — External Affairs", weight: 5, tier: 1 },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=10", label: "PIB — Home Affairs", weight: 5, tier: 1 },
  { url: "https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=24", label: "PIB — Environment", weight: 5, tier: 1 },
  { url: "https://www.rbi.org.in/Scripts/Rss.aspx", label: "RBI — Press Releases", weight: 5, tier: 1 },
  { url: "https://www.thehindu.com/news/national/feeder/default.rss", label: "The Hindu — National", weight: 3, tier: 2 },
  { url: "https://www.thehindu.com/business/Economy/feeder/default.rss", label: "The Hindu — Economy", weight: 3, tier: 2 },
  { url: "https://www.thehindu.com/news/international/feeder/default.rss", label: "The Hindu — International", weight: 3, tier: 2 },
  { url: "https://www.thehindu.com/sci-tech/science/feeder/default.rss", label: "The Hindu — Science", weight: 3, tier: 2 },
  { url: "https://indianexpress.com/section/india/feed/", label: "Indian Express — India", weight: 3, tier: 2 },
  { url: "https://indianexpress.com/section/explained/feed/", label: "Indian Express — Explained", weight: 3, tier: 2 },
  { url: "https://www.livemint.com/rss/economy", label: "Mint — Economy", weight: 2, tier: 3 },
  { url: "https://www.downtoearth.org.in/rss/news", label: "Down To Earth — Environment", weight: 2, tier: 3 },
];

type RssItem = {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  source: string;
  weight: number;
  tier: Tier;
};

function stripHtml(s: string): string {
  return s
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTag(block: string, tag: string): string {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  return m ? stripHtml(m[1]) : "";
}

function parseRss(xml: string, feed: (typeof FEEDS)[number]): RssItem[] {
  const items: RssItem[] = [];
  const itemRe = /<item[\s>][\s\S]*?<\/item>/gi;
  const blocks = xml.match(itemRe) ?? [];
  for (const b of blocks) {
    const title = parseTag(b, "title");
    const link = parseTag(b, "link");
    const description = parseTag(b, "description");
    const pubDate = parseTag(b, "pubDate");
    if (title && link) {
      items.push({
        title,
        link,
        description,
        pubDate,
        source: feed.label,
        weight: feed.weight,
        tier: feed.tier,
      });
    }
  }
  return items;
}

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<RssItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 ExamPulse/1.0",
        Accept: "application/rss+xml,application/xml,text/xml",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseRss(xml, feed).slice(0, 12);
  } catch {
    return [];
  }
}

function withinLast36h(pubDate?: string): boolean {
  if (!pubDate) return true;
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return true;
  return Date.now() - t < 36 * 3600 * 1000;
}

function dedupeByTitle(items: RssItem[]): RssItem[] {
  const seen = new Set<string>();
  const out: RssItem[] = [];
  for (const it of items) {
    const key = it.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

function toIsoPublishedAt(pubDate?: string): string | undefined {
  if (!pubDate) return undefined;
  const t = Date.parse(pubDate);
  if (Number.isNaN(t)) return undefined;
  return new Date(t).toISOString();
}

function enrichSourcesWithPubDates<
  T extends { sources: { url: string; label: string; publishedAt?: string }[] },
>(items: T[], ranked: RssItem[]): T[] {
  const byUrl = new Map<string, string>();
  for (const it of ranked) {
    const iso = toIsoPublishedAt(it.pubDate);
    if (!iso) continue;
    byUrl.set(normalizeSourceUrl(it.link), iso);
  }
  return items.map((item) => ({
    ...item,
    sources: item.sources.map((s) => {
      if (s.publishedAt) return s;
      const matched = byUrl.get(normalizeSourceUrl(s.url));
      return matched ? { ...s, publishedAt: matched } : s;
    }),
  }));
}

/** Calendar date in Asia/Kolkata (IST) as YYYY-MM-DD. */
export function todayKeyIst(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export async function readBriefAdmin(exam: Exam, date: string): Promise<StoredBrief | null> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("daily_briefs")
    .select("date, exam, items, generated_at")
    .eq("exam", exam)
    .eq("date", date)
    .maybeSingle();
  if (error || !data) return null;
  return {
    date: data.date as string,
    exam: data.exam as Exam,
    items: data.items as StoredBrief["items"],
    generatedAt: new Date(data.generated_at as string).getTime(),
  };
}

export type EnsureDailyBriefOpts = {
  /** When true, delete existing row and regenerate (shared by UI + cron). */
  force?: boolean;
  /** If set, record AI usage against this user; cron omits this. */
  userId?: string | null;
};

/**
 * Ensure one daily brief exists for (date, exam).
 * Shared by authenticated UI generate and cron pre-generation.
 * Without force: never regenerates — all users get the same stored row.
 * With force: cron-only override (deletes then rebuilds).
 */
export async function ensureDailyBrief(
  exam: Exam,
  date: string,
  opts: EnsureDailyBriefOpts = {},
): Promise<EnsureDailyBriefResult> {
  const force = Boolean(opts.force);
  const admin = createSupabaseAdminClient();

  if (!force) {
    const existing = await readBriefAdmin(exam, date);
    if (existing) return { ...existing, status: "cached" };
  } else {
    await admin.from("daily_briefs").delete().eq("exam", exam).eq("date", date);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Missing ANTHROPIC_API_KEY");
  }

  const all = (await Promise.all(FEEDS.map(fetchFeed))).flat();
  const fresh = all.filter((i) => withinLast36h(i.pubDate));
  const source = fresh.length >= 20 ? fresh : all;
  const deduped = dedupeByTitle(source);
  deduped.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    const ta = a.pubDate ? Date.parse(a.pubDate) : 0;
    const tb = b.pubDate ? Date.parse(b.pubDate) : 0;
    return (tb || 0) - (ta || 0);
  });
  const ranked = deduped.slice(0, 50);

  if (ranked.length === 0) {
    throw new Error("Could not fetch any news right now. Try again in a few minutes.");
  }

  // Another request may have finished while we were preparing seeds.
  if (!force) {
    const racedEarly = await readBriefAdmin(exam, date);
    if (racedEarly) return { ...racedEarly, status: "cached" };
  }

  const seedBlock = ranked
    .map((it, i) => {
      const published = toIsoPublishedAt(it.pubDate) ?? it.pubDate ?? "unknown";
      return `#${i + 1} [Tier ${it.tier} · ${it.source}] ${it.title}\n  ${it.description.slice(0, 400)}\n  URL: ${it.link}\n  Published: ${published}`;
    })
    .join("\n\n");

  const modelId = "claude-haiku-4-5";
  const prompt = `Today's raw feed items:\n\n${seedBlock}`;
  const startedAt = Date.now();

  let object: Brief;
  let usage;
  try {
    const result = await generateObject({
      model: anthropic(modelId),
      schema: BriefSchema,
      maxOutputTokens: 12000,
      system: `You are a current-affairs editor for Indian competitive exam aspirants. Target exam for this brief: ${EXAM_LABEL[exam]}.
Rules:
- Produce 8–12 items, ranked by relevance to ${EXAM_LABEL[exam]} first.
- Drop pure entertainment, celebrity gossip, cricket scores unless it is a landmark record.
- Aggressively dedupe: same story from multiple sources becomes ONE item with merged sources.
- Prefer Tier 1 (PIB / RBI / official) items when the same story appears in multiple tiers. Merge sources across tiers into one item.
- If a Tier 1 source is present for a story, it MUST appear in that item's "sources" alongside any newspaper citation.
- Keep "whatHappened" 2–4 short lines. Keep "whyItMatters" 1–2 lines with clear exam-relevant framing (polity/economy/IR/environment impact).
- Fill examRelevance for ALL four exams honestly.
- staticLinks MUST anchor the news to standard syllabus concepts (e.g. "Monetary Policy", "Fundamental Rights", "UNCLOS").
- Every item MUST include at least one source with a real URL drawn from the seed list. Items without a source are dropped.
- Every item must include at least one MCQ testing understanding, not trivia.
- id must be a unique kebab-case slug.
- Use topicTags as short category tags (e.g. polity, economy, environment, ir, science).`,
      prompt,
    });
    object = result.object;
    usage = result.usage;
  } catch (error) {
    console.error("Daily brief AI generation failed", error);
    throw new Error("Could not generate the current-affairs brief right now. Try again in a minute.");
  }

  const items = enrichSourcesWithPubDates(
    object.items.filter((it) => it.sources && it.sources.length > 0),
    ranked,
  );
  if (items.length === 0) {
    throw new Error("AI produced no citable items. Try again.");
  }

  // Winner of a concurrent generate owns the row — losers adopt their brief.
  if (!force) {
    const racedLate = await readBriefAdmin(exam, date);
    if (racedLate) return { ...racedLate, status: "cached" };
  }

  if (opts.userId) {
    const aiUsage = buildAiUsageMetrics({
      model: modelId,
      usage,
      dumpCount: items.length,
      urlCount: ranked.length,
      promptChars: prompt.length,
      durationMs: Date.now() - startedAt,
    });
    const { recordAiUsageEvent } = await import("./ai-usage.server");
    await recordAiUsageEvent({
      userId: opts.userId,
      digestId: null,
      operation: "generate_brief",
      usage: aiUsage,
    });
  }

  const { error: insertError } = await admin
    .from("daily_briefs")
    .insert({ date, exam, items });

  if (insertError) {
    const conflict =
      insertError.code === "23505" || /duplicate|conflict|unique/i.test(insertError.message);
    if (conflict) {
      const winner = await readBriefAdmin(exam, date);
      if (winner) return { ...winner, status: "cached" };
    } else {
      console.error("Failed to persist brief", insertError);
    }
  }

  const stored = await readBriefAdmin(exam, date);
  if (stored) return { ...stored, status: "generated" };

  return {
    date,
    exam,
    items,
    generatedAt: Date.now(),
    status: "generated",
  };
}

export type EnsureBriefsForDateOpts = {
  date?: string;
  /** Subset of exam category tags; default = all four. */
  exams?: Exam[];
  force?: boolean;
  userId?: string | null;
};

/** Pre-generate (or refresh) one brief per exam category for a date. */
export async function ensureBriefsForDate(
  opts: EnsureBriefsForDateOpts = {},
): Promise<{ date: string; results: CategoryBriefResult[] }> {
  const date = opts.date ?? todayKeyIst();
  const exams = opts.exams?.length ? opts.exams : ALL_EXAM_CATEGORIES;
  const results: CategoryBriefResult[] = [];

  for (const exam of exams) {
    try {
      const brief = await ensureDailyBrief(exam, date, {
        force: opts.force,
        userId: opts.userId,
      });
      results.push({
        exam,
        category: exam,
        status: brief.status,
        itemCount: brief.items.length,
        generatedAt: brief.generatedAt,
      });
    } catch (err) {
      results.push({
        exam,
        category: exam,
        status: "error",
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return { date, results };
}

export function parseExamCategoriesParam(raw: string | null | undefined): Exam[] | undefined {
  if (!raw?.trim()) return undefined;
  const parts = raw
    .split(/[,+\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const parsed: Exam[] = [];
  for (const p of parts) {
    const r = ExamEnum.safeParse(p);
    if (r.success && !parsed.includes(r.data)) parsed.push(r.data);
  }
  return parsed.length ? parsed : undefined;
}
