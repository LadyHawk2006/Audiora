import { NextResponse } from "next/server";
import { exec } from "child_process";
import util from "util";
import { LRUCache } from "lru-cache";

const execPromise = util.promisify(exec);

// Improved caching: Store audio URLs for a longer time
const cache = new LRUCache({
  max: 100, // Increased storage
  ttl: 24 * 60 * 60 * 1000, // Cache for 24 hours
});

// Function to validate YouTube Video ID
const isValidYouTubeId = (id) => /^[a-zA-Z0-9_-]{11}$/.test(id);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId || !isValidYouTubeId(videoId)) {
      return NextResponse.json({ error: "Invalid or missing video ID" }, { status: 400 });
    }

    // Check cache before making an API call
    if (cache.has(videoId)) {
      console.log(`🔄 Serving Cached Audio for ${videoId}`);
      return NextResponse.redirect(cache.get(videoId));
    }

    console.log(`🎵 Fetching Audio for ${videoId} using yt-dlp`);

    // Use yt-dlp to fetch the best audio format URL (m4a preferred, fallback to webm)
    const command = `yt-dlp -f "bestaudio[ext=m4a]/bestaudio[ext=webm]" --get-url "https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}"`;
    const { stdout, stderr } = await execPromise(command);

    if (stderr) {
      console.error("⚠️ yt-dlp Warning:", stderr);
    }

    const audioUrl = stdout.trim();

    if (!audioUrl || !audioUrl.startsWith("http")) {
      console.error("🚨 Invalid audio URL received:", audioUrl);
      return NextResponse.json({ error: "Failed to retrieve audio" }, { status: 500 });
    }

    console.log(`✅ Audio URL: ${audioUrl}`);

    // Cache the result for 24 hours
    cache.set(videoId, audioUrl);

    return NextResponse.redirect(audioUrl);

  } catch (error) {
    console.error("🚨 yt-dlp Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
