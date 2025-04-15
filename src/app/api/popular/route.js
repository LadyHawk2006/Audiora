import { NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

// Music genres to search for
const MUSIC_GENRES = [
  "Pop", "Rock", "Hip Hop", "R&B", "Electronic", 
  "Jazz", "Classical", "Country", "Metal", "Indie"
];

// Strict music content validation
const isMusicContent = (item) => {
  if (item.type !== "Video") return false;
  
  const title = item.title?.text?.toLowerCase() || "";
  const artist = item.author?.name?.toLowerCase() || "";
  const thumbnail = item.thumbnails?.[0]?.url || "";

  // Common music video patterns
  const musicPatterns = [
    /^.* - .*$/,               // "Artist - Song"
    /^.* \| .*$/,              // "Artist | Song"
    /official video/i,
    /official music video/i,
    /official audio/i,
    /lyric video/i,
    /visualizer/i,
    /^.*\(official.*\)$/i,     // "Song (Official...)"
    /^.*\[official.*\]$/i      // "Song [Official...]"
  ];

  // Common music channel indicators
  const musicChannelIndicators = [
    'vevo',
    'music',
    'records',
    'official',
    'lyrics',
    'audio',
    'song'
  ];

  // Must have either music title pattern or music channel indicator
  const isMusicTitle = musicPatterns.some(pattern => pattern.test(title));
  const isMusicChannel = musicChannelIndicators.some(indicator => 
    artist.includes(indicator)
  );

  return isMusicTitle || isMusicChannel;
};

export async function GET(req) {
  try {
    const yt = await Innertube.create();
    const { searchParams } = new URL(req.url);
    const country = searchParams.get("country") || "US";
    
    console.log(`🔍 Strictly fetching music content in ${country}...`);

    let allSongs = [];
    const uniqueIds = new Set(); // To prevent duplicates

    for (const genre of MUSIC_GENRES) {
      console.log(`🔎 Searching for ${genre} music in ${country}...`);
      
      try {
        const searchResults = await yt.search(`${genre} music`, { 
          type: "video",
          params: { hl: country.toLowerCase() } // Country-specific results
        });

        if (!searchResults?.results?.length) {
          console.log(`⚠️ No ${genre} songs found for ${country}`);
          continue;
        }

        const songs = searchResults.results
          .filter(item => {
            // Skip if already included or not music content
            if (uniqueIds.has(item.id) || !isMusicContent(item)) return false;
            uniqueIds.add(item.id);
            return true;
          })
          .map(item => ({
            id: item.id,
            title: extractCleanTitle(item.title?.text),
            artist: extractCleanArtist(item),
            thumbnail: getBestThumbnail(item.thumbnails),
            videoId: item.id,
            audioSrc: `https://www.youtube.com/watch?v=${item.id}`,
            genre: genre,
            views: item.view_count?.text || "N/A",
            duration: item.duration?.text || "N/A"
          }));

        console.log(`✅ Found ${songs.length} ${genre} songs`);
        allSongs = [...allSongs, ...songs];
      } catch (error) {
        console.error(`❌ Error fetching ${genre} songs:`, error);
      }
    }

    // Sort by popularity (approximated by view count)
    allSongs.sort((a, b) => {
      const aViews = parseViews(a.views);
      const bViews = parseViews(b.views);
      return bViews - aViews;
    });

    console.log(`🎵 Found ${allSongs.length} total music tracks`);
    return NextResponse.json({ songs: allSongs.slice(0, 100) }); // Limit to top 100
  } catch (error) {
    console.error("❌ Error fetching music content:", error);
    return NextResponse.json(
      { error: "Failed to fetch music. Please try again later." }, 
      { status: 500 }
    );
  }
}

// Helper functions
function extractCleanTitle(title) {
  if (!title) return "Unknown Track";
  
  // Remove common prefixes/suffixes
  return title
    .replace(/^.*-\s*/, "") // Remove artist part if first
    .replace(/\s*[\(\[].*?[\)\]]/g, "") // Remove anything in brackets
    .replace(/official video|lyrics?|visualizer|hd|4k/gi, "")
    .trim();
}

function extractCleanArtist(item) {
  const title = item.title?.text || "";
  const author = item.author?.name || "";
  
  // Try to extract from title first (Artist - Song format)
  const titleParts = title.split(/ - | \| /);
  if (titleParts.length > 1) return titleParts[0].trim();
  
  // Fall back to channel name
  if (author) return author;
  
  return "Unknown Artist";
}

function getBestThumbnail(thumbnails) {
  if (!thumbnails?.length) return "";
  
  // Prefer higher resolution thumbnails
  const sorted = thumbnails.sort((a, b) => {
    const aRes = (a.width || 0) * (a.height || 0);
    const bRes = (b.width || 0) * (b.height || 0);
    return bRes - aRes;
  });
  
  return sorted[0].url;
}

function parseViews(viewStr) {
  if (!viewStr || viewStr === "N/A") return 0;
  const multiplier = viewStr.includes('K') ? 1000 : 
                   viewStr.includes('M') ? 1000000 : 1;
  const num = parseFloat(viewStr.replace(/[^\d.]/g, ''));
  return num * multiplier;
}