"use client";

import { useEffect, useState, useRef } from "react";
import { FaPlay } from "react-icons/fa";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function TrendingSection() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  const { selectedSong, setSelectedSong, setPlaylist, setCurrentSongIndex } = usePlaybackStore();

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        const res = await fetch("/api/trending");
        const data = await res.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching trending songs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingSongs();
  }, []);

  // Play all function: sets the playlist and plays the first song
  const handlePlayAll = () => {
    if (songs.length > 0) {
      setPlaylist(songs);
      setCurrentSongIndex(0);
      setSelectedSong(songs[0]);
    }
  };

  return (
    <div className="mb-10 bg-white/5 backdrop-blur-lg border border-white/30 p-5 rounded-xl shadow-[0px_5px_15px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0px_10px_25px_rgba(255,255,255,0.15)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">🔥 Trending Now</h2>
        {songs.length > 0 && (
          <button
            className="flex items-center gap-2 border border-gray-700 hover:bg-green-500 px-4 py-2 rounded-md text-sm font-medium text-white transition"
            onClick={handlePlayAll}
          >
            <FaPlay className="text-xs" /> Play All
          </button>
        )}
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto bg-white/10 backdrop-blur-lg shadow-lg shadow-black/10 rounded-lg p-4 custom-scrollbar"
        style={{ maxWidth: "100%", overflowY: "hidden" }}
      >
        <div className="flex gap-5">
          {loading
            ? // Skeleton Loader while fetching
              Array(20)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className="relative min-w-[160px] md:min-w-[180px] lg:min-w-[200px] bg-white/20 backdrop-blur-lg animate-pulse p-3 rounded-lg shadow-md"
                  >
                    <div className="w-full h-36 bg-gray-700 rounded-lg mb-3"></div>
                    <div className="h-4 bg-gray-600 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-gray-500 rounded w-1/2"></div>
                  </div>
                ))
            : // Actual Content
              songs.map((song) => {
                const isPlaying = selectedSong?.id === song.id; // Check if this song is playing

                return (
                  <div
                    key={song.id}
                    className={`relative w-[160px] min-w-[160px] md:w-[180px] md:min-w-[180px] bg-white/10 backdrop-blur-lg p-2 rounded-lg transition transform hover:scale-105 cursor-pointer group shadow-lg shadow-black/10 
                      ${isPlaying ? "border-2 border-blue-400 shadow-lg shadow-blue-500/50 animate-pulse" : ""}`}
                    onClick={() => setSelectedSong(song)} // Clicking selects song
                  >
                    {/* Song Cover */}
                    <div className="relative">
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="w-full h-36 object-cover rounded-lg"
                        loading="lazy"
                      />

                      {/* Play Button (Appears on Hover) */}
                      <button
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaPlay className="text-white text-2xl" />
                      </button>
                    </div>

                    {/* Song Details */}
                    <h3 className="text-white font-semibold text-sm truncate mt-2">{song.title}</h3>
                    <p className="text-gray-300 text-xs truncate">{song.artist}</p>
                  </div>
                );
              })}
        </div>
      </div>

      <style jsx>{`
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          height: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
