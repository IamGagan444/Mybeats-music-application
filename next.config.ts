import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@audius/sdk"],
  experimental: {
    // Home/Search/Library/Artist all read cookies (getCurrentUser), which
    // forces dynamic rendering — and Next's client Router Cache treats
    // dynamic segments as uncacheable by default (staleTimes.dynamic: 0),
    // so every revisit re-hits the server even seconds later. This reuses
    // the already-fetched RSC payload for 30s on back/forward and repeat
    // navigation, which is what actually makes Home/Search/Library feel
    // instant on return — TanStack Query has no part in these pages, since
    // their data is fetched server-side, not via useQuery.
    staleTimes: { dynamic: 30 },
  },
};

export default nextConfig;
