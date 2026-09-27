"use client";

import { useEffect, useRef } from "react";
import { selectCurrentTrack, usePlayerStore } from "@/stores/player";

// Difference (seconds) above which a store/audio mismatch is treated as a
// deliberate seek rather than normal timeupdate drift.
const SEEK_THRESHOLD = 0.75;

/**
 * The app's single <audio> element. Mounted once in the root layout so
 * playback survives navigation between pages.
 */
export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = usePlayerStore(selectCurrentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const volume = usePlayerStore((s) => s.volume);
  const isMuted = usePlayerStore((s) => s.isMuted);
  const storeTime = usePlayerStore((s) => s.currentTime);

  const streamUrl = currentTrack?.streamUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    audio.src = streamUrl;
    audio.load();
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (isPlaying) {
      audio.play().catch((err: unknown) => {
        // Autoplay rejection is expected before any user gesture; a genuine
        // decode/network failure is not.
        if (err instanceof DOMException && err.name === "AbortError") return;
        usePlayerStore.getState().syncError("Playback failed for this track.");
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - storeTime) > SEEK_THRESHOLD) {
      audio.currentTime = storeTime;
    }
  }, [storeTime]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={(e) => usePlayerStore.getState().syncTime(e.currentTarget.currentTime)}
      onDurationChange={(e) =>
        usePlayerStore.getState().syncDuration(e.currentTarget.duration || 0)
      }
      onWaiting={() => usePlayerStore.getState().syncLoading(true)}
      onPlaying={() => usePlayerStore.getState().syncLoading(false)}
      onEnded={() => usePlayerStore.getState().syncEnded()}
      onError={() => usePlayerStore.getState().syncError("Could not load this track.")}
    />
  );
}
