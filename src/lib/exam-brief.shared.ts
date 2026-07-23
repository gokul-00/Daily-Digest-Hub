import { z } from "zod";

export const ExamSchema = z.enum(["upsc", "banking", "ssc", "state_psc"]);
export type Exam = z.infer<typeof ExamSchema>;

export const RelevanceSchema = z.enum(["high", "med", "low", "skip"]);
export type Relevance = z.infer<typeof RelevanceSchema>;

export const McqSchema = z.object({
  q: z.string(),
  options: z.array(z.string()).min(2),
  answerIndex: z.number().int().nonnegative(),
  explanation: z.string(),
});

export const BriefItemSchema = z.object({
  id: z.string().min(1),
  headline: z.string().min(1),
  whatHappened: z.string(),
  whyItMatters: z.string(),
  examRelevance: z.object({
    upsc: RelevanceSchema,
    banking: RelevanceSchema,
    ssc: RelevanceSchema,
    state_psc: RelevanceSchema,
  }),
  topicTags: z.array(z.string()).default([]),
  staticLinks: z.array(z.string()).default([]),
  sources: z
    .array(
      z.object({
        url: z.string(),
        label: z.string(),
        publishedAt: z.string().optional(),
      }),
    )
    .default([]),
  mcq: McqSchema,
});

export type BriefItem = z.infer<typeof BriefItemSchema>;
export type MCQ = z.infer<typeof McqSchema>;

export type DailyBrief = {
  date: string;
  exam: Exam;
  items: BriefItem[];
  generatedAt: number;
};

export const EXAMS: { id: Exam; label: string; blurb: string }[] = [
  { id: "upsc", label: "UPSC / Civil Services", blurb: "polity, IR, environment, governance" },
  { id: "banking", label: "Banking (SBI / IBPS / RBI)", blurb: "economy, finance, banking awareness" },
  { id: "ssc", label: "SSC (CGL / CHSL)", blurb: "facts, awards, appointments, sports" },
  { id: "state_psc", label: "State PSC", blurb: "national + state-level current affairs" },
];

export function parseBriefItems(value: unknown): BriefItem[] {
  if (!Array.isArray(value)) return [];
  const items: BriefItem[] = [];
  for (const entry of value) {
    const parsed = BriefItemSchema.safeParse(entry);
    if (parsed.success) items.push(parsed.data);
  }
  return items;
}
