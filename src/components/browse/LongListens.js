"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaPlay } from 'react-icons/fa';
import usePlaybackStore from "@/store/usePlaybackStore";

const LongListensComponent = () => {
  const [listens, setListens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const { setSelectedSong, setPlaylist, setCurrentSongIndex } = usePlaybackStore();

  const fetchData = async () => {
    try {
      const response = await fetch('/api/longlistens');
      const data = await response.json();
      if (data.success) {
        setListens(data.listens);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    fetchData();
  };

  const handlePlay = (item) => {
    const song = {
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      artist: item.creator,
      videoId: item.videoId,
      audioSrc: item.audioUrl || '',
    };

    setSelectedSong(song);
    setPlaylist(listens.map(item => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      artist: item.creator,
      videoId: item.videoId,
      audioSrc: item.audioUrl || '',
    })));
    setCurrentSongIndex(listens.findIndex(listen => listen.id === item.id));
  };

  const row1 = listens.filter((_, index) => index % 2 === 0);
  const row2 = listens.filter((_, index) => index % 2 !== 0);

  return (
    <div className="mt-4 px-4 md:px-8 py-2 text-white">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-xl font-semibold text-green-500 p-2 pb-1 tracking-wide">
          Playlists
        </h2>

        <button
          className="flex items-center gap-2 px-4 py-2 mb-2 rounded-lg text-gray-300 hover:text-white hover:border border-gray-600 transition-all duration-200 ease-in-out"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          disabled={loading}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
          </motion.div>
          <span className="font-medium">
            {isExpanded ? "Hide List" : "Show List"}
          </span>
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
          <button 
            onClick={retryFetch} 
            className="ml-2 text-white underline"
          >
            Retry
          </button>
        </div>
      )}

      {isExpanded && (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"></div>
                <FaPlay className="absolute inset-0 m-auto text-green-500" size={20} />
              </div>
              <p className="text-green-500 font-medium">Loading Playlists...</p>
              <p className="text-gray-400 text-sm">Discovering the best long listens for you</p>
            </div>
          ) : listens.length > 0 ? (
            <ScrollableSection listens={listens} row1={row1} row2={row2} onPlay={handlePlay} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-2">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                <FaPlay className="text-gray-600" size={24} />
              </div>
              <p className="text-gray-400">No long listens found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function ScrollableSection({ listens, row1, row2, onPlay }) {
  return (
    <div className="mb-6 bg-transparent p-1 md:p-0">
      <div className="overflow-x-auto pb-4 custom-scrollbar p-2">
        <div className="flex flex-col gap-4 w-max">
          <div className="flex gap-4">
            {row1.map((item) => (
              <ListenCard key={item.id} item={item} onPlay={() => onPlay(item)} />
            ))}
          </div>
          <div className="flex gap-4">
            {row2.map((item) => (
              <ListenCard key={item.id} item={item} onPlay={() => onPlay(item)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ListenCard({ item, onPlay }) {
  return (
    <div 
      className="group relative flex flex-col items-start gap-2 p-2 rounded-lg bg-black/30 hover:bg-black/50 hover:ring-1 ring-green-500 border border-gray-700 transition cursor-pointer w-[210px]"
      onClick={onPlay}
    >
      <div className="relative w-full aspect-video rounded-md overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.title}
          width={280}
          height={157}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "/default-music-thumbnail.jpg";
          }}
        />
        <button className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
          <FaPlay className="text-white text-lg" />
        </button>
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {item.duration}
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <h3 className="text-sm md:text-base font-semibold truncate" title={item.title}>
          {item.title}
        </h3>
        <p className="text-xs md:text-sm text-gray-400 truncate">
          {item.creator}
        </p>
      </div>
    </div>
  );
}

export default LongListensComponent;