# Mandy's Music Quest - Setup Instructions

## Overview
Mandy's Music Quest is a Snake game where each level completion reveals personalized song recommendations from YouTube. The game combines classic Snake gameplay with music discovery.

## Features
- ✅ Classic Snake game with smooth controls
- ✅ Genre and decade-based music preferences
- ✅ Level progression system (10 points per level)
- ✅ Song recommendations with YouTube integration
- ✅ Persistent playlist storage
- ✅ Fallback curated music library
- ✅ Responsive design with gaming aesthetics

## Quick Start (Frontend Only)
1. The game is ready to play immediately
2. Choose your music preferences (Genre + Decade + optional Artist)
3. Use arrow keys to play Snake
4. Complete levels to unlock song recommendations

## YouTube API Integration (Optional)

### Method 1: Server Proxy (Recommended for Production)
Create a simple Node.js server:

```javascript
// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; // Set this environment variable

app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    const params = new URLSearchParams({
      part: 'snippet',
      q: q,
      type: 'video',
      videoCategoryId: '10',
      maxResults: '5',
      key: YOUTUBE_API_KEY
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Music service running on port 3001');
});
```

Then update `src/services/musicService.ts` to use your server endpoint.

### Method 2: Client-Side API Key (Testing Only)
1. Get a YouTube Data API v3 key from [Google Cloud Console](https://console.cloud.google.com/)
2. Restrict the key to YouTube Data API v3 only
3. Add HTTP referrer restrictions for your domain
4. Update the `YOUTUBE_API_KEY` constant in `src/services/musicService.ts`

**⚠️ Warning**: Never commit API keys to version control in production!

## Game Mechanics

### Controls
- **Arrow Keys**: Move snake (Up, Down, Left, Right)
- **Spacebar**: Pause/Resume game
- **Mouse**: Navigate UI and buttons

### Level System
- Level 1 target: 10 points
- Level 2 target: 20 points
- Level N target: N × 10 points
- Speed increases by ~8% each level

### Song Recommendations
- **With Artist**: Searches for "{artist} {genre} {decade} official"
- **Without Artist**: Searches for "{genre} {decade} best songs OR classics"
- **Fallback**: Uses curated library if API fails
- **Custom Pick**: Shows user's typed artist if not found

## Supported Genres
R&B, Hip-Hop, Rock, Pop, Jazz, Soul, Funk, Reggae, EDM, Afrobeat, Country, Piano, AmaPiano

## Supported Decades
1950–1960, 1960–1970, 1970–1980, 1980–1990, 1990–2000, 2000–2010, 2010–2020, 2020–Present

## Architecture

### Key Components
- `GameSetup.tsx`: Music preference selection
- `SnakeGame.tsx`: Main game engine and canvas
- `SongRecommendationPopup.tsx`: Level completion popup
- `Playlist.tsx`: Discovered songs sidebar
- `MusicQuest.tsx`: Main app state manager

### Services
- `musicService.ts`: YouTube API integration and fallback library
- `types/game.ts`: TypeScript interfaces

### Game State Management
- Proper pause/resume with interval management
- Level completion detection with `>=` and boolean flags
- Safe snake reset to prevent instant collisions
- localStorage playlist persistence

## Troubleshooting

### Common Issues
1. **Game freezes after level**: Check `levelCompleted` boolean logic
2. **No song recommendations**: Verify API key or check fallback library
3. **Snake moves too fast**: Adjust speed calculation in `handleNextLevel`
4. **Playlist not saving**: Check localStorage permissions

### Debug Mode
Add `?debug=true` to URL for console logging of game events.

## Deployment
1. Build the project: `npm run build`
2. Serve the `dist` folder with any static hosting
3. For YouTube API, deploy the server proxy and update service URLs

## Credits
- Built with React, TypeScript, and Tailwind CSS
- Uses shadcn/ui components
- YouTube Data API v3 for music recommendations