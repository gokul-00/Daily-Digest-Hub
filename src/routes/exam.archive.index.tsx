import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArchiveView, EXAM_SHORT } from "@/components/exam/brief-shared";
import { ProductTabBar } from "@/components/ProductTabBar";
import { useAuth } from "@/hooks/use-auth";
import { useExamProfile } from "@/lib/exam-store";

export const Route = createFileRoute("/exam/archive/")({
  head: () => ({
    meta: [
      { title: "Archive — ExamPulse" },
      {
        name: "description",
        content: "Past ExamPulse daily current-affairs editions for your exam.",
      },
    ],
  }),
  component: ExamArchivePage,
});

function ExamArchivePage() {
  const navigate = useNavigate();
  const { profile, clear, hydrated } = useExamProfile();
  const { signOut } = useAuth();
  const [dateLine, setDateLine] = useState("");

  useEffect(() => {
    setDateLine(
      new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }),
    );
  }, []);

  useEffect(() => {
    if (hydrated && !profile) {
      void navigate({ to: "/exam" });
    }
  }, [hydrated, profile, navigate]);

  if (!hydrated || !profile) {
    return (
      <main className="safe-pt safe-px flex min-h-[100dvh] items-center justify-center px-5">
        <p className="font-mono text-xs text-ink-soft">Loading…</p>
      </main>
    );
  }

  return (
    <main className="safe-pt safe-px min-h-[100dvh] px-5 pb-28 pt-6 sm:px-10 sm:pt-8 md:pb-16">
      <div className="mx-auto max-w-3xl md:max-w-4xl">
        <header className="mb-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:text-xs sm:tracking-[0.22em]">
            <Link to="/exam" className="touch-target inline-flex items-center hover:text-accent">
              ← ExamPulse
            </Link>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span suppressHydrationWarning>{dateLine}</span>
              <button
                type="button"
                onClick={() => void signOut().then(() => (window.location.href = "/login"))}
                className="touch-target inline-flex items-center hover:text-accent"
              >
                Sign out
              </button>
            </div>
          </div>
          <div className="mt-3 h-px w-full rule-line" />
          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
                Past editions · {EXAM_SHORT[profile.exam]}
              </p>
              <h1 className="mt-1 font-display text-3xl tracking-tight text-ink sm:text-5xl">
                Archive
              </h1>
            </div>
            <button
              type="button"
              onClick={() => {
                clear();
                void navigate({ to: "/exam" });
              }}
              className="rounded-md border border-border bg-background/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft transition hover:border-ink/40 hover:text-ink"
            >
              {EXAM_SHORT[profile.exam]} · change
            </button>
          </div>
        </header>

        <ArchiveView exam={profile.exam} />

        <footer className="mt-16 font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          <Link to="/exam" className="hover:text-accent">
            ← Back to today
          </Link>
        </footer>
      </div>
      <ProductTabBar />
    </main>
  );
}
