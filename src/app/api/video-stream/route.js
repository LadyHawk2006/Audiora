import { NextResponse } from "next/server";
import { Innertube, UniversalCache } from "youtubei.js";

let ytClient = null;

async function getYtClient() {
  if (!ytClient) {
    ytClient = await Innertube.create({
      cache: new UniversalCache(false),
      fetch: async (input, init) => {
        const response = await fetch(input, init);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response;
      },
      generate_session_locally: true,
    });
  }
  return ytClient;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return NextResponse.json(
        { error: "Missing video ID" },
        { status: 400 }
      );
    }

    // Validate video ID format
    if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json(
        { error: "Invalid video ID format" },
        { status: 400 }
      );
    }

    const client = await getYtClient();
    let info;
    
    // First try getting full info
    try {
      info = await client.getInfo(videoId);
    } catch (error) {
      console.warn("Failed to get full info, trying basic info:", error.message);
      info = await client.getBasicInfo(videoId);
    }

    // If still no info, try alternative methods
    if (!info?.basic_info) {
      return NextResponse.json(
        { error: "Could not retrieve video information" },
        { status: 404 }
      );
    }

    let format;
    let streamingData = info.basic_info.streaming_data;

    // If no streaming data, try to get it directly
    if (!streamingData) {
      try {
        format = await client.getStreamingData(videoId, {
          quality: 'best',
          type: 'video+audio'
        });
      } catch (error) {
        console.error("Failed to get streaming data directly:", error);
      }
    } else {
      // Select the best available stream from streaming data
      format = streamingData.formats
        ?.filter(f => f.has_video && f.has_audio)
        ?.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      // Fallback to adaptive formats if no combined format found
      if (!format) {
        format = streamingData.adaptive_formats
          ?.filter(f => f.has_video && f.has_audio)
          ?.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      }

      // Final fallback to audio-only if no video available
      if (!format) {
        format = streamingData.adaptive_formats
          ?.filter(f => f.has_audio)
          ?.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];
      }
    }

    if (!format) {
      return NextResponse.json(
        { error: "No suitable stream found" },
        { status: 404 }
      );
    }

    // Process captions
    const captions = info.captions?.caption_tracks?.map(track => ({
      language_name: track.name?.simpleText || track.language_code.toUpperCase(),
      language_code: track.language_code,
      url: track.url,
      is_translatable: track.is_translatable,
    })) || [];

    // Add CORS headers for the video stream
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    };

    return NextResponse.json(
      { 
        url: format.url,
        captions,
        video_details: {
          title: info.basic_info.title,
          author: info.basic_info.author,
          length: info.basic_info.duration,
          thumbnail: info.basic_info.thumbnail?.[0]?.url,
        }
      },
      { headers }
    );

  } catch (err) {
    console.error("YouTube API Error:", err);
    return NextResponse.json(
      { 
        error: "Failed to fetch stream",
        details: process.env.NODE_ENV === "development" ? err.message : undefined
      },
      { status: 500 }
    );
  }
}