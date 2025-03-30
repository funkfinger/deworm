import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SpotifySearchInput from "@/app/components/SpotifySearchInput";
import { SpotifyTrack } from "@/app/models/spotify";

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(({ icon }) => (
    <div data-testid={`icon-${icon.iconName}`} />
  )),
}));

describe("SpotifySearchInput Component", () => {
  const mockResults: SpotifyTrack[] = [
    {
      id: "track1",
      name: "Test Track 1",
      artists: [
        {
          id: "artist1",
          name: "Test Artist 1",
          external_urls: { spotify: "test-url" },
        },
      ],
      album: {
        id: "album1",
        name: "Test Album 1",
        images: [{ url: "test-image-1.jpg", height: 300, width: 300 }],
        release_date: "2022-01-01",
        external_urls: { spotify: "test-url" },
      },
      external_urls: { spotify: "test-url" },
      uri: "spotify:track:track1",
      duration_ms: 180000,
      preview_url: "test-preview-url",
    },
    {
      id: "track2",
      name: "Test Track 2",
      artists: [
        {
          id: "artist2",
          name: "Test Artist 2",
          external_urls: { spotify: "test-url" },
        },
      ],
      album: {
        id: "album2",
        name: "Test Album 2",
        images: [{ url: "test-image-2.jpg", height: 300, width: 300 }],
        release_date: "2022-01-01",
        external_urls: { spotify: "test-url" },
      },
      external_urls: { spotify: "test-url" },
      uri: "spotify:track:track2",
      duration_ms: 180000,
      preview_url: "test-preview-url",
    },
  ];

  const mockOnSearch = vi.fn().mockResolvedValue(undefined);
  const mockOnTrackSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render with placeholder text", () => {
    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={[]}
      />
    );

    expect(screen.getByTestId("spotify-search")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("What's stuck in your noggin?")
    ).toBeInTheDocument();
  });

  it("should allow custom placeholder text", () => {
    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={[]}
        placeholder="Custom placeholder"
      />
    );

    expect(
      screen.getByPlaceholderText("Custom placeholder")
    ).toBeInTheDocument();
  });

  it("should call onSearch when typing (debounced)", async () => {
    vi.useFakeTimers();

    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={[]}
      />
    );

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "test query" } });

    expect(mockOnSearch).not.toHaveBeenCalled();

    vi.advanceTimersByTime(600); // More than the 500ms debounce

    expect(mockOnSearch).toHaveBeenCalledWith("test query");

    vi.useRealTimers();
  });

  it("should not call onSearch if query is less than 2 characters", async () => {
    vi.useFakeTimers();

    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={[]}
      />
    );

    const input = screen.getByTestId("search-input");
    fireEvent.change(input, { target: { value: "a" } });

    vi.advanceTimersByTime(600);

    expect(mockOnSearch).not.toHaveBeenCalled();

    vi.useRealTimers();
  });

  it("should show loading state", () => {
    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={[]}
        isLoading={true}
      />
    );

    expect(screen.getByTestId("icon-spinner")).toBeInTheDocument();
  });

  it("should show search results when available", async () => {
    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={mockResults}
        initialValue="test"
      />
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);

    await waitFor(() => {
      expect(screen.getByTestId("search-results")).toBeInTheDocument();
      expect(screen.getByTestId("result-track1")).toBeInTheDocument();
      expect(screen.getByTestId("result-track2")).toBeInTheDocument();
      expect(screen.getByText("Test Track 1")).toBeInTheDocument();
      expect(screen.getByText("Test Track 2")).toBeInTheDocument();
    });
  });

  it("should call onTrackSelect when a result is clicked", async () => {
    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={mockResults}
        initialValue="test"
      />
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);

    await waitFor(() => {
      const result = screen.getByTestId("result-track1");
      fireEvent.click(result);
    });

    expect(mockOnTrackSelect).toHaveBeenCalledWith(mockResults[0]);
  });

  it("should show no results message when appropriate", () => {
    render(
      <SpotifySearchInput
        onSearch={mockOnSearch}
        onTrackSelect={mockOnTrackSelect}
        results={[]}
        initialValue="test query"
      />
    );

    const input = screen.getByTestId("search-input");
    fireEvent.focus(input);

    expect(screen.getByTestId("no-results")).toBeInTheDocument();
    expect(screen.getByText(/No songs found matching/)).toBeInTheDocument();
  });
});
