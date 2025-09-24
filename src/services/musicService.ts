import { Song } from '../types/game';

// Last.fm API configuration
const LASTFM_API_KEY = '6798ca439567684387458bd928ce643c';
const LASTFM_BASE_URL = 'http://ws.audioscrobbler.com/2.0/';

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
        thumbnail: '',
        isOfficialSource: true
      },
      {
        title: 'No Scrubs',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1999',
        url: 'https://youtube.com/watch?v=FrLequ6dUdM',
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
        url: 'https://youtube.com/watch?v=ViwtNLUqkMY',
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
        url: 'https://youtube.com/watch?v=_JZom_gVfuw',
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
        url: 'https://youtube.com/watch?v=5qm8PH4xAss',
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
        url: 'https://youtube.com/watch?v=fJ9rUzIMcZQ',
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
        url: 'https://youtube.com/watch?v=1w7OgIMMRc4',
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
        url: 'https://youtube.com/watch?v=Zi_XLOBDo_Y',
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
        url: 'https://youtube.com/watch?v=DUT5rEU6pqM',
        thumbnail: '',
        isOfficialSource: true
      }
    ]
  }
};

// Convert decade range to Last.fm compatible format
function getDecadeYears(decade: string): { from: string; to: string } {
  const decadeMap: Record<string, { from: string; to: string }> = {
    '1950–1960': { from: '1950', to: '1960' },
    '1960–1970': { from: '1960', to: '1970' },
    '1970–1980': { from: '1970', to: '1980' },
    '1980–1990': { from: '1980', to: '1990' },
    '1990–2000': { from: '1990', to: '2000' },
    '2000–2010': { from: '2000', to: '2010' },
    '2010–2020': { from: '2010', to: '2020' },
    '2020–Present': { from: '2020', to: '2024' }
  };
  return decadeMap[decade] || { from: '2000', to: '2010' };
}

// Fetch artist's top tracks from Last.fm
async function fetchArtistTopTracks(artist: string, limit: number = 10): Promise<any[]> {
  const params = new URLSearchParams({
    method: 'artist.gettoptracks',
    artist: artist,
    api_key: LASTFM_API_KEY,
    format: 'json',
    limit: limit.toString()
  });

  try {
    const response = await fetch(`${LASTFM_BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data = await response.json();
    return data.toptracks?.track || [];
  } catch (error) {
    console.warn('Failed to fetch artist top tracks:', error);
    return [];
  }
}

// Fetch tracks by genre tag from Last.fm
async function fetchTracksByTag(tag: string, limit: number = 10): Promise<any[]> {
  const params = new URLSearchParams({
    method: 'tag.gettoptracks',
    tag: tag.toLowerCase(),
    api_key: LASTFM_API_KEY,
    format: 'json',
    limit: limit.toString()
  });

  try {
    const response = await fetch(`${LASTFM_BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tracks?.track || [];
  } catch (error) {
    console.warn('Failed to fetch tracks by tag:', error);
    return [];
  }
}

// Search for tracks from Last.fm
async function searchTracks(query: string, limit: number = 10): Promise<any[]> {
  const params = new URLSearchParams({
    method: 'track.search',
    track: query,
    api_key: LASTFM_API_KEY,
    format: 'json',
    limit: limit.toString()
  });

  try {
    const response = await fetch(`${LASTFM_BASE_URL}?${params}`);
    if (!response.ok) {
      throw new Error(`Last.fm API error: ${response.status}`);
    }

    const data = await response.json();
    return data.results?.trackmatches?.track || [];
  } catch (error) {
    console.warn('Failed to search tracks:', error);
    return [];
  }
}

// Get track info including year from Last.fm
async function getTrackInfo(artist: string, track: string): Promise<any> {
  const params = new URLSearchParams({
    method: 'track.getinfo',
    artist: artist,
    track: track,
    api_key: LASTFM_API_KEY,
    format: 'json'
  });

  try {
    const response = await fetch(`${LASTFM_BASE_URL}?${params}`);
    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.track || null;
  } catch (error) {
    console.warn('Failed to get track info:', error);
    return null;
  }
}

// Convert Last.fm track to Song format
async function convertToSong(track: any, decade: string): Promise<Song | null> {
  const artist = typeof track.artist === 'string' ? track.artist : track.artist?.name || 'Unknown Artist';
  const title = track.name || 'Unknown Title';
  
  // Skip if already recommended
  const trackId = `${artist}-${title}`.toLowerCase();
  if (recommendedSongs.has(trackId)) {
    return null;
  }

  // Get additional track info for more details
  const trackInfo = await getTrackInfo(artist, title);
  
  // Extract year from album or wiki
  let year = 'Unknown';
  if (trackInfo?.album?.releasedate) {
    year = trackInfo.album.releasedate.split(',')[0] || 'Unknown';
  } else if (trackInfo?.wiki?.published) {
    year = new Date(trackInfo.wiki.published).getFullYear().toString();
  } else {
    // Fallback to decade start year
    year = decade.split('–')[0] || 'Unknown';
  }

  // Mark as recommended to prevent repeats
  recommendedSongs.add(trackId);

  // Create YouTube search URL (since Last.fm doesn't provide direct playback)
  const searchQuery = encodeURIComponent(`${artist} ${title} official music video`);
  const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;

  return {
    title: title,
    artist: artist,
    decade: decade,
    year: year,
    url: youtubeUrl,
    thumbnail: track.image?.[3]?.['#text'] || track.image?.[2]?.['#text'] || '',
    isOfficialSource: true // Last.fm provides official track data
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
      url: `https://www.youtube.com/results?search_query=${encodeURIComponent(genre + ' ' + decade)}`,
      thumbnail: '',
      isCustomPick: !!artist,
      isOfficialSource: false
    });
  }
  
  return songs;
}

// Get multiple recommendations using Last.fm API
export async function getMultipleRecommendations(genre: string, decade: string, artist?: string): Promise<Song[]> {
  try {
    let allTracks: any[] = [];
    
    // If artist is provided, get their top tracks
    if (artist) {
      const artistTracks = await fetchArtistTopTracks(artist, 15);
      allTracks = artistTracks;
      console.log(`Found ${allTracks.length} tracks for ${artist}`);
    }
    
    // If we need more tracks or no artist provided, search by genre
    if (allTracks.length < 10) {
      const genreTracks = await fetchTracksByTag(genre, 15);
      // Combine tracks, avoiding duplicates
      const existingTrackIds = new Set(
        allTracks.map(t => `${(typeof t.artist === 'string' ? t.artist : t.artist?.name) || ''}-${t.name || ''}`.toLowerCase())
      );
      
      const newTracks = genreTracks.filter(t => {
        const trackId = `${(typeof t.artist === 'string' ? t.artist : t.artist?.name) || ''}-${t.name || ''}`.toLowerCase();
        return !existingTrackIds.has(trackId);
      });
      
      allTracks.push(...newTracks);
    }
    
    // Convert tracks to Song objects
    const songs: Song[] = [];
    for (const track of allTracks) {
      if (songs.length >= 5) break;
      
      const song = await convertToSong(track, decade);
      if (song) {
        songs.push(song);
      }
    }
    
    // If we don't have enough songs, fill with fallbacks
    if (songs.length < 5) {
      const fallbackSongs = getFallbackSongs(genre, decade, artist);
      const needed = 5 - songs.length;
      songs.push(...fallbackSongs.slice(0, needed));
    }
    
    // Ensure exactly 5 songs
    return songs.slice(0, 5);
    
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