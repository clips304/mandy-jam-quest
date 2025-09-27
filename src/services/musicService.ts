import { Song } from '../types/game';

// YouTube API configuration
const YOUTUBE_API_KEY = 'AIzaSyAR5KpTHhjUV0YWI9afK1zR6kCB2Z7WCMg';
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const YOUTUBE_CHANNELS_URL = 'https://www.googleapis.com/youtube/v3/channels';
const YOUTUBE_PLAYLIST_ITEMS_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';

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
        thumbnail: 'https://i.ytimg.com/vi/3JWTaaS7LdU/hqdefault.jpg'
      },
      {
        title: 'No Scrubs',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1999',
        url: 'https://youtube.com/watch?v=FrLequ6dUdM',
        thumbnail: 'https://i.ytimg.com/vi/FrLequ6dUdM/hqdefault.jpg'
      },
      {
        title: 'Waterfalls',
        artist: 'TLC',
        decade: '1990–2000',
        year: '1994',
        url: 'https://youtube.com/watch?v=8WEtxJ4-sh4',
        thumbnail: 'https://i.ytimg.com/vi/8WEtxJ4-sh4/hqdefault.jpg'
      },
      {
        title: 'End of the Road',
        artist: 'Boyz II Men',
        decade: '1990–2000',
        year: '1992',
        url: 'https://youtube.com/watch?v=zDKO6XYXioc',
        thumbnail: 'https://i.ytimg.com/vi/zDKO6XYXioc/hqdefault.jpg'
      },
      {
        title: 'Fantasy',
        artist: 'Mariah Carey',
        decade: '1990–2000',
        year: '1995',
        url: 'https://youtube.com/watch?v=qq09UkPRdFY',
        thumbnail: 'https://i.ytimg.com/vi/qq09UkPRdFY/hqdefault.jpg'
      }
    ],
    '2000–2010': [
      {
        title: 'Crazy in Love',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2003',
        url: 'https://youtube.com/watch?v=ViwtNLUqkMY',
        thumbnail: 'https://i.ytimg.com/vi/ViwtNLUqkMY/hqdefault.jpg'
      },
      {
        title: 'Yeah!',
        artist: 'Usher',
        decade: '2000–2010',
        year: '2004',
        url: 'https://youtube.com/watch?v=GxBSyx85Kp8',
        thumbnail: 'https://i.ytimg.com/vi/GxBSyx85Kp8/hqdefault.jpg'
      },
      {
        title: 'Hips Don\'t Lie',
        artist: 'Shakira',
        decade: '2000–2010',
        year: '2006',
        url: 'https://youtube.com/watch?v=DUT5rEU6pqM',
        thumbnail: 'https://i.ytimg.com/vi/DUT5rEU6pqM/hqdefault.jpg'
      },
      {
        title: 'Umbrella',
        artist: 'Rihanna',
        decade: '2000–2010',
        year: '2007',
        url: 'https://youtube.com/watch?v=CvBfHwUxHIk',
        thumbnail: 'https://i.ytimg.com/vi/CvBfHwUxHIk/hqdefault.jpg'
      },
      {
        title: 'Single Ladies',
        artist: 'Beyoncé',
        decade: '2000–2010',
        year: '2008',
        url: 'https://youtube.com/watch?v=4m1EFMoRFvY',
        thumbnail: 'https://i.ytimg.com/vi/4m1EFMoRFvY/hqdefault.jpg'
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
        thumbnail: 'https://i.ytimg.com/vi/_JZom_gVfuw/hqdefault.jpg'
      },
      {
        title: 'California Love',
        artist: '2Pac',
        decade: '1990–2000',
        year: '1995',
        url: 'https://youtube.com/watch?v=5wBTdfAkqGU',
        thumbnail: 'https://i.ytimg.com/vi/5wBTdfAkqGU/hqdefault.jpg'
      },
      {
        title: 'Nuthin\' But a \'G\' Thang',
        artist: 'Dr. Dre',
        decade: '1990–2000',
        year: '1992',
        url: 'https://youtube.com/watch?v=_qkP8SvHvaU',
        thumbnail: 'https://i.ytimg.com/vi/_qkP8SvHvaU/hqdefault.jpg'
      },
      {
        title: 'C.R.E.A.M.',
        artist: 'Wu-Tang Clan',
        decade: '1990–2000',
        year: '1993',
        url: 'https://youtube.com/watch?v=PBwAxmrE194',
        thumbnail: 'https://i.ytimg.com/vi/PBwAxmrE194/hqdefault.jpg'
      },
      {
        title: 'Regulate',
        artist: 'Warren G',
        decade: '1990–2000',
        year: '1994',
        url: 'https://youtube.com/watch?v=1plPyJdXKIY',
        thumbnail: 'https://i.ytimg.com/vi/1plPyJdXKIY/hqdefault.jpg'
      }
    ],
    '2000–2010': [
      {
        title: 'In Da Club',
        artist: '50 Cent',
        decade: '2000–2010',
        year: '2003',
        url: 'https://youtube.com/watch?v=5qm8PH4xAss',
        thumbnail: 'https://i.ytimg.com/vi/5qm8PH4xAss/hqdefault.jpg'
      },
      {
        title: 'Gold Digger',
        artist: 'Kanye West',
        decade: '2000–2010',
        year: '2005',
        url: 'https://youtube.com/watch?v=6vwNcNOTVzY',
        thumbnail: 'https://i.ytimg.com/vi/6vwNcNOTVzY/hqdefault.jpg'
      },
      {
        title: 'Lose Yourself',
        artist: 'Eminem',
        decade: '2000–2010',
        year: '2002',
        url: 'https://youtube.com/watch?v=_Yhyp-_hX2s',
        thumbnail: 'https://i.ytimg.com/vi/_Yhyp-_hX2s/hqdefault.jpg'
      },
      {
        title: 'Hey Ya!',
        artist: 'OutKast',
        decade: '2000–2010',
        year: '2003',
        url: 'https://youtube.com/watch?v=PWgvGjAhvIw',
        thumbnail: 'https://i.ytimg.com/vi/PWgvGjAhvIw/hqdefault.jpg'
      },
      {
        title: 'Stronger',
        artist: 'Kanye West',
        decade: '2000–2010',
        year: '2007',
        url: 'https://youtube.com/watch?v=PsO6ZnUZI0g',
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
        url: 'https://youtube.com/watch?v=fJ9rUzIMcZQ',
        thumbnail: 'https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg'
      },
      {
        title: 'Stairway to Heaven',
        artist: 'Led Zeppelin',
        decade: '1970–1980',
        year: '1971',
        url: 'https://youtube.com/watch?v=QkF3oxziUI4',
        thumbnail: 'https://i.ytimg.com/vi/QkF3oxziUI4/hqdefault.jpg'
      },
      {
        title: 'Hotel California',
        artist: 'Eagles',
        decade: '1970–1980',
        year: '1976',
        url: 'https://youtube.com/watch?v=09839DpTctU',
        thumbnail: 'https://i.ytimg.com/vi/09839DpTctU/hqdefault.jpg'
      },
      {
        title: 'Another Brick in the Wall',
        artist: 'Pink Floyd',
        decade: '1970–1980',
        year: '1979',
        url: 'https://youtube.com/watch?v=YR5ApYxkU-U',
        thumbnail: 'https://i.ytimg.com/vi/YR5ApYxkU-U/hqdefault.jpg'
      },
      {
        title: 'Don\'t Stop Believin\'',
        artist: 'Journey',
        decade: '1970–1980',
        year: '1981',
        url: 'https://youtube.com/watch?v=1k8craCGpgs',
        thumbnail: 'https://i.ytimg.com/vi/1k8craCGpgs/hqdefault.jpg'
      }
    ],
    '1980–1990': [
      {
        title: 'Sweet Child O\' Mine',
        artist: 'Guns N\' Roses',
        decade: '1980–1990',
        year: '1987',
        url: 'https://youtube.com/watch?v=1w7OgIMMRc4',
        thumbnail: 'https://i.ytimg.com/vi/1w7OgIMMRc4/hqdefault.jpg'
      },
      {
        title: 'Livin\' on a Prayer',
        artist: 'Bon Jovi',
        decade: '1980–1990',
        year: '1986',
        url: 'https://youtube.com/watch?v=lDK9QqIzhwk',
        thumbnail: 'https://i.ytimg.com/vi/lDK9QqIzhwk/hqdefault.jpg'
      },
      {
        title: 'Pour Some Sugar on Me',
        artist: 'Def Leppard',
        decade: '1980–1990',
        year: '1987',
        url: 'https://youtube.com/watch?v=0UIB9Y4OFPs',
        thumbnail: 'https://i.ytimg.com/vi/0UIB9Y4OFPs/hqdefault.jpg'
      },
      {
        title: 'Back in Black',
        artist: 'AC/DC',
        decade: '1980–1990',
        year: '1980',
        url: 'https://youtube.com/watch?v=pAgnJDJN4VA',
        thumbnail: 'https://i.ytimg.com/vi/pAgnJDJN4VA/hqdefault.jpg'
      },
      {
        title: 'We Will Rock You',
        artist: 'Queen',
        decade: '1980–1990',
        year: '1977',
        url: 'https://youtube.com/watch?v=-tJYN-eG1zk',
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
        url: 'https://youtube.com/watch?v=Zi_XLOBDo_Y',
        thumbnail: 'https://i.ytimg.com/vi/Zi_XLOBDo_Y/hqdefault.jpg'
      },
      {
        title: 'Like a Virgin',
        artist: 'Madonna',
        decade: '1980–1990',
        year: '1984',
        url: 'https://youtube.com/watch?v=s__rX_WL100',
        thumbnail: 'https://i.ytimg.com/vi/s__rX_WL100/hqdefault.jpg'
      },
      {
        title: 'Beat It',
        artist: 'Michael Jackson',
        decade: '1980–1990',
        year: '1983',
        url: 'https://youtube.com/watch?v=oRdxUFDoQe0',
        thumbnail: 'https://i.ytimg.com/vi/oRdxUFDoQe0/hqdefault.jpg'
      },
      {
        title: 'Girls Just Want to Have Fun',
        artist: 'Cyndi Lauper',
        decade: '1980–1990',
        year: '1983',
        url: 'https://youtube.com/watch?v=PIb6AZdTr-A',
        thumbnail: 'https://i.ytimg.com/vi/PIb6AZdTr-A/hqdefault.jpg'
      },
      {
        title: 'Take On Me',
        artist: 'a-ha',
        decade: '1980–1990',
        year: '1985',
        url: 'https://youtube.com/watch?v=djV11Xbc914',
        thumbnail: 'https://i.ytimg.com/vi/djV11Xbc914/hqdefault.jpg'
      }
    ],
    '2000–2010': [
      {
        title: 'Toxic',
        artist: 'Britney Spears',
        decade: '2000–2010',
        year: '2003',
        url: 'https://youtube.com/watch?v=LOZuxwVk7TU',
        thumbnail: 'https://i.ytimg.com/vi/LOZuxwVk7TU/hqdefault.jpg'
      },
      {
        title: 'Since U Been Gone',
        artist: 'Kelly Clarkson',
        decade: '2000–2010',
        year: '2004',
        url: 'https://youtube.com/watch?v=R7UrFYvl5TE',
        thumbnail: 'https://i.ytimg.com/vi/R7UrFYvl5TE/hqdefault.jpg'
      },
      {
        title: 'Hollaback Girl',
        artist: 'Gwen Stefani',
        decade: '2000–2010',
        year: '2004',
        url: 'https://youtube.com/watch?v=Kgjkth6BRRY',
        thumbnail: 'https://i.ytimg.com/vi/Kgjkth6BRRY/hqdefault.jpg'
      },
      {
        title: 'Bad Romance',
        artist: 'Lady Gaga',
        decade: '2000–2010',
        year: '2009',
        url: 'https://youtube.com/watch?v=qrO4YZeyl0I',
        thumbnail: 'https://i.ytimg.com/vi/qrO4YZeyl0I/hqdefault.jpg'
      },
      {
        title: 'I Kissed a Girl',
        artist: 'Katy Perry',
        decade: '2000–2010',
        year: '2008',
        url: 'https://youtube.com/watch?v=tAp9BKosZXs',
        thumbnail: 'https://i.ytimg.com/vi/tAp9BKosZXs/hqdefault.jpg'
      }
    ]
  }
};

