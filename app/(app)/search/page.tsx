import { Topbar } from "@/components/layout/Topbar";
import { SearchResults } from "@/components/music/SearchResults";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  return (
    <>
      <Topbar initialQuery={query} />
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {query ? (
            <>
              Results for <span className="text-brand">&ldquo;{query}&rdquo;</span>
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
