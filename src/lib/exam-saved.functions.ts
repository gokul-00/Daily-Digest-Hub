import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { BriefItemSchema } from "./exam-brief.shared";

export const listExamSaved = createServerFn({ method: "GET" }).handler(async () => {
  const { listExamSavedForUser } = await import("./exam-saved.server");
  const items = await listExamSavedForUser();
  return { items };
});

export const saveExamItem = createServerFn({ method: "POST" })
  .validator((input: unknown) => BriefItemSchema.parse(input))
  .handler(async ({ data }) => {
    const { upsertExamSavedItem } = await import("./exam-saved.server");
    const item = await upsertExamSavedItem(data);
    return { item };
  });

export const removeExamSaved = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ id: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const { deleteExamSavedItem } = await import("./exam-saved.server");
    await deleteExamSavedItem(data.id);
    return { ok: true as const };
  });

export const importExamSaved = createServerFn({ method: "POST" })
  .validator((input: unknown) => z.object({ items: z.array(BriefItemSchema) }).parse(input))
  .handler(async ({ data }) => {
    const { importExamSavedItems } = await import("./exam-saved.server");
    const items = await importExamSavedItems(data.items);
    return { items };
  });
