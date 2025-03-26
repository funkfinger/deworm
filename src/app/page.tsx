import Link from "next/link";
import Mascot from "./components/Mascot";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMusic } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-6">
      {/* Mascot */}
      <div className="w-48 mb-8">
        <Mascot mood="sad" width={200} height={200} priority />
      </div>

      {/* Chat bubble */}
      <div className="chat chat-start w-full max-w-md mb-8">
        <div className="chat-bubble">
          Oh No! I know why you&apos;re here! You&apos;ve got a pesky song stuck
          in your melon... Well, I know just what to do. Please log into Spotify
          and we&apos;ll take care of that right away!
        </div>
      </div>

      {/* Login button */}
      <Link
        href="/api/auth/login"
        className="btn btn-primary btn-lg gap-2 normal-case text-lg min-w-[200px]"
      >
        <FontAwesomeIcon icon={faMusic} className="h-5 w-5" />
        Login To Spotify
      </Link>
    </main>
  );
}
