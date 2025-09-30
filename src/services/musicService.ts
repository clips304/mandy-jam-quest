import { Song } from '../types/game';
import {
  getOfficialSongRecommendations,
  parseDecade,
  YouTubeRecommendationRequest
} from './youtubeApiService';

export interface MusicPreferences {
  genres: string[];
  decades: string[];
  artist?: string;
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

    const request: YouTubeRecommendationRequest = {
      genre: randomGenre,
      startYear: decadeRange.startYear,
      endYear: decadeRange.endYear,
      artist: preferences.artist,
      count: 5
    };

    const response = await getOfficialSongRecommendations(request);

    if (response.results.length === 0) {
      console.error('No songs found');
      return null;
    }

    const randomResult = response.results[Math.floor(Math.random() * response.results.length)];

    return {
      title: randomResult.title,
      artist: randomResult.artist,
      genre: randomGenre,
      year: randomResult.year,
      url: randomResult.url,
      thumbnail: randomResult.thumbnail
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

    const request: YouTubeRecommendationRequest = {
      genre,
      startYear: decadeRange.startYear,
      endYear: decadeRange.endYear,
      artist,
      count: 5
    };

    const response = await getOfficialSongRecommendations(request);

    return response.results.map(result => ({
      title: result.title,
      artist: result.artist,
      genre,
      year: result.year,
      url: result.url,
      thumbnail: result.thumbnail
    }));

  } catch (error) {
    console.error('Error fetching multiple recommendations:', error);
    return [];
  }
}
