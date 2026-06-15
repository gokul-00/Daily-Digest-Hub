import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";

import { DigestBlockPage } from "@/components/digest/DigestBlockPage";
import { useAuth } from "@/hooks/use-auth";
import { getSession } from "@/lib/auth.functions";
import { getArtifact } from "@/lib/digest-artifacts.functions";
import { readLocalArtifacts, type DigestArtifact } from "@/lib/digest.shared";

export const Route = createFileRoute("/digest/$id")({
  beforeLoad: async () => {
    const { user } = await getSession();
    if (!user) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [{ title: "Edition — Later." }, { name: "description", content: "Your evening brief." }],
  }),
  component: DigestEditionPage,
});

function DigestEditionPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const fetchOne = useServerFn(getArtifact);
  const [artifact, setArtifact] = useState<DigestArtifact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!user?.id) return;

      setLoading(true);
      setError(null);

      try {
        const local = readLocalArtifacts(user.id).find((entry) => entry.id === id);
        if (local) {
          if (!cancelled) setArtifact(local);
          return;
        }

        const remote = await fetchOne({ data: { id } });
        if (!cancelled) {
          if (remote) setArtifact(remote);
          else setError("That edition could not be found.");
        }
      } catch {
        if (!cancelled) setError("Could not load that edition.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [fetchOne, id, user?.id]);

  if (loading) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-marginalia">
          Opening edition…
        </p>
      </main>
    );
  }

  if (error || !artifact) {
    return (
      <main className="safe-px flex min-h-[100dvh] items-center justify-center bg-background px-4">
        <div className="paper-card max-w-md rounded-lg p-8 text-center">
          <h1 className="font-display text-2xl text-ink">Edition not found</h1>
          <p className="mt-2 text-sm text-ink-soft">{error ?? "This brief may have been removed."}</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground hover:bg-accent"
          >
            Back to pile
          </Link>
        </div>
      </main>
    );
  }

  return <DigestBlockPage artifact={artifact} />;
}
