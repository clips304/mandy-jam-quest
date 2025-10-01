const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg";

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

async function getOfficialChannelId(artist) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
    artist + " official"
  )}&key=${API_KEY}`;

  const res = await fetch(searchUrl);
  if (!res.ok) {
    throw new Error(`YouTube API returned status ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`YouTube API Error: ${data.error.message}`);
  }

  if (!data.items || data.items.length === 0) return null;

  const channel = data.items.find((ch) => {
    const title = ch.snippet.title.toLowerCase();
    return (
      title.includes("vevo") ||
      title.includes("- topic") ||
      ch.snippet.title.toLowerCase().includes(artist.toLowerCase())
    );
  });

  return channel ? channel.id.channelId : null;
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

    const channelId = await getOfficialChannelId(artist);
    if (!channelId) {
      console.log(`⚠️ No official channel found for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No official channel found"
      });
    }

    const playlistUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
    const playlistRes = await fetch(playlistUrl);

    if (!playlistRes.ok) {
      throw new Error(`YouTube API returned status ${playlistRes.status}`);
    }

    const playlistData = await playlistRes.json();

    if (playlistData.error) {
      throw new Error(`YouTube API Error: ${playlistData.error.message}`);
    }

    const uploadsId = playlistData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsId) {
      console.log(`⚠️ No uploads playlist found for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No uploads playlist found"
      });
    }

    const uploadsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=50&key=${API_KEY}`;
    const uploadsRes = await fetch(uploadsUrl);

    if (!uploadsRes.ok) {
      throw new Error(`YouTube API returned status ${uploadsRes.status}`);
    }

    const uploadsData = await uploadsRes.json();

    if (uploadsData.error) {
      throw new Error(`YouTube API Error: ${uploadsData.error.message}`);
    }

    if (!uploadsData.items || uploadsData.items.length === 0) {
      console.log(`⚠️ No videos found for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No videos found"
      });
    }

    const songs = uploadsData.items
      .map((item) => {
        const { title, publishedAt, thumbnails, resourceId } = item.snippet;
        const year = new Date(publishedAt).getFullYear();

        return {
          title,
          artist: artist,
          year,
          thumbnail: thumbnails?.default?.url,
          videoId: resourceId.videoId,
          url: `https://www.youtube.com/watch?v=${resourceId.videoId}`,
        };
      })
      .filter((song) => {
        if (startYear && endYear) {
          return song.year >= parseInt(startYear) && song.year <= parseInt(endYear);
        }
        return true;
      })
      .filter(
        (song) =>
          !/lyric|live|cover|interview|behind|short|teaser/i.test(song.title)
      )
      .slice(0, parseInt(count));

    if (songs.length === 0) {
      console.log(`⚠️ No songs matched filters for ${artist}, returning fallback`);
      return res.json({
        songs: FALLBACK_SONGS.slice(0, parseInt(count)),
        isFallback: true,
        message: "No songs matched your criteria"
      });
    }

    console.log(`✅ Found ${songs.length} songs for ${artist}`);
    res.json({ songs, isFallback: false });

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
    timestamp: new Date().toISOString()
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
});

module.exports = app;
