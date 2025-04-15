"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import usePlaybackStore from '@/store/usePlaybackStore';
import { 
  FaPlay, FaTimes, FaList, FaTrash,
  FaRandom, FaRedo, FaStepForward,
  FaGripLines
} from 'react-icons/fa';
import { useDrag as useWindowDrag, useResize } from '@/hooks/useDragResize';

// SongItem Component (unchanged)
const SongItem = ({ 
  song, 
  index, 
  moveSong, 
  currentSongIndex, 
  handlePlay, 
  handleRemove 
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'SONG',
    item: { index },
    collect: monitor => ({ isDragging: !!monitor.isDragging() }),
  }));

  const [, drop] = useDrop(() => ({
    accept: 'SONG',
    hover: (item) => {
      if (item.index !== index) {
        moveSong(item.index, index);
        item.index = index;
      }
    },
  }));

  const formatDuration = (duration) => {
    if (!duration) return '--:--';
    const [mins, secs] = duration.split(':').slice(-2);
    return `${mins}:${secs.padStart(2, '0')}`;
  };

  const isCurrentSong = index === currentSongIndex;
  const songInfo = [song.artist, song.album, song.year].filter(Boolean).join(' • ');

  return (
    <div
      ref={node => drag(drop(node))}
      className={`flex items-center p-3 rounded-lg transition-all duration-200 
        bg-gray-900/80 backdrop-blur-md border border-gray-700/50 shadow-md 
        group cursor-pointer mb-2 hover:bg-gray-800/70
        ${isCurrentSong ? 'ring-1 ring-green-500 bg-gray-800' : ''}
        ${isDragging ? 'opacity-60 scale-95' : ''}`}
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-10 h-10 mr-3 relative rounded overflow-hidden">
        <img
          src={song.thumbnail || '/default-music-thumbnail.jpg'}
          alt={song.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = '/default-music-thumbnail.jpg';
          }}
        />
        {isCurrentSong && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <FaPlay className="text-white text-xs" />
          </div>
        )}
      </div>
      
      {/* Song Info */}
      <div className="flex-grow min-w-0">
        <p className={`text-sm truncate ${isCurrentSong ? 'text-green-400 font-medium' : 'text-white/90'}`}>
          {song.title}
        </p>
        <p className="text-xs text-white/60 truncate">
          {songInfo}
        </p>
      </div>
      
      {/* Song Controls */}
      <div className="flex items-center ml-2">
        <span className="text-xs text-white/50 mr-3">
          {formatDuration(song.duration)}
        </span>
        
        {!isCurrentSong && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePlay(index);
            }}
            className="p-2 rounded-full bg-white/10 text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
            title="Play now"
          >
            <FaPlay className="text-xs" />
          </button>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRemove(index);
          }}
          className="p-2 ml-1 rounded-full bg-white/10 text-white/80 hover:text-red-400 hover:bg-white/20 transition-all duration-200"
          title="Remove from queue"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>
    </div>
  );
};

