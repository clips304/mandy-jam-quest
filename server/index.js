require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.YOUTUBE_API_KEY;

if (!API_KEY) {
  console.error('❌ YOUTUBE_API_KEY not found in environment variables');
  process.exit(1);
}

const FALLBACK_SONGS = [
  {
    title: "Beautiful Day",
    artist: "System",
    year: 2020,
    url: "https://music.youtube.com",
    thumbnail: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=200"
  },
  {
    title: "Sunset Dreams",
    artist: "System",
    year: 2021,
    url: "https://music.youtube.com",
    thumbnail: "https://images.pexels.com/photos/210887/pexels-photo-210887.jpeg?auto=compress&cs=tinysrgb&w=200"
  },
  {
    title: "Ocean Waves",
    artist: "System",
    year: 2022,
    url: "https://music.youtube.com",
    thumbnail: "https://images.pexels.com/photos/1083822/pexels-photo-1083822.jpeg?auto=compress&cs=tinysrgb&w=200"
  },
  {
    title: "City Lights",
    artist: "System",
    year: 2023,
    url: "https://music.youtube.com",
    thumbnail: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=200"
  },
  {
    title: "Mountain Echo",
    artist: "System",
    year: 2024,
    url: "https://music.youtube.com",
    thumbnail: "https://images.pexels.com/photos/346529/pexels-photo-346529.jpeg?auto=compress&cs=tinysrgb&w=200"
  }
];

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

async function findBestChannel(artist) {
  try {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
      artist
    )}&maxResults=10&key=${API_KEY}`;

    const response = await fetch(searchUrl);
    if (!response.ok) {
      throw new Error(`YouTube API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      return null;
    }

    const channelIds = data.items.map(item => item.id.channelId);

    const channelsUrl = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds.join(',')}&key=${API_KEY}`;
    const channelsResponse = await fetch(channelsUrl);

    if (!channelsResponse.ok) {
      throw new Error(`YouTube API returned status ${channelsResponse.status}`);
    }

    const channelsData = await channelsResponse.json();

    if (channelsData.error) {
      throw new Error(`YouTube API Error: ${channelsData.error.message}`);
    }

    if (!channelsData.items || channelsData.items.length === 0) {
      return null;
    }

    const artistLower = artist.toLowerCase();

    const rankedChannels = channelsData.items.map(channel => {
      const title = channel.snippet.title.toLowerCase();
      const subscriberCount = parseInt(channel.statistics?.subscriberCount || 0);

      let score = 0;

      if (title.includes('vevo')) score += 1000;
      if (title.includes('- topic')) score += 900;
      if (title.includes('official')) score += 800;
      if (title === artistLower) score += 700;
      if (title.includes(artistLower)) score += 500;

      score += Math.min(subscriberCount / 1000000, 100);

      return {
        ...channel,
        score
      };
    });

    rankedChannels.sort((a, b) => b.score - a.score);

    return rankedChannels[0];

  } catch (error) {
    console.error('Error finding channel:', error);
    throw error;
  }
}

async function getChannelUploads(channelId) {
  try {
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
    const response = await fetch(channelUrl);

    if (!response.ok) {
      throw new Error(`YouTube API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    const uploadsPlaylistId = data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsPlaylistId) {
      throw new Error('No uploads playlist found');
    }

    return uploadsPlaylistId;

  } catch (error) {
    console.error('Error getting uploads playlist:', error);
    throw error;
  }
}

async function getPlaylistVideos(playlistId, maxResults = 50) {
  try {
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`;
    const response = await fetch(playlistUrl);

    if (!response.ok) {
      throw new Error(`YouTube API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map(item => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      publishedAt: item.snippet.publishedAt,
      thumbnail: item.snippet.thumbnails?.default?.url
    }));

  } catch (error) {
    console.error('Error getting playlist videos:', error);
    throw error;
  }
}

