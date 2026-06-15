//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-HxA0r44m.js
var manifest = {
	"4ae1e44874f29d8457ddac0e85dd82ad888557b2311d29197e9255307303bfd6": {
		functionName: "listArtifacts_createServerFn_handler",
		importer: () => import("./_ssr/digest-artifacts.functions-C2TFjO6w.mjs")
	},
	"6e3244eb4ecc018adcfb4d17be03a783e4731bf714cacf00c7f76a264689ed32": {
		functionName: "generateDigest_createServerFn_handler",
		importer: () => import("./_ssr/digest.functions-CgKJVJLK.mjs")
	},
	"753fb13391a5b0328ea3344426a11caf1f07e6f28fcdc91937757498d31af961": {
		functionName: "getSession_createServerFn_handler",
		importer: () => import("./_ssr/auth.functions-BYcONvVo.mjs")
	},
	"9223c8a23386760c4dfa2f20ff21dbeaba5689e9edf79d9581ee72cbb35a5285": {
		functionName: "getArtifact_createServerFn_handler",
		importer: () => import("./_ssr/digest-artifacts.functions-C2TFjO6w.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
