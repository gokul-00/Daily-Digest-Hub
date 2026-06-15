import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as createSupabaseServerClient, t as createServerRpc } from "./server-C_WZiU59.mjs";
import { Z as object, et as string } from "../_libs/@ai-sdk/anthropic+[...].mjs";
import { n as formatArtifactTitle, t as DigestSchema } from "./digest.shared-DcEcIIgD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/digest-artifacts.functions-C2TFjO6w.js
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
function rowToArtifact(row) {
	const digest = DigestSchema.parse(row.payload);
	return {
		...rowToSummary(row),
		digest
	};
}
function isDigestsTableMissing(error) {
	return error?.code === "PGRST205" || error?.message?.includes("Could not find the table") === true;
}
var listArtifacts_createServerFn_handler = createServerRpc({
	id: "4ae1e44874f29d8457ddac0e85dd82ad888557b2311d29197e9255307303bfd6",
	name: "listArtifacts",
	filename: "src/lib/digest-artifacts.functions.ts"
}, (opts) => listArtifacts.__executeServer(opts));
var listArtifacts = createServerFn({ method: "POST" }).handler(listArtifacts_createServerFn_handler, async () => {
	const supabase = createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return { artifacts: [] };
	const { data, error } = await supabase.from("digests").select("id, created_at, title, dump_count, payload").eq("user_id", user.id).order("created_at", { ascending: false }).limit(50);
	if (error) {
		if (isDigestsTableMissing(error)) return { artifacts: [] };
		throw new Error("Could not load past editions.");
	}
	return { artifacts: data.map(rowToSummary) };
});
var ArtifactIdSchema = object({ id: string().uuid() });
var getArtifact_createServerFn_handler = createServerRpc({
	id: "9223c8a23386760c4dfa2f20ff21dbeaba5689e9edf79d9581ee72cbb35a5285",
	name: "getArtifact",
	filename: "src/lib/digest-artifacts.functions.ts"
}, (opts) => getArtifact.__executeServer(opts));
var getArtifact = createServerFn({ method: "POST" }).validator((input) => ArtifactIdSchema.parse(input)).handler(getArtifact_createServerFn_handler, async ({ data }) => {
	const supabase = createSupabaseServerClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return null;
	const { data: row, error } = await supabase.from("digests").select("id, created_at, title, dump_count, payload").eq("user_id", user.id).eq("id", data.id).maybeSingle();
	if (error) {
		if (isDigestsTableMissing(error)) return null;
		throw new Error("Could not load that edition.");
	}
	if (!row) return null;
	return rowToArtifact(row);
});
//#endregion
export { getArtifact_createServerFn_handler, listArtifacts_createServerFn_handler };
