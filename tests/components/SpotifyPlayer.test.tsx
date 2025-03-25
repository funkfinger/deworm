import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";

// Mock the Spotify SDK
const mockPlayer = {
  connect: vi.fn().mockResolvedValue(true),
  disconnect: vi.fn(),
  togglePlay: vi.fn().mockResolvedValue(undefined),
  setVolume: vi.fn().mockResolvedValue(undefined),
  addListener: vi.fn(),
  removeListener: vi.fn(),
};

// Mock the global window object
const originalWindow = { ...window };
vi.stubGlobal("Spotify", {
  Player: vi.fn().mockImplementation(() => mockPlayer),
});

// Mock document.createElement to track script creation
document.createElement = vi.fn().mockImplementation((tagName) => {
  if (tagName === "script") {
    const scriptElement = originalWindow.document.createElement(tagName);
    // Simulate script loaded event
    setTimeout(() => {
      window.onSpotifyWebPlaybackSDKReady();
    }, 0);
    return scriptElement;
  }
  return originalWindow.document.createElement(tagName);
});

describe("SpotifyPlayer", () => {
  const mockAccessToken = "mock-access-token";
  const mockTrackUri = "spotify:track:1234567890";

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset all mocked functions
    mockPlayer.connect.mockResolvedValue(true);
    mockPlayer.togglePlay.mockResolvedValue(undefined);

    // Reset listeners
    const listeners: Record<string, Array<(data: any) => void>> = {};
    mockPlayer.addListener.mockImplementation((event, callback) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    });

    // Helper function to trigger listeners
    (window as any).triggerSpotifyEvent = (event: string, data: any) => {
      if (listeners[event]) {
        listeners[event].forEach((callback) => callback(data));
      }
    };
  });

  it("renders the player in loading state initially", () => {
    render(
      <SpotifyPlayer accessToken={mockAccessToken} trackUri={mockTrackUri} />
    );

    // Should show loading state
    expect(screen.getByTestId("player-skeleton")).toBeInTheDocument();
  });

  it("initializes the Spotify player with the correct parameters", () => {
    render(
      <SpotifyPlayer accessToken={mockAccessToken} trackUri={mockTrackUri} />
    );

    // Player constructor should be called with the right params
    expect(window.Spotify.Player).toHaveBeenCalledWith({
      name: "Deworm Web Player",
      getOAuthToken: expect.any(Function),
      volume: 0.5,
    });

    // Connect should be called
    expect(mockPlayer.connect).toHaveBeenCalled();
  });

  it("plays a track when trackUri is provided and player is ready", () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    render(
      <SpotifyPlayer accessToken={mockAccessToken} trackUri={mockTrackUri} />
    );

    // Trigger the ready event
    (window as any).triggerSpotifyEvent("ready", {
      device_id: "mock-device-id",
    });

    // Fetch should be called to play the track
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "https://api.spotify.com/v1/me/player/play?device_id=mock-device-id"
      ),
      expect.objectContaining({
        method: "PUT",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: `Bearer ${mockAccessToken}`,
        }),
      })
    );
  });

  it("toggles playback when play/pause button is clicked", () => {
    render(
      <SpotifyPlayer accessToken={mockAccessToken} trackUri={mockTrackUri} />
    );

    // Trigger ready event to enable buttons
    (window as any).triggerSpotifyEvent("ready", {
      device_id: "mock-device-id",
    });

    // Click the play button (initially in play state)
    fireEvent.click(screen.getByTestId("play-pause-button"));

    // Should call togglePlay
    expect(mockPlayer.togglePlay).toHaveBeenCalled();
  });

  it("toggles mute when mute button is clicked", () => {
    render(
      <SpotifyPlayer accessToken={mockAccessToken} trackUri={mockTrackUri} />
    );

    // Trigger ready event to enable buttons
    (window as any).triggerSpotifyEvent("ready", {
      device_id: "mock-device-id",
    });

    // Click the mute button
    fireEvent.click(screen.getByTestId("mute-button"));

    // Should call setVolume with 0
    expect(mockPlayer.setVolume).toHaveBeenCalledWith(0);
  });

  it("displays error message when player initialization fails", () => {
    render(
      <SpotifyPlayer accessToken={mockAccessToken} trackUri={mockTrackUri} />
    );

    // Trigger initialization error
    (window as any).triggerSpotifyEvent("initialization_error", {
      message: "Failed to initialize",
    });

    // Error message should be displayed
    expect(
      screen.getByText("Player initialization failed: Failed to initialize")
    ).toBeInTheDocument();
  });

  it("calls onPlayerReady when player is ready", () => {
    const onPlayerReady = vi.fn();

    render(
      <SpotifyPlayer
        accessToken={mockAccessToken}
        trackUri={mockTrackUri}
        onPlayerReady={onPlayerReady}
      />
    );

    // Trigger ready event
    (window as any).triggerSpotifyEvent("ready", {
      device_id: "mock-device-id",
    });

    // onPlayerReady should be called
    expect(onPlayerReady).toHaveBeenCalled();
  });
});
