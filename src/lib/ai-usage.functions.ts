import { createServerFn } from "@tanstack/react-start";

export const getAiUsageSummary = createServerFn({ method: "GET" }).handler(async () => {
  const { loadAiUsageSummary } = await import("./ai-usage.server");
  return loadAiUsageSummary();
});
