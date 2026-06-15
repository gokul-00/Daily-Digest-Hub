import { createServerFn } from "@tanstack/react-start";

import { createSupabaseServerClient } from "./supabase/server";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { user: null as null };
  return {
    user: {
      id: user.id,
      email: user.email ?? null,
    },
  };
});
