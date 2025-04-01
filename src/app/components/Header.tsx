"use client";

import { useSpotifySession } from "@/app/lib/auth-client";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const { isAuthenticated, isLoading } = useSpotifySession();

  return (
    <header className="py-4 mb-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary"
        >
          <Image
            src="/images/logo.svg"
            alt="DeWorm Logo"
            width={150}
            height={50}
            priority={true}
            className="dark:invert"
          />
        </Link>

        <div>
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
