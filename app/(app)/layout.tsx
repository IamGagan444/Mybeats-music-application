import { Sidebar } from "@/components/layout/Sidebar";
import { GlobalPlayer } from "@/components/music/GlobalPlayer";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex h-dvh flex-col gap-3 p-0 sm:p-3 lg:p-4">
      <div className="flex min-h-0 flex-1 gap-4">
        <Sidebar />
        {/* Only this column scrolls, so the shell and player stay put. */}
        <main className="min-w-0 flex-1 overflow-y-auto rounded-3xl bg-surface px-4 pt-5 pb-6 no-scrollbar sm:px-6">
          {children}
        </main>
      </div>
      <GlobalPlayer />
    </div>
  );
}
