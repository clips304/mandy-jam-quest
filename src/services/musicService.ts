import { Song } from '../types/game';

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

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

// Build search query for YouTube
function buildSearchQuery(genre: string, decade: string, artist?: string): string {
  const decadeKeywords = getDecadeKeywords(decade);
  
  if (artist) {
    return `${artist} ${genre} ${decadeKeywords} official music video OR audio`;
  } else {
    return `${genre} ${decadeKeywords} best songs OR classics OR hits`;
  }
}

// Fetch from YouTube API (client-side - for demo purposes)
async function fetchYouTube(query: string): Promise<any[]> {
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '10', // Music category
    maxResults: '5',
    key: YOUTUBE_API_KEY
  });

  const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
  
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

// Parse YouTube results to Song format
function parseYouTubeResults(results: any[], originalArtist?: string): Song | null {
  for (const item of results) {
    const snippet = item.snippet;
    const title = snippet.title;
    const channelTitle = snippet.channelTitle;
    
    // Prefer official or verified channels
    const isOfficial = title.toLowerCase().includes('official') ||
                      channelTitle.toLowerCase().includes('official') ||
                      (originalArtist && channelTitle.toLowerCase().includes(originalArtist.toLowerCase()));
    
    if (isOfficial || results.indexOf(item) === 0) { // Take first result if no official found
      return {
        title: title,
        artist: originalArtist || channelTitle,
        decade: '', // Will be set by caller
        url: `https://youtube.com/watch?v=${item.id.videoId}`,
        thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || ''
      };
    }
  }
  
  return null;
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

// Main recommendation function
export async function getRecommendation(genre: string, decade: string, artist?: string): Promise<Song> {
  try {
    // Build search query
    const query = buildSearchQuery(genre, decade, artist);
    
    // Try YouTube API first
    try {
      const results = await fetchYouTube(query);
      const song = parseYouTubeResults(results, artist);
      
      if (song) {
        song.decade = decade;
        return song;
      }
    } catch (apiError) {
      console.warn('YouTube API failed, using fallback:', apiError);
    }
    
    // Fallback to curated library
    return getFallbackSong(genre, decade, artist);
    
  } catch (error) {
    console.error('Error getting recommendation:', error);
    // Ultimate fallback
    return getFallbackSong(genre, decade, artist);
  }
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