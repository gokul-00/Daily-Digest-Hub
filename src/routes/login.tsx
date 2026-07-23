import { createFileRoute, redirect } from "@tanstack/react-router";
import { useId, useState } from "react";
import { z } from "zod";

import { getSession } from "@/lib/auth.functions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const LoginSearchSchema = z.object({
  next: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
});

const EmailSchema = z
  .string()
  .trim()
  .min(1, "Enter your email.")
  .email("Enter a valid email address.");

const SignInSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, "Enter your password."),
});

const RegisterSchema = z
  .object({
    email: EmailSchema,
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Password must include a letter.")
      .regex(/[0-9]/, "Password must include a number."),
    confirmPassword: z.string().min(1, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FieldErrors = Partial<Record<"email" | "password" | "confirmPassword" | "form", string>>;

type Banner = {
  tone: "error" | "success" | "info";
  title: string;
  body?: string;
};

function buildPostLoginUrl(search: z.infer<typeof LoginSearchSchema>): string {
  if (search.next === "/share") {
    const params = new URLSearchParams();
    if (search.title) params.set("title", search.title);
    if (search.text) params.set("text", search.text);
    if (search.url) params.set("url", search.url);
    const qs = params.toString();
    return qs ? `/share?${qs}` : "/share";
  }
  if (search.next?.startsWith("/")) return search.next;
  return "/";
}

function mapAuthError(message: string, mode: "signin" | "register"): Banner {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return {
      tone: "error",
      title: "Sign in failed",
      body: "Wrong email or password. Check both and try again.",
    };
  }
  if (lower.includes("email not confirmed")) {
    return {
      tone: "error",
      title: "Email not confirmed",
      body: "Open the confirmation link we sent, then sign in.",
    };
  }
  if (
    lower.includes("user already registered") ||
    lower.includes("already been registered") ||
    lower.includes("already registered")
  ) {
    return {
      tone: "error",
      title: "Account already exists",
      body: "An account with this email is already registered. Sign in instead.",
    };
  }
  if (lower.includes("password") && (lower.includes("least") || lower.includes("short"))) {
    return {
      tone: "error",
      title: "Password too short",
      body: "Use at least 8 characters with a letter and a number.",
    };
  }
  if (lower.includes("rate limit") || lower.includes("too many")) {
    return {
      tone: "error",
      title: "Too many attempts",
      body: "Wait a few minutes, then try again.",
    };
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return {
      tone: "error",
      title: "Connection problem",
      body: "Check your internet and try again.",
    };
  }

  return {
    tone: "error",
    title: mode === "register" ? "Could not create account" : "Could not sign in",
    body: message || "Something went wrong. Please try again.",
  };
}

function zodToFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (key === "email" || key === "password" || key === "confirmPassword") {
      if (!out[key]) out[key] = issue.message;
    } else if (!out.form) {
      out.form = issue.message;
    }
  }
  return out;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search) => LoginSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "Sign in — Later." },
      { name: "description", content: "Sign in to sync your Later. pile." },
    ],
  }),
  beforeLoad: async () => {
    const { user } = await getSession();
    if (user) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

function StatusBanner({
  banner,
  onDismiss,
}: {
  banner: Banner;
  onDismiss?: () => void;
}) {
  const styles =
    banner.tone === "error"
      ? "border-destructive/40 bg-destructive/5 text-ink"
      : banner.tone === "success"
        ? "border-accent/40 bg-accent/5 text-ink"
        : "border-border bg-background/60 text-ink";

  return (
    <div
      role={banner.tone === "error" ? "alert" : "status"}
      aria-live="polite"
      className={"mt-6 rounded-md border px-4 py-3 " + styles}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={
              "font-mono text-[10px] uppercase tracking-[0.18em] " +
              (banner.tone === "error" ? "text-destructive" : "text-marginalia")
            }
          >
            {banner.tone === "error" ? "Error" : banner.tone === "success" ? "Success" : "Note"}
          </p>
          <p className="mt-1 font-display text-base text-ink">{banner.title}</p>
          {banner.body && <p className="mt-1 text-sm leading-relaxed text-ink-soft">{banner.body}</p>}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-marginalia hover:text-ink"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 font-mono text-[11px] text-destructive">
      {message}
    </p>
  );
}

function LoginPage() {
  const search = Route.useSearch();
  const formId = useId();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  function resetMessages() {
    setFieldErrors({});
    setBanner(null);
  }

  function switchMode(next: "signin" | "register") {
    setMode(next);
    setRegistered(false);
    setConfirmPassword("");
    resetMessages();
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

    const parsed = SignInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors = zodToFieldErrors(parsed.error);
      setFieldErrors(errors);
      setBanner({
        tone: "error",
        title: "Check the form",
        body: "Fix the highlighted fields, then try again.",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (authError) throw authError;
      window.location.href = buildPostLoginUrl(search);
    } catch (err) {
      setBanner(mapAuthError((err as Error).message ?? "", "signin"));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    resetMessages();

    const parsed = RegisterSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const errors = zodToFieldErrors(parsed.error);
      setFieldErrors(errors);
      setBanner({
        tone: "error",
        title: "Check the form",
        body: errors.confirmPassword
          ? errors.confirmPassword
          : "Fix the highlighted fields, then try again.",
      });
      return;
    }

    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}${buildPostLoginUrl(search)}`;
      const { data, error: authError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (authError) throw authError;

      // Supabase may return a user with empty identities when the email is taken
      // and "Confirm email" is enabled (anti-enumeration).
      const identities = data.user?.identities;
      if (Array.isArray(identities) && identities.length === 0) {
        setBanner({
          tone: "error",
          title: "Account already exists",
          body: "An account with this email is already registered. Sign in instead.",
        });
        return;
      }

      if (data.session) {
        window.location.href = buildPostLoginUrl(search);
        return;
      }

      setRegistered(true);
      setBanner({
        tone: "success",
        title: "Check your inbox",
        body: `We sent a confirmation link to ${parsed.data.email}. Confirm, then sign in.`,
      });
    } catch (err) {
      setBanner(mapAuthError((err as Error).message ?? "", "register"));
    } finally {
      setLoading(false);
    }
  }

  const emailErrorId = `${formId}-email-error`;
  const passwordErrorId = `${formId}-password-error`;
  const confirmErrorId = `${formId}-confirm-error`;

  const inputClass = (invalid: boolean) =>
    "mt-2 w-full rounded-md border bg-background/60 px-4 py-3 font-sans text-base text-ink focus:outline-none focus:ring-2 " +
    (invalid
      ? "border-destructive/60 focus:ring-destructive/40"
      : "border-border focus:ring-ring/60");

  return (
    <main className="safe-pt safe-pb safe-px flex min-h-[100dvh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="paper-card w-full max-w-md rounded-lg p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">Later.</p>
        <h1 className="mt-3 font-display text-2xl tracking-tight text-ink sm:text-3xl">
          {mode === "register" ? "Create account" : "Sign in"}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          {mode === "register"
            ? "Register with email and password to sync your pile across devices."
            : "Sign in with email and password to sync your pile across devices."}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:gap-2" role="tablist" aria-label="Auth mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signin"}
            onClick={() => switchMode("signin")}
            className={
              "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] " +
              (mode === "signin"
                ? "border-ink bg-ink text-primary-foreground"
                : "border-border text-ink-soft")
            }
          >
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            onClick={() => switchMode("register")}
            className={
              "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] " +
              (mode === "register"
                ? "border-ink bg-ink text-primary-foreground"
                : "border-border text-ink-soft")
            }
          >
            Register
          </button>
        </div>

        {banner && <StatusBanner banner={banner} onDismiss={() => setBanner(null)} />}

        {registered && mode === "register" ? (
          <div className="mt-6 space-y-4">
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="touch-target w-full rounded-md bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <form
            onSubmit={mode === "register" ? handleRegister : handleSignIn}
            className="mt-6 space-y-4"
            noValidate
          >
            <div>
              <label
                htmlFor={`${formId}-email`}
                className="block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia"
              >
                Email
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                inputMode="email"
                value={email}
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? emailErrorId : undefined}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((f) => ({ ...f, email: undefined }));
                }}
                className={inputClass(!!fieldErrors.email)}
              />
              <FieldError id={emailErrorId} message={fieldErrors.email} />
            </div>

            <div>
              <label
                htmlFor={`${formId}-password`}
                className="block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia"
              >
                Password
              </label>
              <input
                id={`${formId}-password`}
                type="password"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                value={password}
                aria-invalid={!!fieldErrors.password}
                aria-describedby={
                  fieldErrors.password
                    ? passwordErrorId
                    : mode === "register"
                      ? `${formId}-password-hint`
                      : undefined
                }
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((f) => ({ ...f, password: undefined }));
                }}
                className={inputClass(!!fieldErrors.password)}
              />
              {mode === "register" && !fieldErrors.password && (
                <p
                  id={`${formId}-password-hint`}
                  className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-marginalia"
                >
                  At least 8 characters · letter + number
                </p>
              )}
              <FieldError id={passwordErrorId} message={fieldErrors.password} />
            </div>

            {mode === "register" && (
              <div>
                <label
                  htmlFor={`${formId}-confirm`}
                  className="block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia"
                >
                  Confirm password
                </label>
                <input
                  id={`${formId}-confirm`}
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={fieldErrors.confirmPassword ? confirmErrorId : undefined}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((f) => ({ ...f, confirmPassword: undefined }));
                    }
                  }}
                  className={inputClass(!!fieldErrors.confirmPassword)}
                />
                <FieldError id={confirmErrorId} message={fieldErrors.confirmPassword} />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="touch-target w-full rounded-md bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:opacity-40"
            >
              {loading
                ? mode === "register"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "register"
                  ? "Register"
                  : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
