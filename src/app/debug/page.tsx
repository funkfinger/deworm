"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  getAccessToken,
  getRefreshToken,
  getTokenExpiry,
  getUserProfile,
  isAuthenticated,
  isTokenExpired,
} from "../lib/client-session";

interface AuthInfo {
  authenticated: boolean;
  tokenExpired: boolean;
  accessToken: string;
  hasRefreshToken: boolean;
  expiryTime: string;
  hasUserProfile: boolean;
  userName: string;
}

export default function DebugPage() {
  const [authInfo, setAuthInfo] = useState<AuthInfo>({
    authenticated: false,
    tokenExpired: true,
    accessToken: "not found",
    hasRefreshToken: false,
    expiryTime: "not found",
    hasUserProfile: false,
    userName: "none",
  });
  const [cookies, setCookies] = useState<string>("");

  useEffect(() => {
    // Collect all auth information in one object for display
    const token = getAccessToken();
    const refreshToken = getRefreshToken();
    const expiry = getTokenExpiry();
    const profile = getUserProfile();
    const authenticated = isAuthenticated();
    const tokenExpired = isTokenExpired();

    setAuthInfo({
      authenticated,
      tokenExpired,
      accessToken: token ? `${token.substring(0, 8)}...` : "not found",
      hasRefreshToken: !!refreshToken,
      expiryTime: expiry ? new Date(expiry).toISOString() : "not found",
      hasUserProfile: !!profile,
      userName: profile?.display_name || "none",
    });

    // Get all cookies for debugging
    setCookies(document.cookie);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Authentication Status</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <tbody>
                {Object.entries(authInfo).map(([key, value]) => (
                  <tr key={key}>
                    <td className="font-bold">{key}</td>
                    <td>
                      {typeof value === "boolean" ? value.toString() : value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">Cookie Information</h2>
          <div className="bg-base-300 p-4 rounded-lg overflow-x-auto">
            <pre>{cookies || "No cookies found"}</pre>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <Link href="/search" className="btn btn-primary">
          Go to Search
        </Link>
        <Link href="/api/auth/login" className="btn">
          Login Again
        </Link>
        <Link href="/api/auth/logout" className="btn btn-outline">
          Logout
        </Link>
      </div>
    </div>
  );
}
