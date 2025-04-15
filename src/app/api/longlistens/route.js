import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export async function GET() {
  try {
    const youtube = await Innertube.create({
      generate_session_locale: true,
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response;
      }
    });

    const searchQueries = [
      "Billboard top 100 songs",
      "Spotify top 100 2024",  
      "electronic dj mixes",
      "best pop remixes",
      "party playlists",
      "lfocus/study playlist 2025",
    ];

    const searchPromises = searchQueries.map(query => 
      youtube.search(query, {
        type: "video",
        sort_by: "rating", // Prioritize well-rated content
        duration: "long",
        features: ["hd", "cc"]
      })
    );

    const allResults = await Promise.all(searchPromises);
    const allVideos = allResults.flatMap(r => r.videos || []);
    
    // Deduplicate and filter for minimum 1 hour duration
    const longListens = Array.from(new Map(allVideos.map(v => [v.id, v]))).map(([,v]) => v)
      .filter(video => video.duration?.seconds >= 3600) // Only consider videos over 1 hour
      .slice(0, 80) // Return a larger set for more diversity
      .map(video => ({
        id: video.id,
        title: formatTitle(video.title.text),
        creator: formatCreator(video.author.name),
        thumbnail: getBestThumbnail(video.thumbnails),
        duration: formatFullDuration(video.duration.seconds),
        type: detectContentType(video.title.text),
        url: `https://youtube.com/watch?v=${video.id}`
      }));

    return NextResponse.json({ 
      success: true,
      listens: longListens 
    });

  } catch (error) {
    console.error("LongListens API Error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to fetch long listening content",
        debug: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

function formatTitle(title) {
  return title
    .replace(/(\[.*?\])|(\(.*?\))|(\|.*)/g, "") // Remove brackets and pipes
    .replace(/\s{2,}/g, " ") // Clean extra spaces
    .trim();
}

function formatCreator(creator) {
  return creator
    .replace(/( - Topic| Official| -? VEVO)$/i, "")
    .trim();
}

function formatFullDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m`;
}

function detectContentType(title) {
  const lcTitle = title.toLowerCase();
  if (lcTitle.includes("dj mix")) return "DJ Set";
  if (lcTitle.includes("mashup")) return "Mashup";
  if (lcTitle.includes("remix")) return "Remix";
  if (lcTitle.includes("study") || lcTitle.includes("focus")) return "Focus Mix";
  return "Extended Mix";
}

function getBestThumbnail(thumbnails) {
  const preferOrder = ['maxres', 'hqdefault', 'mqdefault'];
  for (const quality of preferOrder) {
    const found = thumbnails.find(t => t.url.includes(quality));
    if (found) return found.url;
  }
  return thumbnails[0]?.url || '/default-longlisten.jpg';
}
