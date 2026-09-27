"use client";

import {
  Loader2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface PlayerControlsProps {
  isPlaying: boolean;
  isLoading?: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
  disabled?: boolean;
}

export function PlayerControls({
  isPlaying,
  isLoading,
  onTogglePlay,
  onPrevious,
  onNext,
  hasPrevious = true,
  hasNext = true,
  disabled,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Previous track"
        disabled={disabled || !hasPrevious}
        onClick={onPrevious}
        className="rounded-full text-muted-foreground hover:text-foreground"
      >
        <SkipBack className="size-4 fill-current" />
      </Button>

      <Button
        type="button"
        size="icon"
        aria-label={isPlaying ? "Pause" : "Play"}
        aria-pressed={isPlaying}
        disabled={disabled}
        onClick={onTogglePlay}
        className="size-10 rounded-full bg-brand text-brand-foreground shadow-lg transition-transform hover:scale-105 hover:bg-brand active:scale-95"
      >
        {isLoading ? (
          <Loader2 className="size-5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="size-5 fill-current" />
        ) : (
          <Play className="size-5 translate-x-px fill-current" />
        )}
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Next track"
        disabled={disabled || !hasNext}
        onClick={onNext}
        className="rounded-full text-muted-foreground hover:text-foreground"
      >
        <SkipForward className="size-4 fill-current" />
      </Button>
    </div>
  );
}

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
}: VolumeControlProps) {
  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label={isMuted ? "Unmute" : "Mute"}
        aria-pressed={isMuted}
        onClick={onToggleMute}
        className="rounded-full text-muted-foreground hover:text-foreground"
      >
        <VolumeIcon className="size-4" />
      </Button>
      {/* The Slider primitive forces w-full when horizontal, so the width
          has to be set by this wrapper rather than on the slider itself. */}
      <div className="w-16 shrink-0 sm:w-24">
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          aria-label="Volume"
          onValueChange={(value) =>
            onVolumeChange(Array.isArray(value) ? value[0] : value)
          }
          className="cursor-pointer **:data-[slot=slider-range]:bg-foreground hover:**:data-[slot=slider-range]:bg-brand"
        />
      </div>
    </div>
  );
}
