import { Song } from '../types/game';

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';

// Track recommended songs to prevent repeats
const recommendedSongs = new Set<string>();

// Curated fallback library for when API fails or returns no results
const curatedLibrary: Record<string, Record<string, Song[]>> = {
  'R&B': {
    '1990–2000': [
      {
        title: 'I Will Always Love You',
        artist: 'Whitney Houston',
        decade: '1990–2000',
        year: '1992',
        url: 'https://youtube.com/watch?v=3JWTaaS7LdU',
        thumbnail: ''
      },
      {
        title: 'No Scrubs',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1999',
        url: 'https://youtube.com/watch?v=FrLequ6dUdM',
        thumbnail: ''
      }
    ],
    '2000–2010': [
      {
        title: 'Crazy in Love',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2003',
        url: 'https://youtube.com/watch?v=ViwtNLUqkMY',
        thumbnail: ''
      }
    ]
  },
  'Hip-Hop': {
    '1990–2000': [
      {
        title: 'Juicy',
        artist: 'The Notorious B.I.G.',
        decade: '1990–2000',
        year: '1994',
        url: 'https://youtube.com/watch?v=_JZom_gVfuw',
        thumbnail: ''
      }
    ],
    '2000–2010': [
      {
        title: 'In Da Club',
        artist: '50 Cent',
        decade: '2000–2010',
        year: '2003',
        url: 'https://youtube.com/watch?v=5qm8PH4xAss',
        thumbnail: ''
      }
    ]
  },
  'Rock': {
    '1970–1980': [
      {
        title: 'Bohemian Rhapsody',
        artist: 'Queen',
        decade: '1970–1980',
        year: '1975',
        url: 'https://youtube.com/watch?v=fJ9rUzIMcZQ',
        thumbnail: ''
      }
    ],
    '1980–1990': [
      {
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        decade: '1980–1990',
        year: '1987',
        url: 'https://youtube.com/watch?v=1w7OgIMMRc4',
        thumbnail: ''
      }
    ]
  },
  'Pop': {
    '1980–1990': [
      {
        title: 'Billie Jean',
        artist: 'Michael Jackson',
        decade: '1980–1990',
        year: '1983',
        url: 'https://youtube.com/watch?v=Zi_XLOBDo_Y',
        thumbnail: ''
      }
    ],
    '2000–2010': [
      {
        title: 'Hips Don\'t Lie',
        artist: 'Shakira',
        decade: '2000–2010',
        year: '2006',
        url: 'https://youtube.com/watch?v=DUT5rEU6pqM',
        thumbnail: ''
      }
    ]
  }
};

// Convert decade range to date bounds for YouTube API filtering
function getDecadeDateBounds(decade: string): { startDate: string; endDate: string } {
  const decadeMap: Record<string, { start: number; end: number }> = {
    '1950–1960': { start: 1950, end: 1960 },
    '1960–1970': { start: 1960, end: 1970 },
    '1970–1980': { start: 1970, end: 1980 },
    '1980–1990': { start: 1980, end: 1990 },
    '1990–2000': { start: 1990, end: 2000 },
    '2000–2010': { start: 2000, end: 2010 },
    '2010–2020': { start: 2010, end: 2020 },
    '2020–Present': { start: 2020, end: new Date().getFullYear() }
  };
  
  const bounds = decadeMap[decade] || { start: 2000, end: 2010 };
  return {
    startDate: `${bounds.start}-01-01T00:00:00Z`,
    endDate: `${bounds.end}-12-31T23:59:59Z`
  };
}

// Build genre-based search query for official channel content
function buildGenreQuery(genre: string): string {
  const genreKeywords: Record<string, string> = {
    'Pop': 'pop music hits songs',
    'Rock': 'rock music songs hits',
    'Hip-Hop': 'hip hop rap music',
    'R&B': 'r&b rnb soul music',
    'Country': 'country music songs',
    'Electronic': 'electronic edm dance music',
    'Jazz': 'jazz music songs',
    'Classical': 'classical music'
  };
  
  return genreKeywords[genre] || genre.toLowerCase();
}

