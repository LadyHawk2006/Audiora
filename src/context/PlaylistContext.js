"use client";

import { createContext, useState, useRef, useEffect } from "react";

export const PlaylistContext = createContext();

export function PlaylistProvider({ children }) {
  const [playlist, setPlaylist] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const audioRef = useRef(null);

  // **Play Selected Song**
  const playSong = (song) => {
    setCurrentSong(song);
  };

  // **Add Song to Playlist**
  const addToPlaylist = (song) => {
    setPlaylist((prev) => {
      if (!prev.find((item) => item.id === song.id)) {
        return [...prev, song];
      }
      return prev;
    });
  };

  // **Remove Song from Playlist**
  const removeFromPlaylist = (songId) => {
    setPlaylist((prev) => prev.filter((song) => song.id !== songId));
  };

  // **Autoplay When New Song is Set**
  useEffect(() => {
    if (currentSong && audioRef.current) {
      audioRef.current.src = `/api/audio?id=${currentSong.id}`;
      audioRef.current.load();
      audioRef.current
        .play()
        .catch((err) => console.error("Playback error:", err));
    }
  }, [currentSong]);

  return (
    <PlaylistContext.Provider value={{ playlist, currentSong, playSong, addToPlaylist, removeFromPlaylist }}>
      {children}
      {/* Hidden Audio Player */}
      <audio ref={audioRef} />
    </PlaylistContext.Provider>
  );
}
