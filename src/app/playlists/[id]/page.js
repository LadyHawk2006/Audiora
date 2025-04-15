"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaPlay, FaPlayCircle, FaMusic, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import supabase from "@/lib/supabaseClient";
import usePlaybackStore from "@/store/usePlaybackStore";
import Image from 'next/image';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { setSelectedSong, setPlaylist } = usePlaybackStore();
  const [playlistData, setPlaylistData] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isHoveringPlayAll, setIsHoveringPlayAll] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage] = useState(10);

  useEffect(() => {
    async function fetchPlaylist() {
      if (!id) {
        setError("No playlist ID provided");
        return;
      }

      try {
        setLoading(true);
        setError(null);
                
        // Fetch playlist metadata
        const { data: playlist, error: playlistError } = await supabase
          .from("userplaylists")
          .select("*")
          .eq("id", id)
          .single();

        if (playlistError) {
          throw playlistError;
        }

        if (!playlist) {
          setPlaylistData(null);
          setError("Playlist not found");
          return;
        }

        // Fetch playlist songs with the required fields
        const { data: playlistSongs, error: songsError } = await supabase
          .from("playlist_items")
          .select("id, video_id, title, thumbnail, added_at")
          .eq("playlist_id", id)
          .order("added_at", { ascending: true });

        if (songsError) {
          throw songsError;
        }

        setPlaylistData(playlist);
        setSongs(playlistSongs || []);
      } catch (error) {
        console.error("Error fetching playlist:", error.message);
        setError(error.message);
        setPlaylistData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchPlaylist();
  }, [id]);

  // Filter songs based on search term
  const filteredSongs = useMemo(() => {
    if (!searchTerm) return songs;
    return songs.filter(song => 
      song.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [songs, searchTerm]);

  const handlePlayAll = () => {
    if (filteredSongs.length > 0) {
      const playbackSongs = filteredSongs.map(song => ({
        videoId: song.video_id,
        title: song.title,
        thumbnail: song.thumbnail,
        id: song.video_id
      }));
      
      setPlaylist(playbackSongs);
      setSelectedSong(playbackSongs[0]);
    }
  };

  const handlePlaySong = (song) => {
    setSelectedSong({
      videoId: song.video_id,
      title: song.title,
      thumbnail: song.thumbnail,
      id: song.video_id
    });
  };

  // Pagination calculations
  const indexOfLastSong = currentPage * songsPerPage;
  const indexOfFirstSong = indexOfLastSong - songsPerPage;
  const currentSongs = filteredSongs.slice(indexOfFirstSong, indexOfLastSong);
  const totalPages = Math.ceil(filteredSongs.length / songsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full mb-4"></div>
        <div className="h-4 w-32 bg-gray-800 rounded"></div>
      </div>
    </div>
  );

  if (!playlistData) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center p-8 bg-gray-900 bg-opacity-80 rounded-xl backdrop-blur-sm border border-gray-800">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Playlist Not Found</h1>
        <p className="text-gray-400 mb-4">The playlist {"you're"} looking for {"doesn't"} exist or may have been removed.</p>
        {error && (
          <div className="mb-4 p-3 bg-red-900/30 rounded-lg">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-gray-300">Playlist ID: {id}</p>
        </div>
        <button 
          onClick={() => router.push("/")}
          className="mt-4 px-6 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-all flex items-center gap-2"
        >
          <IoIosArrowBack /> Back Home
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen text-white mx-10">
      <div className="fixed inset-0 -z-10">
        {playlistData.backgroundImage ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${playlistData.backgroundImage})` }}
            ></div>
            <div className="absolute inset-0 bg-transparent"></div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
        )}
      </div>

      {/* Content */}
      <div className="container mt-10 mx-auto px-4 py-12 relative z-10">
        {/* Playlist Header */}
        <div className="flex flex-col items-center md:items-start mb-12 gap-4 w-full">
          <div className="w-full flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Cover Image Container */}
            <div className="relative group w-[80px] h-[80px] md:w-[180px] md:h-[180px] flex-shrink-0 transition-all duration-300">
              <div className="w-full h-full bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg md:rounded-xl shadow-lg overflow-hidden">
                {playlistData.cover ? (
                  <Image 
                    src={playlistData.cover} 
                    alt={playlistData.name}
                    className="w-full h-full object-cover"
                    width={150}
                    height={150}
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaMusic className="text-gray-600 w-6 h-6 md:w-8 md:h-8" />
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-transparent bg-opacity-0 opacity-0 group-hover:opacity-50 transition-all flex items-center justify-center">
                <button
                  onClick={handlePlayAll}
                  onMouseEnter={() => setIsHoveringPlayAll(true)}
                  onMouseLeave={() => setIsHoveringPlayAll(false)}
                  className="p-2 md:p-3 bg-white/10 rounded-full shadow-lg transform transition-all hover:scale-110 cursor-pointer"
                >
                  <FaPlay 
                    size={16}
                    className={isHoveringPlayAll ? "text-white" : "text-white/90"} 
                  />
                </button>
              </div>
            </div>

            {/* Details Container */}
            <div className="backdrop-blur-md bg-white/10 p-4 md:p-6 rounded-xl border border-gray-800 w-full">
              <h1 className="text-xl md:text-3xl font-bold mb-2 line-clamp-2">{playlistData.name}</h1>
              <p className="text-sm md:text-base text-gray-300 mb-4 line-clamp-3">{playlistData.description}</p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-white">
                  <span>{songs.length} songs</span>
                </div>
                
                <button
                  onClick={handlePlayAll}
                  className="px-4 py-2 md:px-6 md:py-2.5 text-sm md:text-base text-white font-medium flex items-center gap-2 transition-all transform hover:scale-[1.02] shadow-lg hover:border border-white rounded-full bg-green-600 hover:bg-green-500 w-fit"
                >
                  <FaPlayCircle size={14} className="md:size-4" /> 
                  <span>Play All</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="bg-transparent bg-opacity-40 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="p-4 border-b border-gray-800 backdrop-blur-md bg-white/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">Songs</h2>
              
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
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
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
              </div>
              
              {filteredSongs.length > songsPerPage && (
                <div className="text-sm text-white">
                  Showing {indexOfFirstSong + 1}-{Math.min(indexOfLastSong, filteredSongs.length)} of {filteredSongs.length}
                </div>
              )}
            </div>
          </div>

          {filteredSongs.length > 0 ? (
            <>
              <div className="divide-y divide-gray-800/50 max-h-[500px] overflow-y-auto custom-scrollbar">
                {currentSongs.map((song) => {
                  const [artist, title] = song.title.split(" - ").reverse();

                  return (
                    <div
                      key={song.id}
                      className="flex items-center backdrop-blur-md bg-white/10 border border-gray-400/30 rounded-xl gap-4 p-4 mt-3 mb-2 mx-4 hover:bg-white/20 transition-all cursor-pointer group"
                      onClick={() => handlePlaySong(song)}
                    >
                      <div className="w-12 h-12 flex-shrink-0 relative">
                        <img
                          src={song.thumbnail || "/default-thumbnail.jpg"}
                          alt={song.title}
                          className="w-full h-full object-cover rounded-lg"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-50 flex items-center justify-center transition-all">
                          <FaPlay size={14} className="text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-l text-white truncate">{artist}</p>
                        <h3 className="font-medium truncate">{title}</h3>
                      </div>

                      <div className="text-sm text-white">
                        {Math.floor(Math.random() * 3) + 2}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-gray-800 backdrop-blur-md bg-white/30">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPage === 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <FaChevronLeft /> Previous
                  </button>
                  
                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPage === pageNum ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentPage === totalPages ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    Next <FaChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <FaMusic size={24} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-medium mb-1">
                {searchTerm ? "No matching songs found" : "No songs yet"}
              </h3>
              <p className="text-gray-400">
              {searchTerm ? "Try a different search term" : "This playlist is currently empty"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}