import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, ChevronLeft, Zap, Shield, Play } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { addCoins, updateHighScore } from '../../utils/storage';
import { BikeConfig } from '../../types/game';

interface CyberBikeGameProps {
  bikeConfig?: BikeConfig;
  onExit: () => void;
  onCoinsEarned: (coins: number) => void;
  onMissionProgress?: (type: 'cyber_rivals', amount: number) => void;
}

interface TrailPoint {
  x: number;
  y: number;
}

interface CyberRider {
  id: string;
  name: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
  color: string;
  trailColor: string;
  alive: boolean;
  isPlayer: boolean;
  trail: TrailPoint[];
}

export const CyberBikeGame: React.FC<CyberBikeGameProps> = ({
  bikeConfig,
  onExit,
  onCoinsEarned,
  onMissionProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [aliveRivals, setAliveRivals] = useState<number>(3);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);

  const playerColor = bikeConfig?.color || '#00f0ff';
  const playerTrail = bikeConfig?.accentColor || '#00f0ff';

  const stateRef = useRef({
    riders: [] as CyberRider[],
    powerups: [] as { x: number; y: number; active: boolean }[],
    speed: 2.5,
    isBoosting: false,
    score: 0,
    gameOver: false,
    victory: false,
    nextDir: { dx: 1, dy: 0 },
  });

  const initRound = (round: number) => {
    const s = stateRef.current;
    s.speed = 2.4 + round * 0.25;
    s.isBoosting = false;
    s.gameOver = false;
    s.victory = false;
    s.nextDir = { dx: 1, dy: 0 };

    // Player in bottom left heading right
    const player: CyberRider = {
      id: 'player',
      name: 'Player 1',
      x: 120,
      y: 420,
      dx: 1,
      dy: 0,
      color: playerColor,
      trailColor: playerTrail,
      alive: true,
      isPlayer: true,
      trail: [{ x: 120, y: 420 }],
    };

    // AI 1 top left heading down
    const ai1: CyberRider = {
      id: 'ai1',
      name: 'Phantom-9',
      x: 140,
      y: 120,
      dx: 0,
      dy: 1,
      color: '#ef4444',
      trailColor: '#f87171',
      alive: true,
      isPlayer: false,
      trail: [{ x: 140, y: 120 }],
    };

    // AI 2 top right heading left
    const ai2: CyberRider = {
      id: 'ai2',
      name: 'Vektor-X',
      x: 680,
      y: 140,
      dx: -1,
      dy: 0,
      color: '#eab308',
      trailColor: '#fde047',
      alive: true,
      isPlayer: false,
      trail: [{ x: 680, y: 140 }],
    };

    // AI 3 bottom right heading up
    const ai3: CyberRider = {
      id: 'ai3',
      name: 'Apex-Omega',
      x: 660,
      y: 400,
      dx: 0,
      dy: -1,
      color: '#a855f7',
      trailColor: '#c084fc',
      alive: true,
      isPlayer: false,
      trail: [{ x: 660, y: 400 }],
    };

    s.riders = [player, ai1, ai2, ai3];

    // Spawn 4 energy powerups
    s.powerups = [
      { x: 300, y: 220, active: true },
      { x: 500, y: 340, active: true },
      { x: 400, y: 160, active: true },
      { x: 400, y: 380, active: true },
    ];

    setIsGameOver(false);
    setIsVictory(false);
    setAliveRivals(3);
  };

  useEffect(() => {
    initRound(roundNumber);

    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const player = s.riders.find((r) => r.isPlayer);
      if (!player || !player.alive) return;

      if ((e.code === 'ArrowUp' || e.code === 'KeyW') && player.dy === 0) {
        s.nextDir = { dx: 0, dy: -1 };
        e.preventDefault();
      }
      if ((e.code === 'ArrowDown' || e.code === 'KeyS') && player.dy === 0) {
        s.nextDir = { dx: 0, dy: 1 };
        e.preventDefault();
      }
      if ((e.code === 'ArrowLeft' || e.code === 'KeyA') && player.dx === 0) {
        s.nextDir = { dx: -1, dy: 0 };
        e.preventDefault();
      }
      if ((e.code === 'ArrowRight' || e.code === 'KeyD') && player.dx === 0) {
        s.nextDir = { dx: 1, dy: 0 };
        e.preventDefault();
      }
      if (e.code === 'Space') {
        s.isBoosting = true;
        soundEngine.playNitro();
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        initRound(roundNumber);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        stateRef.current.isBoosting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [roundNumber, playerColor, playerTrail]);

  // Main 60 FPS Grid Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let moveTimer = 0;

    const checkCollision = (x: number, y: number, currentRiderId: string, width: number, height: number): boolean => {
      // Wall boundary collisions
      if (x <= 16 || x >= width - 16 || y <= 16 || y >= height - 16) {
        return true;
      }

      // Check collision with all trails
      const s = stateRef.current;
      for (const rider of s.riders) {
        for (let i = 0; i < rider.trail.length - 1; i++) {
          const pt1 = rider.trail[i];
          const pt2 = rider.trail[i + 1];

          // Point to segment distance
          const lineDist = Math.hypot(x - pt1.x, y - pt1.y);
          if (rider.id === currentRiderId && i >= rider.trail.length - 8) {
            // Ignore immediate tail of own bike
            continue;
          }

          // Simple bounding box segment check
          const minX = Math.min(pt1.x, pt2.x) - 4;
          const maxX = Math.max(pt1.x, pt2.x) + 4;
          const minY = Math.min(pt1.y, pt2.y) - 4;
          const maxY = Math.max(pt1.y, pt2.y) + 4;

          if (x >= minX && x <= maxX && y >= minY && y <= maxY) {
            return true;
          }
        }
      }

      return false;
    };

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const s = stateRef.current;

      if (canvas && ctx) {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }

        const width = canvas.width;
        const height = canvas.height;

        if (!s.gameOver && !s.victory) {
          // Update positions
          for (const rider of s.riders) {
            if (!rider.alive) continue;

            const isPlayer = rider.isPlayer;
            const currentSpeed = isPlayer && s.isBoosting ? s.speed * 1.3 : s.speed;

            if (isPlayer) {
              rider.dx = s.nextDir.dx;
              rider.dy = s.nextDir.dy;
            } else {
              // Simple intelligent AI lookahead
              const forwardX = rider.x + rider.dx * (currentSpeed * 8);
              const forwardY = rider.y + rider.dy * (currentSpeed * 8);

              if (checkCollision(forwardX, forwardY, rider.id, width, height) || Math.random() < 0.03) {
                // Decide alternative turn direction (orthogonal)
                const options = rider.dx !== 0
                  ? [{ dx: 0, dy: -1 }, { dx: 0, dy: 1 }]
                  : [{ dx: -1, dy: 0 }, { dx: 1, dy: 0 }];

                // Pick safe option
                const safeOptions = options.filter((opt) => {
                  const testX = rider.x + opt.dx * (currentSpeed * 10);
                  const testY = rider.y + opt.dy * (currentSpeed * 10);
                  return !checkCollision(testX, testY, rider.id, width, height);
                });

                if (safeOptions.length > 0) {
                  const chosen = safeOptions[Math.floor(Math.random() * safeOptions.length)];
                  rider.dx = chosen.dx;
                  rider.dy = chosen.dy;
                }
              }
            }

            rider.x += rider.dx * currentSpeed;
            rider.y += rider.dy * currentSpeed;
            rider.trail.push({ x: rider.x, y: rider.y });

            // Check collision for this step
            if (checkCollision(rider.x, rider.y, rider.id, width, height)) {
              rider.alive = false;
              soundEngine.playCrash();

              if (rider.isPlayer) {
                s.gameOver = true;
                setIsGameOver(true);
                const earnedCoins = 40;
                addCoins(earnedCoins);
                updateHighScore('cyber', s.score);
                onCoinsEarned(earnedCoins);
              } else {
                s.score += 500;
                soundEngine.playStunt();
                onMissionProgress?.('cyber_rivals', 1);
              }
            }

            // Powerup collection
            s.powerups.forEach((pu) => {
              if (pu.active && Math.hypot(rider.x - pu.x, rider.y - pu.y) < 24) {
                pu.active = false;
                if (rider.isPlayer) {
                  s.score += 250;
                  soundEngine.playCoin();
                }
              }
            });
          }

          // Count remaining rivals
          const rivalsLeft = s.riders.filter((r) => !r.isPlayer && r.alive).length;
          setAliveRivals(rivalsLeft);

          // Check Player Victory
          const player = s.riders.find((r) => r.isPlayer);
          if (player && player.alive && rivalsLeft === 0) {
            s.victory = true;
            setIsVictory(true);
            s.score += 1500;
            soundEngine.playVictory();
            const earnedCoins = 180 + roundNumber * 50;
            addCoins(earnedCoins);
            updateHighScore('cyber', s.score);
            onCoinsEarned(earnedCoins);
          }

          setScore(s.score);
        }

        // 2. RENDER SYNTHWAVE GRID ARENA
        ctx.fillStyle = '#060810';
        ctx.fillRect(0, 0, width, height);

        // Neon Grid Lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
        ctx.lineWidth = 1;
        const gridSize = 28;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Arena Border Walls (Lethal Neon Boundaries)
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.strokeRect(16, 16, width - 32, height - 32);

        // Powerups
        s.powerups.forEach((pu) => {
          if (pu.active) {
            ctx.save();
            ctx.translate(pu.x, pu.y);
            ctx.fillStyle = '#facc15';
            ctx.beginPath();
            ctx.arc(0, 0, 7, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        });

        // Draw Trails
        for (const rider of s.riders) {
          if (rider.trail.length > 1) {
            ctx.strokeStyle = rider.trailColor;
            ctx.lineWidth = 4;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(rider.trail[0].x, rider.trail[0].y);
            for (let i = 1; i < rider.trail.length; i++) {
              ctx.lineTo(rider.trail[i].x, rider.trail[i].y);
            }
            ctx.stroke();
          }
        }

        // Draw Cyber Cycles
        for (const rider of s.riders) {
          if (!rider.alive) continue;

          ctx.save();
          ctx.translate(rider.x, rider.y);
          const angle = Math.atan2(rider.dy, rider.dx);
          ctx.rotate(angle);

          // Cycle body
          ctx.fillStyle = rider.color;
          ctx.beginPath();
          ctx.roundRect(-14, -6, 28, 12, 3);
          ctx.fill();

          // Wheel glow
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-12, -4, 6, 8);
          ctx.fillRect(6, -4, 6, 8);

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [roundNumber, onCoinsEarned]);

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top Header */}
      <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Games Menu</span>
          </button>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-bold text-amber-400 text-display">CYBER NEON GRID</span>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-5 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">SECTOR:</span>
            <span className="text-white font-bold">{roundNumber}</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">RIVALS ALIVE:</span>
            <span className="text-red-400 font-bold">{aliveRivals} / 3</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-slate-500">SCORE:</span>
            <span className="font-bold">{score.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={() => initRound(roundNumber)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Restart Sector"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas View */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">De-Resolution Event</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-2">GRID OVERRIDE</h2>
            <div className="text-2xl font-bold font-mono-numbers text-amber-400 mb-4">
              {score.toLocaleString()} PTS
            </div>
            <p className="text-sm text-slate-300 mb-6 max-w-sm">
              Avoid walls and luminous trails. Force opponents into high-speed traps!
            </p>
            <button
              onClick={() => initRound(roundNumber)}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
            >
              Re-enter Arena
            </button>
          </div>
        )}

        {/* Victory Modal */}
        {isVictory && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Sector Purged</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-2">GRID CHAMPION!</h2>
            <div className="text-2xl font-bold font-mono-numbers text-amber-400 mb-4">
              {score.toLocaleString()} PTS
            </div>
            <button
              onClick={() => {
                setRoundNumber((r) => r + 1);
                initRound(roundNumber + 1);
              }}
              className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer shadow-lg shadow-cyan-500/25"
            >
              Next Sector Grid
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-16 bg-slate-900/95 border-t border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => (stateRef.current.nextDir = { dx: -1, dy: 0 })}
            className="w-11 h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            ←
          </button>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => (stateRef.current.nextDir = { dx: 0, dy: -1 })}
              className="w-11 h-4 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-slate-200 font-bold text-[10px] rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
            >
              ▲
            </button>
            <button
              onClick={() => (stateRef.current.nextDir = { dx: 0, dy: 1 })}
              className="w-11 h-4 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-slate-200 font-bold text-[10px] rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
            >
              ▼
            </button>
          </div>
          <button
            onClick={() => (stateRef.current.nextDir = { dx: 1, dy: 0 })}
            className="w-11 h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            →
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400">
          <span className="font-semibold text-slate-300">WASD / Arrow Keys</span> Turn ·{' '}
          <span className="font-semibold text-slate-300">Space</span> Boost Overdrive
        </div>

        <div>
          <button
            onPointerDown={() => {
              stateRef.current.isBoosting = true;
              soundEngine.playNitro();
            }}
            onPointerUp={() => (stateRef.current.isBoosting = false)}
            onPointerLeave={() => (stateRef.current.isBoosting = false)}
            className="px-5 h-10 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 text-black font-extrabold text-xs rounded flex items-center justify-center cursor-pointer select-none shadow-md shadow-cyan-500/20"
          >
            TURBO BOOST ⚡
          </button>
        </div>
      </div>
    </div>
  );
};
