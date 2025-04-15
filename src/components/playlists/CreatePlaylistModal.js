"use client";

import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaCheck, FaCopy, FaImage } from "react-icons/fa";
import usePlaylistStore from "@/store/usePlaylistStore";
import { savePlaylistToSupabase } from "@/lib/supabaseUtils";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CreatePlaylistModal({ isOpen, onClose }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [playlistId, setPlaylistId] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [coverImage, setCoverImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [origin, setOrigin] = useState("");
  const { playlist } = usePlaylistStore();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isSaved) {
      setName("");
      setDescription("");
      setCurrentStep(1);
      setCoverImage(null);
      setBackgroundImage(null);
    }
  }, [isOpen, isSaved]);

  const handleSubmit = async () => {
    if (authLoading) return;
    
    if (!user) {
      alert("You must be logged in to create a playlist!");
      router.push("/auth");
      return;
    }

    if (!name.trim()) {
      alert("Playlist name is required!");
      return;
    }

    if (playlist.length === 0) {
      alert("Playlist cannot be empty!");
      return;
    }

    setIsSubmitting(true);

    try {
      const playlistData = {
        name,
        description,
        songs: playlist,
      };

      const id = await savePlaylistToSupabase(playlistData, user.id);
      setPlaylistId(id);
      setCurrentStep(2);
    } catch (error) {
      console.error("Error saving playlist:", error);
      alert(`Failed to save playlist: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "cover") {
      setCoverImage(file);
    } else {
      setBackgroundImage(file);
    }
  };

  const handleFinish = async () => {
    if (!playlistId) return;

    setIsUploading(true);

    try {
      // Upload images if they exist
      if (coverImage || backgroundImage) {
        const formData = new FormData();
        formData.append("playlistId", playlistId);
        if (coverImage) formData.append("cover", coverImage);
        if (backgroundImage) formData.append("background", backgroundImage);

        const response = await fetch("/api/play-create", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload images");
        }

        const data = await response.json();
        console.log("Image upload successful:", data);
      }

      setIsSaved(true);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("Playlist created but image upload failed. You can update images later.");
      setIsSaved(true);
    } finally {
      setIsUploading(false);
    }
  };

  const playlistLink = playlistId ? `${origin}/playlists/${playlistId}` : "";

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(playlistLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="bg-gradient-to-br from-[#121212] to-[#222] text-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-700 relative"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition p-1 rounded-full hover:bg-gray-700"
              onClick={onClose}
            >
              <FaTimes size={18} />
            </button>

            {isSaved ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="mb-5">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FaCheck size={24} />
                  </div>
                  <h2 className="text-2xl font-bold mb-1">Playlist Created!</h2>
                  <p className="text-gray-400">Share it with others</p>
                </div>

                <div className="mb-6">
                  <p className="text-lg font-semibold truncate px-4">{name}</p>
                  {description && (
                    <p className="text-gray-400 text-sm mt-1">{description}</p>
                  )}
                </div>

                <div className="relative">
                  <div className="p-3 bg-gray-800/80 rounded-lg flex items-center justify-between border border-gray-700">
                    <span className="text-sm truncate pr-2">{playlistLink}</span>
                    <button
                      className={`p-2 rounded-full ${copySuccess ? "text-green-500" : "text-gray-400 hover:text-white"}`}
                      onClick={copyToClipboard}
                    >
                      {copySuccess ? <FaCheck size={14} /> : <FaCopy size={14} />}
                    </button>
                  </div>
                  {copySuccess && (
                    <motion.span
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute -top-6 right-0 text-xs text-green-500"
                    >
                      Copied!
                    </motion.span>
                  )}
                </div>

                <button
                  className="w-full mt-6 py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-lg transition"
                  onClick={() => {
                    onClose();
                    router.push(`/playlists/${playlistId}`);
                  }}
                >
                  View Playlist
                </button>
              </motion.div>
            ) : currentStep === 1 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-center mb-6">Create Playlist</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Playlist Name *
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
                      placeholder="My Awesome Playlist"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full p-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500 min-h-[80px]"
                      placeholder="What's this playlist about?"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  <div className="pt-2">
                    <p className="text-sm text-gray-400">
                      {playlist.length} {playlist.length === 1 ? "song" : "songs"} in playlist
                    </p>
                  </div>
                </div>

                <button
                  className={`w-full mt-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${isSubmitting ? "bg-gray-700 text-gray-400" : "bg-green-600 hover:bg-green-500 text-white"}`}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <FaCheck /> Continue
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <h2 className="text-2xl font-bold text-center mb-6">Add Images (Optional)</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cover Image
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800/70 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaImage className="text-gray-500 mb-2" size={24} />
                        <p className="text-sm text-gray-400">
                          {coverImage ? coverImage.name : "Click to upload cover"}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "cover")}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Background Image
                    </label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer bg-gray-800/50 hover:bg-gray-800/70 transition">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaImage className="text-gray-500 mb-2" size={24} />
                        <p className="text-sm text-gray-400">
                          {backgroundImage ? backgroundImage.name : "Click to upload background"}
                        </p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "background")}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    className="flex-1 py-3 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className={`flex-1 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${isUploading ? "bg-gray-700 text-gray-400" : "bg-green-600 hover:bg-green-500 text-white"}`}
                    onClick={handleFinish}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      "Finishing..."
                    ) : (
                      <>
                        <FaCheck /> Finish
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}