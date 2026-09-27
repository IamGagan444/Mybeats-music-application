import { Heart, History, ListMusic, LogIn } from "lucide-react";
import Link from "next/link";
import { Topbar } from "@/components/layout/Topbar";
import { TrackList } from "@/components/music/TrackList";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAccessToken } from "@/lib/session";
import { getCurrentUser, getMyBeatsUser } from "@/lib/current-user";
import { listFavorites } from "@/lib/favorites";
import { getHistoryTracks, getLibraryTracks } from "@/lib/audius-user";
import type { MusicTrack } from "@/types/music";

const ALL_TABS = [
  { key: "favorites", label: "Favorites", icon: Heart, audiusOnly: false },
  { key: "library", label: "Library", icon: ListMusic, audiusOnly: true },
  { key: "history", label: "History", icon: History, audiusOnly: true },
] as const;

type TabKey = (typeof ALL_TABS)[number]["key"];

const EMPTY_MESSAGES: Record<TabKey, string> = {
  favorites: "Nothing favorited yet — tap the heart on any track.",
  library: "Your library is empty.",
  history: "Nothing played yet.",
};

function SignedOut() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
      <ListMusic className="size-10 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">Log in to see your library</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          Save the tracks you love and pick up where you left off.
        </p>
      </div>
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        className="h-11 gap-2 rounded-full bg-brand px-6 text-xs font-bold tracking-wide text-brand-foreground uppercase transition-transform hover:scale-105 hover:bg-brand"
      >
        <LogIn className="size-4" />
        Log in
      </Button>
    </div>
  );
}

export default async function LibraryPage({
  searchParams,
}: PageProps<"/library">) {
  const [user, myBeatsUser] = await Promise.all([
    getCurrentUser(),
    getMyBeatsUser(),
  ]);

  if (!user) {
    return (
      <>
        <Topbar />
        <div>
          <div className="flex flex-col gap-6">
            <h1 className="text-3xl font-bold tracking-tight">Your library</h1>
            <SignedOut />
          </div>
        </div>
      </>
    );
  }

  const hasAudius = user.source === "audius";
  const tabs = ALL_TABS.filter((t) => hasAudius || !t.audiusOnly);

  const { tab } = await searchParams;
  const activeTab: TabKey = tabs.find((t) => t.key === tab)?.key ?? "favorites";

  let tracks: MusicTrack[] = [];
  let error: string | null = null;

  try {
    if (activeTab === "favorites") {
      tracks = myBeatsUser ? await listFavorites(myBeatsUser.id) : [];
    } else {
      const accessToken = await getAccessToken();
      if (accessToken && user.audiusUserId) {
        const opts = { userId: user.audiusUserId, accessToken, limit: 50 };
        tracks =
          activeTab === "library"
            ? await getLibraryTracks(opts)
            : await getHistoryTracks(opts);
      }
    }
  } catch (err) {
    console.error(`Library ${activeTab} failed:`, err);
    error = "Couldn't load this list right now.";
  }

  return (
    <>
      <Topbar />
      <div>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-bold tracking-tight">Your library</h1>

          <nav className="flex gap-2" aria-label="Library sections">
            {tabs.map(({ key, label, icon: Icon }) => (
              <Link
                key={key}
                href={`/library?tab=${key}`}
                aria-current={key === activeTab ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold tracking-wide uppercase transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                  key === activeTab
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            ))}
          </nav>

          <TrackList
            tracks={tracks}
            error={error}
            emptyMessage={EMPTY_MESSAGES[activeTab]}
          />

          {!hasAudius ? (
            <p className="text-xs text-muted-foreground">
              Your saved library and listening history live on Audius.{" "}
              <a
                href="/api/audius/auth/login"
                className="font-bold text-brand underline-offset-4 hover:underline"
              >
                Log in with Audius
              </a>{" "}
              to see them here.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
