import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { addFavorite, removeFavorite } from "@/lib/favorites";

const UNAUTHORIZED = NextResponse.json(
  { success: false, message: "Sign in to save tracks." },
  { status: 401 }
);

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/audius/favorites/[trackId]">
) {
  const user = await getCurrentUser();
  if (!user) return UNAUTHORIZED;

  const { trackId } = await ctx.params;
  // The database backend stores a snapshot so the library renders without
  // re-fetching every track from Audius.
  const body = await request.json().catch(() => ({}));

  try {
    await addFavorite(user, {
      id: trackId,
      title: typeof body.title === "string" ? body.title : "Unknown track",
      artist: typeof body.artist === "string" ? body.artist : "Unknown artist",
      artwork: typeof body.artwork === "string" ? body.artwork : undefined,
      duration: typeof body.duration === "number" ? body.duration : 0,
    });
    return NextResponse.json({ success: true, data: { favorite: true } });
  } catch (error) {
    console.error("Add favorite failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't save this track." },
      { status: 502 }
    );
  }
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/audius/favorites/[trackId]">
) {
  const user = await getCurrentUser();
  if (!user) return UNAUTHORIZED;

  const { trackId } = await ctx.params;

  try {
    await removeFavorite(user, trackId);
    return NextResponse.json({ success: true, data: { favorite: false } });
  } catch (error) {
    console.error("Remove favorite failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't update this track." },
      { status: 502 }
    );
  }
}
