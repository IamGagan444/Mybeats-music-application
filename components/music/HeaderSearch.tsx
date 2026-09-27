"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { Input } from "@/components/ui/input";
import { useSearch } from "@/hooks/queries";
import { EMPTY_SEARCH } from "@/types/music";

const DEBOUNCE_MS = 250;

export function HeaderSearch({ initialQuery = "" }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const { data = EMPTY_SEARCH } = useSearch(debounced);
  const suggestions = [
    ...data.tracks.slice(0, 4).map((t) => ({
      key: `t-${t.id}`,
      href: `/search?q=${encodeURIComponent(t.title)}`,
      art: t.artworkSmall ?? t.artwork,
      title: t.title,
      subtitle: t.artist,
      round: false,
    })),
    ...data.users.slice(0, 3).map((u) => ({
      key: `u-${u.id}`,
      href: `/artist/${encodeURIComponent(u.handle)}`,
      art: u.avatar,
      title: u.name,
      subtitle: `@${u.handle}`,
      round: true,
    })),
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <form role="search" onSubmit={submit}>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
          placeholder="What do you want to listen to?"
          aria-label="Search"
          aria-expanded={open && suggestions.length > 0}
          className="h-10 rounded-full border-transparent bg-surface-raised pl-11 text-sm"
        />
      </form>

      {open && suggestions.length > 0 ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-2xl border border-border/60 bg-popover shadow-2xl">
          <ul>
            {suggestions.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-raised"
                >
                  <span
                    className={`size-9 shrink-0 overflow-hidden ${
                      item.round ? "rounded-full" : "rounded-md"
                    }`}
                  >
                    <TrackArtwork src={item.art} iconClassName="size-3" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
