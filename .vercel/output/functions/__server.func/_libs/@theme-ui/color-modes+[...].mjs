import { a as __toCommonJS, n as __esmMin, o as __toESM, r as __exportAll, t as __commonJSMin } from "../../_runtime.mjs";
import { a as package_exports, c as require_react, i as init_package, n as import_emotion_react_cjs, o as require_emotion_react_cjs, r as init_emotion_react_cjs, t as require_emotion_react_jsx_runtime_cjs } from "../@emotion/react+[...].mjs";
import { l as require_cjs } from "../@extractus/article-extractor.mjs";
//#region node_modules/@theme-ui/css/dist/theme-ui-css.cjs.prod.js
var require_theme_ui_css_cjs_prod = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	/**
	* Allows for nested scales with shorthand values
	* @example
	* {
	*   colors: {
	*     primary: { __default: '#00f', light: '#33f' }
	*   }
	* }
	* css({ color: 'primary' }); // { color: '#00f' }
	* css({ color: 'primary.light' }) // { color: '#33f' }
	*/
	var THEME_UI_DEFAULT_KEY = "__default";
	var hasDefault = (x) => {
		return typeof x === "object" && x !== null && THEME_UI_DEFAULT_KEY in x;
	};
	/**
	* Extracts value under path from a deeply nested object.
	* Used for Themes, variants and Theme UI style objects.
	* Given a path to object with `__default` key, returns the value under that key.
	*
	* @param obj a theme, variant or style object
	* @param path path separated with dots (`.`)
	* @param fallback default value returned if get(obj, path) is not found
	*/
	function get(obj, path, fallback, p, undef) {
		const pathArray = path && typeof path === "string" ? path.split(".") : [path];
		for (p = 0; p < pathArray.length; p++) obj = obj ? obj[pathArray[p]] : undef;
		if (obj === undef) return fallback;
		return hasDefault(obj) ? obj[THEME_UI_DEFAULT_KEY] : obj;
	}
	var getObjectWithVariants = (obj, theme) => {
		if (obj && obj["variant"]) {
			let result = {};
			for (const key in obj) {
				const x = obj[key];
				if (key === "variant") {
					const variant = getObjectWithVariants(get(theme, typeof x === "function" ? x(theme) : x), theme);
					result = {
						...result,
						...variant
					};
				} else result[key] = x;
			}
			return result;
		}
		return obj;
	};
	var defaultBreakpoints = [
		40,
		52,
		64
	].map((n) => n + "em");
	var defaultTheme = {
		space: [
			0,
			4,
			8,
			16,
			32,
			64,
			128,
			256,
			512
		],
		fontSizes: [
			12,
			14,
			16,
			20,
			24,
			32,
			48,
			64,
			72
		]
	};
	var aliases = {
		bg: "backgroundColor",
		m: "margin",
		mt: "marginTop",
		mr: "marginRight",
		mb: "marginBottom",
		ml: "marginLeft",
		mx: "marginX",
		my: "marginY",
		p: "padding",
		pt: "paddingTop",
		pr: "paddingRight",
		pb: "paddingBottom",
		pl: "paddingLeft",
		px: "paddingX",
		py: "paddingY"
	};
	var multiples = {
		marginX: ["marginLeft", "marginRight"],
		marginY: ["marginTop", "marginBottom"],
		paddingX: ["paddingLeft", "paddingRight"],
		paddingY: ["paddingTop", "paddingBottom"],
		scrollMarginX: ["scrollMarginLeft", "scrollMarginRight"],
		scrollMarginY: ["scrollMarginTop", "scrollMarginBottom"],
		scrollPaddingX: ["scrollPaddingLeft", "scrollPaddingRight"],
		scrollPaddingY: ["scrollPaddingTop", "scrollPaddingBottom"],
		size: ["width", "height"]
	};
	var scales = {
		color: "colors",
		background: "colors",
		accentColor: "colors",
		backgroundColor: "colors",
		borderColor: "colors",
		caretColor: "colors",
		columnRuleColor: "colors",
		outlineColor: "colors",
		textDecorationColor: "colors",
		opacity: "opacities",
		transition: "transitions",
		margin: "space",
		marginTop: "space",
		marginRight: "space",
		marginBottom: "space",
		marginLeft: "space",
		marginX: "space",
		marginY: "space",
		marginBlock: "space",
		marginBlockEnd: "space",
		marginBlockStart: "space",
		marginInline: "space",
		marginInlineEnd: "space",
		marginInlineStart: "space",
		padding: "space",
		paddingTop: "space",
		paddingRight: "space",
		paddingBottom: "space",
		paddingLeft: "space",
		paddingX: "space",
		paddingY: "space",
		paddingBlock: "space",
		paddingBlockEnd: "space",
		paddingBlockStart: "space",
		paddingInline: "space",
		paddingInlineEnd: "space",
		paddingInlineStart: "space",
		scrollMargin: "space",
		scrollMarginTop: "space",
		scrollMarginRight: "space",
		scrollMarginBottom: "space",
		scrollMarginLeft: "space",
		scrollMarginX: "space",
		scrollMarginY: "space",
		scrollPadding: "space",
		scrollPaddingTop: "space",
		scrollPaddingRight: "space",
		scrollPaddingBottom: "space",
		scrollPaddingLeft: "space",
		scrollPaddingX: "space",
		scrollPaddingY: "space",
		inset: "space",
		insetBlock: "space",
		insetBlockEnd: "space",
		insetBlockStart: "space",
		insetInline: "space",
		insetInlineEnd: "space",
		insetInlineStart: "space",
		top: "space",
		right: "space",
		bottom: "space",
		left: "space",
		gridGap: "space",
		gridColumnGap: "space",
		gridRowGap: "space",
		gap: "space",
		columnGap: "space",
		rowGap: "space",
		fontFamily: "fonts",
		fontSize: "fontSizes",
		fontWeight: "fontWeights",
		lineHeight: "lineHeights",
		letterSpacing: "letterSpacings",
		border: "borders",
		borderTop: "borders",
		borderRight: "borders",
		borderBottom: "borders",
		borderLeft: "borders",
		borderWidth: "borderWidths",
		borderStyle: "borderStyles",
		borderRadius: "radii",
		borderTopRightRadius: "radii",
		borderTopLeftRadius: "radii",
		borderBottomRightRadius: "radii",
		borderBottomLeftRadius: "radii",
		borderTopWidth: "borderWidths",
		borderTopColor: "colors",
		borderTopStyle: "borderStyles",
		borderBottomWidth: "borderWidths",
		borderBottomColor: "colors",
		borderBottomStyle: "borderStyles",
		borderLeftWidth: "borderWidths",
		borderLeftColor: "colors",
		borderLeftStyle: "borderStyles",
		borderRightWidth: "borderWidths",
		borderRightColor: "colors",
		borderRightStyle: "borderStyles",
		borderBlock: "borders",
		borderBlockColor: "colors",
		borderBlockEnd: "borders",
		borderBlockEndColor: "colors",
		borderBlockEndStyle: "borderStyles",
		borderBlockEndWidth: "borderWidths",
		borderBlockStart: "borders",
		borderBlockStartColor: "colors",
		borderBlockStartStyle: "borderStyles",
		borderBlockStartWidth: "borderWidths",
		borderBlockStyle: "borderStyles",
		borderBlockWidth: "borderWidths",
		borderEndEndRadius: "radii",
		borderEndStartRadius: "radii",
		borderInline: "borders",
		borderInlineColor: "colors",
		borderInlineEnd: "borders",
		borderInlineEndColor: "colors",
		borderInlineEndStyle: "borderStyles",
		borderInlineEndWidth: "borderWidths",
		borderInlineStart: "borders",
		borderInlineStartColor: "colors",
		borderInlineStartStyle: "borderStyles",
		borderInlineStartWidth: "borderWidths",
		borderInlineStyle: "borderStyles",
		borderInlineWidth: "borderWidths",
		borderStartEndRadius: "radii",
		borderStartStartRadius: "radii",
		columnRuleWidth: "borderWidths",
		boxShadow: "shadows",
		textShadow: "shadows",
		zIndex: "zIndices",
		width: "sizes",
		minWidth: "sizes",
		maxWidth: "sizes",
		height: "sizes",
		minHeight: "sizes",
		maxHeight: "sizes",
		flexBasis: "sizes",
		size: "sizes",
		blockSize: "sizes",
		inlineSize: "sizes",
		maxBlockSize: "sizes",
		maxInlineSize: "sizes",
		minBlockSize: "sizes",
		minInlineSize: "sizes",
		columnWidth: "sizes",
		fill: "colors",
		stroke: "colors"
	};
	var positiveOrNegative = (scale, value) => {
		if (typeof value !== "number" || value >= 0) {
			if (typeof value === "string" && value.startsWith("-")) {
				const valueWithoutMinus = value.substring(1);
				const n = get(scale, valueWithoutMinus, valueWithoutMinus);
				if (typeof n === "number") return n * -1;
				return `-${n}`;
			}
			return get(scale, value, value);
		}
		const absolute = Math.abs(value);
		const n = get(scale, absolute, absolute);
		if (typeof n === "string") return "-" + n;
		return Number(n) * -1;
	};
	var transforms = [
		"margin",
		"marginTop",
		"marginRight",
		"marginBottom",
		"marginLeft",
		"marginX",
		"marginY",
		"marginBlock",
		"marginBlockEnd",
		"marginBlockStart",
		"marginInline",
		"marginInlineEnd",
		"marginInlineStart",
		"top",
		"bottom",
		"left",
		"right"
	].reduce((acc, curr) => ({
		...acc,
		[curr]: positiveOrNegative
	}), {});
	var responsive = (styles) => (theme) => {
		const next = {};
		const mediaQueries = [null, ...(theme && theme.breakpoints || defaultBreakpoints).map((n) => n.includes("@media") ? n : `@media screen and (min-width: ${n})`)];
		for (const k in styles) {
			const key = k;
			let value = styles[key];
			if (typeof value === "function") value = value(theme || {});
			if (value === false || value == null) continue;
			if (!Array.isArray(value)) {
				next[key] = value;
				continue;
			}
			for (let i = 0; i < value.slice(0, mediaQueries.length).length; i++) {
				const media = mediaQueries[i];
				if (!media) {
					next[key] = value[i];
					continue;
				}
				next[media] = next[media] || {};
				if (value[i] == null) continue;
				next[media][key] = value[i];
			}
		}
		return next;
	};
	var css = (args = {}) => (props = {}) => {
		const theme = {
			...defaultTheme,
			..."theme" in props ? props.theme : props
		};
		const styles = responsive(getObjectWithVariants(typeof args === "function" ? args(theme) : args, theme))(theme);
		let result = {};
		for (const key in styles) {
			const x = styles[key];
			const val = typeof x === "function" ? x(theme) : x;
			if (val && typeof val === "object") {
				if (hasDefault(val)) {
					result[key] = val[THEME_UI_DEFAULT_KEY];
					continue;
				}
				result[key] = css(val)(theme);
				continue;
			}
			const prop = key in aliases ? aliases[key] : key;
			const scaleName = prop in scales ? scales[prop] : void 0;
			const scale = scaleName ? theme?.[scaleName] : get(theme, prop, {});
			const value = get(transforms, prop, get)(scale, val, val);
			if (prop in multiples) {
				const dirs = multiples[prop];
				for (let i = 0; i < dirs.length; i++) result[dirs[i]] = value;
			} else result[prop] = value;
		}
		return result;
	};
	exports.THEME_UI_DEFAULT_KEY = THEME_UI_DEFAULT_KEY;
	exports.css = css;
	exports.defaultBreakpoints = defaultBreakpoints;
	exports.get = get;
	exports.getObjectWithVariants = getObjectWithVariants;
	exports.multiples = multiples;
	exports.scales = scales;
}));
//#endregion
//#region node_modules/@theme-ui/css/dist/theme-ui-css.cjs.js
var require_theme_ui_css_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_theme_ui_css_cjs_prod();
}));
//#endregion
//#region node_modules/@theme-ui/core/dist/parseProps-ca442ad1.cjs.prod.js
var require_parseProps_ca442ad1_cjs_prod = /* @__PURE__ */ __commonJSMin(((exports) => {
	var css = require_theme_ui_css_cjs();
	var getCSS = (props) => (theme) => {
		return [css.css(props.sx)(theme), typeof props.css === "function" ? props.css(theme) : props.css];
	};
	function parseProps(props) {
		if (!props || !props.sx && !props.css) return props;
		const next = {};
		for (let key in props) {
			if (key === "sx") continue;
			next[key] = props[key];
		}
		next.css = getCSS(props);
		return next;
	}
	exports.parseProps = parseProps;
}));
//#endregion
//#region node_modules/@theme-ui/core/dist/theme-ui-core.cjs.prod.js
var require_theme_ui_core_cjs_prod = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var react = require_emotion_react_cjs();
	var React = require_react();
	var deepmerge = require_cjs();
	var packageInfo = (init_package(), __toCommonJS(package_exports).default);
	var parseProps = require_parseProps_ca442ad1_cjs_prod();
	require_theme_ui_css_cjs();
	function _interopDefault(e) {
		return e && e.__esModule ? e : { "default": e };
	}
	function _interopNamespace(e) {
		if (e && e.__esModule) return e;
		var n = Object.create(null);
		if (e) Object.keys(e).forEach(function(k) {
			if (k !== "default") {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function() {
						return e[k];
					}
				});
			}
		});
		n["default"] = e;
		return Object.freeze(n);
	}
	var React__namespace = /*#__PURE__*/ _interopNamespace(React);
	var deepmerge__default = /*#__PURE__*/ _interopDefault(deepmerge);
	var __EMOTION_VERSION__ = (/* @__PURE__ */ _interopDefault(packageInfo))["default"].version;
	var jsx = (type, props, ...children) => react.jsx(type, parseProps.parseProps(props), ...children);
	/**
	* @internal for Babel JSX pragma
	* @see https://github.com/system-ui/theme-ui/issues/1603
	*/
	var createElement = jsx;
	/**
	* @internal
	*/
	var __themeUiDefaultContextValue = {
		__EMOTION_VERSION__,
		theme: {}
	};
	/**
	* @internal
	*/
	var __ThemeUIContext = /*#__PURE__*/ React__namespace.createContext(__themeUiDefaultContextValue);
	var useThemeUI = () => React__namespace.useContext(__ThemeUIContext);
	var canUseSymbol = typeof Symbol === "function" && Symbol.for;
	var REACT_ELEMENT = canUseSymbol ? Symbol.for("react.element") : 60103;
	var FORWARD_REF = canUseSymbol ? Symbol.for("react.forward_ref") : 60103;
	var deepmergeOptions = {
		isMergeableObject: (n) => {
			return !!n && typeof n === "object" && n.$$typeof !== REACT_ELEMENT && n.$$typeof !== FORWARD_REF;
		},
		arrayMerge: (_leftArray, rightArray) => rightArray
	};
	/**
	* Deeply merge themes
	*/
	var merge = (a, b) => deepmerge__default["default"](a, b, deepmergeOptions);
	function mergeAll(...args) {
		return deepmerge__default["default"].all(args, deepmergeOptions);
	}
	merge.all = mergeAll;
	/**
	* @internal
	*/
	var __ThemeUIInternalBaseThemeProvider = ({ context, children }) => jsx(react.ThemeContext.Provider, { value: context.theme }, jsx(__ThemeUIContext.Provider, {
		value: context,
		children
	}));
	function ThemeProvider({ theme, children }) {
		const outer = useThemeUI();
		return jsx(__ThemeUIInternalBaseThemeProvider, {
			context: typeof theme === "function" ? {
				...outer,
				theme: theme(outer.theme)
			} : merge.all({}, outer, { theme }),
			children
		});
	}
	exports.ThemeProvider = ThemeProvider;
	exports.__ThemeUIContext = __ThemeUIContext;
	exports.__ThemeUIInternalBaseThemeProvider = __ThemeUIInternalBaseThemeProvider;
	exports.__themeUiDefaultContextValue = __themeUiDefaultContextValue;
	exports.createElement = createElement;
	exports.jsx = jsx;
	exports.merge = merge;
	exports.useThemeUI = useThemeUI;
}));
//#endregion
//#region node_modules/@theme-ui/core/dist/theme-ui-core.cjs.js
var require_theme_ui_core_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_theme_ui_core_cjs_prod();
}));
//#endregion
//#region node_modules/@theme-ui/core/jsx-runtime/dist/theme-ui-core-jsx-runtime.cjs.prod.js
var require_theme_ui_core_jsx_runtime_cjs_prod = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var jsxRuntime = require_emotion_react_jsx_runtime_cjs();
	var parseProps = require_parseProps_ca442ad1_cjs_prod();
	var React = require_react();
	require_theme_ui_css_cjs();
	var jsx = (type, props, key) => jsxRuntime.jsx(type, parseProps.parseProps(props), key);
	var jsxs = (type, props, key) => jsxRuntime.jsxs(type, parseProps.parseProps(props), key);
	Object.defineProperty(exports, "Fragment", {
		enumerable: true,
		get: function() {
			return React.Fragment;
		}
	});
	exports.jsx = jsx;
	exports.jsxs = jsxs;
}));
//#endregion
//#region node_modules/@theme-ui/core/jsx-runtime/dist/theme-ui-core-jsx-runtime.cjs.js
var require_theme_ui_core_jsx_runtime_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_theme_ui_core_jsx_runtime_cjs_prod();
}));
//#endregion
//#region node_modules/@theme-ui/color-modes/dist/theme-ui-color-modes.esm.js
var theme_ui_color_modes_esm_exports = /* @__PURE__ */ __exportAll({
	ColorModeProvider: () => ColorModeProvider,
	InitializeColorMode: () => InitializeColorMode,
	useColorMode: () => useColorMode
});
/**
* @internal
* Returns an object with colors turned into Custom CSS Properties and
* .theme-ui-<colormode> classes used for no-flash serverside rendering.
*/
function __createColorProperties(colors, modes) {
	const styles = __objectToVars("colors", colors);
	Object.keys(modes).forEach((mode) => {
		const className = `.theme-ui-${mode}`;
		const key = `&${className}, ${className} &`;
		styles[key] = __objectToVars("colors", modes[mode]);
	});
	return styles;
}
function useColorMode() {
	const { colorMode, setColorMode } = (0, import_theme_ui_core_cjs.useThemeUI)();
	if (typeof setColorMode !== "function") throw new Error(`[useColorMode] requires the ColorModeProvider component`);
	return [colorMode, setColorMode];
}
function copyRawColors(colors, outerThemeRawColors) {
	for (const [key, value] of Object.entries(colors)) if (typeof value === "string" && !value.startsWith("var(")) outerThemeRawColors[key] = value;
	else if (typeof value === "object") {
		const newValue = { ...outerThemeRawColors[key] };
		copyRawColors(value, newValue);
		outerThemeRawColors[key] = newValue;
	}
}
function useThemeWithAppliedColorMode({ outerTheme, colorMode }) {
	return (0, import_react.useMemo)(() => {
		const res = { ...outerTheme };
		const currentColorMode = (0, import_theme_ui_css_cjs.get)((0, import_theme_ui_css_cjs.get)(res, "colors.modes", {}), colorMode, {});
		if (colorMode) res.colors = {
			...res.colors,
			...currentColorMode
		};
		const { useCustomProperties, initialColorModeName = "__default" } = outerTheme.config || outerTheme;
		let outerThemeRawColors = outerTheme.rawColors || outerTheme.colors || {};
		if (useCustomProperties !== false) {
			const alreadyHasRawColors = res.rawColors != null;
			const colors = res.colors || {};
			if (alreadyHasRawColors) {
				outerThemeRawColors = { ...outerThemeRawColors };
				copyRawColors(colors, outerThemeRawColors);
				if (outerThemeRawColors.modes) outerThemeRawColors.modes[initialColorModeName] = omitModes(outerThemeRawColors);
				res.rawColors = outerThemeRawColors;
			} else if (!("modes" in outerThemeRawColors)) res.rawColors = colors;
			else {
				const modes = {
					[initialColorModeName]: omitModes(outerThemeRawColors),
					...outerThemeRawColors.modes
				};
				res.rawColors = {
					...colors,
					modes
				};
			}
			res.colors = toCustomProperties(omitModes(outerThemeRawColors), "colors");
		}
		return res;
	}, [colorMode, outerTheme]);
}
function GlobalColorStyles({ theme }) {
	return (0, import_theme_ui_core_cjs.jsx)(import_emotion_react_cjs.Global, { styles: () => {
		return { html: __createColorStyles(theme) };
	} });
}
function NestedColorModeProvider({ outerCtx, children }) {
	const newTheme = useThemeWithAppliedColorMode({
		outerTheme: outerCtx.theme,
		colorMode: outerCtx.colorMode
	});
	const [needsRerender, setNeedsRerender] = (0, import_react.useState)(() => newTheme.config?.useLocalStorage !== false);
	useClientsideEffect(() => void setNeedsRerender(false), []);
	const themeColors = newTheme.rawColors || newTheme.colors;
	const useCustomProperties = newTheme.config?.useCustomProperties;
	const colorVars = (0, import_react.useMemo)(() => {
		if (useCustomProperties === false) return {};
		const colors = themeColors || {};
		return (0, import_theme_ui_css_cjs.css)(__createColorProperties(colors, colors.modes || {}))(newTheme);
	}, [
		newTheme,
		themeColors,
		useCustomProperties
	]);
	return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(import_theme_ui_core_cjs.__ThemeUIInternalBaseThemeProvider, {
		context: {
			...outerCtx,
			theme: newTheme
		},
		children: (0, import_theme_ui_core_cjs.jsx)("div", {
			"data-themeui-nested-provider": true,
			key: Number(needsRerender),
			suppressHydrationWarning: true,
			css: colorVars,
			children
		})
	});
}
var import_react, import_theme_ui_core_cjs, import_theme_ui_css_cjs, import_theme_ui_core_jsx_runtime_cjs, toVarName, toVarValue, join, reservedKeys, toCustomProperties, __objectToVars, __createColorStyles, STORAGE_KEY, DARK_QUERY, LIGHT_QUERY, storage, getPreferredColorScheme, useClientsideEffect, TopLevelColorModeProvider, omitModes, ColorModeProvider, noflash, InitializeColorMode;
var init_theme_ui_color_modes_esm = __esmMin((() => {
	import_react = /* @__PURE__ */ __toESM(require_react());
	import_theme_ui_core_cjs = require_theme_ui_core_cjs();
	import_theme_ui_css_cjs = require_theme_ui_css_cjs();
	init_emotion_react_cjs();
	import_theme_ui_core_jsx_runtime_cjs = require_theme_ui_core_jsx_runtime_cjs();
	toVarName = (key) => `--theme-ui-${key.replace("-__default", "")}`;
	toVarValue = (key) => `var(${toVarName(key)})`;
	join = (...args) => args.filter(Boolean).join("-");
	reservedKeys = new Set([
		"useCustomProperties",
		"initialColorModeName",
		"printColorModeName",
		"initialColorMode",
		"useLocalStorage",
		"config"
	]);
	toCustomProperties = (obj, parent) => {
		const next = Array.isArray(obj) ? [] : {};
		for (let key in obj) {
			const value = obj[key];
			const name = join(parent, key);
			if (value && typeof value === "object") {
				next[key] = toCustomProperties(value, name);
				continue;
			}
			if (reservedKeys.has(key)) {
				next[key] = value;
				continue;
			}
			next[key] = toVarValue(name);
		}
		return next;
	};
	__objectToVars = (parent, obj) => {
		let vars = {};
		for (let key in obj) {
			if (key === "modes") continue;
			const name = join(parent, key);
			const value = obj[key];
			if (value && typeof value === "object") vars = {
				...vars,
				...__objectToVars(name, value)
			};
			else vars[toVarName(name)] = value;
		}
		return vars;
	};
	__createColorStyles = (theme = {}) => {
		const { useCustomProperties, initialColorModeName, printColorModeName, useRootStyles } = theme.config || theme || {};
		const colors = theme.rawColors || theme.colors;
		if (!colors) return {};
		const res = {};
		if (useRootStyles !== false) if (useCustomProperties === false) {
			res.color = "text";
			res.bg = "background";
		} else {
			res.color = toVarValue("colors-text");
			res.bg = toVarValue("colors-background");
		}
		if (useCustomProperties !== false) {
			const modes = colors.modes || {};
			const styles = __createColorProperties(colors, modes);
			if (printColorModeName) {
				let printMode = modes[printColorModeName];
				if (!printMode && printColorModeName === initialColorModeName) printMode = colors;
				if (printMode) styles["@media print"] = __objectToVars("colors", printMode);
				else console.error(`Theme UI \`printColorModeName\` was not found in colors scale`, {
					colors,
					printColorModeName
				});
			}
			Object.assign(res, styles);
		}
		return (0, import_theme_ui_css_cjs.css)(res)(theme);
	};
	STORAGE_KEY = "theme-ui-color-mode";
	DARK_QUERY = "(prefers-color-scheme: dark)";
	LIGHT_QUERY = "(prefers-color-scheme: light)";
	storage = {
		get: () => {
			try {
				return window.localStorage.getItem(STORAGE_KEY);
			} catch (err) {
				console.warn("localStorage is disabled and color mode might not work as expected.", "Please check your Site Settings.", err);
			}
		},
		set: (value) => {
			try {
				window.localStorage.setItem(STORAGE_KEY, value);
			} catch (err) {
				console.warn("localStorage is disabled and color mode might not work as expected.", "Please check your Site Settings.", err);
			}
		}
	};
	getPreferredColorScheme = () => {
		if (typeof window !== "undefined" && window.matchMedia) {
			if (window.matchMedia(DARK_QUERY).matches) return "dark";
			if (window.matchMedia(LIGHT_QUERY).matches) return "light";
		}
		return null;
	};
	useClientsideEffect = typeof window === "undefined" ? () => {} : import_react.useLayoutEffect;
	TopLevelColorModeProvider = ({ outerCtx, children }) => {
		const outerTheme = outerCtx.theme || {};
		const { initialColorModeName, useColorSchemeMediaQuery, useLocalStorage } = outerTheme.config || outerTheme;
		let [colorMode, setColorMode] = (0, import_react.useState)(() => {
			return useColorSchemeMediaQuery !== false && getPreferredColorScheme() || initialColorModeName;
		});
		useClientsideEffect(() => {
			const stored = useLocalStorage !== false && storage.get();
			if (typeof document !== "undefined") document.documentElement.classList.remove("theme-ui-" + stored);
			if (useColorSchemeMediaQuery !== "system" && stored && stored !== colorMode) {
				colorMode = stored;
				setColorMode(stored);
			}
		}, []);
		(0, import_react.useEffect)(() => {
			if (colorMode && useLocalStorage !== false) storage.set(colorMode);
		}, [colorMode, useLocalStorage]);
		const setPreferredColorScheme = (0, import_react.useCallback)(() => {
			setColorMode(getPreferredColorScheme() || initialColorModeName);
		}, [initialColorModeName]);
		(0, import_react.useEffect)(() => {
			if (useColorSchemeMediaQuery === "system" && window.matchMedia) {
				const darkMQL = window.matchMedia(DARK_QUERY);
				if (typeof darkMQL.addEventListener === "function") darkMQL.addEventListener("change", setPreferredColorScheme);
				else if (typeof darkMQL.addListener === "function") darkMQL.addListener(setPreferredColorScheme);
			}
			return () => {
				if (useColorSchemeMediaQuery === "system" && window.matchMedia) {
					const darkMQL = window.matchMedia(DARK_QUERY);
					if (typeof darkMQL.removeEventListener === "function") darkMQL.removeEventListener("change", setPreferredColorScheme);
					else if (typeof darkMQL.removeListener === "function") darkMQL.removeListener(setPreferredColorScheme);
				}
			};
		}, [useColorSchemeMediaQuery, setPreferredColorScheme]);
		const newTheme = useThemeWithAppliedColorMode({
			colorMode,
			outerTheme
		});
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(import_theme_ui_core_cjs.__ThemeUIInternalBaseThemeProvider, {
			context: {
				...outerCtx,
				theme: newTheme,
				colorMode,
				setColorMode
			},
			children: [(0, import_theme_ui_core_jsx_runtime_cjs.jsx)(GlobalColorStyles, { theme: newTheme }), children]
		});
	};
	omitModes = (colors) => {
		const res = { ...colors };
		delete res.modes;
		return res;
	};
	ColorModeProvider = ({ children }) => {
		const outerCtx = (0, import_theme_ui_core_cjs.useThemeUI)();
		return typeof outerCtx.setColorMode !== "function" ? (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(TopLevelColorModeProvider, {
			outerCtx,
			children
		}) : (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(NestedColorModeProvider, {
			outerCtx,
			children
		});
	};
	noflash = `(function() { try {
  var mode = localStorage.getItem('theme-ui-color-mode');
  if (!mode) return
  document.documentElement.classList.add('theme-ui-' + mode);
} catch (e) {} })();`;
	InitializeColorMode = () => (0, import_theme_ui_core_cjs.jsx)("script", {
		key: "theme-ui-no-flash",
		dangerouslySetInnerHTML: { __html: noflash }
	});
}));
//#endregion
export { require_theme_ui_core_cjs as a, require_theme_ui_core_jsx_runtime_cjs as i, init_theme_ui_color_modes_esm as n, require_theme_ui_css_cjs as o, theme_ui_color_modes_esm_exports as r, ColorModeProvider as t };
