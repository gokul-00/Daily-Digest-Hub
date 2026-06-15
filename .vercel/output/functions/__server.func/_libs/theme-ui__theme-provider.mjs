import { n as __esmMin, o as __toESM, r as __exportAll } from "../_runtime.mjs";
import { c as require_react, n as import_emotion_react_cjs, r as init_emotion_react_cjs } from "./@emotion/react+[...].mjs";
import { a as require_theme_ui_core_cjs, i as require_theme_ui_core_jsx_runtime_cjs, n as init_theme_ui_color_modes_esm, o as require_theme_ui_css_cjs, t as ColorModeProvider } from "./@theme-ui/color-modes+[...].mjs";
//#region node_modules/@theme-ui/theme-provider/dist/theme-ui-theme-provider.esm.js
var theme_ui_theme_provider_esm_exports = /* @__PURE__ */ __exportAll({
	ThemeProvider: () => ThemeProvider,
	ThemeUIProvider: () => ThemeUIProvider
});
var import_react, import_theme_ui_core_cjs, import_theme_ui_css_cjs, import_theme_ui_core_jsx_runtime_cjs, RootStyles, ThemeUIProvider, ThemeProvider;
var init_theme_ui_theme_provider_esm = __esmMin((() => {
	import_react = /* @__PURE__ */ __toESM(require_react());
	import_theme_ui_core_cjs = require_theme_ui_core_cjs();
	import_theme_ui_css_cjs = require_theme_ui_css_cjs();
	init_theme_ui_color_modes_esm();
	init_emotion_react_cjs();
	import_theme_ui_core_jsx_runtime_cjs = require_theme_ui_core_jsx_runtime_cjs();
	RootStyles = () => (0, import_theme_ui_core_cjs.jsx)(import_emotion_react_cjs.Global, { styles: (emotionTheme) => {
		const theme = emotionTheme;
		const { useRootStyles } = theme.config || theme;
		if (useRootStyles === false || theme.styles && !theme.styles.root) return null;
		return (0, import_theme_ui_css_cjs.css)({
			"*": { boxSizing: theme.config?.useBorderBox === false ? void 0 : "border-box" },
			html: { variant: "styles.root" },
			body: { margin: 0 }
		})(theme);
	} });
	ThemeUIProvider = ({ theme, children }) => {
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(import_theme_ui_core_cjs.ThemeProvider, {
			theme,
			children: (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(ColorModeProvider, { children: [(0, import_theme_ui_core_cjs.useThemeUI)() === import_theme_ui_core_cjs.__themeUiDefaultContextValue && (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(RootStyles, {}), children] })
		});
	};
	ThemeProvider = ({ theme, children }) => {
		import_react.useEffect(() => {}, []);
		return (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(import_theme_ui_core_cjs.ThemeProvider, {
			theme,
			children: (0, import_theme_ui_core_jsx_runtime_cjs.jsxs)(ColorModeProvider, { children: [(0, import_theme_ui_core_cjs.useThemeUI)() === import_theme_ui_core_cjs.__themeUiDefaultContextValue && (0, import_theme_ui_core_jsx_runtime_cjs.jsx)(RootStyles, {}), children] })
		});
	};
}));
//#endregion
export { theme_ui_theme_provider_esm_exports as n, init_theme_ui_theme_provider_esm as t };
