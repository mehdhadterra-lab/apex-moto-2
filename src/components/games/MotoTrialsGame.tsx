import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Flag, Award, Zap, ChevronLeft } from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { addCoins, updateHighScore } from '../../utils/storage';
import { BikeConfig } from '../../types/game';

interface MotoTrialsGameProps {
  bikeConfig?: BikeConfig;
  onExit: () => void;
  onCoinsEarned: (coins: number) => void;
  onMissionProgress?: (
    type: 'backflips' | 'finish_under_time' | 'coins_collected',
    amount: number,
    metadata?: { timeSeconds?: number }
  ) => void;
}

interface Point {
  x: number;
  y: number;
}

interface Checkpoint {
  x: number;
  y: number;
  passed: boolean;
}

interface Coin {
  x: number;
  y: number;
  collected: boolean;
}

export const MotoTrialsGame: React.FC<MotoTrialsGameProps> = ({
  bikeConfig,
  onExit,
  onCoinsEarned,
  onMissionProgress,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [trackIndex, setTrackIndex] = useState<number>(0);
  const [throttleMode, setThrottleMode] = useState<'slow' | 'standard'>('slow');
  const [leanSensitivity, setLeanSensitivity] = useState<'gentle' | 'balanced' | 'stunt' | 'pro'>('balanced');
  const [score, setScore] = useState<number>(0);
  const [coinsCount, setCoinsCount] = useState<number>(0);
  const [stuntMessage, setStuntMessage] = useState<string>('');
  const [isCrashed, setIsCrashed] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [flipsCount, setFlipsCount] = useState<number>(0);

  // Bike color palette from garage
  const bikeColor = bikeConfig?.color || '#f59e0b';
  const accentColor = bikeConfig?.accentColor || '#10b981';

  // Game state stored in mutable ref for 60fps loop
  const stateRef = useRef({
    x: 100,
    y: 350,
    vx: 0,
    vy: 0,
    angle: 0,
    angularVelocity: 0,
    rearSuspension: 0,
    frontSuspension: 0,
    inAir: false,
    airRotationAccumulator: 0,
    lastCheckpoint: { x: 100, y: 350, angle: 0 },
    keys: {
      up: false,
      down: false,
      left: false,
      right: false,
      jump: false,
    },
    crashed: false,
    finished: false,
    timer: 0,
    score: 0,
    coins: 0,
    stuntMsgTimer: 0,
    stuntsCount: 0,
  });

  // Track geometry generation
  const tracksRef = useRef<Point[][]>([]);
  const checkpointsRef = useRef<Checkpoint[]>([]);
  const coinsRef = useRef<Coin[]>([]);
  const finishXRef = useRef<number>(3800);

  const buildTrack = useCallback((index: number) => {
    const points: Point[] = [];
    const checkpoints: Checkpoint[] = [];
    const coins: Coin[] = [];

    let currentY = 420;
    const step = 45;
    const length = 100;

    for (let i = 0; i <= length; i++) {
      const x = i * step;

      if (index === 0) {
        // Canyon Dunes: rolling hills and jump gaps
        if (i < 8) {
          currentY = 420;
        } else if (i < 20) {
          currentY = 420 - Math.sin((i - 8) * 0.3) * 90;
        } else if (i < 30) {
          // Steep jump ramp
          currentY = 420 - (i - 20) * 12;
        } else if (i < 38) {
          // Valley drop
          currentY = 480 + (i - 30) * 8;
        } else if (i < 55) {
          // Rolling loop dunes
          currentY = 400 - Math.sin((i - 38) * 0.35) * 110;
        } else if (i < 70) {
          // Boulder stairs
          currentY = 380 - ((i - 55) % 5) * 20;
        } else if (i < 85) {
          // Huge leap ramp
          currentY = 420 - Math.sin((i - 70) * 0.25) * 140;
        } else {
          currentY = 420;
        }
      } else if (index === 1) {
        // Industrial Quarry: steps, high obstacles & planks
        if (i < 6) {
          currentY = 420;
        } else if (i < 18) {
          // Stepped pipes
          currentY = 420 - Math.floor((i - 6) / 3) * 35;
        } else if (i < 30) {
          // Sharp downhill
          currentY = 320 + (i - 18) * 12;
        } else if (i < 48) {
          // Ramp jump over pit
          if (i > 36 && i < 42) {
            currentY = 560; // deep pit
          } else {
            currentY = 380 - Math.sin((i - 30) * 0.3) * 80;
          }
        } else if (i < 70) {
          currentY = 400 - Math.sin((i - 48) * 0.4) * 120;
        } else {
          currentY = 420;
        }
      } else {
        // Alpine Ridge: wild mountain peaks
        if (i < 6) currentY = 420;
        else if (i < 25) currentY = 420 - (i - 6) * 14; // High mountain climb
        else if (i < 45) currentY = 160 + (i - 25) * 16; // Extreme downhill drop
        else if (i < 65) currentY = 460 - Math.sin((i - 45) * 0.3) * 130;
        else if (i < 85) currentY = 400 - Math.cos((i - 65) * 0.4) * 90;
        else currentY = 420;
      }

      points.push({ x, y: currentY });

      // Add checkpoints at 25%, 50%, 75%
      if (i === 24 || i === 52 || i === 76) {
        checkpoints.push({ x, y: currentY - 20, passed: false });
      }

      // Add coins along jump apexes
      if (i % 6 === 3 && i > 5 && i < 90) {
        coins.push({ x, y: currentY - 50, collected: false });
      }
    }

    finishXRef.current = length * step - 250;
    tracksRef.current[index] = points;
    checkpointsRef.current = checkpoints;
    coinsRef.current = coins;
  }, []);

  const getGroundAt = (x: number): { y: number; normalX: number; normalY: number; angle: number } => {
    const points = tracksRef.current[trackIndex];
    if (!points || points.length < 2) return { y: 500, normalX: 0, normalY: -1, angle: 0 };

    if (x <= points[0].x) return { y: points[0].y, normalX: 0, normalY: -1, angle: 0 };
    if (x >= points[points.length - 1].x) {
      return { y: points[points.length - 1].y, normalX: 0, normalY: -1, angle: 0 };
    }

    // Binary search or direct index interpolation
    const step = 45;
    const idx = Math.min(Math.max(0, Math.floor(x / step)), points.length - 2);
    const p1 = points[idx];
    const p2 = points[idx + 1];

    const t = (x - p1.x) / (p2.x - p1.x);
    const y = p1.y + t * (p2.y - p1.y);

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy) || 1;
    const normalX = -dy / len;
    const normalY = dx / len;
    const angle = Math.atan2(dy, dx);

    return { y, normalX, normalY, angle };
  };

  const resetBike = (toLastCheckpoint: boolean = false) => {
    const s = stateRef.current;
    if (toLastCheckpoint) {
      s.x = s.lastCheckpoint.x;
      s.y = s.lastCheckpoint.y - 30;
      s.angle = s.lastCheckpoint.angle;
    } else {
      s.x = 120;
      s.y = 350;
      s.angle = 0;
      s.timer = 0;
      s.score = 0;
      s.coins = 0;
      s.stuntsCount = 0;
      s.lastCheckpoint = { x: 120, y: 350, angle: 0 };
      checkpointsRef.current.forEach((cp) => (cp.passed = false));
      coinsRef.current.forEach((c) => (c.collected = false));
    }
    s.vx = 0;
    s.vy = 0;
    s.angularVelocity = 0;
    s.crashed = false;
    s.finished = false;
    s.airRotationAccumulator = 0;
    s.inAir = false;

    setIsCrashed(false);
    setIsFinished(false);
    setStuntMessage('');
  };

  useEffect(() => {
    buildTrack(trackIndex);
    resetBike(false);
  }, [trackIndex, buildTrack]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        keys.up = true;
        e.preventDefault();
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        keys.down = true;
        e.preventDefault();
      }
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keys.left = true;
        e.preventDefault();
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keys.right = true;
        e.preventDefault();
      }
      if (e.code === 'Space') {
        keys.jump = true;
        e.preventDefault();
      }
      if (e.code === 'KeyR') {
        resetBike(stateRef.current.crashed);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keys = stateRef.current.keys;
      if (['ArrowUp', 'KeyW'].includes(e.code)) keys.up = false;
      if (['ArrowDown', 'KeyS'].includes(e.code)) keys.down = false;
      if (['ArrowLeft', 'KeyA'].includes(e.code)) keys.left = false;
      if (['ArrowRight', 'KeyD'].includes(e.code)) keys.right = false;
      if (e.code === 'Space') keys.jump = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    soundEngine.startEngine(65);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      soundEngine.stopEngine();
    };
  }, []);

  // Main 60 FPS physics loop & Canvas drawing
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
        // Adjust canvas resolution dynamically
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
        }

        const width = canvas.width;
        const height = canvas.height;

        // 1. UPDATE PHYSICS (if not crashed or finished)
        if (!s.crashed && !s.finished) {
          s.timer += dt;

          const wheelBase = 32;
          const wheelRadius = 14;

          // Rear and front wheel local offsets relative to chassis center
          const cos = Math.cos(s.angle);
          const sin = Math.sin(s.angle);

          const rearX = s.x - cos * wheelBase - sin * 6;
          const rearY = s.y - sin * wheelBase + cos * 6;
          const frontX = s.x + cos * wheelBase - sin * 6;
          const frontY = s.y + sin * wheelBase + cos * 6;

          const rearGround = getGroundAt(rearX);
          const frontGround = getGroundAt(frontX);

          const rearDist = rearGround.y - rearY;
          const frontDist = frontGround.y - frontY;

          const rearContact = rearDist <= wheelRadius;
          const frontContact = frontDist <= wheelRadius;
          const anyWheelContact = rearContact || frontContact;

          // Gravity
          s.vy += 0.42;

          // Air rotation tracking for stunts
          if (!anyWheelContact) {
            if (!s.inAir) {
              s.inAir = true;
              s.airRotationAccumulator = 0;
            }
            s.airRotationAccumulator += s.angularVelocity;
          } else {
            if (s.inAir) {
              // LANDED! Check if we did a flip!
              const fullFlips = Math.round(s.airRotationAccumulator / (Math.PI * 2));
              if (Math.abs(fullFlips) >= 1) {
                const isBack = fullFlips < 0;
                const bonus = Math.abs(fullFlips) * 350;
                s.score += bonus;
                s.stuntsCount += Math.abs(fullFlips);
                const flipName = Math.abs(fullFlips) === 1 
                  ? (isBack ? 'BACKFLIP' : 'FRONTFLIP') 
                  : `DOUBLE ${isBack ? 'BACKFLIP' : 'FRONTFLIP'}`;
                setStuntMessage(`${flipName}! +${bonus} PTS`);
                s.stuntMsgTimer = 2.0;
                soundEngine.playStunt();

                if (isBack) {
                  onMissionProgress?.('backflips', Math.abs(fullFlips));
                }
              }
              s.inAir = false;
              s.airRotationAccumulator = 0;
            }
          }

          // Handle lean torque (adjustable sensitivity)
          const activeLeanTorque =
            leanSensitivity === 'gentle' ? 0.0045 :
            leanSensitivity === 'balanced' ? 0.0075 :
            leanSensitivity === 'stunt' ? 0.011 : 0.015;

          if (s.keys.left) {
            s.angularVelocity -= activeLeanTorque; // Lean back / wheelie
          }
          if (s.keys.right) {
            s.angularVelocity += activeLeanTorque; // Lean forward
          }

          // Bunnyhop
          if (s.keys.jump && anyWheelContact) {
            s.vy = -7.5;
            s.angularVelocity += (s.keys.right ? 0.03 : 0) - (s.keys.left ? 0.03 : 0);
            soundEngine.playJump();
          }

          // Drive traction on rear wheel (smooth and controlled slow acceleration)
          const isAccelerating = s.keys.up;
          if (s.keys.up) {
            if (rearContact) {
              const currentSpeed = Math.hypot(s.vx, s.vy);
              const maxAllowedSpeed = throttleMode === 'slow' ? 7.2 : 11.0;
              const drivePower = throttleMode === 'slow' ? 0.17 : 0.28;

              if (currentSpeed < maxAllowedSpeed) {
                s.vx += Math.cos(rearGround.angle) * drivePower;
                s.vy += Math.sin(rearGround.angle) * drivePower;
              }
              const wheelieTorque = throttleMode === 'slow' ? 0.0011 : 0.0022;
              s.angularVelocity -= wheelieTorque;
            } else {
              s.angularVelocity -= throttleMode === 'slow' ? 0.002 : 0.0035;
            }
          }

          // Brake
          if (s.keys.down) {
            if (anyWheelContact) {
              s.vx *= 0.92;
            }
          }

          // Wheel collisions and normal reactions
          if (rearContact) {
            const overlap = wheelRadius - rearDist;
            s.y -= rearGround.normalY * overlap * 0.5;
            s.x -= rearGround.normalX * overlap * 0.5;
            s.vy *= 0.6;
            // Align angle with ground slope
            const angleDiff = rearGround.angle - s.angle;
            s.angularVelocity += angleDiff * 0.05;
          }

          if (frontContact) {
            const overlap = wheelRadius - frontDist;
            s.y -= frontGround.normalY * overlap * 0.5;
            s.x -= frontGround.normalX * overlap * 0.5;
            s.vy *= 0.6;
            const angleDiff = frontGround.angle - s.angle;
            s.angularVelocity += angleDiff * 0.05;
          }

          // Apply drag and angular dampening
          s.vx *= 0.985;
          s.vy *= 0.985;
          s.angularVelocity *= 0.95;

          // Integrate position
          s.x += s.vx;
          s.y += s.vy;
          s.angle += s.angularVelocity;

          // Sound updates
          const speedKmh = Math.hypot(s.vx, s.vy) * 7.2;
          soundEngine.updateEngine(Math.min(speedKmh / 90, 1), isAccelerating);

          // Body contact check for crash (CRITICAL: only crash if rider's physical head or torso impacts the ground)
          const leanOffset = s.keys.left ? -6 : s.keys.right ? 6 : 0;
          const cosAngle = Math.cos(s.angle);
          const sinAngle = Math.sin(s.angle);

          // Rider helmet world position (local: x=-2 + leanOffset*1.3, y=-46)
          const localHeadX = -2 + leanOffset * 1.3;
          const localHeadY = -46;
          const headWorldX = s.x + localHeadX * cosAngle - localHeadY * sinAngle;
          const headWorldY = s.y + localHeadX * sinAngle + localHeadY * cosAngle;
          const headGround = getGroundAt(headWorldX);

          // Rider chest/torso world position (local: x=-10 + leanOffset*1.1, y=-28)
          const localChestX = -10 + leanOffset * 1.1;
          const localChestY = -28;
          const chestWorldX = s.x + localChestX * cosAngle - localChestY * sinAngle;
          const chestWorldY = s.y + localChestX * sinAngle + localChestY * cosAngle;
          const chestGround = getGroundAt(chestWorldX);

          // Physical ground penetration check (helmet radius 7px, chest radius 6px)
          const isHeadTouchingGround = headWorldY + 7 >= headGround.y;
          const isChestTouchingGround = chestWorldY + 6 >= chestGround.y;

          if (isHeadTouchingGround || isChestTouchingGround) {
            // Rider body physically contacted the ground!
            s.crashed = true;
            setIsCrashed(true);
            soundEngine.playCrash();
            soundEngine.stopEngine();
          }

          // Checkpoints
          checkpointsRef.current.forEach((cp) => {
            if (!cp.passed && s.x >= cp.x) {
              cp.passed = true;
              s.lastCheckpoint = { x: cp.x, y: cp.y, angle: 0 };
              s.score += 200;
              soundEngine.playCheckpoint();
              setStuntMessage('CHECKPOINT! +200 PTS');
              s.stuntMsgTimer = 1.5;
            }
          });

          // Coins collection
          coinsRef.current.forEach((c) => {
            if (!c.collected && Math.hypot(s.x - c.x, s.y - c.y) < 32) {
              c.collected = true;
              s.coins += 1;
              s.score += 100;
              soundEngine.playCoin();
              onMissionProgress?.('coins_collected', 1);
            }
          });

          // Finish Line Check
          if (s.x >= finishXRef.current) {
            s.finished = true;
            setIsFinished(true);
            soundEngine.playVictory();
            soundEngine.stopEngine();
            const earnedCoins = s.coins * 10 + 150;
            addCoins(earnedCoins);
            updateHighScore('trials', s.score);
            onCoinsEarned(earnedCoins);
            onMissionProgress?.('finish_under_time', 1, { timeSeconds: s.timer });
          }

          // Stunt msg timer decay
          if (s.stuntMsgTimer > 0) {
            s.stuntMsgTimer -= dt;
            if (s.stuntMsgTimer <= 0) {
              setStuntMessage('');
            }
          }

          // Sync React states at intervals
          setScore(Math.floor(s.score + s.x * 0.1));
          setCoinsCount(s.coins);
          setElapsedTime(s.timer);
          setFlipsCount(s.stuntsCount);
        }

        // 2. RENDER GRAPHICS
        // Clear background with canyon / sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        if (trackIndex === 0) {
          skyGrad.addColorStop(0, '#1e1b4b');
          skyGrad.addColorStop(0.4, '#431407');
          skyGrad.addColorStop(0.8, '#9a3412');
          skyGrad.addColorStop(1, '#ea580c');
        } else if (trackIndex === 1) {
          skyGrad.addColorStop(0, '#0f172a');
          skyGrad.addColorStop(0.5, '#1e293b');
          skyGrad.addColorStop(1, '#334155');
        } else {
          skyGrad.addColorStop(0, '#0284c7');
          skyGrad.addColorStop(0.6, '#38bdf8');
          skyGrad.addColorStop(1, '#e0f2fe');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Camera follow
        const cameraX = s.x - width * 0.35;
        const cameraY = s.y - height * 0.55;

        ctx.save();
        ctx.translate(-cameraX, -cameraY);

        // Distant Parallax Mountains
        ctx.fillStyle = trackIndex === 0 ? 'rgba(67, 20, 7, 0.4)' : 'rgba(15, 23, 42, 0.4)';
        ctx.beginPath();
        ctx.moveTo(cameraX, cameraY + height);
        for (let x = cameraX - 200; x < cameraX + width + 200; x += 150) {
          const my = 250 + Math.sin(x * 0.0015) * 80;
          ctx.lineTo(x, my);
        }
        ctx.lineTo(cameraX + width + 200, cameraY + height);
        ctx.fill();

        // Draw Ground Terrain
        const points = tracksRef.current[trackIndex] || [];
        if (points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y + 800);
          ctx.lineTo(points[0].x, points[0].y + 800);
          ctx.closePath();

          // Terrain Fill
          const terrainGrad = ctx.createLinearGradient(0, 300, 0, 700);
          if (trackIndex === 0) {
            terrainGrad.addColorStop(0, '#78350f');
            terrainGrad.addColorStop(1, '#291406');
          } else if (trackIndex === 1) {
            terrainGrad.addColorStop(0, '#475569');
            terrainGrad.addColorStop(1, '#0f172a');
          } else {
            terrainGrad.addColorStop(0, '#e2e8f0');
            terrainGrad.addColorStop(1, '#475569');
          }
          ctx.fillStyle = terrainGrad;
          ctx.fill();

          // Grass / Rock Surface Line
          ctx.strokeStyle = trackIndex === 0 ? '#b45309' : trackIndex === 1 ? '#64748b' : '#38bdf8';
          ctx.lineWidth = 6;
          ctx.stroke();
        }

        // Checkpoints flags
        checkpointsRef.current.forEach((cp) => {
          ctx.save();
          ctx.translate(cp.x, cp.y);
          // Pole
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 20);
          ctx.lineTo(0, -35);
          ctx.stroke();
          // Flag cloth
          ctx.fillStyle = cp.passed ? '#10b981' : '#ef4444';
          ctx.beginPath();
          ctx.moveTo(0, -35);
          ctx.lineTo(24, -26);
          ctx.lineTo(0, -17);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        });

        // Floating Coins
        const timePulse = Date.now() * 0.005;
        coinsRef.current.forEach((c) => {
          if (!c.collected) {
            ctx.save();
            ctx.translate(c.x, c.y + Math.sin(timePulse) * 4);
            const scaleX = Math.cos(timePulse * 1.5);
            ctx.scale(scaleX, 1);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fef3c7';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
          }
        });

        // Finish Line
        ctx.save();
        ctx.translate(finishXRef.current, getGroundAt(finishXRef.current).y);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -70);
        ctx.stroke();
        // Checkered banner
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, -70, 36, 24);
        ctx.fillStyle = '#ffffff';
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 4; c++) {
            if ((r + c) % 2 === 0) {
              ctx.fillRect(c * 9, -70 + r * 8, 9, 8);
            }
          }
        }
        ctx.restore();

        // 3. DRAW BIKE & RIDER
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        const wheelRadius = 14;
        const wheelBase = 32;

        // Exhaust dust/flame particles
        if (s.keys.up && !s.crashed) {
          ctx.fillStyle = bikeConfig?.trailType === 'fire' ? '#ef4444' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(-wheelBase - 8 + (Math.random() - 0.5) * 6, 6 + (Math.random() - 0.5) * 6, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Rear Wheel
        ctx.save();
        ctx.translate(-wheelBase, 6);
        ctx.rotate(s.x * 0.1);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Spokes
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-wheelRadius + 2, 0);
        ctx.lineTo(wheelRadius - 2, 0);
        ctx.moveTo(0, -wheelRadius + 2);
        ctx.lineTo(0, wheelRadius - 2);
        ctx.stroke();
        ctx.restore();

        // Draw Front Wheel
        ctx.save();
        ctx.translate(wheelBase, 6);
        ctx.rotate(s.x * 0.1);
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, 0, wheelRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-wheelRadius + 2, 0);
        ctx.lineTo(wheelRadius - 2, 0);
        ctx.moveTo(0, -wheelRadius + 2);
        ctx.lineTo(0, wheelRadius - 2);
        ctx.stroke();
        ctx.restore();

        // Bike Frame / Swingarm
        ctx.strokeStyle = bikeColor;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(-wheelBase, 6); // Rear axle
        ctx.lineTo(-8, -6); // Engine center
        ctx.lineTo(14, -14); // Steering head
        ctx.lineTo(wheelBase, 6); // Front fork
        ctx.stroke();

        // Top tube & Tank
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(-16, -10); // Seat
        ctx.lineTo(12, -14); // Tank
        ctx.stroke();

        // Handlebars
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(12, -14);
        ctx.lineTo(10, -26); // Bar rise
        ctx.stroke();

        // Rider (unless crashed)
        if (!s.crashed) {
          const leanOffset = s.keys.left ? -6 : s.keys.right ? 6 : 0;

          // Leg (Footpeg to hip)
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(-6, -4); // Footpeg
          ctx.lineTo(-12 + leanOffset, -18); // Knee
          ctx.lineTo(-16 + leanOffset, -22); // Hip
          ctx.stroke();

          // Torso
          ctx.strokeStyle = bikeColor;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(-16 + leanOffset, -22); // Hip
          ctx.lineTo(-6 + leanOffset * 1.2, -38); // Shoulders
          ctx.stroke();

          // Arms (Shoulders to handlebar)
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-6 + leanOffset * 1.2, -38);
          ctx.lineTo(10, -26); // Hands on bar
          ctx.stroke();

          // Helmet / Head
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-2 + leanOffset * 1.3, -46, 8, 0, Math.PI * 2);
          ctx.fill();
          // Helmet Visor
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(3 + leanOffset * 1.3, -46, 5, -Math.PI * 0.3, Math.PI * 0.3);
          ctx.fill();
        }

        ctx.restore(); // Restore bike translate/rotate
        ctx.restore(); // Restore camera translate

        // 4. ON-SCREEN HUD OVERLAY (Canvas UI)
        // Top Left: Speed and Time
        ctx.fillStyle = 'rgba(11, 15, 23, 0.7)';
        ctx.fillRect(16, 16, 210, 64);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(16, 16, 210, 64);

        ctx.fillStyle = '#ffffff';
        ctx.font = '700 18px "Chakra Petch", sans-serif';
        const speedKmh = Math.floor(Math.hypot(s.vx, s.vy) * 7.2);
        ctx.fillText(`${speedKmh} KM/H`, 28, 42);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 12px "JetBrains Mono", monospace';
        ctx.fillText(`TIME: ${s.timer.toFixed(1)}s  ·  COINS: ${s.coins}`, 28, 64);

        // Top Right: Score
        ctx.fillStyle = 'rgba(11, 15, 23, 0.7)';
        ctx.fillRect(width - 180, 16, 164, 64);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.strokeRect(width - 180, 16, 164, 64);

        ctx.fillStyle = '#fbbf24';
        ctx.font = '700 20px "JetBrains Mono", monospace';
        ctx.fillText(`${Math.floor(s.score + s.x * 0.1)}`, width - 168, 44);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '500 12px "Chakra Petch", sans-serif';
        ctx.fillText(`TRACK ${trackIndex + 1}/3`, width - 168, 64);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [trackIndex, throttleMode, leanSensitivity, bikeColor, accentColor, bikeConfig, onCoinsEarned, onMissionProgress]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[620px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col select-none"
    >
      {/* Top Bar for Game Options */}
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
          <span className="text-xs font-bold text-amber-400 text-display">MOTO TRIALS EXTREME</span>
        </div>

        {/* Throttle Pace, Lean Sensitivity & Track selector controls */}
        <div className="flex items-center gap-2">
          {/* Throttle Pace Control */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-md text-xs font-medium border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Speed:</span>
            <button
              onClick={() => setThrottleMode('slow')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                throttleMode === 'slow' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Smooth, slow controlled acceleration"
            >
              Slow Pace
            </button>
            <button
              onClick={() => setThrottleMode('standard')}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                throttleMode === 'standard' ? 'bg-amber-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Standard
            </button>
          </div>

          {/* Adjustable Lean Sensitivity Control */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-md text-xs font-medium border border-slate-700/50">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Lean:</span>
            <button
              onClick={() => setLeanSensitivity('gentle')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
                leanSensitivity === 'gentle' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Gentle, super-stable lean tilt"
            >
              Gentle
            </button>
            <button
              onClick={() => setLeanSensitivity('balanced')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
                leanSensitivity === 'balanced' ? 'bg-amber-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Balanced standard lean"
            >
              Balanced
            </button>
            <button
              onClick={() => setLeanSensitivity('stunt')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
                leanSensitivity === 'stunt' ? 'bg-purple-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Snappy stunt rotation"
            >
              Stunt
            </button>
            <button
              onClick={() => setLeanSensitivity('pro')}
              className={`px-1.5 py-0.5 rounded transition-colors cursor-pointer text-[11px] ${
                leanSensitivity === 'pro' ? 'bg-red-500 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
              title="Extreme fast rotation"
            >
              Pro
            </button>
          </div>

          {/* Track selector segmented control */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-md text-xs font-medium">
            <button
              onClick={() => setTrackIndex(0)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                trackIndex === 0 ? 'bg-amber-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Canyon Dunes
            </button>
            <button
              onClick={() => setTrackIndex(1)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                trackIndex === 1 ? 'bg-amber-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Quarry Obstacles
            </button>
            <button
              onClick={() => setTrackIndex(2)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                trackIndex === 2 ? 'bg-amber-400 text-black font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Alpine Ridge
            </button>
          </div>
        </div>

        <button
          onClick={() => resetBike(false)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
          title="Restart Track (R)"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Game Canvas */}
      <div className="relative flex-1 w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

        {/* Floating Stunt Banner */}
        {stuntMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-400/95 text-black font-extrabold px-6 py-2 rounded shadow-2xl text-display text-lg tracking-wider animate-bounce pointer-events-none">
            {stuntMessage}
          </div>
        )}

        {/* Crash Overlay */}
        {isCrashed && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center z-30 animate-fade-in p-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Impact Detected</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-4">WIPEOUT!</h2>
            <p className="text-sm text-slate-300 mb-6 max-w-sm">
              Keep the wheels under you! Lean back on steep descents and balance your flips.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => resetBike(true)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
              >
                Respawn Checkpoint
              </button>
              <button
                onClick={() => resetBike(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded transition-colors cursor-pointer"
              >
                Restart Track
              </button>
            </div>
            <span className="text-xs text-slate-500 mt-4">Shortcut: Press &apos;R&apos; to respawn</span>
          </div>
        )}

        {/* Finish / Victory Modal */}
        {isFinished && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6 text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Course Complete</span>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white text-display mb-2">VICTORY!</h2>
            <div className="text-2xl font-bold font-mono-numbers text-amber-400 mb-4">
              {score} PTS
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6 max-w-xs w-full text-left text-xs space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Time:</span>
                <span className="font-mono-numbers text-white">{elapsedTime.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Flips Landed:</span>
                <span className="font-mono-numbers text-white">{flipsCount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coins Collected:</span>
                <span className="font-mono-numbers text-amber-400">+{coinsCount * 10}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setTrackIndex((prev) => (prev + 1) % 3);
                  resetBike(false);
                }}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded cursor-pointer"
              >
                Next Track
              </button>
              <button
                onClick={() => resetBike(false)}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs rounded cursor-pointer"
              >
                Replay Course
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Mobile / Touch Controls Bar */}
      <div className="h-16 bg-slate-900/95 border-t border-slate-800 px-4 flex items-center justify-between z-20">
        {/* Lean Buttons */}
        <div className="flex items-center gap-1.5">
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
          <button
            onClick={() => {
              setLeanSensitivity((prev) =>
                prev === 'gentle' ? 'balanced' :
                prev === 'balanced' ? 'stunt' :
                prev === 'stunt' ? 'pro' : 'gentle'
              );
            }}
            className="h-10 px-2 bg-slate-800 hover:bg-slate-700 text-amber-400 font-mono-numbers text-[10px] uppercase font-bold rounded border border-slate-700 flex flex-col items-center justify-center cursor-pointer select-none"
            title="Cycle lean sensitivity"
          >
            <span>TILT:</span>
            <span className="text-white">{leanSensitivity.slice(0, 3).toUpperCase()}</span>
          </button>
        </div>

        {/* Center Tip */}
        <div className="hidden sm:block text-xs text-slate-400">
          <span className="font-semibold text-slate-300">W / ↑</span> Gas ·{' '}
          <span className="font-semibold text-slate-300">S / ↓</span> Brake ·{' '}
          <span className="font-semibold text-slate-300">A / D</span> Tilt ·{' '}
          <span className="font-semibold text-slate-300">Space</span> Hop
        </div>

        {/* Gas, Brake & Hop Buttons */}
        <div className="flex items-center gap-2">
          <button
            onPointerDown={() => (stateRef.current.keys.jump = true)}
            onPointerUp={() => (stateRef.current.keys.jump = false)}
            onPointerLeave={() => (stateRef.current.keys.jump = false)}
            className="w-11 h-10 bg-slate-800 hover:bg-slate-700 active:bg-cyan-500 active:text-black text-slate-200 font-bold text-xs rounded border border-slate-700 flex items-center justify-center cursor-pointer select-none"
          >
            HOP
          </button>
          <button
            onPointerDown={() => (stateRef.current.keys.down = true)}
            onPointerUp={() => (stateRef.current.keys.down = false)}
            onPointerLeave={() => (stateRef.current.keys.down = false)}
            className="w-11 h-10 bg-red-950/80 hover:bg-red-900 active:bg-red-600 text-red-200 font-bold text-xs rounded border border-red-800 flex items-center justify-center cursor-pointer select-none"
          >
            BRAKE
          </button>
          <button
            onPointerDown={() => (stateRef.current.keys.up = true)}
            onPointerUp={() => (stateRef.current.keys.up = false)}
            onPointerLeave={() => (stateRef.current.keys.up = false)}
            className="w-14 h-10 bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-black font-extrabold text-xs rounded flex items-center justify-center cursor-pointer select-none shadow-md shadow-amber-500/20"
          >
            GAS ▲
          </button>
        </div>
      </div>
    </div>
  );
};
