import { usePwaUpdate } from "@/hooks/use-pwa-update";

export function PwaUpdateBanner() {
  const { visible, update, dismiss } = usePwaUpdate();

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="App update"
      className="safe-px pointer-events-none fixed inset-x-0 bottom-0 z-[60] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="paper-card pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-lg border border-accent/30 p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-medium text-ink">Update available</p>
          <p className="mt-0.5 text-sm text-ink-soft">
            A new version of Later. is ready — refresh to get the latest features.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={update}
            className="touch-target inline-flex flex-1 items-center justify-center rounded-md bg-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.16em] text-accent-foreground transition hover:opacity-90 sm:flex-none"
          >
            Update now
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss update banner"
            className="touch-target inline-flex items-center justify-center rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest text-marginalia transition-colors hover:text-ink"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
