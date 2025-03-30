"use client";

import Link from "next/link";
import { useSpotifySession } from "@/app/lib/auth-client";
import { faHeadphones } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Header() {
  const { isAuthenticated, isLoading } = useSpotifySession();

  return (
    <header className="py-4 mb-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary"
        >
          <FontAwesomeIcon icon={faHeadphones} />
          <span>DeWorm</span>
        </Link>

        <div>
          {isLoading ? (
            <span className="loading loading-spinner loading-sm" />
          ) : isAuthenticated ? (
            <span className="badge badge-primary">Spotify Connected</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
