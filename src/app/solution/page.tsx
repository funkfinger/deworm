"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Mascot from "@/app/components/Mascot";
import SpotifyPlayer from "@/app/components/SpotifyPlayer";
import { useSpotifyPlayer } from "@/app/contexts/SpotifyPlayerContext";

export default function SolutionPage() {
  const router = useRouter();
  const { currentTrack, accessToken } = useSpotifyPlayer();
  const [currentStep, setCurrentStep] = useState(0);

  // Handle navigation in useEffect instead of during render
  useEffect(() => {
    if (!currentTrack) {
      router.push("/search");
    }
  }, [currentTrack, router]);

  // If no track, render nothing while redirecting
  if (!currentTrack) {
    return null;
  }

  const steps = [
    "Take A Deep Breath",
    "Count To Three",
    "Stick Your Fingers In Your Ears",
    "GO!",
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-6 max-w-md mx-auto">
      {/* Logo */}
      <div className="w-full mb-8">
        <Image
          src="/images/logo.svg"
          alt="DeWorm"
          width={200}
          height={60}
          className="mx-auto"
          priority
        />
      </div>

      {/* Mascot */}
      <div className="w-48 mb-8">
        <Mascot mood="happy" width={200} height={200} priority />
      </div>

      {/* Chat Bubble */}
      <div className="chat chat-start w-full mb-8">
        <div className="chat-bubble text-center">
          Oh my! This song is a real brain bug! Let&apos;s see what we can do
          about it...
        </div>
      </div>

      {/* Track Info */}
      <div className="w-full mb-8 flex items-center gap-4">
        {currentTrack.album?.images?.[0]?.url && (
          <img
            src={currentTrack.album.images[0].url}
            alt={currentTrack.album.name}
            className="w-16 h-16 rounded-md"
          />
        )}
        <div>
          <h2 className="text-lg font-bold">{currentTrack.name}</h2>
          <p className="text-sm opacity-75">
            {currentTrack.artists.map((a) => a.name).join(", ")}
          </p>
        </div>
      </div>

      {/* Hidden Player */}
      {accessToken && currentTrack && (
        <div className="hidden">
          <SpotifyPlayer
            accessToken={accessToken}
            trackUri={currentTrack.uri}
            onPlayerError={(error) => console.error(error)}
            autoPlay={true}
          />
        </div>
      )}

      {/* Solution Steps */}
      <div className="w-full space-y-4">
        {steps.map((step, index) => (
          <button
            key={index}
            className={`btn btn-lg w-full relative overflow-hidden ${
              index === currentStep ? "btn-primary" : "btn-outline"
            } ${index < currentStep ? "btn-disabled opacity-50" : ""}`}
            onClick={() => setCurrentStep(index + 1)}
            disabled={index !== currentStep}
          >
            <div className="absolute left-4 w-8 h-8 flex items-center justify-center bg-primary-content text-primary rounded-full">
              {index + 1}
            </div>
            <span className="ml-8">{step}</span>
          </button>
        ))}
      </div>
    </main>
  );
}
