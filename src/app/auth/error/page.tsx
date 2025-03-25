"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";

// Map of error codes to user-friendly messages
const ERROR_MESSAGES: Record<string, string> = {
  spotify_denied: "You declined to authorize the application with Spotify.",
  state_mismatch: "Security verification failed. Please try again.",
  no_code: "No authorization code received from Spotify. Please try again.",
  auth_failed: "Authentication with Spotify failed. Please try again.",
  default: "An unknown error occurred during authentication. Please try again.",
};

export default function AuthError() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "default";
  const errorMessage = ERROR_MESSAGES[errorCode] || ERROR_MESSAGES["default"];

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div>
          <div className="avatar">
            <div className="w-32 mb-6 mx-auto">
              <Mascot mood="sad" width={150} height={150} />
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>

          <div className="alert alert-error mb-6">
            <p>{errorMessage}</p>
          </div>

          <Link href="/" className="btn btn-primary">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
