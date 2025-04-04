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
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoggingIn(true);
    setLoginError(null);
    try {
      await loginWithSpotify();
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(
        "Failed to connect to Spotify. Please check your API credentials in .env.local file."
      );
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Different message based on authentication state
  const qtMessage = isAuthenticated
    ? "Oh no you&apos;re back! Sure hope it wasn&apos;t my fault... Let&apos;s get that annoying song out of your dome."
    : "Oh no I know why you&apos;re here. You&apos;ve got a pesky song stuck in your mellon! Well, I know just what to do. Please log into your Spotify account and we&apos;ll take care of that right away!";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-12">{/* Hero text removed */}</div>

        {/* Mascot Section */}
        <div className="relative mb-12">
          <div className="max-w-sm mx-auto">
            <Mascot mood="sad" size="xl" className="mx-auto mb-8" />
            <ChatBubble animate={true} className="text-lg">
              {qtMessage}
            </ChatBubble>
          </div>
        </div>

        {/* Action Section */}
        <div className="flex flex-col items-center gap-4 max-w-sm mx-auto">
          {isAuthenticated ? (
            <>
              <Link
                href="/earworm-search"
                className="btn btn-primary btn-lg w-full"
              >
                Find my earworm
                <FontAwesomeIcon icon={faArrowRight} />
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-outline btn-lg w-full"
                type="button"
              >
                Logout from Spotify
                <FontAwesomeIcon icon={faSignOut} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleLogin}
                disabled={loggingIn}
                className="btn btn-primary btn-lg w-full shadow-lg"
                type="button"
                data-testid="spotify-login-button"
              >
                {loggingIn ? (
                  <>
                    <span className="loading loading-spinner" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Login with Spotify
                    <FontAwesomeIcon icon={faSpotify} />
                  </>
                )}
              </button>

              {loginError && (
                <div
                  className="alert alert-error mt-4"
                  data-testid="login-error"
                >
                  <div>
                    <span>{loginError}</span>
                    <div className="text-sm mt-2">
                      To fix this issue, you need to:
                      <ol className="list-decimal list-inside mt-1">
                        <li>
                          Register your app on the{" "}
                          <a
                            href="https://developer.spotify.com/dashboard"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline"
                          >
                            Spotify Developer Dashboard
                          </a>
                        </li>
                        <li>Add the credentials to your .env.local file</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
