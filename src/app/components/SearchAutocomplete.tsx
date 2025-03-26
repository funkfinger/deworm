"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/app/hooks/useDebounce";
import { searchSpotifyTracks } from "@/app/lib/client-actions";
import type { SpotifyTrack } from "@/app/lib/spotify";

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
          placeholder="start typing to search for your earworm"
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
          ) : (
            <ul>
              {results.map((track) => (
                <li key={track.id} className="p-2 hover:bg-base-300">
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
                    <button
                      onClick={() => handleTrackClick(track)}
                      className="btn btn-sm btn-primary"
                    >
                      UGH! MY WORM!
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
