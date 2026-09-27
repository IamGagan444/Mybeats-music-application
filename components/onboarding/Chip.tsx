"use client";

import { cn } from "@/lib/utils";

export function Chip({
  label,
  sublabel,
  selected,
  onClick,
}: {
  label: string;
  sublabel?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "cursor-pointer rounded-full px-4 py-2.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "bg-brand font-semibold text-brand-foreground"
          : "bg-surface-raised font-medium text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {sublabel ? (
        <span className={cn("ml-1.5", selected ? "opacity-70" : "opacity-60")}>
          {sublabel}
        </span>
      ) : null}
    </button>
  );
}
