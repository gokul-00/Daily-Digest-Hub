import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { BriefView, EXAM_SHORT, type SavedApi } from "@/components/exam/brief-shared";
import { ProductSwitch } from "@/components/ProductSwitch";
import { ProductTabBar } from "@/components/ProductTabBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateDailyBrief,
  getDailyBrief,
  listBriefsForMonth,
} from "@/lib/currentAffairs.functions";
import { useAuth } from "@/hooks/use-auth";
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

const TabSchema = z.enum(["today", "quiz", "saved", "month"]);
type Tab = z.infer<typeof TabSchema>;

const ExamSearchSchema = z.object({
  tab: z.union([TabSchema, z.literal("archive")]).optional(),
});

export const Route = createFileRoute("/exam/")({
  validateSearch: (search) => ExamSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    if (search.tab === "archive") {
      throw redirect({ to: "/exam/archive" });
    }
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

const PRIMARY_TABS: { id: Tab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "quiz", label: "Quiz" },
  { id: "saved", label: "Saved" },
];

function ExamPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/exam/" });
  const { profile, save, clear, hydrated } = useExamProfile();
  const savedApi = useSaved();
  const { signOut } = useAuth();
  const [dateLine, setDateLine] = useState("");

  const tab: Tab =
    search.tab === "month" || search.tab === "quiz" || search.tab === "saved"
      ? search.tab
      : "today";

  function setTab(next: Tab) {
    void navigate({ search: { tab: next === "today" ? undefined : next } });
  }

  useEffect(() => {
    setDateLine(
      new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    );
  }, []);

  return (
    <main className="safe-pt safe-px min-h-[100dvh] px-5 pb-28 pt-6 sm:px-10 sm:pt-8 md:pb-16">
      <div className="mx-auto max-w-3xl md:max-w-4xl">
        <header className="mb-5">
          <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:text-xs sm:tracking-[0.22em]">
            <span suppressHydrationWarning>{dateLine}</span>
            <button
              type="button"
              onClick={() => void signOut().then(() => (window.location.href = "/login"))}
              className="touch-target shrink-0 inline-flex items-center hover:text-accent"
            >
              Sign out
            </button>
          </div>
          <div className="mt-3 h-px w-full rule-line" />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-[0.95] tracking-tight text-ink sm:text-5xl">
                ExamPulse<span className="text-accent">.</span>
              </h1>
              {!profile && (
                <p className="mt-2 max-w-xl font-display text-sm italic text-ink-soft sm:text-base">
                  Ten-minute daily current affairs — filtered for your exam.
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {profile && (
                <button
                  type="button"
                  onClick={clear}
                  className="rounded-md border border-border bg-background/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition hover:border-ink/40 hover:text-ink md:hidden"
                  title="Change exam"
                >
                  {EXAM_SHORT[profile.exam]} · change
                </button>
              )}
              <ProductSwitch current="exam" className="mb-1 shrink-0" />
            </div>
          </div>
        </header>

        {!hydrated ? null : !profile ? (
          <Onboarding onSave={(exam) => save({ exam })} />
        ) : (
          <>
            <PrimaryNav
              tab={tab}
              setTab={setTab}
              savedCount={savedApi.saved.length}
              examShort={EXAM_SHORT[profile.exam]}
              onChangeExam={clear}
            />
            {tab === "today" && <TodayView exam={profile.exam} savedApi={savedApi} />}
            {tab === "quiz" && <QuizView exam={profile.exam} onGoToday={() => setTab("today")} />}
            {tab === "saved" && (
              <SavedView savedApi={savedApi} onGoToday={() => setTab("today")} />
            )}
            {tab === "month" && <MonthView exam={profile.exam} />}
          </>
        )}

        <footer className="mt-16 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          <span>— shared daily edition —</span>
          <span>saved on this device</span>
        </footer>
      </div>
      <ProductTabBar />
    </main>
  );
}

function Onboarding({ onSave }: { onSave: (exam: Exam) => void }) {
  const [pick, setPick] = useState<Exam | null>(null);
  return (
    <section className="paper-card rounded-lg p-6 sm:p-8">
      <h2 className="font-display text-2xl tracking-tight text-ink sm:text-3xl">
        Which exam are you preparing for?
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Your daily brief will be ranked for this exam. You can switch anytime.
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
        className="mt-6 w-full rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
      >
        Start reading →
      </button>
    </section>
  );
}

function PrimaryNav({
  tab,
  setTab,
  savedCount,
  examShort,
  onChangeExam,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  savedCount: number;
  examShort: string;
  onChangeExam: () => void;
}) {
  const linkClass = (active: boolean) =>
    "font-mono text-[12px] uppercase tracking-[0.16em] transition " +
    (active ? "text-ink ink-underline" : "text-ink-soft hover:text-ink");

  return (
    <>
      {/* Desktop: primary sections + quiet utilities */}
      <nav
        aria-label="ExamPulse"
        className="mb-8 hidden items-baseline justify-between gap-8 border-b border-border/50 pb-3 md:flex"
      >
        <div className="flex items-baseline gap-7">
          {PRIMARY_TABS.map((t) => {
            const active = tab === t.id;
            const label =
              t.id === "saved" && savedCount > 0 ? `Saved · ${savedCount}` : t.label;
            return (
              <button
                type="button"
                key={t.id}
                onClick={() => setTab(t.id)}
                className={linkClass(active)}
              >
                {label}
              </button>
            );
          })}
          <Link to="/exam/archive" className={linkClass(false)}>
            Archive
          </Link>
        </div>
        <div className="flex items-baseline gap-5">
          <button
            type="button"
            onClick={() => setTab("month")}
            className={
              "font-mono text-[11px] uppercase tracking-[0.16em] transition " +
              (tab === "month" ? "text-ink" : "text-marginalia hover:text-ink")
            }
          >
            Month
          </button>
          <button
            type="button"
            onClick={onChangeExam}
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-marginalia hover:text-accent"
          >
            {examShort} · change
          </button>
        </div>
      </nav>

      {/* Phone: sticky segment chips */}
      <div
        className="z-20 -mx-5 mb-6 border-b border-border/60 bg-[color-mix(in_oklab,var(--background)_88%,transparent)] px-5 py-2 backdrop-blur-md max-md:sticky sm:-mx-10 sm:px-10 md:hidden"
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="flex items-center gap-1.5">
          <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
            {PRIMARY_TABS.map((t) => {
              const active = tab === t.id;
              const label =
                t.id === "saved" && savedCount > 0 ? `Saved · ${savedCount}` : t.label;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={
                    "touch-target shrink-0 rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition " +
                    (active
                      ? "border-ink bg-ink text-primary-foreground"
                      : "border-border bg-background/40 text-ink-soft hover:text-ink")
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={
                  "touch-target shrink-0 rounded-md border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition " +
                  (tab === "month"
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-border bg-background/40 text-ink-soft hover:text-ink")
                }
              >
                More
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[10rem]">
              <DropdownMenuItem asChild className="font-mono text-[11px] uppercase tracking-[0.16em]">
                <Link to="/exam/archive">Archive</Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="font-mono text-[11px] uppercase tracking-[0.16em]"
                onSelect={() => setTab("month")}
              >
                Month
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="font-mono text-[11px] uppercase tracking-[0.16em]"
                onSelect={onChangeExam}
              >
                Change exam
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}

function TodayView({ exam, savedApi }: { exam: Exam; savedApi: SavedApi }) {
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
          Daily edition
        </p>
        <h3 className="mt-2 font-display text-2xl tracking-tight text-ink sm:text-3xl">
          Today's 10-minute brief
        </h3>
        <p className="mt-2 max-w-md text-sm text-ink-soft">
          One shared brief per exam per day. Cron usually builds it in the morning — if it is
          missing, the first generate creates it and every user gets that same edition.
        </p>
        <button
          type="button"
          onClick={generate}
          disabled={loading}
          className="mt-5 w-full rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          {loading ? "Composing (30–60s)…" : "Generate today's brief"}
        </button>
        {error && <p className="mt-4 font-mono text-sm text-destructive">{error}</p>}
      </section>
    );
  }

  return <BriefView brief={brief} savedApi={savedApi} />;
}

function QuizView({ exam, onGoToday }: { exam: Exam; onGoToday: () => void }) {
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
        <button
          type="button"
          onClick={onGoToday}
          className="mt-4 rounded-md bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground"
        >
          Go to Today →
        </button>
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

function SavedView({ savedApi, onGoToday }: { savedApi: SavedApi; onGoToday: () => void }) {
  const { saved, remove, hydrated } = savedApi;
  if (!hydrated) return null;
  if (saved.length === 0) {
    return (
      <section className="paper-card rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          Nothing saved yet. Hit ★ on any item in Today's brief to revise later.
        </p>
        <button
          type="button"
          onClick={onGoToday}
          className="mt-4 rounded-md border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
        >
          Go to Today →
        </button>
      </section>
    );
  }
  return (
    <section className="space-y-4">
      <h3 className="font-display text-2xl tracking-tight text-ink">
        Saved <span className="text-ink-soft">· {saved.length}</span>
      </h3>
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
