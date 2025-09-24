import { Song } from '../types/game';

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';
const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';

// Track recommended songs to prevent repeats
const recommendedSongs = new Set<string>();

// Convert decade range to date filters for YouTube API
function getDecadeDateFilters(decade: string): { publishedAfter: string; publishedBefore: string } {
  const decadeMap: Record<string, { start: string; end: string }> = {
    '1950–1960': { start: '1950-01-01', end: '1960-12-31' },
    '1960–1970': { start: '1960-01-01', end: '1970-12-31' },
    '1970–1980': { start: '1970-01-01', end: '1980-12-31' },
    '1980–1990': { start: '1980-01-01', end: '1990-12-31' },
    '1990–2000': { start: '1990-01-01', end: '2000-12-31' },
    '2000–2010': { start: '2000-01-01', end: '2010-12-31' },
    '2010–2020': { start: '2010-01-01', end: '2020-12-31' },
    '2020–Present': { start: '2020-01-01', end: '2029-12-31' }
  };

  const range = decadeMap[decade];
  if (!range) {
    throw new Error(`Invalid decade: ${decade}`);
  }

  return {
    publishedAfter: `${range.start}T00:00:00Z`,
    publishedBefore: `${range.end}T23:59:59Z`
  };
}

// Verify if a channel is official by checking verification status and indicators
async function verifyOfficialChannel(channelId: string, artistName: string): Promise<boolean> {
  if (!YOUTUBE_API_KEY) {
    return false;
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet,statistics,brandingSettings,status',
      id: channelId,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_CHANNELS_URL}?${params}`);
    if (!response.ok) return false;

    const data = await response.json();
    const channel = data.items?.[0];
    
    if (!channel) return false;

    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const channelTitle = snippet.title.toLowerCase();
    const artistLower = artistName.toLowerCase();

    // Check if channel title contains artist name
    const hasArtistName = channelTitle.includes(artistLower);
    if (!hasArtistName) return false;

    // Check for official indicators
    const isVerified = channelTitle.includes('official') || 
                      channelTitle.includes('vevo') ||
                      snippet.description?.toLowerCase().includes('official');

    // Check subscriber count (official channels typically have high subscriber counts)
    const subscriberCount = parseInt(statistics?.subscriberCount || '0');
    const hasHighSubscribers = subscriberCount > 50000;

    // Check if channel is verified (this would be in status.longUploadsStatus or other verification fields)
    // Note: YouTube API doesn't directly expose verification badge status in public API
    
    return isVerified && hasHighSubscribers;
  } catch (error) {
    console.warn('Failed to verify official channel:', error);
    return false;
  }
}

// Find official artist channel with strict verification
async function findOfficialChannel(artistName: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    return null;
  }

  const params = new URLSearchParams({
    part: 'snippet,statistics',
    q: `${artistName} official`,
    type: 'channel',
    maxResults: '10',
    key: YOUTUBE_API_KEY
  });

  try {
    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    const channels = data.items || [];
    
    // Find and verify official channels
    for (const channel of channels) {
      const channelId = channel.id.channelId;
      const isOfficial = await verifyOfficialChannel(channelId, artistName);
      
      if (isOfficial) {
        console.log(`Found verified official channel for ${artistName}: ${channel.snippet.title}`);
        return channelId;
      }
    }
    
    console.log(`No verified official channel found for ${artistName}`);
    return null;
  } catch (error) {
    console.warn('Failed to find official channel:', error);
    return null;
  }
}

// Search within official channel with strict decade filtering
async function searchOfficialChannel(
  channelId: string, 
  genre: string, 
  decade: string, 
  artistName: string
): Promise<Song[]> {
  if (!YOUTUBE_API_KEY) {
    return [];
  }

  try {
    const dateFilters = getDecadeDateFilters(decade);
    
    const params = new URLSearchParams({
      part: 'snippet',
      channelId: channelId,
      q: genre,
      type: 'video',
      videoCategoryId: '10', // Music category
      maxResults: '20', // Get more results for better filtering
      order: 'relevance',
      publishedAfter: dateFilters.publishedAfter,
      publishedBefore: dateFilters.publishedBefore,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_SEARCH_URL}?${params}`);
    if (!response.ok) {
      console.error(`YouTube API error: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    const results = data.items || [];
    
    console.log(`Found ${results.length} videos in official channel for ${artistName} in ${decade}`);
    
    // Filter and convert results to Song format
    const songs: Song[] = [];
    
    for (const item of results) {
      if (songs.length >= 5) break; // Limit to 5 songs
      
      const snippet = item.snippet;
      const videoId = item.id.videoId;
      
      // Skip if already recommended
      if (recommendedSongs.has(videoId)) continue;
      
      // Additional filtering for music content
      const title = snippet.title.toLowerCase();
      
      // Skip obvious non-music content
      const skipTerms = ['tutorial', 'how to', 'reaction', 'review', 'behind the scenes', 'interview', 'documentary'];
      if (skipTerms.some(term => title.includes(term))) continue;
      
      // Verify the published date is within the decade (double-check)
      const publishedYear = new Date(snippet.publishedAt).getFullYear();
      const [startYear, endYear] = decade.split('–').map(y => y === 'Present' ? 2029 : parseInt(y));
      
      if (publishedYear < startYear || publishedYear > endYear) {
        console.warn(`Skipping video outside decade range: ${snippet.title} (${publishedYear})`);
        continue;
      }
      
      // Mark as recommended
      recommendedSongs.add(videoId);
      
      songs.push({
        title: snippet.title,
        artist: artistName,
        decade: decade,
        year: publishedYear.toString(),
        url: `https://youtube.com/watch?v=${videoId}`,
        thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
        isOfficialSource: true
      });
    }
    
    return songs;
  } catch (error) {
    console.error('Failed to search official channel:', error);
    return [];
  }
}

