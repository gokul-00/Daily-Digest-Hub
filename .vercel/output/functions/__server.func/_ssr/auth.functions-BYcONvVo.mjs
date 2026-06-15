import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { n as createSupabaseServerClient, t as createServerRpc } from "./server-C_WZiU59.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.functions-BYcONvVo.js
var getSession_createServerFn_handler = createServerRpc({
	id: "753fb13391a5b0328ea3344426a11caf1f07e6f28fcdc91937757498d31af961",
	name: "getSession",
	filename: "src/lib/auth.functions.ts"
}, (opts) => getSession.__executeServer(opts));
var getSession = createServerFn({ method: "GET" }).handler(getSession_createServerFn_handler, async () => {
	const { data: { user }, error } = await createSupabaseServerClient().auth.getUser();
	if (error || !user) return { user: null };
	return { user: {
		id: user.id,
		email: user.email ?? null
	} };
});
//#endregion
export { getSession_createServerFn_handler };
