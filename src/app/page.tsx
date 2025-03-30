"use client";

import ChatBubble from "@/app/components/ChatBubble";
import Mascot from "@/app/components/Mascot";
import { useSpotifySession } from "@/app/lib/auth-client";
import { loginWithSpotify, logout } from "@/app/lib/auth-client";
import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { faArrowRight, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const { isAuthenticated, isLoading } = useSpotifySession();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      await loginWithSpotify();
    } catch (error) {
      console.error("Login error:", error);
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Different message based on authentication state
  const qtMessage = isAuthenticated
    ? "Oh no you're back! Sure hope it wasn't my fault... Let's get that annoying song out of your dome."
    : "Oh no I know why you're here. You've got a pesky song stuck in your mellon! Well, I know just what to do. Please log into your Spotify account and we'll take care of that right away!";

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
        {/* Mascot with sad mood */}
        <div className="flex justify-center mb-8">
          <Mascot mood="sad" size="xl" />
        </div>

        {/* QT's message */}
        <div className="mb-12">
          <ChatBubble animate={true}>{qtMessage}</ChatBubble>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          {isAuthenticated ? (
            <>
              <Link href="/earworm-search" className="btn btn-primary btn-lg">
                Find my earworm
                <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-lg"
                type="button"
              >
                Logout from Spotify
                <FontAwesomeIcon icon={faSignOut} className="ml-2" />
              </button>
            </>
          ) : (
            <button
              onClick={handleLogin}
              disabled={loggingIn}
              className="btn btn-primary btn-lg"
              type="button"
            >
              {loggingIn ? (
                <>
                  <span className="loading loading-spinner" />
                  Connecting...
                </>
              ) : (
                <>
                  Login with Spotify
                  <FontAwesomeIcon icon={faSpotify} className="ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
