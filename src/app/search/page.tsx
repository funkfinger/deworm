"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";
import SearchAutocomplete from "@/app/components/SearchAutocomplete";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";
import {
  getAccessToken,
  isAuthenticated,
  getUserProfile,
  debugCookies,
} from "@/app/lib/client-session";
import type { SpotifyUser } from "@/app/lib/spotify";

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

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SpotifyTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [earwormTrack, setEarwormTrack] = useState<SpotifyTrack | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<SpotifyUser | null>(null);

  // Load access token when component mounts
  useEffect(() => {
    const loadAccessToken = () => {
      setIsLoading(true);
      try {
        console.log("🔄 Search page: Loading authentication state...");
        debugCookies();

        // Check authentication first
        const isLoggedIn = isAuthenticated();
        console.log("🔍 Search page: Is logged in:", isLoggedIn);

        if (!isLoggedIn) {
          console.log(
            "❌ Search page: Not authenticated, showing login prompt"
          );
          setIsAuthChecked(true);
          setIsLoading(false);
          return;
        }

        // Get token if authenticated
        const token = getAccessToken();
        if (token) {
          console.log("✅ Search page: Token found and set");
          setAccessToken(token);

          // Also get user profile
          const profile = getUserProfile();
          if (profile) {
            console.log(
              "✅ Search page: User profile loaded:",
              profile.display_name
            );
            setUserProfile(profile);
          } else {
            console.log("❌ Search page: No user profile found");
          }
        } else {
          console.log(
            "❌ Search page: Token not found even though authenticated"
          );
        }
      } catch (err) {
        console.error("❌ Search page: Error loading access token:", err);
        setError("Failed to load access token. Please login again.");
      } finally {
        setIsAuthChecked(true);
        setIsLoading(false);
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
    if (
      track.album.images &&
      track.album.images.length > 0 &&
      track.album.images[0]
    ) {
      params.append("image", track.album.images[0].url);
    }

    window.location.href = `/replacement?${params.toString()}`;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  // Show login button if not authenticated
  if (isAuthChecked && !accessToken) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center mt-10">
          <Mascot mood="sad" width={120} height={120} />
          <h1 className="text-2xl font-bold mt-4">Login Required</h1>
          <p className="mt-2 mb-6">
            Please log in with Spotify to search for songs
          </p>
          <Link href="/api/auth/login" className="btn btn-primary">
            Login with Spotify
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="flex flex-col items-center justify-center mb-4">
          <Mascot mood="happy" width={100} height={100} />
          <h1 className="text-3xl font-bold mt-2">Welcome to DeWorm</h1>

          {/* Display user info if available */}
          {userProfile && (
            <div className="flex items-center mt-4 mb-2">
              {userProfile.images &&
                userProfile.images.length > 0 &&
                userProfile.images[0]?.url && (
                  <div className="avatar mr-2">
                    <div className="w-8 h-8 rounded-full">
                      <img
                        src={userProfile.images[0].url}
                        alt={userProfile.display_name || "User"}
                      />
                    </div>
                  </div>
                )}
              <span className="font-medium">{userProfile.display_name}</span>
            </div>
          )}
        </div>

        <p className="opacity-75 mt-2">
          Search for the song stuck in your head so we can help you replace it
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-2/3">
          <div className="card bg-base-200 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">Search for a track</h2>
              <SearchAutocomplete onTrackSelected={handleTrackSelected} />

              {error && (
                <div className="alert alert-error mt-4">
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {results.length === 0 && (
            <div className="flex flex-col items-center justify-center">
              <Mascot mood="sad" />
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

                  {/* Track information */}
                  <div className="flex items-center space-x-4 mb-4">
                    {selectedTrack.album.images &&
                      selectedTrack.album.images.length > 0 &&
                      selectedTrack.album.images[0]?.url && (
                        <img
                          src={selectedTrack.album.images[0].url}
                          alt={selectedTrack.album.name || "Album cover"}
                          className="w-16 h-16 rounded-md"
                        />
                      )}
                    <div className="flex-1">
                      <h3 className="font-bold">{selectedTrack.name}</h3>
                      <p className="text-sm opacity-75">
                        {selectedTrack.artists.map((a) => a.name).join(", ")}
                      </p>
                      <p className="text-xs opacity-70">
                        {formatDuration(selectedTrack.duration_ms)}
                      </p>
                    </div>
                  </div>

                  {/* Player component */}
                  <SpotifyPlayer
                    accessToken={accessToken}
                    trackUri={selectedTrack.uri}
                    onPlayerError={(error) => setError(error.message)}
                  />

                  {/* Action buttons */}
                  <div className="card-actions justify-end mt-4">
                    <button
                      className="btn btn-primary"
                      onClick={() => handleSetAsEarworm(selectedTrack)}
                    >
                      Select as Earworm
                    </button>
                  </div>
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
                <div className="flex justify-between items-center">
                  <p className="text-sm opacity-75">
                    Deworm helps you replace annoying earworms with songs
                    you&apos;ll enjoy even more!
                  </p>
                  <Link
                    href="/api/auth/logout"
                    className="btn btn-outline btn-sm"
                  >
                    Logout
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
