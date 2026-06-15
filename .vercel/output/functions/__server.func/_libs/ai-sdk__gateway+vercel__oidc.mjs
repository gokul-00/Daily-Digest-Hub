import { i as __require, o as __toESM, t as __commonJSMin } from "../_runtime.mjs";
import { A as zodSchema, C as postJsonToApi, D as safeValidateTypes, H as any, J as literal, K as discriminatedUnion, M as APICallError, O as withUserAgentSuffix, Q as record, S as parseJsonEventStream, T as resolve, U as array, W as boolean, X as number, Z as object, a as combineHeaders, b as lazySchema, c as createEventSourceResponseHandler, d as createJsonResponseHandler, et as string, f as createProviderToolFactoryWithOutputSchema, g as getFromApi, k as withoutTrailingSlash, nt as unknown, s as convertUint8ArrayToBase64, tt as union, u as createJsonErrorResponseHandler, x as loadOptionalSetting, z as _enum } from "./@ai-sdk/anthropic+[...].mjs";
//#region node_modules/@vercel/oidc/dist/get-context.js
var require_get_context = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var get_context_exports = {};
	__export(get_context_exports, {
		SYMBOL_FOR_REQ_CONTEXT: () => SYMBOL_FOR_REQ_CONTEXT,
		getContext: () => getContext
	});
	module.exports = __toCommonJS(get_context_exports);
	var SYMBOL_FOR_REQ_CONTEXT = Symbol.for("@vercel/request-context");
	function getContext() {
		return globalThis[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
	}
	0 && (module.exports = {
		SYMBOL_FOR_REQ_CONTEXT,
		getContext
	});
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/token-error.js
var require_token_error = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var token_error_exports = {};
	__export(token_error_exports, { VercelOidcTokenError: () => VercelOidcTokenError });
	module.exports = __toCommonJS(token_error_exports);
	var VercelOidcTokenError = class extends Error {
		constructor(message, cause) {
			super(message);
			this.name = "VercelOidcTokenError";
			this.cause = cause;
		}
		toString() {
			if (this.cause) return `${this.name}: ${this.message}: ${this.cause}`;
			return `${this.name}: ${this.message}`;
		}
	};
	0 && (module.exports = { VercelOidcTokenError });
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/get-vercel-oidc-token.js
var require_get_vercel_oidc_token = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var get_vercel_oidc_token_exports = {};
	__export(get_vercel_oidc_token_exports, {
		getVercelOidcToken: () => getVercelOidcToken,
		getVercelOidcTokenSync: () => getVercelOidcTokenSync
	});
	module.exports = __toCommonJS(get_vercel_oidc_token_exports);
	var import_get_context = require_get_context();
	var import_token_error = require_token_error();
	async function getVercelOidcToken(options) {
		let token = "";
		let err;
		try {
			token = getVercelOidcTokenSync();
		} catch (error) {
			err = error;
		}
		try {
			const [{ getTokenPayload, isExpired }, { refreshToken }] = await Promise.all([await Promise.resolve().then(() => /* @__PURE__ */ __toESM(require_token_util())), await import("./vercel__oidc.mjs").then((n) => /* @__PURE__ */ __toESM(n.t()))]);
			if (!token || isExpired(getTokenPayload(token), options?.expirationBufferMs)) {
				await refreshToken(options);
				token = getVercelOidcTokenSync();
			}
		} catch (error) {
			let message = err instanceof Error ? err.message : "";
			if (error instanceof Error) message = `${message}
${error.message}`;
			if (message) throw new import_token_error.VercelOidcTokenError(message);
			throw error;
		}
		return token;
	}
	function getVercelOidcTokenSync() {
		const token = (0, import_get_context.getContext)().headers?.["x-vercel-oidc-token"] ?? process.env.VERCEL_OIDC_TOKEN;
		if (!token) throw new Error(`The 'x-vercel-oidc-token' header is missing from the request. Do you have the OIDC option enabled in the Vercel project settings?`);
		return token;
	}
	0 && (module.exports = {
		getVercelOidcToken,
		getVercelOidcTokenSync
	});
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/auth-errors.js
var require_auth_errors = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var auth_errors_exports = {};
	__export(auth_errors_exports, {
		AccessTokenMissingError: () => AccessTokenMissingError,
		RefreshAccessTokenFailedError: () => RefreshAccessTokenFailedError
	});
	module.exports = __toCommonJS(auth_errors_exports);
	var AccessTokenMissingError = class extends Error {
		constructor() {
			super("No authentication found. Please log in with the Vercel CLI (vercel login).");
			this.name = "AccessTokenMissingError";
		}
	};
	var RefreshAccessTokenFailedError = class extends Error {
		constructor(cause) {
			super("Failed to refresh authentication token.", { cause });
			this.name = "RefreshAccessTokenFailedError";
		}
	};
	0 && (module.exports = {
		AccessTokenMissingError,
		RefreshAccessTokenFailedError
	});
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/token-io.js
var require_token_io = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var token_io_exports = {};
	__export(token_io_exports, {
		findRootDir: () => findRootDir,
		getUserDataDir: () => getUserDataDir
	});
	module.exports = __toCommonJS(token_io_exports);
	var import_path = __toESM(__require("path"));
	var import_fs = __toESM(__require("fs"));
	var import_os$1 = __toESM(__require("os"));
	var import_token_error = require_token_error();
	function findRootDir() {
		try {
			let dir = process.cwd();
			while (dir !== import_path.default.dirname(dir)) {
				const pkgPath = import_path.default.join(dir, ".vercel");
				if (import_fs.default.existsSync(pkgPath)) return dir;
				dir = import_path.default.dirname(dir);
			}
		} catch (e) {
			throw new import_token_error.VercelOidcTokenError("Token refresh only supported in node server environments");
		}
		return null;
	}
	function getUserDataDir() {
		if (process.env.XDG_DATA_HOME) return process.env.XDG_DATA_HOME;
		switch (import_os$1.default.platform()) {
			case "darwin": return import_path.default.join(import_os$1.default.homedir(), "Library/Application Support");
			case "linux": return import_path.default.join(import_os$1.default.homedir(), ".local/share");
			case "win32":
				if (process.env.LOCALAPPDATA) return process.env.LOCALAPPDATA;
				return null;
			default: return null;
		}
	}
	0 && (module.exports = {
		findRootDir,
		getUserDataDir
	});
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/auth-config.js
var require_auth_config = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var auth_config_exports = {};
	__export(auth_config_exports, {
		isValidAccessToken: () => isValidAccessToken,
		readAuthConfig: () => readAuthConfig,
		writeAuthConfig: () => writeAuthConfig
	});
	module.exports = __toCommonJS(auth_config_exports);
	var fs$1 = __toESM(__require("fs"));
	var path$1 = __toESM(__require("path"));
	var import_token_util = require_token_util();
	function getAuthConfigPath() {
		const dataDir = (0, import_token_util.getVercelDataDir)();
		if (!dataDir) throw new Error(`Unable to find Vercel CLI data directory. Your platform: ${process.platform}. Supported: darwin, linux, win32.`);
		return path$1.join(dataDir, "auth.json");
	}
	function readAuthConfig() {
		try {
			const authPath = getAuthConfigPath();
			if (!fs$1.existsSync(authPath)) return null;
			const content = fs$1.readFileSync(authPath, "utf8");
			if (!content) return null;
			return JSON.parse(content);
		} catch (error) {
			return null;
		}
	}
	function writeAuthConfig(config) {
		const authPath = getAuthConfigPath();
		const authDir = path$1.dirname(authPath);
		if (!fs$1.existsSync(authDir)) fs$1.mkdirSync(authDir, {
			mode: 504,
			recursive: true
		});
		fs$1.writeFileSync(authPath, JSON.stringify(config, null, 2), { mode: 384 });
	}
	function isValidAccessToken(authConfig, expirationBufferMs = 0) {
		if (!authConfig.token) return false;
		if (typeof authConfig.expiresAt !== "number") return true;
		const nowInSeconds = Math.floor(Date.now() / 1e3);
		const bufferInSeconds = expirationBufferMs / 1e3;
		return authConfig.expiresAt >= nowInSeconds + bufferInSeconds;
	}
	0 && (module.exports = {
		isValidAccessToken,
		readAuthConfig,
		writeAuthConfig
	});
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/oauth.js
var require_oauth = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var oauth_exports = {};
	__export(oauth_exports, {
		processTokenResponse: () => processTokenResponse,
		refreshTokenRequest: () => refreshTokenRequest
	});
	module.exports = __toCommonJS(oauth_exports);
	var import_os = __require("os");
	var VERCEL_ISSUER = "https://vercel.com";
	var VERCEL_CLI_CLIENT_ID = "cl_HYyOPBNtFMfHhaUn9L4QPfTZz6TP47bp";
	var userAgent = `@vercel/oidc node-${process.version} ${(0, import_os.platform)()} (${(0, import_os.arch)()}) ${(0, import_os.hostname)()}`;
	var _tokenEndpoint = null;
	async function getTokenEndpoint() {
		if (_tokenEndpoint) return _tokenEndpoint;
		const response = await fetch(`${VERCEL_ISSUER}/.well-known/openid-configuration`, { headers: { "user-agent": userAgent } });
		if (!response.ok) throw new Error("Failed to discover OAuth endpoints");
		const metadata = await response.json();
		if (!metadata || typeof metadata.token_endpoint !== "string") throw new Error("Invalid OAuth discovery response");
		const endpoint = metadata.token_endpoint;
		_tokenEndpoint = endpoint;
		return endpoint;
	}
	async function refreshTokenRequest(options) {
		const tokenEndpoint = await getTokenEndpoint();
		return await fetch(tokenEndpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				"user-agent": userAgent
			},
			body: new URLSearchParams({
				client_id: VERCEL_CLI_CLIENT_ID,
				grant_type: "refresh_token",
				...options
			})
		});
	}
	async function processTokenResponse(response) {
		const json = await response.json();
		if (!response.ok) {
			const errorMsg = typeof json === "object" && json && "error" in json ? String(json.error) : "Token refresh failed";
			return [new Error(errorMsg)];
		}
		if (typeof json !== "object" || json === null) return [/* @__PURE__ */ new Error("Invalid token response")];
		if (typeof json.access_token !== "string") return [/* @__PURE__ */ new Error("Missing access_token in response")];
		if (json.token_type !== "Bearer") return [/* @__PURE__ */ new Error("Invalid token_type in response")];
		if (typeof json.expires_in !== "number") return [/* @__PURE__ */ new Error("Missing expires_in in response")];
		return [null, json];
	}
	0 && (module.exports = {
		processTokenResponse,
		refreshTokenRequest
	});
}));
//#endregion
//#region node_modules/@vercel/oidc/dist/token-util.js
var require_token_util = /* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __create = Object.create;
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __getProtoOf = Object.getPrototypeOf;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
		value: mod,
		enumerable: true
	}) : target, mod));
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var token_util_exports = {};
	__export(token_util_exports, {
		assertVercelOidcTokenResponse: () => assertVercelOidcTokenResponse,
		findProjectInfo: () => findProjectInfo,
		getTokenPayload: () => getTokenPayload,
		getVercelDataDir: () => getVercelDataDir,
		getVercelOidcToken: () => getVercelOidcToken,
		getVercelToken: () => getVercelToken,
		isExpired: () => isExpired,
		loadToken: () => loadToken,
		saveToken: () => saveToken
	});
	module.exports = __toCommonJS(token_util_exports);
	var path = __toESM(__require("path"));
	var fs = __toESM(__require("fs"));
	var import_token_error = require_token_error();
	var import_token_io = require_token_io();
	var import_auth_config = require_auth_config();
	var import_oauth = require_oauth();
	var import_auth_errors = require_auth_errors();
	function getVercelDataDir() {
		const vercelFolder = "com.vercel.cli";
		const dataDir = (0, import_token_io.getUserDataDir)();
		if (!dataDir) return null;
		return path.join(dataDir, vercelFolder);
	}
	async function getVercelToken(options) {
		const authConfig = (0, import_auth_config.readAuthConfig)();
		if (!authConfig?.token) throw new import_auth_errors.AccessTokenMissingError();
		if ((0, import_auth_config.isValidAccessToken)(authConfig, options?.expirationBufferMs)) return authConfig.token;
		if (!authConfig.refreshToken) {
			(0, import_auth_config.writeAuthConfig)({});
			throw new import_auth_errors.RefreshAccessTokenFailedError("No refresh token available");
		}
		try {
			const tokenResponse = await (0, import_oauth.refreshTokenRequest)({ refresh_token: authConfig.refreshToken });
			const [tokensError, tokens] = await (0, import_oauth.processTokenResponse)(tokenResponse);
			if (tokensError || !tokens) {
				(0, import_auth_config.writeAuthConfig)({});
				throw new import_auth_errors.RefreshAccessTokenFailedError(tokensError);
			}
			const updatedConfig = {
				token: tokens.access_token,
				expiresAt: Math.floor(Date.now() / 1e3) + tokens.expires_in
			};
			if (tokens.refresh_token) updatedConfig.refreshToken = tokens.refresh_token;
			(0, import_auth_config.writeAuthConfig)(updatedConfig);
			return updatedConfig.token;
		} catch (error) {
			(0, import_auth_config.writeAuthConfig)({});
			if (error instanceof import_auth_errors.AccessTokenMissingError || error instanceof import_auth_errors.RefreshAccessTokenFailedError) throw error;
			throw new import_auth_errors.RefreshAccessTokenFailedError(error);
		}
	}
	async function getVercelOidcToken(authToken, projectId, teamId) {
		const url = `https://api.vercel.com/v1/projects/${projectId}/token?source=vercel-oidc-refresh${teamId ? `&teamId=${teamId}` : ""}`;
		const res = await fetch(url, {
			method: "POST",
			headers: { Authorization: `Bearer ${authToken}` }
		});
		if (!res.ok) throw new import_token_error.VercelOidcTokenError(`Failed to refresh OIDC token: ${res.statusText}`);
		const tokenRes = await res.json();
		assertVercelOidcTokenResponse(tokenRes);
		return tokenRes;
	}
	function assertVercelOidcTokenResponse(res) {
		if (!res || typeof res !== "object") throw new TypeError("Vercel OIDC token is malformed. Expected an object. Please run `vc env pull` and try again");
		if (!("token" in res) || typeof res.token !== "string") throw new TypeError("Vercel OIDC token is malformed. Expected a string-valued token property. Please run `vc env pull` and try again");
	}
	function findProjectInfo() {
		const dir = (0, import_token_io.findRootDir)();
		if (!dir) throw new import_token_error.VercelOidcTokenError("Unable to find project root directory. Have you linked your project with `vc link?`");
		const prjPath = path.join(dir, ".vercel", "project.json");
		if (!fs.existsSync(prjPath)) throw new import_token_error.VercelOidcTokenError("project.json not found, have you linked your project with `vc link?`");
		const prj = JSON.parse(fs.readFileSync(prjPath, "utf8"));
		if (typeof prj.projectId !== "string" && typeof prj.orgId !== "string") throw new TypeError("Expected a string-valued projectId property. Try running `vc link` to re-link your project.");
		return {
			projectId: prj.projectId,
			teamId: prj.orgId
		};
	}
	function saveToken(token, projectId) {
		const dir = (0, import_token_io.getUserDataDir)();
		if (!dir) throw new import_token_error.VercelOidcTokenError("Unable to find user data directory. Please reach out to Vercel support.");
		const tokenPath = path.join(dir, "com.vercel.token", `${projectId}.json`);
		const tokenJson = JSON.stringify(token);
		fs.mkdirSync(path.dirname(tokenPath), {
			mode: 504,
			recursive: true
		});
		fs.writeFileSync(tokenPath, tokenJson);
		fs.chmodSync(tokenPath, 432);
	}
	function loadToken(projectId) {
		const dir = (0, import_token_io.getUserDataDir)();
		if (!dir) throw new import_token_error.VercelOidcTokenError("Unable to find user data directory. Please reach out to Vercel support.");
		const tokenPath = path.join(dir, "com.vercel.token", `${projectId}.json`);
		if (!fs.existsSync(tokenPath)) return null;
		const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
		assertVercelOidcTokenResponse(token);
		return token;
	}
	function getTokenPayload(token) {
		const tokenParts = token.split(".");
		if (tokenParts.length !== 3) throw new import_token_error.VercelOidcTokenError("Invalid token. Please run `vc env pull` and try again");
		const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
		return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
	}
	function isExpired(token, bufferMs = 0) {
		return token.exp * 1e3 < Date.now() + bufferMs;
	}
	0 && (module.exports = {
		assertVercelOidcTokenResponse,
		findProjectInfo,
		getTokenPayload,
		getVercelDataDir,
		getVercelOidcToken,
		getVercelToken,
		isExpired,
		loadToken,
		saveToken
	});
}));
//#endregion
//#region node_modules/@ai-sdk/gateway/dist/index.mjs
var import_dist = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
	var __defProp = Object.defineProperty;
	var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
	var __getOwnPropNames = Object.getOwnPropertyNames;
	var __hasOwnProp = Object.prototype.hasOwnProperty;
	var __export = (target, all) => {
		for (var name in all) __defProp(target, name, {
			get: all[name],
			enumerable: true
		});
	};
	var __copyProps = (to, from, except, desc) => {
		if (from && typeof from === "object" || typeof from === "function") {
			for (let key of __getOwnPropNames(from)) if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
				get: () => from[key],
				enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
			});
		}
		return to;
	};
	var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
	var src_exports = {};
	__export(src_exports, {
		AccessTokenMissingError: () => import_auth_errors.AccessTokenMissingError,
		RefreshAccessTokenFailedError: () => import_auth_errors.RefreshAccessTokenFailedError,
		getContext: () => import_get_context.getContext,
		getVercelOidcToken: () => import_get_vercel_oidc_token.getVercelOidcToken,
		getVercelOidcTokenSync: () => import_get_vercel_oidc_token.getVercelOidcTokenSync,
		getVercelToken: () => import_token_util.getVercelToken
	});
	module.exports = __toCommonJS(src_exports);
	var import_get_vercel_oidc_token = require_get_vercel_oidc_token();
	var import_get_context = require_get_context();
	var import_auth_errors = require_auth_errors();
	var import_token_util = require_token_util();
	0 && (module.exports = {
		AccessTokenMissingError,
		RefreshAccessTokenFailedError,
		getContext,
		getVercelOidcToken,
		getVercelOidcTokenSync,
		getVercelToken
	});
})))();
var symbol = Symbol.for("vercel.ai.gateway.error");
var _a, _b;
var GatewayError = class _GatewayError extends (_b = Error, _a = symbol, _b) {
	constructor({ message, statusCode = 500, cause, generationId, isRetryable = statusCode != null && (statusCode === 408 || statusCode === 409 || statusCode === 429 || statusCode >= 500) }) {
		super(generationId ? `${message} [${generationId}]` : message);
		this[_a] = true;
		this.statusCode = statusCode;
		this.cause = cause;
		this.generationId = generationId;
		this.isRetryable = isRetryable;
	}
	/**
	* Checks if the given error is a Gateway Error.
	* @param {unknown} error - The error to check.
	* @returns {boolean} True if the error is a Gateway Error, false otherwise.
	*/
	static isInstance(error) {
		return _GatewayError.hasMarker(error);
	}
	static hasMarker(error) {
		return typeof error === "object" && error !== null && symbol in error && error[symbol] === true;
	}
};
var name = "GatewayAuthenticationError";
var marker2 = `vercel.ai.gateway.error.${name}`;
var symbol2 = Symbol.for(marker2);
var _a2, _b2;
var GatewayAuthenticationError = class _GatewayAuthenticationError extends (_b2 = GatewayError, _a2 = symbol2, _b2) {
	constructor({ message = "Authentication failed", statusCode = 401, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a2] = true;
		this.name = name;
		this.type = "authentication_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol2 in error;
	}
	/**
	* Creates a contextual error message when authentication fails
	*/
	static createContextualError({ apiKeyProvided, oidcTokenProvided, message = "Authentication failed", statusCode = 401, cause, generationId }) {
		let contextualMessage;
		if (apiKeyProvided) contextualMessage = `AI Gateway authentication failed: Invalid API key.

Create a new API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys

Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.`;
		else if (oidcTokenProvided) contextualMessage = `AI Gateway authentication failed: Invalid OIDC token.

Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.

Alternatively, use an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys`;
		else contextualMessage = `AI Gateway authentication failed: No authentication provided.

Option 1 - API key:
Create an API key: https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys
Provide via 'apiKey' option or 'AI_GATEWAY_API_KEY' environment variable.

Option 2 - OIDC token:
Run 'npx vercel link' to link your project, then 'vc env pull' to fetch the token.`;
		return new _GatewayAuthenticationError({
			message: contextualMessage,
			statusCode,
			cause,
			generationId
		});
	}
};
var name2 = "GatewayInvalidRequestError";
var marker3 = `vercel.ai.gateway.error.${name2}`;
var symbol3 = Symbol.for(marker3);
var _a3, _b3;
var GatewayInvalidRequestError = class extends (_b3 = GatewayError, _a3 = symbol3, _b3) {
	constructor({ message = "Invalid request", statusCode = 400, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a3] = true;
		this.name = name2;
		this.type = "invalid_request_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol3 in error;
	}
};
var name3 = "GatewayRateLimitError";
var marker4 = `vercel.ai.gateway.error.${name3}`;
var symbol4 = Symbol.for(marker4);
var _a4, _b4;
var GatewayRateLimitError = class extends (_b4 = GatewayError, _a4 = symbol4, _b4) {
	constructor({ message = "Rate limit exceeded", statusCode = 429, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a4] = true;
		this.name = name3;
		this.type = "rate_limit_exceeded";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol4 in error;
	}
};
var name4 = "GatewayModelNotFoundError";
var marker5 = `vercel.ai.gateway.error.${name4}`;
var symbol5 = Symbol.for(marker5);
var modelNotFoundParamSchema = lazySchema(() => zodSchema(object({ modelId: string() })));
var _a5, _b5;
var GatewayModelNotFoundError = class extends (_b5 = GatewayError, _a5 = symbol5, _b5) {
	constructor({ message = "Model not found", statusCode = 404, modelId, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a5] = true;
		this.name = name4;
		this.type = "model_not_found";
		this.modelId = modelId;
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol5 in error;
	}
};
var name5 = "GatewayInternalServerError";
var marker6 = `vercel.ai.gateway.error.${name5}`;
var symbol6 = Symbol.for(marker6);
var _a6, _b6;
var GatewayInternalServerError = class extends (_b6 = GatewayError, _a6 = symbol6, _b6) {
	constructor({ message = "Internal server error", statusCode = 500, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a6] = true;
		this.name = name5;
		this.type = "internal_server_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol6 in error;
	}
};
var name6 = "GatewayFailedDependencyError";
var marker7 = `vercel.ai.gateway.error.${name6}`;
var symbol7 = Symbol.for(marker7);
var _a7, _b7;
var GatewayFailedDependencyError = class extends (_b7 = GatewayError, _a7 = symbol7, _b7) {
	constructor({ message = "Failed dependency", statusCode = 424, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a7] = true;
		this.name = name6;
		this.type = "failed_dependency";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol7 in error;
	}
};
var name7 = "GatewayForbiddenError";
var marker8 = `vercel.ai.gateway.error.${name7}`;
var symbol8 = Symbol.for(marker8);
var _a8, _b8;
var GatewayForbiddenError = class extends (_b8 = GatewayError, _a8 = symbol8, _b8) {
	constructor({ message = "Forbidden", statusCode = 403, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a8] = true;
		this.name = name7;
		this.type = "forbidden";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol8 in error;
	}
};
var name8 = "GatewayResponseError";
var marker9 = `vercel.ai.gateway.error.${name8}`;
var symbol9 = Symbol.for(marker9);
var _a9, _b9;
var GatewayResponseError = class extends (_b9 = GatewayError, _a9 = symbol9, _b9) {
	constructor({ message = "Invalid response from Gateway", statusCode = 502, response, validationError, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a9] = true;
		this.name = name8;
		this.type = "response_error";
		this.response = response;
		this.validationError = validationError;
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol9 in error;
	}
};
async function createGatewayErrorFromResponse({ response, statusCode, defaultMessage = "Gateway request failed", cause, authMethod }) {
	var _a11;
	const parseResult = await safeValidateTypes({
		value: response,
		schema: gatewayErrorResponseSchema
	});
	if (!parseResult.success) {
		const rawGenerationId = typeof response === "object" && response !== null && "generationId" in response ? response.generationId : void 0;
		return new GatewayResponseError({
			message: `Invalid error response format: ${defaultMessage}`,
			statusCode,
			response,
			validationError: parseResult.error,
			cause,
			generationId: rawGenerationId
		});
	}
	const validatedResponse = parseResult.value;
	const errorType = validatedResponse.error.type;
	const message = validatedResponse.error.message;
	const generationId = (_a11 = validatedResponse.generationId) != null ? _a11 : void 0;
	switch (errorType) {
		case "authentication_error": return GatewayAuthenticationError.createContextualError({
			apiKeyProvided: authMethod === "api-key",
			oidcTokenProvided: authMethod === "oidc",
			statusCode,
			cause,
			generationId
		});
		case "invalid_request_error": return new GatewayInvalidRequestError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "rate_limit_exceeded": return new GatewayRateLimitError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "model_not_found": {
			const modelResult = await safeValidateTypes({
				value: validatedResponse.error.param,
				schema: modelNotFoundParamSchema
			});
			return new GatewayModelNotFoundError({
				message,
				statusCode,
				modelId: modelResult.success ? modelResult.value.modelId : void 0,
				cause,
				generationId
			});
		}
		case "internal_server_error": return new GatewayInternalServerError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "failed_dependency": return new GatewayFailedDependencyError({
			message,
			statusCode,
			cause,
			generationId
		});
		case "forbidden": return new GatewayForbiddenError({
			message,
			statusCode,
			cause,
			generationId
		});
		default: return new GatewayInternalServerError({
			message,
			statusCode,
			cause,
			generationId
		});
	}
}
var gatewayErrorResponseSchema = lazySchema(() => zodSchema(object({
	error: object({
		message: string(),
		type: string().nullish(),
		param: unknown().nullish(),
		code: union([string(), number()]).nullish()
	}),
	generationId: string().nullish()
})));
function extractApiCallResponse(error) {
	if (error.data !== void 0) return error.data;
	if (error.responseBody != null) try {
		return JSON.parse(error.responseBody);
	} catch (e) {
		return error.responseBody;
	}
	return {};
}
var name9 = "GatewayTimeoutError";
var marker10 = `vercel.ai.gateway.error.${name9}`;
var symbol10 = Symbol.for(marker10);
var _a10, _b10;
var GatewayTimeoutError = class _GatewayTimeoutError extends (_b10 = GatewayError, _a10 = symbol10, _b10) {
	constructor({ message = "Request timed out", statusCode = 408, cause, generationId } = {}) {
		super({
			message,
			statusCode,
			cause,
			generationId
		});
		this[_a10] = true;
		this.name = name9;
		this.type = "timeout_error";
	}
	static isInstance(error) {
		return GatewayError.hasMarker(error) && symbol10 in error;
	}
	/**
	* Creates a helpful timeout error message with troubleshooting guidance
	*/
	static createTimeoutError({ originalMessage, statusCode = 408, cause, generationId }) {
		return new _GatewayTimeoutError({
			message: `Gateway request timed out: ${originalMessage}

    This is a client-side timeout. To resolve this, increase your timeout configuration: https://vercel.com/docs/ai-gateway/capabilities/video-generation#extending-timeouts-for-node.js`,
			statusCode,
			cause,
			generationId
		});
	}
};
function isTimeoutError(error) {
	if (!(error instanceof Error)) return false;
	const errorCode = error.code;
	if (typeof errorCode === "string") return [
		"UND_ERR_HEADERS_TIMEOUT",
		"UND_ERR_BODY_TIMEOUT",
		"UND_ERR_CONNECT_TIMEOUT"
	].includes(errorCode);
	return false;
}
async function asGatewayError(error, authMethod) {
	var _a11;
	if (GatewayError.isInstance(error)) return error;
	if (isTimeoutError(error)) return GatewayTimeoutError.createTimeoutError({
		originalMessage: error instanceof Error ? error.message : "Unknown error",
		cause: error
	});
	if (APICallError.isInstance(error)) {
		if (error.cause && isTimeoutError(error.cause)) return GatewayTimeoutError.createTimeoutError({
			originalMessage: error.message,
			cause: error
		});
		return await createGatewayErrorFromResponse({
			response: extractApiCallResponse(error),
			statusCode: (_a11 = error.statusCode) != null ? _a11 : 500,
			defaultMessage: "Gateway request failed",
			cause: error,
			authMethod
		});
	}
	return await createGatewayErrorFromResponse({
		response: {},
		statusCode: 500,
		defaultMessage: error instanceof Error ? `Gateway request failed: ${error.message}` : "Unknown Gateway error",
		cause: error,
		authMethod
	});
}
var GATEWAY_AUTH_METHOD_HEADER = "ai-gateway-auth-method";
async function parseAuthMethod(headers) {
	const result = await safeValidateTypes({
		value: headers[GATEWAY_AUTH_METHOD_HEADER],
		schema: gatewayAuthMethodSchema
	});
	return result.success ? result.value : void 0;
}
var gatewayAuthMethodSchema = lazySchema(() => zodSchema(union([literal("api-key"), literal("oidc")])));
var KNOWN_MODEL_TYPES = [
	"embedding",
	"image",
	"language",
	"reranking",
	"video"
];
var GatewayFetchMetadata = class {
	constructor(config) {
		this.config = config;
	}
	async getAvailableModels() {
		try {
			const { value } = await getFromApi({
				url: `${this.config.baseURL}/config`,
				headers: await resolve(this.config.headers()),
				successfulResponseHandler: createJsonResponseHandler(gatewayAvailableModelsResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
	async getCredits() {
		try {
			const { value } = await getFromApi({
				url: `${new URL(this.config.baseURL).origin}/v1/credits`,
				headers: await resolve(this.config.headers()),
				successfulResponseHandler: createJsonResponseHandler(gatewayCreditsResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
};
var gatewayAvailableModelsResponseSchema = lazySchema(() => zodSchema(object({ models: array(object({
	id: string(),
	name: string(),
	description: string().nullish(),
	pricing: object({
		input: string(),
		output: string(),
		input_cache_read: string().nullish(),
		input_cache_write: string().nullish()
	}).transform(({ input, output, input_cache_read, input_cache_write }) => ({
		input,
		output,
		...input_cache_read ? { cachedInputTokens: input_cache_read } : {},
		...input_cache_write ? { cacheCreationInputTokens: input_cache_write } : {}
	})).nullish(),
	specification: object({
		specificationVersion: literal("v3"),
		provider: string(),
		modelId: string()
	}),
	modelType: string().nullish()
})).transform((models) => models.filter((m) => m.modelType == null || KNOWN_MODEL_TYPES.includes(m.modelType))) })));
var gatewayCreditsResponseSchema = lazySchema(() => zodSchema(object({
	balance: string(),
	total_used: string()
}).transform(({ balance, total_used }) => ({
	balance,
	totalUsed: total_used
}))));
var GatewaySpendReport = class {
	constructor(config) {
		this.config = config;
	}
	async getSpendReport(params) {
		try {
			const baseUrl = new URL(this.config.baseURL);
			const searchParams = new URLSearchParams();
			searchParams.set("start_date", params.startDate);
			searchParams.set("end_date", params.endDate);
			if (params.groupBy) searchParams.set("group_by", params.groupBy);
			if (params.datePart) searchParams.set("date_part", params.datePart);
			if (params.userId) searchParams.set("user_id", params.userId);
			if (params.model) searchParams.set("model", params.model);
			if (params.provider) searchParams.set("provider", params.provider);
			if (params.credentialType) searchParams.set("credential_type", params.credentialType);
			if (params.tags && params.tags.length > 0) searchParams.set("tags", params.tags.join(","));
			const { value } = await getFromApi({
				url: `${baseUrl.origin}/v1/report?${searchParams.toString()}`,
				headers: await resolve(this.config.headers()),
				successfulResponseHandler: createJsonResponseHandler(gatewaySpendReportResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
};
var gatewaySpendReportResponseSchema = lazySchema(() => zodSchema(object({ results: array(object({
	day: string().optional(),
	hour: string().optional(),
	user: string().optional(),
	model: string().optional(),
	tag: string().optional(),
	provider: string().optional(),
	credential_type: _enum(["byok", "system"]).optional(),
	total_cost: number(),
	market_cost: number().optional(),
	input_tokens: number().optional(),
	output_tokens: number().optional(),
	cached_input_tokens: number().optional(),
	cache_creation_input_tokens: number().optional(),
	reasoning_tokens: number().optional(),
	request_count: number().optional()
}).transform(({ credential_type, total_cost, market_cost, input_tokens, output_tokens, cached_input_tokens, cache_creation_input_tokens, reasoning_tokens, request_count, ...rest }) => ({
	...rest,
	...credential_type !== void 0 ? { credentialType: credential_type } : {},
	totalCost: total_cost,
	...market_cost !== void 0 ? { marketCost: market_cost } : {},
	...input_tokens !== void 0 ? { inputTokens: input_tokens } : {},
	...output_tokens !== void 0 ? { outputTokens: output_tokens } : {},
	...cached_input_tokens !== void 0 ? { cachedInputTokens: cached_input_tokens } : {},
	...cache_creation_input_tokens !== void 0 ? { cacheCreationInputTokens: cache_creation_input_tokens } : {},
	...reasoning_tokens !== void 0 ? { reasoningTokens: reasoning_tokens } : {},
	...request_count !== void 0 ? { requestCount: request_count } : {}
}))) })));
var GatewayGenerationInfoFetcher = class {
	constructor(config) {
		this.config = config;
	}
	async getGenerationInfo(params) {
		try {
			const { value } = await getFromApi({
				url: `${new URL(this.config.baseURL).origin}/v1/generation?id=${encodeURIComponent(params.id)}`,
				headers: await resolve(this.config.headers()),
				successfulResponseHandler: createJsonResponseHandler(gatewayGenerationInfoResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				fetch: this.config.fetch
			});
			return value;
		} catch (error) {
			throw await asGatewayError(error);
		}
	}
};
var gatewayGenerationInfoResponseSchema = lazySchema(() => zodSchema(object({ data: object({
	id: string(),
	total_cost: number(),
	upstream_inference_cost: number(),
	usage: number(),
	created_at: string(),
	model: string(),
	is_byok: boolean(),
	provider_name: string(),
	streamed: boolean(),
	finish_reason: string(),
	latency: number(),
	generation_time: number(),
	native_tokens_prompt: number(),
	native_tokens_completion: number(),
	native_tokens_reasoning: number(),
	native_tokens_cached: number(),
	native_tokens_cache_creation: number(),
	billable_web_search_calls: number()
}).transform(({ total_cost, upstream_inference_cost, created_at, is_byok, provider_name, finish_reason, generation_time, native_tokens_prompt, native_tokens_completion, native_tokens_reasoning, native_tokens_cached, native_tokens_cache_creation, billable_web_search_calls, ...rest }) => ({
	...rest,
	totalCost: total_cost,
	upstreamInferenceCost: upstream_inference_cost,
	createdAt: created_at,
	isByok: is_byok,
	providerName: provider_name,
	finishReason: finish_reason,
	generationTime: generation_time,
	promptTokens: native_tokens_prompt,
	completionTokens: native_tokens_completion,
	reasoningTokens: native_tokens_reasoning,
	cachedTokens: native_tokens_cached,
	cacheCreationTokens: native_tokens_cache_creation,
	billableWebSearchCalls: billable_web_search_calls
})) }).transform(({ data }) => data)));
var GatewayLanguageModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v3";
		this.supportedUrls = { "*/*": [/.*/] };
	}
	get provider() {
		return this.config.provider;
	}
	async getArgs(options) {
		const { abortSignal: _abortSignal, ...optionsWithoutSignal } = options;
		return {
			args: this.maybeEncodeFileParts(optionsWithoutSignal),
			warnings: []
		};
	}
	async doGenerate(options) {
		const { args, warnings } = await this.getArgs(options);
		const { abortSignal } = options;
		const resolvedHeaders = await resolve(this.config.headers());
		try {
			const { responseHeaders, value: responseBody, rawValue: rawResponse } = await postJsonToApi({
				url: this.getUrl(),
				headers: combineHeaders(resolvedHeaders, options.headers, this.getModelConfigHeaders(this.modelId, false), await resolve(this.config.o11yHeaders)),
				body: args,
				successfulResponseHandler: createJsonResponseHandler(any()),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				...responseBody,
				request: { body: args },
				response: {
					headers: responseHeaders,
					body: rawResponse
				},
				warnings
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
		}
	}
	async doStream(options) {
		const { args, warnings } = await this.getArgs(options);
		const { abortSignal } = options;
		const resolvedHeaders = await resolve(this.config.headers());
		try {
			const { value: response, responseHeaders } = await postJsonToApi({
				url: this.getUrl(),
				headers: combineHeaders(resolvedHeaders, options.headers, this.getModelConfigHeaders(this.modelId, true), await resolve(this.config.o11yHeaders)),
				body: args,
				successfulResponseHandler: createEventSourceResponseHandler(any()),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				stream: response.pipeThrough(new TransformStream({
					start(controller) {
						if (warnings.length > 0) controller.enqueue({
							type: "stream-start",
							warnings
						});
					},
					transform(chunk, controller) {
						if (chunk.success) {
							const streamPart = chunk.value;
							if (streamPart.type === "raw" && !options.includeRawChunks) return;
							if (streamPart.type === "response-metadata" && streamPart.timestamp && typeof streamPart.timestamp === "string") streamPart.timestamp = new Date(streamPart.timestamp);
							controller.enqueue(streamPart);
						} else controller.error(chunk.error);
					}
				})),
				request: { body: args },
				response: { headers: responseHeaders }
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
		}
	}
	isFilePart(part) {
		return part && typeof part === "object" && "type" in part && part.type === "file";
	}
	/**
	* Encodes file parts in the prompt to base64. Mutates the passed options
	* instance directly to avoid copying the file data.
	* @param options - The options to encode.
	* @returns The options with the file parts encoded.
	*/
	maybeEncodeFileParts(options) {
		for (const message of options.prompt) for (const part of message.content) if (this.isFilePart(part)) {
			const filePart = part;
			if (filePart.data instanceof Uint8Array) {
				const buffer = Uint8Array.from(filePart.data);
				const base64Data = Buffer.from(buffer).toString("base64");
				filePart.data = new URL(`data:${filePart.mediaType || "application/octet-stream"};base64,${base64Data}`);
			}
		}
		return options;
	}
	getUrl() {
		return `${this.config.baseURL}/language-model`;
	}
	getModelConfigHeaders(modelId, streaming) {
		return {
			"ai-language-model-specification-version": "3",
			"ai-language-model-id": modelId,
			"ai-language-model-streaming": String(streaming)
		};
	}
};
var GatewayEmbeddingModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v3";
		this.maxEmbeddingsPerCall = 2048;
		this.supportsParallelCalls = true;
	}
	get provider() {
		return this.config.provider;
	}
	async doEmbed({ values, headers, abortSignal, providerOptions }) {
		var _a11, _b11;
		const resolvedHeaders = await resolve(this.config.headers());
		try {
			const { responseHeaders, value: responseBody, rawValue } = await postJsonToApi({
				url: this.getUrl(),
				headers: combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await resolve(this.config.o11yHeaders)),
				body: {
					values,
					...providerOptions ? { providerOptions } : {}
				},
				successfulResponseHandler: createJsonResponseHandler(gatewayEmbeddingResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				embeddings: responseBody.embeddings,
				usage: (_a11 = responseBody.usage) != null ? _a11 : void 0,
				providerMetadata: responseBody.providerMetadata,
				response: {
					headers: responseHeaders,
					body: rawValue
				},
				warnings: (_b11 = responseBody.warnings) != null ? _b11 : []
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/embedding-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-embedding-model-specification-version": "3",
			"ai-model-id": this.modelId
		};
	}
};
var gatewayEmbeddingWarningSchema = discriminatedUnion("type", [
	object({
		type: literal("unsupported"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("compatibility"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("other"),
		message: string()
	})
]);
var gatewayEmbeddingResponseSchema = lazySchema(() => zodSchema(object({
	embeddings: array(array(number())),
	usage: object({ tokens: number() }).nullish(),
	warnings: array(gatewayEmbeddingWarningSchema).optional(),
	providerMetadata: record(string(), record(string(), unknown())).optional()
})));
var GatewayImageModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v3";
		this.maxImagesPerCall = Number.MAX_SAFE_INTEGER;
	}
	get provider() {
		return this.config.provider;
	}
	async doGenerate({ prompt, n, size, aspectRatio, seed, files, mask, providerOptions, headers, abortSignal }) {
		var _a11, _b11, _c, _d;
		const resolvedHeaders = await resolve(this.config.headers());
		try {
			const { responseHeaders, value: responseBody, rawValue } = await postJsonToApi({
				url: this.getUrl(),
				headers: combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await resolve(this.config.o11yHeaders)),
				body: {
					prompt,
					n,
					...size && { size },
					...aspectRatio && { aspectRatio },
					...seed && { seed },
					...providerOptions && { providerOptions },
					...files && { files: files.map((file) => maybeEncodeImageFile(file)) },
					...mask && { mask: maybeEncodeImageFile(mask) }
				},
				successfulResponseHandler: createJsonResponseHandler(gatewayImageResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				images: responseBody.images,
				warnings: (_a11 = responseBody.warnings) != null ? _a11 : [],
				providerMetadata: responseBody.providerMetadata,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders
				},
				...responseBody.usage != null && { usage: {
					inputTokens: (_b11 = responseBody.usage.inputTokens) != null ? _b11 : void 0,
					outputTokens: (_c = responseBody.usage.outputTokens) != null ? _c : void 0,
					totalTokens: (_d = responseBody.usage.totalTokens) != null ? _d : void 0
				} }
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/image-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-image-model-specification-version": "3",
			"ai-model-id": this.modelId
		};
	}
};
function maybeEncodeImageFile(file) {
	if (file.type === "file" && file.data instanceof Uint8Array) return {
		...file,
		data: convertUint8ArrayToBase64(file.data)
	};
	return file;
}
var providerMetadataEntrySchema = object({ images: array(unknown()).optional() }).catchall(unknown());
var gatewayImageWarningSchema = discriminatedUnion("type", [
	object({
		type: literal("unsupported"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("compatibility"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("other"),
		message: string()
	})
]);
var gatewayImageUsageSchema = object({
	inputTokens: number().nullish(),
	outputTokens: number().nullish(),
	totalTokens: number().nullish()
});
var gatewayImageResponseSchema = object({
	images: array(string()),
	warnings: array(gatewayImageWarningSchema).optional(),
	providerMetadata: record(string(), providerMetadataEntrySchema).optional(),
	usage: gatewayImageUsageSchema.optional()
});
var GatewayVideoModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v3";
		this.maxVideosPerCall = Number.MAX_SAFE_INTEGER;
	}
	get provider() {
		return this.config.provider;
	}
	async doGenerate({ prompt, n, aspectRatio, resolution, duration, fps, seed, image, providerOptions, headers, abortSignal }) {
		var _a11;
		const resolvedHeaders = await resolve(this.config.headers());
		try {
			const { responseHeaders, value: responseBody } = await postJsonToApi({
				url: this.getUrl(),
				headers: combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await resolve(this.config.o11yHeaders), { accept: "text/event-stream" }),
				body: {
					prompt,
					n,
					...aspectRatio && { aspectRatio },
					...resolution && { resolution },
					...duration && { duration },
					...fps && { fps },
					...seed && { seed },
					...providerOptions && { providerOptions },
					...image && { image: maybeEncodeVideoFile(image) }
				},
				successfulResponseHandler: async ({ response, url, requestBodyValues }) => {
					if (response.body == null) throw new APICallError({
						message: "SSE response body is empty",
						url,
						requestBodyValues,
						statusCode: response.status
					});
					const reader = parseJsonEventStream({
						stream: response.body,
						schema: gatewayVideoEventSchema
					}).getReader();
					const { done, value: parseResult } = await reader.read();
					reader.releaseLock();
					if (done || !parseResult) throw new APICallError({
						message: "SSE stream ended without a data event",
						url,
						requestBodyValues,
						statusCode: response.status
					});
					if (!parseResult.success) throw new APICallError({
						message: "Failed to parse video SSE event",
						cause: parseResult.error,
						url,
						requestBodyValues,
						statusCode: response.status
					});
					const event = parseResult.value;
					if (event.type === "error") throw new APICallError({
						message: event.message,
						statusCode: event.statusCode,
						url,
						requestBodyValues,
						responseHeaders: Object.fromEntries([...response.headers]),
						responseBody: JSON.stringify(event),
						data: { error: {
							message: event.message,
							type: event.errorType,
							param: event.param
						} }
					});
					return {
						value: {
							videos: event.videos,
							warnings: event.warnings,
							providerMetadata: event.providerMetadata
						},
						responseHeaders: Object.fromEntries([...response.headers])
					};
				},
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				videos: responseBody.videos,
				warnings: (_a11 = responseBody.warnings) != null ? _a11 : [],
				providerMetadata: responseBody.providerMetadata,
				response: {
					timestamp: /* @__PURE__ */ new Date(),
					modelId: this.modelId,
					headers: responseHeaders
				}
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/video-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-video-model-specification-version": "3",
			"ai-model-id": this.modelId
		};
	}
};
function maybeEncodeVideoFile(file) {
	if (file.type === "file" && file.data instanceof Uint8Array) return {
		...file,
		data: convertUint8ArrayToBase64(file.data)
	};
	return file;
}
var providerMetadataEntrySchema2 = object({ videos: array(unknown()).optional() }).catchall(unknown());
var gatewayVideoDataSchema = union([object({
	type: literal("url"),
	url: string(),
	mediaType: string()
}), object({
	type: literal("base64"),
	data: string(),
	mediaType: string()
})]);
var gatewayVideoWarningSchema = discriminatedUnion("type", [
	object({
		type: literal("unsupported"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("compatibility"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("other"),
		message: string()
	})
]);
var gatewayVideoEventSchema = discriminatedUnion("type", [object({
	type: literal("result"),
	videos: array(gatewayVideoDataSchema),
	warnings: array(gatewayVideoWarningSchema).optional(),
	providerMetadata: record(string(), providerMetadataEntrySchema2).optional()
}), object({
	type: literal("error"),
	message: string(),
	errorType: string(),
	statusCode: number(),
	param: unknown().nullable()
})]);
var GatewayRerankingModel = class {
	constructor(modelId, config) {
		this.modelId = modelId;
		this.config = config;
		this.specificationVersion = "v3";
	}
	get provider() {
		return this.config.provider;
	}
	async doRerank({ documents, query, topN, headers, abortSignal, providerOptions }) {
		var _a11;
		const resolvedHeaders = await resolve(this.config.headers());
		try {
			const { responseHeaders, value: responseBody, rawValue } = await postJsonToApi({
				url: this.getUrl(),
				headers: combineHeaders(resolvedHeaders, headers != null ? headers : {}, this.getModelConfigHeaders(), await resolve(this.config.o11yHeaders)),
				body: {
					documents,
					query,
					...topN != null ? { topN } : {},
					...providerOptions ? { providerOptions } : {}
				},
				successfulResponseHandler: createJsonResponseHandler(gatewayRerankingResponseSchema),
				failedResponseHandler: createJsonErrorResponseHandler({
					errorSchema: any(),
					errorToMessage: (data) => data
				}),
				...abortSignal && { abortSignal },
				fetch: this.config.fetch
			});
			return {
				ranking: responseBody.ranking,
				providerMetadata: responseBody.providerMetadata,
				response: {
					headers: responseHeaders,
					body: rawValue
				},
				warnings: (_a11 = responseBody.warnings) != null ? _a11 : []
			};
		} catch (error) {
			throw await asGatewayError(error, await parseAuthMethod(resolvedHeaders));
		}
	}
	getUrl() {
		return `${this.config.baseURL}/reranking-model`;
	}
	getModelConfigHeaders() {
		return {
			"ai-reranking-model-specification-version": "3",
			"ai-model-id": this.modelId
		};
	}
};
var gatewayRerankingWarningSchema = discriminatedUnion("type", [
	object({
		type: literal("unsupported"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("compatibility"),
		feature: string(),
		details: string().optional()
	}),
	object({
		type: literal("other"),
		message: string()
	})
]);
var gatewayRerankingResponseSchema = lazySchema(() => zodSchema(object({
	ranking: array(object({
		index: number(),
		relevanceScore: number()
	})),
	warnings: array(gatewayRerankingWarningSchema).optional(),
	providerMetadata: record(string(), record(string(), unknown())).optional()
})));
var parallelSearchToolFactory = createProviderToolFactoryWithOutputSchema({
	id: "gateway.parallel_search",
	inputSchema: lazySchema(() => zodSchema(object({
		objective: string().describe("Natural-language description of the web research goal, including source or freshness guidance and broader context from the task. Maximum 5000 characters."),
		search_queries: array(string()).optional().describe("Optional search queries to supplement the objective. Maximum 200 characters per query."),
		mode: _enum(["one-shot", "agentic"]).optional().describe("Mode preset: \"one-shot\" for comprehensive results with longer excerpts (default), \"agentic\" for concise, token-efficient results for multi-step workflows."),
		max_results: number().optional().describe("Maximum number of results to return (1-20). Defaults to 10 if not specified."),
		source_policy: object({
			include_domains: array(string()).optional().describe("List of domains to include in search results."),
			exclude_domains: array(string()).optional().describe("List of domains to exclude from search results."),
			after_date: string().optional().describe("Only include results published after this date (ISO 8601 format).")
		}).optional().describe("Source policy for controlling which domains to include/exclude and freshness."),
		excerpts: object({
			max_chars_per_result: number().optional().describe("Maximum characters per result."),
			max_chars_total: number().optional().describe("Maximum total characters across all results.")
		}).optional().describe("Excerpt configuration for controlling result length."),
		fetch_policy: object({ max_age_seconds: number().optional().describe("Maximum age in seconds for cached content. Set to 0 to always fetch fresh content.") }).optional().describe("Fetch policy for controlling content freshness.")
	}))),
	outputSchema: lazySchema(() => zodSchema(union([object({
		searchId: string(),
		results: array(object({
			url: string(),
			title: string(),
			excerpt: string(),
			publishDate: string().nullable().optional(),
			relevanceScore: number().optional()
		}))
	}), object({
		error: _enum([
			"api_error",
			"rate_limit",
			"timeout",
			"invalid_input",
			"configuration_error",
			"unknown"
		]),
		statusCode: number().optional(),
		message: string()
	})])))
});
var parallelSearch = (config = {}) => parallelSearchToolFactory(config);
var perplexitySearchToolFactory = createProviderToolFactoryWithOutputSchema({
	id: "gateway.perplexity_search",
	inputSchema: lazySchema(() => zodSchema(object({
		query: union([string(), array(string())]).describe("Search query (string) or multiple queries (array of up to 5 strings). Multi-query searches return combined results from all queries."),
		max_results: number().optional().describe("Maximum number of search results to return (1-20, default: 10)"),
		max_tokens_per_page: number().optional().describe("Maximum number of tokens to extract per search result page (256-2048, default: 2048)"),
		max_tokens: number().optional().describe("Maximum total tokens across all search results (default: 25000, max: 1000000)"),
		country: string().optional().describe("Two-letter ISO 3166-1 alpha-2 country code for regional search results (e.g., 'US', 'GB', 'FR')"),
		search_domain_filter: array(string()).optional().describe("List of domains to include or exclude from search results (max 20). To include: ['nature.com', 'science.org']. To exclude: ['-example.com', '-spam.net']"),
		search_language_filter: array(string()).optional().describe("List of ISO 639-1 language codes to filter results (max 10, lowercase). Examples: ['en', 'fr', 'de']"),
		search_after_date: string().optional().describe("Include only results published after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."),
		search_before_date: string().optional().describe("Include only results published before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."),
		last_updated_after_filter: string().optional().describe("Include only results last updated after this date. Format: 'MM/DD/YYYY' (e.g., '3/1/2025'). Cannot be used with search_recency_filter."),
		last_updated_before_filter: string().optional().describe("Include only results last updated before this date. Format: 'MM/DD/YYYY' (e.g., '3/15/2025'). Cannot be used with search_recency_filter."),
		search_recency_filter: _enum([
			"day",
			"week",
			"month",
			"year"
		]).optional().describe("Filter results by relative time period. Cannot be used with search_after_date or search_before_date.")
	}))),
	outputSchema: lazySchema(() => zodSchema(union([object({
		results: array(object({
			title: string(),
			url: string(),
			snippet: string(),
			date: string().optional(),
			lastUpdated: string().optional()
		})),
		id: string()
	}), object({
		error: _enum([
			"api_error",
			"rate_limit",
			"timeout",
			"invalid_input",
			"unknown"
		]),
		statusCode: number().optional(),
		message: string()
	})])))
});
var perplexitySearch = (config = {}) => perplexitySearchToolFactory(config);
var gatewayTools = {
	/**
	* Search the web using Parallel AI's Search API for LLM-optimized excerpts.
	*
	* Takes a natural language objective and returns relevant excerpts,
	* replacing multiple keyword searches with a single call for broad
	* or complex queries. Supports different search types for depth vs
	* breadth tradeoffs.
	*/
	parallelSearch,
	/**
	* Search the web using Perplexity's Search API for real-time information,
	* news, research papers, and articles.
	*
	* Provides ranked search results with advanced filtering options including
	* domain, language, date range, and recency filters.
	*/
	perplexitySearch
};
async function getVercelRequestId() {
	var _a11;
	return (_a11 = (0, import_dist.getContext)().headers) == null ? void 0 : _a11["x-vercel-id"];
}
var VERSION = "3.0.131";
var AI_GATEWAY_PROTOCOL_VERSION = "0.0.1";
function createGatewayProvider(options = {}) {
	var _a11, _b11;
	let pendingMetadata = null;
	let metadataCache = null;
	const cacheRefreshMillis = (_a11 = options.metadataCacheRefreshMillis) != null ? _a11 : 1e3 * 60 * 5;
	let lastFetchTime = 0;
	const baseURL = (_b11 = withoutTrailingSlash(options.baseURL)) != null ? _b11 : "https://ai-gateway.vercel.sh/v3/ai";
	const getHeaders = async () => {
		try {
			const auth = await getGatewayAuthToken(options);
			return withUserAgentSuffix({
				Authorization: `Bearer ${auth.token}`,
				"ai-gateway-protocol-version": AI_GATEWAY_PROTOCOL_VERSION,
				[GATEWAY_AUTH_METHOD_HEADER]: auth.authMethod,
				...options.headers
			}, `ai-sdk/gateway/${VERSION}`);
		} catch (error) {
			throw GatewayAuthenticationError.createContextualError({
				apiKeyProvided: false,
				oidcTokenProvided: false,
				statusCode: 401,
				cause: error
			});
		}
	};
	const createO11yHeaders = () => {
		const deploymentId = loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_DEPLOYMENT_ID"
		});
		const environment = loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_ENV"
		});
		const region = loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_REGION"
		});
		const projectId = loadOptionalSetting({
			settingValue: void 0,
			environmentVariableName: "VERCEL_PROJECT_ID"
		});
		return async () => {
			const requestId = await getVercelRequestId();
			return {
				...deploymentId && { "ai-o11y-deployment-id": deploymentId },
				...environment && { "ai-o11y-environment": environment },
				...region && { "ai-o11y-region": region },
				...requestId && { "ai-o11y-request-id": requestId },
				...projectId && { "ai-o11y-project-id": projectId }
			};
		};
	};
	const createLanguageModel = (modelId) => {
		return new GatewayLanguageModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	const getAvailableModels = async () => {
		var _a12, _b12, _c;
		const now = (_c = (_b12 = (_a12 = options._internal) == null ? void 0 : _a12.currentDate) == null ? void 0 : _b12.call(_a12).getTime()) != null ? _c : Date.now();
		if (!pendingMetadata || now - lastFetchTime > cacheRefreshMillis) {
			lastFetchTime = now;
			pendingMetadata = new GatewayFetchMetadata({
				baseURL,
				headers: getHeaders,
				fetch: options.fetch
			}).getAvailableModels().then((metadata) => {
				metadataCache = metadata;
				return metadata;
			}).catch(async (error) => {
				throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
			});
		}
		return metadataCache ? Promise.resolve(metadataCache) : pendingMetadata;
	};
	const getCredits = async () => {
		return new GatewayFetchMetadata({
			baseURL,
			headers: getHeaders,
			fetch: options.fetch
		}).getCredits().catch(async (error) => {
			throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
		});
	};
	const getSpendReport = async (params) => {
		return new GatewaySpendReport({
			baseURL,
			headers: getHeaders,
			fetch: options.fetch
		}).getSpendReport(params).catch(async (error) => {
			throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
		});
	};
	const getGenerationInfo = async (params) => {
		return new GatewayGenerationInfoFetcher({
			baseURL,
			headers: getHeaders,
			fetch: options.fetch
		}).getGenerationInfo(params).catch(async (error) => {
			throw await asGatewayError(error, await parseAuthMethod(await getHeaders()));
		});
	};
	const provider = function(modelId) {
		if (new.target) throw new Error("The Gateway Provider model function cannot be called with the new keyword.");
		return createLanguageModel(modelId);
	};
	provider.specificationVersion = "v3";
	provider.getAvailableModels = getAvailableModels;
	provider.getCredits = getCredits;
	provider.getSpendReport = getSpendReport;
	provider.getGenerationInfo = getGenerationInfo;
	provider.imageModel = (modelId) => {
		return new GatewayImageModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.languageModel = createLanguageModel;
	const createEmbeddingModel = (modelId) => {
		return new GatewayEmbeddingModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.embeddingModel = createEmbeddingModel;
	provider.textEmbeddingModel = createEmbeddingModel;
	provider.videoModel = (modelId) => {
		return new GatewayVideoModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	const createRerankingModel = (modelId) => {
		return new GatewayRerankingModel(modelId, {
			provider: "gateway",
			baseURL,
			headers: getHeaders,
			fetch: options.fetch,
			o11yHeaders: createO11yHeaders()
		});
	};
	provider.rerankingModel = createRerankingModel;
	provider.reranking = createRerankingModel;
	provider.chat = provider.languageModel;
	provider.embedding = provider.embeddingModel;
	provider.image = provider.imageModel;
	provider.video = provider.videoModel;
	provider.tools = gatewayTools;
	return provider;
}
var gateway = createGatewayProvider();
async function getGatewayAuthToken(options) {
	const apiKey = loadOptionalSetting({
		settingValue: options.apiKey,
		environmentVariableName: "AI_GATEWAY_API_KEY"
	});
	if (apiKey) return {
		token: apiKey,
		authMethod: "api-key"
	};
	return {
		token: await (0, import_dist.getVercelOidcToken)(),
		authMethod: "oidc"
	};
}
//#endregion
export { require_token_error as a, require_token_util as i, GatewayError as n, gateway as r, GatewayAuthenticationError as t };
