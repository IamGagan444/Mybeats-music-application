import { audiusFetch, toMusicTrack, type AudiusTrackRaw } from "@/lib/audius";
import type { MusicTrack } from "@/types/music";

/**
 * Canonical Audius genres, filtered to the ones a listener actually browses.
 * These are real query values for the trending endpoint, not decoration.
 */
export const GENRES = [
  "Electronic",
  "Hip-Hop/Rap",
  "Alternative",
  "Pop",
  "R&B/Soul",
  "Rock",
  "House",
  "Techno",
  "Jazz",
  "Ambient",
  "Lo-Fi",
  "Trap",
] as const;

export function isGenre(value: string | undefined): value is (typeof GENRES)[number] {
  return Boolean(value) && (GENRES as readonly string[]).includes(value!);
}

export async function getTrendingTracks(
  genre?: string,
  limit = 24
): Promise<MusicTrack[]> {
  const params: Record<string, string> = { limit: String(limit) };
  if (genre) params.genre = genre;

  const { data } = await audiusFetch<{ data: AudiusTrackRaw[] }>(
    "/v1/tracks/trending",
    params
  );
  return data.map(toMusicTrack);
}

/**
 * Genres present in what's trending right now, each with a real cover from a
 * track in that genre. Reuses the cached trending response, so no extra call.
 */
export async function getRecentGenres(): Promise<
  { name: string; artwork?: string }[]
> {
  try {
    const tracks = await getTrendingTracks(undefined, 24);
    const seen = new Map<string, string | undefined>();

    for (const track of tracks) {
      if (!track.genre || seen.has(track.genre)) continue;
      seen.set(track.genre, track.artworkSmall ?? track.artwork);
      if (seen.size === 4) break;
    }

    return [...seen].map(([name, artwork]) => ({ name, artwork }));
  } catch {
    // The sidebar is chrome — never let it break the page.
    return [];
  }
}
