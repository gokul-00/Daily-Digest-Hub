import { useCallback, useEffect, useState } from "react";

export type Exam = "upsc" | "banking" | "ssc" | "state_psc";

export const EXAMS: { id: Exam; label: string; blurb: string }[] = [
  { id: "upsc", label: "UPSC / Civil Services", blurb: "polity, IR, environment, governance" },
  { id: "banking", label: "Banking (SBI / IBPS / RBI)", blurb: "economy, finance, banking awareness" },
  { id: "ssc", label: "SSC (CGL / CHSL)", blurb: "facts, awards, appointments, sports" },
  { id: "state_psc", label: "State PSC", blurb: "national + state-level current affairs" },
];

export type Relevance = "high" | "med" | "low" | "skip";

export type MCQ = {
  q: string;
  options: string[];
  answerIndex: number;
  explanation: string;
};

export type BriefItem = {
  id: string;
  headline: string;
  whatHappened: string;
  whyItMatters: string;
  examRelevance: Record<Exam, Relevance>;
  topicTags: string[];
  staticLinks: string[];
  sources: { url: string; label: string; publishedAt?: string }[];
  mcq: MCQ;
};

export type DailyBrief = {
  date: string; // YYYY-MM-DD
  exam: Exam;
  items: BriefItem[];
  generatedAt: number;
};

const PROFILE_KEY = "exampulse.profile.v1";
const SAVED_KEY = "exampulse.saved.v1";
const QUIZ_KEY = "exampulse.quiz.v1";

export type Profile = { exam: Exam };

function safeGet<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useExamProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProfile(safeGet<Profile>(PROFILE_KEY));
    setHydrated(true);
  }, []);

  const save = useCallback((p: Profile) => {
    safeSet(PROFILE_KEY, p);
    setProfile(p);
  }, []);

  const clear = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.removeItem(PROFILE_KEY);
    setProfile(null);
  }, []);

  return { profile, save, clear, hydrated };
}

export function useSaved() {
  const [saved, setSaved] = useState<BriefItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setSaved(safeGet<BriefItem[]>(SAVED_KEY) ?? []);
    setHydrated(true);
  }, []);

  const toggle = useCallback((item: BriefItem) => {
    setSaved((prev) => {
      const exists = prev.some((s) => s.id === item.id);
      const next = exists ? prev.filter((s) => s.id !== item.id) : [item, ...prev];
      safeSet(SAVED_KEY, next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((s) => s.id !== id);
      safeSet(SAVED_KEY, next);
      return next;
    });
  }, []);

  const isSaved = useCallback((id: string) => saved.some((s) => s.id === id), [saved]);

  return { saved, toggle, remove, isSaved, hydrated };
}

export type QuizResult = {
  date: string;
  exam: Exam;
  score: number;
  total: number;
  answeredAt: number;
};

export function saveQuizResult(r: QuizResult) {
  const list = safeGet<QuizResult[]>(QUIZ_KEY) ?? [];
  list.unshift(r);
  safeSet(QUIZ_KEY, list.slice(0, 60));
}

export function loadQuizResults(): QuizResult[] {
  return safeGet<QuizResult[]>(QUIZ_KEY) ?? [];
}
