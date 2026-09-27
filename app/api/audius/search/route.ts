import { NextRequest, NextResponse } from "next/server";
import { audiusFetch, toMusicTrack, type AudiusTrackRaw } from "@/lib/audius";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

function parseLimit(raw: string | null): number {
  const parsed = Number(raw);
  if (!raw || !Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_LIMIT;
  }
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json(
        {
          success: false,
          message: "Search query is required",
        },
        { status: 400 }
      );
    }

    const limit = parseLimit(request.nextUrl.searchParams.get("limit"));

    const { data } = await audiusFetch<{ data: AudiusTrackRaw[] }>(
      "/v1/tracks/search",
      { query, limit: String(limit) }
    );

    return NextResponse.json({
      success: true,
      data: data.map(toMusicTrack),
    });
  } catch (error) {
    console.error("Audius search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to search tracks",
      },
      { status: 500 }
    );
  }
}
