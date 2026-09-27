"use client";

import { MusicPlayer } from "@/components/music/MusicPlayer";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player";

export function GlobalPlayer() {
  const currentTrack = usePlayerStore(selectCurrentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const error = usePlayerStore((s) => s.error);
  const queueLength = usePlayerStore((s) => s.queue.length);
  const currentIndex = usePlayerStore((s) => s.currentIndex);

  return (
    <MusicPlayer
      currentTrack={currentTrack}
      isPlaying={isPlaying}
      isLoading={isLoading}
      currentTime={currentTime}
      duration={duration}
      volume={volume}
      isMuted={isMuted}
      error={error}
      hasPrevious={currentIndex > 0}
      hasNext={currentIndex < queueLength - 1}
      onTogglePlay={usePlayerStore.getState().togglePlay}
      onPrevious={usePlayerStore.getState().previous}
      onNext={usePlayerStore.getState().next}
      onSeek={usePlayerStore.getState().seek}
      onVolumeChange={usePlayerStore.getState().setVolume}
      onToggleMute={usePlayerStore.getState().toggleMute}
    />
  );
}
