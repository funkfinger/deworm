export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to DeWorm</h1>
      <p className="text-center max-w-md mb-8">
        An app to help cure earworms - those songs that get stuck in your head.
        Login with Spotify to get started.
      </p>

      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-2">Coming soon</p>
        <button disabled className="btn btn-primary btn-disabled">
          Login with Spotify
        </button>
      </div>
    </main>
  );
}
