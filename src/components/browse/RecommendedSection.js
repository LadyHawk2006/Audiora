"use client";

import { useEffect, useState } from "react";
import { FaPlay } from "react-icons/fa";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function RecommendationsSection({ searchQuery }) {
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const { setSelectedSong } = usePlaybackStore();

  // Fetch Recommendations
  useEffect(() => {
    if (searchQuery) return;
    setLoading(true);
    const fetchRecommendations = async () => {
      try {
        const res = await fetch("/api/recommendation");
        const data = await res.json();
        setRecommendedSongs(data.recommended || []);
      } catch (error) {
        console.error("❌ Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [searchQuery]);

  // Fetch Search Results
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    const fetchSearchResults = async () => {
      try {
        const res = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error("❌ Error fetching search results:", error);
      } finally {
        setSearchLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);

  const handlePlaySong = (song) => {
    setSelectedSong(song);
  };

  const handlePlayAll = (songs) => {
    if (songs.length > 0) {
      usePlaybackStore.setState({
        playlist: songs,
        currentSongIndex: 0,
        selectedSong: songs[0],
      });
    }
  };

  return (
    <div className="mb-2 p-4 md:p-8 lg:p-12 text-white bg-transparent">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        {searchQuery ? `Results for "${searchQuery}"` : ""}
      </h1>

      {searchQuery ? (
        searchLoading ? (
          <SkeletonSection />
        ) : searchResults.length > 0 ? (
          <ScrollableSection
            title="Search Results"
            songs={searchResults}
            handlePlaySong={handlePlaySong}
            handlePlayAll={handlePlayAll}
          />
        ) : (
          <p className="text-gray-400">No results found.</p>
        )
      ) : loading ? (
        <SkeletonSection />
      ) : (
        <ScrollableSection
          title="Popular Songs"
          songs={recommendedSongs}
          handlePlaySong={handlePlaySong}
          handlePlayAll={handlePlayAll}
        />
      )}
    </div>
  );
}

function ScrollableSection({ title, songs = [], handlePlaySong, handlePlayAll }) {
  // Split songs into three rows
  const splitSongs = (songs) => {
    const chunkSize = Math.ceil(songs.length / 3);
    return [
      songs.slice(0, chunkSize),
      songs.slice(chunkSize, chunkSize * 2),
      songs.slice(chunkSize * 2)
    ];
  };

  const songRows = splitSongs(songs);

  return (
    <div className="mb-0 bg-transparent p-1 md:p-0 shadow-lg transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg md:text-xl font-semibold text-gray-200">{title}</h2>
        {songs.length > 0 && (
          <button
            className="flex items-center gap-2 border border-gray-700 hover:bg-green-500 px-3 md:px-4 py-2 rounded-md text-sm font-medium text-white transition"
            onClick={() => handlePlayAll(songs)}
          >
            <FaPlay className="text-xs" /> Play all
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="overflow-x-auto custom-scrollbar pb-4">
        <div className="flex flex-col gap-4 w-max">
          {songRows.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
              {row.map((song) => (
                <div
                  key={song.id}
                  className="group relative flex items-center gap-4 p-3 rounded-lg bg-black/30 hover:bg-black/50 hover:ring-1 ring-green-500 border border-gray-700 transition cursor-pointer min-w-[300px]"
                  onClick={() => handlePlaySong(song)}
                >
                  {/* Thumbnail with Hover Play Button */}
                  <div className="relative w-16 h-16 rounded-md overflow-hidden">
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                      <FaPlay className="text-white text-lg" />
                    </button>
                  </div>

                  {/* Song Details */}
                  <div className="w-0 flex-grow overflow-hidden">
                    <h3 className="text-sm md:text-base font-semibold truncate">
                      {song.title
                        .replace(/^.*-\s*/, "")
                        .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")
                        .trim()}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-400 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Skeleton Loaders */
function SkeletonSection() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-5 md:h-6 w-32 md:w-40 bg-gray-700/50 rounded-md"></div>

      <div className="overflow-x-auto custom-scrollbar pb-4">
        <div className="flex flex-col gap-4 w-max">
          {Array.from({ length: 3 }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50 min-w-[300px]">
                  {/* Skeleton Thumbnail */}
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-700 rounded-md"></div>

                  {/* Skeleton Text */}
                  <div className="w-0 flex-grow space-y-2">
                    <div className="h-3.5 md:h-4 bg-gray-700/70 rounded-md w-3/4"></div>
                    <div className="h-3 bg-gray-700/50 rounded-md w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}