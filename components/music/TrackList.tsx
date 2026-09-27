import { AlertCircle, Music2 } from "lucide-react";
import { TrackCard, TrackCardSkeleton } from "@/components/music/TrackCard";
import type { MusicTrack } from "@/types/music";

interface TrackListProps {
  tracks: MusicTrack[];
  isLoading?: boolean;
  error?: string | null;
  skeletonCount?: number;
  emptyMessage?: string;
}

const GRID_CLASSES =
  "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";

function StateMessage({
  icon,
  message,
}: {
  icon: React.ReactNode;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function TrackList({
  tracks,
  isLoading,
  error,
  skeletonCount = 12,
  emptyMessage = "No tracks found.",
}: TrackListProps) {
  if (error) {
    return <StateMessage icon={<AlertCircle className="size-8" />} message={error} />;
  }

  if (isLoading) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <TrackCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return <StateMessage icon={<Music2 className="size-8" />} message={emptyMessage} />;
  }

  return (
    <div className={GRID_CLASSES}>
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} queue={tracks} />
      ))}
    </div>
  );
}
