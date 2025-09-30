const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// YouTube API configuration
// TODO: Set your YouTube Data API v3 key here
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// Helper function to make YouTube API requests
async function youtubeRequest(endpoint, params) {
  const url = new URL(`${YOUTUBE_BASE_URL}/${endpoint}`);
  url.searchParams.append('key', YOUTUBE_API_KEY);
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value.toString());
    }
  });

  console.log(`🔍 YouTube API Request: ${endpoint}`, params);
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    const error = await response.text();
    console.error(`❌ YouTube API Error (${response.status}):`, error);
    throw new Error(`YouTube API Error: ${response.status} - ${error}`);
  }
  
  return response.json();
}

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration) {
  if (!duration) return 0;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Helper function to check if content is music-related
function isMusicContent(title, description = '') {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  // Exclude non-music content
  const excludePatterns = [
    /\b(lyric|lyrics)\b/i,
    /\b(live)\b/i,
    /\b(cover|covers)\b/i,
    /\b(interview|interviews)\b/i,
    /\b(short|shorts)\b/i,
    /\b(teaser|teasers)\b/i,
    /\bbehind the scenes\b/i,
  ];
  
  // Check if title or description contains excluded patterns
  for (const pattern of excludePatterns) {
    if (pattern.test(titleLower) || pattern.test(descLower)) {
      return false;
    }
  }
  
  return true;
}

// Helper function to find official channels for an artist
async function findOfficialChannels(artistName) {
  console.log(`🔍 Finding official channels for: ${artistName}`);
  
  try {
    // Search for channels
    const searchData = await youtubeRequest('search', {
      part: 'snippet',
      type: 'channel',
      q: `${artistName} official`,
      maxResults: 10
    });

    if (!searchData.items || searchData.items.length === 0) {
      console.log('❌ No channels found in search');
      return [];
    }

    // Get detailed channel information
    const channelIds = searchData.items.map(item => item.id.channelId).join(',');
    const channelData = await youtubeRequest('channels', {
      part: 'snippet,statistics,contentDetails',
      id: channelIds
    });

    const channels = [];
    
    for (const channel of channelData.items || []) {
      const channelTitle = channel.snippet.title.toLowerCase();
      const artistLower = artistName.toLowerCase();
      const subscriberCount = parseInt(channel.statistics?.subscriberCount || '0');
      
      // Must contain artist name or be very similar
      if (!channelTitle.includes(artistLower) && !artistLower.includes(channelTitle.split(' ')[0])) {
        continue;
      }
      
      let channelType = 'other';
      let priority = 0;
      
      // Determine channel type and priority
      if (channelTitle === artistLower || channelTitle === `${artistLower} official`) {
        channelType = 'official';
        priority = 4;
      } else if (channelTitle.includes('vevo')) {
        channelType = 'vevo';
        priority = 3;
      } else if (channelTitle.includes('- topic')) {
        channelType = 'topic';
        priority = 2;
      } else if (channelTitle.includes('official')) {
        channelType = 'official';
        priority = 4;
      }
      
      // Only add if it's an official type and has reasonable subscriber count
      if (['official', 'vevo', 'topic'].includes(channelType) && subscriberCount > 1000) {
        channels.push({
          channelId: channel.id,
          title: channel.snippet.title,
          subscriberCount,
          type: channelType,
          priority,
          uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads
        });
      }
    }

    // Sort by priority, then subscriber count
    channels.sort((a, b) => {
      if (a.priority !== b.priority) return b.priority - a.priority;
      return b.subscriberCount - a.subscriberCount;
    });

    console.log(`✅ Found ${channels.length} official channels:`, 
      channels.map(c => `${c.title} (${c.type}, ${c.subscriberCount} subs)`));
    
    return channels;
  } catch (error) {
    console.error('❌ Error finding official channels:', error);
    return [];
  }
}

// Helper function to get videos from uploads playlist
async function getPlaylistVideos(playlistId, maxItems = 200) {
  console.log(`📹 Getting videos from playlist: ${playlistId}`);
  
  const videos = [];
  let nextPageToken = null;
  let totalFetched = 0;
  
  try {
    do {
      const params = {
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: Math.min(50, maxItems - totalFetched)
      };
      
      if (nextPageToken) {
        params.pageToken = nextPageToken;
      }
      
      const data = await youtubeRequest('playlistItems', params);
      
      if (data.items) {
        videos.push(...data.items);
        totalFetched += data.items.length;
      }
      
      nextPageToken = data.nextPageToken;
      
    } while (nextPageToken && totalFetched < maxItems);
    
    console.log(`✅ Retrieved ${videos.length} videos from playlist`);
    return videos;
  } catch (error) {
    console.error('❌ Error getting playlist videos:', error);
    return [];
  }
}

// Helper function to get detailed video information
async function getVideoDetails(videoIds) {
  if (!videoIds.length) return [];
  
  console.log(`📊 Getting details for ${videoIds.length} videos`);
  
  const allVideos = [];
  
  // Process in batches of 50
  for (let i = 0; i < videoIds.length; i += 50) {
    const batch = videoIds.slice(i, i + 50);
    
    try {
      const data = await youtubeRequest('videos', {
        part: 'snippet,contentDetails,statistics',
        id: batch.join(',')
      });
      
      if (data.items) {
        allVideos.push(...data.items);
      }
    } catch (error) {
      console.error(`❌ Error getting video details for batch ${i / 50 + 1}:`, error);
    }
  }
  
  console.log(`✅ Retrieved details for ${allVideos.length} videos`);
  return allVideos;
}

// Helper function to filter and score videos
function filterAndScoreVideos(videos, channelId, decade, genre) {
  console.log(`🔍 Filtering ${videos.length} videos`);
  
  const filtered = [];
  
  for (const video of videos) {
    const snippet = video.snippet;
    const contentDetails = video.contentDetails;
    const statistics = video.statistics;
    
    // Must be from the official channel
    if (snippet.channelId !== channelId) continue;
    
    // Must be Music category (categoryId = 10)
    if (snippet.categoryId !== '10') continue;
    
    // Must be music content
    if (!isMusicContent(snippet.title, snippet.description)) continue;
    
    // Must be reasonable duration (30 seconds to 10 minutes)
    const duration = parseDuration(contentDetails.duration);
    if (duration < 30 || duration > 600) continue;
    
    // Skip if video is unavailable
    if (snippet.title.toLowerCase().includes('deleted') || 
        snippet.title.toLowerCase().includes('private')) continue;
    
    const publishYear = new Date(snippet.publishedAt).getFullYear();
    const viewCount = parseInt(statistics?.viewCount || '0');
    
    let score = 0;
    
    // Decade match bonus
    if (decade && publishYear >= decade.startYear && publishYear <= decade.endYear) {
      score += 1000;
    }
    
    // Music category bonus (already filtered above)
    score += 500;
    
    // View count bonus (logarithmic)
    score += Math.log10(viewCount + 1) * 10;
    
    // Recent bonus (within last 5 years)
    const currentYear = new Date().getFullYear();
    if (currentYear - publishYear <= 5) {
      score += 50;
    }
    
    // Genre match bonus (soft signal)
    if (genre) {
      const titleLower = snippet.title.toLowerCase();
      const genreLower = genre.toLowerCase();
      if (titleLower.includes(genreLower)) {
        score += 100;
      }
    }
    
    filtered.push({
      video,
      score,
      publishYear,
      inDecade: decade ? (publishYear >= decade.startYear && publishYear <= decade.endYear) : true
    });
  }
  
  // Sort by score (highest first)
  filtered.sort((a, b) => b.score - a.score);
  
  console.log(`✅ Filtered to ${filtered.length} quality music videos`);
  return filtered;
}

// Helper function to search for general music videos (when no artist specified)
async function searchGeneralMusic(genre, decade, count) {
  console.log(`🔍 Searching for general music: ${genre} ${decade ? `${decade.startYear}-${decade.endYear}` : ''}`);
  
  try {
    let query = 'official music';
    if (genre) query = `${genre} ${query}`;
    if (decade) {
      const decadeStr = `${decade.startYear}s`;
      query = `${query} ${decadeStr}`;
    }
    
    const searchData = await youtubeRequest('search', {
      part: 'snippet',
      type: 'video',
      q: query,
      videoCategoryId: '10',
      maxResults: Math.min(50, count * 3) // Get more to filter
    });
    
    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }
    
    // Get video details
    const videoIds = searchData.items.map(item => item.id.videoId);
    const videos = await getVideoDetails(videoIds);
    
    // Filter and score
    const filtered = [];
    
    for (const video of videos) {
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      
      // Must be music content
      if (!isMusicContent(snippet.title, snippet.description)) continue;
      
      // Must be reasonable duration
      const duration = parseDuration(contentDetails.duration);
      if (duration < 30 || duration > 600) continue;
      
      const publishYear = new Date(snippet.publishedAt).getFullYear();
      const viewCount = parseInt(video.statistics?.viewCount || '0');
      
      let score = 0;
      
      // Decade match bonus
      if (decade && publishYear >= decade.startYear && publishYear <= decade.endYear) {
        score += 1000;
      }
      
      // View count bonus
      score += Math.log10(viewCount + 1) * 10;
      
      // Official channel indicators
      const channelTitle = snippet.channelTitle.toLowerCase();
      if (channelTitle.includes('vevo') || channelTitle.includes('official') || channelTitle.includes('- topic')) {
        score += 200;
      }
      
      filtered.push({
        video,
        score,
        publishYear,
        inDecade: decade ? (publishYear >= decade.startYear && publishYear <= decade.endYear) : true
      });
    }
    
    // Sort by score
    filtered.sort((a, b) => b.score - a.score);
    
    console.log(`✅ Found ${filtered.length} general music videos`);
    return filtered.slice(0, count);
    
  } catch (error) {
    console.error('❌ Error searching general music:', error);
    return [];
  }
}

