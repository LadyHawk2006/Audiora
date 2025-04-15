"use client"; // This must be at the very top

import { useState } from "react";
import dynamic from 'next/dynamic';

// Dynamically import ALL components that might use browser APIs
const SearchBar = dynamic(() => import("@/components/playlists/SearchBar"), { ssr: false });
const PlaylistPreview = dynamic(() => import("@/components/playlists/PlaylistPreview"), { ssr: false });
const CreatePlaylistModal = dynamic(() => import("@/components/playlists/CreatePlaylistModal"), { ssr: false });
const PlaylistProvider = dynamic(() => import("@/context/PlaylistContext"), { ssr: false });

export default function CreatePlaylist() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSavePlaylist = async (playlistData) => {
    try {
      const playlistId = await savePlaylistToSupabase(playlistData);
      console.log("Playlist saved successfully:", playlistId);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error saving playlist:", error);
    }
  };

  return (
    <PlaylistProvider>
      <div className="p-6 bg-black min-h-screen text-white">
        <SearchBar/>
        <PlaylistPreview />

        <div className="mb-30 flex justify-center mt-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-[#1db954] text-white font-bold rounded-lg shadow-md hover:bg-[#1ed760] transition"
          >
            Create Playlist
          </button>
        </div>
      </div>

      <CreatePlaylistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        savePlaylist={handleSavePlaylist}
      />
    </PlaylistProvider>
  );
}