import { redirect } from "next/navigation";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalPlayer } from "@/components/music/GlobalPlayer";
import { getMyBeatsUser } from "@/lib/current-user";
import { hasOnboarded } from "@/lib/preferences";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  // Signed-out visitors browse freely; only a Google account owes onboarding.
  const user = await getMyBeatsUser();
  if (user && !(await hasOnboarded(user.id))) redirect("/onboarding");

  return (
    <div className="flex h-dvh flex-col gap-2 p-2 sm:gap-3 sm:p-3 lg:p-4">
      <div className="flex min-h-0 flex-1 gap-4">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-x-clip overflow-y-auto rounded-3xl bg-surface px-4 pt-4 pb-6 no-scrollbar sm:px-6 sm:pt-5">
          {children}
        </main>
      </div>
      <GlobalPlayer />
      <MobileNav />
    </div>
  );
}
