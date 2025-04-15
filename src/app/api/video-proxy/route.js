import { NextResponse } from "next/server";
import fetch from 'node-fetch';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("id");

    if (!videoId) {
      return new Response('Missing video ID', { status: 400 });
    }

    // Get the actual YouTube URL from your main endpoint
    const youtubeRes = await fetch(`${process.env.NEXTAUTH_URL}/api/video-stream?id=${videoId}`);
    const data = await youtubeRes.json();

    if (!data.url) {
      return new Response('No video URL found', { status: 404 });
    }

    // Proxy the video stream
    const videoRes = await fetch(data.url);
    
    if (!videoRes.ok) {
      return new Response('Failed to fetch video stream', { status: 500 });
    }

    // Create a readable stream from the response
    const readableStream = videoRes.body;

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('Proxy error:', err);
    return new Response('Internal server error', { status: 500 });
  }
}