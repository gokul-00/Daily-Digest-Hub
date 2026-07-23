import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { ArchiveDateGroup } from "@/components/lists/ArchiveListItem";
import { EditionCard } from "@/components/lists/EditionCard";
import { SectionHeading, TruncatedGroups, TruncatedList } from "@/components/lists/SectionHeading";
import { DumpRow } from "@/components/pile/DumpRow";
import { ProductTabBar } from "@/components/ProductTabBar";
import { ProductSwitch } from "@/components/ProductSwitch";
import { useArtifacts } from "@/hooks/use-artifacts";
import { useAuth } from "@/hooks/use-auth";
import { pileArchivesQueryKey, usePileArchives } from "@/hooks/use-pile-archives";
import { getSession } from "@/lib/auth.functions";
import { formatUsd } from "@/lib/ai-usage";
import { getAiUsageSummary } from "@/lib/ai-usage.functions";
import { DUMP_TYPES, TYPE_META } from "@/lib/dump-types";
import { consumeShareDraft, markShareHandled } from "@/lib/share-payload";
import { generateDigest } from "@/lib/digest.functions";
import { archivePile } from "@/lib/pile-archive.functions";
import {
  groupArchivesByDate,
  groupItemsByDate,
  dumpToArchived,
  type ArchivedDump,
} from "@/lib/pile-archive.shared";
import { useDumps, activePile, type Dump, type DumpType } from "@/lib/dumps-store";

const IndexSearchSchema = z.object({
  shared: z.string().optional(),
  focus: z.string().optional(),
});

