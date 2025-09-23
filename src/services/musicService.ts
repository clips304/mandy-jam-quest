import { Song } from '../types/game';

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';

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
        url: 'https://youtube.com/watch?v=3JWTaaS7LdU',
        thumbnail: ''
      },
      {
        title: 'No Scrubs',
        artist: 'TLC',
        decade: '1990–2000',
        url: 'https://youtube.com/watch?v=FrLequ6dUdM',
        thumbnail: ''
      }
    ],
    '2000–2010': [
      {
        title: 'Crazy in Love',
        artist: 'Beyoncé',
        decade: '2000–2010',
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
        url: 'https://youtube.com/watch?v=_JZom_gVfuw',
        thumbnail: ''
      }
    ],
    '2000–2010': [
      {
        title: 'In Da Club',
        artist: '50 Cent',
        decade: '2000–2010',
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
        url: 'https://youtube.com/watch?v=fJ9rUzIMcZQ',
        thumbnail: ''
      }
    ],
    '1980–1990': [
      {
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        decade: '1980–1990',
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
        url: 'https://youtube.com/watch?v=Zi_XLOBDo_Y',
        thumbnail: ''
      }
    ],
    '2000–2010': [
      {
        title: 'Hips Don\'t Lie',
        artist: 'Shakira',
        decade: '2000–2010',
        url: 'https://youtube.com/watch?v=DUT5rEU6pqM',
        thumbnail: ''
      }
    ]
  }
};

// Convert decade range to search keywords
function getDecadeKeywords(decade: string): string {
  const decadeMap: Record<string, string> = {
    '1950–1960': '1950s',
    '1960–1970': '1960s',
    '1970–1980': '1970s',
    '1980–1990': '1980s',
    '1990–2000': '1990s',
    '2000–2010': '2000s',
    '2010–2020': '2010s',
    '2020–Present': '2020s'
  };
  return decadeMap[decade] || decade;
}

// Build search queries for YouTube (multiple strategies for better results)
function buildSearchQueries(genre: string, decade: string, artist?: string): string[] {
  const decadeKeywords = getDecadeKeywords(decade);
  const queries: string[] = [];
  
  if (artist) {
    queries.push(`${artist} ${genre} ${decadeKeywords} official music video`);
    queries.push(`${artist} best songs ${decadeKeywords} official`);
    queries.push(`${artist} ${genre} hits official audio`);
  } else {
    queries.push(`best ${genre} songs ${decadeKeywords} official music video`);
    queries.push(`top ${genre} hits ${decadeKeywords} billboard chart`);
    queries.push(`${genre} classics ${decadeKeywords} greatest hits official`);
    queries.push(`popular ${genre} songs ${decadeKeywords} most viewed`);
  }
  
  return queries;
}

