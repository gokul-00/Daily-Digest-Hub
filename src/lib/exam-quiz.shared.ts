import { z } from "zod";

import { ExamSchema } from "./exam-brief.shared";

export const QuizResultSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exam: ExamSchema,
  score: z.number().int().nonnegative(),
  total: z.number().int().positive(),
  answeredAt: z.number().int().nonnegative(),
});

export type QuizResult = z.infer<typeof QuizResultSchema>;

export function parseQuizResults(value: unknown): QuizResult[] {
  if (!Array.isArray(value)) return [];
  const items: QuizResult[] = [];
  for (const entry of value) {
    const parsed = QuizResultSchema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
  }
  return items;
}
