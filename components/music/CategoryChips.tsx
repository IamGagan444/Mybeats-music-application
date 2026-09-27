import Link from "next/link";
import { cn } from "@/lib/utils";
import { GENRES } from "@/lib/genres";

/**
 * Plain links, not client state — each chip is a real server-rendered filter
 * against the Audius trending endpoint, so it costs zero client JS.
 */
export function CategoryChips({ active }: { active?: string }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
      {[{ label: "All", value: undefined }, ...GENRES.map((g) => ({ label: g, value: g }))].map(
        ({ label, value }) => {
          const isActive = value === active;
          return (
            <Link
              key={label}
              href={value ? `/?genre=${encodeURIComponent(value)}` : "/"}
              scroll={false}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "shrink-0 rounded-full px-5 py-2 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                isActive
                  ? "bg-brand font-semibold text-brand-foreground"
                  : "bg-surface-raised font-medium text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          );
        }
      )}
    </div>
  );
}
