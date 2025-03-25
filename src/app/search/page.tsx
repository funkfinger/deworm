"use client";

import { useState } from "react";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";
import { searchSpotifyTracks } from "@/app/lib/actions";

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

  return (
    <div className="hero min-h-screen">
      <div className="hero-content flex-col w-full">
        <div className="avatar">
          <div className="w-24 mb-6">
            <Mascot
              mood={results.length > 0 ? "happy" : "sad"}
              width={100}
              height={100}
            />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-6">Find Your Earworm</h1>

        <form
          onSubmit={handleSearch}
          className="form-control w-full max-w-md mb-8"
        >
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter song title or artist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="input input-bordered w-full"
              required
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error mb-4 w-full">
            <p>{error}</p>
          </div>
        )}

        {results.length > 0 ? (
          <div className="w-full space-y-4">
            {results.map((track) => (
              <div key={track.id} className="card card-side bg-base-200 shadow">
                <figure className="m-2">
                  {track.album.images &&
                    track.album.images.length > 0 &&
                    track.album.images[track.album.images.length - 1]?.url && (
                      <div className="avatar">
                        <div className="w-16 h-16">
                          <img
                            src={
                              track.album.images[track.album.images.length - 1]
                                ?.url
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
                    <button className="btn btn-sm btn-outline">
                      Select as Earworm
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            {!isLoading && query && (
              <p className="text-base-content text-opacity-60">
                No results found. Try a different search term.
              </p>
            )}
            {!query && !isLoading && (
              <p className="text-base-content text-opacity-60">
                Enter a song title or artist to find your earworm.
              </p>
            )}
          </div>
        )}

        <div className="mt-8">
          <Link href="/dashboard" className="btn btn-outline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
