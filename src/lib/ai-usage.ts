import type { LanguageModelUsage } from "ai";

/** USD per 1M tokens — update when Anthropic pricing changes. */
const MODEL_PRICING_USD_PER_M: Record<string, { input: number; output: number }> = {
  "claude-haiku-4-5": { input: 1, output: 5 },
};

export type AiUsageMetrics = {
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  dumpCount: number;
  urlCount: number;
  promptChars: number;
  durationMs: number;
};

export type AiUsageSummary = {
  generationCount: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  avgTokensPerGeneration: number;
  avgCostPerGeneration: number;
};

export function estimateCostUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
): number {
  const pricing = MODEL_PRICING_USD_PER_M[model] ?? { input: 1, output: 5 };
  return (inputTokens / 1_000_000) * pricing.input + (outputTokens / 1_000_000) * pricing.output;
}

export function buildAiUsageMetrics(opts: {
  model: string;
  usage: LanguageModelUsage;
  dumpCount: number;
  urlCount: number;
  promptChars: number;
  durationMs: number;
}): AiUsageMetrics {
  const inputTokens = opts.usage.inputTokens ?? 0;
  const outputTokens = opts.usage.outputTokens ?? 0;
  const totalTokens = opts.usage.totalTokens ?? inputTokens + outputTokens;

  return {
    model: opts.model,
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostUsd: estimateCostUsd(opts.model, inputTokens, outputTokens),
    dumpCount: opts.dumpCount,
    urlCount: opts.urlCount,
    promptChars: opts.promptChars,
    durationMs: opts.durationMs,
  };
}

export function summarizeAiUsage(
  rows: Pick<
    AiUsageMetrics,
    "inputTokens" | "outputTokens" | "totalTokens" | "estimatedCostUsd"
  >[],
): AiUsageSummary {
  const generationCount = rows.length;
  if (generationCount === 0) {
    return {
      generationCount: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      totalCostUsd: 0,
      avgTokensPerGeneration: 0,
      avgCostPerGeneration: 0,
    };
  }

  const totalInputTokens = rows.reduce((sum, row) => sum + row.inputTokens, 0);
  const totalOutputTokens = rows.reduce((sum, row) => sum + row.outputTokens, 0);
  const totalTokens = rows.reduce((sum, row) => sum + row.totalTokens, 0);
  const totalCostUsd = rows.reduce((sum, row) => sum + row.estimatedCostUsd, 0);

  return {
    generationCount,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    totalCostUsd,
    avgTokensPerGeneration: Math.round(totalTokens / generationCount),
    avgCostPerGeneration: totalCostUsd / generationCount,
  };
}

export function formatUsd(amount: number): string {
  if (amount < 0.0001) return "<$0.0001";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  return `$${amount.toFixed(3)}`;
}

export function formatAiUsageLine(usage: AiUsageMetrics): string {
  return `${usage.totalTokens.toLocaleString()} tokens · ${formatUsd(usage.estimatedCostUsd)} · ${(usage.durationMs / 1000).toFixed(1)}s`;
}

export function isAiUsageTableMissing(error: { code?: string; message?: string } | null): boolean {
  return (
    error?.code === "PGRST205" ||
    error?.message?.includes("Could not find the table") === true
  );
}
