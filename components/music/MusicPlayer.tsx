"use client";

import { AlertCircle } from "lucide-react";
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
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-card/95 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_-8px_24px_rgba(0,0,0,0.5)]"
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 sm:gap-6 sm:px-6 sm:py-3">
        {/* Track identity */}
        <div className="flex min-w-0 items-center gap-3 sm:w-[30%]">
          <div className="size-12 shrink-0 overflow-hidden rounded-md shadow-md sm:size-14">
            <TrackArtwork src={currentTrack.artwork} iconClassName="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">
              {currentTrack.title}
            </p>
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
        <div className="flex flex-1 flex-col items-center gap-1">
          <PlayerControls
            isPlaying={isPlaying}
            isLoading={isLoading}
            onTogglePlay={onTogglePlay}
            onPrevious={onPrevious}
            onNext={onNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
          <div className="hidden w-full max-w-xl sm:block">
            <ProgressBar
              currentTime={currentTime}
              duration={duration}
              onSeek={onSeek}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="hidden shrink-0 justify-end sm:flex sm:w-[30%]">
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />
        </div>
      </div>

      {/* Mobile progress sits full-width under the controls */}
      <div className="px-3 pb-2 sm:hidden">
        <ProgressBar currentTime={currentTime} duration={duration} onSeek={onSeek} />
      </div>
    </div>
  );
}
