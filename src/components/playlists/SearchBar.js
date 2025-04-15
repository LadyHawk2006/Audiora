"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import { FaPlay, FaPlus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import usePlaybackStore from "@/store/usePlaybackStore";
import usePlaylistStore from "@/store/usePlaylistStore";

export default function ArtistSongs() {
  const [artist, setArtist] = useState("");
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const setSelectedSong = usePlaybackStore((state) => state.setSelectedSong);

  const fetchSongs = async () => {
    if (!artist.trim()) {
      setError("Please enter an artist name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/artist-songs`, { 
        params: { artist },
        timeout: 10000 // 10 second timeout
      });
      setSongs(response.data.songs || []);
      setIsExpanded(true);
    } catch (err) {
      console.error("Error fetching songs:", err);
      setError(err.response?.data?.error || "Failed to fetch songs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchSongs();
    }
  };

  return (
    <div className="mt-12 px-4 md:px-8 py-6 text-white max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
        <input
          type="text"
          className="w-full p-3 bg-[#1e1e1e] border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1db954] transition-all"
          placeholder="Enter artist name..."
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Artist search input"
          disabled={loading}
        />

        <button
          className={`px-5 py-3 rounded-lg font-medium transition-all min-w-[120px] flex items-center justify-center
            ${loading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-[#1db954] hover:bg-[#1ed760] active:scale-95 shadow-md"}`}
          onClick={fetchSongs}
          disabled={loading}
          aria-label={loading ? "Loading" : "Search"}
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              🔍
            </motion.span>
          ) : (
            "Search"
          )}
        </button>
      </div>

      {error && (
        <motion.p 
          className="text-red-400 text-center p-3 bg-red-900/30 rounded-lg mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {error}
        </motion.p>
      )}

      {songs.length > 0 && (
        <div className="flex justify-center items-center w-full mb-4">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Hide results" : "Show results"}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </motion.div>
            <span className="font-medium">
              {isExpanded ? "Hide Results" : `Show ${songs.length} Results`}
            </span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isExpanded && songs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScrollableSection
              title={`Songs by ${artist}`}
              songs={songs}
              handlePlaySong={setSelectedSong}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScrollableSection({ title, songs = [], handlePlaySong }) {
  const { playlist, addToPlaylist } = usePlaylistStore();
  const [addedSongs, setAddedSongs] = useState(new Set());

  // Update added songs when playlist changes
  useEffect(() => {
    const addedIds = new Set(playlist.map(song => song.id));
    setAddedSongs(addedIds);
  }, [playlist]);

  const handleAddToPlaylist = (song) => {
    addToPlaylist(song);
    setAddedSongs(prev => new Set(prev).add(song.id));
    
    // Provide visual feedback
    const button = document.getElementById(`add-button-${song.id}`);
    if (button) {
      button.classList.add("scale-110");
      setTimeout(() => button.classList.remove("scale-110"), 300);
    }
  };

  return (
    <div className="mb-10 bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-5 shadow-2xl transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-200">{title}</h2>
        <span className="text-sm text-gray-400">{songs.length} tracks</span>
      </div>

      <div className="max-h-[450px] overflow-y-auto custom-scrollbar pr-2">
        <div className="grid grid-cols-1 gap-3">
          {songs.map((song) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-white/5 to-white/10 hover:from-white/10 hover:to-white/15 border border-white/10 transition-all duration-300"
            >
              <button
                onClick={() => handlePlaySong(song)}
                className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 group-hover:bg-gray-400 transition-all duration-200"
                aria-label={`Play ${song.title}`}
              >
                <FaPlay className="text-white text-sm group-hover:scale-110 transition-transform" />
              </button>

              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-white truncate">
                  {song.title}
                </h3>
              </div>

              {/* Add to Playlist Button with checkmark feedback */}
              <button
                id={`add-button-${song.id}`}
                onClick={() => handleAddToPlaylist(song)}
                className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200
                  ${addedSongs.has(song.id) 
                    ? "bg-green-500/20 text-green-400" 
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"}`}
                aria-label={addedSongs.has(song.id) ? "Added to playlist" : "Add to playlist"}
                disabled={addedSongs.has(song.id)}
              >
                {addedSongs.has(song.id) ? (
                  <FiCheck className="text-green-400" />
                ) : (
                  <FaPlus />
                )}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}