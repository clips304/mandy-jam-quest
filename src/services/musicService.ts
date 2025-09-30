import { Song } from '../types/game';

// YouTube Data API configuration
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_VIDEOS_URL = 'https://www.googleapis.com/youtube/v3/videos';


// Curated fallback library with real hit songs and accurate YouTube URLs
const curatedLibrary: Record<string, Record<string, Song[]>> = {
  'R&B': {
    '1990–2000': [
      {
        title: 'I Will Always Love You',
        artist: 'Whitney Houston',
        decade: '1990–2000',
        year: '1992',
        url: 'https://www.youtube.com/watch?v=3JWTaaS7LdU',
        thumbnail: 'https://i.ytimg.com/vi/3JWTaaS7LdU/hqdefault.jpg'
      },
      {
        title: 'No Scrubs',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1999',
        url: 'https://www.youtube.com/watch?v=FrLequ6dUdM',
        thumbnail: 'https://i.ytimg.com/vi/FrLequ6dUdM/hqdefault.jpg'
      },
      {
        title: 'Waterfalls',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1994',
        url: 'https://www.youtube.com/watch?v=8WEtxJ4-sh4',
        thumbnail: 'https://i.ytimg.com/vi/8WEtxJ4-sh4/hqdefault.jpg'
      },
      {
        title: 'End of the Road',
        artist: 'Boyz II Men',
        decade: '1990–2000',
        year: '1992',
        url: 'https://www.youtube.com/watch?v=zDKO6XYXioc',
        thumbnail: 'https://i.ytimg.com/vi/zDKO6XYXioc/hqdefault.jpg'
      },
      {
        title: 'Fantasy',
        artist: 'Mariah Carey',
        decade: '1990–2000',
        year: '1995',
        url: 'https://www.youtube.com/watch?v=qq09UkPRdFY',
        thumbnail: 'https://i.ytimg.com/vi/qq09UkPRdFY/hqdefault.jpg'
      }
    ],
    '2000–2010': [
      {
        title: 'Crazy in Love',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2003',
        url: 'https://www.youtube.com/watch?v=ViwtNLUqkMY',
        thumbnail: 'https://i.ytimg.com/vi/ViwtNLUqkMY/hqdefault.jpg'
      },
      {
        title: 'Yeah!',
        artist: 'Usher',
        decade: '2000–2010',
        year: '2004',
        url: 'https://www.youtube.com/watch?v=GxBSyx85Kp8',
        thumbnail: 'https://i.ytimg.com/vi/GxBSyx85Kp8/hqdefault.jpg'
      },
      {
        title: 'Umbrella',
        artist: 'Rihanna',
        decade: '2000–2010',
        year: '2007',
        url: 'https://www.youtube.com/watch?v=CvBfHwUxHIk',
        thumbnail: 'https://i.ytimg.com/vi/CvBfHwUxHIk/hqdefault.jpg'
      },
      {
        title: 'Single Ladies',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2008',
        url: 'https://www.youtube.com/watch?v=4m1EFMoRFvY',
        thumbnail: 'https://i.ytimg.com/vi/4m1EFMoRFvY/hqdefault.jpg'
      },
      {
        title: 'Irreplaceable',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2006',
        url: 'https://www.youtube.com/watch?v=2EwViQxSJJQ',
        thumbnail: 'https://i.ytimg.com/vi/2EwViQxSJJQ/hqdefault.jpg'
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
        url: 'https://www.youtube.com/watch?v=_JZom_gVfuw',
        thumbnail: 'https://i.ytimg.com/vi/_JZom_gVfuw/hqdefault.jpg'
      },
      {
        title: 'California Love',
        artist: '2Pac',
        decade: '1990–2000',
        year: '1995',
        url: 'https://www.youtube.com/watch?v=5wBTdfAkqGU',
        thumbnail: 'https://i.ytimg.com/vi/5wBTdfAkqGU/hqdefault.jpg'
      },
      {
        title: 'Nuthin\' But a \'G\' Thang',
        artist: 'Dr. Dre',
        decade: '1990–2000',
        year: '1992',
        url: 'https://www.youtube.com/watch?v=_qkP8SvHvaU',
        thumbnail: 'https://i.ytimg.com/vi/_qkP8SvHvaU/hqdefault.jpg'
      },
      {
        title: 'C.R.E.A.M.',
        artist: 'Wu-Tang Clan',
        decade: '1990–2000',
        year: '1993',
        url: 'https://www.youtube.com/watch?v=PBwAxmrE194',
        thumbnail: 'https://i.ytimg.com/vi/PBwAxmrE194/hqdefault.jpg'
      },
      {
        title: 'Regulate',
        artist: 'Warren G',
        decade: '1990–2000',
        year: '1994',
        url: 'https://www.youtube.com/watch?v=1plPyJdXKIY',
        thumbnail: 'https://i.ytimg.com/vi/1plPyJdXKIY/hqdefault.jpg'
      }
    ],
    '2000–2010': [
      {
        title: 'In Da Club',
        artist: '50 Cent',
        decade: '2000–2010',
        year: '2003',
        url: 'https://www.youtube.com/watch?v=5qm8PH4xAss',
        thumbnail: 'https://i.ytimg.com/vi/5qm8PH4xAss/hqdefault.jpg'
      },
      {
        title: 'Gold Digger',
        artist: 'Kanye West',
        decade: '2000–2010',
        year: '2005',
        url: 'https://www.youtube.com/watch?v=6vwNcNOTVzY',
        thumbnail: 'https://i.ytimg.com/vi/6vwNcNOTVzY/hqdefault.jpg'
      },
      {
        title: 'Lose Yourself',
        artist: 'Eminem',
        decade: '2000–2010',
        year: '2002',
        url: 'https://www.youtube.com/watch?v=_Yhyp-_hX2s',
        thumbnail: 'https://i.ytimg.com/vi/_Yhyp-_hX2s/hqdefault.jpg'
      },
      {
        title: 'Hey Ya!',
        artist: 'OutKast',
        decade: '2000–2010',
        year: '2003',
        url: 'https://www.youtube.com/watch?v=PWgvGjAhvIw',
        thumbnail: 'https://i.ytimg.com/vi/PWgvGjAhvIw/hqdefault.jpg'
      },
      {
        title: 'Stronger',
        artist: 'Kanye West',
        decade: '2000–2010',
        year: '2007',
        url: 'https://www.youtube.com/watch?v=PsO6ZnUZI0g',
        thumbnail: 'https://i.ytimg.com/vi/PsO6ZnUZI0g/hqdefault.jpg'
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
        url: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
        thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg'
      },
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        decade: '1970–1980',
        year: '1971',
        url: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
        thumbnail: 'https://i.ytimg.com/vi/QkF3oxziUI4/hqdefault.jpg'
      },
      {
        title: 'Hotel California',
        artist: 'Eagles',
        decade: '1970–1980',
        year: '1976',
        url: 'https://www.youtube.com/watch?v=09839DpTctU',
        thumbnail: 'https://i.ytimg.com/vi/09839DpTctU/hqdefault.jpg'
      },
      {
        title: 'Another Brick in the Wall',
        artist: 'Pink Floyd',
        decade: '1970–1980',
        year: '1979',
        url: 'https://www.youtube.com/watch?v=YR5ApYxkU-U',
        thumbnail: 'https://i.ytimg.com/vi/YR5ApYxkU-U/hqdefault.jpg'
      },
      {
        title: 'Don\'t Stop Believin\'',
        artist: 'Journey',
        decade: '1970–1980',
        year: '1981',
        url: 'https://www.youtube.com/watch?v=1k8craCGpgs',
        thumbnail: 'https://i.ytimg.com/vi/1k8craCGpgs/hqdefault.jpg'
      }
    ],
    '1980–1990': [
      {
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        decade: '1980–1990',
        year: '1987',
        url: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        thumbnail: 'https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg'
      },
      {
        title: 'Livin\' on a Prayer',
        artist: 'Bon Jovi',
        decade: '1980–1990',
        year: '1986',
        url: 'https://www.youtube.com/watch?v=lDK9QqIzhwk',
        thumbnail: 'https://i.ytimg.com/vi/lDK9QqIzhwk/hqdefault.jpg'
      },
      {
        title: 'Pour Some Sugar on Me',
        artist: 'Def Leppard',
        decade: '1980–1990',
        year: '1987',
        url: 'https://www.youtube.com/watch?v=0UIB9Y4OFPs',
        thumbnail: 'https://i.ytimg.com/vi/0UIB9Y4OFPs/hqdefault.jpg'
      },
      {
        title: 'Back in Black',
        artist: 'AC/DC',
        decade: '1980–1990',
        year: '1980',
        url: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
        thumbnail: 'https://i.ytimg.com/vi/pAgnJDJN4VA/hqdefault.jpg'
      },
      {
        title: 'We Will Rock You',
        artist: 'Queen',
        decade: '1980–1990',
        year: '1977',
        url: 'https://www.youtube.com/watch?v=-tJYN-eG1zk',
        thumbnail: 'https://i.ytimg.com/vi/-tJYN-eG1zk/hqdefault.jpg'
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
        url: 'https://www.youtube.com/watch?v=Zi_XLOBDo_Y',
        thumbnail: 'https://i.ytimg.com/vi/Zi_XLOBDo_Y/hqdefault.jpg'
      },
      {
        title: 'Like a Virgin',
        artist: 'Madonna',
        decade: '1980–1990',
        year: '1984',
        url: 'https://www.youtube.com/watch?v=s__rX_WL100',
        thumbnail: 'https://i.ytimg.com/vi/s__rX_WL100/hqdefault.jpg'
      },
      {
        title: 'Beat It',
        artist: 'Michael Jackson',
        decade: '1980–1990',
        year: '1983',
        url: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        thumbnail: 'https://i.ytimg.com/vi/oRdxUFDoQe0/hqdefault.jpg'
      },
      {
        title: 'Girls Just Want to Have Fun',
        artist: 'Cyndi Lauper',
        decade: '1980–1990',
        year: '1983',
        url: 'https://www.youtube.com/watch?v=PIb6AZdTr-A',
        thumbnail: 'https://i.ytimg.com/vi/PIb6AZdTr-A/hqdefault.jpg'
      },
      {
        title: 'Take On Me',
        artist: 'a-ha',
        decade: '1980–1990',
        year: '1985',
        url: 'https://www.youtube.com/watch?v=djV11Xbc914',
        thumbnail: 'https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg'
      }
    ],
    '2000–2010': [
      {
        title: 'Toxic',
        artist: 'Britney Spears',
        decade: '2000–2010',
        year: '2003',
        url: 'https://www.youtube.com/watch?v=LOZuxwVk7TU',
        thumbnail: 'https://i.ytimg.com/vi/LOZuxwVk7TU/hqdefault.jpg'
      },
      {
        title: 'Since U Been Gone',
        artist: 'Kelly Clarkson',
        decade: '2000–2010',
        year: '2004',
        url: 'https://www.youtube.com/watch?v=R7UrFYvl5TE',
        thumbnail: 'https://i.ytimg.com/vi/R7UrFYvl5TE/hqdefault.jpg'
      },
      {
        title: 'Hollaback Girl',
        artist: 'Gwen Stefani',
        decade: '2000–2010',
        year: '2004',
        url: 'https://www.youtube.com/watch?v=Kgjkth6BRRY',
        thumbnail: 'https://i.ytimg.com/vi/Kgjkth6BRRY/hqdefault.jpg'
      },
      {
        title: 'Bad Romance',
        artist: 'Lady Gaga',
        decade: '2000–2010',
        year: '2009',
        url: 'https://www.youtube.com/watch?v=qrO4YZeyl0I',
        thumbnail: 'https://i.ytimg.com/vi/qrO4YZeyl0I/hqdefault.jpg'
      },
      {
        title: 'I Kissed a Girl',
        artist: 'Katy Perry',
        decade: '2000–2010',
        year: '2008',
        url: 'https://www.youtube.com/watch?v=tAp9BKosZXs',
        thumbnail: 'https://i.ytimg.com/vi/tAp9BKosZXs/hqdefault.jpg'
      }
    ]
  }
};

