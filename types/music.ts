export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  artistHandle?: string;
  artwork?: string;
  artworkSmall?: string;
  duration: number;
  genre?: string;
  mood?: string;
  tags?: string[];
  releaseDate?: string;
  streamUrl: string;
  provider: "audius";
  playCount?: number;
  favoriteCount?: number;
  isVerified?: boolean;
}

export interface MusicUser {
  id: string;
  handle: string;
  name: string;
  avatar?: string;
  isVerified?: boolean;
  followerCount?: number;
  trackCount?: number;
}

export interface MusicCollection {
  id: string;
  name: string;
  artwork?: string;
  owner: string;
  trackCount: number;
  isAlbum: boolean;
}

export interface SearchResults {
  tracks: MusicTrack[];
  users: MusicUser[];
  playlists: MusicCollection[];
  albums: MusicCollection[];
}

export const EMPTY_SEARCH: SearchResults = {
  tracks: [],
  users: [],
  playlists: [],
  albums: [],
};
