import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface FavoritesState {
  ids: string[];
  isSignedIn: boolean;
  pending: string[];
}

const initialState: FavoritesState = {
  ids: [],
  isSignedIn: false,
  pending: [],
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    hydrate(
      state,
      action: PayloadAction<{ ids: string[]; isSignedIn: boolean }>
    ) {
      state.ids = action.payload.ids;
      state.isSignedIn = action.payload.isSignedIn;
    },

    toggled(state, action: PayloadAction<string>) {
      const id = action.payload;
      state.ids = state.ids.includes(id)
        ? state.ids.filter((x) => x !== id)
        : [...state.ids, id];
    },

    pendingStarted(state, action: PayloadAction<string>) {
      state.pending.push(action.payload);
    },

    pendingFinished(state, action: PayloadAction<string>) {
      state.pending = state.pending.filter((id) => id !== action.payload);
    },
  },
});

export const favoritesActions = favoritesSlice.actions;
export default favoritesSlice.reducer;
