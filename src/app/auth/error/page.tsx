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
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-6 w-32">
        <Mascot mood="sad" width={150} height={150} />
      </div>

      <h1 className="text-3xl font-bold mb-4 text-center">
        Authentication Error
      </h1>

      <div className="bg-error/10 border border-error/30 rounded-lg p-4 mb-6 max-w-md">
        <p className="text-error-content text-center">{errorMessage}</p>
      </div>

      <div className="flex flex-col items-center">
        <Link href="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    </div>
  );
}
