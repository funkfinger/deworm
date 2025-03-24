import { redirect } from "next/navigation";
import Link from "next/link";
import Mascot from "@/app/components/Mascot";
import { isAuthenticated, getUserProfile } from "@/app/lib/session";

export default async function Dashboard() {
  // Check if user is authenticated
  const authenticated = await isAuthenticated();

  // If not authenticated, redirect to home page
  if (!authenticated) {
    redirect("/");
  }

  // Get user profile
  const userProfile = await getUserProfile();

  return (
    <div className="hero min-h-screen">
      <div className="hero-content text-center flex-col">
        <div className="avatar">
          <div className="w-32 mb-6">
            <Mascot mood="happy" width={150} height={150} />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-2">Welcome to DeWorm Dashboard</h1>

        {userProfile && (
          <div className="mb-6">
            <p className="mb-4">
              Hello,{" "}
              <span className="font-bold">{userProfile.display_name}</span>!
            </p>

            {userProfile.images &&
              userProfile.images.length > 0 &&
              userProfile.images[0]?.url && (
                <div className="avatar">
                  <div className="w-16 rounded-full mb-4">
                    <img
                      src={userProfile.images[0].url}
                      alt={userProfile.display_name}
                    />
                  </div>
                </div>
              )}
          </div>
        )}

        <div className="card bg-base-200 shadow-md w-full max-w-xl mb-8">
          <div className="card-body">
            <h2 className="card-title">Find a cure for your earworm</h2>
            <p>
              Search for the song that&apos;s stuck in your head, and we&apos;ll
              help you replace it.
            </p>
            <div className="card-actions justify-end">
              <Link href="/search" className="btn btn-primary btn-sm">
                Search Songs
              </Link>
            </div>
          </div>
        </div>

        <Link href="/api/auth/logout" className="btn btn-outline">
          Logout
        </Link>
      </div>
    </div>
  );
}
