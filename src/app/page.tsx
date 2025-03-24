import Link from "next/link";
import Mascot from "./components/Mascot";
import { isAuthenticated } from "./lib/session";

export default async function Home() {
  const authenticated = await isAuthenticated();

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <div className="avatar">
            <div className="w-48 mb-6 mx-auto">
              <Mascot mood="happy" width={200} height={200} priority />
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-6">Welcome to DeWorm</h1>
          <p className="mb-8">
            An app to help cure earworms - those songs that get stuck in your
            head. Login with Spotify to get started.
          </p>

          {authenticated ? (
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          ) : (
            <Link href="/api/auth/login" className="btn btn-primary">
              Login with Spotify
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
