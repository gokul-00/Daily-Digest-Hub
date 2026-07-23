import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useRef, useState } from "react";
import { z } from "zod";

import { useAuth } from "@/hooks/use-auth";
import {
  BriefItemSchema,
  ExamSchema,
  EXAMS,
  parseBriefItems,
  type BriefItem,
  type DailyBrief,
  type Exam,
  type MCQ,
  type Relevance,
} from "./exam-brief.shared";
import {
  importExamSaved,
  listExamSaved,
  removeExamSaved,
  saveExamItem,
} from "./exam-saved.functions";
import { importExamQuiz, listExamQuiz, saveExamQuiz } from "./exam-quiz.functions";
import { QuizResultSchema, parseQuizResults, type QuizResult } from "./exam-quiz.shared";

export type { BriefItem, DailyBrief, Exam, MCQ, Relevance, QuizResult };
export { EXAMS };

const ProfileSchema = z.object({
  exam: ExamSchema,
});

/** Per-user keys (v2). Legacy unscoped v1 keys are migrated once. */
const PROFILE_PREFIX = "exampulse.profile.v2";
const SAVED_PREFIX = "exampulse.saved.v2";
const QUIZ_PREFIX = "exampulse.quiz.v2";

const LEGACY_PROFILE_KEY = "exampulse.profile.v1";
const LEGACY_SAVED_KEY = "exampulse.saved.v1";
const LEGACY_QUIZ_KEY = "exampulse.quiz.v1";

export type Profile = z.infer<typeof ProfileSchema>;

function scopedKey(prefix: string, userId: string) {
  return `${prefix}.${userId}`;
}

function rawGet(key: string): unknown | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function safeRemove(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

function parseProfile(value: unknown): Profile | null {
  const parsed = ProfileSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function readExamProfile(userId: string): Profile | null {
  const key = scopedKey(PROFILE_PREFIX, userId);
  const scoped = parseProfile(rawGet(key));
  if (scoped) return scoped;

  const legacy = parseProfile(rawGet(LEGACY_PROFILE_KEY));
  if (legacy) {
    safeSet(key, legacy);
    safeRemove(LEGACY_PROFILE_KEY);
    return legacy;
  }
  return null;
}

export function writeExamProfile(userId: string, profile: Profile): boolean {
  const parsed = parseProfile(profile);
  if (!parsed) return false;
  return safeSet(scopedKey(PROFILE_PREFIX, userId), parsed);
}

export function clearExamProfile(userId: string) {
  safeRemove(scopedKey(PROFILE_PREFIX, userId));
}

/** Local cache only — source of truth is Supabase `exam_saved_items`. */
function readLocalSavedCache(userId: string): BriefItem[] {
  const key = scopedKey(SAVED_PREFIX, userId);
  const scopedRaw = rawGet(key);
  if (scopedRaw !== null) return parseBriefItems(scopedRaw);

  // Do not steal shared legacy into every account — only copy if this user has no cache yet,
  // then clear legacy so the next account does not inherit it.
  const legacy = parseBriefItems(rawGet(LEGACY_SAVED_KEY));
  if (legacy.length > 0) {
    safeSet(key, legacy);
    safeRemove(LEGACY_SAVED_KEY);
  }
  return legacy;
}

function writeLocalSavedCache(userId: string, items: BriefItem[]): boolean {
  return safeSet(scopedKey(SAVED_PREFIX, userId), parseBriefItems(items));
}

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function useExamProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setProfile(null);
      setHydrated(true);
      return;
    }
    setProfile(readExamProfile(user.id));
    setHydrated(true);
  }, [user?.id, authLoading]);

  const save = useCallback(
    (p: Profile) => {
      if (!user?.id) return;
      const parsed = parseProfile(p);
      if (!parsed) return;
      writeExamProfile(user.id, parsed);
      setProfile(parsed);
    },
    [user?.id],
  );

  const clear = useCallback(() => {
    if (!user?.id) return;
    clearExamProfile(user.id);
    setProfile(null);
  }, [user?.id]);

  return { profile, save, clear, hydrated: hydrated && !authLoading };
}

