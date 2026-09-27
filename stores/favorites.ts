import { create } from "zustand";
import type { MusicTrack } from "@/types/music";

/** Snapshot stored when the backend is our own database rather than Audius. */
type FavoriteTrackInput = Pick<
  MusicTrack,
  "id" | "title" | "artist" | "artwork" | "duration"
>;

interface FavoritesState {
  ids: Set<string>;
  isSignedIn: boolean;
  pending: Set<string>;
  hydrate: (ids: string[], isSignedIn: boolean) => void;
  toggle: (track: FavoriteTrackInput) => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>()((set, get) => ({
  ids: new Set(),
  isSignedIn: false,
  pending: new Set(),

  hydrate: (ids, isSignedIn) => set({ ids: new Set(ids), isSignedIn }),

  toggle: async (track) => {
    const trackId = track.id;
    const { ids, pending } = get();
    if (pending.has(trackId)) return;

    const wasFavorited = ids.has(trackId);
    const optimistic = new Set(ids);
    if (wasFavorited) optimistic.delete(trackId);
    else optimistic.add(trackId);

    set({
      ids: optimistic,
      pending: new Set(pending).add(trackId),
    });

    try {
      const res = await fetch(`/api/audius/favorites/${trackId}`, {
        method: wasFavorited ? "DELETE" : "POST",
        headers: wasFavorited ? undefined : { "Content-Type": "application/json" },
        body: wasFavorited
          ? undefined
          : JSON.stringify({
              title: track.title,
              artist: track.artist,
              artwork: track.artwork,
              duration: track.duration,
            }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      // Roll back to the server's truth.
      set((state) => {
        const reverted = new Set(state.ids);
        if (wasFavorited) reverted.add(trackId);
        else reverted.delete(trackId);
        return { ids: reverted };
      });
    } finally {
      set((state) => {
        const next = new Set(state.pending);
        next.delete(trackId);
        return { pending: next };
      });
    }
  },
}));
