"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { playerActions } from "@/store/playerSlice";
import type { MusicTrack } from "@/types/music";

const KEY = "mybeats-player";

/** Mirrors the bits of player state worth keeping between visits. */
export function PlayerPersistence() {
  const dispatch = useAppDispatch();
  const recentlyPlayed = useAppSelector((s) => s.player.recentlyPlayed);
  const volume = useAppSelector((s) => s.player.volume);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as {
        recentlyPlayed?: MusicTrack[];
        volume?: number;
      };
      if (parsed.recentlyPlayed?.length) {
        dispatch(playerActions.setRecentlyPlayed(parsed.recentlyPlayed));
      }
      if (typeof parsed.volume === "number") {
        dispatch(playerActions.setVolume(parsed.volume));
      }
    } catch {
      // Unreadable storage is not worth failing over.
    }
  }, [dispatch]);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ recentlyPlayed, volume }));
    } catch {
      // Private mode / quota.
    }
  }, [recentlyPlayed, volume]);

  return null;
}
