"use client";

import { AlertCircle } from "lucide-react";
import { FavoriteButton } from "@/components/music/FavoriteButton";
import { PlayerControls, VolumeControl } from "@/components/music/PlayerControls";
import { ProgressBar } from "@/components/music/ProgressBar";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import type { MusicTrack } from "@/types/music";

interface MusicPlayerProps {
  currentTrack: MusicTrack | null;
  isPlaying: boolean;
  isLoading?: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  error?: string | null;
  hasPrevious?: boolean;
  hasNext?: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function MusicPlayer({
  currentTrack,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  volume,
  isMuted,
  error,
  hasPrevious,
  hasNext,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
}: MusicPlayerProps) {
  if (!currentTrack) return null;

  return (
    <div
      role="region"
      aria-label="Music player"
      className="shrink-0 rounded-3xl bg-surface px-4 py-3 sm:px-6"
    >
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Track identity */}
        <div className="flex min-w-0 items-center gap-3 sm:w-[26%]">
          <div className="size-12 shrink-0 overflow-hidden rounded-xl sm:size-14">
            <TrackArtwork src={currentTrack.artwork} iconClassName="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{currentTrack.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {currentTrack.artist}
            </p>
            {error ? (
              <p className="mt-0.5 flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="size-3 shrink-0" />
                <span className="truncate">{error}</span>
              </p>
            ) : null}
          </div>
        </div>

        {/* Transport + progress */}
        <div className="flex flex-1 flex-col items-center gap-1.5">
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onTogglePlay={onTogglePlay}
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
          <div className="hidden w-full max-w-2xl sm:block">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
          </div>
        </div>

        {/* Secondary actions */}
        <div className="hidden shrink-0 items-center justify-end gap-1 sm:flex sm:w-[26%]">
          <FavoriteButton track={currentTrack} />
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />
        </div>
      </div>

      <div className="pt-1 sm:hidden">
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
      </div>
    </div>
  );
}
