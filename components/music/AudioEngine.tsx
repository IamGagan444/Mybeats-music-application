"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { playerActions } from "@/store/playerSlice";
import { selectCurrentTrack } from "@/store/selectors";

const SEEK_THRESHOLD = 0.75;

/** The app's single <audio> element, mounted once so playback survives navigation. */
export function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const dispatch = useAppDispatch();

  const streamUrl = useAppSelector((s) => selectCurrentTrack(s)?.streamUrl);
  const isPlaying = useAppSelector((s) => s.player.isPlaying);
  const volume = useAppSelector((s) => s.player.volume);
  const isMuted = useAppSelector((s) => s.player.isMuted);
  const storeTime = useAppSelector((s) => s.player.currentTime);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;
    audio.src = streamUrl;
    audio.load();
  }, [streamUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !streamUrl) return;

    if (!isPlaying) {
      audio.pause();
      return;
    }

    audio.play().catch((err: unknown) => {
      if (err instanceof DOMException && err.name === "AbortError") return;
      dispatch(playerActions.syncError("Playback failed for this track."));
    });
  }, [isPlaying, streamUrl, dispatch]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = isMuted;
  }, [volume, isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Only react to deliberate seeks, not the element's own timeupdate drift.
    if (Math.abs(audio.currentTime - storeTime) > SEEK_THRESHOLD) {
      audio.currentTime = storeTime;
    }
  }, [storeTime]);

  return (
    <audio
      ref={audioRef}
      preload="metadata"
      onTimeUpdate={(e) =>
        dispatch(playerActions.syncTime(e.currentTarget.currentTime))
      }
      onDurationChange={(e) =>
        dispatch(playerActions.syncDuration(e.currentTarget.duration || 0))
      }
      onWaiting={() => dispatch(playerActions.syncLoading(true))}
      onPlaying={() => dispatch(playerActions.syncLoading(false))}
      onEnded={() => dispatch(playerActions.syncEnded())}
      onError={() =>
        dispatch(playerActions.syncError("Could not load this track."))
      }
    />
  );
}
