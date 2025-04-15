import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export async function GET(req) {
  try {
    const yt = await Innertube.create();
    console.log("🔍 Fetching recommended Pop & Rock music...");

    const genres = ["Pop", "Rock"];
    let allSongs = [];

    for (const genre of genres) {
      console.log(`🔎 Searching for ${genre} music...`);
      const searchResults = await yt.search(`${genre} music`, { type: "video" });

      console.log(`🔎 Full searchResults for ${genre}:`, JSON.stringify(searchResults, null, 2));

      if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
        console.error(`❌ No ${genre} songs found.`);
        continue;
      }

      console.log(`🎶 Found ${searchResults.results.length} ${genre} songs`);

      const songs = searchResults.results
        .filter((item) => item.type === "Video") 
        .map((item) => ({
          id: item.id,
          title: item.title?.text || "Unknown Title", 
          artist: item.author?.name || "Unknown Artist",
          thumbnail: item.thumbnails?.[0]?.url || "", 
          genre: genre,
        }));

      console.log(`✅ Processed ${songs.length} ${genre} songs.`, songs);
      allSongs = [...allSongs, ...songs];
    }

    console.log("📡 Final API Response:", allSongs);
    return NextResponse.json({ recommended: allSongs });
  } catch (error) {
    console.error("❌ Error fetching recommended songs:", error);
    return NextResponse.json({ error: "Failed to fetch recommended songs" }, { status: 500 });
  }
}
