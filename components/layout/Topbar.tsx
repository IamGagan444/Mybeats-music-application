import { Heart, LogIn } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { HeaderSearch } from "@/components/music/HeaderSearch";
import { ThemeToggle } from "@/components/theme-toggle";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/current-user";

const ICON_BUTTON =
  "size-11 rounded-full bg-surface-raised text-muted-foreground transition-colors hover:bg-surface-raised hover:text-brand";

export async function Topbar({
  showSearch = true,
}: {
  /**
   * The Search page renders its own, larger search field inline with its
   * results (see SearchResults) — that's the canonical input there, live
   * and navigation-free. Rendering HeaderSearch on top of it duplicated the
   * control and, since HeaderSearch submits by navigating, could desync
   * from the results pane below. Every other route still gets HeaderSearch
   * as the quick-jump-to-search field.
   */
  showSearch?: boolean;
}) {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center gap-3 pb-6 sm:gap-4">
      {/* The sidebar carries the logo from lg up; below that this is the only mark. */}
      <Logo className="shrink-0 lg:hidden" showWordmark={false} />

      <div className="min-w-0 flex-1">{showSearch ? <HeaderSearch /> : null}</div>

      {user ? (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/library"
            className="flex items-center gap-3 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span className="size-11 shrink-0 overflow-hidden rounded-full ring-2 ring-brand/30 transition-[box-shadow] hover:ring-brand/60">
              <TrackArtwork src={user.avatar} iconClassName="size-4" />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="max-w-36 truncate text-sm font-semibold">
                {user.name}
              </span>
              <span className="w-fit rounded-md bg-brand/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand">
                {user.source === "audius" ? "Connected" : "Member"}
              </span>
            </span>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            aria-label="Your library"
            render={<Link href="/library" />}
            nativeButton={false}
            className={`hidden sm:inline-flex ${ICON_BUTTON}`}
          >
            <Heart className="size-4.5" />
          </Button>
          <ThemeToggle className={ICON_BUTTON} />
        </div>
      ) : (
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeToggle className={ICON_BUTTON} />
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            className="h-11 gap-2 rounded-full bg-brand px-5 text-xs font-bold tracking-wide text-brand-foreground uppercase shadow-brand transition-transform hover:scale-105 hover:bg-brand"
          >
            <LogIn className="size-4" />
            <span className="hidden sm:inline">Log in</span>
          </Button>
        </div>
      )}
    </header>
  );
}
