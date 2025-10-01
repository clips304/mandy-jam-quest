import React, { useState, useEffect } from 'react';
import GameSetup, { GamePreferences } from './GameSetup.tsx';
import SnakeGame from './SnakeGame.tsx';
import Playlist from './Playlist.tsx';
import { Song } from '../types/game.ts';

type AppState = 'setup' | 'playing';

const MusicQuest: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [gamePreferences, setGamePreferences] = useState<GamePreferences | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);

  // Load playlist from localStorage on mount
  useEffect(() => {
    const savedPlaylist = localStorage.getItem('mandys-playlist');
    if (savedPlaylist) {
      try {
        const parsedPlaylist = JSON.parse(savedPlaylist);
        setPlaylist(parsedPlaylist);
      } catch (error) {
        console.error('Error loading playlist from localStorage:', error);
      }
    }
  }, []);

  // Save playlist to localStorage whenever it changes
  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem('mandys-playlist', JSON.stringify(playlist));
    }
  }, [playlist]);

  const handleStartGame = (preferences: GamePreferences) => {
    setGamePreferences(preferences);
    setAppState('playing');
  };

  const handleRestart = () => {
    setAppState('setup');
    setGamePreferences(null);
  };

  const handleAddToPlaylist = (song: Song) => {
    // Check if song already exists in playlist
    const exists = playlist.some(
      existing => existing.title === song.title && existing.artist === song.artist
    );
    
    if (!exists) {
      setPlaylist(prev => [...prev, song]);
    }
  };

  const handleRemoveSong = (index: number) => {
    setPlaylist(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearPlaylist = () => {
    setPlaylist([]);
    localStorage.removeItem('mandys-playlist');
  };

  if (appState === 'setup') {
    return (
      <div className="min-h-screen">
        <GameSetup onStartGame={handleStartGame} />
        
        {/* Show playlist in setup if it exists */}
        {playlist.length > 0 && (
          <div className="fixed top-4 right-4 w-80 max-h-96 z-10">
            <Playlist
              songs={playlist}
              onRemoveSong={handleRemoveSong}
              onClearPlaylist={handleClearPlaylist}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="grid lg:grid-cols-4 gap-6 p-4">
        {/* Game Area */}
        <div className="lg:col-span-3">
          {gamePreferences && (
            <SnakeGame
              preferences={gamePreferences}
              onAddToPlaylist={handleAddToPlaylist}
              onRestart={handleRestart}
            />
          )}
        </div>
        
        {/* Playlist Sidebar */}
        <div className="lg:col-span-1">
          <Playlist
            songs={playlist}
            onRemoveSong={handleRemoveSong}
            onClearPlaylist={handleClearPlaylist}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicQuest;