import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/utils";
import type { MusicTrack } from "@/types/music";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { TrackPlayButton } from "@/components/music/TrackPlayButton";

interface TrackCardProps {
  track: MusicTrack;
  /** Passed to the player so next/previous walk this list. */
  queue?: MusicTrack[];
}

export function TrackCard({ track, queue }: TrackCardProps) {
  return (
    <div className="group relative flex flex-col gap-3 rounded-lg bg-card p-3 transition-colors duration-200 hover:bg-muted focus-within:bg-muted">
      <div className="relative">
        <div className="overflow-hidden rounded-md shadow-md">
          <AspectRatio ratio={1}>
            <TrackArtwork src={track.artwork} />
          </AspectRatio>
        </div>

        {/* Hover-rise on pointer devices; always visible on touch so the
            control is never unreachable. */}
        <div className="absolute right-2 bottom-2 transition-all duration-200 ease-out pointer-fine:translate-y-2 pointer-fine:opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <TrackPlayButton track={track} queue={queue} />
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">{track.title}</p>
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs text-muted-foreground">{track.artist}</p>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
            {formatDuration(track.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TrackCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-card p-3">
      <AspectRatio ratio={1}>
        <Skeleton className="size-full rounded-md" />
      </AspectRatio>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}
