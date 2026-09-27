import "server-only";
import { listFavorites } from "@/lib/favorites";
import type { UserPreferences } from "@/lib/preferences";
import { emptySignals, type Signals } from "@/lib/recommendations/scoring";

/** Turns stored MyBeats behaviour into ranking signals. */
export async function buildSignals(
  userId: string | null,
  preferences: UserPreferences | null
): Promise<Signals> {
  const signals = emptySignals();

  if (preferences) {
    signals.languages = preferences.languages;
    signals.genres = preferences.genres;
    signals.moods = preferences.moods;
  }

  if (!userId) return signals;

  const favorites = await listFavorites(userId).catch(() => []);
  for (const track of favorites) {
    signals.affinityArtists.add(track.artist);
    if (track.genre) signals.affinityGenres.add(track.genre);
    signals.seenTrackIds.add(track.id);
  }

  return signals;
}
