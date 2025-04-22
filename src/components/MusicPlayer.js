"use client";

import { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRedo, FaStepBackward, FaStepForward, FaExpand } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import usePlaybackStore from "@/store/usePlaybackStore";
import Hls from "hls.js";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import ExpandedPlayer from "./ExpandedPlayer";
import Link from 'next/link';

export default function MusicPlayer() {
  const selectedSong = usePlaybackStore((state) => state.selectedSong);
  const playlist = usePlaybackStore((state) => state.playlist);
  const currentSongIndex = usePlaybackStore((state) => state.currentSongIndex);
  const setSelectedSong = usePlaybackStore((state) => state.setSelectedSong);
  const setCurrentSongIndex = usePlaybackStore((state) => state.setCurrentSongIndex);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  const audioRef = useRef(null);
  const playerRef = useRef(null);
  const scrollDirection = useScrollDirection();

  const getStringValue = (value) => (typeof value === "string" && value.trim() ? value.trim() : "");

  const trackCover = selectedSong?.cover?.trim()
    ? selectedSong.cover.trim()
    : selectedSong?.id
    ? `https://i.ytimg.com/vi/${selectedSong.id}/hqdefault.jpg`
    : "";

  useEffect(() => {
    if (!selectedSong) return;

    const handleScroll = () => {
      const currentScrollPosition = window.pageYOffset;
      
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const nearBottom = scrollHeight - (currentScrollPosition + clientHeight) < 100;

      if (nearBottom) {
        setIsVisible(true);
      } else if (scrollDirection === 'up') {
        setIsVisible(true);
      } else if (scrollDirection === 'down' && currentScrollPosition > 100) {
        setIsVisible(false);
      }

      setLastScrollPosition(currentScrollPosition);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollDirection, selectedSong]);

  useEffect(() => {
    if (!selectedSong || !audioRef.current) return;
  
    const audioElement = audioRef.current;
    const audioURL = `http://127.0.0.1:5000/audio?id=${selectedSong.id}`;
  
    setIsLoading(true);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    const handleCanPlay = () => {
      setIsLoading(false);
      audioRef.current?.play();
    };

    const handleError = () => {
      setIsLoading(false);
      console.error("Error loading audio");
    };

    audioElement.addEventListener('canplay', handleCanPlay);
    audioElement.addEventListener('error', handleError);

    if (audioElement.canPlayType("audio/mpeg") || audioElement.canPlayType("audio/ogg")) {
      audioElement.src = audioURL;
      audioElement.load();
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(audioURL);
      hls.attachMedia(audioElement);
      hls.on(Hls.Events.MANIFEST_PARSED, handleCanPlay);
      hls.on(Hls.Events.ERROR, handleError);
    } else {
      console.error("HLS not supported in this browser.");
      return;
    }

    return () => {
      audioElement.removeEventListener('canplay', handleCanPlay);
      audioElement.removeEventListener('error', handleError);
      if (audioElement.hls) {
        audioElement.hls.destroy();
      }
    };
  }, [selectedSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = async () => {
    if (!selectedSong || !audioRef.current) return;
    
    try {
      if (isPlaying) {
        await audioRef.current.pause();
      } else {
        setIsLoading(true);
        await audioRef.current.play();
        setIsLoading(false);
      }
      setIsPlaying(!isPlaying);
    } catch (err) {
      console.error("Playback error:", err);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => setCurrentTime(audioRef.current.currentTime);
  const handleLoadedMetadata = () => setDuration(audioRef.current.duration);

  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;
    const progressBar = e.target.getBoundingClientRect();
    const clickX = e.clientX - progressBar.left;
    const newTime = (clickX / progressBar.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleSongEnd = () => {
    if (isRepeated) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNextSong();
    }
  };

  const handlePrevSong = () => {
    if (currentSongIndex > 0) {
      const prevIndex = currentSongIndex - 1;
      setCurrentSongIndex(prevIndex);
      setSelectedSong(playlist[prevIndex]);
    }
  };

  const handleNextSong = () => {
    if (currentSongIndex < playlist.length - 1) {
      const nextIndex = currentSongIndex + 1;
      setCurrentSongIndex(nextIndex);
      setSelectedSong(playlist[nextIndex]);
    }
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const artistName = getStringValue(selectedSong?.artist) || (selectedSong?.title?.includes(" - ") ? getStringValue(selectedSong.title.split(" - ")[0]) : getStringValue(selectedSong?.title));

  return (
    <>
      <AnimatePresence>
        {selectedSong && (
          <motion.div
            key="music-player"
            ref={playerRef}
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: isVisible ? 0 : 100,
              opacity: isVisible ? 1 : 0
            }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-0 left-0 w-full backdrop-blur-md bg-[#0d0d0d]/80 border border-gray-400/20 text-white z-[80] shadow-xl"
          >
            <div className="px-4 pt-0 mt-0 relative">
              <div className="relative w-full h-1 cursor-pointer bg-gray-600 mt-1" onClick={handleSeek}>
                <div
                  className="absolute top-0 left-0 h-full bg-red-500 rounded-full transition-all duration-300"
                  style={{ width: selectedSong ? `${(currentTime / duration) * 100}%` : "0%" }}
                ></div>
                {isLoading && (
                  <div className="absolute top-0 left-0 w-full h-full bg-gray-400 animate-pulse"></div>
                )}
              </div>
            </div>

            {/* Mobile Layout (two rows) */}
            <div className="md:hidden flex flex-col p-2">
              {/* First Row: Image | Song Title | Artist Name | Timer */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {trackCover && (
                    <motion.img
                      key={trackCover}
                      src={trackCover}
                      alt="Track Cover"
                      className="w-10 h-10 object-cover rounded-md"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    {selectedSong && (
                      <>
                        <h3 className="text-sm font-semibold truncate">
                          {getStringValue(selectedSong.title)
                            .replace(/^[^-]*-\s*/, "")
                            .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")}
                        </h3>
                        <p className="text-sm text-gray-400 truncate">
                         <Link
                          href={`/artist/${encodeURIComponent(
                          getStringValue(selectedSong.title)
                           .replace(/-\s*[^-]*$/, "")
                           .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")
                           .trim() || "Unknown Artist"
                           )}`}
                           onClick={(e) => e.stopPropagation()}
                           className="block truncate transition-all duration-200 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:underline underline-offset-2 hover:scale-[1.02]"
                           >
                          {getStringValue(selectedSong.title)
                            .replace(/-\s*[^-]*$/, "")
                            .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")}
                        </Link>
                       </p>

                  </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-2">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              {/* Second Row: Music Controls | Other Controls */}
              <div className="flex items-center justify-between w-full mt-2">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handlePrevSong} 
                    className="text-xl hover:text-red-500 transition-colors"
                    disabled={currentSongIndex <= 0}
                  >
                    <FaStepBackward />
                  </button>
                  <button 
                    onClick={togglePlayPause} 
                    className="text-xl hover:text-red-500 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                      <FaPause />
                    ) : (
                      <FaPlay />
                    )}
                  </button>
                  <button 
                    onClick={handleNextSong} 
                    className="text-xl hover:text-red-500 transition-colors"
                    disabled={currentSongIndex >= playlist.length - 1}
                  >
                    <FaStepForward />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsExpanded(true)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <FaExpand />
                  </button>
                  <FaRedo
                    className={`cursor-pointer hover:text-red-500 transition-colors ${isRepeated ? "text-red-500" : "text-gray-400"}`}
                    onClick={() => setIsRepeated(!isRepeated)}
                  />
                  <button 
                    onClick={() => setIsMuted(!isMuted)} 
                    className="hover:text-red-500 transition-colors"
                  >
                    {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 accent-red-500 hover:accent-red-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex p-4 flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handlePrevSong} 
                  className="text-2xl hover:text-red-500 transition-colors"
                  disabled={currentSongIndex <= 0}
                >
                  <FaStepBackward />
                </button>
                <button 
                  onClick={togglePlayPause} 
                  className="text-2xl hover:text-red-500 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : isPlaying ? (
                    <FaPause />
                  ) : (
                    <FaPlay />
                  )}
                </button>
                <button 
                  onClick={handleNextSong} 
                  className="text-2xl hover:text-red-500 transition-colors"
                  disabled={currentSongIndex >= playlist.length - 1}
                >
                  <FaStepForward />
                </button>
                <div className="text-xs text-gray-400">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {trackCover && (
                  <motion.img
                    key={trackCover}
                    src={trackCover}
                    alt="Track Cover"
                    className="w-12 h-12 object-cover rounded-md"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}
                <div className="flex flex-col text-center w-[200px] truncate">
                  {selectedSong ? (
                    <>
                      <h3 className="text-md font-semibold truncate">
                        {getStringValue(selectedSong.title)
                          .replace(/^[^-]*-\s*/, "")
                          .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                         <Link
                            href={`/artist/${encodeURIComponent(
                            getStringValue(selectedSong.title)
                           .replace(/-\s*[^-]*$/, "")
                           .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")
                            .trim() || "Unknown Artist"
                              )}`}
                             onClick={(e) => e.stopPropagation()}
                             className="block truncate transition-all duration-200 text-gray-400 hover:text-primary-500 dark:hover:text-primary-400 hover:underline underline-offset-2 hover:scale-[1.02]"
                             >
                             {getStringValue(selectedSong.title)
                             .replace(/-\s*[^-]*$/, "")
                            .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")}
                          </Link>
                     </p>
                    </>
                  ) : (
                    <p className="text-lg text-gray-400 italic">No song playing</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsExpanded(true)}
                  className="hover:text-red-500 transition-colors"
                >
                  <FaExpand />
                </button>
                <FaRedo
                  className={`cursor-pointer hover:text-red-500 transition-colors ${isRepeated ? "text-red-500" : "text-gray-400"}`}
                  onClick={() => setIsRepeated(!isRepeated)}
                />
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className="hover:text-red-500 transition-colors"
                >
                  {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 accent-red-500 hover:accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            {selectedSong && (
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleSongEnd}
                onError={() => setIsLoading(false)}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Player Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <ExpandedPlayer onClose={() => setIsExpanded(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
