"use client";

import { useContext } from "react";
import { PlaylistContext } from "../context/PlaylistContext";
import { FaPlay, FaPlus } from "react-icons/fa";

export default function SearchResults({ results, loading }) {
  const { addToPlaylist, playSong } = useContext(PlaylistContext);

  return (
    <div className="mt-12 max-h-[400px] min-h-[300px] overflow-y-auto custom-scrollbar">
      {loading ? (
        <SkeletonLoader />
      ) : results.length === 0 ? (
        <p className="text-gray-400 text-center">No results found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {results.map((song) => (
            <div
              key={song.id}
              className="relative bg-black p-4 rounded-lg flex items-center gap-4 transition group border border-transparent hover:border-gray-600 shadow-lg"
            >
              {/* Thumbnail with Play Button */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => playSong(song)}
                  className="absolute inset-0 flex justify-center items-center bg-black/40 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-50 transition-all duration-200 ease-in-out"
                  >
                 <FaPlay className="text-white bg-white/20 text-3xl p-4 rounded-full shadow-lg hover:bg-white/40 hover:scale-110 border border-gray-500 transition-all duration-200 ease-in-out" />
               </button>

              </div>

              {/* Song Details */}
              <div className="flex-grow overflow-hidden">
  <h3 className="text-white font-semibold text-sm md:text-base leading-tight line-clamp-2">
    {song.title}
  </h3>
  <p className="text-gray-400 text-xs md:text-sm truncate">{song.artist}</p>
  <p className="text-gray-500 text-xs">{song.duration}</p>
</div>


              {/* Add Button on Hover */}
              <button
                onClick={() => addToPlaylist(song)}
                className="opacity-0 group-hover:opacity-100 transition text-white text-xl p-3 bg-gray-900 rounded-full shadow-md hover:bg-gray-700 hover:scale-110"
              >
                <FaPlus />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Skeleton Loader
const SkeletonLoader = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-800 p-4 rounded-lg flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
          <div className="flex-grow">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  );
};
