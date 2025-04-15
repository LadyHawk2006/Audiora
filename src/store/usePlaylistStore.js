import { create } from "zustand";

const usePlaylistStore = create((set) => ({
  playlist: [],
  
  addToPlaylist: (song) =>
    set((state) => ({
      playlist: state.playlist.some((s) => s.id === song.id)
        ? state.playlist
        : [...state.playlist, song],
    })),

  removeFromPlaylist: (id) =>
    set((state) => ({
      playlist: state.playlist.filter((song) => song.id !== id),
    })),
}));

export default usePlaylistStore;
