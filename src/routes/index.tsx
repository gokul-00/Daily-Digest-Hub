import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useArtifacts } from "@/hooks/use-artifacts";
import { useAuth } from "@/hooks/use-auth";
import { pileArchivesQueryKey, usePileArchives } from "@/hooks/use-pile-archives";
import { getSession } from "@/lib/auth.functions";
import { formatUsd } from "@/lib/ai-usage";
import { getAiUsageSummary } from "@/lib/ai-usage.functions";
import { generateDigest } from "@/lib/digest.functions";
import { archivePile } from "@/lib/pile-archive.functions";
import { groupArchivesByDate, dumpToArchived, type ArchivedDump } from "@/lib/pile-archive.shared";
import { useDumps, activePile, type Dump, type DumpType } from "@/lib/dumps-store";

export const Route = createFileRoute("/")({
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

const TYPE_META: Record<DumpType, { label: string; glyph: string; hint: string; verb: string }> = {
  read: { label: "Read", glyph: "¶", hint: "link or article to read later", verb: "Save to read" },
  todo: { label: "Todo", glyph: "✓", hint: "something to do later", verb: "Add todo" },
  idea: { label: "Idea", glyph: "✺", hint: "adhoc thought to brainstorm", verb: "Capture idea" },
  note: { label: "Note", glyph: "•", hint: "something to remember", verb: "Jot note" },
};

const TYPES: DumpType[] = ["read", "todo", "idea", "note"];

function Index() {
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

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    add(draft, type);
    setDraft("");
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
    <main className="safe-pt safe-pb safe-px min-h-[100dvh] pb-28 pt-6 sm:px-6 sm:pt-10 md:px-10 md:pt-16">
      <div className="mx-auto w-full max-w-3xl">
        <header className="mb-8 sm:mb-12">
          <div className="flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:flex-row sm:items-baseline sm:justify-between sm:text-xs sm:tracking-[0.22em]">
            <span>vol. 01</span>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:gap-4">
              {user?.email && (
                <span className="max-w-[14rem] truncate normal-case tracking-normal text-ink-soft sm:max-w-xs">
                  {user.email}
                </span>
              )}
              <button
                type="button"
                onClick={() => void signOut().then(() => (window.location.href = "/login"))}
                className="touch-target inline-flex items-center uppercase tracking-[0.18em] hover:text-accent sm:tracking-[0.22em]"
              >
                Sign out
              </button>
              <span className="whitespace-nowrap" suppressHydrationWarning>
                {dateLine}
              </span>
            </div>
          </div>
          <div className="mt-3 h-px w-full rule-line" />
          <h1 className="text-display-xl mt-6 font-display tracking-tight text-ink sm:mt-8">
            Later<span className="text-accent">.</span>
          </h1>
          <p className="text-display-lead mt-3 max-w-xl font-display italic text-ink-soft sm:mt-4">
            A quiet inbox for the things you meant to read, do, or think about. Dump now — read the
            brief tonight.
          </p>
        </header>

        {syncWarning && (
          <p className="mb-6 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs leading-relaxed text-ink-soft">
            {syncWarning}
          </p>
        )}

        <section className="paper-card rounded-lg p-4 sm:p-7">
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
              {TYPES.map((t) => {
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
            TYPES.map((t) => {
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
                  <ul className="mt-4 space-y-3">
                    {items.map((d, i) => (
                      <DumpRow
                        key={d.id}
                        dump={d}
                        index={items.length - i}
                        onRemove={() => remove(d.id)}
                        onToggle={() => toggleDone(d.id)}
                        onSave={(content) => update(d.id, content)}
                      />
                    ))}
                  </ul>
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
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl tracking-tight text-ink">Pile archive</h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
                {archives.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 h-px w-full rule-line" />
            {archivesLoading && archives.length === 0 ? (
              <p className="mt-4 font-mono text-xs text-ink-soft">Loading archive…</p>
            ) : (
              <div className="mt-4 space-y-8">
                {archivesByDate.map((group) => (
                  <div key={group.date}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia">
                      {group.heading}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {group.archives.map((archive) => (
                        <li key={archive.id} className="rounded-md border border-border/60 bg-background/40">
                          <button
                            type="button"
                            onClick={() => void toggleArchiveDetails(archive.id)}
                            className="flex w-full flex-wrap items-baseline justify-between gap-2 px-4 py-3 text-left transition hover:bg-background/60"
                          >
                            <span className="font-display text-base text-ink">{archive.label}</span>
                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
                              {archive.itemCount} items
                              {archive.digestId ? " · linked to edition" : ""}
                            </span>
                          </button>
                          {archive.digestId && (
                            <div className="border-t border-border/40 px-4 py-2">
                              <Link
                                to="/digest/$id"
                                params={{ id: archive.digestId }}
                                className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent hover:underline"
                              >
                                Open evening edition →
                              </Link>
                            </div>
                          )}
                          {expandedArchiveId === archive.id && expandedArchiveItems && (
                            <ul className="space-y-2 border-t border-border/40 px-4 py-3">
                              {expandedArchiveItems.map((item) => (
                                <li
                                  key={item.id}
                                  className="font-mono text-xs leading-relaxed text-ink-soft"
                                >
                                  <span className="mr-2 text-accent">{TYPE_META[item.type].glyph}</span>
                                  {item.content}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {(artifacts.length > 0 || artifactsLoading) && (
          <section className="mt-14">
            <div className="flex items-baseline justify-between">
              <h3 className="font-display text-2xl tracking-tight text-ink">Past editions</h3>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">
                {artifacts.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 h-px w-full rule-line" />
            {artifactsLoading && artifacts.length === 0 ? (
              <p className="mt-4 font-mono text-xs text-ink-soft">Loading archive…</p>
            ) : (
              <ul className="mt-4 space-y-2">
                {artifacts.map((a) => (
                  <li key={a.id}>
                    <Link
                      to="/digest/$id"
                      params={{ id: a.id }}
                      className="block w-full rounded-md border border-border/60 bg-background/40 px-4 py-3 text-left transition hover:border-border hover:bg-background/60"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-display text-base text-ink">{a.title}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
                          {a.dumpCount} items · open
                        </span>
                      </div>
                      {a.overview && (
                        <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{a.overview}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <footer className="mt-16 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:tracking-[0.2em]">
          <span>— end of issue —</span>
          <span>{storage === "cloud" ? "synced to your account" : "stored on this device"}</span>
        </footer>
      </div>
    </main>
  );
}

function DumpRow({
  dump,
  index,
  onRemove,
  onToggle,
  onSave,
}: {
  dump: Dump;
  index: number;
  onRemove: () => void;
  onToggle: () => void;
  onSave: (content: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(dump.content);
  const time = new Date(dump.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const isLink = dump.kind === "link";
  const display =
    isLink && dump.content.length > 80 ? dump.content.slice(0, 77) + "…" : dump.content;

  function commit() {
    const v = draft.trim();
    if (!v) return;
    if (v !== dump.content) onSave(v);
    setEditing(false);
  }
  function cancel() {
    setDraft(dump.content);
    setEditing(false);
  }

  return (
    <li className="group grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 border-b border-border/60 pb-3 sm:grid-cols-[1.75rem_1fr_auto] sm:gap-3">
      <button
        onClick={onToggle}
        aria-label={dump.done ? "Mark open" : "Mark done"}
        className={
          "mt-1 grid h-5 w-5 place-items-center rounded-sm border font-mono text-[10px] transition " +
          (dump.done
            ? "border-accent bg-accent text-accent-foreground"
            : "border-border bg-background/40 text-transparent hover:text-marginalia")
        }
      >
        ✓
      </button>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia">
          <span>{index.toString().padStart(2, "0")}</span>
          <span>·</span>
          <span>{time}</span>
        </div>
        {editing ? (
          <div className="space-y-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              autoFocus
              className="w-full resize-none rounded-md border border-border bg-background/60 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
            />
            <div className="flex gap-2">
              <button
                onClick={commit}
                className="rounded-md bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground hover:bg-accent"
              >
                Save
              </button>
              <button
                onClick={cancel}
                className="rounded-md border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : isLink ? (
          <a
            href={dump.content}
            target="_blank"
            rel="noreferrer"
            className={
              "break-all font-mono text-sm hover:text-accent " +
              (dump.done ? "text-ink-soft line-through" : "text-ink")
            }
          >
            {display}
          </a>
        ) : (
          <p
            className={
              "whitespace-pre-wrap font-display text-base leading-snug " +
              (dump.done ? "text-ink-soft line-through" : "text-ink")
            }
          >
            {display}
          </p>
        )}
      </div>
      {!editing && (
        <div className="col-span-2 flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft sm:col-span-1 sm:flex-col sm:items-end sm:gap-1 sm:opacity-60 sm:transition sm:group-hover:opacity-100">
          <button
            onClick={() => {
              setDraft(dump.content);
              setEditing(true);
            }}
            aria-label="Edit"
            className="touch-target inline-flex items-center hover:text-accent"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            aria-label="Remove"
            className="touch-target inline-flex items-center hover:text-destructive"
          >
            Discard
          </button>
        </div>
      )}
    </li>
  );
}
