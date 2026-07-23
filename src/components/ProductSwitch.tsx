import { Link } from "@tanstack/react-router";

type ProductSwitchProps = {
  /** Which product is current — link goes to the other. */
  current: "later" | "exam";
  className?: string;
};

/**
 * Desktop hop to the other product. Kept beside the brand (not in the meta strip)
 * so it reads as a destination, not issue chrome.
 */
export function ProductSwitch({ current, className = "" }: ProductSwitchProps) {
  if (current === "later") {
    return (
      <Link
        to="/exam"
        className={
          "group hidden shrink-0 flex-col items-end md:flex " + className
        }
      >
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia transition group-hover:text-ink-soft">
          Switch to
        </span>
        <span className="font-display text-xl tracking-tight text-ink transition group-hover:text-accent sm:text-2xl">
          ExamPulse<span className="text-accent">.</span>
        </span>
      </Link>
    );
  }

  return (
    <Link
      to="/"
      className={"group hidden shrink-0 flex-col items-end md:flex " + className}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-marginalia transition group-hover:text-ink-soft">
        Switch to
      </span>
      <span className="font-display text-xl tracking-tight text-ink transition group-hover:text-accent sm:text-2xl">
        Later<span className="text-accent">.</span>
      </span>
    </Link>
  );
}
