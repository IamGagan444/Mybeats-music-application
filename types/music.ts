export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  artistHandle?: string;
  artwork?: string;
  /** 150px variant — use for thumbnails so we don't pull 480px files. */
  artworkSmall?: string;
  duration: number;
  genre?: string;
  streamUrl: string;
  provider: "audius";
  playCount?: number;
  isVerified?: boolean;
}