// Convert decade range to year bounds
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

// Check if a video was published in the target decade
function isInDecade(publishedAt: string, startYear: number, endYear: number): boolean {
  const publishYear = new Date(publishedAt).getFullYear();
  return publishYear >= startYear && publishYear <= endYear;
}

// Clean video title by removing common official video markers
function cleanVideoTitle(title: string): string {
  const cleanPatterns = [
    /\s*\(Official.*?\)/gi,
    /\s*\[Official.*?\]/gi,
    /\s*- Official.*$/gi,
    /\s*Official.*Video$/gi,
    /\s*\(.*?Music.*?Video.*?\)/gi,
    /\s*\(HD\)/gi,
    /\s*\[HD\]/gi,
    /\s*\(Explicit\)/gi,
    /\s*\[Explicit\]/gi
  ];
  
  let cleanTitle = title;
  cleanPatterns.forEach(pattern => {
    cleanTitle = cleanTitle.replace(pattern, '').trim();
  });
  
  return cleanTitle;
}

// Find official channels for an artist (main, Topic, VEVO)
async function findOfficialChannels(artistName: string): Promise<Array<{ channelId: string; title: string; subscriberCount: number; type: string }>> {
  if (!YOUTUBE_API_KEY) return [];

  const channels: Array<{ channelId: string; title: string; subscriberCount: number; type: string }> = [];
  
  // Search for different channel types
  const searchQueries = [
    `${artistName} official`,
    `${artistName} - Topic`,
    `${artistName}VEVO`,
    `${artistName}OfficialVEVO`
  ];

  for (const query of searchQueries) {
    try {
      const searchParams = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'channel',
        maxResults: '5',
        key: YOUTUBE_API_KEY
      });

      const searchResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${searchParams}`);
      if (!searchResponse.ok) continue;
      
      const searchData = await searchResponse.json();
      const foundChannels = searchData.items || [];
      
      if (foundChannels.length === 0) continue;

      // Get detailed channel information
      const channelIds = foundChannels.map((ch: any) => ch.id.channelId).join(',');
      const channelParams = new URLSearchParams({
        part: 'snippet,statistics',
        id: channelIds,
        key: YOUTUBE_API_KEY
      });

      const channelResponse = await fetch(`${YOUTUBE_CHANNELS_URL}?${channelParams}`);
      if (!channelResponse.ok) continue;

      const channelData = await channelResponse.json();
      const detailedChannels = channelData.items || [];

      for (const channel of detailedChannels) {
        const channelTitle = channel.snippet.title.toLowerCase();
        const artistLower = artistName.toLowerCase();
        const subscriberCount = parseInt(channel.statistics?.subscriberCount || '0');
        
        // Must contain artist name
        if (!channelTitle.includes(artistLower)) continue;
        
        let channelType = 'other';
        if (channelTitle.includes('- topic')) channelType = 'topic';
        else if (channelTitle.includes('vevo')) channelType = 'vevo';
        else if (channelTitle.includes('official') || channelTitle === artistLower) channelType = 'official';
        
        channels.push({
          channelId: channel.id,
          title: channel.snippet.title,
          subscriberCount,
          type: channelType
        });
      }
    } catch (error) {
      console.warn(`Failed to search for channels with query "${query}":`, error);
      continue;
    }
  }

  // Sort by priority: official > vevo > topic > other, then by subscriber count
  const typePriority = { official: 4, vevo: 3, topic: 2, other: 1 };
  return channels.sort((a, b) => {
    const priorityDiff = (typePriority[a.type as keyof typeof typePriority] || 0) - (typePriority[b.type as keyof typeof typePriority] || 0);
    if (priorityDiff !== 0) return -priorityDiff;
    return b.subscriberCount - a.subscriberCount;
  });
}

// Get uploads playlist ID from channel
async function getUploadsPlaylistId(channelId: string): Promise<string | null> {
  if (!YOUTUBE_API_KEY) return null;
  
  try {
    const params = new URLSearchParams({
      part: 'contentDetails',
      id: channelId,
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_CHANNELS_URL}?${params}`);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || null;
  } catch (error) {
    console.error('Error getting uploads playlist:', error);
    return null;
  }
}

