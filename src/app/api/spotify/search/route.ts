import { getAuthenticatedSpotifyClient } from "@/app/lib/spotify-client";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || "10";

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const spotifyClient = await getAuthenticatedSpotifyClient();

    if (!spotifyClient) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchResults = await spotifyClient.searchTracks(
      query,
      Number.parseInt(limit, 10)
    );
    return NextResponse.json(searchResults);
  } catch (error) {
    console.error("Error searching Spotify:", error);
    return NextResponse.json(
      { error: "Failed to search Spotify" },
      { status: 500 }
    );
  }
}
