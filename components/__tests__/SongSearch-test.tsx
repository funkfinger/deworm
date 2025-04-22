import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import SongSearchAutocomplete from "../spotify/SongSearchAutocomplete";
import { SpotifyTrack } from "@/utils/auth/spotify";

// Mock data for testing
const mockTracks: SpotifyTrack[] = [
  {
    id: "1",
    name: "Bohemian Rhapsody",
    artists: [{ name: "Queen" }],
    album: {
      name: "A Night at the Opera",
      images: [{ url: "https://example.com/album1.jpg" }],
    },
    uri: "spotify:track:1",
  },
  {
    id: "2",
    name: "Stairway to Heaven",
    artists: [{ name: "Led Zeppelin" }],
    album: {
      name: "Led Zeppelin IV",
      images: [{ url: "https://example.com/album2.jpg" }],
    },
    uri: "spotify:track:2",
  },
];

describe("Song Search Autocomplete", () => {
  it("renders loading state correctly", () => {
    const { getByText } = render(
      <SongSearchAutocomplete
        tracks={[]}
        isLoading={true}
        onSelectTrack={jest.fn()}
        visible={true}
      />
    );

    expect(getByText("Searching...")).toBeTruthy();
  });

  it("renders track list correctly", () => {
    const { getByText } = render(
      <SongSearchAutocomplete
        tracks={mockTracks}
        isLoading={false}
        onSelectTrack={jest.fn()}
        visible={true}
      />
    );

    expect(getByText("Bohemian Rhapsody")).toBeTruthy();
    expect(getByText("Queen")).toBeTruthy();
    expect(getByText("Stairway to Heaven")).toBeTruthy();
    expect(getByText("Led Zeppelin")).toBeTruthy();
  });

  it("calls onSelectTrack when a track is selected", () => {
    const mockOnSelectTrack = jest.fn();
    const { getByText } = render(
      <SongSearchAutocomplete
        tracks={mockTracks}
        isLoading={false}
        onSelectTrack={mockOnSelectTrack}
        visible={true}
      />
    );

    fireEvent.press(getByText("Bohemian Rhapsody"));
    expect(mockOnSelectTrack).toHaveBeenCalledWith(mockTracks[0]);
  });

  it("renders nothing when visible is false", () => {
    const { queryByTestId } = render(
      <SongSearchAutocomplete
        tracks={mockTracks}
        isLoading={false}
        onSelectTrack={jest.fn()}
        visible={false}
      />
    );

    expect(queryByTestId("song-autocomplete")).toBeNull();
  });

  it("renders no results message when tracks array is empty", () => {
    const { getByText } = render(
      <SongSearchAutocomplete
        tracks={[]}
        isLoading={false}
        onSelectTrack={jest.fn()}
        visible={true}
      />
    );

    expect(getByText("No songs found")).toBeTruthy();
  });
});
