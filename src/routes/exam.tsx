import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  generateDailyBrief,
  getDailyBrief,
  listBriefs,
  listBriefsForMonth,
} from "@/lib/currentAffairs.functions";
import { getSession } from "@/lib/auth.functions";
import {
  formatSourceAge,
  isGovSource,
  isTier1Stale,
  TIER1_STALE_HOURS,
} from "@/lib/exam-sources";
import {
  EXAMS,
  saveQuizResult,
  todayKey,
  useExamProfile,
  useSaved,
  type BriefItem,
  type DailyBrief,
  type Exam,
  type Relevance,
} from "@/lib/exam-store";

export const Route = createFileRoute("/exam")({
  beforeLoad: async () => {
    const { user } = await getSession();
    if (!user) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "ExamPulse — 10-minute daily current affairs for aspirants" },
      {
        name: "description",
        content:
          "A 10-minute daily current-affairs brief tailored to UPSC, Banking, SSC and State PSC aspirants — with exam relevance tags, static syllabus links, and revision MCQs.",
      },
      { property: "og:title", content: "ExamPulse — daily current affairs, exam-tagged" },
      {
        property: "og:description",
        content:
          "Filtered, ranked and syllabus-linked current affairs for competitive exam aspirants.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ExamPage,
});

type Tab = "today" | "quiz" | "saved" | "archive" | "month";

function ExamPage() {
  const { profile, save, clear, hydrated } = useExamProfile();
  const [tab, setTab] = useState<Tab>("today");
  const [dateLine, setDateLine] = useState("");
  useEffect(() => {
    setDateLine(
      new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }),
    );
  }, []);

  return (
    <main className="safe-pt safe-pb safe-px min-h-[100dvh] px-5 pb-32 pt-8 sm:px-10 md:pt-12">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="flex items-baseline justify-between font-mono text-xs uppercase tracking-[0.22em] text-marginalia">
            <Link to="/" className="hover:text-accent" aria-label="Back to Later">
              ← later
            </Link>
            <span suppressHydrationWarning>{dateLine}</span>
          </div>
          <div className="mt-3 h-px w-full rule-line" />
          <h1 className="mt-6 font-display text-4xl leading-[0.95] tracking-tight text-ink sm:text-6xl">
            ExamPulse<span className="text-accent">.</span>
          </h1>
          <p className="mt-3 max-w-xl font-display text-base italic text-ink-soft sm:text-lg">
            Ten-minute daily current affairs — filtered, ranked and syllabus-linked for your exam.
          </p>
        </header>

        {!hydrated ? null : !profile ? (
          <Onboarding onSave={(exam) => save({ exam })} />
        ) : (
          <>
            <TabBar tab={tab} setTab={setTab} exam={profile.exam} onChangeExam={clear} />
            {tab === "today" && <TodayView exam={profile.exam} />}
            {tab === "quiz" && <QuizView exam={profile.exam} />}
            {tab === "saved" && <SavedView exam={profile.exam} />}
            {tab === "archive" && <ArchiveView exam={profile.exam} />}
            {tab === "month" && <MonthView exam={profile.exam} />}
          </>
        )}

        <footer className="mt-20 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
          <span>— evening edition —</span>
          <span>profile & saved on this device</span>
        </footer>
      </div>
    </main>
  );
}

