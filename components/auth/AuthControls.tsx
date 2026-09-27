import { LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { TrackArtwork } from "@/components/music/TrackArtwork";
import { getCurrentUser } from "@/lib/current-user";

export async function AuthControls() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Button
        render={<Link href="/login" />}
        nativeButton={false}
        className="h-9 gap-2 rounded-full bg-brand px-4 text-xs font-bold tracking-wide text-brand-foreground uppercase transition-transform hover:scale-105 hover:bg-brand"
      >
        <LogIn className="size-4" />
        <span className="hidden sm:inline">Log in</span>
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full bg-muted py-1 pr-3 pl-1">
        <div className="size-7 shrink-0 overflow-hidden rounded-full">
          <TrackArtwork src={user.avatar} iconClassName="size-3" />
        </div>
        <span className="hidden max-w-28 truncate text-xs font-bold sm:inline">
          {user.name}
        </span>
      </div>
      <form action={signOutEverywhere}>
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Log out"
          className="rounded-full text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-4" />
        </Button>
      </form>
    </div>
  );
}
