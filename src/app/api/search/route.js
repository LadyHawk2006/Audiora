import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export async function GET(req) {
  try {
    // Extract search query from request
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Missing search query" }, { status: 400 });
    }

    // Initialize YouTubei.js
    const yt = await Innertube.create();
    const searchResults = await yt.search(query, { type: "video" });

    // Non-music terms to filter out
    const nonMusicKeywords = [
      "trailer", "movie", "film", "episode", "full episode", "series",
      "shorts", "documentary", "news", "interview", "review", "gameplay",
      "live stream", "official trailer", "reaction", "explained", "recap",
      "behind the scenes", "tutorial", "how to", "walkthrough", "meme",
      "funny", "challenge", "prank", "vlog", "ad", "commercial",
      "channel", "subscribe", "announcement", "podcast"
    ];

    // Function to check if a result is music-related
    const isMusic = (title, author) => {
      const lowerTitle = title.toLowerCase();
      const lowerAuthor = author?.toLowerCase() || "";

      return (
        !nonMusicKeywords.some((keyword) => lowerTitle.includes(keyword)) &&
        !nonMusicKeywords.some((keyword) => lowerAuthor.includes(keyword))
      );
    };

    // Extract relevant data and filter non-music results
    let songs = searchResults.results
      .map((video) => ({
        id: video.id,
        title: video.title.text,
        artist: video.author?.text || "Unknown",
        duration: video.duration?.text || "Unknown",
        thumbnail: video.thumbnails?.[0]?.url || "",
      }))
      .filter((song) => isMusic(song.title, song.artist));

    // Prioritize exact matches if available
    const exactMatches = songs.filter((song) =>
      song.title.toLowerCase() === query.toLowerCase()
    );

    return NextResponse.json({ songs: exactMatches.length > 0 ? exactMatches : songs });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
  }
}
