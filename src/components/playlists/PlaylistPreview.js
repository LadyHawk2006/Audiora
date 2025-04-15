"use client";

import { useState, useEffect } from "react";
import { FaPlay, FaTrash, FaTimes, FaGripLines } from "react-icons/fa";
import { useDrag, useResize } from "@/hooks/useDragResize";
import usePlaylistStore from "@/store/usePlaylistStore";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function PlaylistPreviewModal() {
  const { playlist, removeFromPlaylist } = usePlaylistStore();
  const {
    setSelectedSong,
    setPlaylist,
    setCurrentSongIndex,
    play,
  } = usePlaybackStore();
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const { position, startDrag } = useDrag();
  const { size, startResize } = useResize({ initialWidth: 400, initialHeight: 500 });

  useEffect(() => {
    if (playlist.length > 0) {
      setIsVisible(true);
    }
  }, [playlist.length]);

  const handlePlayAll = () => {
    if (playlist.length === 0) return;
    
    setPlaylist(playlist);
    setCurrentSongIndex(0);
    setSelectedSong(playlist[0]);
    play();
  };

  const handlePlaySong = (song, index) => {
    setPlaylist(playlist);
    setCurrentSongIndex(index);
    setSelectedSong(song);
    play();
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed z-50 bg-[#121212] shadow-2xl border border-gray-800 rounded-xl overflow-hidden ${isMinimized ? 'w-auto h-auto' : ''}`}
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
          <h2 className="text-lg font-bold text-gray-100">Playlist Preview</h2>
          {playlist.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-[#1db954] text-xs rounded-full">
              {playlist.length} {playlist.length === 1 ? 'song' : 'songs'}
            </span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-gray-400 hover:text-white p-1"
          >
            {isMinimized ? '↔' : '−'}
          </button>
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-white p-1"
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-4 h-full overflow-hidden flex flex-col">
          {playlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-gray-400 flex-grow">
              <div className="animate-bounce text-4xl text-[#1db954]">🎵</div>
              <p className="mt-4 text-lg font-medium text-center">
                No songs yet! Add tracks to see them here.
              </p>
            </div>
          ) : (
            <>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={handlePlayAll}
                  className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition"
                >
                 Play All
                </button>
        
              </div>
              
              <div className="overflow-y-auto flex-grow custom-scrollbar">
                <ul className="space-y-3 mb-14">
                  {playlist.map((song, index) => (
                    <li
                      key={song.id}
                      className="flex items-center justify-between bg-[#1e1e1e] p-3 rounded-lg shadow-md border border-gray-700 transition hover:shadow-xl hover:bg-[#292929]"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={song.thumbnail}
                          alt={song.title}
                          className="w-14 h-14 rounded-lg object-cover shadow-md"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-100 leading-tight">{song.title}</p>
                          <p className="text-xs text-gray-400">{song.artist}</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => handlePlaySong(song, index)}
                          className="text-green-400 hover:text-green-300 transition transform hover:scale-110"
                        >
                          <FaPlay size={18} />
                        </button>
                        <button
                          onClick={() => removeFromPlaylist(song.id)}
                          className="text-red-500 hover:text-red-400 transition transform hover:scale-110"
                        >
                          <FaTrash size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}

      {/* Resize handle */}
      {!isMinimized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-700"
          onMouseDown={startResize}
        />
      )}
    </div>
  );
}