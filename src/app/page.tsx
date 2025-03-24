import Link from "next/link";
import Mascot from "./components/Mascot";
import { isAuthenticated } from "./lib/session";

export default async function Home() {
  const authenticated = await isAuthenticated();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="mb-6 w-48">
        <Mascot mood="happy" width={200} height={200} priority />
      </div>

      <h1 className="text-4xl font-bold mb-6">Welcome to DeWorm</h1>
      <p className="text-center max-w-md mb-8">
        An app to help cure earworms - those songs that get stuck in your head.
        Login with Spotify to get started.
      </p>

      <div className="flex flex-col items-center">
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
    </main>
  );
}
