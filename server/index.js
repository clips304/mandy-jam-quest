const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const API_KEY = "AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg";

async function getOfficialChannelId(artist) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(
    artist + " official"
  )}&key=${API_KEY}`;

  const res = await fetch(searchUrl);
  const data = await res.json();
  if (!data.items) return null;

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
    const channelId = await getOfficialChannelId(artist);
    if (!channelId) {
      return res.json({ songs: [], message: "No official channel found." });
    }

    const playlistUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`;
    const playlistRes = await fetch(playlistUrl);
    const playlistData = await playlistRes.json();
    const uploadsId =
      playlistData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

    if (!uploadsId) {
      return res.json({ songs: [], message: "No uploads playlist found." });
    }

    const uploadsUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=50&key=${API_KEY}`;
    const uploadsRes = await fetch(uploadsUrl);
    const uploadsData = await uploadsRes.json();

    if (!uploadsData.items) {
      return res.json({ songs: [], message: "No videos found in uploads." });
    }

    const songs = uploadsData.items
      .map((item) => {
        const { title, publishedAt, thumbnails, resourceId } = item.snippet;
        const year = new Date(publishedAt).getFullYear();

        return {
          title,
          year,
          thumbnail: thumbnails?.default?.url,
          videoId: resourceId.videoId,
          url: `https://www.youtube.com/watch?v=${resourceId.videoId}`,
        };
      })
      .filter((song) => {
        if (startYear && endYear) {
          return song.year >= startYear && song.year <= endYear;
        }
        return true;
      })
      .filter(
        (song) =>
          !/lyric|live|cover|interview|behind|short|teaser/i.test(song.title)
      )
      .slice(0, count);

    res.json({ songs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch music" });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
