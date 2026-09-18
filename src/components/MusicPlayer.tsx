import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

const TRACKS = [
  {
    id: 1,
    title: "Neon Dreams",
    artist: "SynthWave Pro",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    color: "#ff71ce"
  },
  {
    id: 2,
    title: "Midnight Drive",
    artist: "Retro Future",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    color: "#01cdfe"
  },
  {
    id: 3,
    title: "Digital Sunset",
    artist: "Vapor Boy",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    color: "#b967ff"
  }
];

export default function MusicPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(70);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Audio play blocked by browser policy"));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = (direction: 'next' | 'prev') => {
    let nextIndex = currentTrackIndex;
    if (direction === 'next') {
      nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    } else {
      nextIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    }
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
    // Audio will play in useEffect when track changes
  };

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(e => console.log("Audio play blocked"));
    }
  }, [currentTrackIndex]);

  const onTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const onEnded = () => {
    handleSkip('next');
  };

  return (
    <div className="w-full max-w-md p-6 neon-border bg-black/40 backdrop-blur-md rounded-2xl relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-right from-primary via-secondary to-accent animate-pulse" />
      
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={onTimeUpdate}
        onEnded={onEnded}
      />

      <div className="flex items-center gap-6">
        {/* Album Art Placeholder */}
        <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 neon-border">
          <div 
            className="absolute inset-0 opacity-40 animate-pulse"
            style={{ backgroundColor: currentTrack.color }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Music className="w-10 h-10 text-white opacity-80" />
          </div>
          {isPlaying && (
            <div className="absolute bottom-1 left-1 right-1 flex items-end justify-center gap-0.5 h-8">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [4, 24, 8, 20, 4] }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                  className="w-1.5 bg-white/80 rounded-t-sm"
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-primary truncate neon-glow uppercase tracking-tight">
            {currentTrack.title}
          </h3>
          <p className="text-sm text-muted-foreground truncate uppercase tracking-widest font-mono">
            {currentTrack.artist}
          </p>
          
          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSkip('prev')}
              className="text-muted-foreground hover:text-secondary hover:bg-secondary/10"
            >
              <SkipBack className="w-5 h-5" />
            </Button>
            
            <Button
              size="icon"
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground hover:scale-110 transition-transform neon-border"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleSkip('next')}
              className="text-muted-foreground hover:text-secondary hover:bg-secondary/10"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 space-y-2">
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={(vals) => {
            if (audioRef.current) {
              audioRef.current.currentTime = (vals[0] / 100) * audioRef.current.duration;
            }
          }}
          className="cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
          <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}</span>
          <span>{audioRef.current ? formatTime(audioRef.current.duration) : "0:00"}</span>
        </div>
      </div>

      {/* Volume */}
      <div className="mt-4 flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
        <Volume2 className="w-4 h-4 text-muted-foreground" />
        <Slider
          value={[volume]}
          max={100}
          onValueChange={(vals) => setVolume(vals[0])}
          className="w-24"
        />
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
