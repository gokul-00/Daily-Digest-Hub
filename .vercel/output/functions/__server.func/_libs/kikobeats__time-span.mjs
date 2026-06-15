import { t as __commonJSMin } from "../_runtime.mjs";
//#region node_modules/@kikobeats/time-span/src/index.js
var require_src = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	module.exports = ({ format = (n) => n } = {}) => (start = process.hrtime.bigint()) => () => format(Number(process.hrtime.bigint() - start) / 1e6);
}));
//#endregion
export { require_src as t };
