"use client";

import { MusicPlayer } from "@/components/music/MusicPlayer";
import { useAppDispatch, useAppSelector } from "@/store";
import { playerActions } from "@/store/playerSlice";
import { selectCurrentTrack } from "@/store/selectors";

export function GlobalPlayer() {
  const dispatch = useAppDispatch();
  const player = useAppSelector((s) => s.player);
  const currentTrack = useAppSelector(selectCurrentTrack);

  return (
    <MusicPlayer
      currentTrack={currentTrack}
      isPlaying={player.isPlaying}
      isLoading={player.isLoading}
      currentTime={player.currentTime}
      duration={player.duration}
      volume={player.volume}
      isMuted={player.isMuted}
      error={player.error}
      hasPrevious={player.currentIndex > 0}
      hasNext={player.currentIndex < player.queue.length - 1}
      onTogglePlay={() => dispatch(playerActions.togglePlay())}
      onPrevious={() => dispatch(playerActions.previous())}
      onNext={() => dispatch(playerActions.next())}
      onSeek={(t) => dispatch(playerActions.seek(t))}
      onVolumeChange={(v) => dispatch(playerActions.setVolume(v))}
      onToggleMute={() => dispatch(playerActions.toggleMute())}
    />
  );
}
