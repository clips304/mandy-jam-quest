import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Plus, Play, RotateCcw, Sparkles } from 'lucide-react';
import { Song } from '../types/game';

interface SongRecommendationPopupProps {
  song: Song;
  level: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onAddToPlaylist: (song: Song) => void;
}

const SongRecommendationPopup: React.FC<SongRecommendationPopupProps> = ({
  song,
  level,
  onNextLevel,
  onRestart,
  onAddToPlaylist
}) => {
  const handleAddToPlaylist = () => {
    onAddToPlaylist(song);
  };

  const handlePlayOnYouTube = () => {
    window.open(song.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={true} modal>
      <DialogContent className="sm:max-w-md glass-effect border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="text-center gradient-primary bg-clip-text text-transparent">
            🎉 Level {level} Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Song Card */}
          <Card className="glass-effect border-border/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {song.thumbnail ? (
                  <img
                    src={song.thumbnail}
                    alt={song.title}
                    className="w-16 h-16 rounded-lg object-cover shadow-game"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg gradient-secondary flex items-center justify-center shadow-game">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground mb-1 truncate">
                    {song.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1 truncate">
                    {song.artist}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{song.decade}</span>
                    {song.isCustomPick && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-neon-purple">
                          <Sparkles className="w-3 h-3" />
                          Custom Pick
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Song Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handlePlayOnYouTube}
                  variant="game"
                  size="sm"
                  className="flex-1"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Play on YouTube
                </Button>
                
                <Button
                  onClick={handleAddToPlaylist}
                  variant="secondary"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Playlist
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Message */}
          <div className="text-center text-sm text-muted-foreground">
            <p>🎵 This song matches your taste for <strong>{song.decade}</strong> music!</p>
            <p className="mt-1">Ready for the next level?</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onNextLevel}
              variant="game"
              size="lg"
              className="flex-1 transition-bounce"
            >
              Next Level 🚀
            </Button>
            
            <Button
              onClick={onRestart}
              variant="outline"
              size="lg"
              className="glass-effect border-border/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Restart
            </Button>
          </div>

          {/* Level Progress */}
          <div className="text-center">
            <div className="text-xs text-muted-foreground mb-2">Level Progress</div>
            <div className="flex justify-center space-x-1">
              {Array.from({ length: Math.min(level, 5) }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < level ? 'bg-neon-purple shadow-neon' : 'bg-muted'
                  }`}
                />
              ))}
              {level > 5 && (
                <span className="text-xs text-neon-purple ml-2">+{level - 5}</span>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SongRecommendationPopup;