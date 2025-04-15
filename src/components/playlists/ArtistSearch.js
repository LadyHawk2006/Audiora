"use client";

import { useState } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import usePlaybackStore from "@/store/usePlaybackStore"; // Zustand store

export default function ArtistSongs() {
  const [artist, setArtist] = useState("");
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const setSelectedSong = usePlaybackStore((state) => state.setSelectedSong);

  const fetchSongs = async () => {
    if (!artist.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/artist-songs`, { params: { artist } });
      setSongs(response.data.songs);
      setIsExpanded(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch songs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mt-14 px-4 md:px-5 py-6 text-white"
    >
      {/* Search Box & Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex items-center space-x-4 mb-6"
      >
        <input
          type="text"
          className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1db954]"
          placeholder="Search for audio..."
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchSongs()}
        />

        <button
          className={`px-5 py-3 rounded-lg text-white font-semibold transition transform hover:scale-105 shadow-md
            ${loading ? "bg-gray-500 cursor-not-allowed" : "border border-gray transform hover:scale-105"}`}
          onClick={fetchSongs}
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </motion.div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {songs.length > 0 && (
        <div className="flex justify-center items-center w-full">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg text-gray-300 hover:text-white hover:border border-gray-600 transition-all duration-200 ease-in-out"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </motion.div>
            <span className="font-medium">{isExpanded ? "Hide Results" : "Show Results"}</span>
          </motion.button>
        </div>
      )}

      {/* Animated Expansion */}
      <AnimatePresence>
        {isExpanded && songs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <ScrollableSection title="Results" songs={songs} handlePlaySong={setSelectedSong} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ScrollableSection({ title, songs = [], handlePlaySong }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="mb-10 bg-white/5 backdrop-blur-lg border border-white/30 p-5 shadow-lg transition-all hover:shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
      </div>

      <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {songs.map((song) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="group relative flex items-center gap-4 p-3 rounded-lg bg-black/30 hover:bg-black/50 border border-gray-700 transition cursor-pointer"
              onClick={() =>
                handlePlaySong({
                  id: song.id,
                  title: song.title || "Unknown Title",
                  thumbnail: song.thumbnail || `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`,
                  artist: song.channel || "Unknown Artist",
                  videoId: song.id,
                  audioSrc: `/api/audio?id=${song.id}`,
                })
              }
            >
              <div className="relative w-16 h-16 rounded-md overflow-hidden">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-full h-full object-cover"
                />
                <motion.button
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition"
                  whileHover={{ scale: 1.1 }}
                >
                  <FaPlay className="text-white text-lg" />
                </motion.button>
              </div>
              <div className="w-0 flex-grow overflow-hidden">
                <h3 className="text-base font-semibold truncate">
                  {song.title
                    .replace(/^.*-\s*/, "")
                    .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")
                    .trim()}
                </h3>
                <p className="text-sm text-gray-400 truncate">{song.channel}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
