import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ArchiveIdSchema = z.object({ id: z.string().uuid() });

export const archivePile = createServerFn({ method: "POST" }).handler(async () => {
  const { archiveActivePile } = await import("./pile-archive.server");
  return archiveActivePile(null);
});

export const listPileArchives = createServerFn({ method: "GET" }).handler(async () => {
  const { listPileArchivesForUser } = await import("./pile-archive.server");
  const archives = await listPileArchivesForUser();
  return { archives };
});

export const getPileArchive = createServerFn({ method: "POST" })
  .validator((input: unknown) => ArchiveIdSchema.parse(input))
  .handler(async ({ data }) => {
    const { getPileArchiveById } = await import("./pile-archive.server");
    return getPileArchiveById(data.id);
  });
