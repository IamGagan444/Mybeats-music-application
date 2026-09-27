import { AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ArtworkPreconnect } from "@/components/music/ArtworkPreconnect";
import { CategoryChips } from "@/components/music/CategoryChips";
import { HeroCarousel } from "@/components/music/HeroCarousel";
import { RecentlyPlayed } from "@/components/music/RecentlyPlayed";
import { SongRail, SongRailSkeleton } from "@/components/music/SongRail";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyBeatsUser } from "@/lib/current-user";
import { getTrendingTracks, isGenre } from "@/lib/genres";
import { getPreferences, listLanguages } from "@/lib/preferences";
import { buildHomeFeed } from "@/lib/recommendations/home";
import { buildSignals } from "@/lib/recommendations/signals";
import type { MusicTrack } from "@/types/music";

const AUTH_ERRORS: Record<string, string> = {
  cancelled: "Login cancelled.",
  expired: "That login attempt expired. Please try again.",
  state_mismatch: "Login failed a security check. Please try again.",
  failed: "Couldn't complete login with Audius.",
};

/** A chosen genre is a browse action, so it bypasses the personalized feed. */
async function GenreBrowse({ genre }: { genre: string }) {
  let tracks: MusicTrack[] = [];
  let error: string | null = null;

  try {
    tracks = await getTrendingTracks(genre);
  } catch {
    error = "Couldn't load tracks right now.";
  }

  return (
    <>
      <ArtworkPreconnect tracks={tracks} />
      <HeroCarousel tracks={tracks} />
      <Categories active={genre} />
      <SongRail
        title={`Popular in ${genre}`}
        tracks={tracks}
        error={error}
        emptyMessage={`Nothing trending in ${genre} right now.`}
      />
    </>
  );
}

function Categories({ active }: { active?: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">Select Categories</h2>
      <CategoryChips active={active} />
    </section>
  );
}

async function PersonalizedHome() {
  const user = await getMyBeatsUser();
  const preferences = user ? await getPreferences(user.id) : null;

  const [languages, signals] = await Promise.all([
    listLanguages().catch(() => []),
    buildSignals(user?.id ?? null, preferences),
  ]);

  const feed = await buildHomeFeed({
    preferences,
    languageNames: new Map(languages.map((l) => [l.code, l.name])),
    signals,
  });

  const heroTracks = feed.forYou.length > 0 ? feed.forYou : feed.trending;

  return (
    <>
      <ArtworkPreconnect tracks={heroTracks} />
      <HeroCarousel tracks={heroTracks} />
      <Categories />

      {feed.forYou.length > 0 ? (
        <SongRail title="Made for you" tracks={feed.forYou} />
      ) : null}

      <SongRail
        title="Trending now"
        tracks={feed.trending}
        emptyMessage="No tracks available."
      />

      {feed.languageSections.map((section) => (
        <SongRail
          key={section.key}
          title={`${section.title} picks`}
          tracks={section.tracks}
        />
      ))}

      {feed.genreSections.map((section) => (
        <SongRail
          key={section.key}
          title={`Trending ${section.title}`}
          tracks={section.tracks}
        />
      ))}

      {feed.moodSections.map((section) => (
        <SongRail
          key={section.key}
          title={`${section.title} mood`}
          tracks={section.tracks}
        />
      ))}

      {feed.popularThisWeek.length > 0 ? (
        <SongRail title="Popular this week" tracks={feed.popularThisWeek} />
      ) : null}
    </>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <Skeleton className="h-70 w-full rounded-3xl sm:h-80" />
      <SongRailSkeleton title="Popular songs" />
    </div>
  );
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const { genre: rawGenre, auth_error: authError } = await searchParams;
  const genre = typeof rawGenre === "string" && isGenre(rawGenre) ? rawGenre : undefined;
  const authMessage =
    typeof authError === "string" ? AUTH_ERRORS[authError] : undefined;

  return (
    <>
      <Topbar />

      <div className="flex flex-col gap-8">
        {authMessage ? (
          <p
            role="status"
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            <AlertCircle className="size-4 shrink-0" />
            {authMessage}
          </p>
        ) : null}

        <Suspense key={genre ?? "all"} fallback={<HomeSkeleton />}>
          {genre ? <GenreBrowse genre={genre} /> : <PersonalizedHome />}
        </Suspense>

        <RecentlyPlayed />
      </div>
    </>
  );
}
