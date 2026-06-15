import { o as __toESM } from "../_runtime.mjs";
import { D as isRedirect, _ as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { Z as object, et as string } from "../_libs/@ai-sdk/anthropic+[...].mjs";
import { t as createSsrRpc } from "./createSsrRpc-CQSBy_4U.mjs";
import { t as getSupabaseBrowserClient } from "./client-CWvg5vgi.mjs";
import { c as require_react } from "../_libs/@emotion/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/digest-artifacts.functions-BrxI9ziH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
function useAuth() {
	const [user, setUser] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		const supabase = getSupabaseBrowserClient();
		supabase.auth.getUser().then(({ data: { user: current } }) => {
			setUser(current);
			setLoading(false);
		});
		const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
			setLoading(false);
		});
		return () => subscription.unsubscribe();
	}, []);
	async function signOut() {
		await getSupabaseBrowserClient().auth.signOut();
		setUser(null);
	}
	return {
		user,
		loading,
		signOut
	};
}
var listArtifacts = createServerFn({ method: "POST" }).handler(createSsrRpc("4ae1e44874f29d8457ddac0e85dd82ad888557b2311d29197e9255307303bfd6"));
var ArtifactIdSchema = object({ id: string().uuid() });
var getArtifact = createServerFn({ method: "POST" }).validator((input) => ArtifactIdSchema.parse(input)).handler(createSsrRpc("9223c8a23386760c4dfa2f20ff21dbeaba5689e9edf79d9581ee72cbb35a5285"));
//#endregion
export { useServerFn as i, listArtifacts as n, useAuth as r, getArtifact as t };
