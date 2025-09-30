import { Song } from '../types/game';
import {
  getOfficialSongRecommendations,
  parseDecade,
  YouTubeRecommendationRequest
} from './youtubeApiService';

export interface MusicPreferences {
  genre?: string;
  decade?: string;
  artist?: string;
}

export async function getMultipleRecommendations(
  genre?: string,
  decade?: string,
  artist?: string
): Promise<Song[]> {
  const request: YouTubeRecommendationRequest = {
    genre,
    artist,
    count: 3
  };

  if (decade) {
    const years = parseDecade(decade);
    if (years) {
      request.startYear = years.startYear;
      request.endYear = years.endYear;
    }
  }

  const response = await getOfficialSongRecommendations(request);

  return response.results.map(result => ({
    title: result.title,
    artist: result.artist,
    year: result.year,
    url: result.url,
    thumbnail: result.thumbnail
  }));
}