export const Route = createFileRoute("/")({
  validateSearch: (search) => IndexSearchSchema.parse(search),
  beforeLoad: async () => {
    const { user } = await getSession();
    if (!user) throw redirect({ to: "/login" });
  },
  head: () => ({
    meta: [
      { title: "Later — your end-of-day brain dump" },
      {
        name: "description",
        content:
          "Capture links, todos, ideas and notes through the day. Get one organized end-of-day brief.",
      },
      { property: "og:title", content: "Later — end-of-day brain dump" },
      {
        property: "og:description",
        content: "A quiet inbox for everything you meant to read, do, or think about later.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const search = Route.useSearch();
  const { user, signOut } = useAuth();
  const { dumps, add, remove, toggleDone, update, archiveLocalPile, hydrated, ready, syncWarning, saveError, storage, isSaving } =
    useDumps();
  const { artifacts, saveLocally, refresh, isLoading: artifactsLoading } = useArtifacts();
  const { archives, isLoading: archivesLoading, loadArchive, refresh: refreshArchives } = usePileArchives();
  const pile = useMemo(() => activePile(dumps), [dumps]);
  const [draft, setDraft] = useState("");
  const [type, setType] = useState<DumpType>("read");
  const [loading, setLoading] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedArchiveId, setExpandedArchiveId] = useState<string | null>(null);
  const [expandedArchiveItems, setExpandedArchiveItems] = useState<ArchivedDump[] | null>(null);
  const [archivePreviews, setArchivePreviews] = useState<Record<string, ArchivedDump[]>>({});
  const [showAllEditions, setShowAllEditions] = useState(false);
  const [shareBanner, setShareBanner] = useState(false);
  const [shareHelpOpen, setShareHelpOpen] = useState(false);
  const dumpRef = useRef<HTMLTextAreaElement>(null);
  const loadedPreviewIds = useRef(new Set<string>());
  const run = useServerFn(generateDigest);
  const runArchive = useServerFn(archivePile);
  const fetchUsageSummary = useServerFn(getAiUsageSummary);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: usageSummaryData } = useQuery({
    queryKey: ["ai-usage-summary", user?.id],
    queryFn: () => fetchUsageSummary(),
    enabled: !!user?.id,
  });
  const usageSummary = usageSummaryData?.summary;
  const archivesByDate = useMemo(() => groupArchivesByDate(archives), [archives]);
  const editionsByDate = useMemo(() => groupItemsByDate(artifacts), [artifacts]);

  useEffect(() => {
    if (search.shared !== "draft") return;
    const parsed = consumeShareDraft();
    if (parsed) {
      setDraft(parsed.content);
      setType(parsed.type);
      setShareBanner(true);
      requestAnimationFrame(() => {
        dumpRef.current?.focus();
        dumpRef.current?.setSelectionRange(parsed.content.length, parsed.content.length);
      });
    }
    void navigate({ to: "/", search: {}, replace: true });
  }, [search.shared, navigate]);

  useEffect(() => {
    if (search.focus === "capture") {
      dumpRef.current?.focus();
      void navigate({ to: "/", search: {}, replace: true });
    }
  }, [search.focus, navigate]);

  useEffect(() => {
    const pending = archives
      .slice(0, 12)
      .filter((a) => !loadedPreviewIds.current.has(a.id));
    if (pending.length === 0) return;
    for (const archive of pending) loadedPreviewIds.current.add(archive.id);
    void Promise.all(
      pending.map(async (archive) => {
        const full = await loadArchive(archive.id);
        return full ? { id: archive.id, items: full.items.slice(0, 2) } : null;
      }),
    ).then((results) => {
      const next: Record<string, ArchivedDump[]> = {};
      for (const result of results) {
        if (result) next[result.id] = result.items;
      }
      if (Object.keys(next).length > 0) {
        setArchivePreviews((prev) => ({ ...prev, ...next }));
      }
    });
  }, [archives, loadArchive]);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    add(draft, type);
    markShareHandled(draft.trim());
    setDraft("");
    setShareBanner(false);
  }

  async function handleDigest() {
    setError(null);
    if (pile.length === 0) {
      setError("Nothing in the pile yet.");
      return;
    }
    setLoading(true);
    const pileSnapshot = [...pile];
    try {
      const result = await run({ data: {} });
      if (storage === "local") {
        archiveLocalPile(pileSnapshot, result.artifact.id);
      }
      saveLocally({
        ...result.artifact,
        digest: result.digest,
        usage: result.usage,
        archivedPile: pileSnapshot.map(dumpToArchived),
        overview: result.artifact.overview ?? result.digest.overview,
      });
      refresh();
      refreshArchives();
      void queryClient.invalidateQueries({ queryKey: ["dumps", user?.id] });
      void queryClient.invalidateQueries({ queryKey: pileArchivesQueryKey(user!.id) });
      void queryClient.invalidateQueries({ queryKey: ["ai-usage-summary", user?.id] });
      navigate({ to: "/digest/$id", params: { id: result.artifact.id } });
    } catch (err) {
      const message = (err as Error).message ?? "Failed to generate digest.";
      setError(message.includes("ANTHROPIC") ? "Digest service is not configured yet." : message);
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    setError(null);
    if (pile.length === 0) {
      setError("Nothing in the pile to archive.");
      return;
    }
    setArchiving(true);
    const pileSnapshot = [...pile];
    try {
      if (storage === "local") {
        archiveLocalPile(pileSnapshot, null);
      } else {
        await runArchive();
      }
      refreshArchives();
      void queryClient.invalidateQueries({ queryKey: ["dumps", user?.id] });
      void queryClient.invalidateQueries({ queryKey: pileArchivesQueryKey(user!.id) });
    } catch (err) {
      setError((err as Error).message ?? "Could not archive the pile.");
    } finally {
      setArchiving(false);
    }
  }

  async function toggleArchiveDetails(id: string) {
    if (expandedArchiveId === id) {
      setExpandedArchiveId(null);
      setExpandedArchiveItems(null);
      return;
    }
    const archive = await loadArchive(id);
    setExpandedArchiveId(id);
    setExpandedArchiveItems(
      archive?.items.map((item) => ({
        ...item,
        done: item.done ?? false,
      })) ?? null,
    );
    if (archive) {
      setArchivePreviews((prev) => ({
        ...prev,
        [id]: archive.items.slice(0, 2),
      }));
    }
  }

  const [dateLine, setDateLine] = useState("");
  useEffect(() => {
    setDateLine(
      new Date().toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }),
    );
  }, []);

  const grouped = useMemo(() => {
    const g: Record<DumpType, Dump[]> = { read: [], todo: [], idea: [], note: [] };
    for (const d of pile) g[d.type].push(d);
    return g;
  }, [pile]);

  return (
    <main className="safe-pt safe-pb safe-px min-h-[100dvh] pb-28 pt-6 sm:px-6 sm:pt-10 md:px-10 md:pb-10 md:pt-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-6 sm:mb-8 md:mb-12">
          <div className="flex items-baseline justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:text-xs sm:tracking-[0.22em]">
            <span className="min-w-0 truncate">
              vol. 01
              <span className="mx-2 text-border" aria-hidden>
                ·
              </span>
              <span suppressHydrationWarning>{dateLine}</span>
            </span>
            <button
              type="button"
              onClick={() => void signOut().then(() => (window.location.href = "/login"))}
              className="touch-target shrink-0 inline-flex items-center hover:text-accent"
              title={user?.email ?? "Sign out"}
            >
              Sign out
            </button>
          </div>
          <div className="mt-3 h-px w-full rule-line" />
          <div className="mt-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 sm:mt-8">
            <div className="min-w-0">
              <h1 className="text-display-xl font-display tracking-tight text-ink">
                Later<span className="text-accent">.</span>
              </h1>
              <p className="text-display-lead mt-3 max-w-xl font-display italic text-ink-soft sm:mt-4">
                A quiet inbox for the things you meant to read, do, or think about. Dump now — read
                the brief tonight.
              </p>
            </div>
            <ProductSwitch current="later" className="mb-1 shrink-0" />
          </div>
        </header>

        {shareBanner && (
          <p className="mb-6 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs text-ink">
            Shared content is in the box below — pick a type and save when ready.
            <button
              type="button"
              onClick={() => setShareBanner(false)}
              className="ml-3 uppercase tracking-[0.14em] text-accent hover:underline"
            >
              Dismiss
            </button>
          </p>
        )}

        {syncWarning && (
          <p className="mb-6 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs leading-relaxed text-ink-soft">
            {syncWarning}
          </p>
        )}

        <section className="paper-card rounded-lg p-4 sm:p-7">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
              {DUMP_TYPES.map((t) => {
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={
                      "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition sm:text-[11px] sm:tracking-[0.18em] " +
                      (active
                        ? "border-ink bg-ink text-primary-foreground"
                        : "border-border bg-background/40 text-ink-soft hover:text-ink")
                    }
                  >
                    <span className="mr-1.5">{TYPE_META[t].glyph}</span>
                    {TYPE_META[t].label}
                  </button>
                );
              })}
            </div>
            <label
              htmlFor="dump"
              className="block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia"
            >
              § {TYPE_META[type].hint}
            </label>
            <textarea
              id="dump"
              ref={dumpRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={
                type === "read"
                  ? "https://… or paste content"
                  : type === "todo"
                    ? "e.g. fix the leaky tap this weekend"
                    : type === "idea"
                      ? "a half-formed thought to explore later"
                      : "something you want to remember"
              }
              rows={3}
              className="w-full resize-none rounded-md border border-border bg-background/60 px-4 py-3 font-sans text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono text-xs text-ink-soft">
                {pile.length} open · {dumps.filter((d) => d.done).length} done
              </span>
              <button
                type="submit"
                disabled={!draft.trim() || !ready || isSaving}
                className="touch-target w-full rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
              >
                {TYPE_META[type].verb} →
              </button>
            </div>
            {saveError && (
              <p className="font-mono text-sm text-destructive">{saveError}</p>
            )}
          </form>
        </section>

        <section className="mt-12 space-y-8 sm:mt-14 sm:space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
              Today&apos;s pile
            </p>
            {pile.length > 0 && (
              <button
                type="button"
                onClick={() => void handleArchive()}
                disabled={archiving || loading}
                className="touch-target rounded-md border border-border px-4 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-soft transition hover:border-ink hover:text-ink disabled:opacity-40"
              >
                {archiving ? "Archiving…" : "Archive pile"}
              </button>
            )}
          </div>
          {!hydrated ? null : pile.length === 0 ? (
            <p className="mt-8 font-display text-lg italic text-ink-soft">
              Nothing in the pile. Throw the next thing you almost-did in the box above.
            </p>
          ) : (
            DUMP_TYPES.map((t) => {
              const items = grouped[t];
              if (items.length === 0) return null;
              return (
                <div key={t}>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-display text-xl tracking-tight text-ink sm:text-2xl">
                      <span className="mr-2 text-accent">{TYPE_META[t].glyph}</span>
                      {TYPE_META[t].label}
                    </h2>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
                      {items.length.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="mt-3 h-px w-full rule-line" />
                  <div className="mt-4">
                    <TruncatedList
                      items={items}
                      previewCount={5}
                      listClassName="space-y-3"
                      expandLabel={(total) => `View all ${total} ${TYPE_META[t].label.toLowerCase()}`}
                      getKey={(d) => d.id}
                      renderItem={(d, i, expanded) => (
                        <DumpRow
                          dump={d}
                          index={items.length - i}
                          preview={!expanded && items.length > 5}
                          onRemove={() => remove(d.id)}
                          onToggle={() => toggleDone(d.id)}
                          onSave={(content) => update(d.id, content)}
                        />
                      )}
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="mt-12 sm:mt-16">
          <div className="paper-card rounded-lg p-4 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
                  Evening edition
                </p>
                <h3 className="mt-2 font-display text-xl tracking-tight text-ink sm:text-3xl">
                  Tonight&apos;s brief
                </h3>
                <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-soft">
                  Reading digest · todo list · idea seeds · notes — opens as a block page like
                  Notion or Obsidian.
                </p>
                {usageSummary && usageSummary.generationCount > 0 && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia">
                    AI avg {usageSummary.avgTokensPerGeneration.toLocaleString()} tok / brief ·{" "}
                    {formatUsd(usageSummary.avgCostPerGeneration)} ·{" "}
                    {usageSummary.generationCount} total
                  </p>
                )}
              </div>
              <button
                onClick={handleDigest}
                disabled={loading || pile.length === 0}
                className="touch-target w-full self-stretch rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:self-start"
              >
                {loading ? "Composing…" : "Generate brief"}
              </button>
            </div>

            {error && <p className="mt-6 font-mono text-sm text-destructive">{error}</p>}
          </div>
        </section>

        {(archives.length > 0 || archivesLoading) && (
          <section className="mt-14">
            <SectionHeading title="Pile archive" count={archives.length} />
            {archivesLoading && archives.length === 0 ? (
              <p className="mt-4 font-mono text-xs text-ink-soft">Loading archive…</p>
            ) : (
              <div className="mt-4">
                <TruncatedGroups
                  groups={archivesByDate}
                  previewCount={3}
                  getKey={(g) => g.date}
                  expandLabel={(total) => `View all ${total} dates`}
                  renderGroup={(group) => (
                    <ArchiveDateGroup
                      heading={group.heading}
                      archives={group.archives}
                      expandedArchiveId={expandedArchiveId}
                      expandedArchiveItems={expandedArchiveItems}
                      archivePreviews={archivePreviews}
                      onToggleArchive={(id) => void toggleArchiveDetails(id)}
                    />
                  )}
                />
              </div>
            )}
          </section>
        )}

        {(artifacts.length > 0 || artifactsLoading) && (
          <section className="mt-14">
            <SectionHeading title="Past editions" count={artifacts.length} />
            {artifactsLoading && artifacts.length === 0 ? (
              <p className="mt-4 font-mono text-xs text-ink-soft">Loading editions…</p>
            ) : showAllEditions ? (
              <div className="mt-4 space-y-8">
                {editionsByDate.map((group) => (
                  <div key={group.date}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia">
                      {group.heading}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {group.items.map((a) => (
                        <li key={a.id}>
                          <EditionCard artifact={a} />
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setShowAllEditions(false)}
                  className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
                >
                  Show fewer editions
                </button>
              </div>
            ) : (
              <div className="mt-4">
                <ul className="space-y-2">
                  {artifacts.slice(0, 5).map((a) => (
                    <li key={a.id}>
                      <EditionCard artifact={a} />
                    </li>
                  ))}
                </ul>
                {artifacts.length > 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAllEditions(true)}
                    className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
                  >
                    View all {artifacts.length} editions
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        <footer className="mt-16 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:tracking-[0.2em]">
          <span>— end of issue —</span>
          <div className="flex flex-col gap-2 sm:items-end">
            <button
              type="button"
              onClick={() => setShareHelpOpen((v) => !v)}
              className="touch-target text-left uppercase tracking-[0.18em] hover:text-accent"
            >
              Share to Later
            </button>
            {shareHelpOpen && (
              <p className="max-w-md normal-case tracking-normal text-ink-soft">
                <strong className="text-ink">Android:</strong> Install Later from Chrome, then share
                links from any app — Later appears in the share sheet. Content lands in the capture
                box for you to review and save.
                <br />
                <strong className="mt-2 inline-block text-ink">iPhone:</strong> Create a Shortcuts
                action: receive URLs/text from Share Sheet → Open URL{" "}
                <span className="break-all text-accent">
                  {typeof window !== "undefined" ? window.location.origin : ""}/share?url=…&amp;text=…
                </span>
              </p>
            )}
            <span>{storage === "cloud" ? "synced to your account" : "stored on this device"}</span>
          </div>
        </footer>
      </div>
      <ProductTabBar />
    </main>
  );
}
