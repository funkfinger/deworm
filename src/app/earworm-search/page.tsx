"use client";

import ChatBubble from "@/app/components/ChatBubble";
import Mascot from "@/app/components/Mascot";
import SpotifySearchInput from "@/app/components/SpotifySearchInput";
import SpotifyTrackCard from "@/app/components/SpotifyTrackCard";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useSpotifySession } from "@/app/lib/auth-client";
import { useOptimizedSearch } from "@/app/lib/search-utils";
import type { SpotifySearchResult, SpotifyTrack } from "@/app/models/spotify";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function EarwormSearchPage() {
  const { isAuthenticated, isLoading } = useSpotifySession();
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Define the search function
  const performSearch = useCallback(async (query: string): Promise<void> => {
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to search");
      }

      const data = (await response.json()) as SpotifySearchResult;
      setSearchResults(data.tracks.items);
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
      setSearchResults([]);
    }
  }, []);

  // Use the optimized search hook
  const { handleSearch, isLoading: isSearching } = useOptimizedSearch(
    performSearch,
    500, // 500ms debounce
    2, // Minimum 2 characters
    1000 // 1 second rate limit
  );

  // Handle track selection
  const handleTrackSelect = (track: SpotifyTrack): void => {
    setSelectedTrack(track);
  };

  // Get the player context at the component level
  const { initializePlayer, selectTrack } = useSpotifyPlayer();

  // Handle direct selection (UGH! My worm! button)
  const handleDirectSelect = (track: SpotifyTrack): void => {
    // Initialize the player (this counts as user interaction)
    initializePlayer()
      .then(() => {
        // Store the track information
        selectTrack(track);

        console.log("Track selected, navigating to solution page...");
        // Navigate to the solution page with the selected track
        router.push(`/earworm-solution?trackId=${track.id}&autoplay=true`);
      })
      .catch((error) => {
        console.error("Failed to initialize player:", error);
        // Navigate anyway even if initialization fails
        router.push(`/earworm-solution?trackId=${track.id}&autoplay=true`);
      });
  };

  // Handle continue to next step
  const handleContinue = (): void => {
    if (selectedTrack) {
      // In a real implementation, we would store the selected track in a global state or pass it via URL
      // For now, we'll just navigate to the next page
      router.push(`/earworm-solution?trackId=${selectedTrack.id}`);
    }
  };

  // Handle clear selection
  const handleClearSelection = (): void => {
    setSelectedTrack(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-2xl mx-auto">
        {/* Mascot with happy mood */}
        <div className="flex justify-center mb-8">
          <Mascot mood="happy" size="xl" />
        </div>

        {/* QT's message */}
        <div className="mb-12">
          <ChatBubble animate={true}>
            Great! Now let&apos;s find that nasty ear worm...
          </ChatBubble>
        </div>

        {/* Search component */}
        <div className="card w-full bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Search your earworm</h2>
            <p className="mb-4">
              Type the name of the song that's stuck in your head:
            </p>

            <SpotifySearchInput
              onSearch={handleSearch}
              onTrackSelect={handleTrackSelect}
              onDirectSelect={handleDirectSelect}
              results={searchResults}
              isLoading={isSearching}
              placeholder="What's stuck in your noggin?"
              className="mb-4"
              // Remove the internal debounce since we're using our optimized search hook
              useExternalDebounce={true}
            />

            {searchError && (
              <div
                className="alert alert-error mt-4"
                data-testid="search-error"
              >
                <span>{searchError}</span>
              </div>
            )}
          </div>
        </div>

        {/* Selected track display */}
        {selectedTrack && (
          <div
            className="card w-full bg-base-100 shadow-xl mb-8 animate-fade-in"
            data-testid="selected-track-container"
          >
            <div className="card-body">
              <h2 className="card-title">Your selected earworm:</h2>

              <SpotifyTrackCard
                track={selectedTrack}
                className="mt-2 mb-4"
                showControls={false}
              />

              <div className="flex flex-col sm:flex-row gap-2 justify-end mt-4">
                <button
                  className="btn btn-outline"
                  onClick={handleClearSelection}
                  type="button"
                  data-testid="clear-selection-button"
                >
                  Choose a different song
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handleContinue}
                  type="button"
                  data-testid="continue-button"
                >
                  This is my earworm
                  <FontAwesomeIcon icon={faArrowRight} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Back button */}
        <div className="flex justify-center mt-4">
          <button
            className="btn btn-ghost"
            onClick={() => router.push("/")}
            type="button"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
