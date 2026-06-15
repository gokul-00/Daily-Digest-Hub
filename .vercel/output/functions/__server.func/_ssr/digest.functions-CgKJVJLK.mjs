import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { a as createClient } from "../_libs/@supabase/ssr+[...].mjs";
import { n as createSupabaseServerClient, t as createServerRpc } from "./server-C_WZiU59.mjs";
import { U as array, W as boolean, X as number, Z as object, et as string, t as anthropic, z as _enum } from "../_libs/@ai-sdk/anthropic+[...].mjs";
import { n as formatArtifactTitle, t as DigestSchema } from "./digest.shared-DcEcIIgD.mjs";
import { t as extract } from "../_libs/@extractus/article-extractor.mjs";
import { n as activePileFromDbRows } from "./dumps.shared-BbJK3NUd.mjs";
import { t as generateObject } from "../_libs/ai.mjs";
import { t as require_src } from "../_libs/metascraper+whoops.mjs";
import { t as require_src$1 } from "../_libs/metascraper-author.mjs";
import { t as require_src$2 } from "../_libs/metascraper-date.mjs";
import { t as require_src$3 } from "../_libs/metascraper-description.mjs";
import { t as require_src$4 } from "../_libs/metascraper-title.mjs";
import { n as toPlainText, t as fetchTranscript } from "../_libs/youtube-transcript-plus.mjs";
import { createHash } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/digest.functions-CgKJVJLK.js
var import_src = /* @__PURE__ */ __toESM(require_src());
var import_src$1 = /* @__PURE__ */ __toESM(require_src$1());
var import_src$2 = /* @__PURE__ */ __toESM(require_src$2());
var import_src$3 = /* @__PURE__ */ __toESM(require_src$3());
var import_src$4 = /* @__PURE__ */ __toESM(require_src$4());
function createSupabaseAdminClient() {
	const url = process.env.VITE_SUPABASE_URL;
	const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!url || !serviceRoleKey) throw new Error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
	return createClient(url, serviceRoleKey, { auth: {
		persistSession: false,
		autoRefreshToken: false
	} });
}
var JS_HEAVY_PATTERNS = [
	/^gemini\.google\.com$/i,
	/^chatgpt\.com$/i,
	/^chat\.openai\.com$/i,
	/^claude\.ai$/i,
	/^perplexity\.ai$/i,
	/^copilot\.microsoft\.com$/i,
	/^notion\.(so|site)$/i,
	/^docs\.google\.com$/i
];
function isJsHeavyUrl(url) {
	try {
		const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
		const path = new URL(url).pathname.toLowerCase();
		if (!JS_HEAVY_PATTERNS.some((re) => re.test(host))) return false;
		if (host === "gemini.google.com" && path.startsWith("/share")) return true;
		if (host === "chatgpt.com" && path.includes("/share")) return true;
		if (host === "chat.openai.com" && path.includes("/share")) return true;
		if (host === "claude.ai" && (path.includes("/share") || path.includes("/chat"))) return true;
		if (host === "perplexity.ai" && path.includes("/search")) return true;
		if (host === "notion.so" || host === "notion.site") return true;
		if (host === "docs.google.com") return path.includes("/document") || path.includes("/spreadsheets");
		return path.length > 1;
	} catch {
		return false;
	}
}
function isThinContent(body) {
	return body.trim().length < 400;
}
function classifyUrl(url) {
	try {
		const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
		if (host === "youtu.be" || host.endsWith("youtube.com")) return "youtube";
		if (host.endsWith("linkedin.com")) return "linkedin";
		if (host.endsWith("instagram.com")) return "instagram";
		if (host.endsWith("twitter.com") || host === "x.com") return "web";
		return "web";
	} catch {
		return "unknown";
	}
}
function extractUrls(text) {
	return Array.from(new Set(text.match(/https?:\/\/[^\s)]+/gi) ?? []));
}
function hasJinaApiKey() {
	return Boolean(process.env.JINA_API_KEY?.trim());
}
/** Browser-rendered fetch via Jina Reader — for JS-heavy pages and chat share links. */
async function extractWithJina(url, engine = "browser") {
	const apiKey = process.env.JINA_API_KEY?.trim();
	if (!apiKey) throw new Error("JINA_API_KEY is not configured");
	const res = await fetch("https://r.jina.ai/", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
			Accept: "application/json",
			"X-Engine": engine,
			"X-Return-Format": "markdown"
		},
		body: JSON.stringify({ url }),
		signal: AbortSignal.timeout(9e4)
	});
	if (!res.ok) {
		const detail = await res.text().catch(() => "");
		throw new Error(`Jina Reader HTTP ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`);
	}
	const json = await res.json();
	const data = json.data ?? json;
	const body = (data.content ?? "").trim();
	if (!body) throw new Error("Jina Reader returned empty content");
	return {
		url: data.url ?? url,
		title: data.title,
		body,
		metadata: {
			engine,
			description: data.description
		},
		provider: "jina"
	};
}
var scraper = (0, import_src.default)([
	(0, import_src$4.default)(),
	(0, import_src$3.default)(),
	(0, import_src$1.default)(),
	(0, import_src$2.default)()
]);
async function extractSocialMeta(url, sourceType) {
	const res = await fetch(url, {
		headers: {
			"User-Agent": "Mozilla/5.0 (compatible; LaterBot/1.0; +https://later.app)",
			Accept: "text/html,application/xhtml+xml"
		},
		redirect: "follow"
	});
	if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
	const metadata = await scraper({
		html: await res.text(),
		url
	});
	const parts = [
		metadata.title,
		metadata.description,
		metadata.author
	].filter(Boolean).map(String);
	return {
		url,
		title: metadata.title ?? void 0,
		body: parts.join("\n\n"),
		metadata: {
			sourceType,
			author: metadata.author,
			date: metadata.date,
			description: metadata.description
		},
		provider: "metascraper"
	};
}
function htmlToText(html) {
	return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
async function extractWebArticle(url) {
	const article = await extract(url);
	if (!article) throw new Error("Could not extract article content");
	const body = article.content ? htmlToText(article.content) : (article.description ?? "").trim();
	return {
		url: article.url ?? url,
		title: article.title,
		body: body || article.description || "",
		metadata: {
			sourceType: "web",
			author: article.author,
			published: article.published,
			description: article.description,
			image: article.image
		},
		provider: "article-extractor"
	};
}
async function tryJinaEscalation(url, prior, reason) {
	if (!hasJinaApiKey()) return null;
	try {
		const jina = await extractWithJina(url, "browser");
		return {
			...jina,
			metadata: {
				...jina.metadata,
				escalatedFrom: prior?.provider ?? "none",
				escalationReason: reason
			}
		};
	} catch {
		return null;
	}
}
async function extractWebWithEscalation(url) {
	let primary = null;
	if (!isJsHeavyUrl(url)) try {
		primary = await extractWebArticle(url);
		if (!isThinContent(primary.body)) return primary;
	} catch {}
	const escalated = await tryJinaEscalation(url, primary, primary ? "thin_content" : isJsHeavyUrl(url) ? "js_heavy_url" : "fetch_failed");
	if (escalated) return escalated;
	if (primary) return primary;
	throw new Error("Could not extract article content");
}
async function extractSocialWithEscalation(url, sourceType) {
	let primary = null;
	try {
		primary = await extractSocialMeta(url, sourceType);
		if (!isThinContent(primary.body)) return primary;
	} catch {}
	const escalated = await tryJinaEscalation(url, primary, "thin_social_meta");
	if (escalated) return escalated;
	if (primary) return primary;
	throw new Error(`Could not extract ${sourceType} content`);
}
var MAX_BODY_CHARS = 8e3;
function truncateBody(body, max = MAX_BODY_CHARS) {
	const trimmed = body.trim();
	if (trimmed.length <= max) return trimmed;
	return `${trimmed.slice(0, max - 1)}…`;
}
function mergeUserText(body, userText) {
	const parts = [body.trim()];
	const note = userText?.trim();
	if (note && !body.includes(note)) parts.push(`User note: ${note}`);
	return parts.filter(Boolean).join("\n\n");
}
function normalizeExtracted(input, userText) {
	const body = truncateBody(mergeUserText(input.body, userText));
	const status = input.error ? "error" : body.length > 0 ? "ok" : "partial";
	return {
		url: input.url,
		sourceType: input.sourceType,
		title: input.title,
		body,
		metadata: input.metadata ?? {},
		provider: input.provider,
		status,
		error: input.error
	};
}
function formatExtractedForPrompt(doc) {
	const lines = [`[Extracted ${doc.url}]`, `Source: ${doc.sourceType} via ${doc.provider}`];
	if (doc.title) lines.push(`Title: ${doc.title}`);
	if (doc.error) lines.push(`Error: ${doc.error}`);
	if (doc.body) lines.push(doc.body);
	return lines.join("\n");
}
function extractVideoId(url) {
	try {
		const parsed = new URL(url);
		if (parsed.hostname.replace(/^www\./, "") === "youtu.be") return parsed.pathname.slice(1) || null;
		if (parsed.hostname.includes("youtube.com")) return parsed.searchParams.get("v");
	} catch {
		return null;
	}
	return null;
}
async function extractYoutube(url) {
	const videoId = extractVideoId(url);
	if (!videoId) throw new Error("Invalid YouTube URL");
	const result = await fetchTranscript(url, { videoDetails: true });
	const segments = "segments" in result ? result.segments : result;
	const body = toPlainText(segments);
	return {
		url,
		title: "videoDetails" in result ? result.videoDetails?.title : void 0,
		body,
		metadata: {
			sourceType: "youtube",
			videoId,
			segmentCount: segments.length
		},
		provider: "youtube-transcript-plus"
	};
}
var CACHE_TTL_MS = 10080 * 60 * 1e3;
function hashUrl(url) {
	return createHash("sha256").update(url).digest("hex");
}
async function readCache(url) {
	try {
		const admin = createSupabaseAdminClient();
		const urlHash = hashUrl(url);
		const { data } = await admin.from("source_extractions").select("*").eq("url_hash", urlHash).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).maybeSingle();
		if (!data) return null;
		return {
			url: data.url,
			sourceType: data.source_type,
			title: data.title ?? void 0,
			body: data.body ?? "",
			metadata: data.metadata ?? {},
			provider: data.provider,
			status: data.status
		};
	} catch {
		return null;
	}
}
async function writeCache(doc) {
	try {
		const admin = createSupabaseAdminClient();
		const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
		await admin.from("source_extractions").upsert({
			url_hash: hashUrl(doc.url),
			url: doc.url,
			source_type: doc.sourceType,
			status: doc.status,
			provider: doc.provider,
			title: doc.title ?? null,
			body: doc.body,
			metadata: doc.metadata,
			expires_at: expiresAt
		});
	} catch {}
}
async function extractByType(url, sourceType) {
	switch (sourceType) {
		case "youtube": return extractYoutube(url);
		case "linkedin": return extractSocialWithEscalation(url, "linkedin");
		case "instagram": return extractSocialWithEscalation(url, "instagram");
		default: return extractWebWithEscalation(url);
	}
}
async function getOrExtract(url, userText) {
	const cached = await readCache(url);
	if (cached) return normalizeExtracted(cached, userText);
	const sourceType = classifyUrl(url);
	try {
		const raw = await extractByType(url, sourceType);
		const doc = normalizeExtracted({
			url: raw.url,
			sourceType,
			title: raw.title,
			body: raw.body,
			metadata: raw.metadata,
			provider: raw.provider
		}, userText);
		if (doc.status !== "error") await writeCache(doc);
		return doc;
	} catch (e) {
		return normalizeExtracted({
			url,
			sourceType,
			title: void 0,
			body: "",
			metadata: {},
			provider: "none",
			error: e.message
		}, userText);
	}
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
function rowToSummary(row) {
	const digest = DigestSchema.parse(row.payload);
	return {
		id: row.id,
		createdAt: row.created_at,
		title: row.title ?? formatArtifactTitle(new Date(row.created_at)),
		dumpCount: row.dump_count,
		overview: digest.overview
	};
}
function isDigestsTableMissing(error) {
	return error?.code === "PGRST205" || error?.message?.includes("Could not find the table") === true;
}
async function saveArtifact(userId, digest, dumpCount) {
	const createdAt = /* @__PURE__ */ new Date();
	const title = formatArtifactTitle(createdAt);
	const supabase = createSupabaseServerClient();
	const base = {
		user_id: userId,
		payload: digest,
		dump_count: dumpCount
	};
	let result = await supabase.from("digests").insert({
		...base,
		title
	}).select("id, created_at, title, dump_count, payload").single();
	if (result.error?.message?.includes("title")) result = await supabase.from("digests").insert(base).select("id, created_at, title, dump_count, payload").single();
	const { data, error } = result;
	if (error) {
		if (isDigestsTableMissing(error)) return {
			id: crypto.randomUUID(),
			createdAt: createdAt.toISOString(),
			title,
			dumpCount,
			overview: digest.overview
		};
		throw new Error("Could not save this edition to your account.");
	}
	return rowToSummary(data);
}
async function loadDumpsForUser(payloadDumps) {
	const supabase = createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (user) {
		const { data, error } = await supabase.from("dumps").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
		if (error) throw new Error("Could not load dumps from your account.");
		const pile = activePileFromDbRows(data ?? []);
		if (pile.length === 0) throw new Error("Nothing in the pile yet.");
		return pile.map((d) => ({
			id: d.id,
			type: d.type,
			kind: d.kind,
			content: d.content,
			createdAt: d.createdAt,
			done: d.done
		}));
	}
	if (!payloadDumps?.length) throw new Error("Nothing in the pile yet.");
	return payloadDumps;
}
var generateDigest_createServerFn_handler = createServerRpc({
	id: "6e3244eb4ecc018adcfb4d17be03a783e4731bf714cacf00c7f76a264689ed32",
	name: "generateDigest",
	filename: "src/lib/digest.functions.ts"
}, (opts) => generateDigest.__executeServer(opts));
var generateDigest = createServerFn({ method: "POST" }).validator((input) => InputSchema.parse(input)).handler(generateDigest_createServerFn_handler, async ({ data }) => {
	if (!process.env.ANTHROPIC_API_KEY) throw new Error("Missing ANTHROPIC_API_KEY");
	const dumps = await loadDumpsForUser(data.dumps);
	const urlToUserText = /* @__PURE__ */ new Map();
	for (const d of dumps) {
		if (d.type !== "read") continue;
		for (const url of extractUrls(d.content)) if (!urlToUserText.has(url)) urlToUserText.set(url, d.content.replace(url, "").trim());
	}
	const urlList = Array.from(urlToUserText.keys()).slice(0, 30);
	const settled = await Promise.allSettled(urlList.map((url) => getOrExtract(url, urlToUserText.get(url))));
	const byUrl = new Map(settled.map((result, i) => {
		const url = urlList[i];
		if (result.status === "fulfilled") return [url, result.value];
		return [url, {
			url,
			sourceType: "unknown",
			body: "",
			metadata: {},
			provider: "none",
			status: "error",
			error: result.reason?.message ?? "Extraction failed"
		}];
	}));
	const groups = {
		read: [],
		todo: [],
		idea: [],
		note: []
	};
	for (const d of dumps) groups[d.type].push(d);
	const lines = [];
	for (const type of [
		"read",
		"todo",
		"idea",
		"note"
	]) {
		const items = groups[type];
		if (items.length === 0) continue;
		lines.push(`### ${type.toUpperCase()} ITEMS`);
		items.forEach((d, i) => {
			lines.push(`-- ${type} #${i + 1}${d.done ? " [DONE]" : ""} --`);
			lines.push(d.content.trim());
			if (type === "read") for (const u of extractUrls(d.content)) {
				const doc = byUrl.get(u);
				if (doc) lines.push(formatExtractedForPrompt(doc));
			}
			lines.push("");
		});
	}
	const { object } = await generateObject({
		model: anthropic("claude-haiku-4-5"),
		schema: DigestSchema,
		maxOutputTokens: 1e4,
		system: "You are an end-of-day personal assistant. Input is a mixed pile of READ items (links/articles to summarize), TODO items (things the user wants to do later), IDEA items (adhoc thoughts to brainstorm), and NOTE items (things to remember). For each section: READ -> abstract digest with sources; TODO -> normalize the task, infer when/priority; IDEA -> echo the seed and offer angles to explore; NOTE -> tighten the wording. Calm, editorial, no fluff. If a section has no items, return an empty array for it.",
		prompt: `EOD pile:\n\n${lines.join("\n")}`
	});
	const { data: { user } } = await createSupabaseServerClient().auth.getUser();
	let artifact;
	if (user) artifact = await saveArtifact(user.id, object, dumps.length);
	else {
		const createdAt = /* @__PURE__ */ new Date();
		artifact = {
			id: crypto.randomUUID(),
			createdAt: createdAt.toISOString(),
			title: formatArtifactTitle(createdAt),
			dumpCount: dumps.length,
			overview: object.overview
		};
	}
	return {
		digest: object,
		artifact
	};
});
//#endregion
export { generateDigest_createServerFn_handler };
