import { AlertCircle } from "lucide-react";
import { Suspense } from "react";
import { audiusFetch, toMusicTrack, type AudiusTrackRaw } from "@/lib/audius";
import { SiteHeader } from "@/components/site-header";
import { TrackList } from "@/components/music/TrackList";
import { RecentlyPlayed } from "@/components/music/RecentlyPlayed";
import { PlayAllButton } from "@/components/music/PlayAllButton";
import type { MusicTrack } from "@/types/music";

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

const AUTH_ERRORS: Record<string, string> = {
  cancelled: "Login cancelled.",
  expired: "That login attempt expired. Please try again.",
  state_mismatch: "Login failed a security check. Please try again.",
  failed: "Couldn't complete login with Audius.",
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const { auth_error: authError } = await searchParams;
  const authMessage =
    typeof authError === "string" ? AUTH_ERRORS[authError] : undefined;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-6 pb-40 sm:px-6">
        <div className="flex flex-col gap-10">
          {authMessage ? (
            <p
              role="status"
              className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              <AlertCircle className="size-4 shrink-0" />
              {authMessage}
            </p>
          ) : null}
          <Suspense fallback={<SectionSkeleton />}>
            <TrendingSection />
          </Suspense>
          <RecentlyPlayed />
        </div>
      </main>
    </>
  );
}