// Helper function to parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  if (!duration) return 0;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  
  return hours * 3600 + minutes * 60 + seconds;
}

// Check if channel is official (Topic, VEVO, or verified)
function isOfficialChannel(channelTitle: string): boolean {
  const titleLower = channelTitle.toLowerCase();
  return titleLower.includes('- topic') || 
         titleLower.includes('vevo') || 
         titleLower.includes('official');
}

// Check if video title/description contains excluded content
function isExcludedContent(title: string, description: string = ''): boolean {
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  const excludePatterns = [
    'lyric', 'lyrics', 'live', 'cover', 'interview', 
    'behind the scenes', 'teaser', 'reaction', 'remix', 'short'
  ];
  
  return excludePatterns.some(pattern => 
    titleLower.includes(pattern) || descLower.includes(pattern)
  );
}

// Convert decade string to year bounds
function getDecadeYearBounds(decade: string): { startYear: number; endYear: number } {
  const decadeMap: Record<string, { start: number; end: number }> = {
    '1950–1960': { start: 1950, end: 1960 },
    '1960–1970': { start: 1960, end: 1970 },
    '1970–1980': { start: 1970, end: 1980 },
    '1980–1990': { start: 1980, end: 1990 },
    '1990–2000': { start: 1990, end: 2000 },
    '2000–2010': { start: 2000, end: 2010 },
    '2010–2020': { start: 2010, end: 2020 },
    '2020–Present': { start: 2020, end: new Date().getFullYear() }
  };
  
  const bounds = decadeMap[decade] || { start: 2000, end: 2010 };
  return { startYear: bounds.start, endYear: bounds.end };
}

