import Link from "next/link";
import Mascot from "./components/Mascot";

export default function Home() {
  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center">
        <div>
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

          <div className="mt-6 flex justify-center gap-4">
            <Link href="/api/auth/login" className="btn btn-primary">
              Login with Spotify
            </Link>
          </div>

          <div className="mt-8 text-sm opacity-50">
            <Link href="/debug" className="underline">
              Debug Authentication
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
