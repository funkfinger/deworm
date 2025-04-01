import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(({ icon, ...props }) => (
    <span data-testid={`icon-${icon.iconName}`} {...props} />
  )),
}));

// Sample track data for tests
const mockTrack = {
  id: "track-123",
  name: "Test Track",
  artists: [
    {
      id: "artist-123",
      name: "Test Artist",
      external_urls: { spotify: "https://spotify.com/artist/123" },
    },
  ],
  album: {
    id: "album-123",
    name: "Test Album",
    images: [{ url: "test-image.jpg", height: 300, width: 300 }],
    release_date: "2023-01-01",
    external_urls: { spotify: "https://spotify.com/album/123" },
  },
  external_urls: { spotify: "https://spotify.com/track/123" },
  uri: "spotify:track:track-123",
  duration_ms: 180000,
  preview_url: "https://test-preview-url.com",
};

// Types for Spotify Player callbacks
interface SpotifyCallbackData {
  device_id?: string;
  paused?: boolean;
  position?: number;
  track_window?: {
    current_track: {
      id: string;
      uri: string;
      name: string;
      duration_ms: number;
      artists: Array<{
        uri: string;
        name: string;
      }>;
      album: {
        uri: string;
        name: string;
        images: Array<{ url: string; height: number; width: number }>;
      };
    };
  };
  [key: string]: unknown;
}

type SpotifyCallback = (data: SpotifyCallbackData) => void;

// Define type for global Spotify object
interface SpotifyPlayer {
  Player: (options: Record<string, unknown>) => MockPlayer;
  lastOptions?: Record<string, unknown>;
}

