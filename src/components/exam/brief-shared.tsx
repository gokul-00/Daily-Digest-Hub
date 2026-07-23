import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { listBriefs } from "@/lib/currentAffairs.functions";
import { SectionHeading } from "@/components/lists/SectionHeading";
import {
  formatSourceAge,
  isGovSource,
  isTier1Stale,
  TIER1_STALE_HOURS,
} from "@/lib/exam-sources";
import {
  useSaved,
  type BriefItem,
  type DailyBrief,
  type Exam,
  type Relevance,
} from "@/lib/exam-store";

export const EXAM_SHORT: Record<Exam, string> = {
  upsc: "UPSC",
  banking: "Bank",
  ssc: "SSC",
  state_psc: "State",
};

export type SavedApi = ReturnType<typeof useSaved>;

export type BriefEditionSummary = {
  date: string;
  generatedAt: number;
  itemCount: number;
  overview: string;
};

const REL_STYLE: Record<Relevance, string> = {
  high: "border-accent bg-accent/10 text-accent",
  med: "border-marginalia/60 bg-background/40 text-ink-soft",
  low: "border-border bg-background/40 text-marginalia",
  skip: "border-border bg-background/40 text-marginalia line-through",
};

export function formatBriefEditionTitle(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatBriefEditionShort(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function groupBriefsByMonth(rows: BriefEditionSummary[]): {
  key: string;
  heading: string;
  items: BriefEditionSummary[];
}[] {
  const map = new Map<string, BriefEditionSummary[]>();
  for (const row of rows) {
    const key = row.date.slice(0, 7);
    const list = map.get(key) ?? [];
    list.push(row);
    map.set(key, list);
  }
  return Array.from(map.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => ({
      key,
      heading: new Date(key + "-01T12:00:00").toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
      items,
    }));
}

export function BriefEditionCard({ edition }: { edition: BriefEditionSummary }) {
  return (
    <Link
      to="/exam/archive/$date"
      params={{ date: edition.date }}
      className="block w-full rounded-md border border-border/60 bg-background/40 px-4 py-3 text-left transition hover:border-border hover:bg-background/60"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-display text-base text-ink">
          Daily brief · {formatBriefEditionShort(edition.date)}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          {edition.itemCount} items · open
        </span>
      </div>
      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
        {formatBriefEditionTitle(edition.date)}
      </p>
      {edition.overview && (
        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{edition.overview}</p>
      )}
    </Link>
  );
}

export function BriefView({
  brief,
  savedApi,
  title = "Today's brief",
}: {
  brief: DailyBrief;
  savedApi: SavedApi;
  title?: string;
}) {
  const { toggle, isSaved } = savedApi;
  return (
    <section className="space-y-5">
      <div className="top-14 z-10 -mx-1 rounded-md bg-[color-mix(in_oklab,var(--background)_90%,transparent)] px-1 py-2 backdrop-blur-sm max-md:sticky sm:top-16 md:static md:mx-0 md:bg-transparent md:px-0 md:py-0 md:backdrop-blur-none">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
          {brief.items.length} items · ~{brief.items.length}-min · {EXAM_SHORT[brief.exam]}
        </p>
        <h3 className="mt-0.5 font-display text-xl tracking-tight text-ink sm:text-2xl">{title}</h3>
      </div>
      <ol className="space-y-5">
        {brief.items.map((item, i) => (
          <li key={item.id} className="paper-card rounded-lg p-4 sm:p-5 md:p-6">
            <ItemCard
              item={item}
              exam={brief.exam}
              index={i + 1}
              saved={isSaved(item.id)}
              onSave={() => toggle(item)}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

function ItemCard({
  item,
  exam,
  index,
  saved,
  onSave,
}: {
  item: BriefItem;
  exam: Exam;
  index: number;
  saved: boolean;
  onSave: () => void;
}) {
  const [showMcq, setShowMcq] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const orderedExams: Exam[] = [
    exam,
    ...(["upsc", "banking", "ssc", "state_psc"] as Exam[]).filter((e) => e !== exam),
  ];

  return (
    <div className="grid grid-cols-[2rem_1fr] gap-3 sm:grid-cols-[2.5rem_1fr] sm:gap-4">
      <span className="font-display text-2xl leading-none text-accent">
        {index.toString().padStart(2, "0")}
      </span>
      <div className="min-w-0 space-y-3">
        <h4 className="font-display text-lg leading-snug text-ink sm:text-xl">{item.headline}</h4>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
            What happened
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{item.whatHappened}</p>
        </div>

        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
            Why it matters
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.whyItMatters}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSave}
            className={
              "touch-target rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition " +
              (saved
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-ink-soft hover:text-ink")
            }
          >
            {saved ? "★ Saved" : "☆ Save"}
          </button>
          <button
            type="button"
            onClick={() => setShowMcq((v) => !v)}
            className="touch-target rounded-md border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
          >
            {showMcq ? "Hide MCQ" : "MCQ"}
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((v) => !v)}
            className="touch-target rounded-md border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
          >
            {showDetails ? "Hide details" : "Details"}
          </button>
        </div>

        {showMcq && <MCQBlock mcq={item.mcq} />}

        {showDetails && (
          <div className="space-y-3 border-t border-border/40 pt-3">
            <ul className="flex flex-wrap gap-1.5">
              {orderedExams.map((e) => {
                const r = item.examRelevance[e];
                return (
                  <li
                    key={e}
                    className={
                      "rounded-sm border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em] " +
                      REL_STYLE[r]
                    }
                  >
                    {EXAM_SHORT[e]} {r}
                  </li>
                );
              })}
            </ul>

            {item.staticLinks.length > 0 && (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
                  Syllabus
                </p>
                <p className="mt-1 font-display text-sm italic text-ink">
                  {item.staticLinks.join(" · ")}
                </p>
              </div>
            )}

            {item.topicTags.length > 0 && (
              <ul className="flex flex-wrap gap-1.5">
                {item.topicTags.map((t) => (
                  <li
                    key={t}
                    className="rounded-sm border border-border/70 bg-background/40 px-2 py-0.5 font-mono text-[10px] lowercase tracking-wide text-ink-soft"
                  >
                    #{t}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {item.sources.length > 0 && (
          <div className="border-t border-border/30 pt-2">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-[0.18em] text-marginalia">
              Citations
            </p>
            <ol className="flex flex-wrap gap-1">
              {item.sources.map((s, i) => {
                const isGov = isGovSource(s.label, s.url);
                const age = s.publishedAt ? formatSourceAge(s.publishedAt) : null;
                const stale = Boolean(isGov && s.publishedAt && isTier1Stale(s.publishedAt));
                const titleParts = [s.url];
                if (s.publishedAt) titleParts.push(`Published ${s.publishedAt}`);
                if (stale) titleParts.push(`Tier 1 source older than ${TIER1_STALE_HOURS}h`);
                return (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      title={titleParts.join(" · ")}
                      className={
                        "inline-flex max-w-full items-center gap-1 rounded border bg-background/30 px-1.5 py-0.5 font-mono text-[10px] transition hover:border-accent hover:text-accent " +
                        (stale
                          ? "border-amber-600/70 text-amber-800 dark:text-amber-400"
                          : "border-border/70 text-marginalia")
                      }
                    >
                      <span className="font-semibold text-ink/80">[{i + 1}]</span>
                      {isGov && (
                        <span className="rounded-sm bg-accent/15 px-1 text-[8px] font-semibold uppercase tracking-wider text-accent">
                          Gov
                        </span>
                      )}
                      {stale && (
                        <span className="rounded-sm bg-amber-500/20 px-1 text-[8px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                          Stale
                        </span>
                      )}
                      <span className="max-w-[140px] truncate sm:max-w-[180px]">{s.label}</span>
                      {age && <span className="shrink-0 opacity-80">{age}</span>}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function MCQBlock({ mcq }: { mcq: BriefItem["mcq"] }) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="mt-1 rounded-md border border-border/70 bg-background/40 p-3">
      <p className="font-display text-sm text-ink">{mcq.q}</p>
      <ul className="mt-2 space-y-1">
        {mcq.options.map((opt, i) => {
          const chosen = choice === i;
          const correct = i === mcq.answerIndex;
          const revealed = choice !== null;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => setChoice(i)}
                disabled={revealed}
                className={
                  "w-full rounded-md border px-3 py-2 text-left font-mono text-[12px] transition " +
                  (revealed
                    ? correct
                      ? "border-accent bg-accent/10 text-ink"
                      : chosen
                        ? "border-destructive/60 bg-destructive/10 text-ink"
                        : "border-border text-ink-soft"
                    : "border-border text-ink hover:border-ink/50")
                }
              >
                {String.fromCharCode(65 + i)}. {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {choice !== null && (
        <p className="mt-2 font-mono text-[11px] text-ink-soft">→ {mcq.explanation}</p>
      )}
    </div>
  );
}

export function ArchiveView({ exam }: { exam: Exam }) {
  const list = useServerFn(listBriefs);
  const [rows, setRows] = useState<BriefEditionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    list({ data: { exam, limit: 60 } })
      .then((r) => {
        if (!cancelled) setRows((r ?? []) as BriefEditionSummary[]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exam, list]);

  const byMonth = useMemo(() => groupBriefsByMonth(rows), [rows]);

  if (loading) {
    return (
      <section>
        <SectionHeading title="Past editions" />
        <p className="mt-4 font-mono text-xs text-ink-soft">Loading editions…</p>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section>
        <SectionHeading title="Past editions" count={0} />
        <p className="mt-4 text-sm text-ink-soft">
          No past briefs yet. Once a daily edition is generated it shows up here.
        </p>
      </section>
    );
  }

  return (
    <section>
      <SectionHeading title="Past editions" count={rows.length} />
      {showAll ? (
        <div className="mt-4 space-y-8">
          {byMonth.map((group) => (
            <div key={group.key}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia">
                {group.heading}
              </p>
              <ul className="mt-3 space-y-2">
                {group.items.map((edition) => (
                  <li key={edition.date}>
                    <BriefEditionCard edition={edition} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setShowAll(false)}
            className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
          >
            Show fewer editions
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <ul className="space-y-2">
            {rows.slice(0, 5).map((edition) => (
              <li key={edition.date}>
                <BriefEditionCard edition={edition} />
              </li>
            ))}
          </ul>
          {rows.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
            >
              View all {rows.length} editions
            </button>
          )}
        </div>
      )}
    </section>
  );
}
