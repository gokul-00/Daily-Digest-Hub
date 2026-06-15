import { t as __commonJSMin } from "../_runtime.mjs";
import { t as require_src$1 } from "./@metascraper/helpers+[...].mjs";
//#region node_modules/metascraper-title/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { $jsonld, $filter, title, toRule } = require_src$1();
	var toTitle = toRule(title);
	module.exports = () => {
		const rules = { title: [
			toTitle(($) => $("meta[property=\"og:title\"]").attr("content")),
			toTitle(($) => $("meta[name=\"twitter:title\"]").attr("content")),
			toTitle(($) => $("meta[property=\"twitter:title\"]").attr("content")),
			toTitle(($) => $filter($, $("title"))),
			toTitle($jsonld("headline")),
			toTitle(($) => $filter($, $(".post-title"))),
			toTitle(($) => $filter($, $(".entry-title"))),
			toTitle(($) => $filter($, $("h1[class*=\"title\" i] a"))),
			toTitle(($) => $filter($, $("h1[class*=\"title\" i]")))
		] };
		rules.pkgName = "metascraper-title";
		return rules;
	};
}));
//#endregion
export { require_src as t };
