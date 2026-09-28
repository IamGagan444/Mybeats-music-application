import Link from "next/link";
import { cn } from "@/lib/utils";

/** The equalizer mark from the favicon, drawn with currentColor. */
function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 10v3" />
      <path d="M6.5 6v11" />
      <path d="M10 3.5v17" />
      <path d="M14 8v7" />
      <path d="M17.5 5.5v13" />
      <path d="M21 10v3" />
    </svg>
  );
}

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      href="/"
      aria-label="MyBeats home"
      className={cn(
        "flex items-center gap-2 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand/12 text-brand ring-1 ring-brand/25">
        <Mark className="size-5" />
      </span>
      {showWordmark ? (
        <span className="text-lg font-bold tracking-tight">
          My<span className="text-brand">Beats</span>
        </span>
      ) : null}
    </Link>
  );
}
