import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

let youtubeInstance = null;
const YT_TIMEOUT = 15000; // 15 seconds

async function getYouTubeInstance() {
  if (!youtubeInstance) {
    try {
      youtubeInstance = await Promise.race([
        Innertube.create({
          fetch: async (input, init) => {
            const response = await fetch(input, init);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response;
          },
          lang: 'en',
          location: 'US'
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('YouTube initialization timeout')), YT_TIMEOUT)
        )
      ]);
    } catch (error) {
      console.error("YouTube initialization failed:", error);
      throw new Error("YouTube service unavailable");
    }
  }
  return youtubeInstance;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get("channelId");
    
    if (!channelId) {
      return NextResponse.json(
        { error: "Channel ID is required" },
        { status: 400 }
      );
    }

    const youtube = await getYouTubeInstance();
    
    // Get channel info using the correct method
    const channel = await Promise.race([
      youtube.getChannel(channelId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Channel fetch timeout')), YT_TIMEOUT)
      )
    ]);

    // Process channel metadata
    const metadata = {
      id: channel.id,
      name: channel.metadata.title,
      description: channel.metadata.description,
      subscribers: channel.metadata.subscriber_count,
      thumbnails: channel.metadata.avatar?.thumbnails || [],
      banners: channel.metadata.banners || [],
      isVerified: channel.metadata.is_verified,
      viewCount: channel.metadata.view_count
    };

    // Get channel videos (from the channel object)
    const videos = channel.videos?.map(video => ({
      id: video.id,
      title: video.title,
      duration: video.duration?.text,
      thumbnails: video.thumbnails,
      published: video.published?.text,
      viewCount: video.view_count?.text
    })) || [];

    // Get channel playlists (from the channel object)
    const playlists = channel.playlists?.map(playlist => ({
      id: playlist.id,
      title: playlist.title,
      videoCount: playlist.video_count,
      thumbnails: playlist.thumbnails
    })) || [];

    // Categorize playlists
    const musicData = {
      songs: [],
      albums: [],
      singles: [],
      videos: videos,
      mixes: []
    };

    // Process playlists to categorize them
    for (const playlist of playlists) {
      try {
        // Get full playlist info
        const playlistInfo = await youtube.getPlaylist(playlist.id);
        
        if (playlistInfo.title.toLowerCase().includes('album')) {
          musicData.albums.push({
            id: playlistInfo.id,
            title: playlistInfo.title,
            videoCount: playlistInfo.video_count,
            thumbnails: playlistInfo.thumbnails,
            year: playlistInfo.year
          });
        } else if (playlistInfo.title.toLowerCase().includes('single')) {
          musicData.singles.push({
            id: playlistInfo.id,
            title: playlistInfo.title,
            videoCount: playlistInfo.video_count,
            thumbnails: playlistInfo.thumbnails,
            year: playlistInfo.year
          });
        } else if (playlistInfo.title.toLowerCase().includes('mix')) {
          musicData.mixes.push({
            id: playlistInfo.id,
            title: playlistInfo.title,
            videoCount: playlistInfo.video_count,
            thumbnails: playlistInfo.thumbnails
          });
        } else {
          musicData.songs.push({
            id: playlistInfo.id,
            title: playlistInfo.title,
            videoCount: playlistInfo.video_count,
            thumbnails: playlistInfo.thumbnails
          });
        }
      } catch (error) {
        console.error(`Error processing playlist ${playlist.id}:`, error);
        continue;
      }
    }

    return NextResponse.json({
      success: true,
      metadata,
      content: musicData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error("Channel data fetch failed:", error);
    return NextResponse.json(
      {
        error: error.message || "Failed to fetch channel data",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}