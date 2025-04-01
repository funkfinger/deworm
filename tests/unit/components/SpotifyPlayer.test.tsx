import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
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

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume: number;
}

interface SpotifyPlayerInstance {
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  addListener(eventName: string, callback: (state: SpotifyState) => void): void;
  removeListener(
    eventName: string,
    callback: (state: SpotifyState) => void
  ): void;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  setVolume(volume: number): Promise<void>;
}

// Extend the Window interface
declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    Spotify?: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayerInstance;
    };
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}

interface SpotifyState {
  track_window?: {
    current_track?: {
      id?: string;
      name: string;
      artists: { name: string; uri?: string }[];
      uri?: string;
      duration_ms?: number;
      album?: {
        name?: string;
        uri?: string;
        images?: { url: string }[];
      };
    };
  };
  paused?: boolean;
  device_id?: string;
  position?: number;
}

class MockPlayer implements SpotifyPlayerInstance {
  private connected = false;
  private volume = 1;
  private deviceId = "device-123";
  private listeners: { [key: string]: ((state: SpotifyState) => void)[] } = {};

  constructor() {
    this.connect = vi.fn(
      this.connect.bind(this)
    ) as unknown as typeof this.connect;
    this.disconnect = vi.fn(
      this.disconnect.bind(this)
    ) as unknown as typeof this.disconnect;
    this.addListener = vi.fn(
      this.addListener.bind(this)
    ) as unknown as typeof this.addListener;
    this.removeListener = vi.fn(
      this.removeListener.bind(this)
    ) as unknown as typeof this.removeListener;
    this.togglePlay = vi.fn(
      this.togglePlay.bind(this)
    ) as unknown as typeof this.togglePlay;
    this.nextTrack = vi.fn(
      this.nextTrack.bind(this)
    ) as unknown as typeof this.nextTrack;
    this.previousTrack = vi.fn(
      this.previousTrack.bind(this)
    ) as unknown as typeof this.previousTrack;
    this.setVolume = vi.fn(
      this.setVolume.bind(this)
    ) as unknown as typeof this.setVolume;
  }

  connect(): Promise<boolean> {
    this.connected = true;
    console.log("The Web Playback SDK successfully connected to Spotify!");
    return Promise.resolve(true);
  }

  disconnect(): Promise<void> {
    this.connected = false;
    return Promise.resolve();
  }

  addListener(
    eventName: string,
    callback: (state: SpotifyState) => void
  ): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  removeListener(
    eventName: string,
    callback: (state: SpotifyState) => void
  ): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }

  togglePlay(): Promise<void> {
    return Promise.resolve();
  }

  nextTrack(): Promise<void> {
    return Promise.resolve();
  }

  previousTrack(): Promise<void> {
    return Promise.resolve();
  }

  setVolume(volume: number): Promise<void> {
    this.volume = volume;
    return Promise.resolve();
  }

  triggerEvent(eventName: string, state: SpotifyState): void {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => callback(state));
    }
  }
}

describe("SpotifyPlayer Component", () => {
  let mockSpotifyPlayer: MockPlayer;

  // Setup the global Spotify SDK mock
  beforeEach(() => {
    mockSpotifyPlayer = new MockPlayer();

    // Reset the mock
    vi.resetAllMocks();

    // Mock the Spotify SDK
    // @ts-expect-error - Global Spotify mock for testing
    global.Spotify = {
      Player: vi.fn().mockImplementation((options) => {
        // Store the options for later assertions
        // @ts-expect-error - Global Spotify mock for testing
        if (global.Spotify) {
          // @ts-expect-error - Global Spotify mock for testing
          global.Spotify.lastOptions = options;
        }
        return mockSpotifyPlayer;
      }),
    };

    // Mock the window.onSpotifyWebPlaybackSDKReady callback
    // @ts-expect-error - Global callback mock for testing
    global.onSpotifyWebPlaybackSDKReady = undefined;

    // Mock document.createElement for the script tag
    const originalCreateElement = document.createElement;
    vi.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "script") {
        const scriptElement = originalCreateElement.call(document, tagName);
        // Mock the script loading by triggering the callback immediately
        setTimeout(() => {
          // @ts-expect-error - Global callback mock for testing
          if (global.onSpotifyWebPlaybackSDKReady) {
            // @ts-expect-error - Global callback mock for testing
            global.onSpotifyWebPlaybackSDKReady();
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
      // @ts-expect-error - Global callback mock for testing
      if (global.onSpotifyWebPlaybackSDKReady) {
        // @ts-expect-error - Global callback mock for testing
        global.onSpotifyWebPlaybackSDKReady();
      }
    });

    // Wait for the player to be initialized
    // @ts-expect-error - Global Spotify mock for testing
    expect(global.Spotify?.Player).toHaveBeenCalledWith({
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
      // @ts-expect-error - Global callback mock for testing
      if (global.onSpotifyWebPlaybackSDKReady) {
        // @ts-expect-error - Global callback mock for testing
        global.onSpotifyWebPlaybackSDKReady();
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
      // @ts-expect-error - Global callback mock for testing
      if (global.onSpotifyWebPlaybackSDKReady) {
        // @ts-expect-error - Global callback mock for testing
        global.onSpotifyWebPlaybackSDKReady();
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
      // @ts-expect-error - Global callback mock for testing
      if (global.onSpotifyWebPlaybackSDKReady) {
        // @ts-expect-error - Global callback mock for testing
        global.onSpotifyWebPlaybackSDKReady();
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
