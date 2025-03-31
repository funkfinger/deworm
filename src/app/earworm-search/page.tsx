"use client";

import ChatBubble from "@/app/components/ChatBubble";
import Mascot from "@/app/components/Mascot";
import { useSpotifySession } from "@/app/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function EarwormSearchPage() {
  const { isAuthenticated, isLoading } = useSpotifySession();
  const router = useRouter();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

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

        {/* Placeholder for search component */}
        <div className="card w-full bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Search your earworm</h2>
            <p>
              This is where the Spotify search component will go in the next
              phase!
            </p>
            <div className="card-actions justify-end mt-4">
              <button
                className="btn btn-primary"
                onClick={() => router.push("/")}
                type="button"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
