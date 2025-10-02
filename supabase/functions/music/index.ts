import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const YOUTUBE_API_KEY = "AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg";

function isOfficialChannel(channelTitle: string): boolean {
  const officialIndicators = [' - Topic', 'VEVO', 'Official'];
  return officialIndicators.some(indicator =>
    channelTitle.toLowerCase().includes(indicator.toLowerCase())
  );
}

function isValidSong(title: string, description = ''): boolean {
  const excludeTerms = [
    'lyric', 'lyrics', 'live', 'cover', 'interview', 'behind the scenes',
    'teaser', 'reaction', 'remix', 'short', 'shorts', 'trailer', 'making of'
  ];

  const content = `${title} ${description}`.toLowerCase();
  return !excludeTerms.some(term => content.includes(term));
}

function isWithinDecade(publishedAt: string, startYear: number, endYear: number): boolean {
  const year = new Date(publishedAt).getFullYear();
  return year >= startYear && year <= endYear;
}

function getFallbackSongs(artist?: string): any[] {
  return [
    {
      title: "Bohemian Rhapsody",
      artist: artist || "Queen",
      year: 1975,
      thumbnail: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=400",
      url: "https://music.youtube.com"
    },
    {
      title: "Imagine",
      artist: artist || "John Lennon",
      year: 1971,
      thumbnail: "https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&w=400",
      url: "https://music.youtube.com"
    },
    {
      title: "Billie Jean",
      artist: artist || "Michael Jackson",
      year: 1982,
      thumbnail: "https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=400",
      url: "https://music.youtube.com"
    },
    {
      title: "Like a Rolling Stone",
      artist: artist || "Bob Dylan",
      year: 1965,
      thumbnail: "https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=400",
      url: "https://music.youtube.com"
    },
    {
      title: "Smells Like Teen Spirit",
      artist: artist || "Nirvana",
      year: 1991,
      thumbnail: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400",
      url: "https://music.youtube.com"
    }
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
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
        JSON.stringify({
          songs: getFallbackSongs(),
          isFallback: true,
          message: 'Artist parameter is required - showing fallback songs'
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`🎵 Searching for ${artist} from ${startYear} to ${endYear}`);

    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&videoCategoryId=10&videoDuration=medium&` +
        `q=${encodeURIComponent(artist)}&maxResults=50&key=${YOUTUBE_API_KEY}`;

      const searchResponse = await fetch(searchUrl);

      if (!searchResponse.ok) {
        console.error(`YouTube API error: ${searchResponse.status}`);
        throw new Error(`YouTube API returned ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();

      if (searchData.error) {
        console.error('YouTube API error:', searchData.error);
        throw new Error(searchData.error.message || 'YouTube API error');
      }

      if (!searchData.items || searchData.items.length === 0) {
        console.log(`No items found for ${artist}`);
        return new Response(
          JSON.stringify({
            songs: getFallbackSongs(artist).slice(0, count),
            isFallback: true,
            message: `No official songs found for ${artist} - showing similar songs`
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
      const videosUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;

      const videosResponse = await fetch(videosUrl);

      if (!videosResponse.ok) {
        throw new Error(`YouTube API returned ${videosResponse.status}`);
      }

      const videosData = await videosResponse.json();

      if (videosData.error) {
        throw new Error(videosData.error.message || 'YouTube API error');
      }

      const filteredSongs = videosData.items
        .filter((video: any) => {
          const { snippet, contentDetails } = video;

          if (!isOfficialChannel(snippet.channelTitle)) return false;
          if (!isValidSong(snippet.title, snippet.description)) return false;

          const duration = contentDetails.duration;
          const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
          const minutes = parseInt(match?.[1] || '0');
          const seconds = parseInt(match?.[2] || '0');
          const totalSeconds = minutes * 60 + seconds;
          if (totalSeconds < 30) return false;

          if (!isWithinDecade(snippet.publishedAt, startYear, endYear)) return false;

          return true;
        })
        .slice(0, count)
        .map((video: any) => ({
          title: video.snippet.title,
          artist: video.snippet.channelTitle.replace(' - Topic', '').replace('VEVO', '').trim(),
          year: new Date(video.snippet.publishedAt).getFullYear(),
          thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
          url: `https://music.youtube.com/watch?v=${video.id}`
        }));

      if (filteredSongs.length === 0) {
        console.log(`No songs matched filters for ${artist}`);
        return new Response(
          JSON.stringify({
            songs: getFallbackSongs(artist).slice(0, count),
            isFallback: true,
            message: `No official songs found for ${artist} from ${startYear}-${endYear} - showing similar songs`
          }),
          {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const message = filteredSongs.length < count
        ? `Found ${filteredSongs.length} official songs from that decade.`
        : `Found ${filteredSongs.length} official songs!`;

      console.log(`✅ Found ${filteredSongs.length} songs for ${artist}`);

      return new Response(
        JSON.stringify({
          songs: filteredSongs,
          isFallback: false,
          message
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (apiError) {
      console.error('❌ YouTube API Error:', apiError);

      return new Response(
        JSON.stringify({
          songs: getFallbackSongs(artist).slice(0, count),
          isFallback: true,
          message: `YouTube API unavailable - showing fallback songs for ${artist}`
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('❌ Music API Error:', error);

    return new Response(
      JSON.stringify({
        songs: getFallbackSongs(),
        isFallback: true,
        message: 'Service temporarily unavailable - showing fallback songs'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});