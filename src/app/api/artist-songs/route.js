import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const artist = searchParams.get("artist");

    if (!artist) {
      return NextResponse.json({ error: "Artist name is required" }, { status: 400 });
    }

    console.log("Fetching YouTube songs for:", artist);

    const youtube = await Innertube.create();
    const searchResults = await youtube.search(`${artist} songs`, { type: "video" });

    if (!searchResults.videos.length) {
      return NextResponse.json({ error: "No songs found" }, { status: 404 });
    }

    // Filter out videos with missing data
    const songs = searchResults.videos
      .filter((video) => video.id && video.title && video.thumbnails?.length > 0 && video.author?.name)
      .map((video) => ({
        id: video.id,
        title: typeof video.title === "string" ? video.title : video.title?.text || "Unknown Title",
        thumbnail: video.thumbnails?.[0]?.url || "",
        channel: video.author?.name || "Unknown Artist",
      }));

    return NextResponse.json({ songs });
  } catch (error) {
    console.error("Error fetching artist songs:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
