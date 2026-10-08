import React, { useEffect, useRef, useState } from 'react';
import { Play, RotateCcw, ChevronLeft, Zap, Trophy, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { addCoins, updateHighScore } from '../../utils/storage';
import { BikeConfig } from '../../types/game';

interface HighwayRacerGameProps {
  bikeConfig?: BikeConfig;
  onExit: () => void;
  onCoinsEarned: (coins: number) => void;
  onMissionProgress?: (type: 'near_misses' | 'coins_collected', amount: number) => void;
}

interface TrafficVehicle {
  id: number;
  x: number; // lane center
  y: number; // vertical position
  speed: number;
  width: number;
  height: number;
  color: string;
  type: 'car' | 'truck' | 'sport' | 'taxi';
  lane: number;
}

interface RoadPickup {
  id: number;
  x: number;
  y: number;
  type: 'coin' | 'nitro';
  collected: boolean;
}

export const HighwayRacerGame: React.FC<HighwayRacerGameProps> = ({
  bikeConfig,
  onExit,
  onCoinsEarned,
  onMissionProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [speedKmh, setSpeedKmh] = useState<number>(65);
  const [nitroLevel, setNitroLevel] = useState<number>(100);
  const [nearMissCombo, setNearMissCombo] = useState<number>(1);
  const [nearMissNotice, setNearMissNotice] = useState<string>('');
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [coinsCollected, setCoinsCollected] = useState<number>(0);

  const bikeColor = bikeConfig?.color || '#ef4444';
  const accentColor = bikeConfig?.accentColor || '#3b82f6';

  const stateRef = useRef({
    bikeX: 300, // target horizontal center
    bikeTargetX: 300,
    speed: 7.5, // baseline slow road speed
    targetSpeed: 7.5,
    nitro: 100,
    isNitroActive: false,
    distanceTraveled: 0,
    score: 0,
    coins: 0,
    combo: 1,
    comboTimer: 0,
    gameOver: false,
    keys: {
      left: false,
      right: false,
      up: false,
      down: false,
      nitro: false,
    },
    roadOffset: 0,
    nearMissText: '',
    nearMissTimer: 0,
  });

  const vehiclesRef = useRef<TrafficVehicle[]>([]);
  const pickupsRef = useRef<RoadPickup[]>([]);
  const nextVehicleId = useRef<number>(1);

  const resetGame = () => {
    const s = stateRef.current;
    s.bikeX = 300;
    s.bikeTargetX = 300;
    s.speed = 7.5;
    s.targetSpeed = 7.5;
    s.nitro = 100;
    s.isNitroActive = false;
    s.distanceTraveled = 0;
    s.score = 0;
    s.coins = 0;
    s.combo = 1;
    s.gameOver = false;
    vehiclesRef.current = [];
    pickupsRef.current = [];
    setIsGameOver(false);
    setScore(0);
    setDistance(0);
    setNitroLevel(100);
    setNearMissCombo(1);
    setNearMissNotice('');
    setCoinsCollected(0);
  };

  useEffect(() => {
    resetGame();

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keys.left = true;
        e.preventDefault();
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keys.right = true;
        e.preventDefault();
      }
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        keys.up = true;
        e.preventDefault();
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        keys.down = true;
        e.preventDefault();
      }
      if (e.code === 'Space') {
        keys.nitro = true;
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        resetGame();
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
      if (e.code === 'Space') keys.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    soundEngine.startEngine(75);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      soundEngine.stopEngine();
    };
  }, []);

  // 60 FPS Highway Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let spawnTimer = 0;

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

        const roadLeft = width * 0.22;
        const roadWidth = width * 0.56;
        const laneWidth = roadWidth / 4;
        const playerY = height * 0.76;

        if (!s.gameOver) {
          // Speed logic (smooth, slow gradual acceleration)
          const baseMaxSpeed = 13.5;
          const cruisingSpeed = 7.5;
          const nitroSpeed = 19.0;
          const isBoosting = s.keys.nitro && s.nitro > 0;

          if (isBoosting) {
            s.nitro = Math.max(0, s.nitro - dt * 25);
            s.targetSpeed = nitroSpeed;
            if (Math.random() < 0.2) soundEngine.playNitro();
          } else if (s.keys.up) {
            s.targetSpeed = baseMaxSpeed;
            // Refill nitro slowly
            s.nitro = Math.min(100, s.nitro + dt * 4);
          } else if (s.keys.down) {
            s.targetSpeed = 4.2;
          } else {
            s.targetSpeed = cruisingSpeed;
            s.nitro = Math.min(100, s.nitro + dt * 5);
          }

          // Gentle and slow rate of speed change when accelerating
          s.speed += (s.targetSpeed - s.speed) * 0.035;
          s.distanceTraveled += (s.speed * dt * 0.04);
          s.score += Math.floor(s.speed * s.combo * 0.2);

          const currentKmh = Math.floor(s.speed * 8.5);
          soundEngine.updateEngine(Math.min(currentKmh / 260, 1), s.keys.up || isBoosting);

          // Horizontal steering
          const steerSpeed = (laneWidth * 4.2) * dt;
          if (s.keys.left) s.bikeX -= steerSpeed;
          if (s.keys.right) s.bikeX += steerSpeed;

          // Road boundaries clamping
          const minX = roadLeft + 20;
          const maxX = roadLeft + roadWidth - 20;
          s.bikeX = Math.max(minX, Math.min(maxX, s.bikeX));

          // Spawn traffic
          spawnTimer += dt;
          const spawnInterval = Math.max(0.65, 1.8 - s.speed * 0.04);
          if (spawnTimer > spawnInterval) {
            spawnTimer = 0;
            const lane = Math.floor(Math.random() * 4);
            const laneX = roadLeft + lane * laneWidth + laneWidth / 2;

            // Pick vehicle type
            const r = Math.random();
            let type: 'car' | 'truck' | 'sport' | 'taxi' = 'car';
            let vSpeed = s.speed * 0.4 + Math.random() * 3;
            let vWidth = 34;
            let vHeight = 60;
            let color = '#38bdf8';

            if (r < 0.25) {
              type = 'truck';
              vWidth = 44;
              vHeight = 110;
              vSpeed = s.speed * 0.35;
              color = '#64748b';
            } else if (r < 0.5) {
              type = 'taxi';
              vSpeed = s.speed * 0.45;
              color = '#facc15';
            } else if (r < 0.75) {
              type = 'sport';
              vSpeed = s.speed * 0.65;
              color = '#ef4444';
            }

            vehiclesRef.current.push({
              id: nextVehicleId.current++,
              x: laneX,
              y: -120,
              speed: vSpeed,
              width: vWidth,
              height: vHeight,
              color,
              type,
              lane,
            });

            // Occasional pickup item
            if (Math.random() < 0.35) {
              const pickupLane = (lane + 1 + Math.floor(Math.random() * 2)) % 4;
              pickupsRef.current.push({
                id: nextVehicleId.current++,
                x: roadLeft + pickupLane * laneWidth + laneWidth / 2,
                y: -150,
                type: Math.random() < 0.7 ? 'coin' : 'nitro',
                collected: false,
              });
            }
          }

          // Move vehicles & near miss checks
          const playerBikeBox = {
            x: s.bikeX - 12,
            y: playerY - 26,
            w: 24,
            h: 52,
          };

          vehiclesRef.current.forEach((v) => {
            // Relational speed relative to player
            v.y += (s.speed - v.speed);

            // Collision check
            const vBox = {
              x: v.x - v.width / 2,
              y: v.y - v.height / 2,
              w: v.width,
              h: v.height,
            };

            const isColliding =
              playerBikeBox.x < vBox.x + vBox.w &&
              playerBikeBox.x + playerBikeBox.w > vBox.x &&
              playerBikeBox.y < vBox.y + vBox.h &&
              playerBikeBox.y + playerBikeBox.h > vBox.y;

            if (isColliding) {
              s.gameOver = true;
              setIsGameOver(true);
              soundEngine.playCrash();
              soundEngine.stopEngine();
              const earnedCoins = s.coins * 10 + Math.floor(s.distanceTraveled * 2);
              addCoins(earnedCoins);
              updateHighScore('highway', s.score);
              onCoinsEarned(earnedCoins);
            }

            // Near miss check: within 16px lateral, passing player
            const lateralDist = Math.abs(s.bikeX - v.x) - (v.width / 2 + 12);
            const verticalDist = Math.abs(playerY - v.y);
            if (!isColliding && lateralDist < 14 && lateralDist >= 0 && verticalDist < 30) {
              if (Math.random() < 0.08) {
                s.combo = Math.min(6, s.combo + 1);
                s.score += 150 * s.combo;
                s.nearMissText = `NEAR MISS! x${s.combo}`;
                s.nearMissTimer = 1.2;
                soundEngine.playStunt();
                onMissionProgress?.('near_misses', 1);
              }
            }
          });

          // Filter offscreen vehicles
          vehiclesRef.current = vehiclesRef.current.filter((v) => v.y < height + 150);

          // Pickups update
          pickupsRef.current.forEach((p) => {
            p.y += s.speed;
            if (!p.collected && Math.hypot(s.bikeX - p.x, playerY - p.y) < 32) {
              p.collected = true;
              if (p.type === 'coin') {
                s.coins += 1;
                s.score += 100;
                soundEngine.playCoin();
                onMissionProgress?.('coins_collected', 1);
              } else {
                s.nitro = Math.min(100, s.nitro + 35);
                soundEngine.playNitro();
              }
            }
          });
          pickupsRef.current = pickupsRef.current.filter((p) => p.y < height + 100 && !p.collected);

          // Road animation offset
          s.roadOffset = (s.roadOffset + s.speed) % 80;

          // Decay combo
          if (s.nearMissTimer > 0) {
            s.nearMissTimer -= dt;
            if (s.nearMissTimer <= 0) {
              s.nearMissText = '';
            }
          }

          // React state sync
          setScore(s.score);
          setDistance(parseFloat(s.distanceTraveled.toFixed(2)));
          setSpeedKmh(currentKmh);
          setNitroLevel(Math.floor(s.nitro));
          setNearMissCombo(s.combo);
          setNearMissNotice(s.nearMissText);
          setCoinsCollected(s.coins);
        }

        // 2. RENDER HIGHWAY
        // Dark city background with illuminated skyscrapers
        ctx.fillStyle = '#05070d';
        ctx.fillRect(0, 0, width, height);

        // Skyline silhouettes on sides
        ctx.fillStyle = '#0d1527';
        for (let bx = 0; bx < roadLeft - 20; bx += 35) {
          const bh = 140 + Math.sin(bx * 0.3) * 60;
          ctx.fillRect(bx, 0, 30, bh);
        }
        for (let bx = roadLeft + roadWidth + 20; bx < width; bx += 35) {
          const bh = 140 + Math.cos(bx * 0.3) * 60;
          ctx.fillRect(bx, 0, 30, bh);
        }

        // Road Surface Asphalt
        ctx.fillStyle = '#1e2530';
        ctx.fillRect(roadLeft, 0, roadWidth, height);

        // Guardrails
        ctx.fillStyle = '#475569';
        ctx.fillRect(roadLeft - 8, 0, 8, height);
        ctx.fillRect(roadLeft + roadWidth, 0, 8, height);

        // Outer white continuous road stripes
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(roadLeft + 6, 0, 4, height);
        ctx.fillRect(roadLeft + roadWidth - 10, 0, 4, height);

        // Dashed lane divider lines
        ctx.fillStyle = '#fbbf24';
        for (let l = 1; l <= 3; l++) {
          const laneX = roadLeft + l * laneWidth;
          for (let y = -80 + s.roadOffset; y < height; y += 80) {
            ctx.fillRect(laneX - 2, y, 4, 45);
          }
        }

        // Draw Pickups (Coins & Nitro)
        pickupsRef.current.forEach((p) => {
          ctx.save();
          ctx.translate(p.x, p.y);
          if (p.type === 'coin') {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 11, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 2;
            ctx.stroke();
          } else {
            // Nitro icon
            ctx.fillStyle = '#06b6d4';
            ctx.fillRect(-8, -12, 16, 24);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-4, -15, 8, 4);
          }
          ctx.restore();
        });

        // Draw Traffic Vehicles
        vehiclesRef.current.forEach((v) => {
          ctx.save();
          ctx.translate(v.x, v.y);

          // Car shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(-v.width / 2 + 3, -v.height / 2 + 5, v.width, v.height);

          // Vehicle body
          ctx.fillStyle = v.color;
          ctx.beginPath();
          ctx.roundRect(-v.width / 2, -v.height / 2, v.width, v.height, 6);
          ctx.fill();

          // Windshield & roof
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-v.width / 2 + 4, -v.height / 4, v.width - 8, v.height / 2);

          // Tail lights
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(-v.width / 2 + 3, v.height / 2 - 4, 6, 4);
          ctx.fillRect(v.width / 2 - 9, v.height / 2 - 4, 6, 4);

          // Headlights
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-v.width / 2 + 3, -v.height / 2, 6, 4);
          ctx.fillRect(v.width / 2 - 9, -v.height / 2, 6, 4);

          ctx.restore();
        });

        // Draw Player Motorcycle
        if (!s.gameOver) {
          ctx.save();
          ctx.translate(s.bikeX, playerY);

          // Lean tilt when turning
          const turnTilt = (s.keys.left ? -0.2 : 0) + (s.keys.right ? 0.2 : 0);
          ctx.rotate(turnTilt);

          // Nitro flame exhaust
          if (s.keys.nitro && s.nitro > 0) {
            ctx.fillStyle = '#00f0ff';
            ctx.beginPath();
            ctx.moveTo(-6, 28);
            ctx.lineTo(6, 28);
            ctx.lineTo(0, 48 + Math.random() * 12);
            ctx.closePath();
            ctx.fill();
          }

          // Bike shadow
          ctx.fillStyle = 'rgba(0,0,0,0.45)';
          ctx.beginPath();
          ctx.ellipse(0, 10, 14, 24, 0, 0, Math.PI * 2);
          ctx.fill();

          // Wheels (Front & Rear)
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-4, -28, 8, 14); // Front wheel
          ctx.fillRect(-4, 16, 8, 14); // Rear wheel

          // Main Chassis Fairing
          ctx.fillStyle = bikeColor;
          ctx.beginPath();
          ctx.moveTo(-9, -16);
          ctx.lineTo(9, -16);
          ctx.lineTo(11, 8);
          ctx.lineTo(-11, 8);
          ctx.closePath();
          ctx.fill();

          // Handlebars
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-15, -12);
          ctx.lineTo(15, -12);
          ctx.stroke();

          // Rider Body
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.arc(0, -4, 8, 0, Math.PI * 2); // Shoulders
          ctx.fill();

          // Rider Helmet
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, -8, 6, 0, Math.PI * 2);
          ctx.fill();

          // Helmet Visor
          ctx.fillStyle = '#000000';
          ctx.fillRect(-4, -13, 8, 4);

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bikeColor, onCoinsEarned]);

  return (
    <div className="relative w-full h-[620px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none">
      {/* Top Header Controls */}
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
          <span className="text-xs font-bold text-amber-400 text-display">HIGHWAY MOTO RUSH</span>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-4 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">SPEED:</span>
            <span className="text-white font-bold text-sm">{speedKmh} KM/H</span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="text-slate-500">NITRO:</span>
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-cyan-400 transition-all duration-75"
                style={{ width: `${nitroLevel}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-slate-500">SCORE:</span>
            <span className="font-bold">{score.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={resetGame}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Restart Run"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Highway View */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Near Miss Banner */}
        {nearMissNotice && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-600/90 text-white font-extrabold px-5 py-1.5 rounded shadow-lg text-display text-sm tracking-widest animate-pulse pointer-events-none">
            {nearMissNotice}
          </div>
        )}

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Crash Collision</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-2">RUN TERMINATED</h2>
            <div className="text-2xl font-bold font-mono-numbers text-amber-400 mb-4">
              {score.toLocaleString()} PTS
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 max-w-xs w-full text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Distance Covered:</span>
                <span className="font-mono-numbers text-white">{distance} KM</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Near-Miss Multiplier:</span>
                <span className="font-mono-numbers text-emerald-400">x{nearMissCombo}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coins Collected:</span>
                <span className="font-mono-numbers text-amber-400">+{coinsCollected * 10}</span>
              </div>
            </div>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="h-16 bg-slate-900/95 border-t border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (stateRef.current.keys.left = true)}
            onPointerUp={() => (stateRef.current.keys.left = false)}
            onPointerLeave={() => (stateRef.current.keys.left = false)}
            className="w-14 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            ◀ LEFT
          </button>
          <button
            onPointerDown={() => (stateRef.current.keys.right = true)}
            onPointerUp={() => (stateRef.current.keys.right = false)}
            onPointerLeave={() => (stateRef.current.keys.right = false)}
            className="w-14 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            RIGHT ▶
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400">
          <span className="font-semibold text-slate-300">A / D</span> Steer ·{' '}
          <span className="font-semibold text-slate-300">W</span> Accelerate ·{' '}
          <span className="font-semibold text-slate-300">Space</span> Nitro Boost
        </div>

        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (stateRef.current.keys.down = true)}
            onPointerUp={() => (stateRef.current.keys.down = false)}
            onPointerLeave={() => (stateRef.current.keys.down = false)}
            className="w-14 h-10 bg-red-950/80 hover:bg-red-900 active:bg-red-600 text-red-200 font-bold text-xs rounded border border-red-800 flex items-center justify-center cursor-pointer select-none"
          >
            BRAKE
          </button>
          <button
            onPointerDown={() => (stateRef.current.keys.nitro = true)}
            onPointerUp={() => (stateRef.current.keys.nitro = false)}
            onPointerLeave={() => (stateRef.current.keys.nitro = false)}
            className="w-16 h-10 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-300 text-black font-extrabold text-xs rounded flex items-center justify-center cursor-pointer select-none shadow-md shadow-cyan-500/20"
          >
            NITRO 🔥
          </button>
        </div>
      </div>
    </div>
  );
};
