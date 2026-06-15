import { o as __toESM } from "../_runtime.mjs";
import { t as getSupabaseBrowserClient } from "./client-CWvg5vgi.mjs";
import { c as require_react, s as require_jsx_runtime } from "../_libs/@emotion/react+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-qmlCXkz6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LoginPage() {
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [mode, setMode] = (0, import_react.useState)("magic");
	const [sent, setSent] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	async function handleMagicLink(e) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const { error: authError } = await getSupabaseBrowserClient().auth.signInWithOtp({
				email: email.trim(),
				options: { emailRedirectTo: `${window.location.origin}/` }
			});
			if (authError) throw authError;
			setSent(true);
		} catch (err) {
			setError(err.message ?? "Could not send magic link.");
		} finally {
			setLoading(false);
		}
	}
	async function handlePassword(e) {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const { error: authError } = await getSupabaseBrowserClient().auth.signInWithPassword({
				email: email.trim(),
				password
			});
			if (authError) throw authError;
			window.location.href = "/";
		} catch (err) {
			setError(err.message ?? "Could not sign in.");
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "safe-pt safe-pb safe-px flex min-h-[100dvh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "paper-card w-full max-w-md rounded-lg p-6 sm:p-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
					children: "Later."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-3 font-display text-2xl tracking-tight text-ink sm:text-3xl",
					children: "Sign in"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-ink-soft",
					children: "Sync your pile across devices. Magic link is easiest — no password needed."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid grid-cols-2 gap-2 sm:flex sm:gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMode("magic"),
						className: "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] " + (mode === "magic" ? "border-ink bg-ink text-primary-foreground" : "border-border text-ink-soft"),
						children: "Magic link"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMode("password"),
						className: "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] " + (mode === "password" ? "border-ink bg-ink text-primary-foreground" : "border-border text-ink-soft"),
						children: "Password"
					})]
				}),
				sent && mode === "magic" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-6 font-display text-lg italic text-ink",
					children: [
						"Check your inbox — we sent a sign-in link to ",
						email,
						"."
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: mode === "magic" ? handleMagicLink : handlePassword,
					className: "mt-6 space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "email",
							className: "block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
							children: "Email"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "email",
							type: "email",
							required: true,
							autoComplete: "email",
							value: email,
							onChange: (e) => setEmail(e.target.value),
							className: "mt-2 w-full rounded-md border border-border bg-background/60 px-4 py-3 font-sans text-base text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
						})] }),
						mode === "password" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "password",
							className: "block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia",
							children: "Password"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							id: "password",
							type: "password",
							required: true,
							autoComplete: "current-password",
							value: password,
							onChange: (e) => setPassword(e.target.value),
							className: "mt-2 w-full rounded-md border border-border bg-background/60 px-4 py-3 font-sans text-base text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
						})] }),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-mono text-sm text-destructive",
							children: error
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: loading,
							className: "touch-target w-full rounded-md bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:opacity-40",
							children: loading ? "Working…" : mode === "magic" ? "Send magic link" : "Sign in"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { LoginPage as component };
