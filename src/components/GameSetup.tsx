import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameSetupProps {
  onStartGame: (preferences: GamePreferences) => void;
}

export interface GamePreferences {
  genre: string;
  decade: string;
  artist?: string;
}

const genres = [
  'R&B', 'Hip-Hop', 'Rock', 'Pop', 'Jazz', 'Soul', 'Funk', 
  'Reggae', 'EDM', 'Afrobeat', 'Country', 'Piano', 'AmaPiano'
];

const decades = [
  '1950–1960', '1960–1970', '1970–1980', '1980–1990', 
  '1990–2000', '2000–2010', '2010–2020', '2020–Present'
];

const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [preferences, setPreferences] = useState<GamePreferences>({
    genre: '',
    decade: '',
    artist: ''
  });

  const handleStartGame = () => {
    if (preferences.genre && preferences.decade) {
      onStartGame(preferences);
    }
  };

  const isValid = preferences.genre && preferences.decade;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 neon-text gradient-primary bg-clip-text text-transparent">
            Mandy's Music Quest
          </h1>
          <p className="text-muted-foreground text-lg">
            Snake meets Music Discovery
          </p>
        </div>

        {/* Setup Card */}
        <Card className="shadow-card glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="text-center gradient-primary bg-clip-text text-transparent">
              Choose Your Musical Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Genre Selection */}
            <div className="space-y-2">
              <Label htmlFor="genre" className="text-sm font-medium">
                Genre *
              </Label>
              <Select
                value={preferences.genre}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, genre: value }))}
              >
                <SelectTrigger className="glass-effect border-border/50">
                  <SelectValue placeholder="Select a genre" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border/50">
                  {genres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Decade Selection */}
            <div className="space-y-2">
              <Label htmlFor="decade" className="text-sm font-medium">
                Decade *
              </Label>
              <Select
                value={preferences.decade}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, decade: value }))}
              >
                <SelectTrigger className="glass-effect border-border/50">
                  <SelectValue placeholder="Select a decade" />
                </SelectTrigger>
                <SelectContent className="glass-effect border-border/50">
                  {decades.map((decade) => (
                    <SelectItem key={decade} value={decade}>
                      {decade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Artist Input */}
            <div className="space-y-2">
              <Label htmlFor="artist" className="text-sm font-medium">
                Artist (Optional)
              </Label>
              <Input
                id="artist"
                placeholder="e.g., Michael Jackson, The Beatles..."
                value={preferences.artist}
                onChange={(e) => setPreferences(prev => ({ ...prev, artist: e.target.value }))}
                className="glass-effect border-border/50"
              />
            </div>

            {/* Start Button */}
            <Button
              onClick={handleStartGame}
              disabled={!isValid}
              variant="game"
              size="lg"
              className="w-full"
            >
              Start Musical Adventure
            </Button>

            {/* Instructions */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p>🐍 Use arrow keys to move</p>
              <p>🎵 Complete levels to unlock songs</p>
              <p>🎯 Reach the target score to advance</p>
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ Only official artist uploads from the selected decade will be shown
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GameSetup;