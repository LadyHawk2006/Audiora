import { createContext, useContext, useState } from "react";

const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [queue, setQueue] = useState([]); // Stores all songs
  const [currentIndex, setCurrentIndex] = useState(0); // Tracks the current song index

  const currentSong = queue[currentIndex] || null;

  const playNext = () => {
    if (currentIndex < queue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <PlayerContext.Provider value={{ queue, setQueue, currentIndex, setCurrentIndex, currentSong, playNext }}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
