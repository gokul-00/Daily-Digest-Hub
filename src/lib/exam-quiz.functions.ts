import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { QuizResultSchema } from "./exam-quiz.shared";

export const listExamQuiz = createServerFn({ method: "GET" }).handler(async () => {
  const { listExamQuizForUser } = await import("./exam-quiz.server");
  const results = await listExamQuizForUser(40);
  return { results };
});

export const saveExamQuiz = createServerFn({ method: "POST" })
  .validator((input: unknown) => QuizResultSchema.parse(input))
  .handler(async ({ data }) => {
    const { upsertExamQuizResult } = await import("./exam-quiz.server");
    const result = await upsertExamQuizResult(data);
    return { result };
  });

export const importExamQuiz = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ results: z.array(QuizResultSchema) }).parse(input))
  .handler(async ({ data }) => {
    const { importExamQuizResults } = await import("./exam-quiz.server");
    const results = await importExamQuizResults(data.results);
    return { results };
  });
