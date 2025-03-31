import type { JWT } from "@auth/core/jwt";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { Session } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

// Custom Session type with our properties
interface CustomSession extends Session {
  accessToken?: string;
}

// Spotify scopes: https://developer.spotify.com/documentation/general/guides/scopes/
const scopes = [
  "user-read-email",
  "user-read-private",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

// Custom JWT type with our properties
interface CustomJWT extends JWT {
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export const authConfig: NextAuthConfig = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization: {
        params: { scope: scopes },
        url: "https://accounts.spotify.com/authorize",
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      const customToken = token as CustomJWT;

      // Persist the OAuth access_token to the token right after signin
      if (account) {
        customToken.accessToken = account.access_token;
        customToken.refreshToken = account.refresh_token;
        customToken.expiresAt = (account.expires_at as number) * 1000;
      }

      // Check if token is expired, if yes refresh it
      if (customToken.expiresAt && Date.now() > customToken.expiresAt) {
        // TODO: Implement token refresh logic
      }

      return customToken;
    },
    async session({ session, token }) {
      const customToken = token as CustomJWT;
      const customSession = session as CustomSession;

      if (customToken.accessToken) {
        customSession.accessToken = customToken.accessToken;
      }

      return customSession;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
