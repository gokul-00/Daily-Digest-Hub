import { A as redirect, f as lazyRouteComponent, p as createFileRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createSsrRpc } from "./createSsrRpc-CQSBy_4U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/digest._id-C6oYk2L7.js
var getSession = createServerFn({ method: "GET" }).handler(createSsrRpc("753fb13391a5b0328ea3344426a11caf1f07e6f28fcdc91937757498d31af961"));
var $$splitComponentImporter = () => import("./digest._id-R1dLTN9C.mjs");
var Route = createFileRoute("/digest/$id")({
	beforeLoad: async () => {
		const { user } = await getSession();
		if (!user) throw redirect({ to: "/login" });
	},
	head: () => ({ meta: [{ title: "Edition — Later." }, {
		name: "description",
		content: "Your evening brief."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { getSession as n, Route as t };
