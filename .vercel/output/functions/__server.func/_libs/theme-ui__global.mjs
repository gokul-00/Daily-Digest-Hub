import { n as __esmMin, r as __exportAll } from "../_runtime.mjs";
import { n as import_emotion_react_cjs, r as init_emotion_react_cjs } from "./@emotion/react+[...].mjs";
import { a as require_theme_ui_core_cjs, o as require_theme_ui_css_cjs } from "./@theme-ui/color-modes+[...].mjs";
//#region node_modules/@theme-ui/global/dist/theme-ui-global.esm.js
var theme_ui_global_esm_exports = /* @__PURE__ */ __exportAll({ default: () => Global });
var import_theme_ui_core_cjs, import_theme_ui_css_cjs, Global;
var init_theme_ui_global_esm = __esmMin((() => {
	import_theme_ui_core_cjs = require_theme_ui_core_cjs();
	import_theme_ui_css_cjs = require_theme_ui_css_cjs();
	init_emotion_react_cjs();
	Global = ({ styles }) => (0, import_theme_ui_core_cjs.jsx)(import_emotion_react_cjs.Global, { styles: (emotionTheme) => {
		const theme = emotionTheme;
		return (0, import_theme_ui_css_cjs.css)(styles)(theme);
	} });
}));
//#endregion
export { theme_ui_global_esm_exports as n, init_theme_ui_global_esm as t };
