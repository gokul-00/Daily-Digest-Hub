import { t as __commonJSMin } from "../_runtime.mjs";
import { t as require_src$1 } from "./@metascraper/helpers+[...].mjs";
//#region node_modules/metascraper-author/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { $jsonld, $filter, toRule, date, author } = require_src$1();
	var REGEX_STRICT = /^\S+\s+\S+/;
	var toAuthor = toRule(author);
	/**
	* Enforce stricter matching for a `rule`.
	*
	* @param {Function} rule
	* @return {Function} stricter
	*/
	var strict = (rule) => ($) => {
		const value = rule($);
		return REGEX_STRICT.test(value) && value;
	};
	module.exports = () => {
		const rules = { author: [
			toAuthor($jsonld("author.name")),
			toAuthor($jsonld("brand.name")),
			toAuthor(($) => $("meta[name=\"author\"]").attr("content")),
			toAuthor(($) => $("meta[property=\"article:author\"]").attr("content")),
			toAuthor(($) => $filter($, $("[itemprop*=\"author\" i] [itemprop=\"name\"]"))),
			toAuthor(($) => $filter($, $("[itemprop*=\"author\" i]"))),
			toAuthor(($) => $filter($, $("[rel=\"author\"]"))),
			strict(toAuthor(($) => $filter($, $("a[class*=\"author\" i]")))),
			strict(toAuthor(($) => $filter($, $("[class*=\"author\" i] a")))),
			strict(toAuthor(($) => $filter($, $("a[href*=\"/author/\" i]")))),
			toAuthor(($) => $filter($, $("a[class*=\"screenname\" i]"))),
			strict(toAuthor(($) => $filter($, $("[class*=\"author\" i]")))),
			strict(toAuthor(($) => $filter($, $("[class*=\"byline\" i]"), (el) => {
				const value = $filter.fn(el);
				return !date(value) && value;
			})))
		] };
		rules.pkgName = "metascraper-author";
		return rules;
	};
}));
//#endregion
export { require_src as t };
