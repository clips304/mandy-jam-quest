import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Music, Sparkles, Trash2 } from 'lucide-react';
import { Song } from '../types/game';

interface PlaylistProps {
  songs: Song[];
  onRemoveSong: (index: number) => void;
  onClearPlaylist: () => void;
}

const Playlist: React.FC<PlaylistProps> = ({ songs, onRemoveSong, onClearPlaylist }) => {
  const handlePlaySong = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="shadow-card glass-effect border-border/50 h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 gradient-primary bg-clip-text text-transparent">
          <Music className="w-5 h-5 text-neon-purple" />
          Mandy's Playlist
        </CardTitle>
        {songs.length > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              {songs.length} song{songs.length !== 1 ? 's' : ''} discovered
            </span>
            <Button
              onClick={onClearPlaylist}
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {songs.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Complete levels to discover amazing songs!</p>
          </div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-2 p-3">
              {songs.map((song, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-3 p-3 rounded-lg glass-effect border border-border/30 hover:border-border/60 transition-smooth"
                >
                  <div className="flex-shrink-0">
                    {song.thumbnail ? (
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-10 h-10 rounded object-cover shadow-game"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded gradient-secondary flex items-center justify-center shadow-game">
                        <Music className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {song.title}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {song.artist}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {song.decade}
                          </span>
                          {song.isCustomPick && (
                            <>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="flex items-center gap-1 text-xs text-neon-purple">
                                <Sparkles className="w-3 h-3" />
                                Custom
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                        <Button
                          onClick={() => handlePlaySong(song.url)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-neon-purple hover:text-neon-pink"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        
                        <Button
                          onClick={() => onRemoveSong(index)}
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default Playlist;