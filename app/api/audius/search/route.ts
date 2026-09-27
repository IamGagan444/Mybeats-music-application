import { NextRequest, NextResponse } from "next/server";
import { searchAudius } from "@/lib/search";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

function parseLimit(raw: string | null) {
  const parsed = Number(raw);
  if (!raw || !Number.isInteger(parsed) || parsed < 1) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const query = params.get("q")?.trim();

  if (!query) {
    return NextResponse.json(
      { success: false, message: "Search query is required" },
      { status: 400 }
    );
  }

  try {
    const data = await searchAudius(query, {
      limit: parseLimit(params.get("limit")),
      full: params.get("full") === "true",
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Audius search error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search" },
      { status: 500 }
    );
  }
}
