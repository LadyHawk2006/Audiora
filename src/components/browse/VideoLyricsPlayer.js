"use client";
import { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaSearch, FaRedo } from "react-icons/fa";
import { motion } from "framer-motion";

export default function SearchVideo() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [repeat, setRepeat] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const playerRef = useRef(null);

  const fetchResults = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.get(`/api/videos?query=${query}`);
      setResults(data.videos || []);
    } catch (err) {
      console.error("Error fetching results", err);
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = (state) => {
    setProgress(state.played * 100);
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (dur) => setDuration(dur);

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="w-full max-w-7.5xl mx-auto p-8 bg-black/30 text-white shadow-xl backdrop-blur-lg border border-white/10">
      {/* Search Bar */}
      <div className="flex items-center space-x-3 mb-6">
        <input
          type="text"
          className="w-full p-3 bg-black/50 border border-gray-600 rounded-lg focus:ring-[#1db954] text-white placeholder-gray-300 focus:outline-none focus:border-[#1db954]"
          placeholder="Search for videos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchResults()}
        />
        <button
          className={`px-5 py-3 rounded-lg text-white font-semibold transition-all ${
            loading ? "bg-gray-500 cursor-not-allowed" : "border border-gray transform hover:scale-105"
          }`}
          onClick={fetchResults}
          disabled={loading}
        >
          {loading ? "Loading..." : <FaSearch />}
        </button>
      </div>

      {/* Video Player Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/50 p-4 rounded-lg border border-gray-600 relative shadow-lg">
          {selectedVideo ? (
            <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/embed/${selectedVideo.id}?modestbranding=0&showinfo=0&rel=0&controls=0`}
              playing={playing}
              controls={false}
              width="100%"
              height="300px"
              volume={volume}
              loop={repeat}
              className="rounded-lg"
              onProgress={handleProgress}
              onDuration={handleDuration}
            />
          ) : (
            <img
              src="/images/logo-ph.png"
              alt="Select a video to play"
              className="w-full h-[300px] object-cover rounded-lg"
            />
          )}

          {/* Custom Controls */}
          {selectedVideo && (
            <div className="mt-3">
              {/* Progress Bar & Timer */}
              <div className="flex items-center gap-4 text-gray-300 text-sm mb-4">
                {/* Current Time & Duration */}
                <span className="font-medium text-white w-18 text-right">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                {/* Progress Bar */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => {
                    const seekTime = (parseFloat(e.target.value) / 100) * duration;
                    playerRef.current.seekTo(seekTime);
                  }}
                  className="w-115 h-1 bg-gray-900 rounded-full appearance-none cursor-pointer transition duration-50 ease-in-out 
                  focus:outline-none 
                  [&::-webkit-slider-runnable-track]:bg-gray-700 
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-1.5 [&::-webkit-slider-thumb]:w-1 
                  [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-red-500 [&::-webkit-slider-thumb]:to-pink-500 
                  [&::-webkit-slider-thumb]:rounded-full shadow-lg"
                />
              </div>

              {/* Play/Pause, Repeat, Volume Controls */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
                <div className="flex items-center space-x-4">
                  {/* Play/Pause */}
                  <button
                    onClick={() => setPlaying(!playing)}
                    className="p-2 bg-gray-800 rounded-full hover:bg-gray-600 transition"
                  >
                    {playing ? <FaPause className="text-white text-lg" /> : <FaPlay className="text-white text-lg" />}
                  </button>

                  {/* Repeat Button */}
                  <button
                    onClick={() => setRepeat(!repeat)}
                    className={`p-2 rounded-full transition ${
                      repeat ? "ring-2 ring-green-500 hover:bg-green-900" : "bg-gray-800 hover:bg-gray-600"
                    }`}
                  >
                    <FaRedo className="text-white text-lg" />
                  </button>

                  {/* Volume Control */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                      className="p-2 bg-gray-800 rounded-full hover:bg-gray-600 transition"
                    >
                      {volume === 0 ? <FaVolumeMute className="text-white text-lg" /> : <FaVolumeUp className="text-white text-lg" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-[80px] cursor-pointer bg-gray-700 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
          {/* Introductory Text */}
          {!loading && results.length === 0 && (
            <div>
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center text-gray-400 mt-8"
          >
            {/* Animated Search Icon */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "backOut", delay: 0.3 }}
              className="p-6 bg-gray-800/60 rounded-full shadow-lg"
            >
              <FaSearch className="text-6xl text-gray-300 animate-pulse" />
            </motion.div>
      
            {/* Animated Text */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-2xl font-bold text-white mt-4"
            >
              Welcome to <span className="text-[#1db954]">Music-X</span> Video Search
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-l text-green-400 mt-2"
            >
              Search for a video, and results will appear here.
            </motion.p>
          </motion.div><motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center justify-center text-center text-gray-400 mt-8"
    >
    </motion.div>
    </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(7)].map((_, index) => (
                <div key={index} className="h-16 bg-gray-700 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <ul className="grid grid-cols-1 ml-2 mr-3 mt-1 gap-4">
              {results.map((video) => (
                <li
                  key={video.id}
                  className="group flex items-center gap-2 p-3 rounded-lg bg-black/30 hover:bg-black/50 border border-gray-700 transition cursor-pointer"
                  onClick={() => setSelectedVideo(video)}
                >
                  <img src={video.thumbnail} alt={video.title} className="w-16 h-16 rounded-lg object-cover shadow-md" />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-white font-semibold text-lg truncate">{video.title}</p>
                    <p className="text-sm text-gray-400 truncate">{video.channel}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
