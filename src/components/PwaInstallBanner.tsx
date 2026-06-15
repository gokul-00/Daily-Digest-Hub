import { useState } from "react";

import { usePwaInstall } from "@/hooks/use-pwa-install";

export function PwaInstallBanner() {
  const { visible, canInstall, iosHint, install, dismiss } = usePwaInstall();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (!visible) return null;

  async function handleInstall() {
    if (canInstall) {
      await install();
      return;
    }
    if (iosHint) setShowIosSteps(true);
  }

  return (
    <div
      role="region"
      aria-label="Install app"
      className="safe-px pointer-events-none fixed inset-x-0 bottom-0 z-50 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
    >
      <div className="paper-card pointer-events-auto mx-auto flex max-w-3xl flex-col gap-3 rounded-lg p-4 shadow-lg sm:flex-row sm:items-center sm:gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <img
            src="/pwa-192x192.png"
            alt=""
            width={44}
            height={44}
            className="mt-0.5 shrink-0 rounded-md border border-rule"
          />
          <div className="min-w-0">
            <p className="font-display text-base font-medium text-ink">Install Later.</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {showIosSteps
                ? "Tap Share, then “Add to Home Screen”."
                : "Keep your pile on your home screen — works offline too."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              if (showIosSteps) {
                dismiss();
                return;
              }
              void handleInstall();
            }}
            className="touch-target inline-flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:flex-none"
          >
            {canInstall ? "Install" : showIosSteps ? "Got it" : "How to install"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss install banner"
            className="touch-target inline-flex items-center justify-center rounded-md px-3 py-2 font-mono text-xs uppercase tracking-widest text-marginalia transition-colors hover:text-ink"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
