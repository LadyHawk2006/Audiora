import { create } from 'zustand';

export const usePlaylistEditStore = create((set) => ({
    originalPlaylist: null,
    editedPlaylist: null,
    originalSongs: [], 
    currentSongs: [],
    removedSongs: [],
    addedSongs: [],
    newCover: null,
    newBackground: null,
    
    initialize: (playlistData, songs) => set({
      originalPlaylist: playlistData,
      editedPlaylist: { ...playlistData },
      originalSongs: [...songs],
      currentSongs: [...songs],
      removedSongs: [],
      addedSongs: [],
      newCover: null,
      newBackground: null
    }),
  
  updatePlaylistInfo: (updates) => set((state) => ({
    editedPlaylist: { ...state.editedPlaylist, ...updates }
  })),
  
  removeSong: (songId) => set((state) => {
    const songToRemove = state.currentSongs.find(song => song.id === songId);
    return {
      currentSongs: state.currentSongs.filter(song => song.id !== songId),
      removedSongs: songToRemove ? [...state.removedSongs, songToRemove] : state.removedSongs
    };
  }),
  
  addSongs: (newSongs) => set((state) => ({
    currentSongs: [...state.currentSongs, ...newSongs],
    addedSongs: [...state.addedSongs, ...newSongs]
  })),
  
  reorderSongs: (newOrder) => set({
    currentSongs: newOrder
  }),
  
  setNewCover: (file) => set({ newCover: file }),
  setNewBackground: (file) => set({ newBackground: file }),
  
  resetChanges: () => set((state) => ({
    editedPlaylist: { ...state.originalPlaylist },
    currentSongs: [...state.originalSongs],
    removedSongs: [],
    addedSongs: [],
    newCover: null,
    newBackground: null
  })),
  
  isDirty: () => {
    return (state) => {
      if (!state.originalPlaylist || !state.editedPlaylist) return false;
      
      return (
        state.removedSongs.length > 0 ||
        state.addedSongs.length > 0 ||
        state.newCover !== null ||
        state.newBackground !== null ||
        state.editedPlaylist.name !== state.originalPlaylist.name ||
        state.editedPlaylist.description !== state.originalPlaylist.description
      );
    };
  }
}));