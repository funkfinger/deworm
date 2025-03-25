"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";
import { searchSpotifyTracks } from "@/app/lib/client-actions";

// Types for Spotify API responses
type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

type SpotifyArtist = {
  id: string;
  name: string;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  uri: string;
  album: {
    name: string;
    images: SpotifyImage[];
  };
  artists: SpotifyArtist[];
  duration_ms: number;
};

export interface SearchAutocompleteProps {
  onTrackSelected: (track: SpotifyTrack) => void;
}

export default function SearchAutocomplete({
  onTrackSelected,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use debounced value to prevent too many API calls
  const debouncedSearchTerm = useDebounce(query, 500);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Perform search when debounced query changes
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await searchSpotifyTracks(debouncedSearchTerm, 5);

        // Check if data and tracks exist before setting results
        if (data && data.tracks && Array.isArray(data.tracks.items)) {
          setResults(data.tracks.items);
        } else {
          // Handle case where response structure is unexpected
          console.error("Unexpected response structure:", data);
          setError("Invalid response from Spotify API. Please try again.");
        }
      } catch (err) {
        console.error("Error searching tracks:", err);
        setError("Failed to search tracks. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearchTerm]);

  // Format track duration from milliseconds to minutes:seconds
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get album image URL from track
  const getAlbumImage = (track: SpotifyTrack) => {
    if (track.album.images && track.album.images.length > 0) {
      // Get smallest image for the dropdown
      return track.album.images[track.album.images.length - 1]?.url;
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleTrackClick = (track: SpotifyTrack) => {
    onTrackSelected(track);
    setIsFocused(false);
    setQuery("");
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="input-group w-full">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Type to search for songs..."
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
        />
      </div>

      {isFocused && (query || isLoading) && (
        <div className="absolute z-10 w-full mt-1 bg-base-200 shadow-lg rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 flex justify-center">
              <span
                className="loading loading-spinner loading-md"
                data-testid="loading-spinner"
              ></span>
            </div>
          ) : error ? (
            <div className="p-4 text-error">{error}</div>
          ) : results.length > 0 ? (
            <ul>
              {results.map((track) => (
                <li
                  key={track.id}
                  className="p-2 hover:bg-base-300 cursor-pointer"
                  onClick={() => handleTrackClick(track)}
                >
                  <div className="flex items-center gap-2">
                    {getAlbumImage(track) && (
                      <img
                        src={getAlbumImage(track) || ""}
                        alt=""
                        className="w-10 h-10 rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{track.name}</p>
                      <p className="text-sm opacity-70 truncate">
                        {track.artists.map((a) => a.name).join(", ")}
                      </p>
                    </div>
                    <div className="text-xs opacity-50">
                      {formatDuration(track.duration_ms)}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : query ? (
            <div className="p-4 text-center opacity-70">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
