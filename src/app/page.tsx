export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-6">Welcome to DeWorm</h1>
      <p className="text-center max-w-md mb-8">
        An app to help cure earworms - those songs that get stuck in your head.
        Login with Spotify to get started.
      </p>

      {/* daisyUI button showcase */}
      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex gap-2">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-accent">Accent</button>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-info">Info</button>
          <button className="btn btn-success">Success</button>
          <button className="btn btn-warning">Warning</button>
          <button className="btn btn-error">Error</button>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <p className="text-sm text-gray-500 mb-2">Coming soon</p>
        <button disabled className="btn btn-primary btn-disabled">
          Login with Spotify
        </button>
      </div>
    </main>
  );
}
