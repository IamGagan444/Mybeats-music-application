import { AudioLines } from "lucide-react";
import Link from "next/link";
import { HeaderSearch } from "@/components/music/HeaderSearch";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteHeader({ initialQuery }: { initialQuery?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="MyBeats home"
        >
          <AudioLines className="size-6 text-brand" />
          <span className="hidden text-lg font-bold tracking-tight sm:inline">
            MyBeats
          </span>
        </Link>

        <div className="flex flex-1 justify-center">
          <HeaderSearch initialQuery={initialQuery} />
        </div>

        <ThemeToggle />
      </div>
    </header>
  );
}
