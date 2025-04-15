"use client";

import RecommendedSection from "@/components/browse/RecommendedSection";
import GenreFilters from "@/components/browse/GenreFilters";
import MoodPlaylists from "@/components/browse/MoodPlaylists";
import ArtistSearch from "@/components/browse/ArtistSearch";
import LongListensComponent from "@/components/browse/LongListens";

export default function Browse() {
  return (
    <main className="flex flex-col min-h-screen bg-black text-white px-1 md:px-2 lg:px-3">
      <ArtistSearch />
      <RecommendedSection/>
      <GenreFilters/>
      <MoodPlaylists/>
      <LongListensComponent/>
    </main>
  );
}
