import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Loader2 } from 'lucide-react';

interface Song {
  title: string;
  artist: string;
  year: number;
  url: string;
  thumbnail?: string;
}

interface APIResponse {
  songs: Song[];
  isFallback?: boolean;
  message?: string;
}

const MusicTest: React.FC = () => {
  const [artist, setArtist] = useState('');
  const [startYear, setStartYear] = useState('2010');
  const [endYear, setEndYear] = useState('2020');
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const handleSearch = async () => {
    if (!artist.trim()) {
      setError('Please enter an artist name');
      return;
    }

    setLoading(true);
    setError(null);
    setSongs([]);
    setIsFallback(false);

    try {
      const params = new URLSearchParams({
        artist: artist.trim(),
        startYear,
        endYear,
        count: '5'
      });

      const response = await fetch(`http://localhost:3001/api/music?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data: APIResponse = await response.json();

      setSongs(data.songs || []);
      setIsFallback(data.isFallback || false);

      if (data.isFallback && data.message) {
        setError(data.message);
      }

    } catch (err) {
      setError('Could not connect to the server. Make sure the backend is running on port 3001.');
      console.error('Error fetching music:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayOnYouTube = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Music Discovery Test
          </h1>
          <p className="text-slate-400">
            Test the YouTube Music API integration
          </p>
        </div>

        <Card className="mb-8 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Search Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="artist" className="text-slate-300">
                Artist Name *
              </Label>
              <Input
                id="artist"
                placeholder="e.g., Michael Jackson, Beyonce, Drake..."
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="bg-slate-900/50 border-slate-600 text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startYear" className="text-slate-300">
                  Start Year
                </Label>
                <Input
                  id="startYear"
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endYear" className="text-slate-300">
                  End Year
                </Label>
                <Input
                  id="endYear"
                  type="number"
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                'Search Music'
              )}
            </Button>
          </CardContent>
        </Card>

        {isFallback && (
          <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400 text-center">
              ⚠️ {error || 'Showing fallback results'}
            </p>
          </div>
        )}

        {error && !isFallback && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400 text-center">
              {error}
            </p>
          </div>
        )}

        {songs.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              Found {songs.length} {songs.length === 1 ? 'Song' : 'Songs'}
            </h2>

            {songs.map((song, index) => (
              <Card key={index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-24 h-24 rounded-lg object-cover flex-shrink-0 shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                        <Play className="w-8 h-8 text-slate-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1 truncate">
                        {song.title}
                      </h3>
                      <p className="text-slate-400 mb-2">
                        {song.artist}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-slate-500">
                        <span>Year: {song.year}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => handlePlayOnYouTube(song.url)}
                      className="bg-red-600 hover:bg-red-700 flex-shrink-0"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play on YouTube Music
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && songs.length === 0 && !error && (
          <div className="text-center py-12">
            <p className="text-slate-400">
              Enter an artist name and click search to discover music
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicTest;
