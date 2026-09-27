import {
  audiusFetch,
  toMusicCollection,
  toMusicTrack,
  toMusicUser,
  type AudiusCollectionRaw,
  type AudiusTrackRaw,
  type AudiusUserRaw,
} from "@/lib/audius";
import { EMPTY_SEARCH, type SearchResults } from "@/types/music";

interface RawSearch {
  data?: {
    tracks?: AudiusTrackRaw[];
    users?: AudiusUserRaw[];
    playlists?: AudiusCollectionRaw[];
    albums?: AudiusCollectionRaw[];
  };
}

/**
 * `autocomplete` is the faster, lighter endpoint for as-you-type results;
 * `full` returns richer entities for a submitted search.
 */
export async function searchAudius(
  query: string,
  { limit = 10, full = false }: { limit?: number; full?: boolean } = {}
): Promise<SearchResults> {
  const path = full ? "/v1/search/full" : "/v1/search/autocomplete";

  const { data } = await audiusFetch<RawSearch>(
    path,
    { query, limit: String(limit), kind: "all" },
    { revalidate: 120 }
  );

  if (!data) return EMPTY_SEARCH;

  return {
    tracks: (data.tracks ?? []).map(toMusicTrack),
    users: (data.users ?? []).map(toMusicUser),
    playlists: (data.playlists ?? []).map(toMusicCollection),
    albums: (data.albums ?? []).map(toMusicCollection),
  };
}
