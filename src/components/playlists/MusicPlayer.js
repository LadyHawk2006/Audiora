"use client";

import { useRef, useState, useEffect } from "react";
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaRedo, FaEllipsisV, FaStepBackward, FaStepForward } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function MusicPlayer() {
  const { selectedSong, playlist, currentSongIndex, setSelectedSong, setCurrentSongIndex } = usePlaybackStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);

  const audioRef = useRef(null);

  const getStringValue = (value) => (typeof value === "string" && value.trim() ? value.trim() : "");

  const trackCover = selectedSong?.cover?.trim()
    ? selectedSong.cover.trim()
    : selectedSong?.id
    ? `https://i.ytimg.com/vi/${selectedSong.id}/hqdefault.jpg`
    : "";

  useEffect(() => {
    if (!selectedSong || !audioRef.current) return;

    const audioElement = audioRef.current;
    audioElement.src = `/api/audio?id=${selectedSong.id}`;
    audioElement.load();
    setCurrentTime(0);
    setDuration(0);

    audioElement
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => console.error("Autoplay failed:", err));
  }, [selectedSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (!selectedSong || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
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
      handleNextSong(); // Automatically move to the next song
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
    <AnimatePresence>
      {selectedSong && (
        <motion.div
          key="music-player"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-0 left-0 w-full bg-black text-white z-[80] shadow-xl"
        >
          <div className="px-4 pt-0 mt-0 relative">
            <div className="relative w-full h-1 cursor-pointer bg-gray-600" onClick={handleSeek}>
              <div
                className="absolute top-0 left-0 h-full bg-red-500 rounded-full"
                style={{ width: selectedSong ? `${(currentTime / duration) * 100}%` : "0%" }}
              ></div>
            </div>
          </div>

          <div className="p-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={handlePrevSong} className="text-2xl">
                <FaStepBackward />
              </button>
              <button onClick={togglePlayPause} className="text-2xl">
                {isPlaying ? <FaPause /> : <FaPlay />}
              </button>
              <button onClick={handleNextSong} className="text-2xl">
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
                      {getStringValue(selectedSong.title)
                        .replace(/-\s*[^-]*$/, "")
                        .replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-gray-400 italic">No song playing</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <FaRedo
                className={`cursor-pointer ${isRepeated ? "text-red-500" : "text-gray-400"}`}
                onClick={() => setIsRepeated(!isRepeated)}
              />
              <button onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20"
              />
              <FaEllipsisV className="cursor-pointer" />
            </div>
          </div>

          {selectedSong && (
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleSongEnd}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
