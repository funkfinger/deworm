"use client";

import { SpotifyPlayerProvider } from "@/app/contexts/SpotifyPlayerContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SpotifyPlayerProvider>{children}</SpotifyPlayerProvider>;
}
