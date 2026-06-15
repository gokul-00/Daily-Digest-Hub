import { a as __toCommonJS, t as __commonJSMin } from "../_runtime.mjs";
import { c as require_react } from "./@emotion/react+[...].mjs";
import { a as require_theme_ui_core_cjs, i as require_theme_ui_core_jsx_runtime_cjs, n as init_theme_ui_color_modes_esm, o as require_theme_ui_css_cjs, r as theme_ui_color_modes_esm_exports } from "./@theme-ui/color-modes+[...].mjs";
import { n as theme_ui_theme_provider_esm_exports, t as init_theme_ui_theme_provider_esm } from "./theme-ui__theme-provider.mjs";
import { n as theme_ui_global_esm_exports, t as init_theme_ui_global_esm } from "./theme-ui__global.mjs";
import { n as theme_ui_components_esm_exports, t as init_theme_ui_components_esm } from "./theme-ui__components.mjs";
//#region node_modules/theme-ui/dist/theme-ui.cjs.prod.js
var require_theme_ui_cjs_prod = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var core = require_theme_ui_core_cjs();
	var colorModes = (init_theme_ui_color_modes_esm(), __toCommonJS(theme_ui_color_modes_esm_exports));
	var themeProvider = (init_theme_ui_theme_provider_esm(), __toCommonJS(theme_ui_theme_provider_esm_exports));
	var global = (init_theme_ui_global_esm(), __toCommonJS(theme_ui_global_esm_exports));
	var components = (init_theme_ui_components_esm(), __toCommonJS(theme_ui_components_esm_exports));
	var css = require_theme_ui_css_cjs();
	function _interopDefault(e) {
		return e && e.__esModule ? e : { "default": e };
	}
	var global__default = /*#__PURE__*/ _interopDefault(global);
	var BaseStyles = (props) => jsx("div", {
		...props,
		sx: {
			fontFamily: "body",
			lineHeight: "body",
			fontWeight: "body",
			variant: "styles",
			...props.sx
		}
	});
	var jsx = core.jsx;
	Object.defineProperty(exports, "__ThemeUIContext", {
		enumerable: true,
		get: function() {
			return core.__ThemeUIContext;
		}
	});
	Object.defineProperty(exports, "createElement", {
		enumerable: true,
		get: function() {
			return core.createElement;
		}
	});
	Object.defineProperty(exports, "merge", {
		enumerable: true,
		get: function() {
			return core.merge;
		}
	});
	Object.defineProperty(exports, "useThemeUI", {
		enumerable: true,
		get: function() {
			return core.useThemeUI;
		}
	});
	Object.defineProperty(exports, "InitializeColorMode", {
		enumerable: true,
		get: function() {
			return colorModes.InitializeColorMode;
		}
	});
	Object.defineProperty(exports, "useColorMode", {
		enumerable: true,
		get: function() {
			return colorModes.useColorMode;
		}
	});
	Object.defineProperty(exports, "ThemeProvider", {
		enumerable: true,
		get: function() {
			return themeProvider.ThemeProvider;
		}
	});
	Object.defineProperty(exports, "ThemeUIProvider", {
		enumerable: true,
		get: function() {
			return themeProvider.ThemeUIProvider;
		}
	});
	Object.defineProperty(exports, "Global", {
		enumerable: true,
		get: function() {
			return global__default["default"];
		}
	});
	Object.defineProperty(exports, "css", {
		enumerable: true,
		get: function() {
			return css.css;
		}
	});
	Object.defineProperty(exports, "get", {
		enumerable: true,
		get: function() {
			return css.get;
		}
	});
	exports.BaseStyles = BaseStyles;
	exports.jsx = jsx;
	Object.keys(components).forEach(function(k) {
		if (k !== "default" && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
			enumerable: true,
			get: function() {
				return components[k];
			}
		});
	});
}));
//#endregion
//#region node_modules/theme-ui/dist/theme-ui.cjs.js
var require_theme_ui_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_theme_ui_cjs_prod();
}));
//#endregion
//#region node_modules/theme-ui/jsx-runtime/dist/theme-ui-jsx-runtime.cjs.prod.js
var require_theme_ui_jsx_runtime_cjs_prod = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	var react = require_react();
	var jsxRuntime = require_theme_ui_core_jsx_runtime_cjs();
	Object.defineProperty(exports, "Fragment", {
		enumerable: true,
		get: function() {
			return react.Fragment;
		}
	});
	Object.defineProperty(exports, "jsx", {
		enumerable: true,
		get: function() {
			return jsxRuntime.jsx;
		}
	});
	Object.defineProperty(exports, "jsxs", {
		enumerable: true,
		get: function() {
			return jsxRuntime.jsxs;
		}
	});
}));
//#endregion
//#region node_modules/theme-ui/jsx-runtime/dist/theme-ui-jsx-runtime.cjs.js
var require_theme_ui_jsx_runtime_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = require_theme_ui_jsx_runtime_cjs_prod();
}));
//#endregion
export { require_theme_ui_cjs as n, require_theme_ui_jsx_runtime_cjs as t };
