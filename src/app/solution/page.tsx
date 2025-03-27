"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Mascot from "@/app/components/Mascot";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";

export default function SolutionPage() {
  const router = useRouter();
  const { currentTrack, accessToken } = useSpotifyPlayer();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    "Take A Deep Breath",
    "Count To Three",
    "Stick Your Fingers In Your Ears",
    "GO!",
  ];

  // If no track is selected, redirect to search
  if (!currentTrack) {
    router.push("/search");
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6">
      {/* Track Info and Player */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center gap-4">
          {currentTrack.album?.images?.[0]?.url && (
            <img
              src={currentTrack.album.images[0].url}
              alt={currentTrack.album.name}
              className="w-16 h-16 rounded-md"
            />
          )}
          <div className="flex-1">
            <h2 className="text-lg font-bold">{currentTrack.name}</h2>
            <p className="text-sm opacity-75">
              {currentTrack.artists.map((a) => a.name).join(", ")}
            </p>
          </div>
          <Mascot mood="happy" width={60} height={60} />
        </div>

        {accessToken && (
          <div className="mt-4">
            <SpotifyPlayer
              accessToken={accessToken}
              trackUri={currentTrack.uri}
              onPlayerError={(error) => console.error(error)}
            />
          </div>
        )}
      </div>

      {/* Chat Bubble */}
      <div className="chat chat-start w-full max-w-md mb-8">
        <div className="chat-bubble">
          Oh my! This song is a real brain bug! Let&apos;s see what we can do
          about it...
        </div>
      </div>

      {/* Solution Steps */}
      <div className="w-full max-w-md space-y-4">
        {steps.map((step, index) => (
          <button
            key={index}
            className={`btn btn-lg w-full ${
              index === currentStep ? "btn-primary" : "btn-outline"
            } ${index < currentStep ? "btn-disabled opacity-50" : ""}`}
            onClick={() => setCurrentStep(index + 1)}
            disabled={index !== currentStep}
          >
            <span className="badge badge-lg mr-4">{index + 1}</span>
            {step}
          </button>
        ))}
      </div>
    </main>
  );
}
