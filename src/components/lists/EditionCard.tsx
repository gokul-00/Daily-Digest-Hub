import { Link } from "@tanstack/react-router";

import type { DigestArtifactSummary } from "@/lib/digest.shared";
import { formatArchiveDateHeading } from "@/lib/pile-archive.shared";

type EditionCardProps = {
  artifact: DigestArtifactSummary;
};

export function EditionCard({ artifact }: EditionCardProps) {
  const dateLabel = formatArchiveDateHeading(artifact.createdAt);

  return (
    <Link
      to="/digest/$id"
      params={{ id: artifact.id }}
      className="block w-full rounded-md border border-border/60 bg-background/40 px-4 py-3 text-left transition hover:border-border hover:bg-background/60"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-base text-ink">{artifact.title}</span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          {artifact.dumpCount} items · open
        </span>
      </div>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
        {dateLabel}
      </p>
      {artifact.overview && (
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{artifact.overview}</p>
      )}
    </Link>
  );
}
