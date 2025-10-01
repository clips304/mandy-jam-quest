import { Song } from '../types/game.ts';
import { parseDecade } from './youtubeApiService.ts';
import { supabase } from '@/integrations/supabase/client';

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
    const params: Record<string, string> = {
      startYear: startYear.toString(),
      endYear: endYear.toString(),
      count: count.toString(),
    };

    if (artist) {
      params.artist = artist;
    }

    console.log('🎵 Calling music edge function with params:', params);

    const { data, error } = await supabase.functions.invoke('music', {
      body: params
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Edge function error: ${error.message}`);
    }

    const apiResponse: MusicAPIResponse = data;

    if (apiResponse.isFallback) {
      console.warn('⚠️ Received fallback response:', apiResponse.message);
    }

    return apiResponse;

  } catch (error) {
    console.error('❌ Could not connect to backend:', error);

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
      message: "Could not connect to the backend"
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

    const songs: Song[] = response.songs.map(song => ({
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
      } as Song;
    }

    return songs;

  } catch (error) {
    console.error('Error fetching multiple recommendations:', error);

    return [{
      title: "⚠️ Could not connect to the backend. Try again later.",
      artist: "System",
      genre,
      year: 2024,
      url: "https://music.youtube.com",
      isError: true
    }];
  }
}