// Get videos from uploads playlist
async function getPlaylistVideos(playlistId: string, maxResults: number = 50): Promise<any[]> {
  if (!YOUTUBE_API_KEY) return [];

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId: playlistId,
      maxResults: maxResults.toString(),
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`${YOUTUBE_PLAYLIST_ITEMS_URL}?${params}`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error getting playlist videos:', error);
    return [];
  }
}

// Convert playlist items to Song format
function playlistItemsToSongs(items: any[], artistName: string, decade: string): Song[] {
  return items.map(item => {
    const snippet = item.snippet;
    const videoId = snippet.resourceId.videoId;
    
    return {
      title: cleanVideoTitle(snippet.title),
      artist: artistName,
      decade: decade,
      year: new Date(snippet.publishedAt).getFullYear().toString(),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: snippet.thumbnails?.high?.url || 
                snippet.thumbnails?.medium?.url || 
                snippet.thumbnails?.default?.url || '',
      isOfficialSource: true
    };
  });
}

// Filter songs by genre (optional, non-strict)
function filterByGenre(songs: Song[], genre: string): Song[] {
  if (!genre) return songs;
  
  const genreKeywords = genre.toLowerCase().split(/[\s-]+/);
  const prioritized: Song[] = [];
  const others: Song[] = [];
  
  for (const song of songs) {
    const titleLower = song.title.toLowerCase();
    const hasGenreMatch = genreKeywords.some(keyword => titleLower.includes(keyword));
    
    if (hasGenreMatch) {
      prioritized.push(song);
    } else {
      others.push(song);
    }
  }
  
  // Return prioritized first, then others
  return [...prioritized, ...others];
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
  
  // Last resort: create generic songs
  const { startYear } = getDecadeYearBounds(decade);
  return Array.from({ length: 5 }, (_, i) => ({
    title: `${genre} Hit #${i + 1}`,
    artist: artistName || 'Various Artists',
    decade: decade,
    year: (startYear + i).toString(),
    url: 'https://youtube.com',
    thumbnail: '',
    isCustomPick: true
  }));
}

