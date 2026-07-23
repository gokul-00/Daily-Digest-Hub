import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { getSession } from "@/lib/auth.functions";

export const Route = createFileRoute("/exam")({
  beforeLoad: async () => {
    const { user } = await getSession();
    if (!user) throw redirect({ to: "/login" });
  },
  component: ExamLayout,
});

function ExamLayout() {
  return <Outlet />;
}
