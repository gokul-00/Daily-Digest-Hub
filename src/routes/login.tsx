import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

import { getSession } from "@/lib/auth.functions";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const LoginSearchSchema = z.object({
  next: z.string().optional(),
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
});

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

function LoginPage() {
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"magic" | "password">("magic");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}${buildPostLoginUrl(search)}`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (authError) throw authError;
      setSent(true);
    } catch (err) {
      setError((err as Error).message ?? "Could not send magic link.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) throw authError;
      window.location.href = buildPostLoginUrl(search);
    } catch (err) {
      setError((err as Error).message ?? "Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="safe-pt safe-pb safe-px flex min-h-[100dvh] items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="paper-card w-full max-w-md rounded-lg p-6 sm:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia">Later.</p>
        <h1 className="mt-3 font-display text-2xl tracking-tight text-ink sm:text-3xl">Sign in</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Sync your pile across devices. Magic link is easiest — no password needed.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={
              "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] " +
              (mode === "magic"
                ? "border-ink bg-ink text-primary-foreground"
                : "border-border text-ink-soft")
            }
          >
            Magic link
          </button>
          <button
            type="button"
            onClick={() => setMode("password")}
            className={
              "touch-target rounded-md border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em] " +
              (mode === "password"
                ? "border-ink bg-ink text-primary-foreground"
                : "border-border text-ink-soft")
            }
          >
            Password
          </button>
        </div>

        {sent && mode === "magic" ? (
          <p className="mt-6 font-display text-lg italic text-ink">
            Check your inbox — we sent a sign-in link to {email}.
          </p>
        ) : (
          <form
            onSubmit={mode === "magic" ? handleMagicLink : handlePassword}
            className="mt-6 space-y-4"
          >
            <div>
              <label
                htmlFor="email"
                className="block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-md border border-border bg-background/60 px-4 py-3 font-sans text-base text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
              />
            </div>
            {mode === "password" && (
              <div>
                <label
                  htmlFor="password"
                  className="block font-mono text-[11px] uppercase tracking-[0.2em] text-marginalia"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-2 w-full rounded-md border border-border bg-background/60 px-4 py-3 font-sans text-base text-ink focus:outline-none focus:ring-2 focus:ring-ring/60"
                />
              </div>
            )}
            {error && <p className="font-mono text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="touch-target w-full rounded-md bg-ink px-5 py-3 font-mono text-xs uppercase tracking-[0.18em] text-primary-foreground transition hover:bg-accent disabled:opacity-40"
            >
              {loading ? "Working…" : mode === "magic" ? "Send magic link" : "Sign in"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
