import { createFileRoute } from "@tanstack/react-router";

import {
  ensureBriefsForDate,
  parseExamCategoriesParam,
  todayKeyIst,
} from "@/lib/currentAffairs.server";

function authorizeCron(request: Request): Response | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== secret) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

async function handleCron(request: Request): Promise<Response> {
  const denied = authorizeCron(request);
  if (denied) return denied;

  const url = new URL(request.url);
  let force = url.searchParams.get("force") === "1" || url.searchParams.get("force") === "true";
  let date = url.searchParams.get("date") ?? undefined;
  let exams = parseExamCategoriesParam(url.searchParams.get("exams"));

  if (request.method === "POST") {
    try {
      const body = (await request.json()) as {
        force?: boolean;
        date?: string;
        exams?: string[] | string;
      };
      if (typeof body.force === "boolean") force = body.force;
      if (typeof body.date === "string") date = body.date;
      if (body.exams != null) {
        exams = parseExamCategoriesParam(
          Array.isArray(body.exams) ? body.exams.join(",") : body.exams,
        );
      }
    } catch {
      // empty / non-JSON body is fine — use query defaults
    }
  }

  const resolvedDate = date ?? todayKeyIst();
  const { date: runDate, results } = await ensureBriefsForDate({
    date: resolvedDate,
    exams,
    force,
  });

  const ok = results.every((r) => r.status !== "error");
  return Response.json(
    {
      ok,
      date: runDate,
      force,
      categories: results.map((r) => r.category),
      results,
    },
    { status: ok ? 200 : 207 },
  );
}

export const Route = createFileRoute("/api/cron/exam-briefs")({
  server: {
    handlers: {
      GET: async ({ request }) => handleCron(request),
      POST: async ({ request }) => handleCron(request),
    },
  },
});
