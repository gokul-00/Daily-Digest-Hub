import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { useDumps } from "@/lib/dumps-store";
import {
  isDuplicateShare,
  markShareHandled,
  parseSharePayload,
  type SharePayload,
} from "@/lib/share-payload";
import { getSession } from "@/lib/auth.functions";

const ShareSearchSchema = z.object({
  title: z.string().optional(),
  text: z.string().optional(),
  url: z.string().optional(),
});

export const Route = createFileRoute("/share")({
  validateSearch: (search) => ShareSearchSchema.parse(search),
  beforeLoad: async ({ search }) => {
    const { user } = await getSession();
    if (!user) {
      throw redirect({
        to: "/login",
        search: {
          next: "/share",
          title: search.title,
          text: search.text,
          url: search.url,
        },
      });
    }
  },
  component: SharePage,
});

function SharePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { add, ready } = useDumps();
  const handled = useRef(false);

  useEffect(() => {
    if (!ready || handled.current) return;
    handled.current = true;

    const payload: SharePayload = {
      title: search.title,
      text: search.text,
      url: search.url,
    };

    const parsed = parseSharePayload(payload);
    if (!parsed) {
      void navigate({ to: "/" });
      return;
    }

    if (isDuplicateShare(parsed.content)) {
      void navigate({ to: "/", search: { shared: "1" } });
      return;
    }

    add(parsed.content, parsed.type);
    markShareHandled(parsed.content);
    void navigate({ to: "/", search: { shared: "1" } });
  }, [add, navigate, ready, search.title, search.text, search.url]);

  return (
    <main className="safe-pt safe-pb safe-px flex min-h-[100dvh] items-center justify-center px-4">
      <p className="font-mono text-sm text-ink-soft">Saving to your pile…</p>
    </main>
  );
}
