import { Topbar } from "@/components/layout/Topbar";
import { SearchResults } from "@/components/music/SearchResults";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  return (
    <>
      <Topbar initialQuery={query} />
      <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
        <h1 className="text-xl font-bold tracking-tight break-words sm:text-2xl">
          {query ? (
            <>
              Results for{" "}
              <span className="text-brand break-all">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            "Search"
          )}
        </h1>
        <SearchResults initialQuery={query} autoFocus={!query} />
      </div>
    </>
  );
}
