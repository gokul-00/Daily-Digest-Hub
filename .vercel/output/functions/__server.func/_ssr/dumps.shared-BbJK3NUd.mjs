//#region node_modules/.nitro/vite/services/ssr/assets/dumps.shared-BbJK3NUd.js
function rowToDump(row) {
	return {
		id: row.id,
		type: row.type,
		kind: row.kind,
		content: row.content,
		createdAt: new Date(row.created_at).getTime(),
		done: row.done,
		doneAt: row.done_at ? new Date(row.done_at).getTime() : void 0
	};
}
function dumpToRow(dump, userId) {
	return {
		id: dump.id,
		user_id: userId,
		type: dump.type,
		kind: dump.kind,
		content: dump.content,
		done: dump.done,
		created_at: new Date(dump.createdAt).toISOString(),
		done_at: dump.doneAt ? new Date(dump.doneAt).toISOString() : null
	};
}
function makeDump(content, type) {
	const trimmed = content.trim();
	const kind = /^https?:\/\//i.test(trimmed) ? "link" : "text";
	return {
		id: crypto.randomUUID(),
		type,
		kind,
		content: trimmed,
		createdAt: Date.now(),
		done: false
	};
}
function startOfToday() {
	const d = /* @__PURE__ */ new Date();
	d.setHours(0, 0, 0, 0);
	return d.getTime();
}
/** Open items (carry-over) + anything added today, even if done. */
function activePile(dumps) {
	const cutoff = startOfToday();
	return dumps.filter((d) => !d.done || d.createdAt >= cutoff);
}
function activePileFromDbRows(rows) {
	return activePile(rows.map(rowToDump));
}
//#endregion
export { rowToDump as a, makeDump as i, activePileFromDbRows as n, dumpToRow as r, activePile as t };
