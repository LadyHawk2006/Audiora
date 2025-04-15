"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { FaMusic, FaPlus, FaEdit } from "react-icons/fa";
import { motion } from "framer-motion";

export default function UserPlaylistsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchUserPlaylists = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("userplaylists")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching playlists:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchUserPlaylists();
    }
  }, [user, authLoading, fetchUserPlaylists]);

  const handlePlaylistClick = (playlistId) => {
    router.push(`/playlists/${playlistId}`);
  };

  const createNewPlaylist = () => {
    router.push("/create-playlist");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <span>Loading your music world...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold mb-4">🎵 Playlist Access</h2>
          <p className="mb-6 text-gray-300">
            Sign in to view and create your personal playlists
          </p>
          <button
            onClick={() => router.push("/auth")}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6 md:p-8 mt-16"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
          >
            Your Playlists
          </motion.h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={createNewPlaylist}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-full transition"
          >
            <FaPlus /> New Playlist
          </motion.button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0.8 }}
                transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                className="bg-gray-800/50 rounded-xl p-4 h-52"
              ></motion.div>
            ))}
          </div>
        ) : error ? (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center"
          >
            <p className="text-red-400 font-medium">Error loading playlists</p>
            <p className="text-sm text-red-300 mt-1">{error}</p>
            <button
              onClick={fetchUserPlaylists}
              className="mt-3 text-sm bg-red-900/50 hover:bg-red-900/70 px-3 py-1 rounded transition"
            >
              Retry
            </button>
          </motion.div>
        ) : playlists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FaMusic size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-medium text-gray-300 mb-2">
              No playlists yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first playlist to get started
            </p>
            <button
              onClick={createNewPlaylist}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-full transition"
            >
              Create Playlist
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {playlists.map((playlist) => (
              <motion.div
                key={playlist.id}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/30 hover:bg-gray-700/50 backdrop-blur-sm rounded-xl p-4 cursor-pointer border border-gray-700/50 hover:border-purple-500/30 transition-all group"
                onClick={() => handlePlaylistClick(playlist.id)}
              >
                <div className="relative">
                  {playlist.cover ? (
                    <img
                      src={playlist.cover}
                      alt={playlist.name}
                      className="w-full aspect-square object-cover rounded-lg mb-3 group-hover:opacity-80 transition"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg mb-3 flex items-center justify-center group-hover:opacity-80 transition">
                      <FaMusic size={32} className="text-gray-500" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg truncate">{playlist.name}</h3>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-sm text-gray-400">
                    {new Date(playlist.created_at).toLocaleDateString()}
                  </p>
                  <motion.button
                    initial={{ opacity: 1 }}
                    whileHover={{ opacity: 1 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/playlists/${playlist.id}/edit`);
                    }}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded transition opacity-100 group-hover:scale-105 cursor-pointer"
                  >
                    <FaEdit className="inline mr-1" /> Edit
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}