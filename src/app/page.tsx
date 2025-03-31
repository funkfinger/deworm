'use client';

import ChatBubble from '@/app/components/ChatBubble';
import Mascot from '@/app/components/Mascot';
import { useSpotifySession } from '@/app/lib/auth-client';
import { loginWithSpotify, logout } from '@/app/lib/auth-client';
import { faSpotify } from '@fortawesome/free-brands-svg-icons';
import { faArrowRight, faSignOut } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const { isAuthenticated, isLoading } = useSpotifySession();
  const [loggingIn, setLoggingIn] = useState(false);

  const handleLogin = async () => {
    setLoggingIn(true);
    try {
      await loginWithSpotify();
    } catch (error) {
      console.error('Login error:', error);
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // Different message based on authentication state
  const qtMessage = isAuthenticated
    ? 'Oh no you&apos;re back! Sure hope it wasn&apos;t my fault... Let&apos;s get that annoying song out of your dome.'
    : 'Oh no I know why you&apos;re here. You&apos;ve got a pesky song stuck in your mellon! Well, I know just what to do. Please log into your Spotify account and we&apos;ll take care of that right away!';

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Got a song stuck in your head?
          </h1>
          <p className="text-xl text-base-content/70 mb-8">
            Let&apos;s help you get rid of that earworm!
          </p>
        </div>

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
            <button
              onClick={handleLogin}
              disabled={loggingIn}
              className="btn btn-primary btn-lg w-full shadow-lg"
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
                  <FontAwesomeIcon icon={faSpotify} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
