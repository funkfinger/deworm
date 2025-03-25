import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import SearchAutocomplete, {
  SpotifyTrack,
} from "@/app/components/SearchAutocomplete";
import * as actions from "@/app/lib/client-actions";

// Mock the API call
vi.mock("@/app/lib/client-actions", () => ({
  searchSpotifyTracks: vi.fn(),
}));

// Mock the useDebounce hook
vi.mock("@/app/hooks/useDebounce", () => ({
  useDebounce: (value: string) => value, // Return value immediately for testing
}));

describe("SearchAutocomplete", () => {
  const mockTrack: SpotifyTrack = {
    id: "123",
    name: "Test Track",
    uri: "spotify:track:123",
    album: {
      name: "Test Album",
      images: [
        { url: "https://example.com/image.jpg", height: 300, width: 300 },
      ],
    },
    artists: [{ id: "456", name: "Test Artist" }],
    duration_ms: 180000,
  };

  const mockResults = {
    tracks: {
      items: [mockTrack],
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the search input correctly", () => {
    const handleTrackSelected = vi.fn();
    render(<SearchAutocomplete onTrackSelected={handleTrackSelected} />);

    expect(
      screen.getByPlaceholderText("Type to search for songs...")
    ).toBeInTheDocument();
  });

  it("displays loading state when searching", async () => {
    // Mock the search API to delay response
    vi.mocked(actions.searchSpotifyTracks).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockResults), 100);
        })
    );

    const handleTrackSelected = vi.fn();
    render(<SearchAutocomplete onTrackSelected={handleTrackSelected} />);

    const input = screen.getByPlaceholderText("Type to search for songs...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "test" } });

    // Loading state should appear
    await waitFor(() => {
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  it("displays search results when API returns data", async () => {
    // Mock the search API to return results
    vi.mocked(actions.searchSpotifyTracks).mockResolvedValue(mockResults);

    const handleTrackSelected = vi.fn();
    render(<SearchAutocomplete onTrackSelected={handleTrackSelected} />);

    const input = screen.getByPlaceholderText("Type to search for songs...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "test" } });

    // Results should appear
    await waitFor(() => {
      expect(screen.getByText("Test Track")).toBeInTheDocument();
      expect(screen.getByText("Test Artist")).toBeInTheDocument();
    });
  });

  it("calls onTrackSelected when a track is clicked", async () => {
    // Mock the search API to return results
    vi.mocked(actions.searchSpotifyTracks).mockResolvedValue(mockResults);

    const handleTrackSelected = vi.fn();
    render(<SearchAutocomplete onTrackSelected={handleTrackSelected} />);

    const input = screen.getByPlaceholderText("Type to search for songs...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "test" } });

    // Wait for results and click a track
    await waitFor(() => {
      expect(screen.getByText("Test Track")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Test Track"));

    // Check that the handler was called with the mock track
    expect(handleTrackSelected).toHaveBeenCalledWith(mockTrack);
  });

  it("displays error message when API fails", async () => {
    // Mock the search API to throw an error
    vi.mocked(actions.searchSpotifyTracks).mockRejectedValue(
      new Error("API Error")
    );

    const handleTrackSelected = vi.fn();
    render(<SearchAutocomplete onTrackSelected={handleTrackSelected} />);

    const input = screen.getByPlaceholderText("Type to search for songs...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "test" } });

    // Error message should appear
    await waitFor(() => {
      expect(
        screen.getByText("Failed to search tracks. Please try again.")
      ).toBeInTheDocument();
    });
  });
});
