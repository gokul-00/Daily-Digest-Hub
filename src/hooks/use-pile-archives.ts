import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { useAuth } from "@/hooks/use-auth";
import { createLocalPileArchive, readLocalPileArchives, summariesFromArchives } from "@/lib/pile-archive.local";
import type { PileArchive, PileArchiveSummary } from "@/lib/pile-archive.shared";
import { listPileArchives, getPileArchive } from "@/lib/pile-archive.functions";

function pileArchivesQueryKey(userId: string) {
  return ["pile-archives", userId] as const;
}

export function usePileArchives() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listPileArchives);
  const fetchOne = useServerFn(getPileArchive);

  const { data: archives = [], isLoading } = useQuery({
    queryKey: userId ? pileArchivesQueryKey(userId) : ["pile-archives", "anonymous"],
    queryFn: async (): Promise<PileArchiveSummary[]> => {
      if (!userId) return [];
      try {
        const { archives: cloud } = await fetchList();
        if (cloud.length > 0) return cloud;
      } catch {
        // fall through to local
      }
      return summariesFromArchives(readLocalPileArchives(userId));
    },
    enabled: !!userId,
  });

  const loadArchive = async (id: string): Promise<PileArchive | null> => {
    if (!userId) return null;
    const local = readLocalPileArchives(userId).find((a) => a.id === id);
    if (local) return local;
    try {
      return await fetchOne({ data: { id } });
    } catch {
      return local ?? null;
    }
  };

  const refresh = () => {
    if (userId) void queryClient.invalidateQueries({ queryKey: pileArchivesQueryKey(userId) });
  };

  return {
    archives,
    isLoading: authLoading || isLoading,
    loadArchive,
    refresh,
  };
}

export { pileArchivesQueryKey };
