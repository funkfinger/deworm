"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";
import SearchAutocomplete from "@/app/components/SearchAutocomplete";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";
import { searchSpotifyTracks } from "@/app/lib/client-actions";
import { getAccessToken } from "@/app/lib/client-session";

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

type SpotifyTrack = {
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

interface SearchResults {
  tracks: {
    items: SpotifyTrack[];
  };
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [earwormTrack, setEarwormTrack] = useState<SpotifyTrack | null>(null);

  // Load access token when component mounts
  useEffect(() => {
    const loadAccessToken = () => {
      try {
        const token = getAccessToken();
        if (token) {
          setAccessToken(token);
        }
      } catch (err) {
        console.error("Error loading access token:", err);
        setError("Failed to load access token. Please login again.");
      }
    };

    loadAccessToken();
  }, []);

  // Format milliseconds to minutes:seconds
  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, "0")}`;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = (await searchSpotifyTracks(query)) as SearchResults;
      setResults(data.tracks.items);
    } catch (err) {
      console.error("Error searching tracks:", err);
      setError("Failed to search tracks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setShowPlayer(true);
  };

  const handleTrackSelected = (track: SpotifyTrack) => {
    setQuery(track.name);
    setResults([track]);
    handleSelectTrack(track);
  };

  const handleSetAsEarworm = (track: SpotifyTrack) => {
    setEarwormTrack(track);

    // Redirect to the replacement page with track info
    const params = new URLSearchParams({
      trackId: track.id,
      trackName: track.name,
      artist: track.artists.map((a) => a.name).join(", "),
      uri: track.uri,
    });

    // Add album image if available
    if (track.album.images && track.album.images.length > 0) {
      params.append("image", track.album.images[0].url);
    }

    window.location.href = `/replacement?${params.toString()}`;
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Find Your Earworm</h1>
        <p className="opacity-75">
          Search for the song stuck in your head so we can help you replace it
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Search for a track</h2>
              <SearchAutocomplete onTrackSelected={handleTrackSelected} />

              <div className="divider">OR</div>

              <form onSubmit={handleSearch} className="form-control">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Search for a song..."
                    className="input input-bordered flex-1"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      "Search"
                    )}
                  </button>
                </div>
                {error && (
                  <div className="alert alert-error mt-4">
                    <span>{error}</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="w-full space-y-4">
              {results.map((track) => (
                <div
                  key={track.id}
                  className="card card-side bg-base-200 shadow"
                >
                  <figure className="m-2">
                    {track.album.images &&
                      track.album.images.length > 0 &&
                      track.album.images[track.album.images.length - 1]
                        ?.url && (
                        <div className="avatar">
                          <div className="w-16 h-16">
                            <img
                              src={
                                track.album.images[
                                  track.album.images.length - 1
                                ]?.url
                              }
                              alt={track.album.name}
                            />
                          </div>
                        </div>
                      )}
                  </figure>
                  <div className="card-body p-4">
                    <h2 className="card-title">{track.name}</h2>
                    <p>{track.artists.map((a) => a.name).join(", ")}</p>
                    <div className="card-actions justify-between items-center">
                      <span className="opacity-70">
                        {formatDuration(track.duration_ms)}
                      </span>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => handleSelectTrack(track)}
                        >
                          Play
                        </button>
                        <button
                          className="btn btn-sm btn-outline"
                          onClick={() => handleSetAsEarworm(track)}
                        >
                          Select as Earworm
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Mascot mood={results.length > 0 ? "happy" : "sad"} />
              <p className="text-center mt-4 opacity-75">
                {query
                  ? "No results found. Try another search!"
                  : "Search for a song to get started!"}
              </p>
            </div>
          )}
        </div>

        <div className="w-full md:w-1/3">
          {showPlayer && selectedTrack && accessToken ? (
            <div className="sticky top-4">
              <div className="card bg-base-200 shadow-xl mb-6">
                <div className="card-body">
                  <h2 className="card-title">Now Playing</h2>
                  <SpotifyPlayer
                    accessToken={accessToken}
                    trackUri={selectedTrack.uri}
                    onPlayerError={(error) => setError(error.message)}
                  />
                </div>
              </div>

              {earwormTrack && (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title">Your Earworm</h2>
                    <div className="flex items-center space-x-4">
                      {earwormTrack.album.images &&
                        earwormTrack.album.images[0] && (
                          <img
                            src={earwormTrack.album.images[0].url}
                            alt={earwormTrack.album.name}
                            className="w-16 h-16 rounded-md"
                          />
                        )}
                      <div>
                        <h3 className="font-bold">{earwormTrack.name}</h3>
                        <p className="text-sm opacity-75">
                          {earwormTrack.artists.map((a) => a.name).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="card-actions justify-end mt-4">
                      <Link
                        href={`/replacement?trackId=${
                          earwormTrack.id
                        }&trackName=${encodeURIComponent(
                          earwormTrack.name
                        )}&artist=${encodeURIComponent(
                          earwormTrack.artists.map((a) => a.name).join(", ")
                        )}&uri=${encodeURIComponent(
                          earwormTrack.uri
                        )}&image=${encodeURIComponent(
                          earwormTrack.album.images?.[0]?.url || ""
                        )}`}
                        className="btn btn-primary"
                      >
                        Find Replacement
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">How It Works</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Search for the song stuck in your head</li>
                  <li>Play it to make sure it&apos;s the right one</li>
                  <li>Select it as your earworm</li>
                  <li>Let us find you a replacement song</li>
                </ol>
                <div className="divider"></div>
                <p className="text-sm opacity-75">
                  Deworm helps you replace annoying earworms with songs
                  you&apos;ll enjoy even more!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
