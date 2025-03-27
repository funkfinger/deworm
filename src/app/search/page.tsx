"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";
import SearchAutocomplete from "@/app/components/SearchAutocomplete";
import { getAccessToken, isAuthenticated } from "@/app/lib/client-session";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import type { SpotifyTrack } from "@/app/lib/spotify";

export default function SearchPage() {
  const router = useRouter();
  const { setCurrentTrack, setAccessToken } = useSpotifyPlayer();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  // Load access token when component mounts
  useEffect(() => {
    const loadAccessToken = () => {
      setIsLoading(true);
      try {
        const isLoggedIn = isAuthenticated();
        if (!isLoggedIn) {
          setIsAuthChecked(true);
          setIsLoading(false);
          return;
        }

        const token = getAccessToken();
        if (token) {
          setAccessToken(token);
        }
      } catch (err) {
        console.error("Error loading access token:", err);
        setError("Failed to load access token. Please login again.");
      } finally {
        setIsAuthChecked(true);
        setIsLoading(false);
      }
    };

    loadAccessToken();
  }, [setAccessToken]);

  const handleTrackSelected = (track: SpotifyTrack) => {
    setCurrentTrack(track);
    router.push("/solution");
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
  if (isAuthChecked && !getAccessToken()) {
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
    <main className="flex min-h-screen flex-col items-center justify-start p-6">
      {/* Mascot */}
      <div className="w-48 mb-8">
        <Mascot mood="happy" width={200} height={200} priority />
      </div>

      {/* Chat bubble */}
      <div className="chat chat-start w-full max-w-md mb-8">
        <div className="chat-bubble">
          Great! Now lets find that nasty earworm...
        </div>
      </div>

      {/* Search section */}
      <div className="w-full max-w-md">
        <SearchAutocomplete onTrackSelected={handleTrackSelected} />

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}
      </div>
    </main>
  );
}
