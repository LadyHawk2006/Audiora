"use client";

import { useEffect, useState } from "react";
import usePlaybackStore from "@/store/usePlaybackStore";
import MusicPlayer from "@/components/MusicPlayer";
import PlaylistQueue from "@/components/PlaylistQueue";
import { FaList } from "react-icons/fa";
import Header from "@/components/Header";
import { AuthProvider } from "@/context/AuthContext"; // Adjust the import path as needed

export default function ClientLayout({ children }) {
  const { selectedSong, playlist } = usePlaybackStore();
  const [isMobile, setIsMobile] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen relative">
        {/* Main Content */}
        <Header/>

        <div className={`flex-1 ${selectedSong ? 'pb-20' : ''}`}>
          {children}
        </div>

        {playlist.length > 0 && (
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`fixed z-90 p-3 bg-gray-900 rounded-full shadow-xl hover:bg-gray-700 active:scale-95 transition-all duration-200 ${
              isMobile ? 'bottom-24 right-4' : 'top-4 right-4'
            }`}
            aria-label="Toggle playlist"
          >
            <FaList className="text-white text-lg" />
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
              {playlist.length}
            </span>
          </button>
        )}

        {selectedSong && (
          <div className="fixed bottom-0 left-0 w-full bg-black shadow-lg z-[80]">
            <MusicPlayer />
          </div>
        )}

        {showPlaylist && (
          <PlaylistQueue 
            onClose={() => setShowPlaylist(false)}
            className={isMobile ? "fixed bottom-16 left-0 w-full" : "fixed bottom-20 right-4 w-80"}
          />
        )}
      </div>
    </AuthProvider>
  );
}