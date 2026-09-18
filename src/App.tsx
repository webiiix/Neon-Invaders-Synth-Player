import React from 'react';
import SpaceInvaders from './components/SpaceInvaders';
import MusicPlayer from './components/MusicPlayer';
import { motion } from 'motion/react';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-background relative flex flex-col items-center justify-center p-4 md:p-8 scanlines">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-[100%] origin-bottom"
          style={{ 
            transform: 'perspective(500px) rotateX(60deg) translateX(-25%)',
            background: `
              linear-gradient(transparent 0%, oklch(0.7 0.25 340 / 0.1) 1px, transparent 1px),
              linear-gradient(90deg, transparent 0%, oklch(0.7 0.25 340 / 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background opacity-80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
        
        {/* Left Sidebar - Stats/Info */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:flex flex-col gap-6 w-64"
        >
          <div className="p-6 neon-border bg-black/40 backdrop-blur-md rounded-2xl">
            <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-mono">System Status</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-primary">Engine</span>
                <span className="text-[10px] font-mono text-secondary">STABLE</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase text-primary">Sync</span>
                <span className="text-[10px] font-mono text-secondary">ACTIVE</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: ['20%', '80%', '40%', '90%'] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="h-full bg-primary shadow-[0_0_10px_rgba(255,113,206,0.5)]"
                />
              </div>
            </div>
          </div>

          <div className="p-6 neon-border bg-black/40 backdrop-blur-md rounded-2xl">
            <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-mono">Mission Log</h2>
            <p className="text-[10px] leading-relaxed text-secondary/80 font-mono uppercase">
              Intercept the digital invaders. Protect the synth-core. 
              High frequency signals detected in sector 80.
            </p>
          </div>
        </motion.div>

        {/* Center - Game */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex-1 flex flex-col items-center gap-8"
        >
          <header className="text-center space-y-2">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase italic neon-glow text-primary">
              Neon <span className="text-secondary">Invaders</span>
            </h1>
            <p className="text-xs md:text-sm uppercase tracking-[0.5em] text-accent font-mono">
              Retro-Future Defense System v1.0
            </p>
          </header>

          <SpaceInvaders />
          
          {/* Mobile Music Player (visible only on small screens) */}
          <div className="lg:hidden w-full">
            <MusicPlayer />
          </div>
        </motion.div>

        {/* Right Sidebar - Music Player (Desktop) */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="hidden lg:block w-80"
        >
          <div className="sticky top-8">
            <MusicPlayer />
            
            <div className="mt-8 p-6 neon-border bg-black/40 backdrop-blur-md rounded-2xl">
              <h2 className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4 font-mono">Controls</h2>
              <div className="grid grid-cols-2 gap-4 text-[9px] uppercase font-mono text-secondary/60">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 border border-secondary/30 rounded">A/D</span>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 border border-secondary/30 rounded">SPACE</span>
                  <span>Fire</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 border border-secondary/30 rounded">ARROWS</span>
                  <span>Move</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 border border-secondary/30 rounded">ESC</span>
                  <span>Pause</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <footer className="mt-12 relative z-10 flex flex-col items-center gap-2 opacity-30 hover:opacity-100 transition-opacity duration-500">
        <div className="h-[1px] w-32 bg-gradient-to-r from-transparent via-primary to-transparent" />
        <p className="text-[9px] uppercase tracking-[0.8em] font-mono text-muted-foreground">
          EST. 198X • VAPORWAVE CORP
        </p>
      </footer>
    </div>
  );
}
