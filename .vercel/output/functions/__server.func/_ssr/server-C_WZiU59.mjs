import { i as TSS_SERVER_FUNCTION } from "./esm-B50dUWcE.mjs";
import { i as setResponseHeader, t as getRequest } from "./request-response-B3cB1PJw.mjs";
import { i as serializeCookieHeader, r as parseCookieHeader, t as createServerClient } from "../_libs/@supabase/ssr+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-C_WZiU59.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function getSupabaseEnv() {
	const url = process.env.VITE_SUPABASE_URL;
	const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
	if (!url || !anonKey) throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
	return {
		url,
		anonKey
	};
}
function createSupabaseServerClient() {
	const { url, anonKey } = getSupabaseEnv();
	const request = getRequest();
	return createServerClient(url, anonKey, { cookies: {
		getAll() {
			return parseCookieHeader(request.headers.get("Cookie") ?? "");
		},
		setAll(cookiesToSet) {
			for (const { name, value, options } of cookiesToSet) setResponseHeader("Set-Cookie", serializeCookieHeader(name, value, options));
		}
	} });
}
//#endregion
export { createSupabaseServerClient as n, createServerRpc as t };
