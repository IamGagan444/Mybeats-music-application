"use client";

import { Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player";
import type { MusicTrack } from "@/types/music";

export function PlayAllButton({ tracks }: { tracks: MusicTrack[] }) {
  const currentId = usePlayerStore((s) => selectCurrentTrack(s)?.id);
  const isPlaying = usePlayerStore((s) => s.isPlaying);

  const isPlayingThisList = isPlaying && tracks.some((t) => t.id === currentId);

  const handleClick = () => {
    const { playTrack, togglePlay } = usePlayerStore.getState();
    // Already inside this list — just toggle instead of restarting it.
    if (currentId && tracks.some((t) => t.id === currentId)) {
      togglePlay();
      return;
    }
    if (tracks[0]) playTrack(tracks[0], tracks);
  };

  return (
    <Button
      type="button"
      size="lg"
      onClick={handleClick}
      disabled={tracks.length === 0}
      aria-label={isPlayingThisList ? "Pause trending" : "Play trending"}
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
