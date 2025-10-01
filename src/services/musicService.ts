import { Song } from '../types/game';
import { parseDecade } from './youtubeApiService';

const API_BASE_URL = 'http://localhost:3001';

export interface MusicPreferences {
  genres: string[];
  decades: string[];
  artist?: string;
}

interface MusicAPIResponse {
  songs: Array<{
    title: string;
    artist: string;
    year: number;
    url: string;
    thumbnail?: string;
  }>;
  isFallback?: boolean;
  message?: string;
}

async function fetchFromMusicAPI(
  artist: string | undefined,
  startYear: number,
  endYear: number,
  count: number = 5
): Promise<MusicAPIResponse> {
  try {
    const params = new URLSearchParams();

    if (artist) params.append('artist', artist);
    params.append('startYear', startYear.toString());
    params.append('endYear', endYear.toString());
    params.append('count', count.toString());

    const url = `${API_BASE_URL}/api/music?${params.toString()}`;
    console.log('🎵 Fetching from:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`);
    }

    const data: MusicAPIResponse = await response.json();

    if (data.isFallback) {
      console.warn('⚠️ Received fallback response:', data.message);
    }

    return data;

  } catch (error) {
    console.error('❌ Could not connect to music server:', error);

    return {
      songs: [
        {
          title: "Connection Error",
          artist: "System",
          year: 2024,
          url: "https://music.youtube.com",
          thumbnail: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=200"
        }
      ],
      isFallback: true,
      message: "Could not connect to the server"
    };
  }
}

export async function getRandomSong(preferences: MusicPreferences): Promise<Song | null> {
  try {
    const randomGenre = preferences.genres[Math.floor(Math.random() * preferences.genres.length)];
    const randomDecade = preferences.decades[Math.floor(Math.random() * preferences.decades.length)];

    const decadeRange = parseDecade(randomDecade);

    if (!decadeRange) {
      console.error('Invalid decade:', randomDecade);
      return null;
    }

    const response = await fetchFromMusicAPI(
      preferences.artist,
      decadeRange.startYear,
      decadeRange.endYear,
      5
    );

    if (response.songs.length === 0) {
      console.error('No songs found');
      return null;
    }

    const randomSong = response.songs[Math.floor(Math.random() * response.songs.length)];

    return {
      title: randomSong.title,
      artist: randomSong.artist,
      genre: randomGenre,
      year: randomSong.year,
      url: randomSong.url,
      thumbnail: randomSong.thumbnail,
      isFallback: response.isFallback
    };

  } catch (error) {
    console.error('Error fetching random song:', error);
    return null;
  }
}

export async function getMultipleRecommendations(
  genre: string,
  decade: string,
  artist?: string
): Promise<Song[]> {
  try {
    const decadeRange = parseDecade(decade);

    if (!decadeRange) {
      console.error('Invalid decade:', decade);
      return [];
    }

    const response = await fetchFromMusicAPI(
      artist,
      decadeRange.startYear,
      decadeRange.endYear,
      5
    );

    const songs = response.songs.map(song => ({
      title: song.title,
      artist: song.artist,
      genre,
      year: song.year,
      url: song.url,
      thumbnail: song.thumbnail,
      isFallback: response.isFallback
    }));

    if (response.isFallback && songs.length > 0) {
      songs[0] = {
        ...songs[0],
        title: response.message || "Showing fallback results",
        isError: true
      };
    }

    return songs;

  } catch (error) {
    console.error('Error fetching multiple recommendations:', error);

    return [{
      title: "⚠️ Could not connect to the server. Try again later.",
      artist: "System",
      genre,
      year: 2024,
      url: "https://music.youtube.com",
      isError: true
    }];
  }
}
