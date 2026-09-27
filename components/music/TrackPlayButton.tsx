"use client";

import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player";
import type { MusicTrack } from "@/types/music";

interface TrackPlayButtonProps {
  track: MusicTrack;
  /** Tracks queued up when this one is played, so next/previous work. */
  queue?: MusicTrack[];
  className?: string;
}

export function TrackPlayButton({ track, queue, className }: TrackPlayButtonProps) {
  const isCurrent = usePlayerStore((s) => selectCurrentTrack(s)?.id === track.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);

  const isActive = isCurrent && isPlaying;
  const showSpinner = isCurrent && isLoading;

  return (
    <Button
      type="button"
      size="icon"
      aria-label={isActive ? `Pause ${track.title}` : `Play ${track.title}`}
      aria-pressed={isActive}
      onClick={() => usePlayerStore.getState().playTrack(track, queue)}
      className={cn(
        "size-10 rounded-full bg-brand text-brand-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-brand active:scale-95",
        className
      )}
    >
      {showSpinner ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isActive ? (
        <Pause className="size-4 fill-current" />
      ) : (
        <Play className="size-4 translate-x-px fill-current" />
      )}
    </Button>
  );
}
