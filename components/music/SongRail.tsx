import { AlertCircle, Music2 } from "lucide-react";
import Link from "next/link";
import { RailScroller } from "@/components/music/RailScroller";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { TrackPlayButton } from "@/components/music/TrackPlayButton";
import { Skeleton } from "@/components/ui/skeleton";
import type { MusicTrack } from "@/types/music";

interface SongRailProps {
  title: string;
  tracks: MusicTrack[];
  error?: string | null;
  emptyMessage?: string;
}

/**
 * Horizontal rail of square covers. Scrolling is native (snap + overflow) so
 * it works without JS; the arrows are a small progressive enhancement.
 */
export function SongRail({
  title,
  tracks,
  error,
  emptyMessage = "Nothing here yet.",
}: SongRailProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {tracks.length > 0 ? <RailScroller targetId={`rail-${title}`} /> : null}
      </div>

      {error ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-muted-foreground">
          <AlertCircle className="size-7" />
          <p className="text-sm">{error}</p>
        </div>
      ) : tracks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-14 text-muted-foreground">
          <Music2 className="size-7" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div
          id={`rail-${title}`}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar"
        >
          {tracks.map((track, index) => (
            <article
              key={track.id}
              style={{ "--enter-delay": `${Math.min(index, 8) * 45}ms` } as React.CSSProperties}
              className="animate-enter group relative w-38 shrink-0 snap-start sm:w-41"
            >
              <div className="relative overflow-hidden rounded-2xl">
                <div className="aspect-square">
                  {/* 150px source for a ~165px slot, and the first screenful
                      loads eagerly so the rail paints without a lazy round-trip. */}
                  <TrackArtwork
                    src={track.artworkSmall ?? track.artwork}
                    priority={index < 6}
                    className="transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>
                <span className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 via-black/35 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-white">
                      {track.title}
                    </p>
                    {track.artistHandle ? (
                      <Link
                        href={`/artist/${encodeURIComponent(track.artistHandle)}`}
                        className="block truncate text-[11px] text-white/70 transition-colors hover:text-white hover:underline"
                      >
                        {track.artist}
                      </Link>
                    ) : (
                      <p className="truncate text-[11px] text-white/70">
                        {track.artist}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 translate-y-1 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100">
                    <TrackPlayButton
                      track={track}
                      queue={tracks}
                      className="size-9"
                    />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function SongRailSkeleton({ title }: { title: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="w-38 shrink-0 sm:w-41">
            <Skeleton className="aspect-square w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </section>
  );
}
