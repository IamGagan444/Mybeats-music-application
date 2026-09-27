import { AudioLines, Heart, Home, LogIn, LogOut, Search } from "lucide-react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { NavLink } from "@/components/layout/NavLink";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { getCurrentUser } from "@/lib/current-user";
import { getRecentGenres } from "@/lib/genres";

const ICON_CLASS = "size-4.5 shrink-0";

const NAV = [
  { href: "/", label: "Home", icon: <Home className={ICON_CLASS} /> },
  { href: "/search", label: "Search", icon: <Search className={ICON_CLASS} /> },
  { href: "/library", label: "Your Library", icon: <Heart className={ICON_CLASS} /> },
];

export async function Sidebar() {
  const [user, genres] = await Promise.all([getCurrentUser(), getRecentGenres()]);

  return (
    <aside className="hidden w-64 shrink-0 flex-col rounded-3xl bg-surface p-4 lg:flex">
      <Link
        href="/"
        className="mb-8 flex items-center gap-2 px-3 py-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <AudioLines className="size-6 text-brand" />
        <span className="text-lg font-bold tracking-tight">MyBeats</span>
      </Link>

      <nav className="flex flex-col gap-1" aria-label="Main">
        {NAV.map(({ href, label, icon }) => (
          <NavLink key={href} href={href} label={label}>
            {icon}
          </NavLink>
        ))}
      </nav>

      {genres.length > 0 ? (
        <div className="mt-8 flex min-h-0 flex-col">
          <p className="px-4 pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Genres
          </p>
          <ul className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
            {genres.map((genre) => (
              <li key={genre.name}>
                <Link
                  href={`/?genre=${encodeURIComponent(genre.name)}`}
                  className="flex items-center gap-3 rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-raised/60 hover:text-foreground"
                >
                  <span className="size-7 shrink-0 overflow-hidden rounded-md">
                    <TrackArtwork src={genre.artwork} iconClassName="size-3" priority />
                  </span>
                  <span className="truncate">{genre.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-auto pt-4">
        {user ? (
          <form action={signOutEverywhere}>
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised/60 hover:text-foreground"
            >
              <LogOut className="size-4.5" />
              Logout
            </button>
          </form>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-raised/60 hover:text-foreground"
          >
            <LogIn className="size-4.5" />
            Log in
          </Link>
        )}
      </div>
    </aside>
  );
}