// Check if video was published in target decade
function isInDecade(publishedAt: string, startYear: number, endYear: number): boolean {
  const publishYear = new Date(publishedAt).getFullYear();
  return publishYear >= startYear && publishYear <= endYear;

// Search for official music videos using YouTube Data API
async function searchOfficialMusic(artistName: string, startYear?: number, endYear?: number, count: number = 5): Promise<Song[]> {
  if (!YOUTUBE_API_KEY) return [];

  console.log(`🎵 Searching for official music: ${artistName}`);

  try {
    // Step 1: Search for videos with strict YouTube Music criteria
    const searchParams = new URLSearchParams({
      part: 'snippet',
      q: artistName,
      type: 'video',
      videoCategoryId: '10', // Music category only
      videoDuration: 'medium', // Exclude shorts
      maxResults: Math.min(50, count * 3).toString(), // Get more to filter
      key: YOUTUBE_API_KEY
    });

    const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`);
    if (!searchResponse.ok) {
      throw new Error(`Search failed: ${searchResponse.status}`);
    }


    const searchData = await searchResponse.json();
    const searchResults = searchData.items || [];
    
    if (searchResults.length === 0) {
      console.log('❌ No search results found');
      return [];
    }

    console.log(`🔍 Found ${searchResults.length} search results`);

    // Step 2: Get detailed video information
    const videoIds = searchResults.map((item: any) => item.id.videoId);
    const videoParams = new URLSearchParams({
      part: 'snippet,contentDetails,statistics',
      id: videoIds.join(','),
      key: YOUTUBE_API_KEY
    });

    const videoResponse = await fetch(`${YOUTUBE_VIDEOS_URL}?${videoParams}`);
    if (!videoResponse.ok) {
      throw new Error(`Video details failed: ${videoResponse.status}`);
    }

    const videoData = await videoResponse.json();
    const videos = videoData.items || [];

    console.log(`📹 Got details for ${videos.length} videos`);

    // Step 3: Filter videos with strict criteria
    const filteredSongs: Song[] = [];

    for (const video of videos) {
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      
      // Must be Music category
      if (snippet.categoryId !== '10') continue;
      
      // Must be from official channel (Topic, VEVO, or verified)
      if (!isOfficialChannel(snippet.channelTitle)) continue;
      
      // Exclude non-song content
      if (isExcludedContent(snippet.title, snippet.description)) continue;
      
      // Must be longer than 30 seconds (no Shorts)
      const duration = parseDuration(contentDetails.duration);
      if (duration < 30) continue;
      
      // Check decade filter if provided
      const publishYear = new Date(snippet.publishedAt).getFullYear();
      if (startYear && endYear && !isInDecade(snippet.publishedAt, startYear, endYear)) continue;
      
      // Create song object
      const song: Song = {
        title: snippet.title.replace(/\s*\(Official.*?\)/gi, '').replace(/\s*\[Official.*?\]/gi, '').trim(),
        artist: snippet.channelTitle.replace(' - Topic', '').replace('VEVO', ''),
        decade: `${Math.floor(publishYear / 10) * 10}–${Math.floor(publishYear / 10) * 10 + 10}`,
        year: publishYear.toString(),
        url: `https://music.youtube.com/watch?v=${video.id}`,
        thumbnail: snippet.thumbnails?.high?.url || 
                  snippet.thumbnails?.medium?.url || 
                  snippet.thumbnails?.default?.url || '',
        isOfficialSource: true
      };
      
      filteredSongs.push(song);
      
      // Stop when we have enough songs
      if (filteredSongs.length >= count) break;
    }

    console.log(`✅ Filtered to ${filteredSongs.length} official music tracks`);
    return filteredSongs;

  } catch (error) {
    console.error('❌ Error searching official music:', error);
    return [];
  }
}

