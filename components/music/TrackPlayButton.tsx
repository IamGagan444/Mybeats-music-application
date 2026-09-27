"use client";

import { Loader2, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store";
import { playerActions } from "@/store/playerSlice";
import { selectCurrentTrack } from "@/store/selectors";
import type { MusicTrack } from "@/types/music";

interface TrackPlayButtonProps {
  track: MusicTrack;
  queue?: MusicTrack[];
  className?: string;
}

export function TrackPlayButton({ track, queue, className }: TrackPlayButtonProps) {
  const dispatch = useAppDispatch();
  const isCurrent = useAppSelector(
    (s) => selectCurrentTrack(s)?.id === track.id
  );
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const isLoading = useAppSelector((s) => s.player.isLoading);

  const isActive = isCurrent && isPlaying;

  return (
    <Button
      type="button"
      size="icon"
      aria-label={isActive ? `Pause ${track.title}` : `Play ${track.title}`}
      aria-pressed={isActive}
      onClick={() => dispatch(playerActions.playTrack({ track, queue }))}
      className={cn(
        "size-10 rounded-full bg-brand text-brand-foreground shadow-lg transition-all duration-200 hover:scale-105 hover:bg-brand active:scale-95",
        className
      )}
    >
      {isCurrent && isLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : isActive ? (
        <Pause className="size-4 fill-current" />
      ) : (
        <Play className="size-4 translate-x-px fill-current" />
      )}
    </Button>
  );
}
