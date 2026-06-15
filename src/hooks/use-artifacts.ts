import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";

import { useAuth } from "@/hooks/use-auth";
import {
  type DigestArtifact,
  type DigestArtifactSummary,
  readLocalArtifacts,
  summariesFromArtifacts,
  writeLocalArtifact,
} from "@/lib/digest.shared";
import { getArtifact, listArtifacts } from "@/lib/digest-artifacts.functions";

function artifactsQueryKey(userId: string) {
  return ["artifacts", userId] as const;
}

export function useArtifacts() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listArtifacts);
  const fetchOne = useServerFn(getArtifact);

  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: userId ? artifactsQueryKey(userId) : ["artifacts", "anonymous"],
    queryFn: async (): Promise<DigestArtifactSummary[]> => {
      if (!userId) return [];
      try {
        const { artifacts: cloud } = await fetchList({ data: {} });
        if (cloud.length > 0) return cloud;
      } catch {
        // fall through to local
      }
      return summariesFromArtifacts(readLocalArtifacts(userId));
    },
    enabled: !!userId,
  });

  const saveLocally = useCallback(
    (artifact: DigestArtifact) => {
      if (!userId) return;
      writeLocalArtifact(userId, artifact);
      queryClient.setQueryData<DigestArtifactSummary[]>(artifactsQueryKey(userId), (prev = []) => {
        const summary = {
          id: artifact.id,
          createdAt: artifact.createdAt,
          title: artifact.title,
          dumpCount: artifact.dumpCount,
          overview: artifact.overview ?? artifact.digest.overview,
        };
        return [summary, ...prev.filter((a) => a.id !== summary.id)];
      });
    },
    [queryClient, userId],
  );

  const loadArtifact = useCallback(
    async (id: string): Promise<DigestArtifact | null> => {
      if (!userId) return null;

      const local = readLocalArtifacts(userId).find((a) => a.id === id);
      if (local) return local;

      try {
        const remote = await fetchOne({ data: { id } });
        return remote;
      } catch {
        return local ?? null;
      }
    },
    [fetchOne, userId],
  );

  const refresh = useCallback(() => {
    if (userId) void queryClient.invalidateQueries({ queryKey: artifactsQueryKey(userId) });
  }, [queryClient, userId]);

  return {
    artifacts,
    isLoading: authLoading || isLoading,
    saveLocally,
    loadArtifact,
    refresh,
  };
}
