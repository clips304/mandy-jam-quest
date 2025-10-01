const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// YouTube API Key
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Music Quest server is running' });
});

// Helper function to check if channel is official
function isOfficialChannel(channelTitle) {
  const officialIndicators = [' - Topic', 'VEVO', 'official'];
  return officialIndicators.some(indicator => 
    channelTitle.toLowerCase().includes(indicator.toLowerCase())
  );
}

// Helper function to filter out non-songs
function isValidSong(title, description = '') {
  const excludeTerms = [
    'lyric', 'live', 'cover', 'interview', 'behind the scenes', 
    'teaser', 'reaction', 'remix', 'short'
  ];
  
  const content = `${title} ${description}`.toLowerCase();
  return !excludeTerms.some(term => content.includes(term));
}

// Helper function to check if video is within decade
function isWithinDecade(publishedAt, startYear, endYear) {
  const year = new Date(publishedAt).getFullYear();
  return year >= startYear && year <= endYear;
}

// Music API endpoint
app.get('/api/music', async (req, res) => {
  try {
    const { artist, startYear = 2010, endYear = 2020, count = 5 } = req.query;
    
    if (!artist) {
      return res.status(400).json({ error: 'Artist parameter is required' });
    }

    // Search for videos with YouTube Music criteria
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&type=video&videoCategoryId=10&videoDuration=medium&` +
      `q=${encodeURIComponent(artist)}&maxResults=50&key=${YOUTUBE_API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items) {
      return res.json({ 
        songs: [], 
        message: `No official songs found for ${artist}` 
      });
    }

    // Get video details for filtering
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=snippet,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`;

    const videosResponse = await fetch(videosUrl);
    const videosData = await videosResponse.json();

    // Filter videos based on criteria
    const filteredSongs = videosData.items
      .filter(video => {
        const { snippet, contentDetails } = video;
        
        // Check if channel is official
        if (!isOfficialChannel(snippet.channelTitle)) return false;
        
        // Check if it's a valid song (not lyric/live/etc)
        if (!isValidSong(snippet.title, snippet.description)) return false;
        
        // Check duration (must be > 30 seconds)
        const duration = contentDetails.duration;
        const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
        const minutes = parseInt(match[1] || 0);
        const seconds = parseInt(match[2] || 0);
        const totalSeconds = minutes * 60 + seconds;
        if (totalSeconds < 30) return false;
        
        // Check if within decade
        if (!isWithinDecade(snippet.publishedAt, parseInt(startYear), parseInt(endYear))) return false;
        
        return true;
      })
      .slice(0, parseInt(count))
      .map(video => ({
        title: video.snippet.title,
        artist: video.snippet.channelTitle,
        year: new Date(video.snippet.publishedAt).getFullYear(),
        thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default.url,
        playUrl: `https://music.youtube.com/watch?v=${video.id}`
      }));

    const message = filteredSongs.length < parseInt(count) 
      ? `Only ${filteredSongs.length} official songs found from that decade.`
      : null;

    res.json({ songs: filteredSongs, message });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch music data' });
  }
});

app.listen(PORT, () => {
  console.log(`Music Quest server running on http://localhost:${PORT}`);
});