import { t as __commonJSMin } from "../_runtime.mjs";
import { n as require_src$2, t as require_src$3 } from "./@metascraper/helpers+[...].mjs";
import { t as require_commonjs } from "./cheerio+[...].mjs";
//#region node_modules/whoops/src/index.js
var require_src$1 = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	function createErrorClass(ErrorClass) {
		return (name, defaults) => {
			class CustomError extends ErrorClass {
				constructor(raw = {}) {
					super(raw);
					const { message, ...props } = Object.assign({}, defaults, typeof raw === "string" ? { message: raw } : raw);
					Object.keys(props).forEach((key) => this[key] = props[key]);
					if (message) this.description = typeof message === "function" ? message(props) : message;
					this.message = this.code ? `${this.code}, ${this.description}` : this.description;
					this.name = name || ErrorClass.name;
				}
			}
			Object.defineProperty(CustomError, "name", {
				value: name || ErrorClass.name,
				writable: false
			});
			function CustomErrorFactory(props) {
				return new CustomError(props);
			}
			Object.defineProperty(CustomErrorFactory, "name", {
				value: name || ErrorClass.name,
				writable: false
			});
			CustomErrorFactory.prototype = CustomError.prototype;
			return CustomErrorFactory;
		};
	}
	module.exports = createErrorClass(Error);
	module.exports.type = createErrorClass(TypeError);
	module.exports.range = createErrorClass(RangeError);
	module.exports.eval = createErrorClass(EvalError);
	module.exports.syntax = createErrorClass(SyntaxError);
	module.exports.reference = createErrorClass(ReferenceError);
	module.exports.uri = createErrorClass(URIError);
}));
//#endregion
//#region node_modules/metascraper/src/rules.js
var require_rules = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var castArray = (value) => Array.isArray(value) ? value : [value];
	var loadRules = (rulesBundle) => {
		const acc = {};
		for (const { test, pkgName, ...rules } of rulesBundle) for (const [propName, innerRules] of Object.entries(rules)) {
			const processedRules = castArray(innerRules);
			if (test || pkgName) for (const rule of processedRules) {
				if (test) rule.test = test;
				if (pkgName) rule.pkgName = pkgName ?? "unknown";
			}
			if (acc[propName]) acc[propName].push(...processedRules);
			else acc[propName] = processedRules;
		}
		return Object.entries(acc);
	};
	var mergeRules = (rules, baseRules, omitPropNames = /* @__PURE__ */ new Set(), pickPropNames) => {
		const hasPickProps = Boolean(pickPropNames && pickPropNames.size > 0);
		const hasOmittedProps = Boolean(omitPropNames && omitPropNames.size > 0);
		const hasInlineRules = Array.isArray(rules) && rules.length > 0;
		if (!hasPickProps && !hasOmittedProps && !hasInlineRules) return baseRules;
		const result = {};
		const shouldIncludeProp = (propName) => {
			if (hasPickProps) return pickPropNames.has(propName);
			return !omitPropNames.has(propName);
		};
		for (const [propName, ruleArray] of baseRules) if (shouldIncludeProp(propName)) result[propName] = ruleArray;
		if (!hasInlineRules) return Object.entries(result);
		for (const { test, ...ruleSet } of rules) for (const [propName, innerRules] of Object.entries(ruleSet)) {
			if (!shouldIncludeProp(propName)) continue;
			const processedRules = castArray(innerRules);
			if (test) for (const rule of processedRules) rule.test = test;
			if (result[propName]) result[propName] = processedRules.concat(result[propName]);
			else result[propName] = processedRules;
		}
		return Object.entries(result);
	};
	module.exports = {
		mergeRules,
		loadRules
	};
}));
//#endregion
//#region node_modules/metascraper/src/get-data.js
var require_get_data = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var debug = require_src$2()("metascraper:get-data");
	var { findRule, has } = require_src$3();
	var getData = async ({ rules, ...props }) => {
		const data = {};
		await Promise.all(rules.map(async ([propName, innerRules]) => {
			const duration = debug.duration();
			let normalizedValue = null;
			let status = "ok";
			try {
				const value = await findRule(innerRules, props, propName);
				normalizedValue = has(value) ? value : null;
			} catch (error) {
				status = "error";
				debug("rule:error", {
					propName,
					rules: innerRules.length,
					errorName: error?.name,
					errorMessage: error?.message
				});
			}
			duration(`${propName}=${normalizedValue} rules=${innerRules.length} status=${status}`);
			data[propName] = normalizedValue;
		}));
		return data;
	};
	module.exports = getData;
}));
//#endregion
//#region node_modules/metascraper/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var { isUrl } = require_src$3();
	var { load } = require_commonjs();
	var whoops = require_src$1();
	var { loadRules, mergeRules } = require_rules();
	var getData = require_get_data();
	var MetascraperError = whoops("MetascraperError");
	module.exports = (rules) => {
		const loadedRules = loadRules(rules);
		return async ({ url, html = "", htmlDom, rules: inlineRules, validateUrl = true, omitPropNames = /* @__PURE__ */ new Set(), pickPropNames, ...props } = {}) => {
			if (validateUrl && !isUrl(url)) throw new MetascraperError({
				message: "Need to provide a valid URL.",
				code: "INVALID_URL"
			});
			return getData({
				url,
				htmlDom: htmlDom ?? load(html, { baseURI: url }),
				rules: mergeRules(inlineRules, loadedRules, omitPropNames, pickPropNames),
				...props
			});
		};
	};
}));
//#endregion
export { require_src as t };
