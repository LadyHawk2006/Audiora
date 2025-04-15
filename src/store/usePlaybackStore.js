import { create } from "zustand";

const usePlaybackStore = create((set) => ({
  selectedSong: {
    id: null,
    title: "",
    thumbnail: "",
    artist: "",
    videoId: "",
    audioSrc: "",
    duration: "",
    album: "",
    year: null,
  },
  playlist: [],
  currentSongIndex: null,
  isPlaying: false,
  volume: 0.8,
  progress: 0,

  setSelectedSong: (song) =>
    set({
      selectedSong: {
        id: song.id || "",
        title: song.title || "Unknown Title",
        thumbnail: song.thumbnail || "",
        artist: song.artist || "Unknown Artist",
        videoId: song.videoId || "",
        audioSrc: song.audioSrc || "",
        duration: song.duration || "",
        album: song.album || "",
        year: song.year || null,
      },
    }),

  setPlaylist: (playlist) => set({ playlist }),
  setCurrentSongIndex: (index) => set({ currentSongIndex: index }),
  clearPlaylist: () => set({ 
    playlist: [], 
    currentSongIndex: null, 
    selectedSong: {
      id: null,
      title: "",
      thumbnail: "",
      artist: "",
      videoId: "",
      audioSrc: "",
      duration: "",
      album: "",
      year: null,
    }
  }),

  // Playback controls
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  setProgress: (progress) => set({ progress }),

  // Playlist navigation
  nextSong: () =>
    set((state) => {
      if (state.playlist.length === 0) return { currentSongIndex: null, selectedSong: null };
      
      let nextIndex;
      if (state.currentSongIndex === null) {
        nextIndex = 0;
      } else if (state.currentSongIndex + 1 >= state.playlist.length) {
        nextIndex = 0; // Loop to start
      } else {
        nextIndex = state.currentSongIndex + 1;
      }
      
      const nextSong = state.playlist[nextIndex];
      return { 
        currentSongIndex: nextIndex, 
        selectedSong: nextSong,
        isPlaying: true,
        progress: 0
      };
    }),

  prevSong: () =>
    set((state) => {
      if (state.playlist.length === 0) return { currentSongIndex: null, selectedSong: null };
      
      let prevIndex;
      if (state.currentSongIndex === null) {
        prevIndex = state.playlist.length - 1;
      } else if (state.currentSongIndex === 0) {
        prevIndex = state.playlist.length - 1; // Loop to end
      } else {
        prevIndex = state.currentSongIndex - 1;
      }
      
      const prevSong = state.playlist[prevIndex];
      return { 
        currentSongIndex: prevIndex, 
        selectedSong: prevSong,
        isPlaying: true,
        progress: 0
      };
    }),

  // Playlist management
  removeFromPlaylist: (index) =>
    set((state) => {
      const newPlaylist = [...state.playlist];
      newPlaylist.splice(index, 1);
      
      let newIndex = state.currentSongIndex;
      if (index < state.currentSongIndex) {
        newIndex = state.currentSongIndex - 1;
      } else if (index === state.currentSongIndex) {
        // If we removed the currently playing song
        newIndex = Math.min(state.currentSongIndex, newPlaylist.length - 1);
      }
      
      return {
        playlist: newPlaylist,
        currentSongIndex: newIndex,
        selectedSong: newPlaylist[newIndex] || null,
        isPlaying: newPlaylist.length > 0 && state.isPlaying,
      };
    }),

  moveSongInPlaylist: (fromIndex, toIndex) =>
    set((state) => {
      const newPlaylist = [...state.playlist];
      const [movedSong] = newPlaylist.splice(fromIndex, 1);
      newPlaylist.splice(toIndex, 0, movedSong);
      
      let newCurrentIndex = state.currentSongIndex;
      if (state.currentSongIndex === fromIndex) {
        newCurrentIndex = toIndex;
      } else if (
        fromIndex < state.currentSongIndex && 
        toIndex >= state.currentSongIndex
      ) {
        newCurrentIndex = state.currentSongIndex - 1;
      } else if (
        fromIndex > state.currentSongIndex && 
        toIndex <= state.currentSongIndex
      ) {
        newCurrentIndex = state.currentSongIndex + 1;
      }
      
      return {
        playlist: newPlaylist,
        currentSongIndex: newCurrentIndex,
      };
    }),

  // Shuffle functionality
  shufflePlaylist: () =>
    set((state) => {
      if (state.playlist.length === 0) return {};
      
      const newPlaylist = [...state.playlist];
      // Keep current song at its position if playing
      if (state.currentSongIndex !== null) {
        const currentSong = newPlaylist.splice(state.currentSongIndex, 1)[0];
        newPlaylist.sort(() => Math.random() - 0.5);
        newPlaylist.splice(state.currentSongIndex, 0, currentSong);
      } else {
        newPlaylist.sort(() => Math.random() - 0.5);
      }
      
      return {
        playlist: newPlaylist,
      };
    }),

  // Add to playlist
  addToPlaylist: (song) =>
    set((state) => {
      const newPlaylist = [...state.playlist, song];
      return {
        playlist: newPlaylist,
        // If nothing was playing, start playing the new song
        ...(state.currentSongIndex === null && {
          currentSongIndex: 0,
          selectedSong: song,
          isPlaying: true
        })
      };
    }),

  // Insert at specific position
  insertIntoPlaylist: (song, index) =>
    set((state) => {
      const newPlaylist = [...state.playlist];
      newPlaylist.splice(index, 0, song);
      
      let newCurrentIndex = state.currentSongIndex;
      if (state.currentSongIndex !== null && index <= state.currentSongIndex) {
        newCurrentIndex = state.currentSongIndex + 1;
      }
      
      return {
        playlist: newPlaylist,
        currentSongIndex: newCurrentIndex,
        ...(state.currentSongIndex === null && {
          currentSongIndex: index,
          selectedSong: song,
          isPlaying: true
        })
      };
    }),
}));

export default usePlaybackStore;