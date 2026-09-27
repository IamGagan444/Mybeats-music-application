export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  artistHandle?: string;
  artwork?: string;
  duration: number;
  genre?: string;
  streamUrl: string;
  provider: "audius";
  playCount?: number;
  isVerified?: boolean;
}
