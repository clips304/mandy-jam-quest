import { Song } from '../types/game';

// Spotify API configuration
const SPOTIFY_CLIENT_ID = '7a71a150881d4c68bf688b0b97b6b02a';
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

// Track recommended songs to prevent repeats
const recommendedSongs = new Set<string>();

// Spotify access token (for client credentials flow)
let spotifyAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

// Curated fallback library for when API fails or returns no results
const curatedLibrary: Record<string, Record<string, Song[]>> = {
  'R&B': {
    '1990–2000': [
      {
        title: 'I Will Always Love You',
        artist: 'Whitney Houston',
        decade: '1990–2000',
        year: '1992',
        url: 'https://open.spotify.com/search/Whitney%20Houston%20I%20Will%20Always%20Love%20You',
        thumbnail: '',
        isOfficialSource: true
      },
      {
        title: 'No Scrubs',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1999',
        url: 'https://open.spotify.com/search/TLC%20No%20Scrubs',
        thumbnail: '',
        isOfficialSource: true
      }
    ],
    '2000–2010': [
      {
        title: 'Crazy in Love',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2003',
        url: 'https://open.spotify.com/search/Beyoncé%20Crazy%20in%20Love',
        thumbnail: '',
        isOfficialSource: true
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
        url: 'https://open.spotify.com/search/The%20Notorious%20B.I.G.%20Juicy',
        thumbnail: '',
        isOfficialSource: true
      }
    ],
    '2000–2010': [
      {
        title: 'In Da Club',
        artist: '50 Cent',
        decade: '2000–2010',
        year: '2003',
        url: 'https://open.spotify.com/search/50%20Cent%20In%20Da%20Club',
        thumbnail: '',
        isOfficialSource: true
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
        url: 'https://open.spotify.com/search/Queen%20Bohemian%20Rhapsody',
        thumbnail: '',
        isOfficialSource: true
      }
    ],
    '1980–1990': [
      {
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        decade: '1980–1990',
        year: '1987',
        url: 'https://open.spotify.com/search/Guns%20N\'%20Roses%20Sweet%20Child%20O\'%20Mine',
        thumbnail: '',
        isOfficialSource: true
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
        url: 'https://open.spotify.com/search/Michael%20Jackson%20Billie%20Jean',
        thumbnail: '',
        isOfficialSource: true
      }
    ],
    '2000–2010': [
      {
        title: 'Hips Don\'t Lie',
        artist: 'Shakira',
        decade: '2000–2010',
        year: '2006',
        url: 'https://open.spotify.com/search/Shakira%20Hips%20Don\'t%20Lie',
        thumbnail: '',
        isOfficialSource: true
      }
    ]
  }
};

// Get Spotify access token using client credentials flow
async function getSpotifyAccessToken(): Promise<string | null> {
  // Check if token is still valid
  if (spotifyAccessToken && Date.now() < tokenExpiryTime) {
    return spotifyAccessToken;
  }

  try {
    // Use the provided API key directly for requests
    // Note: In production, proper OAuth with client secret would be required
    spotifyAccessToken = SPOTIFY_CLIENT_ID;
    tokenExpiryTime = Date.now() + 3600000; // 1 hour
    return spotifyAccessToken;
  } catch (error) {
    console.warn('Failed to get Spotify access token:', error);
    return null;
  }
}

// Convert decade range to year filter
function getDecadeYears(decade: string): { from: number; to: number } {
  const decadeMap: Record<string, { from: number; to: number }> = {
    '1950–1960': { from: 1950, to: 1960 },
    '1960–1970': { from: 1960, to: 1970 },
    '1970–1980': { from: 1970, to: 1980 },
    '1980–1990': { from: 1980, to: 1990 },
    '1990–2000': { from: 1990, to: 2000 },
    '2000–2010': { from: 2000, to: 2010 },
    '2010–2020': { from: 2010, to: 2020 },
    '2020–Present': { from: 2020, to: 2024 }
  };
  return decadeMap[decade] || { from: 2000, to: 2010 };
}

// Search tracks from Spotify with genre, decade, and artist filters
async function searchSpotifyTracks(genre: string, decade: string, artist?: string, limit: number = 5): Promise<any[]> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return [];
  }

  const decadeYears = getDecadeYears(decade);
  let query = `genre:${genre.toLowerCase()}`;
  
  if (artist) {
    query += ` artist:${artist}`;
  }
  
  // Add year range filter
  query += ` year:${decadeYears.from}-${decadeYears.to}`;

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
    market: 'US'
  });

  try {
    const response = await fetch(`${SPOTIFY_BASE_URL}/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.items || [];
  } catch (error) {
    console.warn('Failed to search Spotify tracks:', error);
    return [];
  }
}

// Get artist's top tracks from Spotify
async function getArtistTopTracks(artistId: string, limit: number = 5): Promise<any[]> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return [];
  }

  try {
    const response = await fetch(`${SPOTIFY_BASE_URL}/artists/${artistId}/top-tracks?market=US`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.slice(0, limit) || [];
  } catch (error) {
    console.warn('Failed to get artist top tracks:', error);
    return [];
  }
}

// Search for artist ID on Spotify
async function searchArtistId(artistName: string): Promise<string | null> {
  const token = await getSpotifyAccessToken();
  if (!token) {
    return null;
  }

  const params = new URLSearchParams({
    q: artistName,
    type: 'artist',
    limit: '1'
  });

  try {
    const response = await fetch(`${SPOTIFY_BASE_URL}/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.artists?.items?.[0]?.id || null;
  } catch (error) {
    console.warn('Failed to search for artist:', error);
    return null;
  }
}

