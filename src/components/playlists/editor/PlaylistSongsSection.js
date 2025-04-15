import { useState, useMemo } from 'react';
import { FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaMusic, FaSearch, FaPlay } from 'react-icons/fa';
import usePlaybackStore from '@/store/usePlaybackStore';

export default function PlaylistSongsSection({
  currentSongs,
  setShowSearch,
  removeSong,
  moveSongUp,
  moveSongDown
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleSongs, setVisibleSongs] = useState(20);
  const { setSelectedSong, setPlaylist, play } = usePlaybackStore();

  // Filter and memoize songs based on search term
  const filteredSongs = useMemo(() => {
    return currentSongs.filter(song => 
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentSongs, searchTerm]);

  // Load more songs when scrolling
  const loadMoreSongs = () => {
    setVisibleSongs(prev => prev + 20);
  };

  // Play all songs in the playlist
  const handlePlayAll = () => {
    const playbackSongs = currentSongs.map(song => ({
      id: song.video_id,
      videoId: song.video_id,
      title: song.title,
      thumbnail: song.thumbnail,
      artist: song.title.split(" - ")[0] || "Unknown Artist"
    }));
    
    setPlaylist(playbackSongs);
    setSelectedSong(playbackSongs[0]);
    play();
  };

  // Play a specific song
  const handlePlaySong = (song) => {
    setSelectedSong({
      id: song.video_id,
      videoId: song.video_id,
      title: song.title,
      thumbnail: song.thumbnail,
      artist: song.title.split(" - ")[0] || "Unknown Artist"
    });
    play();
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">
          Songs ({currentSongs.length})
        </h2>
        <div className="flex items-center gap-3">
          {currentSongs.length > 0 && (
            <button
              onClick={handlePlayAll}
              className="px-4 py-2.5 bg-white/10 hover:border border-purple-400 rounded-lg flex items-center gap-2 text-sm"
            >
              <FaPlay size={12} /> Play All
            </button>
          )}
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add Songs
          </button>
        </div>
      </div>

      {currentSongs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <FaMusic className="text-gray-500" />
          </div>
          <h3 className="text-lg font-medium mb-1">No songs in this playlist</h3>
          <p className="text-gray-400 mb-4">Add some songs to get started</p>
          <button
            onClick={() => setShowSearch(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg"
          >
            Add Songs
          </button>
        </div>
      ) : (
        <>
          {/* Search bar for filtering songs */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Search songs..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setVisibleSongs(20);
              }}
            />
          </div>

          <div className="divide-y divide-gray-700 max-h-[450px] overflow-y-auto custom-scrollbar">
            {filteredSongs.slice(0, visibleSongs).map((song, index) => {
              const [artist, title] = song.title.split(" - ").reverse();
              
              return (
                <div
                  key={song.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-700/50 transition group"
                >
                  <div className="flex-shrink-0 w-12 h-12 relative">
                    <img
                      src={song.thumbnail || "/default-thumbnail.jpg"}
                      alt={song.title}
                      className="w-full h-full object-cover rounded"
                      loading="lazy"
                    />
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 rounded transition-opacity"
                    >
                      <FaPlay className="text-white" />
                    </button>
                  </div>

                  <div 
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => handlePlaySong(song)}
                  >
                    <p className="text-sm text-gray-300 truncate">{artist}</p>
                    <h3 className="font-medium truncate">{title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveSongUp(index)}
                      disabled={index === 0}
                      className={`p-2 rounded-full ${index === 0 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                      <FaArrowUp />
                    </button>
                    <button
                      onClick={() => moveSongDown(index)}
                      disabled={index === currentSongs.length - 1}
                      className={`p-2 rounded-full ${index === currentSongs.length - 1 ? 'text-gray-600' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                    >
                      <FaArrowDown />
                    </button>
                    <button
                      onClick={() => removeSong(song.id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-full transition"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}

            {visibleSongs < filteredSongs.length && (
              <div className="text-center py-4">
                <button
                  onClick={loadMoreSongs}
                  className="px-4 py-2 text-purple-400 hover:text-purple-300 hover:bg-gray-700/50 rounded-lg transition"
                >
                  Load More ({filteredSongs.length - visibleSongs} remaining)
                </button>
              </div>
            )}

            {filteredSongs.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                No songs match your search
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}