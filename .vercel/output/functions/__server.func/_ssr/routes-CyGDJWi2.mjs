import { o as __toESM } from "../_runtime.mjs";
import { g as useNavigate, h as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { U as array, W as boolean, X as number, Z as object, et as string, z as _enum } from "../_libs/@ai-sdk/anthropic+[...].mjs";
import { a as writeLocalArtifact, i as summariesFromArtifacts, r as readLocalArtifacts } from "./digest.shared-DcEcIIgD.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CQSBy_4U.mjs";
import { t as getSupabaseBrowserClient } from "./client-CWvg5vgi.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@emotion/react+[...].mjs";
import { i as useServerFn, n as listArtifacts, r as useAuth, t as getArtifact } from "./digest-artifacts.functions-BrxI9ziH.mjs";
import { a as rowToDump, i as makeDump, r as dumpToRow, t as activePile } from "./dumps.shared-BbJK3NUd.mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CyGDJWi2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function artifactsQueryKey(userId) {
	return ["artifacts", userId];
}
function useArtifacts() {
	const { user, loading: authLoading } = useAuth();
	const userId = user?.id;
	const queryClient = useQueryClient();
	const fetchList = useServerFn(listArtifacts);
	const fetchOne = useServerFn(getArtifact);
	const { data: artifacts = [], isLoading } = useQuery({
		queryKey: userId ? artifactsQueryKey(userId) : ["artifacts", "anonymous"],
		queryFn: async () => {
			if (!userId) return [];
			try {
				const { artifacts: cloud } = await fetchList({ data: {} });
				if (cloud.length > 0) return cloud;
			} catch {}
			return summariesFromArtifacts(readLocalArtifacts(userId));
		},
		enabled: !!userId
	});
	const saveLocally = (0, import_react.useCallback)((artifact) => {
		if (!userId) return;
		writeLocalArtifact(userId, artifact);
		queryClient.setQueryData(artifactsQueryKey(userId), (prev = []) => {
			const summary = {
				id: artifact.id,
				createdAt: artifact.createdAt,
				title: artifact.title,
				dumpCount: artifact.dumpCount,
				overview: artifact.overview ?? artifact.digest.overview
			};
			return [summary, ...prev.filter((a) => a.id !== summary.id)];
		});
	}, [queryClient, userId]);
	const loadArtifact = (0, import_react.useCallback)(async (id) => {
		if (!userId) return null;
		const local = readLocalArtifacts(userId).find((a) => a.id === id);
		if (local) return local;
		try {
			return await fetchOne({ data: { id } });
		} catch {
			return local ?? null;
		}
	}, [fetchOne, userId]);
	const refresh = (0, import_react.useCallback)(() => {
		if (userId) queryClient.invalidateQueries({ queryKey: artifactsQueryKey(userId) });
	}, [queryClient, userId]);
	return {
		artifacts,
		isLoading: authLoading || isLoading,
		saveLocally,
		loadArtifact,
		refresh
	};
}
var InputSchema = object({ dumps: array(object({
	id: string(),
	type: _enum([
		"read",
		"todo",
		"idea",
		"note"
	]),
	kind: _enum(["link", "text"]),
	content: string().min(1).max(8e3),
	createdAt: number(),
	done: boolean().optional()
})).min(1).max(80).optional() });
var generateDigest = createServerFn({ method: "POST" }).validator((input) => InputSchema.parse(input)).handler(createSsrRpc("6e3244eb4ecc018adcfb4d17be03a783e4731bf714cacf00c7f76a264689ed32"));
var STORAGE_KEY = "later.dumps.v2";
var LEGACY_KEY = "later.dumps.v1";
function dumpsQueryKey(userId) {
	return ["dumps", userId];
}
function localStorageKey(userId) {
	return `${STORAGE_KEY}.${userId}`;
}
function isSchemaMissingError(error) {
	if (!error) return false;
	return error.code === "PGRST205" || error.message?.includes("Could not find the table") === true || error.message?.includes("schema cache") === true;
}
function readLegacyLocal() {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(LEGACY_KEY);
		if (!raw) return [];
		return JSON.parse(raw).map((d) => ({
			id: d.id,
			type: d.kind === "note" ? "note" : "read",
			kind: d.kind === "note" ? "text" : "link",
			content: d.content,
			createdAt: d.createdAt,
			done: false
		}));
	} catch {
		return [];
	}
}
function readLocalDumps(userId) {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(localStorageKey(userId));
		if (raw) return JSON.parse(raw);
		const legacy = window.localStorage.getItem(STORAGE_KEY);
		if (legacy) return JSON.parse(legacy);
		return readLegacyLocal();
	} catch {
		return [];
	}
}
function writeLocalDumps(userId, dumps) {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(localStorageKey(userId), JSON.stringify(dumps));
}
function emptyQueryData() {
	return {
		dumps: [],
		storage: "cloud",
		warning: null
	};
}
async function migrateLocalDumps(userId) {
	if (typeof window === "undefined") return;
	const local = readLocalDumps(userId);
	if (local.length === 0) return;
	const { error } = await getSupabaseBrowserClient().from("dumps").upsert(local.map((d) => dumpToRow(d, userId)));
	if (error) throw error;
	window.localStorage.removeItem(localStorageKey(userId));
	window.localStorage.removeItem(STORAGE_KEY);
	window.localStorage.removeItem(LEGACY_KEY);
}
async function fetchDumps(userId) {
	const supabase = getSupabaseBrowserClient();
	try {
		await migrateLocalDumps(userId);
		const { data, error } = await supabase.from("dumps").select("*").eq("user_id", userId).order("created_at", { ascending: false });
		if (error) throw error;
		return {
			dumps: data.map(rowToDump),
			storage: "cloud",
			warning: null
		};
	} catch (err) {
		if (isSchemaMissingError(err)) return {
			dumps: readLocalDumps(userId),
			storage: "local",
			warning: "Cloud database is not set up yet — saving on this device. Run supabase/migrations/001_initial.sql in your Supabase SQL editor to enable sync."
		};
		throw err;
	}
}
function getQuerySnapshot(queryClient, userId) {
	return queryClient.getQueryData(dumpsQueryKey(userId)) ?? emptyQueryData();
}
function useDumps() {
	const { user, loading: authLoading } = useAuth();
	const queryClient = useQueryClient();
	const userId = user?.id;
	const [saveError, setSaveError] = (0, import_react.useState)(null);
	const { data, isLoading, isError, error: fetchError } = useQuery({
		queryKey: userId ? dumpsQueryKey(userId) : ["dumps", "anonymous"],
		queryFn: () => fetchDumps(userId),
		enabled: !!userId
	});
	const dumps = data?.dumps ?? [];
	const storage = data?.storage ?? "cloud";
	const syncWarning = data?.warning ?? null;
	const addMutation = useMutation({
		mutationFn: async ({ content, type }) => {
			const dump = makeDump(content, type);
			const snapshot = getQuerySnapshot(queryClient, userId);
			if (snapshot.storage === "local") {
				writeLocalDumps(userId, [dump, ...snapshot.dumps]);
				return dump;
			}
			const { error } = await getSupabaseBrowserClient().from("dumps").insert({
				id: dump.id,
				user_id: userId,
				type: dump.type,
				kind: dump.kind,
				content: dump.content,
				done: dump.done
			});
			if (error) {
				if (isSchemaMissingError(error)) {
					const next = [dump, ...readLocalDumps(userId)];
					writeLocalDumps(userId, next);
					queryClient.setQueryData(dumpsQueryKey(userId), {
						dumps: next,
						storage: "local",
						warning: "Cloud database is not set up yet — saving on this device. Run supabase/migrations/001_initial.sql in your Supabase SQL editor to enable sync."
					});
					return dump;
				}
				throw error;
			}
			return dump;
		},
		onMutate: async ({ content, type }) => {
			if (!userId) return;
			setSaveError(null);
			await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
			const previous = getQuerySnapshot(queryClient, userId);
			const dump = makeDump(content, type);
			queryClient.setQueryData(dumpsQueryKey(userId), {
				...previous,
				dumps: [dump, ...previous.dumps]
			});
			return { previous };
		},
		onError: (err, _vars, ctx) => {
			if (userId && ctx?.previous) queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
			setSaveError(err.message ?? "Could not save.");
		},
		onSettled: () => {
			if (userId && storage === "cloud") queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
		}
	});
	const removeMutation = useMutation({
		mutationFn: async (id) => {
			const snapshot = getQuerySnapshot(queryClient, userId);
			if (snapshot.storage === "local") {
				writeLocalDumps(userId, snapshot.dumps.filter((d) => d.id !== id));
				return;
			}
			const { error } = await getSupabaseBrowserClient().from("dumps").delete().eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onMutate: async (id) => {
			if (!userId) return;
			await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
			const previous = getQuerySnapshot(queryClient, userId);
			queryClient.setQueryData(dumpsQueryKey(userId), {
				...previous,
				dumps: previous.dumps.filter((d) => d.id !== id)
			});
			return { previous };
		},
		onError: (_err, _id, ctx) => {
			if (userId && ctx?.previous) queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
		},
		onSettled: () => {
			if (userId && storage === "cloud") queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
		}
	});
	const toggleMutation = useMutation({
		mutationFn: async (id) => {
			const snapshot = getQuerySnapshot(queryClient, userId);
			const dump = snapshot.dumps.find((d) => d.id === id);
			if (!dump) return;
			const nextDone = !dump.done;
			if (snapshot.storage === "local") {
				writeLocalDumps(userId, snapshot.dumps.map((d) => d.id === id ? {
					...d,
					done: nextDone,
					doneAt: nextDone ? Date.now() : void 0
				} : d));
				return;
			}
			const { error } = await getSupabaseBrowserClient().from("dumps").update({
				done: nextDone,
				done_at: nextDone ? (/* @__PURE__ */ new Date()).toISOString() : null
			}).eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onMutate: async (id) => {
			if (!userId) return;
			await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
			const previous = getQuerySnapshot(queryClient, userId);
			queryClient.setQueryData(dumpsQueryKey(userId), {
				...previous,
				dumps: previous.dumps.map((d) => d.id === id ? {
					...d,
					done: !d.done,
					doneAt: d.done ? void 0 : Date.now()
				} : d)
			});
			return { previous };
		},
		onError: (_err, _id, ctx) => {
			if (userId && ctx?.previous) queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
		},
		onSettled: () => {
			if (userId && storage === "cloud") queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
		}
	});
	const updateMutation = useMutation({
		mutationFn: async ({ id, content }) => {
			const trimmed = content.trim();
			const kind = /^https?:\/\//i.test(trimmed) ? "link" : "text";
			const snapshot = getQuerySnapshot(queryClient, userId);
			if (snapshot.storage === "local") {
				writeLocalDumps(userId, snapshot.dumps.map((d) => d.id === id ? {
					...d,
					content: trimmed,
					kind
				} : d));
				return;
			}
			const { error } = await getSupabaseBrowserClient().from("dumps").update({
				content: trimmed,
				kind
			}).eq("id", id).eq("user_id", userId);
			if (error) throw error;
		},
		onMutate: async ({ id, content }) => {
			if (!userId) return;
			const trimmed = content.trim();
			const kind = /^https?:\/\//i.test(trimmed) ? "link" : "text";
			await queryClient.cancelQueries({ queryKey: dumpsQueryKey(userId) });
			const previous = getQuerySnapshot(queryClient, userId);
			queryClient.setQueryData(dumpsQueryKey(userId), {
				...previous,
				dumps: previous.dumps.map((d) => d.id === id ? {
					...d,
					content: trimmed,
					kind
				} : d)
			});
			return { previous };
		},
		onError: (_err, _vars, ctx) => {
			if (userId && ctx?.previous) queryClient.setQueryData(dumpsQueryKey(userId), ctx.previous);
		},
		onSettled: () => {
			if (userId && storage === "cloud") queryClient.invalidateQueries({ queryKey: dumpsQueryKey(userId) });
		}
	});
	return {
		dumps,
		add: (0, import_react.useCallback)((content, type) => {
			const trimmed = content.trim();
			if (!trimmed || !userId) return;
			addMutation.mutate({
				content: trimmed,
				type
			});
		}, [addMutation, userId]),
		remove: (0, import_react.useCallback)((id) => {
			if (!userId) return;
			removeMutation.mutate(id);
		}, [removeMutation, userId]),
		toggleDone: (0, import_react.useCallback)((id) => {
			if (!userId) return;
			toggleMutation.mutate(id);
		}, [toggleMutation, userId]),
		update: (0, import_react.useCallback)((id, content) => {
			if (!userId) return;
			updateMutation.mutate({
				id,
				content
			});
		}, [updateMutation, userId]),
		storage,
		syncWarning,
		saveError,
		fetchError: isError ? fetchError?.message ?? "Could not load pile." : null,
		hydrated: !authLoading && !!userId && !isLoading,
		ready: !authLoading && !!userId,
		isSaving: addMutation.isPending
	};
}
var TYPE_META = {
	read: {
		label: "Read",
		glyph: "¶",
		hint: "link or article to read later",
		verb: "Save to read"
	},
	todo: {
		label: "Todo",
		glyph: "✓",
		hint: "something to do later",
		verb: "Add todo"
	},
	idea: {
		label: "Idea",
		glyph: "✺",
		hint: "adhoc thought to brainstorm",
		verb: "Capture idea"
	},
	note: {
		label: "Note",
		glyph: "•",
		hint: "something to remember",
		verb: "Jot note"
	}
};
var TYPES = [
	"read",
	"todo",
	"idea",
	"note"
];
function Index() {
	const { user, signOut } = useAuth();
	const { dumps, add, remove, toggleDone, update, hydrated, ready, syncWarning, saveError, storage, isSaving } = useDumps();
	const { artifacts, saveLocally, refresh, isLoading: artifactsLoading } = useArtifacts();
	const pile = (0, import_react.useMemo)(() => activePile(dumps), [dumps]);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [type, setType] = (0, import_react.useState)("read");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const run = useServerFn(generateDigest);
	const navigate = useNavigate();
	function handleAdd(e) {
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
		try {
			const result = await run({ data: {} });
			saveLocally({
				...result.artifact,
				digest: result.digest,
				overview: result.artifact.overview ?? result.digest.overview
			});
			refresh();
			navigate({
				to: "/digest/$id",
				params: { id: result.artifact.id }
			});
		} catch (err) {
			const message = err.message ?? "Failed to generate digest.";
			setError(message.includes("ANTHROPIC") ? "Digest service is not configured yet." : message);
		} finally {
			setLoading(false);
		}
	}
	const [dateLine, setDateLine] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setDateLine((/* @__PURE__ */ new Date()).toLocaleDateString(void 0, {
			weekday: "long",
			month: "long",
			day: "numeric"
		}));
	}, []);
	const grouped = (0, import_react.useMemo)(() => {
		const g = {
			read: [],
			todo: [],
			idea: [],
			note: []
		};
		for (const d of pile) g[d.type].push(d);
		return g;
	}, [pile]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "safe-pt safe-pb safe-px min-h-[100dvh] pb-28 pt-6 sm:px-6 sm:pt-10 md:px-10 md:pt-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto w-full max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "mb-8 sm:mb-12",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:flex-row sm:items-baseline sm:justify-between sm:text-xs sm:tracking-[0.22em]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "vol. 01" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-baseline gap-x-3 gap-y-1 sm:gap-4",
								children: [
									user?.email && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "max-w-[14rem] truncate normal-case tracking-normal text-ink-soft sm:max-w-xs",
										children: user.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => void signOut().then(() => window.location.href = "/login"),
										className: "touch-target inline-flex items-center uppercase tracking-[0.18em] hover:text-accent sm:tracking-[0.22em]",
										children: "Sign out"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "whitespace-nowrap",
										suppressHydrationWarning: true,
										children: dateLine
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-px w-full rule-line" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-display-xl mt-6 font-display tracking-tight text-ink sm:mt-8",
							children: ["Later", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-accent",
								children: "."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-display-lead mt-3 max-w-xl font-display italic text-ink-soft sm:mt-4",
							children: "A quiet inbox for the things you meant to read, do, or think about. Dump now — read the brief tonight."
						})
					]
				}),
				syncWarning && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-6 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 font-mono text-xs leading-relaxed text-ink-soft",
					children: syncWarning
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "paper-card rounded-lg p-4 sm:p-7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleAdd,
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap",
								children: TYPES.map((t) => {
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setType(t),
										className: "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition sm:text-[11px] sm:tracking-[0.18em] " + (type === t ? "border-ink bg-ink text-primary-foreground" : "border-border bg-background/40 text-ink-soft hover:text-ink"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mr-1.5",
											children: TYPE_META[t].glyph
										}), TYPE_META[t].label]
									}, t);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								htmlFor: "dump",
								className: "block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
								children: ["§ ", TYPE_META[type].hint]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "dump",
								value: draft,
								onChange: (e) => setDraft(e.target.value),
								placeholder: type === "read" ? "https://… or paste content" : type === "todo" ? "e.g. fix the leaky tap this weekend" : type === "idea" ? "a half-formed thought to explore later" : "something you want to remember",
								rows: 3,
								className: "w-full resize-none rounded-md border border-border bg-background/60 px-4 py-3 font-sans text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-ring/60"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "font-mono text-xs text-ink-soft",
									children: [
										pile.length,
										" open · ",
										dumps.filter((d) => d.done).length,
										" done"
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !draft.trim() || !ready || isSaving,
									className: "touch-target w-full rounded-md bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto",
									children: [TYPE_META[type].verb, " →"]
								})]
							}),
							saveError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-mono text-sm text-destructive",
								children: saveError
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mt-12 space-y-8 sm:mt-14 sm:space-y-10",
					children: !hydrated ? null : pile.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-8 font-display text-lg italic text-ink-soft",
						children: "Nothing in the pile. Throw the next thing you almost-did in the box above."
					}) : TYPES.map((t) => {
						const items = grouped[t];
						if (items.length === 0) return null;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "font-display text-xl tracking-tight text-ink sm:text-2xl",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mr-2 text-accent",
										children: TYPE_META[t].glyph
									}), TYPE_META[t].label]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
									children: items.length.toString().padStart(2, "0")
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-px w-full rule-line" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-4 space-y-3",
								children: items.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DumpRow, {
									dump: d,
									index: items.length - i,
									onRemove: () => remove(d.id),
									onToggle: () => toggleDone(d.id),
									onSave: (content) => update(d.id, content)
								}, d.id))
							})
						] }, t);
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mt-12 sm:mt-16",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "paper-card rounded-lg p-4 sm:p-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
										children: "Evening edition"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 font-display text-xl tracking-tight text-ink sm:text-3xl",
										children: "Tonight's brief"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 max-w-md text-sm leading-relaxed text-ink-soft",
										children: "Reading digest · todo list · idea seeds · notes — opens as a block page like Notion or Obsidian."
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleDigest,
								disabled: loading || pile.length === 0,
								className: "touch-target w-full self-stretch rounded-md bg-accent px-6 py-3 font-mono text-xs uppercase tracking-[0.18em] text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:self-start",
								children: loading ? "Composing…" : "Generate brief"
							})]
						}), error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 font-mono text-sm text-destructive",
							children: error
						})]
					})
				}),
				(artifacts.length > 0 || artifactsLoading) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-14",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-2xl tracking-tight text-ink",
								children: "Past editions"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
								children: artifacts.length.toString().padStart(2, "0")
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mt-3 h-px w-full rule-line" }),
						artifactsLoading && artifacts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 font-mono text-xs text-ink-soft",
							children: "Loading archive…"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-2",
							children: artifacts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/digest/$id",
								params: { id: a.id },
								className: "block w-full rounded-md border border-border/60 bg-background/40 px-4 py-3 text-left transition hover:border-border hover:bg-background/60",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-display text-base text-ink",
										children: a.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia",
										children: [a.dumpCount, " items · open"]
									})]
								}), a.overview && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-sm text-ink-soft",
									children: a.overview
								})]
							}) }, a.id))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "mt-16 flex flex-col gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia sm:mt-20 sm:flex-row sm:items-center sm:justify-between sm:text-[11px] sm:tracking-[0.2em]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "— end of issue —" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: storage === "cloud" ? "synced to your account" : "stored on this device" })]
				})
			]
		})
	});
}
function DumpRow({ dump, index, onRemove, onToggle, onSave }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const [draft, setDraft] = (0, import_react.useState)(dump.content);
	const time = new Date(dump.createdAt).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
	const isLink = dump.kind === "link";
	const display = isLink && dump.content.length > 80 ? dump.content.slice(0, 77) + "…" : dump.content;
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "group grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2 border-b border-border/60 pb-3 sm:grid-cols-[1.75rem_1fr_auto] sm:gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onToggle,
				"aria-label": dump.done ? "Mark open" : "Mark done",
				className: "mt-1 grid h-5 w-5 place-items-center rounded-sm border font-mono text-[10px] transition " + (dump.done ? "border-accent bg-accent text-accent-foreground" : "border-border bg-background/40 text-transparent hover:text-marginalia"),
				children: "✓"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-marginalia",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: index.toString().padStart(2, "0") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "·" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: time })
					]
				}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						value: draft,
						onChange: (e) => setDraft(e.target.value),
						rows: 3,
						autoFocus: true,
						className: "w-full resize-none rounded-md border border-border bg-background/60 px-3 py-2 font-sans text-sm text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: commit,
							className: "rounded-md bg-ink px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground hover:bg-accent",
							children: "Save"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: cancel,
							className: "rounded-md border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ink-soft hover:text-ink",
							children: "Cancel"
						})]
					})]
				}) : isLink ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: dump.content,
					target: "_blank",
					rel: "noreferrer",
					className: "break-all font-mono text-sm hover:text-accent " + (dump.done ? "text-ink-soft line-through" : "text-ink"),
					children: display
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "whitespace-pre-wrap font-display text-base leading-snug " + (dump.done ? "text-ink-soft line-through" : "text-ink"),
					children: display
				})]
			}),
			!editing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "col-span-2 flex items-center justify-end gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft sm:col-span-1 sm:flex-col sm:items-end sm:gap-1 sm:opacity-60 sm:transition sm:group-hover:opacity-100",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => {
						setDraft(dump.content);
						setEditing(true);
					},
					"aria-label": "Edit",
					className: "touch-target inline-flex items-center hover:text-accent",
					children: "Edit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onRemove,
					"aria-label": "Remove",
					className: "touch-target inline-flex items-center hover:text-destructive",
					children: "Discard"
				})]
			})
		]
	});
}
//#endregion
export { Index as component };
