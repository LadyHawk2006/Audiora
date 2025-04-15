export default function ErrorState({ error, router }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center p-8 bg-gray-900 bg-opacity-80 rounded-xl backdrop-blur-sm border border-gray-800">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Error</h1>
        <p className="text-gray-400 mb-4">{error}</p>
        <button 
          onClick={() => router.push("/auth")}
          className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-all flex items-center gap-2"
        >
          Go to Sign in
        </button>
      </div>
    </div>
  );
}