function Onboarding({ onSave }: { onSave: (exam: Exam) => void }) {
  const [pick, setPick] = useState<Exam | null>(null);
  return (
    <section className="paper-card rounded-lg p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">Step 01</p>
      <h2 className="mt-2 font-display text-2xl tracking-tight text-ink sm:text-3xl">
        Which exam are you preparing for?
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Your daily brief will be ranked and filtered for this exam. You can switch later.
      </p>
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {EXAMS.map((e) => {
          const active = pick === e.id;
          return (
            <li key={e.id}>
              <button
                type="button"
                onClick={() => setPick(e.id)}
                className={
                  "w-full rounded-md border px-4 py-3 text-left transition " +
                  (active
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-border bg-background/40 hover:border-ink/50")
                }
              >
                <div className="font-display text-lg leading-tight">{e.label}</div>
                <div
                  className={
                    "mt-1 font-mono text-[10px] uppercase tracking-[0.18em] " +
                    (active ? "text-primary-foreground/70" : "text-marginalia")
                  }
                >
                  {e.blurb}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => pick && onSave(pick)}
        disabled={!pick}
        className="mt-6 rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Start reading →
      </button>
    </section>
  );
}

function TabBar({
  tab,
  setTab,
  exam,
  onChangeExam,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  exam: Exam;
  onChangeExam: () => void;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "quiz", label: "Quiz" },
    { id: "saved", label: "Saved" },
    { id: "archive", label: "Archive" },
    { id: "month", label: "Month" },
  ];
  const examLabel = EXAMS.find((e) => e.id === exam)?.label ?? exam;
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              type="button"
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition " +
                (active
                  ? "border-ink bg-ink text-primary-foreground"
                  : "border-border bg-background/40 text-ink-soft hover:text-ink")
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onChangeExam}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia hover:text-accent"
      >
        {examLabel} · change
      </button>
    </div>
  );
}

function TodayView({ exam }: { exam: Exam }) {
  const date = todayKey();
  const get = useServerFn(getDailyBrief);
  const run = useServerFn(generateDailyBrief);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setChecking(true);
    get({ data: { exam, date } })
      .then((b) => {
        if (!cancelled) setBrief(b as DailyBrief | null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exam, date, get]);

  async function generate() {
    setError(null);
    setLoading(true);
    try {
      const result = await run({ data: { exam, date } });
      setBrief(result as DailyBrief);
    } catch (err) {
      setError((err as Error).message ?? "Failed to generate today's brief.");
    } finally {
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="font-mono text-xs text-ink-soft">Fetching today's brief…</p>
      </section>
    );
  }

  if (!brief) {
    return (
      <section className="paper-card rounded-lg p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
          Evening edition
        </p>
        <h3 className="mt-2 font-display text-2xl tracking-tight text-ink sm:text-3xl">
          Compose today's 10-minute brief
        </h3>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          One shared brief per exam per day. Cron usually builds it in the morning — if it is
          missing, the first generate creates it and every user gets that same edition.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-5 rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? "Composing (30–60s)…" : "Generate today's brief"}
        </button>
        {error && <p className="mt-4 font-mono text-sm text-destructive">{error}</p>}
      </section>
    );
  }

  return <BriefView brief={brief} />;
}

function BriefView({
  brief,
  onRegenerate,
  loading,
  error,
  title = "Today's brief",
}: {
  brief: DailyBrief;
  onRegenerate?: () => void;
  loading?: boolean;
  error?: string | null;
  title?: string;
}) {
  const { toggle, isSaved } = useSaved();
  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
            {brief.items.length} items · ~{brief.items.length}-min read
          </p>
          <h3 className="mt-1 font-display text-2xl tracking-tight text-ink">{title}</h3>
        </div>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="rounded-md border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink disabled:opacity-40"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>
      {error && <p className="font-mono text-sm text-destructive">{error}</p>}
      <ol className="space-y-6">
        {brief.items.map((item, i) => (
          <li key={item.id} className="paper-card rounded-lg p-5 sm:p-6">
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

const REL_STYLE: Record<Relevance, string> = {
  high: "border-accent bg-accent/10 text-accent",
  med: "border-marginalia/60 bg-background/40 text-ink-soft",
  low: "border-border bg-background/40 text-marginalia",
  skip: "border-border bg-background/40 text-marginalia line-through",
};

const EXAM_SHORT: Record<Exam, string> = {
  upsc: "UPSC",
  banking: "Bank",
  ssc: "SSC",
  state_psc: "State",
};

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
              Syllabus anchor
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

        {item.sources.length > 0 && (
          <div className="border-t border-border/40 pt-2">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia">
              Citations
            </p>
            <ol className="flex flex-wrap gap-1.5">
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
                        "inline-flex items-center gap-1 rounded-md border bg-background/40 px-2 py-1 font-mono text-[11px] transition hover:border-accent hover:text-accent " +
                        (stale
                          ? "border-amber-600/70 text-amber-800 dark:text-amber-400"
                          : "border-border text-ink-soft")
                      }
                    >
                      <span className="font-semibold text-ink">[{i + 1}]</span>
                      {isGov && (
                        <span className="rounded-sm bg-accent/15 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-accent">
                          Gov
                        </span>
                      )}
                      {stale && (
                        <span className="rounded-sm bg-amber-500/20 px-1 py-px text-[9px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-400">
                          Stale
                        </span>
                      )}
                      <span className="max-w-[220px] truncate">{s.label}</span>
                      {age && (
                        <span
                          className={
                            "shrink-0 text-[10px] " + (stale ? "text-amber-700 dark:text-amber-400" : "text-marginalia")
                          }
                        >
                          {age}
                        </span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={onSave}
            className={
              "rounded-md border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition " +
              (saved
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border text-ink-soft hover:text-ink")
            }
          >
            {saved ? "★ Saved" : "☆ Save to revise"}
          </button>
          <button
            type="button"
            onClick={() => setShowMcq((v) => !v)}
            className="rounded-md border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
          >
            {showMcq ? "Hide MCQ" : "See MCQ"}
          </button>
        </div>

        {showMcq && <MCQBlock mcq={item.mcq} />}
      </div>
    </div>
  );
}

function MCQBlock({ mcq }: { mcq: BriefItem["mcq"] }) {
  const [choice, setChoice] = useState<number | null>(null);
  return (
    <div className="mt-2 rounded-md border border-border/70 bg-background/40 p-3">
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

function QuizView({ exam }: { exam: Exam }) {
  const date = todayKey();
  const get = useServerFn(getDailyBrief);
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    get({ data: { exam, date } })
      .then((b) => {
        if (!cancelled) setBrief(b as DailyBrief | null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exam, date, get]);

  const questions = useMemo(() => {
    if (!brief) return [];
    const ranked = [...brief.items].sort((a, b) => {
      const order: Relevance[] = ["high", "med", "low", "skip"];
      return order.indexOf(a.examRelevance[exam]) - order.indexOf(b.examRelevance[exam]);
    });
    return ranked.slice(0, 5).map((it) => ({ id: it.id, headline: it.headline, mcq: it.mcq }));
  }, [brief, exam]);

  if (loading) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="font-mono text-xs text-ink-soft">Loading…</p>
      </section>
    );
  }

  if (!brief) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          Generate today's brief first — the quiz pulls from those items.
        </p>
      </section>
    );
  }

  const score = questions.reduce(
    (n, q, i) => (answers[i] === q.mcq.answerIndex ? n + 1 : n),
    0,
  );

  function submit() {
    setSubmitted(true);
    saveQuizResult({
      date,
      exam,
      score,
      total: questions.length,
      answeredAt: Date.now(),
    });
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
          Revision quiz
        </p>
        <h3 className="mt-1 font-display text-2xl tracking-tight text-ink">
          5 questions from today
        </h3>
      </div>
      <ol className="space-y-4">
        {questions.map((q, i) => (
          <li key={q.id} className="paper-card rounded-lg p-5">
            <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
              Q{i + 1} · {q.headline}
            </p>
            <p className="mb-3 font-display text-base text-ink">{q.mcq.q}</p>
            <ul className="space-y-1.5">
              {q.mcq.options.map((opt, j) => {
                const chosen = answers[i] === j;
                const correct = j === q.mcq.answerIndex;
                const reveal = submitted;
                return (
                  <li key={j}>
                    <button
                      type="button"
                      onClick={() => !submitted && setAnswers({ ...answers, [i]: j })}
                      disabled={submitted}
                      className={
                        "w-full rounded-md border px-3 py-2 text-left font-mono text-[12px] transition " +
                        (reveal
                          ? correct
                            ? "border-accent bg-accent/10 text-ink"
                            : chosen
                              ? "border-destructive/60 bg-destructive/10 text-ink"
                              : "border-border text-ink-soft"
                          : chosen
                            ? "border-ink bg-ink text-primary-foreground"
                            : "border-border text-ink hover:border-ink/50")
                      }
                    >
                      {String.fromCharCode(65 + j)}. {opt}
                    </button>
                  </li>
                );
              })}
            </ul>
            {submitted && (
              <p className="mt-2 font-mono text-[11px] text-ink-soft">→ {q.mcq.explanation}</p>
            )}
          </li>
        ))}
      </ol>
      {!submitted ? (
        <button
          type="button"
          onClick={submit}
          disabled={Object.keys(answers).length < questions.length}
          className="rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Submit ({Object.keys(answers).length}/{questions.length})
        </button>
      ) : (
        <div className="paper-card rounded-lg p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">Score</p>
          <p className="mt-1 font-display text-3xl text-ink">
            {score} <span className="text-ink-soft">/ {questions.length}</span>
          </p>
        </div>
      )}
    </section>
  );
}

function SavedView({ exam: _exam }: { exam: Exam }) {
  const { saved, remove, hydrated } = useSaved();
  if (!hydrated) return null;
  if (saved.length === 0) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          Nothing saved yet. Hit ★ on any item in Today's brief to revise later.
        </p>
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <h3 className="font-display text-2xl tracking-tight text-ink">Saved for revision</h3>
      <ol className="space-y-3">
        {saved.map((item) => (
          <li key={item.id} className="paper-card rounded-lg p-5">
            <div className="flex items-start justify-between gap-3">
              <h4 className="font-display text-lg leading-snug text-ink">{item.headline}</h4>
              <button
                type="button"
                onClick={() => remove(item.id)}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia hover:text-destructive"
              >
                Remove
              </button>
            </div>
            <p className="mt-2 text-sm text-ink-soft">{item.whyItMatters}</p>
            {item.staticLinks.length > 0 && (
              <p className="mt-2 font-display text-sm italic text-ink">
                {item.staticLinks.join(" · ")}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function MonthView({ exam }: { exam: Exam }) {
  const list = useServerFn(listBriefsForMonth);
  const [briefs, setBriefs] = useState<DailyBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    let cancelled = false;
    setLoading(true);
    list({ data: { exam, yearMonth: ym } })
      .then((rows) => {
        if (!cancelled) setBriefs((rows ?? []) as unknown as DailyBrief[]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exam, list]);

  const dedup = useMemo(() => {
    const seen = new Set<string>();
    const items: BriefItem[] = [];
    for (const b of briefs) {
      for (const it of b.items) {
        const key = it.headline
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim()
          .slice(0, 60);
        if (seen.has(key)) continue;
        seen.add(key);
        if (it.examRelevance[exam] === "high" || it.examRelevance[exam] === "med") {
          items.push(it);
        }
      }
    }
    return items;
  }, [briefs, exam]);

  if (loading) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="font-mono text-xs text-ink-soft">Loading…</p>
      </section>
    );
  }

  if (briefs.length === 0) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          No briefs this month yet. Once daily briefs are generated they'll roll up here.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
          {briefs.length} briefs · {dedup.length} exam-worthy items
        </p>
        <h3 className="mt-1 font-display text-2xl tracking-tight text-ink">Monthly rollup</h3>
      </div>
      <ol className="space-y-3">
        {dedup.map((item) => (
          <li key={item.id} className="paper-card rounded-lg p-5">
            <h4 className="font-display text-base leading-snug text-ink">{item.headline}</h4>
            <p className="mt-1 text-sm text-ink-soft">{item.whyItMatters}</p>
            {item.staticLinks.length > 0 && (
              <p className="mt-2 font-mono text-[11px] text-marginalia">
                {item.staticLinks.join(" · ")}
              </p>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

function ArchiveView({ exam }: { exam: Exam }) {
  const list = useServerFn(listBriefs);
  const get = useServerFn(getDailyBrief);
  const [rows, setRows] = useState<{ date: string; generatedAt: number; itemCount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDate, setOpenDate] = useState<string | null>(null);
  const [openBrief, setOpenBrief] = useState<DailyBrief | null>(null);
  const [openLoading, setOpenLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    list({ data: { exam, limit: 40 } })
      .then((r) => {
        if (!cancelled) setRows((r ?? []) as typeof rows);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exam, list]);

  async function open(date: string) {
    if (openDate === date) {
      setOpenDate(null);
      setOpenBrief(null);
      return;
    }
    setOpenDate(date);
    setOpenBrief(null);
    setOpenLoading(true);
    try {
      const b = await get({ data: { exam, date } });
      setOpenBrief(b as DailyBrief | null);
    } finally {
      setOpenLoading(false);
    }
  }

  if (loading) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="font-mono text-xs text-ink-soft">Loading archive…</p>
      </section>
    );
  }

  if (rows.length === 0) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          No past briefs yet. Once briefs are generated they show up here.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
          {rows.length} editions on file
        </p>
        <h3 className="mt-1 font-display text-2xl tracking-tight text-ink">Archive</h3>
      </div>
      <ul className="space-y-2">
        {rows.map((r) => {
          const isOpen = openDate === r.date;
          const nice = new Date(r.date + "T00:00:00").toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <li key={r.date} className="paper-card rounded-lg">
              <button
                type="button"
                onClick={() => open(r.date)}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <div>
                  <p className="font-display text-base text-ink">{nice}</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-marginalia">
                    {r.itemCount} items
                  </p>
                </div>
                <span className="font-mono text-xs text-ink-soft">{isOpen ? "Close" : "Open"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-border/60 px-2 pb-4 pt-4 sm:px-4">
                  {openLoading && (
                    <p className="px-3 font-mono text-xs text-ink-soft">Loading…</p>
                  )}
                  {openBrief && <BriefView brief={openBrief} title={nice} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
