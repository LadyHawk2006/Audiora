"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useToast } from "@/components/ui/use-toast";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function EmbeddedVideoPlayer({ videoId }) {
  const [videoData, setVideoData] = useState({
    url: null,
    captionTracks: [],
    details: {}
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const videoRef = useRef(null);
  const { toast } = useToast();

  // Get the current song from the playback store
  const selectedSong = usePlaybackStore((state) => state.selectedSong);

  const fetchVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/video-stream?id=${videoId}`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch video stream");
      }

      const data = await res.json();
      
      if (!data.url) {
        throw new Error("No video URL returned");
      }

      setVideoData(prev => ({
        ...prev,
        url: data.url,
        captionTracks: data.captions || [],
        details: data.video_details || {}
      }));

      toast({
        title: "Video loaded",
        description: data.video_details?.title,
      });

    } catch (err) {
      console.error("Video loading error:", err);
      setError(err.message || "Unable to load video.");
      
      toast({
        variant: "destructive",
        title: "Error loading video",
        description: err.message || "Please try again later.",
      });
      
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  }, [videoId, retryCount]); // Removed toast from dependencies

  // Effect to handle videoId changes from props
  useEffect(() => {
    if (!videoId) {
      setError("No video ID provided");
      setLoading(false);
      return;
    }

    fetchVideo();

    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current.load();
      }
    };
  }, [videoId, fetchVideo]); // Removed retryCount from dependencies

  // Effect to handle videoId changes from the playback store
  useEffect(() => {
    if (selectedSong?.videoId && selectedSong.videoId !== videoId) {
      // Reset state when the song changes
      setVideoData({
        url: null,
        captionTracks: [],
        details: {}
      });
      setError(null);
      setLoading(true);
      setRetryCount(0);
          }
  }, [selectedSong?.videoId, videoId]);

  const handleRetry = useCallback(() => {
    setRetryCount(0);
    fetchVideo();
  }, [fetchVideo]);

  const handleError = useCallback((e) => {
    console.error("Video error:", e);
    if (videoRef.current?.error) {
      setError(`Video error: ${videoRef.current.error.message}`);
    } else {
      setError("Failed to play video. Try refreshing the page.");
    }
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const date = new Date(0);
    date.setSeconds(seconds);
    return date.toISOString().substring(11, 19);
  };

  if (loading) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
        <div className="text-gray-400">
          Loading video...{retryCount > 0 && ` (Retry ${retryCount}/3)`}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full aspect-video bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          {error}
          <button 
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden bg-black relative">
      <video
        ref={videoRef}
        key={videoData.url}
        controls
        playsInline
        className="w-full h-full object-contain"
        onError={handleError}
        poster={videoData.details.thumbnail}
      >
        <source src={videoData.url} type="video/mp4" />
        {videoData.captionTracks.map((track, index) => (
          <track
            key={index}
            kind="subtitles"
            srcLang={track.language_code}
            label={track.language_name}
            src={track.url}
            default={index === 0}
          />
        ))}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}