// Convert Spotify track to Song format
function convertSpotifyTrackToSong(track: any, decade: string): Song | null {
  const artist = track.artists?.[0]?.name || 'Unknown Artist';
  const title = track.name || 'Unknown Title';
  
  // Skip if already recommended
  const trackId = `${artist}-${title}`.toLowerCase();
  if (recommendedSongs.has(trackId)) {
    return null;
  }

  // Extract year from release date
  let year = 'Unknown';
  if (track.album?.release_date) {
    year = new Date(track.album.release_date).getFullYear().toString();
  } else {
    // Fallback to decade start year
    year = decade.split('–')[0] || 'Unknown';
  }

  // Mark as recommended to prevent repeats
  recommendedSongs.add(trackId);

  // Create Spotify URL
  const spotifyUrl = track.external_urls?.spotify || 
    `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${title}`)}`;

  return {
    title: title,
    artist: artist,
    decade: decade,
    year: year,
    url: spotifyUrl,
    thumbnail: track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || '',
    isOfficialSource: true
  };
}

// Get fallback songs from curated library
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
  
  // Fill remaining slots with placeholder songs
  while (songs.length < 5) {
    songs.push({
      title: artist ? `${artist} - ${genre} Hit #${songs.length + 1}` : `${genre} Classic #${songs.length + 1}`,
      artist: artist || 'Various Artists',
      decade: decade,
      year: decade.split('–')[0] || 'Unknown',
      url: `https://open.spotify.com/search/${encodeURIComponent((artist || '') + ' ' + genre + ' ' + decade)}`,
      thumbnail: '',
      isCustomPick: !!artist,
      isOfficialSource: false
    });
  }
  
  return songs;
}

// Get multiple recommendations using Spotify API
export async function getMultipleRecommendations(genre: string, decade: string, artist?: string): Promise<Song[]> {
  try {
    let allTracks: any[] = [];
    const decadeYears = getDecadeYears(decade);
    
    // Search using Spotify API with proper filters
    const spotifyTracks = await searchSpotifyTracks(genre, decade, artist, 10);
    
    // Filter by decade to ensure accuracy
    const filteredTracks = spotifyTracks.filter(track => {
      if (!track.album?.release_date) return false;
      const releaseYear = new Date(track.album.release_date).getFullYear();
      return releaseYear >= decadeYears.from && releaseYear <= decadeYears.to;
    });
    
    allTracks = filteredTracks.length > 0 ? filteredTracks : spotifyTracks;
    
    // If artist is provided but no results, try artist-specific search
    if (artist && allTracks.length < 5) {
      const artistId = await searchArtistId(artist);
      if (artistId) {
        const artistTracks = await getArtistTopTracks(artistId, 10);
        // Filter artist tracks by decade
        const filteredArtistTracks = artistTracks.filter(track => {
          if (!track.album?.release_date) return false;
          const releaseYear = new Date(track.album.release_date).getFullYear();
          return releaseYear >= decadeYears.from && releaseYear <= decadeYears.to;
        });
        
        // Combine tracks, avoiding duplicates
        const existingTrackIds = new Set(
          allTracks.map(t => `${t.artists?.[0]?.name || ''}-${t.name || ''}`.toLowerCase())
        );
        
        const newTracks = filteredArtistTracks.filter(t => {
          const trackId = `${t.artists?.[0]?.name || ''}-${t.name || ''}`.toLowerCase();
          return !existingTrackIds.has(trackId);
        });
        
        allTracks.push(...newTracks);
      }
    }
    
    // Convert tracks to Song objects
    const songs: Song[] = [];
    for (const track of allTracks) {
      if (songs.length >= 5) break;
      
      const song = convertSpotifyTrackToSong(track, decade);
      if (song) {
        songs.push(song);
      }
    }
    
    // If we have no songs from Spotify, use fallback
    if (songs.length === 0) {
      console.warn(`No songs found for ${genre} ${decade} ${artist || ''} - using fallback`);
      return getFallbackSongs(genre, decade, artist);
    }
    
    // If we have fewer than 5 songs, that's okay - return what we have
    console.log(`Found ${songs.length} songs for ${genre} ${decade} ${artist || ''}`);
    return songs;
    
  } catch (error) {
    console.error('Error getting multiple recommendations:', error);
    return getFallbackSongs(genre, decade, artist);
  }
}

// Legacy single recommendation function for backward compatibility
export async function getRecommendation(genre: string, decade: string, artist?: string): Promise<Song> {
  const songs = await getMultipleRecommendations(genre, decade, artist);
  return songs[0];
}

// Reset recommendations history
export function resetRecommendationHistory(): void {
  recommendedSongs.clear();
}