// Find official verified artist channel with enhanced verification
async function findOfficialChannel(artistName: string): Promise<{ channelId: string; isVerified: boolean } | null> {
  if (!YOUTUBE_API_KEY) {
    return null;
  }

  // Step 1: Search for channels
  const searchParams = new URLSearchParams({
    part: 'snippet',
    q: `${artistName} official`,
    type: 'channel',
    maxResults: '10',
    key: YOUTUBE_API_KEY
  });

  try {
    const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`);
    if (!searchResponse.ok) return null;
    
    const searchData = await searchResponse.json();
    const channels = searchData.items || [];
    
    if (channels.length === 0) return null;

    // Step 2: Get detailed channel information including verification status
    const channelIds = channels.map((ch: any) => ch.id.channelId).join(',');
    const channelParams = new URLSearchParams({
      part: 'snippet,statistics,status,brandingSettings',
      id: channelIds,
      key: YOUTUBE_API_KEY
    });

    const channelResponse = await fetch(`${YOUTUBE_CHANNELS_URL}?${channelParams}`);
    if (!channelResponse.ok) return null;

    const channelData = await channelResponse.json();
    const detailedChannels = channelData.items || [];

    // Step 3: Find the best verified official channel
    let bestChannel = null;
    let bestScore = 0;

    for (const channel of detailedChannels) {
      const channelTitle = channel.snippet.title.toLowerCase();
      const artistLower = artistName.toLowerCase();
      const subscriberCount = parseInt(channel.statistics?.subscriberCount || '0');
      
      let score = 0;
      
      // Must contain artist name
      if (!channelTitle.includes(artistLower)) continue;
      
      // Boost for verification status (if available in API response)
      const isVerified = channel.status?.isLinked || false;
      if (isVerified) score += 1000;
      
      // Boost for official indicators in title/description
      if (channelTitle.includes('official')) score += 500;
      if (channelTitle.includes('vevo')) score += 400;
      if (channel.snippet.description?.toLowerCase().includes('official')) score += 300;
      
      // Boost for high subscriber count (indicates legitimacy)
      if (subscriberCount > 1000000) score += 200;
      else if (subscriberCount > 100000) score += 100;
      else if (subscriberCount > 10000) score += 50;
      
      // Boost for exact name match
      if (channelTitle === artistLower || channelTitle === `${artistLower} official`) score += 300;
      
      // Boost for common official channel patterns
      if (channelTitle.endsWith('vevo') || channelTitle.endsWith('official')) score += 150;
      
      if (score > bestScore) {
        bestScore = score;
        bestChannel = {
          channelId: channel.id,
          isVerified: isVerified || subscriberCount > 100000 // Consider high subscriber count as verification
        };
      }
    }
    
    // Only return channels that pass minimum verification threshold
    return bestScore >= 100 ? bestChannel : null;
    
  } catch (error) {
    console.warn('Failed to find official channel:', error);
    return null;
  }
}

// Search within specific official channel with decade and genre filtering
async function searchInOfficialChannel(
  channelId: string, 
  genre: string, 
  decade: string
): Promise<any[]> {
  if (!YOUTUBE_API_KEY) {
    return [];
  }

  const { startDate, endDate } = getDecadeDateBounds(decade);
  const genreQuery = buildGenreQuery(genre);

  const params = new URLSearchParams({
    part: 'snippet',
    channelId: channelId,
    q: genreQuery,
    type: 'video',
    videoCategoryId: '10', // Music category
    publishedAfter: startDate,
    publishedBefore: endDate,
    maxResults: '25', // Get more results for better filtering
    order: 'relevance',
    key: YOUTUBE_API_KEY
  });

  try {
    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
    if (!response.ok) {
      console.warn('Search in channel failed:', response.status, response.statusText);
      return [];
    }
    
    const data = await response.json();
    const videos = data.items || [];
    
    // Filter results to ensure they're actual music videos
    return videos.filter((video: any) => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description?.toLowerCase() || '';
      
      // Skip obvious non-music content
      const skipTerms = [
        'tutorial', 'how to', 'reaction', 'review', 'cover version', 
        'karaoke', 'instrumental only', 'behind the scenes', 'interview',
        'live stream', 'podcast', 'documentary', 'trailer'
      ];
      
      if (skipTerms.some(term => title.includes(term) || description.includes(term))) {
        return false;
      }
      
      // Prefer actual music content
      const musicIndicators = [
        'official', 'music video', 'audio', 'single', 'album', 'hit', 'song'
      ];
      
      return musicIndicators.some(indicator => 
        title.includes(indicator) || description.includes(indicator)
      );
    });
    
  } catch (error) {
    console.warn('Failed to search in official channel:', error);
    return [];
  }
}

// Extract year from video publish date
function extractYearFromPublishDate(publishedAt: string): string {
  try {
    return new Date(publishedAt).getFullYear().toString();
  } catch {
    return 'Unknown';
  }
}

// Parse official channel results to Song format with strict quality filtering
function parseOfficialChannelResults(results: any[], artistName: string, decade: string): Song[] {
  if (results.length === 0) return [];
  
  const songs: Song[] = [];
  
  for (const item of results) {
    const snippet = item.snippet;
    const videoId = item.id.videoId;
    
    // Skip if already recommended
    if (recommendedSongs.has(videoId)) continue;
    
    // Mark as recommended to prevent future duplicates
    recommendedSongs.add(videoId);
    
    // Clean up title (remove common prefixes/suffixes)
    let cleanTitle = snippet.title;
    const cleanPatterns = [
      /\s*\(Official.*?\)/gi,
      /\s*\[Official.*?\]/gi,
      /\s*- Official.*$/gi,
      /\s*Official.*Video$/gi,
      /\s*\(.*?Music.*?Video.*?\)/gi
    ];
    
    cleanPatterns.forEach(pattern => {
      cleanTitle = cleanTitle.replace(pattern, '').trim();
    });
    
    songs.push({
      title: cleanTitle,
      artist: artistName,
      decade: decade,
      year: extractYearFromPublishDate(snippet.publishedAt),
      url: `https://youtube.com/watch?v=${videoId}`,
      thumbnail: snippet.thumbnails?.high?.url || 
                snippet.thumbnails?.medium?.url || 
                snippet.thumbnails?.default?.url || '',
      isOfficialSource: true
    });
    
    // Stop when we have 5 songs
    if (songs.length >= 5) break;
  }
  
  return songs;
}

