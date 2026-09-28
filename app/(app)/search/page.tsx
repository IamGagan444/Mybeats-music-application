import type { Metadata } from "next";
import { Topbar } from "@/components/layout/Topbar";
import { SearchResults } from "@/components/music/SearchResults";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search millions of tracks, artists, albums and playlists on MyBeats and play them instantly.",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  return (
    <>
      <Topbar initialQuery={query} />
      <div className="brand-glow flex min-w-0 flex-col gap-5 sm:gap-7">
        <div className="flex min-w-0 flex-col gap-1.5">
          <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
            Search
          </p>
          <h1 className="text-2xl font-bold tracking-tight wrap-break-word sm:text-3xl">
            {query ? (
              <>
                Results for{" "}
                <span className="text-brand break-all">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              <span className="text-gradient-brand">What are you in the mood for?</span>
            )}
          </h1>
          {query ? null : (
            <p className="text-sm text-muted-foreground">
              Tracks, artists, albums and playlists — all in one place.
            </p>
          )}
        </div>
        <SearchResults initialQuery={query} autoFocus={!query} />
      </div>
    </>
  );
}
