import { BadgeCheck, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import { Topbar } from "@/components/layout/Topbar";
import { ArtworkPreconnect } from "@/components/music/ArtworkPreconnect";
import { PlayAllButton } from "@/components/music/PlayAllButton";
import { SongRail } from "@/components/music/SongRail";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { getArtistByHandle, getArtistTracks } from "@/lib/artists";

function compact(n?: number) {
  if (!n) return "0";
  return Intl.NumberFormat("en", { notation: "compact" }).format(n);
}

export async function generateMetadata({ params }: PageProps<"/artist/[handle]">) {
  const { handle } = await params;
  const artist = await getArtistByHandle(handle);
  return { title: artist ? `${artist.name} — MyBeats` : "Artist — MyBeats" };
}

export default async function ArtistPage({ params }: PageProps<"/artist/[handle]">) {
  const { handle } = await params;

  const [artist, tracks] = await Promise.all([
    getArtistByHandle(handle),
    getArtistTracks(handle),
  ]);

  if (!artist) notFound();

  return (
    <>
      <Topbar />
      <ArtworkPreconnect tracks={tracks} />

      <div className="flex flex-col gap-8">
        <header className="relative overflow-hidden rounded-3xl">
          {artist.coverPhoto ? (
            <div className="absolute inset-0">
              <TrackArtwork src={artist.coverPhoto} className="blur-[2px]" />
              <span className="absolute inset-0 bg-linear-to-t from-surface via-surface/85 to-surface/50" />
            </div>
          ) : (
            <span className="absolute inset-0 bg-linear-to-br from-brand/20 to-surface-raised" />
          )}

          <div className="relative flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:items-end sm:gap-6 sm:p-8 sm:text-left">
            <span className="size-28 shrink-0 overflow-hidden rounded-full shadow-2xl ring-4 ring-surface sm:size-36">
              <TrackArtwork src={artist.avatar} iconClassName="size-8" priority />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                Artist
              </p>
              <h1 className="flex items-center justify-center gap-2 text-3xl font-bold tracking-tight sm:justify-start sm:text-4xl">
                <span className="truncate">{artist.name}</span>
                {artist.isVerified ? (
                  <BadgeCheck className="size-6 shrink-0 text-brand" />
                ) : null}
              </h1>

              <p className="text-sm text-muted-foreground">
                @{artist.handle} · {compact(artist.followerCount)} followers ·{" "}
                {compact(artist.trackCount)} tracks
              </p>

              {artist.location ? (
                <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground sm:justify-start">
                  <MapPin className="size-3.5" />
                  {artist.location}
                </p>
              ) : null}

              {artist.bio ? (
                <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">
                  {artist.bio}
                </p>
              ) : null}
            </div>

            <div className="shrink-0">
              <PlayAllButton tracks={tracks} />
            </div>
          </div>
        </header>

        <SongRail
          title="Tracks"
          tracks={tracks}
          emptyMessage={`${artist.name} hasn't uploaded any tracks yet.`}
        />
      </div>
    </>
  );
}
