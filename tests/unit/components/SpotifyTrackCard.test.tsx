import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";
import SpotifyTrackCard from "@/app/components/SpotifyTrackCard";
import type { SpotifyTrack } from "@/app/models/spotify";

// Mock FontAwesome
vi.mock("@fortawesome/react-fontawesome", () => ({
  FontAwesomeIcon: vi.fn(({ icon }) => (
    <div data-testid={`icon-${icon.iconName}`} />
  )),
}));

describe("SpotifyTrackCard Component", () => {
  const mockTrack: SpotifyTrack = {
    id: "track-id-1",
    name: "Test Track",
    artists: [
      {
        id: "artist-id-1",
        name: "Test Artist",
        external_urls: { spotify: "https://spotify.com/artist/1" },
      },
    ],
    album: {
      id: "album-id-1",
      name: "Test Album",
      images: [{ url: "test-image-url", height: 300, width: 300 }],
      release_date: "2022-01-01",
      external_urls: { spotify: "https://spotify.com/album/1" },
    },
    external_urls: { spotify: "https://spotify.com/track/1" },
    uri: "spotify:track:track-id-1",
    duration_ms: 180000,
    preview_url: "https://test-preview-url.com",
  };

  it("should render track information correctly", () => {
    render(<SpotifyTrackCard track={mockTrack} />);

    expect(screen.getByTestId("spotify-track-card")).toBeInTheDocument();
    expect(screen.getByTestId("track-title")).toHaveTextContent("Test Track");
    expect(screen.getByTestId("track-artist")).toHaveTextContent("Test Artist");
    expect(screen.getByTestId("track-duration")).toHaveTextContent("3:00");
    expect(screen.getByTestId("track-image")).toHaveAttribute(
      "src",
      "test-image-url"
    );
  });

  it("should show play button when onPlayPause is provided", () => {
    const handlePlayPause = vi.fn();
    render(
      <SpotifyTrackCard track={mockTrack} onPlayPause={handlePlayPause} />
    );

    expect(screen.getByTestId("play-pause-button")).toBeInTheDocument();
    expect(screen.getByTestId("icon-play")).toBeInTheDocument();
  });

  it("should show pause button when isPlaying is true", () => {
    const handlePlayPause = vi.fn();
    render(
      <SpotifyTrackCard
        track={mockTrack}
        isPlaying={true}
        onPlayPause={handlePlayPause}
      />
    );

    expect(screen.getByTestId("play-pause-button")).toBeInTheDocument();
    expect(screen.getByTestId("icon-pause")).toBeInTheDocument();
  });

  it("should call onPlayPause when play/pause button is clicked", () => {
    const handlePlayPause = vi.fn();
    render(
      <SpotifyTrackCard track={mockTrack} onPlayPause={handlePlayPause} />
    );

    fireEvent.click(screen.getByTestId("play-pause-button"));
    expect(handlePlayPause).toHaveBeenCalledTimes(1);
  });

  it("should apply selected styling when isSelected is true", () => {
    render(<SpotifyTrackCard track={mockTrack} isSelected={true} />);

    expect(screen.getByTestId("spotify-track-card")).toHaveClass("border-2");
    expect(screen.getByTestId("spotify-track-card")).toHaveClass(
      "border-primary"
    );
  });

  it("should call onClick when card is clicked", () => {
    const handleClick = vi.fn();
    render(<SpotifyTrackCard track={mockTrack} onClick={handleClick} />);

    // Find the hidden button that covers the card and click it
    const cardButton = screen.getByLabelText(
      "Select Test Track by Test Artist"
    );
    fireEvent.click(cardButton);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not show controls when showControls is false", () => {
    const handlePlayPause = vi.fn();
    render(
      <SpotifyTrackCard
        track={mockTrack}
        onPlayPause={handlePlayPause}
        showControls={false}
      />
    );

    expect(screen.queryByTestId("play-pause-button")).not.toBeInTheDocument();
  });
});
