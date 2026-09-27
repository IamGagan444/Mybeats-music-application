import { NextResponse } from "next/server";
import { getMyBeatsUser } from "@/lib/current-user";
import { listFavoriteIds } from "@/lib/favorites";

export async function GET() {
  const user = await getMyBeatsUser();

  if (!user) {
    return NextResponse.json({ success: true, data: [], signedIn: false });
  }

  try {
    const ids = await listFavoriteIds(user.id);
    return NextResponse.json({ success: true, data: ids, signedIn: true });
  } catch (error) {
    console.error("List favorites failed:", error);
    return NextResponse.json(
      { success: false, message: "Couldn't load favorites." },
      { status: 500 }
    );
  }
}
