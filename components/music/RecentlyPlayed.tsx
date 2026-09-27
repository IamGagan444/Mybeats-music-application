"use client";

import { TrackList } from "@/components/music/TrackList";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePlayerStore } from "@/stores/player";

export function RecentlyPlayed() {
  const recentlyPlayed = usePlayerStore((s) => s.recentlyPlayed);
  // recentlyPlayed comes from localStorage, which the server can't know about.
  const hydrated = useHydrated();

  if (!hydrated || recentlyPlayed.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold tracking-tight">Recently played</h2>
      <TrackList tracks={recentlyPlayed} />
    </section>
  );
}
