import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { MusicTrack } from "@/types/music";

const MAX_RECENT = 12;

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
}

const initialState: PlayerState = {
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
};

function startTrack(state: PlayerState, index: number) {
  state.currentIndex = index;
  state.isPlaying = true;
  state.isLoading = true;
  state.currentTime = 0;
  state.duration = 0;
  state.error = null;
}

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playTrack(
      state,
      action: PayloadAction<{ track: MusicTrack; queue?: MusicTrack[] }>
    ) {
      const { track, queue } = action.payload;

      if (state.queue[state.currentIndex]?.id === track.id) {
        state.isPlaying = !state.isPlaying;
        return;
      }

      const nextQueue = queue?.length ? queue : [track];
      const index = nextQueue.findIndex((t) => t.id === track.id);

      state.queue = nextQueue;
      startTrack(state, index === -1 ? 0 : index);
      state.recentlyPlayed = [
        track,
        ...state.recentlyPlayed.filter((t) => t.id !== track.id),
      ].slice(0, MAX_RECENT);
    },

    togglePlay(state) {
      if (state.currentIndex === -1) return;
      state.isPlaying = !state.isPlaying;
      state.error = null;
    },

    next(state) {
      if (state.currentIndex === -1) return;
      if (state.currentIndex >= state.queue.length - 1) return;
      startTrack(state, state.currentIndex + 1);
    },

    previous(state) {
      if (state.currentIndex === -1) return;
      if (state.currentTime > 3 || state.currentIndex === 0) {
        state.currentTime = 0;
        return;
      }
      startTrack(state, state.currentIndex - 1);
    },

    seek(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },

    setVolume(state, action: PayloadAction<number>) {
      state.volume = action.payload;
      state.isMuted = action.payload === 0;
    },

    toggleMute(state) {
      state.isMuted = !state.isMuted;
    },

    setRecentlyPlayed(state, action: PayloadAction<MusicTrack[]>) {
      state.recentlyPlayed = action.payload;
    },

    syncTime(state, action: PayloadAction<number>) {
      state.currentTime = action.payload;
    },

    syncDuration(state, action: PayloadAction<number>) {
      state.duration = action.payload;
      state.isLoading = false;
    },

    syncLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },

    syncEnded(state) {
      if (state.currentIndex < state.queue.length - 1) {
        startTrack(state, state.currentIndex + 1);
        return;
      }
      state.isPlaying = false;
      state.currentTime = 0;
    },

    syncError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isPlaying = false;
      state.isLoading = false;
    },
  },
});

export const playerActions = playerSlice.actions;
export default playerSlice.reducer;
