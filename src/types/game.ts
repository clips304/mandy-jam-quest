export interface Song {
  title: string;
  artist: string;
  decade?: string;
  genre?: string;
  year: number | string;
  url: string;
  thumbnail?: string;
  isCustomPick?: boolean;
  isOfficialSource?: boolean;
  isError?: boolean;
  isFallback?: boolean;
}

export interface GamePreferences {
  genre: string;
  decade: string;
  artist?: string;
}

export type GameState = 'idle' | 'playing' | 'paused' | 'gameover';
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}