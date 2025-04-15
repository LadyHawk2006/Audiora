"use client";
import { useState } from "react";
import axios from "axios";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaPlay } from "react-icons/fa";
import { motion } from "framer-motion";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function ArtistSongs() {
  const { setSelectedSong, setPlaylist, setCurrentSongIndex } = usePlaybackStore();
  const [artist, setArtist] = useState("");
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const playAll = () => {
    if (songs.length === 0) return;
    setPlaylist(songs);
    setCurrentSongIndex(0);
    setSelectedSong(songs[0]);
  };

  return (
    <div className="mt-14 min-h-[isExpanded ? 'auto' : 'unset'] px-4 md:px-8 py-6 text-white">
      <div className="flex items-center space-x-4 mb-4">
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
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {songs.length > 0 && (
        <div className="flex justify-center items-center w-full">
          <button
            className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg text-gray-300 hover:text-white hover:border border-gray-600 transition-all duration-200 ease-in-out"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
            </motion.div>
            <span className="font-medium">{isExpanded ? "Hide Results" : "Show Results"}</span>
          </button>
        </div>
      )}

      {isExpanded && songs.length > 0 && (
        <>
        
          <ScrollableSection title="Results" songs={songs} handlePlayAll={playAll} handlePlaySong={setSelectedSong} />
        </>
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
            onClick={handlePlayAll}
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
    .replace(/^.*-\s*/, "") // Removes artist part, keeping only the song title
    .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "") // Removes any text inside brackets
    .trim()}
</h3>
<p className="text-xs md:text-sm text-gray-400 truncate">
  {song.artist || song.title.split(" - ")[0].trim()} {/* Extract artist */}
</p>

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

