import Image from "next/image";
import { FaImage, FaMusic } from "react-icons/fa";

export default function PlaylistInfoSection({
  editedPlaylist,
  newCover,
  newBackground,
  updatePlaylistInfo,
  setShowCoverUpload,
  setShowBackgroundUpload,
  setNewBackground
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Cover Image */}
      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="flex flex-col items-center">
          <div className="relative group w-68 h-68 rounded-lg overflow-hidden mb-4">
            {newCover ? (
              <Image
                src={URL.createObjectURL(newCover)}
                alt="New cover"
                fill
                className="object-cover"
              />
            ) : editedPlaylist.cover ? (
              <Image
                src={editedPlaylist.cover}
                alt={editedPlaylist.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 flex items-center justify-center">
                <FaMusic className="text-gray-600 text-4xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <button
                onClick={() => setShowCoverUpload(true)}
                className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition"
              >
                <FaImage className="text-white" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCoverUpload(true)}
            className="text-sm text-purple-400 hover:text-purple-300"
          >
            Change Cover
          </button>
        </div>
      </div>

      {/* Playlist Details Form */}
      <div className="md:col-span-2 bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Playlist Name
            </label>
            <input
              type="text"
              className="w-full p-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              value={editedPlaylist.name || ""}
              onChange={(e) => updatePlaylistInfo({ name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              className="w-full p-3 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent min-h-[100px]"
              value={editedPlaylist.description || ""}
              onChange={(e) => updatePlaylistInfo({ description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Background Image
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBackgroundUpload(true)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                {newBackground ? "Change Background" : "Add Background"}
              </button>
              {(editedPlaylist.backgroundImage || newBackground) && (
                <button
                  onClick={() => {
                    setNewBackground(null);
                    updatePlaylistInfo({ backgroundImage: null });
                  }}
                  className="px-4 py-2 bg-red-900/50 hover:bg-red-900/70 rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}