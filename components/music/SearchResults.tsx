"use client";

import { BadgeCheck, Disc3, ListMusic, Search, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { SongRail } from "@/components/music/SongRail";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/queries";
import { EMPTY_SEARCH, type MusicCollection, type MusicUser } from "@/types/music";

const DEBOUNCE_MS = 350;

function UserCard({ user }: { user: MusicUser }) {
  return (
    <div className="flex w-32 shrink-0 flex-col items-center gap-2 rounded-2xl bg-surface-raised/50 p-4 text-center sm:w-36">
      <span className="size-20 overflow-hidden rounded-full">
        <TrackArtwork src={user.avatar} iconClassName="size-5" />
      </span>
      <div className="min-w-0">
        <p className="flex items-center justify-center gap-1 truncate text-sm font-semibold">
          <span className="truncate">{user.name}</span>
          {user.isVerified ? (
            <BadgeCheck className="size-3.5 shrink-0 text-brand" />
          ) : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {user.followerCount?.toLocaleString() ?? 0} followers
        </p>
      </div>
    </div>
  );
}

function CollectionCard({ collection }: { collection: MusicCollection }) {
  return (
    <div className="w-38 shrink-0 sm:w-41">
      <div className="aspect-square overflow-hidden rounded-2xl">
        <TrackArtwork src={collection.artwork} />
      </div>
      <p className="mt-2 truncate text-sm font-semibold">{collection.name}</p>
      <p className="truncate text-xs text-muted-foreground">
        {collection.owner} · {collection.trackCount} tracks
      </p>
    </div>
  );
}

function Rail<T>({
  title,
  icon,
  items,
  render,
}: {
  title: string;
  icon: React.ReactNode;
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icon}
        {title}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {items.map(render)}
      </div>
    </section>
  );
}

export function SearchResults({
  initialQuery = "",
  autoFocus,
}: {
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState(initialQuery);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  const { data = EMPTY_SEARCH, isFetching, isError } = useSearch(debounced, {
    full: true,
  });

  const isEmpty =
    !isFetching &&
    debounced.length > 0 &&
    data.tracks.length === 0 &&
    data.users.length === 0 &&
    data.playlists.length === 0 &&
    data.albums.length === 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks, artists, playlists…"
          aria-label="Search"
          className="h-11 rounded-full border-transparent bg-surface-raised pl-11 text-sm"
        />
      </div>

      {isError ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          Search failed. Please try again.
        </p>
      ) : isFetching && debounced ? (
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-38 rounded-2xl sm:w-41" />
          ))}
        </div>
      ) : isEmpty ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          No results for &ldquo;{debounced}&rdquo;
        </p>
      ) : (
        <>
          {data.tracks.length > 0 ? (
            <SongRail title="Tracks" tracks={data.tracks} />
          ) : null}

          <Rail
            title="Artists"
            icon={<Users className="size-4 text-muted-foreground" />}
            items={data.users}
            render={(user) => <UserCard key={user.id} user={user} />}
          />
          <Rail
            title="Playlists"
            icon={<ListMusic className="size-4 text-muted-foreground" />}
            items={data.playlists}
            render={(c) => <CollectionCard key={c.id} collection={c} />}
          />
          <Rail
            title="Albums"
            icon={<Disc3 className="size-4 text-muted-foreground" />}
            items={data.albums}
            render={(c) => <CollectionCard key={c.id} collection={c} />}
          />
        </>
      )}
    </div>
  );
}
