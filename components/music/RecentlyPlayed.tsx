"use client";

import { SongRail } from "@/components/music/SongRail";
import { useHydrated } from "@/hooks/use-hydrated";
import { useAppSelector } from "@/store";

export function RecentlyPlayed() {
  const recentlyPlayed = useAppSelector((s) => s.player.recentlyPlayed);
  const hydrated = useHydrated();

  if (!hydrated || recentlyPlayed.length === 0) return null;

  return <SongRail title="Recently played" tracks={recentlyPlayed} />;
}
