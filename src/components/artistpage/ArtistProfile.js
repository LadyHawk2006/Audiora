'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight, FaCheck, FaHome, FaPlay, FaList } from 'react-icons/fa';
import usePlaybackStore from "@/store/usePlaybackStore";

const getTextValue = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.text) return value.text;
  return String(value);
};

const getThumbnailUrl = (thumbnails) => {
  if (!thumbnails) return '/default-video.jpg';
  if (typeof thumbnails === 'string') return thumbnails;
  if (Array.isArray(thumbnails) && thumbnails.length > 0) {
    return thumbnails[0]?.url || '/default-video.jpg';
  }
  if (thumbnails.url) return thumbnails.url;
  return '/default-video.jpg';
};

export default function ArtistProfile({ artistName }) {
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { setSelectedSong, setPlaylist, play } = usePlaybackStore();

  const fetchArtistData = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/artist?name=${encodeURIComponent(artistName)}&page=${page}`
      );
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? 'Artist not found' 
          : 'Failed to fetch artist data');
      }

      const data = await response.json();
      setArtistData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtistData();
  }, [artistName]);

  const handlePageChange = (direction) => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    fetchArtistData(newPage);
  };

  const handlePlayVideo = (video) => {
    setSelectedSong({
      id: video.id,
      title: getTextValue(video.title),
      thumbnail: getThumbnailUrl(video.thumbnails),
      artist: getTextValue(artistData.channelInfo.channelName),
      videoId: video.id,
      audioSrc: '', // You might want to set this based on your API
      duration: '', // Set this if available
    });
    play();
  };

  const handlePlayAll = () => {
    if (!artistData?.content?.videos) return;
    
    const playlist = artistData.content.videos.map(video => ({
      id: video.id,
      title: getTextValue(video.title),
      thumbnail: getThumbnailUrl(video.thumbnails),
      artist: getTextValue(artistData.channelInfo.channelName),
      videoId: video.id,
      audioSrc: '', // Set this if available
      duration: '', // Set this if available
    }));

    setPlaylist(playlist);
    setSelectedSong(playlist[0]);
    play();
  };

  if (loading && !artistData) return (
    <div className="flex justify-center items-center h-screen bg-gray-900">
      <div className="glass-container p-8 rounded-2xl backdrop-blur-lg border border-white/10 shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="glass-container p-8 rounded-2xl backdrop-blur-lg border border-white/10 shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
        <p className="text-gray-300 mb-6">{error}</p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 rounded-full text-white font-medium hover:bg-gray-700 transition-colors shadow-lg"
        >
          <FaHome /> Go back home
        </Link>
      </div>
    </div>
  );

  if (!artistData) return null;

  return (
    <div className="min-h-screen bg-black/20 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Artist Header */}
        <div className="glass-container p-6 md:p-8 rounded-2xl backdrop-blur-lg border border-white/10 shadow-2xl mb-8 mt-12">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl border-2 border-white/20">
                <Image
                  src={getThumbnailUrl(artistData.channelInfo.thumbnail) || '/default-channel.jpg'}
                  alt={getTextValue(artistData.channelInfo.channelName)}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/default-channel.jpg';
                  }}
                />
              </div>
            </div>
            
            <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-16">
                  {getTextValue(artistData.channelInfo.channelName)}
                </h1>
                
                {artistData.metadata.isVerified && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-gray-800 rounded-full text-blue-400 text-sm font-medium border border-blue-400/30">
                    <FaCheck className="text-blue-400" />
                    Verified
                  </span>
                )}
              </div>
              
              <p className="text-gray-300 mb-6 text-lg leading-relaxed">
                {getTextValue(artistData.metadata.description) || 'No description available.'}
              </p>
              
              <div className="flex flex-wrap gap-4 mt-auto">
                <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <span className="text-blue-400 text-sm">Tracks: {artistData.pagination.totalItems || 'N/A'}</span>
                </div>
                <button 
                  onClick={handlePlayAll}
                  className="flex items-center gap-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <FaPlay /> Play All
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <section className="mb-12">
          <div className="glass-container p-6 rounded-2xl backdrop-blur-lg border border-white/10 shadow-xl mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">
                Popular Tracks by {getTextValue(artistData.channelInfo.channelName)}
              </h2>
              <div className="flex items-center gap-4">
                <span className="text-gray-300">
                  Page {currentPage} of {artistData.pagination.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePageChange('prev')}
                    disabled={currentPage === 1 || loading}
                    className="p-3 rounded-full disabled:opacity-30 bg-gray-800/50 hover:bg-gray-700/70 transition-colors border border-gray-700/50 text-gray-300"
                  >
                    <FaChevronLeft />
                  </button>
                  <button 
                    onClick={() => handlePageChange('next')}
                    disabled={!artistData.pagination.hasMore || loading}
                    className="p-3 rounded-full disabled:opacity-30 bg-gray-800/50 hover:bg-gray-700/70 transition-colors border border-gray-700/50 text-gray-300"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {artistData.content.videos.map(video => (
              <div 
                key={video.id} 
                className="group cursor-pointer"
                onClick={() => handlePlayVideo(video)}
              >
                <div className="glass-container hover:ring ring-green-400 h-full rounded-xl overflow-hidden border border-white/10 transition-all duration-300 flex flex-col">
                  <div className="relative aspect-video">
                    <Image
                      src={getThumbnailUrl(video.thumbnails)}
                      alt="Song Cover"
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/default-video.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                        <FaPlay className="text-white ml-1" />
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex-grow">
                    <h3 className="font-semibold line-clamp-2 mb-2 text-white group-hover:text-purple-400 transition-colors">
                    {(getTextValue(video.title) || '').split('-').slice(1).join('-').trim()}
                    </h3>
                    {video.channelName && (
                      <p className="text-sm text-white mb-3">
                        {getTextValue(video.channelName)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {loading && artistData && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-50">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full bg-blue-500 opacity-75"></div>
          <div className="relative h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-white text-sm font-medium tracking-wide animate-pulse">
          Getting Music For You
        </p>
      </div>
      
      )}
    </div>
  );
}