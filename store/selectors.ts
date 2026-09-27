import type { RootState } from "@/store";

export const selectCurrentTrack = (s: RootState) =>
  s.player.queue[s.player.currentIndex] ?? null;

export const selectIsTrackActive = (trackId: string) => (s: RootState) =>
  selectCurrentTrack(s)?.id === trackId && s.player.isPlaying;

export const selectIsFavorited = (trackId: string) => (s: RootState) =>
  s.favorites.ids.includes(trackId);
