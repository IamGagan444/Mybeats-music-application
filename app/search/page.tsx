import { SiteHeader } from "@/components/site-header";
import { SearchResults } from "@/components/music/SearchResults";

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";

  return (
    <>
      <SiteHeader initialQuery={query} />
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 pt-6 pb-40 sm:px-6">
        <div className="flex flex-col gap-6">
          <h1 className="text-2xl font-bold tracking-tight">
            {query ? (
              <>
                Results for{" "}
                <span className="text-brand">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>
          <SearchResults initialQuery={query} autoFocus={!query} />
        </div>
      </main>
    </>
  );
}
