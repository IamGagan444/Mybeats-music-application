"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { playerActions } from "@/store/playerSlice";
import { selectCurrentTrack } from "@/store/selectors";
import type { MusicTrack } from "@/types/music";

export function PlayAllButton({ tracks }: { tracks: MusicTrack[] }) {
  const dispatch = useAppDispatch();
  const currentId = useAppSelector((s) => selectCurrentTrack(s)?.id);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);

  const isInThisList = Boolean(currentId && tracks.some((t) => t.id === currentId));
  const isPlayingThisList = isPlaying && isInThisList;

  const onClick = () => {
    if (isInThisList) {
      dispatch(playerActions.togglePlay());
      return;
    }
    if (tracks[0]) {
      dispatch(playerActions.playTrack({ track: tracks[0], queue: tracks }));
    }
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={onClick}
      disabled={tracks.length === 0}
      aria-label={isPlayingThisList ? "Pause" : "Play"}
      className="h-12 gap-2 rounded-full bg-brand px-7 text-sm font-bold tracking-wide text-brand-foreground uppercase shadow-lg transition-transform hover:scale-105 hover:bg-brand active:scale-95"
    >
      {isPlayingThisList ? (
        <Pause className="size-5 fill-current" />
      ) : (
        <Play className="size-5 fill-current" />
      )}
      {isPlayingThisList ? "Pause" : "Play"}
    </Button>
  );
}
