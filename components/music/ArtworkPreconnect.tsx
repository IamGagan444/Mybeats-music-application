import ReactDOM from "react-dom";
import type { MusicTrack } from "@/types/music";

// Audius serves artwork from whichever content node holds the file, so a page
// of tracks can span a dozen+ hosts. Each one costs a DNS lookup and TLS
// handshake before a single byte of image arrives. Warming the connections
// while the server response is still streaming takes that off the critical
// path. Capped, because too many preconnects contend for sockets.
const MAX_PRECONNECTS = 6;

export function ArtworkPreconnect({ tracks }: { tracks: MusicTrack[] }) {
  const hosts = new Set<string>();

  for (const track of tracks) {
    const url = track.artworkSmall ?? track.artwork;
    if (!url) continue;
    try {
      hosts.add(new URL(url).origin);
    } catch {
      // Ignore malformed artwork URLs.
    }
    if (hosts.size >= MAX_PRECONNECTS) break;
  }

  for (const origin of hosts) {
    ReactDOM.preconnect(origin, { crossOrigin: "anonymous" });
  }

  return null;
}
