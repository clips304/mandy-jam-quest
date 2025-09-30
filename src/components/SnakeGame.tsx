import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pause, Play, RotateCcw } from 'lucide-react';
import SongRecommendationPopup from './SongRecommendationPopup';
import { GamePreferences } from './GameSetup';
import { Song } from '../types/game';
import { getMultipleRecommendations } from '../services/musicService';

interface SnakeGameProps {
  preferences: GamePreferences;
  onAddToPlaylist: (song: Song) => void;
  onRestart: () => void;
}

type GameState = 'idle' | 'playing' | 'paused' | 'gameover';
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const INITIAL_SPEED = 150;

const SnakeGame: React.FC<SnakeGameProps> = ({ preferences, onAddToPlaylist, onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  
  const [gameState, setGameState] = useState<GameState>('idle');
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const [levelCompleted, setLevelCompleted] = useState(false);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [currentSongs, setCurrentSongs] = useState<Song[]>([]);
  const [isLoadingSong, setIsLoadingSong] = useState(false);

  const levelTarget = level * 10;

  // Reset snake to safe position
  const resetSnake = useCallback(() => {
    const newSnake = [{ x: 10, y: 10 }];
    setSnake(newSnake);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    generateFood(newSnake);
  }, []);

  // Generate food at random position not occupied by snake
  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    setFood(newFood);
  }, []);

  // Check collision with walls or self
  const checkCollision = useCallback((head: Position, snakeBody: Position[]) => {
    // Wall collision
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
      return true;
    }
    
    // Self collision
    return snakeBody.some(segment => segment.x === head.x && segment.y === head.y);
  }, []);

  // Move snake
  const moveSnake = useCallback(() => {
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Update direction
      const currentDirection = nextDirection;
      setDirection(currentDirection);
      
      // Move head
      switch (currentDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }
      
      // Check collision
      if (checkCollision(head, newSnake)) {
        setGameState('gameover');
        return currentSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => prev + 1);
        generateFood(newSnake);
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [nextDirection, food, checkCollision, generateFood]);

  // Check level completion
  const checkLevelUp = useCallback(async () => {
    if (score >= levelTarget && !levelCompleted && gameState === 'playing') {
      setLevelCompleted(true);
      setGameState('paused');
      setIsLoadingSong(true);

      try {
        const songs = await getMultipleRecommendations(preferences.genre, preferences.decade, preferences.artist);

        if (songs.length > 0) {
          setCurrentSongs(songs);
        } else {
          const fallbackSongs: Song[] = [{
            title: `🎵 Music recommendations are temporarily unavailable. Please make sure the backend server is running at http://localhost:3001`,
            artist: "System Message",
            decade: preferences.decade,
            year: new Date().getFullYear().toString(),
            url: "#",
            thumbnail: "",
            isError: true
          }];
          setCurrentSongs(fallbackSongs);
        }
        setShowRecommendation(true);
      } catch (error) {
        console.error('Error getting recommendations:', error);
        const fallbackSongs: Song[] = [{
          title: `🎵 Unable to connect to music server. Please start the backend server with 'cd server && npm start'`,
          artist: "Connection Error",
          decade: preferences.decade,
          year: new Date().getFullYear().toString(),
          url: "#",
          thumbnail: "",
          isError: true
        }];
        setCurrentSongs(fallbackSongs);
        setShowRecommendation(true);
      } finally {
        setIsLoadingSong(false);
      }
    }
  }, [score, levelTarget, levelCompleted, gameState, preferences]);

  // Game loop
  const gameTick = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };
      
      // Update direction
      setDirection(nextDirection);
      
      // Move head
      switch (nextDirection) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }
      
      // Check collision with walls
      if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE || 
          head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        setGameState('gameover');
        return currentSnake;
      }
      
      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameState('gameover');
        return currentSnake;
      }
      
      newSnake.unshift(head);
      
      // Check food collision
      setFood(currentFood => {
        if (head.x === currentFood.x && head.y === currentFood.y) {
          setScore(prev => prev + 1);
          
          // Generate new food
          let newFood: Position;
          do {
            newFood = {
              x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
              y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
            };
          } while (newSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
          
          return newFood;
        } else {
          newSnake.pop();
          return currentFood;
        }
      });
      
      return newSnake;
    });
  }, [gameState, nextDirection]);

  // Start game loop
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    gameLoopRef.current = window.setInterval(gameTick, speed);
  }, [gameTick, speed]);

  // Start game
  const startGame = useCallback(() => {
    setGameState('playing');
    startGameLoop();
  }, [startGameLoop]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    if (gameState === 'playing') {
      setGameState('paused');
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    } else if (gameState === 'paused' && !showRecommendation) {
      setGameState('playing');
      startGameLoop();
    }
  }, [gameState, showRecommendation, startGameLoop]);

  // Handle next level
  const handleNextLevel = useCallback(() => {
    setShowRecommendation(false);
    setLevel(prev => prev + 1);
    setSpeed(prev => Math.max(50, prev - 12)); // Increase speed, minimum 50ms
    setLevelCompleted(false);
    resetSnake();
    setGameState('playing');
    startGameLoop();
  }, [resetSnake, startGameLoop]);

  // Restart game
  const handleRestart = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    setScore(0);
    setLevel(1);
    setSpeed(INITIAL_SPEED);
    setLevelCompleted(false);
    setShowRecommendation(false);
    setCurrentSongs([]);
    resetSnake();
    setGameState('idle');
  }, [resetSnake]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const key = e.key;
      const currentDir = direction;
      
      switch (key) {
        case 'ArrowUp':
          if (currentDir !== 'DOWN') setNextDirection('UP');
          break;
        case 'ArrowDown':
          if (currentDir !== 'UP') setNextDirection('DOWN');
          break;
        case 'ArrowLeft':
          if (currentDir !== 'RIGHT') setNextDirection('LEFT');
          break;
        case 'ArrowRight':
          if (currentDir !== 'LEFT') setNextDirection('RIGHT');
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState, direction, togglePause]);

  // Check level completion
  useEffect(() => {
    checkLevelUp();
  }, [checkLevelUp]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // Draw grid
    ctx.strokeStyle = '#1a1a3a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= CANVAS_SIZE; i += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_SIZE);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_SIZE, i);
      ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
      const gradient = ctx.createLinearGradient(
        segment.x * GRID_SIZE, segment.y * GRID_SIZE,
        segment.x * GRID_SIZE + GRID_SIZE, segment.y * GRID_SIZE + GRID_SIZE
      );
      
      if (index === 0) {
        // Head
        gradient.addColorStop(0, '#a855f7');
        gradient.addColorStop(1, '#ec4899');
      } else {
        // Body
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(1, '#a855f7');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });
    
    // Draw food
    const foodGradient = ctx.createRadialGradient(
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      0,
      food.x * GRID_SIZE + GRID_SIZE / 2,
      food.y * GRID_SIZE + GRID_SIZE / 2,
      GRID_SIZE / 2
    );
    foodGradient.addColorStop(0, '#10b981');
    foodGradient.addColorStop(1, '#059669');
    
    ctx.fillStyle = foodGradient;
    ctx.fillRect(
      food.x * GRID_SIZE + 2,
      food.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );
  }, [snake, food]);

  // Start game loop when state changes to playing
  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
    } else if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState, startGameLoop]);

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 neon-text gradient-primary bg-clip-text text-transparent">
            ✨ Mandy's Music Quest ✨
          </h1>
          <p className="text-sm text-muted-foreground mb-2">Made for Mandy 💙</p>
          <p className="text-muted-foreground">
            {preferences.genre} • {preferences.decade} 
            {preferences.artist && ` • ${preferences.artist}`}
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-4">
            <Card className="shadow-card glass-effect border-border/50">
              <CardContent className="p-6">
                {/* Game Stats */}
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Score:</span>
                      <span className="ml-2 font-bold text-neon-purple">{score}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Level:</span>
                      <span className="ml-2 font-bold text-neon-pink">{level}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Target:</span>
                      <span className="ml-2 font-bold text-neon-blue">{levelTarget}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {gameState === 'idle' && (
                      <Button onClick={startGame} variant="game" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Start
                      </Button>
                    )}
                    
                    {(gameState === 'playing' || gameState === 'paused') && !showRecommendation && (
                      <Button onClick={togglePause} variant="secondary" size="sm">
                        {gameState === 'playing' ? (
                          <><Pause className="w-4 h-4 mr-2" />Pause</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" />Resume</>
                        )}
                      </Button>
                    )}
                    
                    <Button onClick={handleRestart} variant="outline" size="sm">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restart
                    </Button>
                    
                    <Button onClick={onRestart} variant="ghost" size="sm">
                      New Game
                    </Button>
                  </div>
                </div>

                {/* Game Canvas */}
                <div className="flex justify-center">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      width={CANVAS_SIZE}
                      height={CANVAS_SIZE}
                      className="border border-border/50 rounded-lg shadow-game"
                    />
                    
                    {/* Game Over Overlay */}
                    {gameState === 'gameover' && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold mb-2 text-destructive">Game Over, Mandy!</div>
                          <div className="text-lg mb-4">Your Final Score: {score}</div>
                          <Button onClick={handleRestart} variant="game">
                            Try Again, Mandy! 🎮
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Loading Overlay */}
                    {isLoadingSong && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <div className="text-lg mb-2">🎵 Finding your perfect song, Mandy...</div>
                          <div className="animate-pulse text-neon-purple">Searching the music world just for you...</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Use arrow keys to move • Spacebar to pause
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Song Recommendation Popup */}
      {showRecommendation && currentSongs.length > 0 && (
        <SongRecommendationPopup
          songs={currentSongs}
          level={level}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          onAddToPlaylist={onAddToPlaylist}
        />
      )}
    </div>
  );
};

export default SnakeGame;