// Main endpoint for official songs
app.get('/api/music', async (req, res) => {
  try {
    const { artist, genre, startYear, endYear, count = 5 } = req.query;
    
    console.log(`🎵 Music Request:`, { artist, genre, startYear, endYear, count });
    
    const requestedCount = parseInt(count);
    let decade = null;
    
    if (startYear && endYear) {
      decade = {
        startYear: parseInt(startYear),
        endYear: parseInt(endYear)
      };
    }
    
    let results = [];
    let message = '';
    
    if (artist) {
      // Artist-specific search
      console.log(`👤 Searching for artist: ${artist}`);
      
      const channels = await findOfficialChannels(artist);
      
      if (channels.length === 0) {
        return res.json({
          results: [],
          message: `No official channels found for "${artist}". Please check the artist name.`
        });
      }
      
      // Try each channel until we get enough results
      for (const channel of channels) {
        console.log(`🎬 Checking channel: ${channel.title} (${channel.type})`);
        
        if (!channel.uploadsPlaylistId) {
          console.log('❌ No uploads playlist found');
          continue;
        }
        
        // Get videos from uploads playlist
        const playlistVideos = await getPlaylistVideos(channel.uploadsPlaylistId, 200);
        
        if (playlistVideos.length === 0) {
          console.log('❌ No videos in playlist');
          continue;
        }
        
        // Get video details
        const videoIds = playlistVideos.map(item => item.snippet.resourceId.videoId);
        const videos = await getVideoDetails(videoIds);
        
        // Filter and score videos
        const filtered = filterAndScoreVideos(videos, channel.channelId, decade, genre);
        
        if (filtered.length === 0) {
          console.log('❌ No valid music videos after filtering');
          continue;
        }
        
        // Separate decade matches from others
        const decadeMatches = filtered.filter(f => f.inDecade);
        const otherVideos = filtered.filter(f => !f.inDecade);
        
        console.log(`📅 ${decadeMatches.length} videos match decade, ${otherVideos.length} other videos`);
        
        // Build results
        if (decadeMatches.length >= requestedCount) {
          // Enough decade matches
          results = decadeMatches.slice(0, requestedCount);
        } else if (decadeMatches.length > 0) {
          // Some decade matches, supplement with latest
          const needed = requestedCount - decadeMatches.length;
          results = [...decadeMatches, ...otherVideos.slice(0, needed)];
          message = `Only ${decadeMatches.length} official songs found from that decade.`;
        } else if (otherVideos.length >= requestedCount) {
          // No decade matches, use latest
          results = otherVideos.slice(0, requestedCount);
          message = `No official songs found from that decade; showing latest official uploads instead.`;
        } else {
          // Not enough videos total
          results = otherVideos;
          message = `Only ${results.length} official songs found for this artist.`;
        }
        
        if (results.length > 0) {
          console.log(`✅ Found ${results.length} results from ${channel.title}`);
          break;
        }
      }
      
    } else {
      // General music search
      console.log(`🎵 Searching for general music`);
      const filtered = await searchGeneralMusic(genre, decade, requestedCount);
      results = filtered;
      
      if (results.length < requestedCount) {
        message = `Only ${results.length} official songs found matching your criteria.`;
      }
    }
    
    // Format results
    const formattedResults = results.map(result => {
      const video = result.video;
      const snippet = video.snippet;
      
      return {
        title: snippet.title.replace(/\s*\(Official.*?\)/gi, '').replace(/\s*\[Official.*?\]/gi, '').trim(),
        artist: snippet.channelTitle,
        year: new Date(snippet.publishedAt).getFullYear().toString(),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        sourceChannelId: snippet.channelId,
        official: true
      };
    });
    
    console.log(`🎉 Returning ${formattedResults.length} official songs`);
    
    res.json({
      results: formattedResults,
      message: message || `Found ${formattedResults.length} official songs.`
    });
    
  } catch (error) {
    console.error('❌ Server Error:', error);
    res.status(500).json({
      results: [],
      message: `Server error: ${error.message}`
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    youtubeApiConfigured: !!YOUTUBE_API_KEY
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 YouTube Recommendation Server running on port ${PORT}`);
  console.log(`🔑 YouTube API Key configured: ${!!YOUTUBE_API_KEY}`);
  console.log(`📡 Endpoints:`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/youtube/official-songs?artist=Drake&genre=hip-hop&startYear=2020&endYear=2024&count=10`);
});

module.exports = app;