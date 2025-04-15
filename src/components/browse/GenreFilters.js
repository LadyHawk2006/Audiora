"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { FaPlay } from "react-icons/fa";
import usePlaybackStore from "@/store/usePlaybackStore";

export default function GenresSection() {
  const genres = useMemo(() => ["Pop", "Rock", "Hip-Hop", "Jazz", "EDM", "Classical"], []);
  const [genreSongs, setGenreSongs] = useState({});
  const [loadingGenres, setLoadingGenres] = useState({});

  const { selectedSong, setSelectedSong, setPlaylist, setCurrentSongIndex } = usePlaybackStore();

  useEffect(() => {
    const fetchGenreSongs = async () => {
      setLoadingGenres((prev) =>
        genres.reduce((acc, genre) => ({ ...acc, [genre]: true }), {})
      );

      try {
        const responses = await Promise.all(
          genres.map((genre) =>
            fetch(`/api/genre/${genre}`, { cache: "no-store" }).then((res) =>
              res.json().catch(() => [])
            )
          )
        );

        const newGenreSongs = genres.reduce((acc, genre, index) => {
          acc[genre] = responses[index] || [];
          return acc;
        }, {});

        setGenreSongs(newGenreSongs);
      } catch (error) {
        console.error("❌ Error fetching genre songs:", error);
      } finally {
        setLoadingGenres((prev) =>
          genres.reduce((acc, genre) => ({ ...acc, [genre]: false }), {})
        );
      }
    };

    fetchGenreSongs();
  }, [genres]);

  const handlePlayAll = useCallback((genre) => {
    const songs = genreSongs[genre] || [];
    if (songs.length > 0) {
      usePlaybackStore.setState({ playlist: songs, currentSongIndex: 0, selectedSong: songs[0] });
    }
  }, [genreSongs]);

  return (
    <div className="min-h-screen sm:px-6 py-0 text-white">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-white/80">Genres</h1>

      {genres.map((genre) => (
        <div key={genre} className="mb-10">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl sm:text-2xl font-semibold text-green-400">{genre}</h2>
            {genreSongs[genre]?.length > 0 && (
              <button
              className="flex items-center gap-2 border border-gray-700 hover:bg-green-500 px-3 md:px-4 py-2 rounded-md text-sm font-medium text-white transition"
              onClick={() => handlePlayAll(genre)}
              >
                <FaPlay className="text-xs" /> Play All
              </button>
            )}
          </div>

          <div className="flex gap-3 sm:gap-4 overflow-x-auto custom-scrollbar p-2">
            {loadingGenres[genre] && !genreSongs[genre]?.length ? (
              [...Array(12)].map((_, index) => (
                <div
                  key={index}
                  className="w-[150px] sm:w-[180px] min-w-[150px] sm:min-w-[180px] bg-white/10 backdrop-blur-md animate-pulse p-2 rounded-lg"
                >
                  <div className="h-32 sm:h-36 w-full bg-white/20 rounded-lg"></div>
                  <div className="h-3 sm:h-4 bg-white/30 rounded-md mt-2 w-3/4"></div>
                  <div className="h-2 sm:h-3 bg-white/40 rounded-md mt-1 w-1/2"></div>
                </div>
              ))
            ) : genreSongs[genre]?.length > 0 ? (
              genreSongs[genre]
                .filter((song) => song.thumbnail && song.title && song.artist)
                .map((song) => {
                  const isPlaying = selectedSong?.id === song.id;
                  return (
                    <div
                      key={song.id}
                      className={`relative w-[150px] sm:w-[180px] min-w-[150px] sm:min-w-[180px] bg-white/10 backdrop-blur-md p-2 rounded-lg transition transform hover:scale-105 cursor-pointer ${
                        isPlaying ? "ring-2 ring-green-500" : ""
                      }`}
                      onClick={() => setSelectedSong(song)}
                    >
                      <div className="absolute inset-0 flex justify-center items-center opacity-0 hover:opacity-100 transition">
                        <button className="bg-white/20 p-2 sm:p-3 rounded-full backdrop-blur-md border border-white/30">
                          <FaPlay className="text-white text-lg" />
                        </button>
                      </div>

                      <Image
                        src={song.thumbnail}
                        alt={song.title || "Song thumbnail"}
                        width={180}
                        height={144} 
                        className="w-full h-32 sm:h-36 object-cover rounded-lg"
                        priority={false}
                        unoptimized={true}
                      />

                      <div className="mt-2 text-white">
                        <h3 className="text-xs sm:text-sm font-semibold truncate">
                          {(song.title?.text || song.title)
                            ?.replace(/^.*-\s*/, "")
                            ?.replace(/\s*[\(\[][^)\]]*[\)\]]/g, "")
                            ?.trim()}
                        </h3>
                        <p className="text-xs sm:text-l truncate">{song.artist}</p>
                      </div>
                    </div>
                  );
                })
            ) : (
              <p className="text-gray-500 italic text-sm">No songs found for {genre}</p>
            )}
          </div>
        </div>
      ))}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
