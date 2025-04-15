import { create } from 'zustand';

const useQueueStore = create((set) => ({
  queue: [], // List of songs in the queue
  currentSong: null, // The currently playing song
  isPlaying: false, // Play/pause state

  setQueue: (songs) => set({ queue: songs }),
  addToQueue: (song) => set((state) => ({ queue: [...state.queue, song] })),
  removeFromQueue: (index) => set((state) => ({
    queue: state.queue.filter((_, i) => i !== index),
  })),
  
  setCurrentSong: (song) => set({ currentSong: song }),
  playNext: () => set((state) => {
    const nextSong = state.queue[1] || null;
    return { currentSong: nextSong, queue: state.queue.slice(1) };
  }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));

export default useQueueStore;
