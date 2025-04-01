import { SpotifyClient } from "@/app/lib/spotify-client";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock auth.ts module to avoid the next-auth dependency issue
vi.mock("@/app/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({
    accessToken: "test-access-token",
  }),
}));

// Mock the spotify-web-api-node module
vi.mock("spotify-web-api-node", () => {
  // Create a factory that returns a mock Spotify API with all the methods
  function SpotifyWebApiConstructor() {
    return {
      setAccessToken: vi.fn(),
      getMe: vi.fn().mockResolvedValue({
        body: {
          id: "test-user-id",
          display_name: "Test User",
          email: "test@example.com",
          images: [{ url: "test-image-url", height: 300, width: 300 }],
          external_urls: { spotify: "https://spotify.com/user/test-user-id" },
        },
      }),
      searchTracks: vi.fn().mockResolvedValue({
        body: {
          tracks: {
            items: [
              {
                id: "track-id-1",
                name: "Test Track",
                artists: [
                  {
                    id: "artist-id-1",
                    name: "Test Artist",
                    external_urls: {
                      spotify: "https://spotify.com/artist/artist-id-1",
                    },
                  },
                ],
                album: {
                  id: "album-id-1",
                  name: "Test Album",
                  images: [{ url: "album-image-url", height: 300, width: 300 }],
                  release_date: "2022-01-01",
                  external_urls: {
                    spotify: "https://spotify.com/album/album-id-1",
                  },
                },
                external_urls: {
                  spotify: "https://spotify.com/track/track-id-1",
                },
                uri: "spotify:track:track-id-1",
                duration_ms: 180000,
                preview_url: "https://test-preview-url.com",
              },
            ],
            next: null,
            previous: null,
            total: 1,
          },
        },
      }),
      getTrack: vi.fn().mockResolvedValue({
        body: {
          id: "track-id-1",
          name: "Test Track",
          artists: [
            {
              id: "artist-id-1",
              name: "Test Artist",
              external_urls: {
                spotify: "https://spotify.com/artist/artist-id-1",
              },
            },
          ],
          album: {
            id: "album-id-1",
            name: "Test Album",
            images: [{ url: "album-image-url", height: 300, width: 300 }],
            release_date: "2022-01-01",
            external_urls: { spotify: "https://spotify.com/album/album-id-1" },
          },
          external_urls: { spotify: "https://spotify.com/track/track-id-1" },
          uri: "spotify:track:track-id-1",
          duration_ms: 180000,
          preview_url: "https://test-preview-url.com",
        },
      }),
      getPlaylistTracks: vi.fn().mockResolvedValue({
        body: {
          items: [
            {
              track: {
                id: "track-id-1",
                name: "Test Track",
                artists: [
                  {
                    id: "artist-id-1",
                    name: "Test Artist",
                    external_urls: {
                      spotify: "https://spotify.com/artist/artist-id-1",
                    },
                  },
                ],
                album: {
                  id: "album-id-1",
                  name: "Test Album",
                  images: [{ url: "album-image-url", height: 300, width: 300 }],
                  release_date: "2022-01-01",
                  external_urls: {
                    spotify: "https://spotify.com/album/album-id-1",
                  },
                },
                external_urls: {
                  spotify: "https://spotify.com/track/track-id-1",
                },
                uri: "spotify:track:track-id-1",
                duration_ms: 180000,
                preview_url: "https://test-preview-url.com",
              },
            },
          ],
        },
      }),
      play: vi.fn().mockResolvedValue({}),
      pause: vi.fn().mockResolvedValue({}),
    };
  }

  return {
    __esModule: true,
    default: SpotifyWebApiConstructor,
  };
});

// Mock environment variables
vi.stubEnv("SPOTIFY_CLIENT_ID", "test-client-id");
vi.stubEnv("SPOTIFY_CLIENT_SECRET", "test-client-secret");
vi.stubEnv("SPOTIFY_REDIRECT_URI", "http://localhost:3000/api/auth/callback");

describe("SpotifyClient", () => {
  let spotifyClient: SpotifyClient;

  beforeEach(() => {
    spotifyClient = new SpotifyClient("test-access-token");
  });

  it("should initialize correctly with access token", () => {
    expect(spotifyClient).toBeDefined();
  });

  it("should get current user profile", async () => {
    const user = await spotifyClient.getCurrentUser();
    expect(user).toBeDefined();
    expect(user.id).toBe("test-user-id");
    expect(user.display_name).toBe("Test User");
    expect(user.email).toBe("test@example.com");
  });

  it("should search for tracks", async () => {
    const searchResult = await spotifyClient.searchTracks("test query");
    expect(searchResult).toBeDefined();
    expect(searchResult.tracks.items.length).toBe(1);
    expect(searchResult.tracks.items[0].name).toBe("Test Track");
  });

  it("should get track by ID", async () => {
    const track = await spotifyClient.getTrack("track-id-1");
    expect(track).toBeDefined();
    expect(track.id).toBe("track-id-1");
    expect(track.name).toBe("Test Track");
  });

  it("should get playlist tracks", async () => {
    const tracks = await spotifyClient.getPlaylistTracks("playlist-id-1");
    expect(tracks).toBeDefined();
    expect(tracks.length).toBe(1);
    expect(tracks[0].name).toBe("Test Track");
  });

  it("should play a track", async () => {
    await expect(
      spotifyClient.playTrack("spotify:track:track-id-1")
    ).resolves.not.toThrow();
  });

  it("should pause playback", async () => {
    await expect(spotifyClient.pause()).resolves.not.toThrow();
  });

  it("should create an authenticated client", async () => {
    // Test the getAuthenticatedSpotifyClient function
    // This requires proper mocking of auth() from @/app/lib/auth
    const { getAuthenticatedSpotifyClient } = await import(
      "@/app/lib/spotify-client"
    );
    const client = await getAuthenticatedSpotifyClient();
    expect(client).toBeDefined();
  });
});
