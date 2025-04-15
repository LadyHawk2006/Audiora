"use client";

import { motion } from "framer-motion";
import { FaPlay, FaVideo } from "react-icons/fa";
import { DndProvider, useDrag } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import usePlaybackStore from "@/store/usePlaybackStore";
import { useEffect, useState } from "react";
import Link from 'next/link';
import EmbeddedVideoPlayer from './EmbeddedVideoPlayer';

const SongItem = ({ song, index, isCurrent, onClick }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "SONG",
    item: { index },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      onClick={() => onClick(index)}
      className={`flex items-center p-3 rounded-lg mb-2 cursor-pointer transition-all
        ${isCurrent ? "bg-indigo-900/30 border border-indigo-700/50" : "hover:bg-gray-800/20"}
        ${isDragging ? "opacity-50" : "opacity-100"}
        backdrop-blur-sm`}
    >
      <div className="w-10 h-10 mr-3 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800/30">
        <img
          src={song.thumbnail || `https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`}
          alt={song.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm truncate ${isCurrent ? "text-indigo-300 font-medium" : "text-white"}`}>
         {song.title?.split('-')[1]?.trim() || song.title}
       </h4>
       <p className="text-xs text-gray-400 truncate">
         <Link
          href={`/artist/${encodeURIComponent(song.title?.split('-')[0]?.trim() || "Unknown Artist")}`}
          className="hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
          onClick={(e) => e.stopPropagation()}
         >
          {song.title?.split('-')[0]?.trim() || "Unknown Artist"}
        </Link>
       </p>
     </div>

      {isCurrent && (
        <div className="ml-2 text-indigo-300">
          <FaPlay size={12} />
        </div>
      )}
    </div>
  );
};

const ExpandedPlayer = ({ onClose }) => {
  const {
    selectedSong,
    playlist,
    currentSongIndex,
    setCurrentSongIndex,
    setSelectedSong,
    isPlaying,
    pause,
    play
  } = usePlaybackStore();

  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (selectedSong?.id) {
      setCurrentVideoId(selectedSong.id);
    }
  }, [selectedSong?.id]);

  const handlePlaySong = (index) => {
    setCurrentSongIndex(index);
    setSelectedSong(playlist[index]);
  };

  const toggleVideo = () => {
    if (showVideo) {
      if (isPlaying) {
        play();
      }
    } else {
      pause();
    }
    setShowVideo(!showVideo);
  };

  if (!selectedSong) return null;

  const trackCover = selectedSong?.cover?.trim()
    ? selectedSong.cover.trim()
    : selectedSong?.id
    ? `https://i.ytimg.com/vi/${selectedSong.id}/maxresdefault.jpg`
    : "/default-cover.jpg";

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed bg-transparent"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                  w-full max-w-8xl h-[85vh] max-h-[800px] 
                  bg-gray-900/50 border border-gray-700/30
                  overflow-hidden shadow-2xl flex flex-col backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl 
                    bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/30
                    text-gray-300 hover:text-white transition-all"
          aria-label="Close player"
        >
          Close
        </button>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="flex flex-col lg:flex-row gap-8 h-full">
            <div className="lg:w-1/2 flex flex-col">
              <div className="relative overflow-hidden rounded-2xl shadow-2xl mt-10 mb-6 aspect-square bg-gray-800/20 border border-gray-700/30">
                {showVideo ? (
                  <EmbeddedVideoPlayer 
                    videoId={currentVideoId}
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <>
                    <motion.img
                      src={trackCover}
                      alt="Album cover"
                      className="absolute inset-0 w-full h-full object-cover"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  </>
                )}
                
                <button
                  onClick={toggleVideo}
                  className={`absolute top-4 right-4 z-10 p-3 rounded-full 
                            ${showVideo ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-800/70 hover:bg-gray-700/70'} 
                            text-white transition-all shadow-lg`}
                  aria-label={showVideo ? "Show thumbnail" : "Show video"}
                >
                  <FaVideo size={18} />
                </button>
              </div>

              <div className="text-center px-4">
                <motion.h2 
                  className="text-3xl font-bold mb-2 line-clamp-2 text-white"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {selectedSong.title}
                </motion.h2>
              </div>
            </div>

            <div className="lg:w-1/2 flex flex-col">
              <motion.h3 
                className="text-xl font-semibold mb-4 px-2 text-white"
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Playlist
                <span className="text-gray-400 text-sm font-normal ml-2">
                  {playlist.length} {playlist.length === 1 ? "song" : "songs"}
                </span>
              </motion.h3>
              
              <DndProvider backend={HTML5Backend}>
                <motion.div
                  className="flex-1 bg-gray-900/30 p-4 overflow-y-auto border border-gray-700/30 mb-4 custom-scrollbar"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {playlist.length === 0 ? (
                    <motion.p 
                      className="text-gray-400 text-center py-8 border border-dashed border-gray-600/30 rounded-lg"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Your playlist is empty
                    </motion.p>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      {playlist.map((song, index) => (
                        <SongItem
                          key={`${song.id}-${index}`}
                          song={song}
                          index={index}
                          isCurrent={index === currentSongIndex}
                          onClick={handlePlaySong}
                        />
                      ))}
                    </motion.div>
                  )}
                </motion.div>
              </DndProvider>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default ExpandedPlayer;