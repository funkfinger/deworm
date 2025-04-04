import EarwormSearchPage from "@/app/earworm-search/page";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the next/navigation module
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock the auth-client module
vi.mock("@/app/lib/auth-client", () => ({
  useSpotifySession: () => ({
    isAuthenticated: true,
    isLoading: false,
  }),
}));

// Mock the search-utils module
vi.mock("@/app/lib/search-utils", () => ({
  useOptimizedSearch: (searchFn: any) => {
    return {
      handleSearch: searchFn,
      isLoading: false,
      lastQuery: "",
    };
  },
}));

// Mock the SpotifySearchInput component
vi.mock("@/app/components/SpotifySearchInput", () => ({
  default: ({ onSearch, onTrackSelect, results, isLoading }: any) => (
    <div data-testid="mock-spotify-search">
      <input
        data-testid="mock-search-input"
        onChange={(e) => {
          if (e.target.value.length >= 2) {
            onSearch(e.target.value);
          }
        }}
      />
      <button
        data-testid="mock-search-button"
        disabled={isLoading}
        onClick={() => onSearch("test query")}
      >
        Search
      </button>
      <div data-testid="mock-results">
        {results.map((track: any) => (
          <div
            key={track.id}
            data-testid={`mock-result-${track.id}`}
            onClick={() => onTrackSelect(track)}
          >
            {track.name}
          </div>
        ))}
      </div>
    </div>
  ),
}));

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

// Mock fetch
global.fetch = vi.fn();

describe("EarwormSearchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockReset();
  });

  it("renders the search page with mascot and chat bubble", () => {
    render(<EarwormSearchPage />);

    expect(screen.getByTestId("mascot-container")).toBeInTheDocument();
    expect(screen.getByTestId("chat-bubble-content")).toBeInTheDocument();
    expect(screen.getByText(/find that nasty ear worm/i)).toBeInTheDocument();
    expect(screen.getByTestId("mock-spotify-search")).toBeInTheDocument();
  });

  it("handles search and displays results", async () => {
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [
            {
              id: "track1",
              name: "Test Track 1",
              artists: [{ name: "Test Artist 1" }],
              album: { images: [{ url: "test-image-1.jpg" }] },
            },
            {
              id: "track2",
              name: "Test Track 2",
              artists: [{ name: "Test Artist 2" }],
              album: { images: [{ url: "test-image-2.jpg" }] },
            },
          ],
        },
      }),
    });

    render(<EarwormSearchPage />);

    // Trigger search
    fireEvent.click(screen.getByTestId("mock-search-button"));

    // Verify fetch was called with correct URL
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/spotify/search?q=test%20query"
      );
    });

    // Verify results are displayed
    await waitFor(() => {
      expect(screen.getByTestId("mock-result-track1")).toBeInTheDocument();
      expect(screen.getByTestId("mock-result-track2")).toBeInTheDocument();
    });
  });

  it("handles track selection and displays the selected track", async () => {
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [
            {
              id: "track1",
              name: "Test Track 1",
              artists: [{ name: "Test Artist 1" }],
              album: { images: [{ url: "test-image-1.jpg" }] },
            },
          ],
        },
      }),
    });

    render(<EarwormSearchPage />);

    // Trigger search
    fireEvent.click(screen.getByTestId("mock-search-button"));

    // Wait for results and select a track
    await waitFor(() => {
      expect(screen.getByTestId("mock-result-track1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-result-track1"));

    // Verify selected track is displayed
    await waitFor(() => {
      expect(
        screen.getByTestId("selected-track-container")
      ).toBeInTheDocument();
      expect(screen.getByTestId("mock-track-name")).toHaveTextContent(
        "Test Track 1"
      );
      expect(screen.getByTestId("continue-button")).toBeInTheDocument();
    });
  });

  it("handles search errors correctly", async () => {
    // Mock failed fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Test error message" }),
    });

    render(<EarwormSearchPage />);

    // Trigger search
    fireEvent.click(screen.getByTestId("mock-search-button"));

    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByTestId("search-error")).toBeInTheDocument();
      expect(screen.getByTestId("search-error")).toHaveTextContent(
        "Test error message"
      );
    });
  });

  it("clears selection when the clear button is clicked", async () => {
    // Mock successful fetch response
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tracks: {
          items: [
            {
              id: "track1",
              name: "Test Track 1",
              artists: [{ name: "Test Artist 1" }],
              album: { images: [{ url: "test-image-1.jpg" }] },
            },
          ],
        },
      }),
    });

    render(<EarwormSearchPage />);

    // Trigger search
    fireEvent.click(screen.getByTestId("mock-search-button"));

    // Wait for results and select a track
    await waitFor(() => {
      expect(screen.getByTestId("mock-result-track1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-result-track1"));

    // Verify selected track is displayed
    await waitFor(() => {
      expect(
        screen.getByTestId("selected-track-container")
      ).toBeInTheDocument();
    });

    // Click clear selection button
    fireEvent.click(screen.getByTestId("clear-selection-button"));

    // Verify selected track is no longer displayed
    await waitFor(() => {
      expect(
        screen.queryByTestId("selected-track-container")
      ).not.toBeInTheDocument();
    });
  });
});
