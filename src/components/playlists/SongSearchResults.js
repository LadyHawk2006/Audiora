// components/playlists/SongSearchResults.jsx
"use client";

import { FaPlus } from "react-icons/fa";

export default function SongSearchResults({ results, onAddSong }) {
  return (
    <div className="mt-4 space-y-2">
      {results.map((result) => (
        <div
          key={result.videoId}
          className="flex items-center gap-4 p-3 hover:bg-gray-700/50 rounded-lg transition cursor-pointer"
          onClick={() => onAddSong(result)}
        >
          <div className="flex-shrink-0 w-12 h-12 relative">
            <img
              src={result.thumbnail}
              alt={result.title}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{result.title}</h3>
          </div>
          <button
            className="p-2 text-gray-400 hover:text-purple-400 hover:bg-gray-700 rounded-full transition"
            onClick={(e) => {
              e.stopPropagation();
              onAddSong(result);
            }}
          >
            <FaPlus />
          </button>
        </div>
      ))}
    </div>
  );
}