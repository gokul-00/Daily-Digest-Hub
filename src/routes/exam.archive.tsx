import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/exam/archive")({
  component: ExamArchiveLayout,
});

function ExamArchiveLayout() {
  return <Outlet />;
}
