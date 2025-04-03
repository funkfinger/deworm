"use client";

import ChatBubble from "@/app/components/ChatBubble";
import Mascot from "@/app/components/Mascot";
import { useSpotifySession } from "@/app/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EarwormSolutionPage() {
  const { isAuthenticated, isLoading } = useSpotifySession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackId = searchParams.get("trackId");
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);

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

  if (isLoading || isLoadingTrack) {
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
            Oh My! What a real brain bug! Let&apos;s see what we can do about it.
            Follow these steps and I&apos;m somewhat certain that you probably
            won&apos;t have this sticker in your ear anymore...
          </ChatBubble>
        </div>

        {/* Placeholder for solution steps */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Earworm Solution</h2>
            <p>
              This is a placeholder for the earworm solution steps page. The
              selected track ID is: {trackId}
            </p>
            <div className="card-actions justify-end mt-4">
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
