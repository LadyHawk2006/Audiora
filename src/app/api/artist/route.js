import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

// Cache YouTube instance
let youtubeInstance = null;

const KNOWN_CHANNELS = {
  'ajsbhbhbhb': 'UCBJycsmduvYEL83R_U4JriQ',
  'nlnndsjjce': 'UCANLZYMidaCbLQFWXBC95Jg',
  'endnrerefe': 'UC2XdaAVUannpujzv32jcouQ'
};

const YT_TIMEOUT = 60000;
const ITEMS_PER_PAGE = 40; // Increased to 40 items per page

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

function isArtistMatch(channelName, artistName) {
  const clean = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanChannel = clean(channelName);
  const cleanArtist = clean(artistName);
  
  return (
    cleanChannel.includes(cleanArtist) ||
    cleanChannel.includes(cleanArtist.replace(' ', '')) ||
    cleanChannel === cleanArtist.replace(' ', '') + 'vevo' ||
    cleanChannel === cleanArtist.replace(' ', '') + 'topic'
  );
}

async function searchArtistChannel(artistName) {
  const lowerName = artistName.toLowerCase();
  if (KNOWN_CHANNELS[lowerName]) {
    const youtube = await getYouTubeInstance();
    const channel = await Promise.race([
      youtube.getChannel(KNOWN_CHANNELS[lowerName]),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Channel fetch timeout')), YT_TIMEOUT))
    ]);
    
    return {
      channelId: channel.id,
      channelName: channel.metadata.title,
      thumbnail: channel.metadata.avatar?.url || null,
      source: "known_channel"
    };
  }

  const youtube = await getYouTubeInstance();
  const searchStrategies = [
    { name: "official_artist", query: `${artistName} official artist channel`, type: "channel" },
    { name: "vevo", query: `${artistName} vevo`, type: "channel" },
    { name: "topic", query: `${artistName} topic`, type: "channel" },
    { name: "official_video", query: `${artistName} official music video`, type: "video" }
  ];

  for (const [index, strategy] of searchStrategies.entries()) {
    try {
      if (index > 0) await new Promise(resolve => setTimeout(resolve, 500));
      
      const results = await Promise.race([
        youtube.search(strategy.query, { type: strategy.type }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), YT_TIMEOUT)
        )
      ]);
      
      const items = strategy.type === "video" ? results.videos : results.results;
      if (!items?.length) continue;

      const match = items.find(item => 
        strategy.type === "video" 
          ? isArtistMatch(item.author?.name, artistName)
          : isArtistMatch(item.name, artistName)
      );

      if (match) {
        return {
          channelId: strategy.type === "video" ? match.author.id : match.id,
          channelName: strategy.type === "video" ? match.author.name : match.name,
          thumbnail: strategy.type === "video" ? match.author.thumbnails?.[0]?.url : match.thumbnails?.[0]?.url,
          source: strategy.name
        };
      }
    } catch (error) {
      console.error(`Search strategy ${strategy.name} failed:`, error);
      continue;
    }
  }

  throw new Error("No matching channel found");
}

async function deepSearchVideos(artistName, page = 1) {
  const youtube = await getYouTubeInstance();
  
  // Define search strategies in order of priority
  const searchStrategies = [
    { name: "official_video", query: `${artistName} official video` },
    { name: "official_music", query: `${artistName} official music` },
    { name: "official", query: `${artistName} official` },
    { name: "album", query: `${artistName} album` },
    { name: "playlist", query: `${artistName} playlist` },
    { name: "mixes", query: `${artistName} mixes` },
    { name: "general", query: artistName }
  ];

  let allVideos = [];
  
  // Try each strategy until we get enough results
  for (const strategy of searchStrategies) {
    try {
      const results = await Promise.race([
        youtube.search(strategy.query, { type: "video" }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Search timeout')), YT_TIMEOUT))
      ]);
      
      // In the deepSearchVideos function, modify the video mapping:
     const videos = results.videos.map(video => ({
       id: video.id,
       title: video.title,
       duration: video.duration?.text,
       thumbnails: Array.isArray(video.thumbnails) ? video.thumbnails : 
             video.thumbnails?.url ? [{ url: video.thumbnails.url }] : 
             video.author?.thumbnails || [{ url: '/default-video.jpg' }],
      published: video.published?.text,
      viewCount: video.view_count?.text,
      url: `https://www.youtube.com/watch?v=${video.id}`,
      channelName: video.author?.name,
      source: strategy.name
      }));
      
      // Merge videos, avoiding duplicates
      videos.forEach(video => {
        if (!allVideos.some(v => v.id === video.id)) {
          allVideos.push(video);
        }
      });
      
      // If we have enough results, break early
      if (allVideos.length >= ITEMS_PER_PAGE * 3) {
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Deep search strategy ${strategy.name} failed:`, error);
      continue;
    }
  }
  
  // Sort videos with "official" results first
  allVideos.sort((a, b) => {
    const aScore = a.source.includes('official') ? 1 : 0;
    const bScore = b.source.includes('official') ? 1 : 0;
    return bScore - aScore;
  });

  // Paginate the results
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedVideos = allVideos.slice(startIndex, endIndex);
  
  return {
    videos: paginatedVideos,
    total: allVideos.length,
    hasMore: endIndex < allVideos.length,
    currentPage: page,
    totalPages: Math.ceil(allVideos.length / ITEMS_PER_PAGE)
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawName = searchParams.get("name") || searchParams.get("artist");
    const artistName = decodeURIComponent(rawName).trim();
    const page = parseInt(searchParams.get("page")) || 1;

    if (!artistName) {
      return NextResponse.json(
        { error: "Artist name is required" },
        { status: 400 }
      );
    }

    // First search for the artist channel to get metadata
    const channelInfo = await searchArtistChannel(artistName);
    const youtube = await getYouTubeInstance();
    const channel = await youtube.getChannel(channelInfo.channelId);

    // Get channel metadata
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

    // Perform deep search using the artist name
    const videoData = await deepSearchVideos(metadata.name, page);

    return NextResponse.json({
      success: true,
      channelInfo: {
        channelId: channelInfo.channelId,
        channelName: channelInfo.channelName,
        thumbnail: channelInfo.thumbnail,
        source: channelInfo.source
      },
      metadata,
      content: {
        videos: videoData.videos
      },
      pagination: {
        currentPage: videoData.currentPage,
        totalPages: videoData.totalPages,
        totalItems: videoData.total,
        hasMore: videoData.hasMore,
        itemsPerPage: ITEMS_PER_PAGE
      }
    });

  } catch (error) {
    console.error("API request failed:", error);
    
    if (error.message === "No matching channel found") {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        error: error.message || "Failed to process request",
        ...(process.env.NODE_ENV === "development" && { stack: error.stack })
      },
      { status: 500 }
    );
  }
}