// Main recommendation function
export async function getMultipleRecommendations(genre: string, decade: string, artist?: string): Promise<Song[]> {
  console.log(`🎵 Getting recommendations for: ${artist || 'Various Artists'} - ${genre} - ${decade}`);
  
  if (!artist) {
    console.log('🎵 No artist specified, using fallback songs');
    return getFallbackSongs(genre, decade);
  }

  if (!YOUTUBE_API_KEY) {
    console.log('🎵 No API key, using fallback songs');
    return getFallbackSongs(genre, decade, artist);
  }

  const { startYear, endYear } = getDecadeYearBounds(decade);

  try {
    // Step 1: Find official channels
    console.log(`🔍 Finding official channels for ${artist}`);
    const channels = await findOfficialChannels(artist);
    
    if (channels.length === 0) {
      console.log('❌ No official channels found, using fallback');
      return getFallbackSongs(genre, decade, artist);
    }

    console.log(`✅ Found ${channels.length} channels:`, channels.map(c => `${c.title} (${c.type})`));

    // Step 2: Try each channel until we get enough songs
    for (const channel of channels) {
      console.log(`🎬 Checking channel: ${channel.title}`);
      
      const uploadsPlaylistId = await getUploadsPlaylistId(channel.channelId);
      if (!uploadsPlaylistId) {
        console.log('❌ No uploads playlist found');
        continue;
      }

      const playlistItems = await getPlaylistVideos(uploadsPlaylistId, 50);
      if (playlistItems.length === 0) {
        console.log('❌ No videos in playlist');
        continue;
      }

      console.log(`📹 Found ${playlistItems.length} videos in playlist`);

      // Convert to songs
      const allSongs = playlistItemsToSongs(playlistItems, artist, decade);
      
      // Filter by decade
      const decadeSongs = allSongs.filter(song => 
        isInDecade(new Date(song.year + '-01-01').toISOString(), startYear, endYear)
      );

      console.log(`📅 ${decadeSongs.length} songs match the decade ${decade}`);

      if (decadeSongs.length >= 5) {
        // We have enough songs from the decade
        const genreFiltered = filterByGenre(decadeSongs, genre);
        const result = genreFiltered.slice(0, 5);
        console.log(`✅ Returning ${result.length} songs from ${decade}`);
        return result;
      } else if (decadeSongs.length > 0) {
        // Some songs from decade, but not enough - supplement with latest
        const latestSongs = allSongs.slice(0, 5 - decadeSongs.length);
        const combined = [...decadeSongs, ...latestSongs];
        const genreFiltered = filterByGenre(combined, genre);
        const result = genreFiltered.slice(0, 5);
        console.log(`⚠️ Only ${decadeSongs.length} songs from decade, supplemented with latest tracks`);
        return result;
      } else {
        // No songs from decade, return latest 5
        const latestSongs = allSongs.slice(0, 5);
        const genreFiltered = filterByGenre(latestSongs, genre);
        if (genreFiltered.length >= 5) {
          console.log(`⚠️ No songs from ${decade}, returning latest official tracks`);
          return genreFiltered.slice(0, 5);
        }
      }
    }

    // If we get here, no channel had enough content
    console.log('❌ No channels had sufficient content, using fallback');
    return getFallbackSongs(genre, decade, artist);

  } catch (error) {
    console.error('❌ Error in getMultipleRecommendations:', error);
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