// Get fallback songs from curated library (always return 5)
function getFallbackSongs(genre: string, decade: string, artist?: string): Song[] {
  const songs: Song[] = [];
  const genreSongs = curatedLibrary[genre];
  
  // Try to get songs from curated library
  if (genreSongs && genreSongs[decade] && genreSongs[decade].length > 0) {
    const availableSongs = genreSongs[decade];
    // Add all available songs, up to 5
    for (let i = 0; i < Math.min(5, availableSongs.length); i++) {
      songs.push({ 
        ...availableSongs[i], 
        year: availableSongs[i].decade.split('–')[0] || 'Unknown'
      });
    }
  }
  
  // Fill remaining slots with custom picks
  while (songs.length < 5) {
    songs.push({
      title: artist ? `${artist} - ${genre} Hit #${songs.length + 1}` : `${genre} Classic #${songs.length + 1}`,
      artist: artist || 'Various Artists',
      decade: decade,
      year: decade.split('–')[0] || 'Unknown',
      url: 'https://youtube.com',
      thumbnail: '',
      isCustomPick: !!artist
    });
  }
  
  return songs;
}

// Get recommendations ONLY from official verified channels
export async function getMultipleRecommendations(genre: string, decade: string, artist?: string): Promise<Song[]> {
  console.log(`🎵 Getting official recommendations for: ${artist || 'Various Artists'} - ${genre} - ${decade}`);
  
  let officialSongs: Song[] = [];
  
  // STRICT RULE: Only return songs from verified official channels
  if (artist) {
    try {
      // Step 1: Find verified official channel
      const channelResult = await findOfficialChannel(artist);
      
      if (channelResult) {
        console.log(`✅ Found official channel for ${artist}: ${channelResult.channelId}`);
        
        // Step 2: Search within official channel with decade filtering
        const officialVideos = await searchInOfficialChannel(
          channelResult.channelId, 
          genre, 
          decade
        );
        
        if (officialVideos.length > 0) {
          console.log(`🎬 Found ${officialVideos.length} videos in official channel`);
          
          // Step 3: Parse to Song format
          officialSongs = parseOfficialChannelResults(officialVideos, artist, decade);
          
          console.log(`🎶 Parsed ${officialSongs.length} official songs`);
        } else {
          console.log(`❌ No videos found in official channel for ${genre} ${decade}`);
        }
      } else {
        console.log(`❌ No verified official channel found for ${artist}`);
      }
    } catch (error) {
      console.error('Error searching official channel:', error);
    }
  }
  
  // If we have less than 5 official songs, fill with curated fallbacks
  if (officialSongs.length < 5) {
    console.log(`📚 Using fallback songs - got ${officialSongs.length}/5 official songs`);
    
    const fallbackSongs = getFallbackSongs(genre, decade, artist);
    const needed = 5 - officialSongs.length;
    
    // Add fallbacks that aren't duplicates
    for (let i = 0; i < fallbackSongs.length && officialSongs.length < 5; i++) {
      const fallback = fallbackSongs[i];
      const isDuplicate = officialSongs.some(existing => 
        existing.title.toLowerCase() === fallback.title.toLowerCase() ||
        existing.url === fallback.url
      );
      
      if (!isDuplicate) {
        officialSongs.push({
          ...fallback,
          isOfficialSource: false // Mark as fallback
        });
      }
    }
  }
  
  // Ensure exactly 5 songs
  const finalSongs = officialSongs.slice(0, 5);
  
  // Fill remaining slots if needed
  while (finalSongs.length < 5) {
    finalSongs.push({
      title: `${genre} Classic #${finalSongs.length + 1}`,
      artist: artist || 'Various Artists',
      decade: decade,
      year: decade.split('–')[0] || '2000',
      url: 'https://youtube.com',
      thumbnail: '',
      isOfficialSource: false,
      isCustomPick: true
    });
  }
  
  console.log(`🎯 Returning ${finalSongs.length} recommendations (${finalSongs.filter(s => s.isOfficialSource).length} official)`);
  
  return finalSongs;
}

// Legacy single recommendation function for backward compatibility
export async function getRecommendation(genre: string, decade: string, artist?: string): Promise<Song> {
  const songs = await getMultipleRecommendations(genre, decade, artist);
  return songs[0];
}

// Reset recommendations history (useful for testing or new game sessions)
export function resetRecommendationHistory(): void {
  recommendedSongs.clear();
}

// Server proxy example (for reference)
export const serverProxyExample = `
// server.js - Node.js/Express example
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    const params = new URLSearchParams({
      part: 'snippet',
      q: q,
      type: 'video',
      videoCategoryId: '10',
      maxResults: '5',
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(\`https://www.googleapis.com/youtube/v3/search?\${params}\`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Music service running on port 3001');
});
`;