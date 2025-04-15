"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { FaPlay, FaRandom } from "react-icons/fa";
import usePlaybackStore from "@/store/usePlaybackStore";
import { motion } from "framer-motion";

// Mood themes configuration
const moodThemes = {
  "Hype Mode": "#ff5733",
  "Chill & Relax": "#4a90e2",
  "Sad Hours": "#6c757d",
  "Party Starter": "#ffcc00",
  "Focus Mode": "#8e44ad",
  "Workout Boost": "#e74c3c",
  "Love & Romance": "#e84393",
  "Angry Mode": "#c0392b",
  "Feel-Good Vibes": "#1abc9c",
  "Throwback Hits": "#f39c12",
};

const moods = Object.keys(moodThemes);

// Helper function to extract text from YouTube API response objects
const extractText = (obj) => {
  if (typeof obj === 'string') return obj;
  if (obj?.text) return obj.text;
  if (obj?.runs?.[0]?.text) return obj.runs[0].text;
  return '';
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnail = (thumbnails, videoId) => {
  if (!thumbnails || !Array.isArray(thumbnails)) return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;
  
  // First try to find a URL matching the YouTube thumbnail pattern
  const ytThumbnail = thumbnails.find(t => 
    t.url?.includes('i.ytimg.com/vi/') && t.url?.includes('/hq720.jpg')
  );
  
  if (ytThumbnail) return ytThumbnail.url;
  
  // If no matching URL found, return default YouTube thumbnail
  return `https://i.ytimg.com/vi/${videoId}/hq720.jpg`;
};

export default function MoodPlaylists() {
  // Get store actions directly to avoid SSR issues
  const setPlaylist = usePlaybackStore((state) => state.setPlaylist);
  const setSelectedSong = usePlaybackStore((state) => state.setSelectedSong);
  const shufflePlaylist = usePlaybackStore((state) => state.shufflePlaylist);

  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);

  // Format songs for the playlist
  const formatSongsForPlaylist = useCallback((songs) => {
    return songs.map((song) => ({
      id: song.id,
      title: extractText(song.title) || extractText(song.channel) || "Music Track",
      thumbnail: getYouTubeThumbnail(song.thumbnails, song.id),
      artist: extractText(song.channel) || "Various Artists",
      videoId: song.id || "",
      audioSrc: "",
      duration: song.duration || "0:00",
      album: selectedMood + " Playlist",
      year: null,
    }));
  }, [selectedMood]);

  // Fetch Songs Based on Mood
  const fetchMoodSongs = useCallback(
    async (append = false, newOffset = 0) => {
      if (!append) {
        setSongs([]);
        setOffset(0);
      }
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/mood-playlists?mood=${encodeURIComponent(
            selectedMood
          )}&offset=${newOffset}`
        );
        if (!res.ok) throw new Error("Failed to fetch songs.");

        const data = await res.json();
        if (!data.songs || !Array.isArray(data.songs))
          throw new Error("Invalid data format.");

        setSongs((prevSongs) => {
          const newSongs = data.songs.filter(
            (song) => !prevSongs.some((s) => s.id === song.id)
          );
          return append ? [...prevSongs, ...newSongs] : newSongs;
        });
        setOffset(newOffset + data.songs.length);
      } catch (error) {
        console.error("❌ Error fetching mood songs:", error);
        setError(error.message);
        if (!append) setSongs([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedMood]
  );

  // Load songs when mood changes
  useEffect(() => {
    fetchMoodSongs(false, 0);
  }, [selectedMood, fetchMoodSongs]);

  // Handle play all with shuffle option
  const handlePlayAll = useCallback(
    (shuffle = false) => {
      if (songs.length === 0) return;

      const formattedSongs = formatSongsForPlaylist(songs);
      setPlaylist(formattedSongs);
      setSelectedSong(formattedSongs[0]);

      if (shuffle) {
        shufflePlaylist();
      }
    },
    [songs, formatSongsForPlaylist, setPlaylist, setSelectedSong, shufflePlaylist]
  );

  const handleSongSelect = useCallback(
    (song) => {
      setSelectedSong({
        id: song.id,
        title: extractText(song.title) || extractText(song.channel) || "Music Track",
        thumbnail: getYouTubeThumbnail(song.thumbnails, song.id),
        artist: extractText(song.channel) || "Various Artists",
        videoId: song.id || "",
        audioSrc: "",
        duration: song.duration || "0:00",
        album: selectedMood + " Playlist",
        year: null,
      });
    },
    [selectedMood, setSelectedSong]
  );

  // Memoized song chunks for the two rows
  const [firstRowSongs, secondRowSongs] = useMemo(() => {
    const half = Math.ceil(songs.length / 2);
    return [songs.slice(0, half), songs.slice(half)];
  }, [songs]);

  // Current mood color
  const moodColor = moodThemes[selectedMood];

  return (
    <div className="min-h-screen mb-4 p-4 md:p-8 lg:p-12 text-white bg-transparent">
      {/* Mood Title & Action Buttons */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4 border border-gray-400 rounded-lg overflow-hidden">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center p-4 w-full md:w-auto rounded-xl"
          style={{
            backgroundColor: `${moodColor}30`,
            color: moodColor,
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {selectedMood} Songs
        </motion.h2>

        {songs.length > 0 && (
          <div className="flex gap-2 p-2">
            <button
              onClick={() => handlePlayAll()}
              className="flex items-center gap-2 px-5 py-2 text-lg font-semibold text-white rounded-lg shadow-lg border border-white hover:scale-105 transition-all"
              style={{
                backgroundColor: `${moodColor}80`,
              }}
              aria-label="Play all"
            >
              <FaPlay />
              Play All
            </button>
          </div>
        )}
      </div>

      {/* Mood Selection */}
      <div className="overflow-x-auto p-3 bg-white/10 shadow-lg rounded-lg custom-scrollbar">
        <div className="flex gap-3 md:gap-4 min-w-max">
          {moods.map((mood) => (
            <button
              key={mood}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                selectedMood === mood
                  ? "text-white border border-white shadow-lg scale-105"
                  : "text-gray-300 border border-transparent hover:bg-white/10"
              }`}
              onClick={() => setSelectedMood(mood)}
              style={{
                backgroundColor:
                  selectedMood === mood ? `${moodThemes[mood]}60` : "transparent",
              }}
              aria-label={`Select ${mood} mood`}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <motion.div
          className="text-red-500 mt-4 text-center p-3 bg-red-500/10 rounded-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Song Grid */}
      <div className="relative mt-6 border-t border-b border-gray-700 p-2 rounded-lg">
        <div className="overflow-x-auto custom-scrollbar p-2">
          <div className="flex flex-col gap-4 w-max">
            {/* First Row */}
            <div className="flex gap-4">
              {loading
                ? Array(8)
                    .fill(null)
                    .map((_, index) => (
                      <motion.div
                        key={`loading-1-${index}`}
                        className="bg-white/10 animate-pulse rounded-xl p-3 backdrop-blur-lg flex-shrink-0"
                        style={{ width: "180px" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </motion.div>
                    ))
                : firstRowSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      moodColor={moodColor}
                      onClick={() => handleSongSelect(song)}
                    />
                  ))}
            </div>

            {/* Second Row */}
            <div className="flex gap-4">
              {loading
                ? Array(8)
                    .fill(null)
                    .map((_, index) => (
                      <motion.div
                        key={`loading-2-${index}`}
                        className="bg-white/10 animate-pulse rounded-xl p-3 backdrop-blur-lg flex-shrink-0"
                        style={{ width: "180px" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <div className="w-full aspect-square bg-gray-700 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-600 rounded w-3/4 mb-1"></div>
                        <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      </motion.div>
                    ))
                : secondRowSongs.map((song) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      moodColor={moodColor}
                      onClick={() => handleSongSelect(song)}
                    />
                  ))}
            </div>
          </div>
        </div>

        {/* Load More Button */}
        {!loading && songs.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => fetchMoodSongs(true, offset)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              style={{ color: moodColor }}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Extracted Song Card component
function SongCard({ song, moodColor, onClick }) {
  const title = extractText(song.title) || extractText(song.channel) || "Music Track";
  const artist = extractText(song.channel) || "Various Artists";
  const thumbnail = getYouTubeThumbnail(song.thumbnails, song.id);
  
  return (
    <motion.div
      className="relative flex-shrink-0 w-44 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg transition-transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ boxShadow: `0 0 15px ${moodColor}80` }}
    >
      <div className="absolute inset-0 flex justify-center items-center opacity-0 hover:opacity-100 transition-opacity">
        <button 
          className="bg-black/40 p-3 rounded-full backdrop-blur-md border border-white/20 hover:bg-black/60 transition-colors"
          aria-label="Play song"
        >
          <FaPlay className="text-white text-lg" />
        </button>
      </div>

      <img
        src={thumbnail}
        alt={title}
        className="w-full aspect-square object-cover rounded-lg shadow-md"
        loading="lazy"
        onError={(e) => {
          e.target.src = `https://i.ytimg.com/vi/${song.id}/hq720.jpg`;
        }}
      />
      <h3 className="text-white font-semibold text-sm truncate mt-2">
        {title}
      </h3>
      <p className="text-gray-400 text-xs truncate">
        {artist}
      </p>
    </motion.div>
  );
}