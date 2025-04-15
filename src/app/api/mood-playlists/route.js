import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mood = searchParams.get("mood");

  if (!mood) {
    return NextResponse.json({ error: "Mood is required" }, { status: 400 });
  }

  try {
    const yt = await Innertube.create();

    console.log(`Searching for playlists related to: ${mood}`);
    const searchResults = await yt.search(`${mood} music playlist`, { type: "playlist" });

    console.log("Raw Search Results:", searchResults);

    if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
      console.error("No playlists found.");
      return NextResponse.json({ error: "No playlists found" }, { status: 404 });
    }

    const selectedPlaylist = searchResults.results.find((item) => item.content_id && item.content_type === "PLAYLIST");

    if (!selectedPlaylist) {
      console.error("No valid playlist ID found.");
      return NextResponse.json({ error: "No valid playlists found" }, { status: 404 });
    }

    const playlistId = selectedPlaylist.content_id;
    console.log("Selected Playlist ID:", playlistId);

    const playlistDetails = await yt.getPlaylist(playlistId);
    console.log("Playlist Details:", playlistDetails);

    if (!playlistDetails.videos || playlistDetails.videos.length === 0) {
      return NextResponse.json({ mood, playlists: [], songs: [] });
    }

    const playlists = [
      {
        id: playlistId,
        title: selectedPlaylist.metadata?.title || "Unknown Playlist",
        thumbnail: selectedPlaylist.content_image?.thumbnails?.[0]?.url || "",
      },
    ];

    const songs = playlistDetails.videos.map((video) => ({
      id: video.id,
      title: video.title || "Unknown Title",
      thumbnail: video.thumbnails?.[0]?.url || "",
      channel: video.author?.name || "Unknown Artist",
    }));

    return NextResponse.json({ mood, playlists, songs });
  } catch (error) {
    console.error("Error fetching mood playlist songs:", error);
    return NextResponse.json({ error: "Failed to fetch mood songs" }, { status: 500 });
  }
}
