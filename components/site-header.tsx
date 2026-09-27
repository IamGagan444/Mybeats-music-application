import { AudioLines, Library } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { AuthControls } from "@/components/auth/AuthControls";
import { HeaderSearch } from "@/components/music/HeaderSearch";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function SiteHeader({ initialQuery }: { initialQuery?: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-3 px-4 sm:gap-4 sm:px-6">
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

        <Button
          variant="ghost"
          size="icon"
          aria-label="Your library"
          render={<Link href="/library" />}
          nativeButton={false}
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <Library className="size-4" />
        </Button>

        <ThemeToggle />

        <Suspense fallback={<div className="size-9 shrink-0" />}>
          <AuthControls />
        </Suspense>
      </div>
    </header>
  );
}
