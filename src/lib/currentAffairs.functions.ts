import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  ExamEnum,
  ensureDailyBrief,
  type StoredBrief,
} from "./currentAffairs.server";
import { createSupabaseServerClient } from "./supabase/server";

export type { Brief, Exam, StoredBrief } from "./currentAffairs.server";

const InputSchema = z.object({
  exam: ExamEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  return { supabase, user };
}

async function readBrief(exam: z.infer<typeof ExamEnum>, date: string): Promise<StoredBrief | null> {
  await requireUser();
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("daily_briefs")
    .select("date, exam, items, generated_at")
    .eq("exam", exam)
    .eq("date", date)
    .maybeSingle();
  if (error || !data) return null;
  return {
    date: data.date as string,
    exam: data.exam as StoredBrief["exam"],
    items: data.items as StoredBrief["items"],
    generatedAt: new Date(data.generated_at as string).getTime(),
  };
}

export const getDailyBrief = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => readBrief(data.exam, data.date));

const ListInput = z.object({
  exam: ExamEnum,
  limit: z.number().int().min(1).max(60).optional(),
});

export const listBriefs = createServerFn({ method: "POST" })
  .validator((input: unknown) => ListInput.parse(input))
  .handler(async ({ data }) => {
    await requireUser();
    const supabase = createSupabaseServerClient();
    const { data: rows, error } = await supabase
      .from("daily_briefs")
      .select("date, generated_at, items")
      .eq("exam", data.exam)
      .order("date", { ascending: false })
      .limit(data.limit ?? 40);
    if (error || !rows) return [];
    return rows.map((r) => {
      const items = Array.isArray(r.items) ? (r.items as { headline?: string }[]) : [];
      const headlines = items
        .map((it) => (typeof it.headline === "string" ? it.headline.trim() : ""))
        .filter(Boolean);
      return {
        date: r.date as string,
        generatedAt: new Date(r.generated_at as string).getTime(),
        itemCount: items.length,
        overview: headlines.slice(0, 2).join(" · "),
      };
    });
  });

const MonthInput = z.object({
  exam: ExamEnum,
  yearMonth: z.string().regex(/^\d{4}-\d{2}$/),
});

export const listBriefsForMonth = createServerFn({ method: "POST" })
  .validator((input: unknown) => MonthInput.parse(input))
  .handler(async ({ data }) => {
    await requireUser();
    const supabase = createSupabaseServerClient();
    const from = `${data.yearMonth}-01`;
    const [y, m] = data.yearMonth.split("-").map(Number);
    const nextMonth =
      m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
    const { data: rows, error } = await supabase
      .from("daily_briefs")
      .select("date, exam, items, generated_at")
      .eq("exam", data.exam)
      .gte("date", from)
      .lt("date", nextMonth)
      .order("date", { ascending: false });
    if (error || !rows) return [];
    return rows.map((r) => ({
      date: r.date as string,
      exam: r.exam as StoredBrief["exam"],
      items: r.items as StoredBrief["items"],
      generatedAt: new Date(r.generated_at as string).getTime(),
    }));
  });

export const generateDailyBrief = createServerFn({ method: "POST" })
  .validator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const { user } = await requireUser();
    // Never force from the client — one brief per (date, exam) for all users.
    const result = await ensureDailyBrief(data.exam, data.date, {
      force: false,
      userId: user.id,
    });
    const { status: _status, ...brief } = result;
    return brief;
  });