// Fetch from YouTube API with enhanced search
async function fetchYouTube(query: string): Promise<any[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10', // Music category
    maxResults: '10', // Get more results for better filtering
    order: 'relevance', // Order by relevance for quality
    key: YOUTUBE_API_KEY
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Fetch video details to get view counts and better ranking
async function fetchVideoDetails(videoIds: string[]): Promise<any[]> {
  if (!YOUTUBE_API_KEY || videoIds.length === 0) {
    return [];
  }

  const params = new URLSearchParams({
    part: 'statistics,contentDetails',
    id: videoIds.join(','),
    key: YOUTUBE_API_KEY
  });

  try {
    const response = await fetch(`${YOUTUBE_VIDEOS_URL}?${params}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.warn('Failed to fetch video details:', error);
    return [];
  }
}

// Parse YouTube results to Song format with quality filtering
async function parseYouTubeResults(results: any[], originalArtist?: string): Promise<Song | null> {
  if (results.length === 0) return null;
  
  // Filter and score results
  const candidates = results
    .filter(item => {
      const title = item.snippet.title.toLowerCase();
      const channelTitle = item.snippet.channelTitle.toLowerCase();
      const videoId = item.id.videoId;
      
      // Skip if already recommended
      if (recommendedSongs.has(videoId)) return false;
      
      // Skip obvious non-music content
      const skipTerms = ['tutorial', 'how to', 'reaction', 'review', 'cover version', 'karaoke', 'instrumental only'];
      if (skipTerms.some(term => title.includes(term))) return false;
      
      // Skip very short videos (likely clips) and very long ones (likely not single songs)
      const duration = item.snippet.duration;
      if (duration && (duration < 60 || duration > 600)) return false;
      
      return true;
    })
    .map(item => {
      const snippet = item.snippet;
      const title = snippet.title.toLowerCase();
      const channelTitle = snippet.channelTitle.toLowerCase();
      
      let score = 0;
      
      // Boost official content
      if (title.includes('official') || channelTitle.includes('official')) score += 100;
      if (title.includes('music video')) score += 50;
      if (title.includes('audio')) score += 30;
      
      // Boost verified/known music channels
      const musicChannels = ['vevo', 'records', 'music', 'entertainment'];
      if (musicChannels.some(term => channelTitle.includes(term))) score += 40;
      
      // Boost if artist matches
      if (originalArtist && channelTitle.includes(originalArtist.toLowerCase())) score += 80;
      
      // Boost based on title quality indicators
      if (title.includes('hd') || title.includes('4k')) score += 10;
      if (title.includes('remastered')) score += 20;
      
      return { item, score };
    })
    .sort((a, b) => b.score - a.score);
  
  if (candidates.length === 0) return null;
  
  // Get video details for top candidates to check view counts
  const topCandidates = candidates.slice(0, 5);
  const videoIds = topCandidates.map(c => c.item.id.videoId);
  const videoDetails = await fetchVideoDetails(videoIds);
  
  // Find best match considering both our scoring and view counts
  let bestCandidate = topCandidates[0];
  
  if (videoDetails.length > 0) {
    const candidatesWithViews = topCandidates.map(candidate => {
      const details = videoDetails.find(v => v.id === candidate.item.id.videoId);
      const viewCount = details?.statistics?.viewCount ? parseInt(details.statistics.viewCount) : 0;
      return { ...candidate, viewCount };
    });
    
    // Prefer high-scoring candidates with good view counts
    bestCandidate = candidatesWithViews.reduce((best, current) => {
      const bestViewScore = best.score + Math.log10(best.viewCount + 1) * 10;
      const currentViewScore = current.score + Math.log10(current.viewCount + 1) * 10;
      return currentViewScore > bestViewScore ? current : best;
    });
  }
  
  const item = bestCandidate.item;
  const snippet = item.snippet;
  
  // Mark as recommended to prevent repeats
  recommendedSongs.add(item.id.videoId);
  
  return {
    title: snippet.title,
    artist: originalArtist || snippet.channelTitle,
    decade: '', // Will be set by caller
    url: `https://youtube.com/watch?v=${item.id.videoId}`,
    thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || ''
  };
}

// Get fallback song from curated library
function getFallbackSong(genre: string, decade: string, artist?: string): Song {
  const genreSongs = curatedLibrary[genre];
  
  if (genreSongs && genreSongs[decade] && genreSongs[decade].length > 0) {
    const songs = genreSongs[decade];
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    return { ...randomSong };
  }
  
  // Ultimate fallback - create a custom pick
  return {
    title: artist ? `Custom Pick by ${artist}` : `${genre} Classic`,
    artist: artist || 'Various Artists',
    decade: decade,
    url: 'https://youtube.com',
    thumbnail: '',
    isCustomPick: !!artist
  };
}

// Main recommendation function with enhanced search strategies
export async function getRecommendation(genre: string, decade: string, artist?: string): Promise<Song> {
  try {
    // Get multiple search strategies
    const queries = buildSearchQueries(genre, decade, artist);
    
    // Try each search strategy until we find a good song
    for (const query of queries) {
      try {
        const results = await fetchYouTube(query);
        const song = await parseYouTubeResults(results, artist);
        
        if (song) {
          song.decade = decade;
          console.log(`Found recommendation via query: "${query}"`);
          return song;
        }
      } catch (apiError) {
        console.warn(`Search strategy failed for query "${query}":`, apiError);
        continue;
      }
    }
    
    console.warn('All YouTube search strategies failed, using fallback');
    
    // Fallback to curated library
    return getFallbackSong(genre, decade, artist);
    
  } catch (error) {
    console.error('Error getting recommendation:', error);
    // Ultimate fallback
    return getFallbackSong(genre, decade, artist);
  }
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