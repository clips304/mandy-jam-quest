const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export interface YouTubeSong {
  title: string;
  artist: string;
  year: string;
  url: string;
  thumbnail: string;
  official: boolean;
}

interface YouTubeSearchResult {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      high?: { url: string };
      medium?: { url: string };
      default?: { url: string };
    };
    channelId: string;
  };
}

interface YouTubeVideoDetails {
  id: string;
  contentDetails: {
    duration: string;
  };
  snippet: {
    categoryId: string;
  };
}

function isOfficialChannel(channelTitle: string): boolean {
  const officialKeywords = ['vevo', 'official', '- topic', 'topic'];
  const lowerTitle = channelTitle.toLowerCase();
  return officialKeywords.some(keyword => lowerTitle.includes(keyword));
}

function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}

function shouldExcludeVideo(title: string): boolean {
  const excludeKeywords = [
    'lyrics',
    'lyric video',
    'cover',
    'live',
    'interview',
    'teaser',
    'trailer',
    'behind the scenes',
    'making of',
    'reaction',
    'review'
  ];

  const lowerTitle = title.toLowerCase();
  return excludeKeywords.some(keyword => lowerTitle.includes(keyword));
}

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

function isWithinDecade(publishedDate: string, startYear: number, endYear: number): boolean {
  const year = new Date(publishedDate).getFullYear();
  return year >= startYear && year <= endYear;
}

export async function searchOfficialSongs(
  artist: string,
  decade: string,
  maxResults: number = 5
): Promise<YouTubeSong[]> {
  try {
    const decadeRange = parseDecade(decade);
    if (!decadeRange) {
      console.error('Invalid decade format:', decade);
      return [];
    }

    const { startYear, endYear } = decadeRange;

    const searchQuery = `${artist} official music video`;
    const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=50&key=${YOUTUBE_API_KEY}`;

    console.log('🔍 Searching YouTube:', searchQuery);

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();
    const items: YouTubeSearchResult[] = searchData.items || [];

    if (items.length === 0) {
      return [];
    }

    const videoIds = items.map((item: YouTubeSearchResult) => item.id.videoId).join(',');
    const detailsUrl = `${YOUTUBE_API_BASE}/videos?part=contentDetails,snippet&id=${videoIds}&key=${YOUTUBE_API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      throw new Error(`YouTube API error: ${detailsResponse.status}`);
    }

    const detailsData = await detailsResponse.json();
    const videoDetails: YouTubeVideoDetails[] = detailsData.items || [];

    const detailsMap = new Map<string, YouTubeVideoDetails>();
    videoDetails.forEach(video => {
      detailsMap.set(video.id, video);
    });

    const songs: YouTubeSong[] = [];

    for (const item of items) {
      if (songs.length >= maxResults) break;

      const videoId = item.id.videoId;
      const details = detailsMap.get(videoId);

      if (!details) continue;

      if (details.snippet.categoryId !== '10') continue;

      const durationSeconds = parseDuration(details.contentDetails.duration);
      if (durationSeconds < 30) continue;

      const title = item.snippet.title;
      if (shouldExcludeVideo(title)) continue;

      const channelTitle = item.snippet.channelTitle;
      if (!isOfficialChannel(channelTitle)) continue;

      const publishedAt = item.snippet.publishedAt;
      if (!isWithinDecade(publishedAt, startYear, endYear)) continue;

      const year = new Date(publishedAt).getFullYear().toString();
      const thumbnail = item.snippet.thumbnails.high?.url ||
                       item.snippet.thumbnails.medium?.url ||
                       item.snippet.thumbnails.default?.url || '';

      songs.push({
        title,
        artist: channelTitle,
        year,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnail,
        official: true
      });
    }

    console.log(`✅ Found ${songs.length} official songs for ${artist} in ${decade}`);
    return songs;

  } catch (error) {
    console.error('❌ Error searching YouTube:', error);
    return [];
  }
}
