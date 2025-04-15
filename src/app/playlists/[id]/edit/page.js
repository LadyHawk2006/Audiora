"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import supabase from "@/lib/supabase";
import { usePlaylistEditStore } from "@/store/usePlaylistEditStore";
import PlaylistEditorHeader from "@/components/playlists/editor/PlaylistEditorHeader";
import PlaylistInfoSection from "@/components/playlists/editor/PlaylistInfoSection";
import PlaylistSongsSection from "@/components/playlists/editor/PlaylistSongsSection";
import CoverUploadModal from "@/components/playlists/editor/CoverUploadModal";
import BackgroundUploadModal from "@/components/playlists/editor/BackgroundUploadModal";
import SongSearchModal from "@/components/playlists/editor/SongSearchModal";
import LoadingState from "@/components/playlists/editor/LoadingState";
import ErrorState from "@/components/playlists/editor/ErrorState";

export default function PlaylistEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { user } = useAuth();
  
  const {
    originalPlaylist,
    editedPlaylist,
    currentSongs,
    removedSongs,
    addedSongs,
    newCover,
    newBackground,
    initialize,
    updatePlaylistInfo,
    removeSong,
    addSongs,
    reorderSongs,
    setNewCover,
    setNewBackground,
    resetChanges,
    isDirty
  } = usePlaylistEditStore();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCoverUpload, setShowCoverUpload] = useState(false);
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);

  // Fetch playlist data
  useEffect(() => {
    if (!id) return;

    const fetchPlaylist = async () => {
      try {
        setLoading(true);
        
        const { data: playlist, error: playlistError } = await supabase
          .from("userplaylists")
          .select("*")
          .eq("id", id)
          .single();

        if (playlistError) throw playlistError;
        if (!playlist) throw new Error("Playlist not found");
        
        if (playlist.user_id !== user?.id) {
          throw new Error("You don't have permission to edit this playlist");
        }

        const { data: songs, error: songsError } = await supabase
          .from("playlist_items")
          .select("id, video_id, title, thumbnail, added_at")
          .eq("playlist_id", id)
          .order("added_at", { ascending: true });

        if (songsError) throw songsError;

        initialize(playlist, songs || []);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching playlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [id, user, initialize]);

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  const handleAddSong = (song) => {
    const newSong = {
      id: `new-${Date.now()}`,
      video_id: song.videoId, // Make sure this matches the property from search results
      title: song.title,
      thumbnail: song.thumbnail,
      added_at: new Date().toISOString()
    };
    addSongs([newSong]);
    setSearchQuery("");
    setSearchResults([]);
    setShowSearch(false);
  };

  const moveSongUp = (index) => {
    if (index <= 0) return;
    const newOrder = [...currentSongs];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    reorderSongs(newOrder);
  };

  const moveSongDown = (index) => {
    if (index >= currentSongs.length - 1) return;
    const newOrder = [...currentSongs];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
    reorderSongs(newOrder);
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === "cover") {
      setNewCover(file);
    } else {
      setNewBackground(file);
    }
  };

  const handleSave = async () => {
    if (!editedPlaylist || !originalPlaylist) return;
    
    try {
      setIsSubmitting(true);
      
      if (editedPlaylist.name !== originalPlaylist.name || 
          editedPlaylist.description !== originalPlaylist.description) {
        const { error } = await supabase
          .from("userplaylists")
          .update({
            name: editedPlaylist.name,
            description: editedPlaylist.description
          })
          .eq("id", id);
          
        if (error) throw error;
      }
      
      if (removedSongs.length > 0) {
        const { error } = await supabase
          .from("playlist_items")
          .delete()
          .in("id", removedSongs.map(song => song.id));
          
        if (error) throw error;
      }
      
      if (addedSongs.length > 0) {
        const newItems = addedSongs.map(song => ({
          playlist_id: id,
          video_id: song.video_id,
          title: song.title,
          thumbnail: song.thumbnail
        }));
        
        const { error } = await supabase
          .from("playlist_items")
          .insert(newItems);
          
        if (error) throw error;
      }
      
      if (newCover || newBackground) {
        const formData = new FormData();
        formData.append("playlistId", id);
        if (newCover) formData.append("cover", newCover);
        if (newBackground) formData.append("background", newBackground);

        const response = await fetch("/api/play-create", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload images");
        }
      }
      
      router.refresh();
      router.push(`/playlists/${id}`);
      
    } catch (err) {
      setError(err.message);
      console.error("Error saving playlist:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} router={router} />;
  if (!editedPlaylist) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto mt-16">
        <PlaylistEditorHeader 
          editedPlaylist={editedPlaylist}
          isDirty={isDirty}
          isSubmitting={isSubmitting}
          resetChanges={resetChanges}
          handleSave={handleSave}
        />

        <PlaylistInfoSection 
          editedPlaylist={editedPlaylist}
          newCover={newCover}
          newBackground={newBackground}
          updatePlaylistInfo={updatePlaylistInfo}
          setShowCoverUpload={setShowCoverUpload}
          setShowBackgroundUpload={setShowBackgroundUpload}
          setNewBackground={setNewBackground}
        />

        <PlaylistSongsSection 
          currentSongs={currentSongs}
          setShowSearch={setShowSearch}
          removeSong={removeSong}
          moveSongUp={moveSongUp}
          moveSongDown={moveSongDown}
        />
      </div>

      {showCoverUpload && (
      <CoverUploadModal 
        showCoverUpload={showCoverUpload}
        setShowCoverUpload={setShowCoverUpload}
        newCover={newCover}
        handleImageUpload={handleImageUpload}
      />
    )}

    {showBackgroundUpload && (
      <BackgroundUploadModal 
        showBackgroundUpload={showBackgroundUpload}
        setShowBackgroundUpload={setShowBackgroundUpload}
        newBackground={newBackground}
        handleImageUpload={handleImageUpload}
      />
    )}

    {showSearch && (
      <SongSearchModal 
        showSearch={showSearch}
        setShowSearch={setShowSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        handleSearch={handleSearch}
        handleAddSong={handleAddSong}
      />
    )}
  </div>
);
}