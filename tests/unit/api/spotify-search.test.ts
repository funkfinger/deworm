import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/spotify/search/route";
import type { SpotifyClient } from "@/app/lib/spotify-client";

// Mock the getAuthenticatedSpotifyClient function
vi.mock("@/app/lib/spotify-client", () => ({
  getAuthenticatedSpotifyClient: vi.fn(),
}));

// Import the mocked function
import { getAuthenticatedSpotifyClient } from "@/app/lib/spotify-client";

describe("Spotify Search API Route", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should return 400 if query parameter is missing", async () => {
    const request = new NextRequest("http://localhost:3000/api/spotify/search");
    const response = await GET(request);

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe('Query parameter "q" is required');
  });

  it("should return 401 if not authenticated", async () => {
    // Mock getAuthenticatedSpotifyClient to return null (not authenticated)
    vi.mocked(getAuthenticatedSpotifyClient).mockResolvedValueOnce(null);

    const request = new NextRequest(
      "http://localhost:3000/api/spotify/search?q=test"
    );
    const response = await GET(request);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Unauthorized");
  });

  it("should return search results from Spotify", async () => {
    // Mock search results
    const mockSearchResults = {
      tracks: {
        items: [
          {
            id: "track-id-1",
            name: "Test Track",
            artists: [{ id: "artist-id-1", name: "Test Artist" }],
            album: {
              id: "album-id-1",
              name: "Test Album",
              images: [{ url: "test-image-url", height: 300, width: 300 }],
            },
          },
        ],
        total: 1,
      },
    };

    // Mock getAuthenticatedSpotifyClient to return a client with searchTracks
    vi.mocked(getAuthenticatedSpotifyClient).mockResolvedValueOnce({
      searchTracks: vi.fn().mockResolvedValueOnce(mockSearchResults),
    } as unknown as SpotifyClient);

    const request = new NextRequest(
      "http://localhost:3000/api/spotify/search?q=test&limit=10"
    );
    const response = await GET(request);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(mockSearchResults);
  });

  it("should handle errors and return 500", async () => {
    // Mock getAuthenticatedSpotifyClient to throw an error
    vi.mocked(getAuthenticatedSpotifyClient).mockResolvedValueOnce({
      searchTracks: vi
        .fn()
        .mockRejectedValueOnce(new Error("Spotify API error")),
    } as unknown as SpotifyClient);

    // Mock console.error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const request = new NextRequest(
      "http://localhost:3000/api/spotify/search?q=test"
    );
    const response = await GET(request);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Failed to search Spotify");

    // Verify console.error was called
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
