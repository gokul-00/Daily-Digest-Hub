import { isAiUsageTableMissing, summarizeAiUsage, type AiUsageMetrics } from "./ai-usage";
import { createSupabaseServerClient } from "./supabase/server";

type DbUsageRow = {
  model: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
  dump_count: number;
  url_count: number;
  prompt_chars: number;
  duration_ms: number | null;
  digest_id: string | null;
  created_at: string;
};

function rowToMetrics(row: DbUsageRow): AiUsageMetrics {
  return {
    model: row.model,
    inputTokens: row.input_tokens,
    outputTokens: row.output_tokens,
    totalTokens: row.total_tokens,
    estimatedCostUsd: Number(row.estimated_cost_usd),
    dumpCount: row.dump_count,
    urlCount: row.url_count,
    promptChars: row.prompt_chars,
    durationMs: row.duration_ms ?? 0,
  };
}

export async function loadAiUsageSummary() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { summary: summarizeAiUsage([]) };
  }

  const { data, error } = await supabase
    .from("ai_usage_events")
    .select(
      "model, input_tokens, output_tokens, total_tokens, estimated_cost_usd, dump_count, url_count, prompt_chars, duration_ms, digest_id, created_at",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    if (isAiUsageTableMissing(error)) {
      return { summary: summarizeAiUsage([]) };
    }
    throw new Error("Could not load AI usage metrics.");
  }

  const rows = (data ?? []) as DbUsageRow[];
  return { summary: summarizeAiUsage(rows.map(rowToMetrics)) };
}

export async function fetchUsageForDigest(digestId: string): Promise<AiUsageMetrics | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("ai_usage_events")
    .select(
      "model, input_tokens, output_tokens, total_tokens, estimated_cost_usd, dump_count, url_count, prompt_chars, duration_ms, digest_id, created_at",
    )
    .eq("user_id", user.id)
    .eq("digest_id", digestId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    if (isAiUsageTableMissing(error)) return null;
    throw new Error("Could not load AI usage for this edition.");
  }

  return data ? rowToMetrics(data as DbUsageRow) : null;
}

export async function recordAiUsageEvent(opts: {
  userId: string;
  digestId: string | null;
  usage: AiUsageMetrics;
  operation?: "generate_digest" | "generate_brief";
}): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("ai_usage_events").insert({
    user_id: opts.userId,
    digest_id: opts.digestId,
    operation: opts.operation ?? "generate_digest",
    model: opts.usage.model,
    input_tokens: opts.usage.inputTokens,
    output_tokens: opts.usage.outputTokens,
    total_tokens: opts.usage.totalTokens,
    estimated_cost_usd: opts.usage.estimatedCostUsd,
    dump_count: opts.usage.dumpCount,
    url_count: opts.usage.urlCount,
    prompt_chars: opts.usage.promptChars,
    duration_ms: opts.usage.durationMs,
  });

  if (error && !isAiUsageTableMissing(error)) {
    console.warn("[AI usage] Could not persist usage event:", error.message);
  }
}
