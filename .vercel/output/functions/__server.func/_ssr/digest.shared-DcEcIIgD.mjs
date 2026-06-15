import { U as array, W as boolean, Z as object, et as string, z as _enum } from "../_libs/@ai-sdk/anthropic+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/digest.shared-DcEcIIgD.js
var SourceSchema = object({
	url: string(),
	label: string()
});
var ReadItemSchema = object({
	title: string(),
	tldr: string(),
	keyPoints: array(string()),
	category: string(),
	tags: array(string()),
	worthDeepDive: boolean(),
	sources: array(SourceSchema)
});
var TodoItemSchema = object({
	task: string(),
	context: string(),
	when: string(),
	priority: _enum([
		"high",
		"medium",
		"low"
	]),
	tags: array(string())
});
var IdeaItemSchema = object({
	title: string(),
	seed: string(),
	expand: string(),
	tags: array(string())
});
var NoteItemSchema = object({
	title: string(),
	body: string(),
	tags: array(string())
});
var DigestSchema = object({
	overview: string(),
	themes: array(string()),
	reading: array(ReadItemSchema),
	todos: array(TodoItemSchema),
	ideas: array(IdeaItemSchema),
	notes: array(NoteItemSchema)
});
function formatArtifactTitle(date) {
	return `Evening edition — ${date.toLocaleDateString(void 0, {
		weekday: "long",
		month: "long",
		day: "numeric"
	})} · ${date.toLocaleTimeString(void 0, {
		hour: "numeric",
		minute: "2-digit"
	})}`;
}
var LOCAL_ARTIFACTS_KEY = "later.artifacts.v1";
function localArtifactsKey(userId) {
	return `${LOCAL_ARTIFACTS_KEY}.${userId}`;
}
function readLocalArtifacts(userId) {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(localArtifactsKey(userId));
		if (!raw) return [];
		return JSON.parse(raw).map((a) => ({
			...a,
			digest: DigestSchema.parse(a.digest)
		}));
	} catch {
		return [];
	}
}
function writeLocalArtifact(userId, artifact) {
	if (typeof window === "undefined") return;
	const next = [artifact, ...readLocalArtifacts(userId).filter((a) => a.id !== artifact.id)].slice(0, 50);
	window.localStorage.setItem(localArtifactsKey(userId), JSON.stringify(next));
}
function summariesFromArtifacts(artifacts) {
	return artifacts.map(({ id, createdAt, title, dumpCount, overview }) => ({
		id,
		createdAt,
		title,
		dumpCount,
		overview
	}));
}
//#endregion
export { writeLocalArtifact as a, summariesFromArtifacts as i, formatArtifactTitle as n, readLocalArtifacts as r, DigestSchema as t };
