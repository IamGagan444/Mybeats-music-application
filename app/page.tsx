import { Suspense } from "react";
import { audiusFetch, toMusicTrack, type AudiusTrackRaw } from "@/lib/audius";
import { SiteHeader } from "@/components/site-header";
import { TrackList } from "@/components/music/TrackList";
import { RecentlyPlayed } from "@/components/music/RecentlyPlayed";
import { PlayAllButton } from "@/components/music/PlayAllButton";
import type { MusicTrack } from "@/types/music";

// Trending changes constantly; re-fetch on the server every 5 minutes.
export const revalidate = 300;

async function getTrendingTracks(): Promise<MusicTrack[]> {
  const { data } = await audiusFetch<{ data: AudiusTrackRaw[] }>(
    "/v1/tracks/trending",
    { limit: "24" }
  );
  return data.map(toMusicTrack);
}

function SectionSkeleton() {
  return <TrackList tracks={[]} isLoading skeletonCount={12} />;
}

async function TrendingSection() {
  let tracks: MusicTrack[] = [];
  let error: string | null = null;

  try {
    tracks = await getTrendingTracks();
  } catch {
    error = "Couldn't load trending tracks right now.";
  }

  return (
    <>
      <section className="relative overflow-hidden rounded-xl border border-border/60 bg-linear-to-br from-brand/20 via-card to-card p-6 sm:p-10">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-[0.14em] text-brand uppercase">
              Trending on Audius
            </span>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Today&apos;s biggest tracks
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Free, independent music streamed straight from the Audius network —
              no account required.
            </p>
          </div>
          <div>
            <PlayAllButton tracks={tracks} />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Trending now</h2>
        <TrackList
          tracks={tracks}
          error={error}
          emptyMessage="No trending tracks available."
        />
      </section>
    </>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-6 pb-40 sm:px-6">
        <div className="flex flex-col gap-10">
          <Suspense fallback={<SectionSkeleton />}>
            <TrendingSection />
          </Suspense>
          <RecentlyPlayed />
        </div>
      </main>
    </>
  );
}
