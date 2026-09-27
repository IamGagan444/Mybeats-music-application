import {
  audiusFetch,
  toMusicTrack,
  toMusicUser,
  type AudiusTrackRaw,
  type AudiusUserRaw,
} from "@/lib/audius";
import type { MusicTrack, MusicUser } from "@/types/music";

export interface Artist extends MusicUser {
  bio?: string;
  location?: string;
  coverPhoto?: string;
  followeeCount?: number;
}

interface ArtistRaw extends AudiusUserRaw {
  bio?: string | null;
  location?: string | null;
  followee_count?: number;
  cover_photo?: { "640x"?: string; "2000x"?: string } | null;
}

export async function getArtistByHandle(handle: string): Promise<Artist | null> {
  try {
    const { data } = await audiusFetch<{ data: ArtistRaw }>(
      `/v1/users/handle/${encodeURIComponent(handle)}`
    );
    if (!data?.id) return null;

    return {
      ...toMusicUser(data),
      bio: data.bio ?? undefined,
      location: data.location ?? undefined,
      followeeCount: data.followee_count,
      coverPhoto: data.cover_photo?.["2000x"] ?? data.cover_photo?.["640x"],
    };
  } catch {
    return null;
  }
}

export async function getArtistTracks(
  handle: string,
  { limit = 40, offset = 0 } = {}
): Promise<MusicTrack[]> {
  try {
    const { data } = await audiusFetch<{ data: AudiusTrackRaw[] }>(
      `/v1/users/handle/${encodeURIComponent(handle)}/tracks`,
      { limit: String(limit), offset: String(offset), sort: "plays" }
    );
    return (data ?? []).map(toMusicTrack);
  } catch {
    return [];
  }
}