export function useSaved() {
  const { user, loading: authLoading } = useAuth();
  const listFn = useServerFn(listExamSaved);
  const saveFn = useServerFn(saveExamItem);
  const removeFn = useServerFn(removeExamSaved);
  const importFn = useServerFn(importExamSaved);
  const [saved, setSaved] = useState<BriefItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const migratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setSaved([]);
      setHydrated(true);
      migratedRef.current = null;
      return;
    }

    const userId = user.id;
    let cancelled = false;

    // Show account-scoped cache immediately, then replace with cloud.
    const local = readLocalSavedCache(userId);
    setSaved(local);
    setHydrated(false);
    setWriteError(null);

    (async () => {
      try {
        let cloud = (await listFn()).items as BriefItem[];

        // One-time migrate this account's local cache (and any legacy copy) into the cloud.
        if (migratedRef.current !== userId && local.length > 0) {
          migratedRef.current = userId;
          if (cloud.length === 0) {
            cloud = (await importFn({ data: { items: local } })).items as BriefItem[];
          } else {
            // Merge any local-only ids into cloud without wiping cloud.
            cloud = (await importFn({ data: { items: local } })).items as BriefItem[];
          }
        } else {
          migratedRef.current = userId;
        }

        if (cancelled) return;
        setSaved(cloud);
        writeLocalSavedCache(userId, cloud);
        setWriteError(null);
      } catch (err) {
        if (cancelled) return;
        // Offline / migration not applied — keep local account cache.
        setWriteError(
          (err as Error).message?.includes("migration")
            ? (err as Error).message
            : null,
        );
        setSaved(local);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, listFn, importFn]);

  const toggle = useCallback(
    (item: BriefItem) => {
      if (!user?.id) return;
      const parsed = BriefItemSchema.safeParse(item);
      if (!parsed.success) return;
      const userId = user.id;
      const exists = saved.some((s) => s.id === parsed.data.id);
      const prev = saved;

      if (exists) {
        const next = saved.filter((s) => s.id !== parsed.data.id);
        setSaved(next);
        writeLocalSavedCache(userId, next);
        void removeFn({ data: { id: parsed.data.id } })
          .then(() => setWriteError(null))
          .catch((err) => {
            setWriteError((err as Error).message ?? "Could not remove saved item.");
            setSaved(prev);
            writeLocalSavedCache(userId, prev);
          });
        return;
      }

      const next = [parsed.data, ...saved];
      setSaved(next);
      writeLocalSavedCache(userId, next);
      void saveFn({ data: parsed.data })
        .then(() => setWriteError(null))
        .catch((err) => {
          setWriteError((err as Error).message ?? "Could not save item for this account.");
          setSaved(prev);
          writeLocalSavedCache(userId, prev);
        });
    },
    [user?.id, saved, saveFn, removeFn],
  );

  const remove = useCallback(
    (id: string) => {
      if (!user?.id) return;
      const userId = user.id;
      const prev = saved;
      const next = saved.filter((s) => s.id !== id);
      setSaved(next);
      writeLocalSavedCache(userId, next);
      void removeFn({ data: { id } })
        .then(() => setWriteError(null))
        .catch((err) => {
          setWriteError((err as Error).message ?? "Could not remove saved item.");
          setSaved(prev);
          writeLocalSavedCache(userId, prev);
        });
    },
    [user?.id, saved, removeFn],
  );

  const isSaved = useCallback((id: string) => saved.some((s) => s.id === id), [saved]);

  return {
    saved,
    toggle,
    remove,
    isSaved,
    hydrated: hydrated && !authLoading,
    writeError,
  };
}

function readLocalQuizCache(userId: string): QuizResult[] {
  const key = scopedKey(QUIZ_PREFIX, userId);
  const scoped = parseQuizResults(rawGet(key));
  if (scoped.length > 0) return scoped;
  const legacy = parseQuizResults(rawGet(LEGACY_QUIZ_KEY));
  if (legacy.length > 0) {
    safeSet(key, legacy);
    safeRemove(LEGACY_QUIZ_KEY);
  }
  return legacy;
}

function writeLocalQuizCache(userId: string, results: QuizResult[]): boolean {
  return safeSet(scopedKey(QUIZ_PREFIX, userId), parseQuizResults(results));
}

/** Account-backed quiz history (Supabase) with per-user local cache. */
export function useQuizResults() {
  const { user, loading: authLoading } = useAuth();
  const listFn = useServerFn(listExamQuiz);
  const saveFn = useServerFn(saveExamQuiz);
  const importFn = useServerFn(importExamQuiz);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [writeError, setWriteError] = useState<string | null>(null);
  const migratedRef = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.id) {
      setResults([]);
      setHydrated(true);
      migratedRef.current = null;
      return;
    }

    const userId = user.id;
    let cancelled = false;
    const local = readLocalQuizCache(userId);
    setResults(local);
    setHydrated(false);
    setWriteError(null);

    (async () => {
      try {
        let cloud = (await listFn()).results as QuizResult[];
        if (migratedRef.current !== userId && local.length > 0) {
          migratedRef.current = userId;
          cloud = (await importFn({ data: { results: local } })).results as QuizResult[];
        } else {
          migratedRef.current = userId;
        }
        if (cancelled) return;
        setResults(cloud);
        writeLocalQuizCache(userId, cloud);
        setWriteError(null);
      } catch (err) {
        if (cancelled) return;
        setWriteError(
          (err as Error).message?.includes("migration") ? (err as Error).message : null,
        );
        setResults(local);
      } finally {
        if (!cancelled) setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, listFn, importFn]);

  const saveResult = useCallback(
    async (r: QuizResult) => {
      if (!user?.id) return;
      const parsed = QuizResultSchema.safeParse(r);
      if (!parsed.success) return;
      const userId = user.id;
      const prev = results;
      const next = [
        parsed.data,
        ...results.filter(
          (x) => !(x.date === parsed.data.date && x.exam === parsed.data.exam),
        ),
      ];
      setResults(next);
      writeLocalQuizCache(userId, next);
      try {
        await saveFn({ data: parsed.data });
        setWriteError(null);
      } catch (err) {
        setWriteError((err as Error).message ?? "Could not save quiz result.");
        setResults(prev);
        writeLocalQuizCache(userId, prev);
      }
    },
    [user?.id, results, saveFn],
  );

  return {
    results,
    saveResult,
    hydrated: hydrated && !authLoading,
    writeError,
  };
}
