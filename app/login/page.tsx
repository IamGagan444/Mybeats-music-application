import { AudioLines } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signInWithGoogle } from "@/app/actions/auth";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import { Button } from "@/components/ui/button";
import { hasGoogleAuth } from "@/auth";
import { getCurrentUser } from "@/lib/current-user";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <AudioLines className="size-10 text-brand" />
          <h1 className="text-2xl font-bold tracking-tight">Log in to MyBeats</h1>
          <p className="text-sm text-muted-foreground">
            Save tracks you love and pick up where you left off.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {hasGoogleAuth ? (
            <form action={signInWithGoogle}>
              <Button
                type="submit"
                variant="outline"
                className="h-12 w-full gap-3 rounded-full text-sm font-bold"
              >
                <GoogleIcon className="size-5" />
                Continue with Google
              </Button>
            </form>
          ) : null}

          <Button
            render={<a href="/api/audius/auth/login" />}
            nativeButton={false}
            className="h-12 w-full gap-3 rounded-full bg-brand text-sm font-bold text-brand-foreground transition-transform hover:scale-[1.02] hover:bg-brand"
          >
            <AudioLines className="size-5" />
            Log in with Audius
          </Button>
        </div>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          An Audius account unlocks your real Audius favorites, library and
          listening history. Google saves favorites to MyBeats instead.
        </p>

        <Link
          href="/"
          className="text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Keep browsing without an account
        </Link>
      </div>
    </main>
  );
}
