import EarwormSolutionPage from "@/app/earworm-solution/page";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: (param: string) => {
      if (param === "trackId") return "test-track-id";
      if (param === "autoplay") return "true";
      return null;
    },
  }),
}));

// Mock the auth-client module
vi.mock("@/app/lib/auth-client", () => ({
  useSpotifySession: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock the spotify-client module
vi.mock("@/app/lib/spotify-client", () => {
  const mockTrack = {
    id: "test-track-id",
    name: "Test Track",
    artists: [{ name: "Test Artist" }],
    album: { images: [{ url: "test-image.jpg" }] },
    uri: "spotify:track:test-track-id",
  };

  const mockSpotifyClient = {
    getTrack: vi.fn().mockImplementation(() => {
      // Return a promise that resolves after a short delay
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockTrack), 10);
      });
    }),
    playTrack: vi.fn().mockResolvedValue(undefined),
  };

  return {
    getAuthenticatedSpotifyClient: vi.fn().mockResolvedValue(mockSpotifyClient),
  };
});

// Mock the SpotifyTrackCard component
vi.mock("@/app/components/SpotifyTrackCard", () => ({
  default: ({ track }: any) => (
    <div data-testid="mock-spotify-track-card">
      <div data-testid="mock-track-name">{track.name}</div>
      <div data-testid="mock-track-artist">
        {track.artists.map((a: any) => a.name).join(", ")}
      </div>
    </div>
  ),
}));

describe("EarwormSolutionPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the solution page with mascot and chat bubble", async () => {
    // Use fake timers to control async operations
    vi.useFakeTimers();

    render(<EarwormSolutionPage />);

    // Initial loading state
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Fast-forward timers to complete async operations
    await vi.runAllTimersAsync();

    // Now the content should be loaded
    expect(screen.getByTestId("mascot-container")).toBeInTheDocument();
    expect(screen.getByTestId("chat-bubble-content")).toBeInTheDocument();
    expect(screen.getByTestId("mock-spotify-track-card")).toBeInTheDocument();

    // Check solution steps are displayed
    expect(screen.getByText("Earworm Solution Steps")).toBeInTheDocument();
    expect(
      screen.getByText("Listen to your earworm completely")
    ).toBeInTheDocument();
    expect(screen.getByText("Distract yourself")).toBeInTheDocument();
    expect(screen.getByText("Replace with a new song")).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("fetches and displays the track details", async () => {
    // Use fake timers to control async operations
    vi.useFakeTimers();

    const { getAuthenticatedSpotifyClient } = await import(
      "@/app/lib/spotify-client"
    );
    const mockClient = await getAuthenticatedSpotifyClient();

    render(<EarwormSolutionPage />);

    // Verify client was requested
    expect(getAuthenticatedSpotifyClient).toHaveBeenCalled();

    // Fast-forward timers to complete async operations
    await vi.runAllTimersAsync();

    // Verify track is fetched
    expect(mockClient?.getTrack).toHaveBeenCalledWith("test-track-id");

    // Check track details
    expect(screen.getByTestId("mock-track-name")).toHaveTextContent(
      "Test Track"
    );
    expect(screen.getByTestId("mock-track-artist")).toHaveTextContent(
      "Test Artist"
    );

    vi.useRealTimers();
  });

  it("auto-plays the track when autoplay parameter is true", async () => {
    // Use fake timers to control async operations
    vi.useFakeTimers();

    const { getAuthenticatedSpotifyClient } = await import(
      "@/app/lib/spotify-client"
    );
    const mockClient = await getAuthenticatedSpotifyClient();

    render(<EarwormSolutionPage />);

    // Fast-forward timers to complete async operations
    await vi.runAllTimersAsync();

    // Verify playTrack was called
    expect(mockClient?.playTrack).toHaveBeenCalledWith(
      "spotify:track:test-track-id"
    );

    vi.useRealTimers();
  });

  it("shows error message when playback fails", async () => {
    // Use fake timers to control async operations
    vi.useFakeTimers();

    const { getAuthenticatedSpotifyClient } = await import(
      "@/app/lib/spotify-client"
    );
    const mockClient = await getAuthenticatedSpotifyClient();

    // Mock playTrack to reject
    (mockClient?.playTrack as any).mockRejectedValueOnce(
      new Error("Playback failed")
    );

    render(<EarwormSolutionPage />);

    // Fast-forward timers to complete async operations
    await vi.runAllTimersAsync();

    // Check error message
    expect(screen.getByTestId("playback-error")).toBeInTheDocument();
    expect(screen.getByTestId("playback-error")).toHaveTextContent(
      /Could not start playback/
    );

    vi.useRealTimers();
  });
});
