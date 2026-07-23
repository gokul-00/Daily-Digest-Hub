import { Link, useRouterState } from "@tanstack/react-router";

/**
 * Shared bottom product shell — phone-native only (hidden from md / laptop-web).
 */
export function ProductTabBar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onExam = pathname === "/exam" || pathname.startsWith("/exam/");
  const onLater = pathname === "/" || pathname.startsWith("/digest");

  const itemClass = (active: boolean) =>
    "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-2 py-2 font-mono text-[10px] uppercase tracking-[0.16em] transition " +
    (active ? "bg-ink text-primary-foreground" : "text-ink-soft hover:text-ink");

  return (
    <nav
      aria-label="Products"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-[color-mix(in_oklab,var(--card)_92%,transparent)] px-3 pt-1.5 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="mx-auto flex max-w-3xl gap-1.5">
        <Link to="/" className={itemClass(onLater)} aria-current={onLater ? "page" : undefined}>
          <span className="font-display text-sm normal-case tracking-normal">Later.</span>
          <span>pile</span>
        </Link>
        <Link to="/exam" className={itemClass(onExam)} aria-current={onExam ? "page" : undefined}>
          <span className="font-display text-sm normal-case tracking-normal">ExamPulse.</span>
          <span>brief</span>
        </Link>
      </div>
    </nav>
  );
}
