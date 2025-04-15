import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import SearchBar from "@/components/playlists/editor/SearchBar";
import SongSearchResults from "@/components/playlists/SongSearchResults";

export default function SongSearchModal({
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  searchResults,
  handleSearch,
  handleAddSong
}) {
  return (
    <AnimatePresence>
      {showSearch && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4 custom-scrollbar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSearch(false)}
        >
          <motion.div
            className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl shadow-xl border border-gray-700 relative max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-700"
              onClick={() => setShowSearch(false)}
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-xl font-bold mb-4">Add Songs to Playlist</h2>
            
            <SearchBar 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
            />
            
            {searchResults.length > 0 ? (
             <SongSearchResults 
              results={searchResults}
              onAddSong={(song) => {
              handleAddSong({
               videoId: song.videoId,
               title: song.title,
               thumbnail: song.thumbnail
                });
             }}
            />
            ) : (
              <div className="text-center py-8 text-gray-400">
                {searchQuery ? "No results found" : "Search for songs to add"}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}