// PlaylistQueue Component with drag and resize
const PlaylistQueue = ({ onClose }) => {
  // State management
  const [shuffleMode, setShuffleMode] = useState(false);
  const [repeatMode, setRepeatMode] = useState('none');
  const [isMinimized, setIsMinimized] = useState(false);
  
  // Drag and resize hooks
  const { position, startDrag } = useWindowDrag();
  const { size, startResize } = useResize({ initialWidth: 400, initialHeight: 500 });

  // Store hooks
  const {
    playlist,
    currentSongIndex,
    setCurrentSongIndex,
    setSelectedSong,
    setPlaylist,
    clearPlaylist,
    removeFromPlaylist,
    moveSongInPlaylist,
  } = usePlaybackStore();

  // Load saved state from localStorage
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('playbackPlaylist');
    const savedIndex = localStorage.getItem('playbackCurrentIndex');
    const savedShuffle = localStorage.getItem('playbackShuffle');
    const savedRepeat = localStorage.getItem('playbackRepeat');
    
    if (savedPlaylist) setPlaylist(JSON.parse(savedPlaylist));
    if (savedIndex) setCurrentSongIndex(Number(savedIndex));
    if (savedShuffle) setShuffleMode(savedShuffle === 'true');
    if (savedRepeat) setRepeatMode(savedRepeat);
  }, [setPlaylist, setCurrentSongIndex]); // Added missing dependencies

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('playbackPlaylist', JSON.stringify(playlist));
    localStorage.setItem('playbackCurrentIndex', String(currentSongIndex));
    localStorage.setItem('playbackShuffle', String(shuffleMode));
    localStorage.setItem('playbackRepeat', repeatMode);
  }, [playlist, currentSongIndex, shuffleMode, repeatMode]);

  // Handler functions
  const handleRemove = useCallback((index) => removeFromPlaylist(index), [removeFromPlaylist]);
  const handlePlay = useCallback((index) => {
    setCurrentSongIndex(index);
    setSelectedSong(playlist[index]);
  }, [setCurrentSongIndex, setSelectedSong, playlist]);

  const handleClearAll = useCallback(() => {
    if (confirm('Clear entire playlist?')) {
      clearPlaylist();
      onClose();
    }
  }, [clearPlaylist, onClose]);

  const toggleShuffle = useCallback(() => {
    const newMode = !shuffleMode;
    setShuffleMode(newMode);
    
    if (newMode && playlist.length > 0) {
      const newPlaylist = [...playlist];
      const currentSong = currentSongIndex !== null 
        ? newPlaylist.splice(currentSongIndex, 1)[0] 
        : null;
      newPlaylist.sort(() => Math.random() - 0.5);
      if (currentSong) newPlaylist.splice(currentSongIndex, 0, currentSong);
      setPlaylist(newPlaylist);
    }
  }, [shuffleMode, playlist, currentSongIndex, setPlaylist]);

  const toggleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      const modes = ['none', 'all', 'one'];
      return modes[(modes.indexOf(prev) + 1) % modes.length];
    });
  }, []);

  const moveSong = useCallback((fromIndex, toIndex) => moveSongInPlaylist(fromIndex, toIndex), [moveSongInPlaylist]);

  const getNextSongInfo = useCallback(() => {
    if (currentSongIndex !== null && currentSongIndex < playlist.length - 1) {
      return (
        <div className="flex items-center">
          <FaStepForward className="mr-1 text-white/60" />
          <span className="truncate max-w-[120px] md:max-w-[180px]">
            Next: {playlist[currentSongIndex + 1].title}
          </span>
        </div>
      );
    }
    return repeatMode === 'all' 
      ? `Next: ${playlist[0]?.title || 'End of queue'}` 
      : 'End of queue';
  }, [currentSongIndex, playlist, repeatMode]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div 
        className={`fixed z-[100] bg-[#121212] shadow-2xl border border-gray-800 rounded-xl overflow-hidden ${isMinimized ? 'w-auto h-auto' : ''}`}
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: isMinimized ? 'auto' : `${size.width}px`,
          height: isMinimized ? 'auto' : `${size.height}px`,
        }}
      >
        {/* Header with drag handle */}
        <div 
          className="flex items-center justify-between p-3 bg-[#1e1e1e] cursor-move"
          onMouseDown={startDrag}
        >
          <div className="flex items-center gap-2">
            <FaGripLines className="text-gray-400" />
            <h3 className="font-semibold text-green-400 flex items-center">
              <FaList className="mr-2" /> Playlist Queue
            </h3>
            <span className="text-sm text-blue-400">
              {playlist.length} {playlist.length === 1 ? 'song' : 'songs'}
              {currentSongIndex !== null && ` • ${currentSongIndex + 1}/${playlist.length}`}
            </span>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-all ${shuffleMode ? 'text-green-400 bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              title={`Shuffle ${shuffleMode ? 'on' : 'off'}`}
            >
              <FaRandom size={14} />
            </button>
            
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-all ${repeatMode !== 'none' ? 'text-green-400 bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              title={`Repeat: ${repeatMode}`}
            >
              <FaRedo size={14} />
              {repeatMode === 'one' && (
                <span className="absolute -bottom-0.5 -right-0.5 text-[8px] text-green-400">1</span>
              )}
            </button>

            <button 
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-gray-400 hover:text-white p-1"
            >
              {isMinimized ? '↔' : '−'}
            </button>
            
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <FaTimes size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Song List */}
            <div className="overflow-y-auto p-3 flex-grow custom-scrollbar" style={{ height: `calc(${size.height}px - 120px)` }}>
              {playlist.length === 0 ? (
                <div className="p-4 text-center text-green-400">
                  Your playlist is empty
                </div>
              ) : (
                playlist.map((song, index) => (
                  <SongItem
                    key={`${song.id}-${index}`}
                    song={song}
                    index={index}
                    moveSong={moveSong}
                    currentSongIndex={currentSongIndex}
                    handlePlay={handlePlay}
                    handleRemove={handleRemove}
                  />
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-900/70 border-t border-white/5 flex justify-between items-center">
              <div className="text-xs text-white/70">
                {getNextSongInfo()}
              </div>
              
              <div className="flex space-x-4">
                {playlist.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-1 text-white hover:text-red-600 flex items-center text-xs transition-all"
                    title="Clear playlist"
                  >
                    <FaTrash className="mr-1" /> Clear Playlist
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* Resize handle */}
        {!isMinimized && (
          <div
            className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-700"
            onMouseDown={startResize}
          />
        )}
      </div>
    </DndProvider>
  );
};

export default PlaylistQueue;