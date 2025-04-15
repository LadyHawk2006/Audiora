import { NextResponse } from "next/server";
import * as youtubei from "youtubei.js"; // ✅ Import everything properly

export async function GET(req, context) {
  try {
    const { genre } = context.params;
    if (!genre) {
      return NextResponse.json({ error: "Genre is required" }, { status: 400 });
    }

    console.log(`🔍 Fetching songs for genre: ${genre}...`);

    // ✅ Ensure youtubei.Innertube is properly instantiated
    const youtube = await youtubei.Innertube.create();

    const searchQuery = `${genre} music`;
    const searchResults = await youtube.search(searchQuery, { type: "video" });

    if (!searchResults || !searchResults.videos) {
      throw new Error("No videos found");
    }

    const genreSongs = searchResults.videos.map((video) => ({
      id: video.id,
      title: video.title?.text || "Unknown Title",  // ✅ Safe extraction
      artist: video.author?.name || "Unknown Artist",
      thumbnail: video.thumbnails?.[0]?.url || "",
    }));
    

    console.log(`✅ Found ${genreSongs.length} ${genre} songs`);

    return NextResponse.json(genreSongs);
  } catch (error) {
    console.error("🚨 Error fetching genre songs:", error);
    return NextResponse.json({ error: "Failed to fetch genre songs", details: error.message }, { status: 500 });
  }
}
