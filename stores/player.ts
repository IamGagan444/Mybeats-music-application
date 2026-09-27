import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MusicTrack } from "@/types/music";

const MAX_RECENTLY_PLAYED = 12;

interface PlayerState {
  queue: MusicTrack[];
  currentIndex: number;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  error: string | null;
  recentlyPlayed: MusicTrack[];

  playTrack: (track: MusicTrack, queue?: MusicTrack[]) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;

  // Driven by the audio element, not the UI.
  syncTime: (time: number) => void;
  syncDuration: (duration: number) => void;
  syncLoading: (isLoading: boolean) => void;
  syncEnded: () => void;
  syncError: (message: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      currentIndex: -1,
      isPlaying: false,
      isLoading: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      error: null,
      recentlyPlayed: [],

      playTrack: (track, queue) => {
        const nextQueue = queue?.length ? queue : [track];
        const index = nextQueue.findIndex((t) => t.id === track.id);
        const isSameTrack = get().queue[get().currentIndex]?.id === track.id;

        if (isSameTrack) {
          set({ isPlaying: !get().isPlaying });
          return;
        }

        set((state) => ({
          queue: nextQueue,
          currentIndex: index === -1 ? 0 : index,
          isPlaying: true,
          isLoading: true,
          currentTime: 0,
          duration: 0,
          error: null,
          recentlyPlayed: [
            track,
            ...state.recentlyPlayed.filter((t) => t.id !== track.id),
          ].slice(0, MAX_RECENTLY_PLAYED),
        }));
      },

      togglePlay: () => {
        if (get().currentIndex === -1) return;
        set((state) => ({ isPlaying: !state.isPlaying, error: null }));
      },

      next: () => {
        const { queue, currentIndex } = get();
        if (currentIndex === -1 || currentIndex >= queue.length - 1) return;
        set({
          currentIndex: currentIndex + 1,
          isPlaying: true,
          isLoading: true,
          currentTime: 0,
          duration: 0,
          error: null,
        });
      },

      previous: () => {
        const { currentIndex, currentTime } = get();
        if (currentIndex === -1) return;
        // Restart the current track first, like every other music player.
        if (currentTime > 3 || currentIndex === 0) {
          set({ currentTime: 0 });
          return;
        }
        set({
          currentIndex: currentIndex - 1,
          isPlaying: true,
          isLoading: true,
          currentTime: 0,
          duration: 0,
          error: null,
        });
      },

      seek: (time) => set({ currentTime: time }),
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

      syncTime: (currentTime) => set({ currentTime }),
      syncDuration: (duration) => set({ duration, isLoading: false }),
      syncLoading: (isLoading) => set({ isLoading }),
      syncEnded: () => {
        const { queue, currentIndex } = get();
        if (currentIndex < queue.length - 1) {
          get().next();
          return;
        }
        set({ isPlaying: false, currentTime: 0 });
      },
      syncError: (message) =>
        set({ error: message, isPlaying: false, isLoading: false }),
    }),
    {
      name: "mybeats-player",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recentlyPlayed: state.recentlyPlayed,
        volume: state.volume,
        isMuted: state.isMuted,
      }),
    }
  )
);

export const selectCurrentTrack = (state: PlayerState): MusicTrack | null =>
  state.queue[state.currentIndex] ?? null;