// Extending the global Window object
declare global {
  interface Window {
    Spotify?: SpotifyPlayer;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

// For direct access to global
interface GlobalWithSpotify extends NodeJS.Global {
  Spotify?: SpotifyPlayer;
  onSpotifyWebPlaybackSDKReady?: () => void;
}

// Mock the Spotify SDK
class MockPlayer {
  callbacks: Record<string, SpotifyCallback> = {};
  connected = false;

  connect = vi.fn().mockImplementation(() => {
    this.connected = true;
    return Promise.resolve(true);
  });

  disconnect = vi.fn();

  addListener = vi
    .fn()
    .mockImplementation((event: string, callback: SpotifyCallback) => {
      this.callbacks[event] = callback;
    });

  removeListener = vi.fn();

  togglePlay = vi.fn().mockResolvedValue(undefined);

  nextTrack = vi.fn().mockResolvedValue(undefined);

  previousTrack = vi.fn().mockResolvedValue(undefined);

  setVolume = vi.fn().mockResolvedValue(undefined);

  // Helper to trigger events for testing
  triggerEvent(eventName: string, data: SpotifyCallbackData) {
    if (this.callbacks[eventName]) {
      this.callbacks[eventName](data);
    }
  }
}

describe("SpotifyPlayer Component", () => {
  let mockSpotifyPlayer: MockPlayer;

  // Setup the global Spotify SDK mock
  beforeEach(() => {
    mockSpotifyPlayer = new MockPlayer();

    // Mock the global Spotify object
    (global as ExtendedGlobal).Spotify = {
      Player: vi.fn().mockImplementation((options) => {
        // Store the options for later assertions
        (global as ExtendedGlobal).Spotify!.lastOptions = options;
        return mockSpotifyPlayer;
      }),
    };

    // Mock the window.onSpotifyWebPlaybackSDKReady callback
    (global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady = null;

    // Mock document.createElement for the script tag
    const originalCreateElement = document.createElement;
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "script") {
        const scriptElement = originalCreateElement.call(document, tagName);
        // Mock the script loading by triggering the callback immediately
        setTimeout(() => {
          if ((global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady) {
            (global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady();
          }
        }, 0);
        return scriptElement;
      }
      return originalCreateElement.call(document, tagName);
    });
  });

  it("should initialize the Spotify player with access token", async () => {
    await act(async () => {
      render(<SpotifyPlayer accessToken="mock-access-token" />);
    });

    // Force the onSpotifyWebPlaybackSDKReady callback to be triggered
    await act(async () => {
      if ((global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady) {
        (global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady();
      }
    });

    // Wait for the player to be initialized
    expect((global as ExtendedGlobal).Spotify!.Player).toHaveBeenCalledWith({
      name: "DeWorm Web Player",
      getOAuthToken: expect.any(Function),
      volume: 0.5, // Default volume is 50%
    });

    expect(mockSpotifyPlayer.connect).toHaveBeenCalled();
  });

  it("should display player controls when ready", async () => {
    await act(async () => {
      render(
        <SpotifyPlayer accessToken="mock-access-token" track={mockTrack} />
      );
    });

    // Force the onSpotifyWebPlaybackSDKReady callback to be triggered
    await act(async () => {
      if ((global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady) {
        (global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady();
      }
    });

    // Initially it should show loading spinner
    expect(
      screen.getByText("", { selector: ".loading.loading-spinner" })
    ).toBeInTheDocument();

    // Trigger the ready event to indicate player is ready
    await act(async () => {
      mockSpotifyPlayer.triggerEvent("ready", { device_id: "device-123" });
      console.log("Ready with Device ID device-123");

      // Simulate player_state_changed to update the currentTrack
      mockSpotifyPlayer.triggerEvent("player_state_changed", {
        paused: true,
        position: 0,
        track_window: {
          current_track: {
            id: mockTrack.id,
            uri: mockTrack.uri,
            name: mockTrack.name,
            duration_ms: mockTrack.duration_ms,
            artists: [
              {
                uri: `spotify:artist:${mockTrack.artists[0].id}`,
                name: mockTrack.artists[0].name,
              },
            ],
            album: {
              uri: `spotify:album:${mockTrack.album.id}`,
              name: mockTrack.album.name,
              images: mockTrack.album.images,
            },
          },
        },
      });
    });

    // Now we should see the track information
    expect(screen.getByText(mockTrack.name)).toBeInTheDocument();
    expect(screen.getByText(mockTrack.artists[0].name)).toBeInTheDocument();

    // And player controls should be visible
    expect(screen.getByTestId("playPauseButton")).toBeInTheDocument();
    expect(screen.getByTestId("icon-play")).toBeInTheDocument();
  });

  it("should handle play/pause functionality", async () => {
    await act(async () => {
      render(
        <SpotifyPlayer accessToken="mock-access-token" track={mockTrack} />
      );
    });

    // Force the onSpotifyWebPlaybackSDKReady callback to be triggered
    await act(async () => {
      if ((global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady) {
        (global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady();
      }
    });

    await act(async () => {
      mockSpotifyPlayer.triggerEvent("ready", { device_id: "device-123" });
      console.log("Ready with Device ID device-123");

      // Set initial player state (paused)
      mockSpotifyPlayer.triggerEvent("player_state_changed", {
        paused: true,
        position: 0,
        track_window: {
          current_track: {
            id: mockTrack.id,
            uri: mockTrack.uri,
            name: mockTrack.name,
            duration_ms: mockTrack.duration_ms,
            artists: [
              {
                uri: `spotify:artist:${mockTrack.artists[0].id}`,
                name: mockTrack.artists[0].name,
              },
            ],
            album: {
              uri: `spotify:album:${mockTrack.album.id}`,
              name: mockTrack.album.name,
              images: mockTrack.album.images,
            },
          },
        },
      });
    });

    // Wait for UI to update
    await screen.findByTestId("playPauseButton");

    // Play button should be visible first
    expect(screen.getByTestId("icon-play")).toBeInTheDocument();

    // Click the play button
    await act(async () => {
      fireEvent.click(screen.getByTestId("playPauseButton"));
    });

    expect(mockSpotifyPlayer.togglePlay).toHaveBeenCalled();

    // Simulate playing state
    await act(async () => {
      mockSpotifyPlayer.triggerEvent("player_state_changed", {
        paused: false,
        position: 0,
        track_window: {
          current_track: {
            id: mockTrack.id,
            uri: mockTrack.uri,
            name: mockTrack.name,
            duration_ms: mockTrack.duration_ms,
            artists: [
              {
                uri: `spotify:artist:${mockTrack.artists[0].id}`,
                name: mockTrack.artists[0].name,
              },
            ],
            album: {
              uri: `spotify:album:${mockTrack.album.id}`,
              name: mockTrack.album.name,
              images: mockTrack.album.images,
            },
          },
        },
      });
    });

    // Now pause icon should be visible
    await screen.findByTestId("icon-pause");
    expect(screen.getByTestId("icon-pause")).toBeInTheDocument();
  });

  it("should handle volume changes", async () => {
    await act(async () => {
      render(
        <SpotifyPlayer accessToken="mock-access-token" track={mockTrack} />
      );
    });

    // Force the onSpotifyWebPlaybackSDKReady callback to be triggered
    await act(async () => {
      if ((global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady) {
        (global as ExtendedGlobal).onSpotifyWebPlaybackSDKReady();
      }
    });

    await act(async () => {
      mockSpotifyPlayer.triggerEvent("ready", { device_id: "device-123" });
      console.log("Ready with Device ID device-123");

      // Set initial player state
      mockSpotifyPlayer.triggerEvent("player_state_changed", {
        paused: true,
        position: 0,
        track_window: {
          current_track: {
            id: mockTrack.id,
            uri: mockTrack.uri,
            name: mockTrack.name,
            duration_ms: mockTrack.duration_ms,
            artists: [
              {
                uri: `spotify:artist:${mockTrack.artists[0].id}`,
                name: mockTrack.artists[0].name,
              },
            ],
            album: {
              uri: `spotify:album:${mockTrack.album.id}`,
              name: mockTrack.album.name,
              images: mockTrack.album.images,
            },
          },
        },
      });
    });

    // Wait for UI to update and volume slider to be available
    await screen.findByTestId("volumeSlider");

    // Volume slider should be visible
    const volumeSlider = screen.getByTestId("volumeSlider");
    expect(volumeSlider).toBeInTheDocument();

    // Change volume
    await act(async () => {
      fireEvent.change(volumeSlider, { target: { value: "75" } });
    });

    expect(mockSpotifyPlayer.setVolume).toHaveBeenCalledWith(0.75);
  });
});