// Get multiple recommendations with strict official channel and decade filtering
export async function getMultipleRecommendations(genre: string, decade: string, artist?: string): Promise<Song[]> {
  console.log(`Getting recommendations for: ${genre}, ${decade}, ${artist || 'Various Artists'}`);
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured. Please add your API key to use music recommendations.');
  }

  try {
    // If no artist specified, we cannot guarantee official channels
    if (!artist) {
      throw new Error('Artist name is required for official channel recommendations');
    }

    // Step 1: Find official artist channel
    const channelId = await findOfficialChannel(artist);
    
    if (!channelId) {
      // No official channel found - return empty array with error message
      console.log(`No official channel found for ${artist}`);
      return [];
    }

    // Step 2: Search within official channel with decade filtering
    const songs = await searchOfficialChannel(channelId, genre, decade, artist);
    
    console.log(`Retrieved ${songs.length} official songs for ${artist} in ${decade}`);
    
    return songs;
    
  } catch (error) {
    console.error('Error getting official recommendations:', error);
    return [];
  }
}

// Legacy single recommendation function for backward compatibility
export async function getRecommendation(genre: string, decade: string, artist?: string): Promise<Song> {
  const songs = await getMultipleRecommendations(genre, decade, artist);
  
  if (songs.length === 0) {
    // Return a placeholder song indicating no official content found
    return {
      title: 'No Official Content Available',
      artist: artist || 'Unknown Artist',
      decade: decade,
      year: decade.split('–')[0] || 'Unknown',
      url: 'https://youtube.com',
      thumbnail: '',
      isOfficialSource: false
    };
  }
  
  return songs[0];
}

// Reset recommendations history
export function resetRecommendationHistory(): void {
  recommendedSongs.clear();
}

// Validate decade format
export function isValidDecade(decade: string): boolean {
  const validDecades = [
    '1950–1960', '1960–1970', '1970–1980', '1980–1990',
    '1990–2000', '2000–2010', '2010–2020', '2020–Present'
  ];
  return validDecades.includes(decade);
}

// Get decade display name
export function getDecadeDisplayName(decade: string): string {
  return decade;
}