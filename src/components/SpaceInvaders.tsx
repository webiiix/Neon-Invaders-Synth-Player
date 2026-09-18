import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface GameState {
  score: number;
  highScore: number;
  lives: number;
  gameOver: boolean;
  level: number;
  isPaused: boolean;
}

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 500;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 20;
const INVADER_WIDTH = 30;
const INVADER_HEIGHT = 20;
const PROJECTILE_RADIUS = 3;

export default function SpaceInvaders() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    highScore: parseInt(localStorage.getItem('highScore') || '0'),
    lives: 3,
    gameOver: false,
    level: 1,
    isPaused: true,
  });

  const requestRef = useRef<number>(null);
  const playerX = useRef(CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2);
  const projectiles = useRef<{ x: number; y: number; dy: number }[]>([]);
  const invaders = useRef<{ x: number; y: number; alive: boolean; type: number }[]>([]);
  const invaderDirection = useRef(1);
  const invaderStep = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  const lastShot = useRef(0);

  const initInvaders = useCallback((level: number) => {
    const rows = 4;
    const cols = 8;
    const spacing = 15;
    const startX = (CANVAS_WIDTH - (cols * (INVADER_WIDTH + spacing))) / 2;
    const startY = 50;

    const newInvaders = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newInvaders.push({
          x: startX + c * (INVADER_WIDTH + spacing),
          y: startY + r * (INVADER_HEIGHT + spacing),
          alive: true,
          type: r % 3,
        });
      }
    }
    invaders.current = newInvaders;
    invaderDirection.current = 1;
    invaderStep.current = 0;
  }, []);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      score: 0,
      lives: 3,
      gameOver: false,
      level: 1,
      isPaused: false,
    }));
    playerX.current = CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2;
    projectiles.current = [];
    initInvaders(1);
  };

  const startGame = () => {
    setGameState(prev => ({ ...prev, isPaused: false }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (e.code === 'Space' && !gameState.isPaused && !gameState.gameOver) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.isPaused, gameState.gameOver]);

  const enemyProjectiles = useRef<{ x: number; y: number; dy: number }[]>([]);

  const update = useCallback((time: number) => {
    if (gameState.isPaused || gameState.gameOver) return;

    // Player Movement
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
      playerX.current = Math.max(0, playerX.current - 5);
    }
    if (keys.current['ArrowRight'] || keys.current['KeyD']) {
      playerX.current = Math.min(CANVAS_WIDTH - PLAYER_WIDTH, playerX.current + 5);
    }

    // Shooting
    if (keys.current['Space'] && time - lastShot.current > 400) {
      projectiles.current.push({
        x: playerX.current + PLAYER_WIDTH / 2,
        y: CANVAS_HEIGHT - PLAYER_HEIGHT - 10,
        dy: -7,
      });
      lastShot.current = time;
    }

    // Projectiles update
    projectiles.current = projectiles.current.filter(p => {
      p.y += p.dy;
      return p.y > 0;
    });

    enemyProjectiles.current = enemyProjectiles.current.filter(p => {
      p.y += p.dy;
      return p.y < CANVAS_HEIGHT;
    });

    // Invaders movement
    invaderStep.current += 1;
    const speed = Math.max(1, 10 - gameState.level);
    if (invaderStep.current % (speed * 5) === 0) {
      let hitEdge = false;
      invaders.current.forEach(inv => {
        if (!inv.alive) return;
        inv.x += invaderDirection.current * 10;
        if (inv.x <= 10 || inv.x >= CANVAS_WIDTH - INVADER_WIDTH - 10) {
          hitEdge = true;
        }

        // Randomly shoot
        if (Math.random() < 0.02 * gameState.level) {
          enemyProjectiles.current.push({
            x: inv.x + INVADER_WIDTH / 2,
            y: inv.y + INVADER_HEIGHT,
            dy: 3 + gameState.level * 0.5,
          });
        }
      });

      if (hitEdge) {
        invaderDirection.current *= -1;
        invaders.current.forEach(inv => {
          inv.y += 15;
          if (inv.alive && inv.y >= CANVAS_HEIGHT - PLAYER_HEIGHT - 40) {
            setGameState(prev => ({ ...prev, gameOver: true }));
          }
        });
      }
    }

    // Collision Detection: Player bullets vs Invaders
    projectiles.current.forEach((p, pIdx) => {
      invaders.current.forEach((inv, iIdx) => {
        if (inv.alive && 
            p.x > inv.x && p.x < inv.x + INVADER_WIDTH &&
            p.y > inv.y && p.y < inv.y + INVADER_HEIGHT) {
          inv.alive = false;
          projectiles.current.splice(pIdx, 1);
          setGameState(prev => {
            const newScore = prev.score + 100;
            const newHighScore = Math.max(newScore, prev.highScore);
            if (newHighScore > prev.highScore) {
              localStorage.setItem('highScore', newHighScore.toString());
            }
            return { ...prev, score: newScore, highScore: newHighScore };
          });
        }
      });
    });

    // Collision Detection: Enemy bullets vs Player
    enemyProjectiles.current.forEach((p, pIdx) => {
      if (p.x > playerX.current && p.x < playerX.current + PLAYER_WIDTH &&
          p.y > CANVAS_HEIGHT - PLAYER_HEIGHT - 20 && p.y < CANVAS_HEIGHT - 10) {
        enemyProjectiles.current.splice(pIdx, 1);
        setGameState(prev => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            return { ...prev, lives: 0, gameOver: true };
          }
          return { ...prev, lives: newLives };
        });
      }
    });

    // Check Level Clear
    if (invaders.current.length > 0 && invaders.current.every(inv => !inv.alive)) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff71ce', '#01cdfe', '#b967ff']
      });
      setGameState(prev => ({ ...prev, level: prev.level + 1 }));
      initInvaders(gameState.level + 1);
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      // Clear
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw Player
      ctx.fillStyle = '#01cdfe'; // Cyan
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#01cdfe';
      ctx.fillRect(playerX.current, CANVAS_HEIGHT - PLAYER_HEIGHT - 10, PLAYER_WIDTH, PLAYER_HEIGHT);
      ctx.fillRect(playerX.current + PLAYER_WIDTH / 2 - 5, CANVAS_HEIGHT - PLAYER_HEIGHT - 20, 10, 10);

      // Draw Invaders
      invaders.current.forEach(inv => {
        if (!inv.alive) return;
        ctx.fillStyle = inv.type === 0 ? '#ff71ce' : inv.type === 1 ? '#b967ff' : '#fffb96';
        ctx.shadowColor = ctx.fillStyle;
        ctx.fillRect(inv.x, inv.y, INVADER_WIDTH, INVADER_HEIGHT);
        // Little eyes
        ctx.fillStyle = '#000';
        ctx.shadowBlur = 0;
        ctx.fillRect(inv.x + 5, inv.y + 5, 4, 4);
        ctx.fillRect(inv.x + INVADER_WIDTH - 9, inv.y + 5, 4, 4);
      });

      // Draw Projectiles
      ctx.fillStyle = '#fff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fff';
      projectiles.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Enemy Projectiles
      ctx.fillStyle = '#ff71ce';
      ctx.shadowColor = '#ff71ce';
      enemyProjectiles.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, PROJECTILE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    requestRef.current = requestAnimationFrame(update);
  }, [gameState.isPaused, gameState.gameOver, gameState.level, initInvaders]);

  useEffect(() => {
    initInvaders(1);
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [update, initInvaders]);

  return (
    <div className="relative flex flex-col items-center gap-4 p-6 neon-border bg-black/40 backdrop-blur-md rounded-2xl overflow-hidden scanline-move">
      <div className="absolute top-0 left-0 w-full h-full grid-bg opacity-20 pointer-events-none" />
      
      {/* HUD */}
      <div className="flex justify-between w-full font-mono text-sm z-10">
        <div className="flex flex-col">
          <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Score</span>
          <span className="text-primary text-xl font-bold neon-glow">{gameState.score.toString().padStart(6, '0')}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-muted-foreground uppercase text-[10px] tracking-widest">Level</span>
          <span className="text-secondary text-xl font-bold neon-glow">{gameState.level}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-muted-foreground uppercase text-[10px] tracking-widest">High Score</span>
          <span className="text-accent text-xl font-bold neon-glow">{gameState.highScore.toString().padStart(6, '0')}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative border-2 border-primary/30 rounded-lg overflow-hidden bg-black/60 shadow-[0_0_30px_rgba(255,113,206,0.1)]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />
        
        {/* Overlays */}
        <AnimatePresence>
          {gameState.isPaused && !gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm z-20"
            >
              <h2 className="text-4xl font-bold text-primary mb-6 neon-glow uppercase tracking-tighter">Neon Invaders</h2>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full hover:scale-105 transition-transform neon-border uppercase tracking-widest"
              >
                Start Game
              </button>
              <p className="mt-8 text-muted-foreground text-xs uppercase tracking-widest animate-pulse">
                Use Arrows to Move • Space to Shoot
              </p>
            </motion.div>
          )}

          {gameState.gameOver && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md z-20"
            >
              <h2 className="text-6xl font-bold text-destructive mb-2 neon-glow uppercase tracking-tighter">Game Over</h2>
              <p className="text-xl text-primary mb-8 font-mono">Final Score: {gameState.score}</p>
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-secondary text-secondary-foreground font-bold rounded-full hover:scale-105 transition-transform neon-border uppercase tracking-widest"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lives Indicator */}
      <div className="flex gap-2 z-10">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className={`w-6 h-3 rounded-sm transition-all duration-500 ${
              i < gameState.lives ? 'bg-secondary shadow-[0_0_10px_rgba(1,205,254,0.5)]' : 'bg-muted opacity-20'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
