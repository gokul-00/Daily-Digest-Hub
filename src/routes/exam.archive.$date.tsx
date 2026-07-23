import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import {
  BriefView,
  EXAM_SHORT,
  formatBriefEditionTitle,
} from "@/components/exam/brief-shared";
import { ProductTabBar } from "@/components/ProductTabBar";
import { useAuth } from "@/hooks/use-auth";
import { getDailyBrief } from "@/lib/currentAffairs.functions";
import { useExamProfile, useSaved, type DailyBrief } from "@/lib/exam-store";

export const Route = createFileRoute("/exam/archive/$date")({
  head: ({ params }) => ({
    meta: [
      { title: `Brief · ${params.date} — ExamPulse` },
      {
        name: "description",
        content: "Past ExamPulse daily current-affairs edition.",
      },
    ],
  }),
  component: ExamArchiveEditionPage,
});

function ExamArchiveEditionPage() {
  const { date } = Route.useParams();
  const navigate = useNavigate();
  const get = useServerFn(getDailyBrief);
  const { profile, hydrated } = useExamProfile();
  const savedApi = useSaved();
  const { signOut } = useAuth();
  const [brief, setBrief] = useState<DailyBrief | null>(null);
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState(false);
  const dateOk = /^\d{4}-\d{2}-\d{2}$/.test(date);

  useEffect(() => {
    if (hydrated && !profile) {
      void navigate({ to: "/exam" });
    }
  }, [hydrated, profile, navigate]);

  useEffect(() => {
    if (!profile || !dateOk) return;
    let cancelled = false;
    setLoading(true);
    setMissing(false);
    get({ data: { exam: profile.exam, date } })
      .then((b) => {
        if (cancelled) return;
        if (!b) {
          setMissing(true);
          setBrief(null);
        } else {
          setBrief(b as DailyBrief);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile, date, dateOk, get]);

  if (!hydrated || !profile) {
    return (
      <main className="safe-pt safe-px flex min-h-[100dvh] items-center justify-center px-5">
        <p className="font-mono text-xs text-ink-soft">Loading…</p>
      </main>
    );
  }

  const title = dateOk ? formatBriefEditionTitle(date) : date;

  return (
    <main className="safe-pt safe-px min-h-[100dvh] px-5 pb-28 pt-6 sm:px-10 sm:pt-8 md:pb-16">
      <div className="mx-auto max-w-3xl md:max-w-4xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:text-xs sm:tracking-[0.22em]">
            <Link
              to="/exam/archive"
              className="touch-target inline-flex items-center hover:text-accent"
            >
              ← Archive
            </Link>
            <button
              type="button"
              onClick={() => void signOut().then(() => (window.location.href = "/login"))}
              className="touch-target inline-flex items-center hover:text-accent"
            >
              Sign out
            </button>
          </div>
          <div className="mt-3 h-px w-full rule-line" />
          <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
            Edition · {EXAM_SHORT[profile.exam]}
          </p>
          <h1 className="mt-1 font-display text-3xl tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
        </header>

        {!dateOk && (
          <p className="text-sm text-ink-soft">
            Invalid date.{" "}
            <Link to="/exam/archive" className="text-accent hover:underline">
              Back to archive
            </Link>
          </p>
        )}
        {dateOk && loading && (
          <p className="font-mono text-xs text-ink-soft">Loading edition…</p>
        )}
        {dateOk && missing && (
          <p className="text-sm text-ink-soft">
            No brief found for this date.{" "}
            <Link to="/exam/archive" className="text-accent hover:underline">
              Back to archive
            </Link>
          </p>
        )}
        {brief && <BriefView brief={brief} savedApi={savedApi} title={title} />}

        <footer className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          <Link to="/exam/archive" className="hover:text-accent">
            ← All editions
          </Link>
        </footer>
      </div>
      <ProductTabBar />
    </main>
  );
}
