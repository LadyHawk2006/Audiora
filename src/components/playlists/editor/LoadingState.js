export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-800 rounded"></div>
      </div>
    </div>
  );
}