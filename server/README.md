# YouTube Official Songs API Server

A robust Node.js server that provides official music video recommendations from YouTube Data API v3.

## Features

- **Official Sources Only**: Searches Official channels, VEVO channels, and YouTube Topic channels
- **Accurate Release Years**: Filters by decade using actual video publish dates
- **Music Content Only**: Excludes interviews, live bootlegs, fan uploads, and random videos
- **Smart Fallbacks**: Returns latest official songs if decade-specific content isn't available
- **Rate Limit Handling**: Graceful error handling and API quota management
- **Guaranteed Results**: Always returns meaningful content, never empty responses

## Setup

1. **Install Dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Configure YouTube API Key**:
   - Get a YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com/)
   - Set environment variable:
     ```bash
     export YOUTUBE_API_KEY="your_api_key_here"
     ```
   - Or edit `server/index.js` and set the `YOUTUBE_API_KEY` constant

3. **Start Server**:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Test the API**:
   - Open `client-example.html` in your browser
   - Or use curl:
     ```bash
     curl "http://localhost:3001/api/youtube/official-songs?artist=Drake&genre=hip-hop&startYear=2020&endYear=2024&count=5"
     ```

## API Endpoints

### GET /api/youtube/official-songs

Returns official music videos from YouTube.

**Query Parameters**:
- `artist` (string, optional): Artist name to search for
- `genre` (string, optional): Music genre filter
- `startYear` (integer, optional): Start year for decade filtering
- `endYear` (integer, optional): End year for decade filtering  
- `count` (integer, optional): Number of songs to return (default: 5)

**Response Format**:
```json
{
  "results": [
    {
      "title": "Song Title",
      "artist": "Artist Name", 
      "year": "2023",
      "url": "https://www.youtube.com/watch?v=VIDEO_ID",
      "thumbnail": "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg",
      "sourceChannelId": "UCxxxx",
      "official": true
    }
  ],
  "message": "Found 5 official songs."
}
```

### GET /api/health

Health check endpoint.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z", 
  "youtubeApiConfigured": true
}
```

## Examples

### Artist-Specific Search
```bash
curl "http://localhost:3001/api/youtube/official-songs?artist=Taylor%20Swift&genre=pop&startYear=2010&endYear=2019&count=10"
```

### General Genre Search  
```bash
curl "http://localhost:3001/api/youtube/official-songs?genre=jazz&startYear=1950&endYear=1959&count=5"
```

### Latest Songs (No Decade Filter)
```bash
curl "http://localhost:3001/api/youtube/official-songs?artist=Drake&count=5"
```

## How It Works

1. **Channel Discovery**: Searches for official channels using artist name + "official"
2. **Channel Ranking**: Prioritizes by type (Official > VEVO > Topic) and subscriber count
3. **Video Collection**: Fetches videos from uploads playlists (up to 200 per channel)
4. **Content Filtering**: Excludes non-music content using title/description analysis
5. **Decade Filtering**: Uses `publishedAt` to match requested time periods
6. **Quality Scoring**: Ranks by decade match, music category, view count, and recency
7. **Smart Fallbacks**: Returns latest official content if decade-specific songs unavailable

## Content Filtering

The server automatically excludes:
- Lyric videos
- Live performances (unless official)
- Cover versions
- Interviews and documentaries
- Reaction videos
- Shorts and snippets
- Fan uploads and reuploads
- Videos under 30 seconds or over 10 minutes

## Error Handling

- **API Quota Exceeded**: Returns cached/fallback results
- **Network Errors**: Graceful degradation with error messages
- **No Results Found**: Clear explanatory messages
- **Invalid Parameters**: Helpful validation errors

## Performance

- **Batch Processing**: Processes video details in batches of 50
- **Smart Pagination**: Limits playlist scanning to 200 items per channel
- **Efficient Filtering**: Multi-stage filtering to reduce API calls
- **Caching Ready**: Structured for easy caching implementation

## Security

- **Server-Side Only**: YouTube API key never exposed to client
- **CORS Enabled**: Allows cross-origin requests for web apps
- **Input Validation**: Sanitizes and validates all query parameters
- **Rate Limiting**: Built-in protection against API quota exhaustion

## Integration

To integrate with your existing music app:

1. **Update Music Service**: Replace direct YouTube API calls with server requests
2. **Handle Responses**: Process the standardized JSON response format  
3. **Error Handling**: Implement fallbacks for server unavailability
4. **Caching**: Add client-side caching for better performance

Example integration:
```javascript
async function getOfficialSongs(artist, genre, decade) {
  const response = await fetch(`http://localhost:3001/api/youtube/official-songs?artist=${artist}&genre=${genre}&startYear=${decade.start}&endYear=${decade.end}`);
  const data = await response.json();
  return data.results;
}
```