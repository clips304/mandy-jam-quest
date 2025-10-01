import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to check if channel is official
function isOfficialChannel(channelTitle: string): boolean {
  const officialIndicators = [' - Topic', 'VEVO', 'official'];
  return officialIndicators.some(indicator => 
    channelTitle.toLowerCase().includes(indicator.toLowerCase())
  );
}

// Helper function to filter out non-songs
function isValidSong(title: string, description = ''): boolean {
  const excludeTerms = [
    'lyric', 'live', 'cover', 'interview', 'behind the scenes', 
    'teaser', 'reaction', 'remix', 'short'
  ];
  
  const content = `${title} ${description}`.toLowerCase();
  return !excludeTerms.some(term => content.includes(term));
}

// Helper function to check if video is within decade
function isWithinDecade(publishedAt: string, startYear: number, endYear: number): boolean {
  const year = new Date(publishedAt).getFullYear();
  return year >= startYear && year <= endYear;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body or query parameters
    let artist: string | null = null;
    let startYear = 2010;
    let endYear = 2020;
    let count = 5;

    if (req.method === 'POST') {
      const body = await req.json();
      artist = body.artist || null;
      startYear = parseInt(body.startYear) || 2010;
      endYear = parseInt(body.endYear) || 2020;
      count = parseInt(body.count) || 5;
    } else {
      const url = new URL(req.url);
      artist = url.searchParams.get('artist');
      startYear = parseInt(url.searchParams.get('startYear') || '2010');
      endYear = parseInt(url.searchParams.get('endYear') || '2020');
      count = parseInt(url.searchParams.get('count') || '5');
    }
    
    if (!artist) {
      return new Response(
        JSON.stringify({ error: 'Artist parameter is required' }), 
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    
    if (!YOUTUBE_API_KEY) {
      console.error('YOUTUBE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'YouTube API key not configured' }), 
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🎵 Searching for ${artist} from ${startYear} to ${endYear}`);

    // Search for videos with YouTube Music criteria
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&videoCategoryId=10&videoDuration=medium&` +
      `q=${encodeURIComponent(artist)}&maxResults=50&key=${YOUTUBE_API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items) {
      console.log(`No items found for ${artist}`);
      return new Response(
        JSON.stringify({ 
          songs: [], 
          message: `No official songs found for ${artist}` 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Get video details for filtering
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    // Filter videos based on criteria
    const filteredSongs = videosData.items
      .filter((video: any) => {
        const { snippet, contentDetails } = video;
        
        // Check if channel is official
        if (!isOfficialChannel(snippet.channelTitle)) return false;
        
        // Check if it's a valid song (not lyric/live/etc)
        if (!isValidSong(snippet.title, snippet.description)) return false;
        
        // Check duration (must be > 30 seconds)
        const duration = contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
        const minutes = parseInt(match?.[1] || '0');
        const seconds = parseInt(match?.[2] || '0');
        const totalSeconds = minutes * 60 + seconds;
        if (totalSeconds < 30) return false;
        
        // Check if within decade
        if (!isWithinDecade(snippet.publishedAt, startYear, endYear)) return false;
        
        return true;
      })
      .slice(0, count)
      .map((video: any) => ({
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        year: new Date(video.snippet.publishedAt).getFullYear(),
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        url: `https://music.youtube.com/watch?v=${video.id}`
      }));

    const message = filteredSongs.length < count 
      ? `Only ${filteredSongs.length} official songs found from that decade.`
      : null;

    console.log(`✅ Found ${filteredSongs.length} songs for ${artist}`);

    return new Response(
      JSON.stringify({ songs: filteredSongs, message }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Music API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch music data' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
