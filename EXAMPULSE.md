# ExamPulse — content & data reference

How daily briefs are built, how freshness/ranking work, what is shared vs per-user, and where overlaps can appear.

Code: `src/lib/currentAffairs.server.ts`, `src/lib/exam-sources.ts`, `src/routes/api/cron/exam-briefs.ts`.

---

## Daily brief model

- **One shared edition** per `(date, exam)` stored in Supabase `daily_briefs`.
- Exams: `upsc` | `banking` | `ssc` | `state_psc`.
- Calendar date is **Asia/Kolkata (IST)** (`todayKeyIst`).
- First successful generate wins; later requests for that day+exam get the **cached** row (no per-user regeneration).
- Cron pre-generates all four exams (Vercel `30 1 * * *` → `/api/cron/exam-briefs`, auth `Bearer CRON_SECRET`). `force` is cron-only.

UI generate never forces a rebuild. Archive lists past `daily_briefs` rows for the user’s chosen exam.

---

## Content pipeline

Order of operations when a brief is generated:

1. **Fetch** RSS feeds (PIB / RBI = tier 1, The Hindu / Indian Express = tier 2, Mint / Down To Earth = tier 3).
2. **Per feed:** keep up to **12** items.
3. **Freshness filter:** prefer items whose `pubDate` is within the last **36 hours**.
   - Missing or unparseable `pubDate` is treated as eligible (included in the “fresh” set).
4. **Fallback:** if fewer than **20** items pass the 36h window, use the **full** fetched set (older items allowed — **no hard max age** in this path).
5. **Dedupe by title:** normalize (lowercase, strip non-alphanumeric, first ~80 chars); keep the first row only.
6. **Sort:** higher feed **weight** first (5 → 3 → 2), then newer `pubDate`.
7. **Cap:** top **50** seeds → AI.
8. **AI (Claude Haiku):** produce **8–12** brief items for the target exam (merge stories, rank, MCQs, syllabus tags).
9. **Post-filter:** drop items with **no sources**; enrich source `publishedAt` from matched RSS URLs.
10. **Persist** one row in `daily_briefs` (race: if another writer finished, adopt their row).

### Feed weights & tiers

| Tier | Role | Weight | Examples |
|------|------|--------|----------|
| 1 | Official | 5 | PIB, RBI |
| 2 | National press | 3 | The Hindu, Indian Express |
| 3 | Niche / secondary | 2 | Mint, Down To Earth |

Constants: freshness preference and Tier‑1 UI stale flag use **36 hours** (`withinLast36h`, `TIER1_STALE_HOURS` in `exam-sources.ts`).

---

## Importance / parameters checked

There is **no** separate ML ranker or syllabus DB. Signals are:

| Parameter | Where | Effect |
|-----------|--------|--------|
| Feed **tier** | Fetch + AI prompt | Prefer official; merge tier‑1 into sources when present |
| Feed **weight** | Pre-AI sort | Hard ranking before the model |
| **Recency** (`pubDate`) | Filter + sort | Prefer ≤36h; newer wins at equal weight |
| **Exam focus** | AI system prompt | Rank for target exam; fill `examRelevance` for all four |
| Editorial drops | AI prompt | Drop entertainment / gossip / routine sports (unless landmark) |
| **Citability** | Post-AI | Must keep ≥1 real URL from the seed list |
| Tier‑1 age | UI only | Citation marked stale if ≥36h (`isTier1Stale`) — warning, not a hard drop |

AI also fills: `whatHappened`, `whyItMatters`, `staticLinks` (syllabus anchors), `topicTags`, one MCQ per item.

---

## Overlaps — what to expect

### Same edition (one date + one exam)

- Crude title-dedupe collapses identical headlines across feeds.
- Different headlines for the **same event** can all reach the AI; the prompt asks to **merge into one item** and prefer tier‑1 sources. Usually works; not guaranteed.

### Same day, different exams

- Four separate briefs share a similar seed pool.
- **Overlap across exams is expected** (e.g. a major RBI release). Order and `examRelevance` differ; rows are not shared.

### Across consecutive days

- The **36h window** means yesterday’s story can still be in today’s seeds.
- There is **no** “already covered yesterday” memory (no exclusion of prior brief item ids / URLs).
- The **same story can appear again** the next day if it is still in feeds and the model picks it.

### Archive vs Today

- Archive serves stored past editions as written; it does not re-filter against today.

---

## Practical freshness summary

| Path | Age behavior |
|------|----------------|
| Preferred | Content from roughly the **last 36 hours** |
| Thin-news fallback | As old as the RSS still lists (often ~1–few days; **no coded max**) |
| Served edition | Frozen at generation time for that IST date; not refreshed through the day |

---

## User-specific vs shared data

| Data | Scope | Storage |
|------|--------|---------|
| Daily brief content | **Shared** by all users for `(date, exam)` | `daily_briefs` |
| Exam choice (onboarding) | Per user, this browser | `localStorage` `exampulse.profile.v2.<userId>` |
| Saved items | **Per user** (synced) | `exam_saved_items` + local cache |
| Quiz results | **Per user** (synced); one row per `(user, date, exam)` | `exam_quiz_results` + local cache |

Migrations: `005_daily_briefs.sql`, `006_exam_saved_items.sql`, `007_exam_quiz_results.sql`.

RLS: saved + quiz rows require `auth.uid() = user_id`.

---

## Routes (UX)

| Path | Role |
|------|------|
| `/exam` | Today / Quiz / Saved / Month |
| `/exam/archive` | Past editions list (like Later “Past editions”) |
| `/exam/archive/$date` | One edition page |
| `/api/cron/exam-briefs` | Pre-generate / optional force refresh |

---

## Possible future hardening (not implemented)

- Hard exclude URLs / item ids already used in the last N days (kill cross-day repeats).
- Stronger story clustering than title-prefix dedupe (e.g. URL canonical + entity).
- Hard max age even on fallback (e.g. drop anything older than 72h).
- Cloud-backed exam profile (today local-only per user).

When changing freshness or ranking, update this file and the constants in `currentAffairs.server.ts` / `exam-sources.ts` together.
