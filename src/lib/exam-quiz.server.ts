import { createSupabaseServerClient } from "./supabase/server";
import { QuizResultSchema, parseQuizResults, type QuizResult } from "./exam-quiz.shared";

export function isExamQuizTableMissing(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.message?.includes("Could not find the table") === true ||
    error.message?.includes("schema cache") === true ||
    error.message?.includes("exam_quiz_results") === true
  );
}

async function requireUser() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required.");
  return { supabase, user };
}

type DbRow = {
  date: string;
  exam: string;
  score: number;
  total: number;
  answered_at: string;
};

function rowToResult(row: DbRow): QuizResult | null {
  return (
    QuizResultSchema.safeParse({
      date: row.date,
      exam: row.exam,
      score: row.score,
      total: row.total,
      answeredAt: new Date(row.answered_at).getTime(),
    }).data ?? null
  );
}

export async function listExamQuizForUser(limit = 40): Promise<QuizResult[]> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase
    .from("exam_quiz_results")
    .select("date, exam, score, total, answered_at")
    .eq("user_id", user.id)
    .order("answered_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isExamQuizTableMissing(error)) return [];
    throw error;
  }

  const out: QuizResult[] = [];
  for (const row of (data ?? []) as DbRow[]) {
    const parsed = rowToResult(row);
    if (parsed) out.push(parsed);
  }
  return out;
}

export async function upsertExamQuizResult(result: QuizResult): Promise<QuizResult> {
  const parsed = QuizResultSchema.parse(result);
  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("exam_quiz_results").upsert(
    {
      user_id: user.id,
      date: parsed.date,
      exam: parsed.exam,
      score: parsed.score,
      total: parsed.total,
      answered_at: new Date(parsed.answeredAt).toISOString(),
    },
    { onConflict: "user_id,date,exam" },
  );
  if (error) {
    if (isExamQuizTableMissing(error)) {
      throw new Error("Quiz results table is missing. Apply migration 007_exam_quiz_results.sql.");
    }
    throw error;
  }
  return parsed;
}

export async function importExamQuizResults(results: QuizResult[]): Promise<QuizResult[]> {
  const clean = parseQuizResults(results);
  if (clean.length === 0) return listExamQuizForUser();

  const { supabase, user } = await requireUser();
  const { error } = await supabase.from("exam_quiz_results").upsert(
    clean.map((r) => ({
      user_id: user.id,
      date: r.date,
      exam: r.exam,
      score: r.score,
      total: r.total,
      answered_at: new Date(r.answeredAt).toISOString(),
    })),
    { onConflict: "user_id,date,exam" },
  );
  if (error && !isExamQuizTableMissing(error)) throw error;
  return listExamQuizForUser();
}
