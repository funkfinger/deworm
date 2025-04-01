"use client";

import { useSpotifySession } from "@/app/lib/auth-client";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { isAuthenticated, isLoading } = useSpotifySession();

  return (
    <header className="py-4 mb-8">
      <div className="flex items-center justify-center">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary"
        >
          <Image
            src="/images/logo.svg"
            alt="DeWorm Logo"
            width={254}
            height={85}
            priority={true}
            className="dark:invert"
          />
        </Link>

        <div className="absolute right-4">
          {isLoading ? (
            <span
              className="loading loading-spinner loading-sm"
              data-testid="loading-spinner"
            />
          ) : isAuthenticated ? (
            <span className="badge badge-primary">Spotify Connected</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
