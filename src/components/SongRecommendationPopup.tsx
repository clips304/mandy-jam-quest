import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink, Plus, Play, RotateCcw, Sparkles, AlertCircle } from 'lucide-react';
import { Song } from '../types/game';

interface SongRecommendationPopupProps {
  songs: Song[];
  level: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onAddToPlaylist: (song: Song) => void;
}

const SongRecommendationPopup: React.FC<SongRecommendationPopupProps> = ({
  songs,
  level,
  onNextLevel,
  onRestart,
  onAddToPlaylist
}) => {
  const handleAddToPlaylist = (song: Song) => {
    onAddToPlaylist(song);
  };

  const handlePlayOnYouTube = (song: Song) => {
    if (song.url === 'https://youtube.com') {
      return; // Don't open placeholder URLs
    }
    window.open(song.url, '_blank', 'noopener,noreferrer');
  };

  // Check if we have no official songs
  const hasOfficialSongs = songs.length > 0 && songs[0].title !== 'No Official Content Available';
  return (
    <Dialog open={true} modal>
      <DialogContent className="sm:max-w-md glass-effect border-border/50 shadow-card">
        <DialogHeader>
          <DialogTitle className="text-center gradient-primary bg-clip-text text-transparent">
            🎉 Level {level} Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* No Official Content Message */}
          {!hasOfficialSongs && (
            <Card className="glass-effect border-border/50 border-yellow-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-yellow-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">No official uploads available</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      No verified official content found for this artist in the selected decade.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Limited Results Message */}
          {hasOfficialSongs && songs.length < 5 && (
            <Card className="glass-effect border-border/50 border-blue-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 text-blue-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Limited official content</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Only {songs.length} official song{songs.length !== 1 ? 's' : ''} found for this decade.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Song Cards */}
          {hasOfficialSongs && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
            {songs.map((song, index) => (
              <Card key={index} className="glass-effect border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-16 h-16 rounded-lg object-cover shadow-game flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg gradient-secondary flex items-center justify-center shadow-game flex-shrink-0">
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
                        <span>{song.year}</span>
                        <span>•</span>
                        <span>{song.decade}</span>
                        {song.isCustomPick && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-neon-purple">
                              <Sparkles className="w-3 h-3" />
                              Custom
                            </span>
                          </>
                        )}
                        {song.isOfficialSource && (
                          <>
                            <span>•</span>
                            <span className="text-green-400">Official</span>
                          </>
                        )}
                        {song.isOfficialSource === false && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-400">Unofficial</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Song Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => handlePlayOnYouTube(song)}
                      disabled={song.url === 'https://youtube.com'}
                      variant="game"
                      size="sm"
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    
                    <Button
                      onClick={() => handleAddToPlaylist(song)}
                      variant="secondary"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}

          {/* Message */}
          <div className="text-center text-sm text-muted-foreground">
            {hasOfficialSongs ? (
              <p>🎵 Here are {songs.length} official song{songs.length !== 1 ? 's' : ''} matching your taste!</p>
            ) : (
              <p>🎵 Try a different artist or decade for official recommendations!</p>
            )}
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