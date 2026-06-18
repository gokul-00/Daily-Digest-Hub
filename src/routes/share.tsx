import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { z } from "zod";

import { getSession } from "@/lib/auth.functions";
import {
  isDuplicateShare,
  parseSharePayload,
  stashShareDraft,
  type SharePayload,
} from "@/lib/share-payload";

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
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
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
      void navigate({ to: "/" });
      return;
    }

    stashShareDraft(parsed);
    void navigate({ to: "/", search: { shared: "draft" } });
  }, [navigate, search.title, search.text, search.url]);

  return (
    <main className="safe-pt safe-pb safe-px flex min-h-[100dvh] items-center justify-center px-4">
      <p className="font-mono text-sm text-ink-soft">Opening pile…</p>
    </main>
  );
}