async function getVideoDetails(videoIds) {
  try {
    const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`;
    const response = await fetch(videoUrl);

    if (!response.ok) {
      throw new Error(`YouTube API returned status ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`YouTube API Error: ${data.error.message}`);
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    return data.items.map(video => ({
      videoId: video.id,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      publishedAt: video.snippet.publishedAt,
      categoryId: video.snippet.categoryId,
      thumbnail: video.snippet.thumbnails?.default?.url,
      duration: video.contentDetails.duration
    }));

  } catch (error) {
    console.error('Error getting video details:', error);
    throw error;
  }
}

app.get("/api/music", async (req, res) => {
  const { artist, startYear, endYear, count = 5 } = req.query;

  try {
    if (!artist) {
      console.log("⚠️ No artist provided, returning fallback songs");
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No artist specified"
      });
    }

    console.log(`🎵 Fetching music for: ${artist} (${startYear}-${endYear})`);

    const channel = await findBestChannel(artist);
    if (!channel) {
      console.log(`⚠️ No channel found for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No official channel found"
      });
    }

    console.log(`✅ Found channel: ${channel.snippet.title} (${channel.id})`);

    const uploadsPlaylistId = await getChannelUploads(channel.id);
    console.log(`✅ Got uploads playlist: ${uploadsPlaylistId}`);

    const playlistVideos = await getPlaylistVideos(uploadsPlaylistId, 50);
    console.log(`✅ Found ${playlistVideos.length} videos in playlist`);

    if (playlistVideos.length === 0) {
      console.log(`⚠️ No videos found for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No videos found in channel"
      });
    }

    const videoIds = playlistVideos.map(v => v.videoId);
    const videoDetails = await getVideoDetails(videoIds);
    console.log(`✅ Got details for ${videoDetails.length} videos`);

    const filteredSongs = videoDetails
      .filter(video => {
        const durationSeconds = parseDuration(video.duration);

        if (durationSeconds < 40) return false;
        if (durationSeconds > 600) return false;

        const titleLower = video.title.toLowerCase();
        if (titleLower.includes('lyric')) return false;
        if (titleLower.includes('live')) return false;
        if (titleLower.includes('cover')) return false;
        if (titleLower.includes('interview')) return false;
        if (titleLower.includes('behind')) return false;
        if (titleLower.includes('short')) return false;
        if (titleLower.includes('teaser')) return false;
        if (titleLower.includes('trailer')) return false;
        if (titleLower.includes('reaction')) return false;

        return true;
      })
      .map(video => {
        const year = new Date(video.publishedAt).getFullYear();

        return {
          title: video.title,
          artist: video.channelTitle,
          year,
          categoryId: video.categoryId,
          videoId: video.videoId,
          url: `https://music.youtube.com/watch?v=${video.videoId}`,
          thumbnail: video.thumbnail
        };
      })
      .filter(song => {
        if (startYear && endYear) {
          return song.year >= parseInt(startYear) && song.year <= parseInt(endYear);
        }
        return true;
      })
      .filter(song => song.categoryId === '10')
      .slice(0, parseInt(count));

    console.log(`✅ Filtered down to ${filteredSongs.length} songs`);

    if (filteredSongs.length === 0) {
      console.log(`⚠️ No songs matched filters for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No songs matched your criteria"
      });
    }

    res.json({ songs: filteredSongs, isFallback: false });

  } catch (err) {
    console.error("❌ Error fetching music:", err.message);

    res.json({
      songs: FALLBACK_SONGS.slice(0, parseInt(count || 5)),
      isFallback: true,
      message: "Unable to fetch from YouTube. Showing fallback results."
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    apiKey: API_KEY ? 'configured' : 'missing'
  });
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🎵 Music API endpoint: http://localhost:${PORT}/api/music`);
  console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 YouTube API Key: ${API_KEY ? 'Configured' : 'Missing'}`);
});

module.exports = app;
