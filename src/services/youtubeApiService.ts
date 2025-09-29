// Client-side service to call our YouTube recommendation server
export interface YouTubeRecommendationRequest {
  artist?: string;
  genre?: string;
  startYear?: number;
  endYear?: number;
  count?: number;
}

export interface YouTubeRecommendationResult {
  title: string;
  artist: string;
  year: string;
  url: string;
  thumbnail: string;
  sourceChannelId: string;
  official: boolean;
}

export interface YouTubeRecommendationResponse {
  results: YouTubeRecommendationResult[];
  message: string;
}

// Base URL for our recommendation server
const API_BASE_URL = 'http://localhost:3001';

/**
 * Get official song recommendations from YouTube
 */
export async function getOfficialSongRecommendations(
  request: YouTubeRecommendationRequest
): Promise<YouTubeRecommendationResponse> {
  try {
    console.log('🎵 Requesting official songs:', request);
    
    // Build query parameters
    const params = new URLSearchParams();
    
    if (request.artist) params.append('artist', request.artist);
    if (request.genre) params.append('genre', request.genre);
    if (request.startYear) params.append('startYear', request.startYear.toString());
    if (request.endYear) params.append('endYear', request.endYear.toString());
    if (request.count) params.append('count', request.count.toString());
    
    const url = `${API_BASE_URL}/api/youtube/official-songs?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data: YouTubeRecommendationResponse = await response.json();
    
    console.log(`✅ Received ${data.results.length} official songs:`, data.message);
    
    return data;
    
  } catch (error) {
    console.error('❌ Error getting official song recommendations:', error);
    
    // Return empty results with error message
    return {
      results: [],
      message: `Failed to get recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Check if the recommendation server is healthy
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    
    console.log('🏥 Server health check:', data);
    
    return response.ok && data.status === 'ok';
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    return false;
  }
}

/**
 * Convert decade string to start/end years
 */
export function parseDecade(decade: string): { startYear: number; endYear: number } | null {
  const decadeMap: Record<string, { startYear: number; endYear: number }> = {
    '1950–1960': { startYear: 1950, endYear: 1960 },
    '1960–1970': { startYear: 1960, endYear: 1970 },
    '1970–1980': { startYear: 1970, endYear: 1980 },
    '1980–1990': { startYear: 1980, endYear: 1990 },
    '1990–2000': { startYear: 1990, endYear: 2000 },
    '2000–2010': { startYear: 2000, endYear: 2010 },
    '2010–2020': { startYear: 2010, endYear: 2020 },
    '2020–Present': { startYear: 2020, endYear: new Date().getFullYear() }
  };
  
  return decadeMap[decade] || null;
}