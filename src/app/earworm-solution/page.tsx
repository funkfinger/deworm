"use client";

import ChatBubble from "@/app/components/ChatBubble";
import Mascot from "@/app/components/Mascot";
import SpotifyTrackCard from "@/app/components/SpotifyTrackCard";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";
import { useSpotifySession } from "@/app/lib/auth-client";
import type { SpotifyTrack } from "@/app/models/spotify";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EarwormSolutionPage() {
  const { isAuthenticated, isLoading } = useSpotifySession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackId = searchParams.get("trackId");
  const autoplay = searchParams.get("autoplay") === "true";
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [track, setTrack] = useState<SpotifyTrack | null>(null);
  
  // Get the Spotify player context
  const { playbackError, currentTrack, isPlaying } = useSpotifyPlayer();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  // Redirect to search if no trackId
  useEffect(() => {
    if (!isLoading && !trackId) {
      router.push("/earworm-search");
    }
  }, [trackId, isLoading, router]);

  // Fetch track details
  useEffect(() => {
    if (trackId && !isLoading && isAuthenticated) {
      const fetchTrack = async () => {
        setIsLoadingTrack(true);
        
        try {
          console.log("Fetching track details for ID:", trackId);
          
          // Use the API route instead of calling the Spotify client directly
          const response = await fetch(`/api/spotify/track/${trackId}`);
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to fetch track");
          }
          
          const trackData = await response.json();
          console.log("Track data received:", trackData);
          setTrack(trackData);
          
          // Note: We don't need to handle autoplay here anymore
          // The player is already initialized and playing from the search page
        } catch (error) {
          console.error("Error fetching track:", error);
        } finally {
          setIsLoadingTrack(false);
        }
      };
      
      fetchTrack();
    }
  }, [trackId, isLoading, isAuthenticated]);

  if (isLoading || isLoadingTrack) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary" data-testid="loading-spinner" />
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
            Oh My! What a real brain bug! Let&apos;s see what we can do about
            it. Follow these steps and I&apos;m somewhat certain that you
            probably won&apos;t have this sticker in your ear anymore...
          </ChatBubble>
        </div>

        {/* Display the selected track */}
        {track && (
          <div className="card w-full bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title">Your Earworm</h2>
              <p className="mb-4">
                This is the song that's stuck in your head:
              </p>

              <SpotifyTrackCard
                track={track}
                className="mt-2 mb-4"
                showControls={true}
              />

              {playbackError && (
                <div
                  className="alert alert-warning mt-4"
                  data-testid="playback-error"
                >
                  <span>{playbackError}</span>
                </div>
              )}

              {isPlaying && currentTrack && (
                <div className="alert alert-success mt-4">
                  <span>
                    Now playing! Make sure your Spotify app is open to hear the
                    music.
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Solution steps */}
        <div className="card w-full bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Earworm Solution Steps</h2>
            <ol className="list-decimal list-inside mt-4 space-y-4">
              <li className="p-4 bg-base-200 rounded-lg">
                <span className="font-medium">
                  Listen to your earworm completely
                </span>
                <p className="mt-2">
                  First, listen to your earworm all the way through. This helps
                  your brain get closure.
                </p>
              </li>
              <li className="p-4 bg-base-200 rounded-lg">
                <span className="font-medium">Distract yourself</span>
                <p className="mt-2">
                  Do a mentally engaging activity for 5-10 minutes (like a puzzle
                  or reading).
                </p>
              </li>
              <li className="p-4 bg-base-200 rounded-lg">
                <span className="font-medium">Replace with a new song</span>
                <p className="mt-2">
                  We'll suggest a replacement song that's equally catchy but
                  different enough to break the loop.
                </p>
              </li>
            </ol>

            <div className="card-actions justify-end mt-6">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/earworm-search")}
                type="button"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