// Get fallback songs from curated library
function getFallbackSongs(genre: string, decade: string, artistName?: string): Song[] {
  console.log(`🎵 Using fallback songs for ${genre} - ${decade}`);
  
  // Try to get from curated library first
  const genreSongs = curatedLibrary[genre];
  if (genreSongs && genreSongs[decade] && genreSongs[decade].length >= 5) {
    return genreSongs[decade].slice(0, 5);
  }
  
  // If not enough songs in exact decade, try other decades in same genre
  if (genreSongs) {
    const allGenreSongs: Song[] = [];
    Object.values(genreSongs).forEach(decadeSongs => {
      allGenreSongs.push(...decadeSongs);
    });
    
    if (allGenreSongs.length >= 5) {
      return allGenreSongs.slice(0, 5);
    }
  }
  
  // If still not enough, get from any genre in the same decade
  const allDecadeSongs: Song[] = [];
  Object.values(curatedLibrary).forEach(genreData => {
    if (genreData[decade]) {
      allDecadeSongs.push(...genreData[decade]);
    }
  });
  
  if (allDecadeSongs.length >= 5) {
    return allDecadeSongs.slice(0, 5);
  }
  
  // Last resort: create generic songs with proper structure
  const { startYear } = getDecadeYearBounds(decade);
  return Array.from({ length: 5 }, (_, i) => ({
    title: `${genre} Classic #${i + 1}`,
    artist: artistName || 'Various Artists',
    decade: decade,
    year: (startYear + i).toString(),
    url: 'https://www.youtube.com',
    thumbnail: '',
    isCustomPick: true
  }));
}

// Main recommendation function - returns up to 5 official songs
export async function getMultipleRecommendations(genre: string, decade: string, artist?: string): Promise<Song[]> {
  console.log(`🎵 Getting YouTube Music recommendations for: ${artist || 'Various Artists'} - ${genre} - ${decade}`);
  
  if (!artist) {
    console.log('🎵 No artist specified, using fallback');
    return getFallbackSongs(genre, decade);
  }

  if (!YOUTUBE_API_KEY) {
    console.log('🎵 No API key, using fallback');
    return getFallbackSongs(genre, decade, artist);
  }

  const { startYear, endYear } = getDecadeYearBounds(decade);

  try {
    // Search for official music tracks
    const officialSongs = await searchOfficialMusic(artist, startYear, endYear, 5);
    
    if (officialSongs.length > 0) {
      console.log(`✅ Found ${officialSongs.length} official songs`);
      return officialSongs;
    }
    
    console.log('❌ No official songs found, using fallback');
    return getFallbackSongs(genre, decade, artist);

  } catch (error) {
    console.error('❌ Error getting YouTube Music recommendations:', error);
    return getFallbackSongs(genre, decade, artist);
  }
}