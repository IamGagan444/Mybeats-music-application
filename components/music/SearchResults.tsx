"use client";

import { BadgeCheck, Disc3, ListMusic, Search, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SongRail } from "@/components/music/SongRail";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearch } from "@/hooks/queries";
import { EMPTY_SEARCH, type MusicCollection, type MusicUser } from "@/types/music";

const DEBOUNCE_MS = 350;

function UserCard({ user }: { user: MusicUser }) {
  return (
    <Link
      href={`/artist/${encodeURIComponent(user.handle)}`}
      className="hover-lift group flex w-32 shrink-0 flex-col items-center gap-2 rounded-2xl bg-surface-raised/60 p-4 text-center outline-none ring-1 ring-border/40 hover:bg-surface-raised focus-visible:ring-3 focus-visible:ring-ring/50 sm:w-36"
    >
      <span className="size-20 overflow-hidden rounded-full transition-transform duration-300 group-hover:scale-105">
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
    </Link>
  );
}

function CollectionCard({ collection }: { collection: MusicCollection }) {
  return (
    <div className="hover-lift w-38 shrink-0 rounded-2xl sm:w-41">
      <div className="aspect-square overflow-hidden rounded-2xl shadow-elevate ring-1 ring-border/40">
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
    <section className="flex min-w-0 flex-col gap-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        {icon}
        {title}
      </h2>
      <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:px-0">
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
  const inputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex min-w-0 flex-col gap-8">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          setDebounced(query.trim());
          inputRef.current?.blur();
        }}
        className="flex h-12 w-full max-w-md items-center gap-3 rounded-full bg-surface-raised px-5 ring-1 ring-border/60 transition-[box-shadow] focus-within:ring-2 focus-within:ring-brand/60 hover:ring-border"
      >
        <Search className="size-4.5 shrink-0 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="search"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks, artists, playlists…"
          aria-label="Search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          className="h-full flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:border-0 focus-visible:ring-0 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {/* Safari/iOS only submits a form on Return when it has a submit button. */}
        <button type="submit" className="sr-only" tabIndex={-1}>
          Search
        </button>
      </form>

      {isError ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          Search failed. Please try again.
        </p>
      ) : isFetching && debounced ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-38 rounded-2xl sm:w-41" />
          ))}
        </div>
      ) : isEmpty ? (
        <p className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
          No results for &ldquo;<span className="break-all">{debounced}</span>&rdquo;
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
