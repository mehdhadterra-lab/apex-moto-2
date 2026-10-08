import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, ChevronLeft, Award, Flame, Play } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { addCoins, updateHighScore } from '../../utils/storage';
import { BikeConfig } from '../../types/game';

interface BMXFreestyleGameProps {
  bikeConfig?: BikeConfig;
  onExit: () => void;
  onCoinsEarned: (coins: number) => void;
  onMissionProgress?: (type: 'bmx_tricks', amount: number) => void;
}

export const BMXFreestyleGame: React.FC<BMXFreestyleGameProps> = ({
  bikeConfig,
  onExit,
  onCoinsEarned,
  onMissionProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [currentTrick, setCurrentTrick] = useState<string>('');
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [airHeightMeters, setAirHeightMeters] = useState<number>(0);
  const [isBailed, setIsBailed] = useState<boolean>(false);
  const [isRoundOver, setIsRoundOver] = useState<boolean>(false);
  const [totalTricksLanded, setTotalTricksLanded] = useState<number>(0);

  const bikeColor = bikeConfig?.color || '#06b6d4';
  const accentColor = bikeConfig?.accentColor || '#a855f7';

  const stateRef = useRef({
    x: 400,
    y: 380,
    vx: 8,
    vy: 0,
    angle: 0,
    angularVel: 0,
    inAir: false,
    airTime: 0,
    peakAirY: 380,
    jumpTricks: [] as string[],
    trickAnim: '' as '' | 'superman' | 'tailwhip' | 'barspin',
    trickProgress: 0,
    combo: 1,
    score: 0,
    roundTime: 60,
    bailed: false,
    roundOver: false,
    tricksCount: 0,
    keys: {
      left: false,
      right: false,
      pump: false,
      superman: false,
      tailwhip: false,
      barspin: false,
    },
  });

  const getBowlProfile = (x: number, width: number, height: number): { y: number; normalAngle: number } => {
    const bowlBottomY = height * 0.72;
    const bowlDepth = 180;
    const leftLipX = width * 0.12;
    const rightLipX = width * 0.88;
    const rampWidth = width * 0.24;

    if (x < leftLipX) {
      return { y: bowlBottomY - bowlDepth, normalAngle: 0 };
    } else if (x < leftLipX + rampWidth) {
      // Left curved transition
      const t = (x - leftLipX) / rampWidth;
      const angle = Math.PI * (1 - t) * 0.5;
      const y = bowlBottomY - Math.sin(angle) * bowlDepth;
      return { y, normalAngle: angle };
    } else if (x > rightLipX) {
      return { y: bowlBottomY - bowlDepth, normalAngle: 0 };
    } else if (x > rightLipX - rampWidth) {
      // Right curved transition
      const t = (x - (rightLipX - rampWidth)) / rampWidth;
      const angle = Math.PI * t * 0.5;
      const y = bowlBottomY - Math.sin(angle) * bowlDepth;
      return { y, normalAngle: -angle };
    } else {
      // Flat bottom
      return { y: bowlBottomY, normalAngle: 0 };
    }
  };

  const resetRun = () => {
    const s = stateRef.current;
    s.x = 400;
    s.y = 380;
    s.vx = 8;
    s.vy = 0;
    s.angle = 0;
    s.angularVel = 0;
    s.inAir = false;
    s.airTime = 0;
    s.peakAirY = 380;
    s.jumpTricks = [];
    s.trickAnim = '';
    s.trickProgress = 0;
    s.combo = 1;
    s.score = 0;
    s.roundTime = 60;
    s.bailed = false;
    s.roundOver = false;
    s.tricksCount = 0;

    setIsBailed(false);
    setIsRoundOver(false);
    setScore(0);
    setTimeLeft(60);
    setCurrentTrick('');
    setComboMultiplier(1);
    setAirHeightMeters(0);
    setTotalTricksLanded(0);
  };

  useEffect(() => {
    resetRun();

    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      const s = stateRef.current;

      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = true;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = true;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.pump = true;

      // Air tricks
      if (s.inAir && !s.bailed) {
        if (['ArrowUp', 'KeyW'].includes(e.code)) {
          triggerTrick('superman', 350, 'SUPERMAN AIR');
        }
        if (e.code === 'KeyQ') {
          triggerTrick('tailwhip', 280, 'TAILWHIP');
        }
        if (e.code === 'KeyE') {
          triggerTrick('barspin', 220, 'BARSPIN');
        }
      }

      if (e.code === 'KeyR') resetRun();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.pump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const triggerTrick = (type: 'superman' | 'tailwhip' | 'barspin', points: number, label: string) => {
    const s = stateRef.current;
    if (s.trickAnim === '') {
      s.trickAnim = type;
      s.trickProgress = 0;
      s.jumpTricks.push(label);
      s.score += points * s.combo;
      s.combo = Math.min(5, s.combo + 1);
      s.tricksCount += 1;
      setCurrentTrick(`${label} (x${s.combo})`);
      soundEngine.playStunt();
      onMissionProgress?.('bmx_tricks', 1);
    }
  };

  // Main 60 FPS BMX loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

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

        if (!s.roundOver && !s.bailed) {
          s.roundTime = Math.max(0, s.roundTime - dt);
          if (s.roundTime <= 0) {
            s.roundOver = true;
            setIsRoundOver(true);
            soundEngine.playVictory();
            const earnedCoins = Math.floor(s.score / 20) + 120;
            addCoins(earnedCoins);
            updateHighScore('bmx', s.score);
            onCoinsEarned(earnedCoins);
          }

          // Physics update
          const ground = getBowlProfile(s.x, width, height);
          const distToRamp = ground.y - s.y;

          if (s.inAir) {
            // Air state
            s.vy += 0.45; // Gravity
            s.x += s.vx;
            s.y += s.vy;
            s.airTime += dt;
            s.peakAirY = Math.min(s.peakAirY, s.y);

            // Air tilt
            if (s.keys.left) s.angularVel -= 0.008;
            if (s.keys.right) s.angularVel += 0.008;
            s.angle += s.angularVel;
            s.angularVel *= 0.98;

            // Animate trick
            if (s.trickAnim) {
              s.trickProgress += dt * 4;
              if (s.trickProgress >= 1) {
                s.trickAnim = '';
              }
            }

            // Check landing
            if (s.y >= ground.y - 12 && s.vy > 0) {
              // Landing test!
              const targetAngle = ground.normalAngle;
              const angleDiff = Math.abs(s.angle - targetAngle);

              if (angleDiff > 0.85) {
                // Bail out!
                s.bailed = true;
                setIsBailed(true);
                soundEngine.playCrash();
              } else {
                // Successful landing!
                s.inAir = false;
                s.y = ground.y - 12;
                s.vy = 0;
                s.vx = Math.sign(s.vx) * Math.max(7, Math.abs(s.vx) * 0.95);
                s.angle = targetAngle;
                s.angularVel = 0;
                s.jumpTricks = [];
                s.combo = 1;
                setCurrentTrick('');
              }
            }
          } else {
            // Ground bowl riding
            s.y = ground.y - 12;
            s.angle = ground.normalAngle;

            // Pump acceleration on down-slopes (smooth and controlled)
            if (s.keys.pump) {
              s.vx += Math.sign(s.vx) * 0.18;
            }

            // Normal steering (gentle acceleration)
            if (s.keys.left) s.vx -= 0.14;
            if (s.keys.right) s.vx += 0.14;

            // Slope gravity force
            s.vx += Math.sin(ground.normalAngle) * 0.22;

            // Apply friction
            s.vx *= 0.995;
            s.x += s.vx;

            // Check ramp launch into the air
            const bowlLipY = height * 0.72 - 180;
            if (s.y <= bowlLipY + 20 && Math.abs(s.vx) > 5) {
              s.inAir = true;
              s.vy = -Math.abs(s.vx) * 1.35;
              s.vx = s.vx * 0.35; // Convert horizontal speed into vertical air
              s.airTime = 0;
              s.peakAirY = s.y;
              soundEngine.playJump();
            }
          }

          // Screen clamps
          if (s.x < width * 0.08) {
            s.x = width * 0.08;
            s.vx = Math.abs(s.vx);
          }
          if (s.x > width * 0.92) {
            s.x = width * 0.92;
            s.vx = -Math.abs(s.vx);
          }

          // UI update
          setScore(s.score);
          setTimeLeft(Math.ceil(s.roundTime));
          setComboMultiplier(s.combo);
          const airMeters = Math.max(0, parseFloat(((height * 0.72 - s.peakAirY) / 25).toFixed(1)));
          setAirHeightMeters(airMeters);
          setTotalTricksLanded(s.tricksCount);
        }

        // 2. RENDER GRAPHICS
        // Sunset Skatepark sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#311042');
        skyGrad.addColorStop(0.5, '#701a75');
        skyGrad.addColorStop(0.8, '#c026d3');
        skyGrad.addColorStop(1, '#f97316');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Sun
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(width * 0.5, height * 0.45, 60, 0, Math.PI * 2);
        ctx.fill();

        // Concrete Skatepark Bowl
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 15) {
          const g = getBowlProfile(x, width, height);
          ctx.lineTo(x, g.y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const concreteGrad = ctx.createLinearGradient(0, height * 0.5, 0, height);
        concreteGrad.addColorStop(0, '#cbd5e1');
        concreteGrad.addColorStop(1, '#64748b');
        ctx.fillStyle = concreteGrad;
        ctx.fill();

        // Ramp coping metal pipe
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 5;
        ctx.stroke();

        // 3. DRAW BMX BIKE & RIDER
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const wheelRadius = 11;
        const wheelBase = 24;

        // Draw BMX Wheels
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-wheelBase, 0, wheelRadius, 0, Math.PI * 2);
        ctx.arc(wheelBase, 0, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();

        // BMX Compact Frame
        ctx.strokeStyle = bikeColor;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-wheelBase, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(wheelBase * 0.5, -12);
        ctx.lineTo(wheelBase, 0);
        ctx.stroke();

        // BMX High Rise Handlebars (Tailwhip / Barspin anim)
        let barSpinOffset = 0;
        if (s.trickAnim === 'barspin') {
          barSpinOffset = Math.sin(s.trickProgress * Math.PI * 2) * 14;
        }

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(wheelBase * 0.5, -12);
        ctx.lineTo(wheelBase * 0.5 + barSpinOffset, -24);
        ctx.stroke();

        // Rider (Superman animation)
        if (!s.bailed) {
          let legOffsetX = 0;
          let legOffsetY = 0;

          if (s.trickAnim === 'superman') {
            // Legs stretched straight back horizontally
            legOffsetX = -32;
            legOffsetY = -18;
          }

          // Rider Torso
          ctx.strokeStyle = accentColor;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(-6, -16);
          ctx.lineTo(wheelBase * 0.3, -26);
          ctx.stroke();

          // Rider Legs
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-4, -4); // Pedals
          ctx.lineTo(-8 + legOffsetX * 0.5, -12 + legOffsetY * 0.5);
          ctx.lineTo(-6 + legOffsetX, -16 + legOffsetY);
          ctx.stroke();

          // Rider Helmet
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(wheelBase * 0.4, -34, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bikeColor, accentColor, onCoinsEarned]);

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
          <span className="text-xs font-bold text-amber-400 text-display">BMX TRICK MASTER</span>
        </div>

        {/* HUD Gauges */}
        <div className="flex items-center gap-5 text-xs font-mono-numbers">
          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500">TIME:</span>
            <span className="text-white font-bold text-sm">{timeLeft}s</span>
          </div>

          <div className="flex items-center gap-1 text-slate-300">
            <span className="text-slate-500">AIR:</span>
            <span className="text-cyan-400 font-bold">{airHeightMeters}m</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400">
            <span className="text-slate-500">SCORE:</span>
            <span className="font-bold">{score.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={resetRun}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Restart Session"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas View */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Current Trick Banner */}
        {currentTrick && (
          <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-amber-400 text-black font-extrabold px-6 py-2 rounded shadow-2xl text-display text-base tracking-wider animate-bounce pointer-events-none">
            {currentTrick}
          </div>
        )}

        {/* Bail Overlay */}
        {isBailed && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Bad Landing Angle</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-4">BAILED OUT!</h2>
            <p className="text-sm text-slate-300 mb-6 max-w-sm">
              Match the ramp curve angle before wheels hit the concrete!
            </p>
            <button
              onClick={resetRun}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded cursor-pointer"
            >
              Drop In Again
            </button>
          </div>
        )}

        {/* Round Complete Modal */}
        {isRoundOver && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center animate-fade-in">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">Session Complete</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-2">RUN FINISHED!</h2>
            <div className="text-2xl font-bold font-mono-numbers text-amber-400 mb-4">
              {score.toLocaleString()} PTS
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 max-w-xs w-full text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Total Tricks Landed:</span>
                <span className="font-mono-numbers text-white">{totalTricksLanded}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Max Air Launch:</span>
                <span className="font-mono-numbers text-cyan-400">{airHeightMeters}m</span>
              </div>
            </div>
            <button
              onClick={resetRun}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded cursor-pointer"
            >
              Play Another Run
            </button>
          </div>
        )}
      </div>

      {/* Bottom Trick Buttons for Touch & Desktop */}
      <div className="h-16 bg-slate-900/95 border-t border-slate-800 px-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (stateRef.current.keys.left = true)}
            onPointerUp={() => (stateRef.current.keys.left = false)}
            onPointerLeave={() => (stateRef.current.keys.left = false)}
            className="w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            ← LEAN
          </button>
          <button
            onPointerDown={() => (stateRef.current.keys.right = true)}
            onPointerUp={() => (stateRef.current.keys.right = false)}
            onPointerLeave={() => (stateRef.current.keys.right = false)}
            className="w-12 h-10 bg-slate-800 hover:bg-slate-700 active:bg-amber-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            LEAN →
          </button>
        </div>

        <div className="hidden sm:block text-xs text-slate-400">
          <span className="font-semibold text-slate-300">W</span> Superman ·{' '}
          <span className="font-semibold text-slate-300">Q</span> Tailwhip ·{' '}
          <span className="font-semibold text-slate-300">E</span> Barspin ·{' '}
          <span className="font-semibold text-slate-300">S</span> Pump
        </div>

        {/* Air Trick Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerTrick('tailwhip', 280, 'TAILWHIP')}
            className="px-3 h-10 bg-purple-900/80 hover:bg-purple-800 active:bg-purple-600 text-purple-200 font-bold text-xs rounded border border-purple-700 flex items-center justify-center cursor-pointer select-none"
          >
            TAILWHIP
          </button>
          <button
            onClick={() => triggerTrick('barspin', 220, 'BARSPIN')}
            className="px-3 h-10 bg-blue-900/80 hover:bg-blue-800 active:bg-blue-600 text-blue-200 font-bold text-xs rounded border border-blue-700 flex items-center justify-center cursor-pointer select-none"
          >
            BARSPIN
          </button>
          <button
            onClick={() => triggerTrick('superman', 350, 'SUPERMAN AIR')}
            className="px-3.5 h-10 bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-black font-extrabold text-xs rounded flex items-center justify-center cursor-pointer select-none shadow-md shadow-amber-500/20"
          >
            SUPERMAN 🔥
          </button>
        </div>
      </div>
    </div>
  );
};
