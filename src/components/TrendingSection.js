"use client";

import { useEffect, useState, useRef } from "react";
import { FaPlay } from "react-icons/fa"; // Import play icon

export default function TrendingSection({ setSelectedSong }) {
  const [songs, setSongs] = useState([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchTrendingSongs = async () => {
      try {
        const res = await fetch("/api/trending");
        const data = await res.json();
        setSongs(data);
      } catch (error) {
        console.error("Error fetching trending songs:", error);
      }
    };

    fetchTrendingSongs();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🔥 Trending Now</h2>

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto whitespace-nowrap p-2 scrollbar-hide"
        style={{
          maxWidth: "100%",
          overflowY: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <div className="flex gap-4">
          {songs.length > 0 ? (
            songs.map((song, index) => (
              <div
                key={song.id}
                className="relative min-w-[160px] md:min-w-[180px] lg:min-w-[200px] bg-[rgba(255,255,255,0.1)] backdrop-blur-lg p-3 rounded-lg transition transform hover:scale-105"
              >
                {/* Rank Label */}
                <span className="absolute top-2 left-2 px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-yellow-400 to-red-500 text-black shadow-lg">
                  {index + 1}
                </span>

                {/* Song Cover */}
                <img
                  src={song.cover}
                  alt={song.title}
                  className="w-full h-40 object-cover rounded-lg mb-2"
                  loading="lazy"
                />

                {/* Play Button (Now Controls MusicPlayer) */}
                <button
                  className="absolute bottom-12 right-3 p-2 bg-black/60 rounded-full hover:bg-black/80 transition"
                  onClick={() => setSelectedSong(song)} // Sets song in MusicPlayer
                >
                  <FaPlay className="text-white text-lg" />
                </button>

                {/* Song Details */}
                <h3 className="text-white font-semibold text-sm truncate">{song.title}</h3>
                <p className="text-gray-400 text-xs truncate">{song.artist}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">Fetching trending songs...</p>
          )}
        </div>
      </div>

      {/* Hide Scrollbar in WebKit Browsers */}
      <style jsx>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
