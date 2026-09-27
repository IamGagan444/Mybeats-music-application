import { AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { Topbar } from "@/components/layout/Topbar";
import { ArtworkPreconnect } from "@/components/music/ArtworkPreconnect";
import { CategoryChips } from "@/components/music/CategoryChips";
import { HeroCarousel } from "@/components/music/HeroCarousel";
import { RecentlyPlayed } from "@/components/music/RecentlyPlayed";
import { SongRail, SongRailSkeleton } from "@/components/music/SongRail";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrendingTracks, isGenre } from "@/lib/genres";
import type { MusicTrack } from "@/types/music";

const AUTH_ERRORS: Record<string, string> = {
  cancelled: "Login cancelled.",
  expired: "That login attempt expired. Please try again.",
  state_mismatch: "Login failed a security check. Please try again.",
  failed: "Couldn't complete login with Audius.",
};

async function TrendingSections({ genre }: { genre?: string }) {
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

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Select Categories
        </h2>
        <CategoryChips active={genre} />
      </section>

      <SongRail
        title={genre ? `Popular in ${genre}` : "Popular songs"}
        tracks={tracks}
        error={error}
        emptyMessage={
          genre ? `Nothing trending in ${genre} right now.` : "No tracks available."
        }
      />
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
          <TrendingSections genre={genre} />
        </Suspense>

        <RecentlyPlayed />
      </div>
    </>
  );
}
