import React, { useState, useEffect } from 'react';
import { BIKES } from '../data/bikes';
import { BikeConfig, PlayerProgress } from '../types/game';
import { soundEngine } from '../utils/audio';
import { BikeRenderer } from './BikeRenderer';
import {
  Check,
  Lock,
  Sparkles,
  Wrench,
  Volume2,
  Gauge,
  RotateCw,
  Trophy,
  Zap,
  Flame,
  Sun,
  Palette,
  SlidersHorizontal,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Activity,
  Play,
  RotateCcw,
} from 'lucide-react';
import garageBg from '../assets/images/garage_workshop_bay_1791450273226.jpg';

interface GarageViewProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onPlayGame: () => void;
}

const PRESET_COLORS = [
  { name: 'Factory Amber / Gold', hex: '#f59e0b' },
  { name: 'Rosso Corsa Racing Red', hex: '#ef4444' },
  { name: 'Hyper Neon Cyan', hex: '#00f0ff' },
  { name: 'Acid Toxic Lime', hex: '#84cc16' },
  { name: 'Ultra Violet Metallic', hex: '#a855f7' },
  { name: 'Nardo Asphalt Gray', hex: '#475569' },
  { name: 'Pure Pearl White', hex: '#f8fafc' },
  { name: 'Midnight Obsidian Black', hex: '#090d16' },
];

const PRESET_ACCENTS = [
  { name: 'Brembo Racing Red', hex: '#dc2626' },
  { name: 'Ohlins Gold Anodized', hex: '#eab308' },
  { name: 'Electric Sky Blue', hex: '#38bdf8' },
  { name: 'Emerald Caliper Green', hex: '#10b981' },
  { name: 'Fluo Hot Pink', hex: '#ec4899' },
  { name: 'Titanium Platinum', hex: '#cbd5e1' },
];

const UPGRADE_NAMES = {
  engine: { label: 'ECU Stage Remap', desc: '+Top Speed & Peak HP', costPerStage: 350 },
  tire: { label: 'Racing Compound Tires', desc: '+Agility & Corner Grip', costPerStage: 280 },
  suspension: { label: 'Pro Suspension Springs', desc: '+Suspension Travel & Stability', costPerStage: 260 },
  nitro: { label: 'Nitrous Boost Injector', desc: '+Acceleration & Power Surge', costPerStage: 320 },
};

export const GarageView: React.FC<GarageViewProps> = ({
  progress,
  onUpdateProgress,
  onPlayGame,
}) => {
  const [selectedBikeId, setSelectedBikeId] = useState<string>(
    progress.selectedBikeId || BIKES[0].id
  );
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [turntableAngle, setTurntableAngle] = useState<number>(0);
  const [isAutoSpin, setIsAutoSpin] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [lightingMode, setLightingMode] = useState<'neon' | 'golden' | 'cyber' | 'studio'>('neon');
  const [isRevving, setIsRevving] = useState<boolean>(false);
  const [revRpm, setRevRpm] = useState<number>(1200);
  const [activeTab, setActiveTab] = useState<'dyno' | 'customizer' | 'tuning'>('dyno');

  const currentBike = BIKES.find((b) => b.id === selectedBikeId) || BIKES[0];
  const equippedBike = BIKES.find((b) => b.id === progress.selectedBikeId) || BIKES[0];

  const currentCustomization = progress.bikeCustomizations[selectedBikeId] || {
    color: currentBike.color,
    accentColor: currentBike.accentColor,
    trailType: currentBike.trailType,
  };

  const bikeUpgrades = (progress.bikeUpgrades && progress.bikeUpgrades[selectedBikeId]) || {
    engineStage: 0,
    tireStage: 0,
    suspensionStage: 0,
    nitroStage: 0,
  };

  const isUnlocked = progress.unlockedBikes.includes(selectedBikeId);
  const isEquipped = progress.selectedBikeId === selectedBikeId;

  // Auto turntable rotation loop
  useEffect(() => {
    if (!isAutoSpin) return;
    const interval = setInterval(() => {
      setTurntableAngle((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [isAutoSpin]);

  // Audio testing and RPM tachometer animation for selected machine
  const handleTestRev = () => {
    if (isRevving) return;
    setIsRevving(true);
    soundEngine.playBikeRev(currentBike.soundType);

    // Animate tachometer needle
    const maxRpm = currentBike.soundType === 'inline4' ? 15500 : currentBike.soundType === 'vtwin' ? 6500 : 10500;
    setRevRpm(maxRpm);

    setTimeout(() => {
      setRevRpm(maxRpm * 0.7);
    }, 350);

    setTimeout(() => {
      setRevRpm(1200);
      setIsRevving(false);
    }, 850);
  };

  const handleSelectColor = (colorHex: string) => {
    soundEngine.playCoin();
    const updated: PlayerProgress = {
      ...progress,
      bikeCustomizations: {
        ...progress.bikeCustomizations,
        [selectedBikeId]: {
          ...currentCustomization,
          color: colorHex,
        },
      },
    };
    onUpdateProgress(updated);
  };

  const handleSelectAccent = (accentHex: string) => {
    soundEngine.playCoin();
    const updated: PlayerProgress = {
      ...progress,
      bikeCustomizations: {
        ...progress.bikeCustomizations,
        [selectedBikeId]: {
          ...currentCustomization,
          accentColor: accentHex,
        },
      },
    };
    onUpdateProgress(updated);
  };

  const handleSelectTrail = (trailType: string) => {
    soundEngine.playNitro();
    const updated: PlayerProgress = {
      ...progress,
      bikeCustomizations: {
        ...progress.bikeCustomizations,
        [selectedBikeId]: {
          ...currentCustomization,
          trailType,
        },
      },
    };
    onUpdateProgress(updated);
  };

  const handleEquip = () => {
    soundEngine.playStunt();
    const updated: PlayerProgress = {
      ...progress,
      selectedBikeId,
    };
    onUpdateProgress(updated);
  };

  const handleUnlock = () => {
    if (progress.coins >= currentBike.cost && !isUnlocked) {
      soundEngine.playVictory();
      const updated: PlayerProgress = {
        ...progress,
        coins: progress.coins - currentBike.cost,
        unlockedBikes: [...progress.unlockedBikes, selectedBikeId],
        selectedBikeId,
      };
      onUpdateProgress(updated);
    }
  };

  const handleUpgrade = (type: 'engine' | 'tire' | 'suspension' | 'nitro') => {
    const key = `${type}Stage` as keyof typeof bikeUpgrades;
    const currentStage = bikeUpgrades[key];
    if (currentStage >= 3) return;

    const cost = UPGRADE_NAMES[type].costPerStage * (currentStage + 1);
    if (progress.coins < cost) return;

    soundEngine.playVictory();
    const updatedUpgrades = {
      ...bikeUpgrades,
      [key]: currentStage + 1,
    };

    const updated: PlayerProgress = {
      ...progress,
      coins: progress.coins - cost,
      bikeUpgrades: {
        ...(progress.bikeUpgrades || {}),
        [selectedBikeId]: updatedUpgrades,
      },
    };
    onUpdateProgress(updated);
  };

  // Filter bikes
  const categoriesList = [
    { id: 'all', label: 'All 10 Tiers' },
    { id: 'dirt', label: 'Dirt & Enduro' },
    { id: 'street', label: 'Classic & Street' },
    { id: 'superbike', label: 'Track Superbikes' },
    { id: 'special', label: 'BMX & Prototype' },
  ];

  const filteredBikes = BIKES.filter((b) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'dirt') return b.category === 'Dirt Trial' || b.category === 'Adventure Rally';
    if (activeCategory === 'street') return b.category === 'Classic' || b.category === 'Cruiser';
    if (activeCategory === 'superbike') return b.category === 'Superbike';
    if (activeCategory === 'special') return b.category === 'BMX' || b.category === 'Cyber';
    return true;
  });

  // Calculate unlocked collection summary
  const unlockedCount = BIKES.filter((b) => progress.unlockedBikes.includes(b.id)).length;
  const collectionPercent = Math.round((unlockedCount / BIKES.length) * 100);

  // Dyno comparisons against equipped bike
  const speedDiff = ((currentBike.topSpeed - equippedBike.topSpeed) * 28).toFixed(0);
  const hpDiff = ((currentBike.horsepower || 50) - (equippedBike.horsepower || 50));
  const weightDiff = ((currentBike.weightKg || 150) - (equippedBike.weightKg || 150));

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Racing Bay Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold tracking-wider uppercase text-amber-400 font-mono-numbers bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Pro Motorsport Engineering Bay
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              {unlockedCount} / {BIKES.length} Machines In Hangar
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-display uppercase tracking-tight">
            Championship Superbike Garage
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            10 progressive factory machines spanning lightweight trials to 340HP experimental hyperbikes. Tune components, test acoustics, and equip for all tracks.
          </p>
        </div>

        {/* Financial telemetry and Launch button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3.5 py-2 bg-slate-900 border border-amber-500/30 rounded-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="text-xs text-slate-400 font-mono-numbers">
              RACING FUNDS:{' '}
              <span className="font-extrabold text-amber-300 text-sm">
                {progress.coins.toLocaleString()} COINS
              </span>
            </div>
          </div>

          <button
            onClick={onPlayGame}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-extrabold uppercase tracking-wider text-xs rounded-lg transition-all cursor-pointer shadow-lg shadow-amber-500/20 flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Launch Track</span>
          </button>
        </div>
      </div>

      {/* Fleet Collection Progress Bar */}
      <div className="mb-8 bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400/10 text-amber-400 rounded-lg border border-amber-400/20">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>Hangar Collection Roster</span>
              <span className="text-amber-400 font-mono-numbers font-extrabold">{collectionPercent}% Complete</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Own all 10 championship bikes to achieve Legendary Apex Status
            </div>
          </div>
        </div>

        <div className="w-full sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500 rounded-full"
            style={{ width: `${collectionPercent}%` }}
          />
        </div>
      </div>

      {/* Main Grid: Machine Roster on Left, Interactive Showroom & Workshop on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 10 Machines Progressive Roster */}
        <div className="lg:col-span-5 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto text-xs font-medium">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Machine List Cards */}
          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredBikes.map((bike) => {
              const unlocked = progress.unlockedBikes.includes(bike.id);
              const active = selectedBikeId === bike.id;
              const equipped = progress.selectedBikeId === bike.id;
              const custom = progress.bikeCustomizations[bike.id] || {
                color: bike.color,
                accentColor: bike.accentColor,
              };
              const affordable = progress.coins >= bike.cost;

              return (
                <button
                  key={bike.id}
                  onClick={() => setSelectedBikeId(bike.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group relative overflow-hidden ${
                    active
                      ? 'bg-slate-800/95 border-amber-400 shadow-xl shadow-amber-500/10 ring-1 ring-amber-400/50'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  {/* Subtle active bike glow accent */}
                  {active && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                  )}

                  <div className="flex items-center gap-3 pl-1">
                    {/* Tier badge & Color swatch */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <span className="text-[10px] font-mono-numbers font-extrabold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-400">
                        T{bike.tier}
                      </span>
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-white/50 shadow-sm"
                        style={{ backgroundColor: custom.color }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white text-display text-sm group-hover:text-amber-300 transition-colors">
                          {bike.name}
                        </span>
                        {equipped && (
                          <span className="text-[9px] font-mono-numbers px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                            EQUIPPED
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono-numbers">
                        <span>{bike.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-slate-300 font-semibold">{bike.topSpeedKmh || bike.topSpeed * 28} km/h</span>
                        <span aria-hidden="true">·</span>
                        <span>{bike.horsepower} HP</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {unlocked ? (
                      <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono-numbers">
                        Unlocked
                      </span>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-xs text-amber-400 font-mono-numbers font-bold">
                          <Lock className="w-3 h-3" />
                          <span>{bike.cost.toLocaleString()}</span>
                        </div>
                        <span
                          className={`text-[9px] font-mono-numbers ${
                            affordable ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {affordable ? 'Can Buy' : `Need ${(bike.cost - progress.coins).toLocaleString()}`}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: High-Tech Turntable Bay & Workshop Tabs */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-xl border border-slate-800/80 p-5 flex flex-col gap-6">
          {/* Main 360° Studio Showcase Turntable */}
          <div className="relative aspect-video w-full rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between p-4 shadow-2xl bg-gradient-to-b from-[#090d16] via-[#090d16]/90 to-[#050811]">
            {/* Workshop Bay Backdrop Image */}
            <img
              src={garageBg}
              alt="Motorsport Tuning Bay"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-[1px] pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-[#090d16]/80 pointer-events-none" />

            {/* Turntable Lighting Grid Ring */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className="w-96 h-36 rounded-[100%] border-2 transition-all duration-300"
                style={{
                  borderColor:
                    lightingMode === 'neon'
                      ? 'rgba(0, 240, 255, 0.25)'
                      : lightingMode === 'golden'
                      ? 'rgba(245, 158, 11, 0.25)'
                      : lightingMode === 'cyber'
                      ? 'rgba(236, 72, 153, 0.3)'
                      : 'rgba(255, 255, 255, 0.15)',
                  boxShadow:
                    lightingMode === 'neon'
                      ? '0 0 60px rgba(0,240,255,0.15)'
                      : lightingMode === 'golden'
                      ? '0 0 60px rgba(245,158,11,0.15)'
                      : '0 0 60px rgba(236,72,153,0.15)',
                  transform: `rotateX(68deg) rotateZ(${turntableAngle}deg)`,
                }}
              />
            </div>

            {/* Top Showcase Toolbar */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 font-mono-numbers bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Tier {currentBike.tier} Championship Class
                  </span>
                  <span className="text-xs text-slate-400 font-mono-numbers">
                    {currentBike.topSpeedKmh} km/h Max
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white text-display mt-0.5">
                  {currentBike.name}
                </h3>
              </div>

              {/* Status Badge or Equip/Unlock Action */}
              <div>
                {isEquipped ? (
                  <span className="text-xs font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>EQUIPPED IN RACES</span>
                  </span>
                ) : isUnlocked ? (
                  <button
                    onClick={handleEquip}
                    className="text-xs font-extrabold text-black bg-amber-400 hover:bg-amber-300 px-4 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-amber-500/20 active:scale-95 uppercase tracking-wider"
                  >
                    Equip Ride
                  </button>
                ) : (
                  <button
                    onClick={handleUnlock}
                    disabled={progress.coins < currentBike.cost}
                    className={`text-xs font-extrabold px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider ${
                      progress.coins >= currentBike.cost
                        ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20 active:scale-95'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Unlock ({currentBike.cost.toLocaleString()} Coins)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Center Realistic Motorcycle Profile Graphic */}
            <div className="relative z-10 w-full max-w-lg mx-auto my-auto py-2 flex items-center justify-center">
              <BikeRenderer
                bike={currentBike}
                customColor={currentCustomization.color}
                customAccent={currentCustomization.accentColor}
                interactiveTurntableAngle={turntableAngle}
                scale={zoomLevel}
                lightingMode={lightingMode}
                isRevving={isRevving}
              />
            </div>

            {/* Bottom Showcase Controls: Rev Engine, Camera Rotation, Lighting */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
              {/* Rev & Turntable Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleTestRev}
                  className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 font-extrabold cursor-pointer uppercase text-xs ${
                    isRevving
                      ? 'bg-amber-400 text-black border-amber-400 scale-95 shadow-lg shadow-amber-500/30'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  title="Test motor acoustic rumble and tachometer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isRevving ? 'Revving...' : 'Rev Motor'}</span>
                </button>

                <button
                  onClick={() => setIsAutoSpin(!isAutoSpin)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono-numbers transition-colors cursor-pointer flex items-center gap-1 ${
                    isAutoSpin
                      ? 'bg-amber-400/20 text-amber-300 border-amber-500/40 font-bold'
                      : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  title="Toggle 360 degree turntable auto-spin"
                >
                  <RotateCw className="w-3 h-3" />
                  <span>{isAutoSpin ? 'Spinning' : '360°'}</span>
                </button>

                <button
                  onClick={() => setZoomLevel((z) => (z === 1 ? 1.25 : z === 1.25 ? 1.45 : 1))}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 text-slate-300 hover:text-white cursor-pointer font-mono-numbers text-xs"
                  title="Inspect chassis details"
                >
                  {zoomLevel}x Zoom
                </button>
              </div>

              {/* Live Tachometer RPM Readout */}
              <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 font-mono-numbers text-[11px]">
                <Activity className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-slate-400">RPM:</span>
                <span className={`font-extrabold ${isRevving ? 'text-amber-400' : 'text-slate-200'}`}>
                  {revRpm.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{currentBike.soundType?.replace('_', ' ')}</span>
              </div>

              {/* Lighting Mode Picker */}
              <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800 text-[11px]">
                <span className="text-slate-400 px-1 text-[10px] uppercase font-mono-numbers">Lighting:</span>
                {(['neon', 'golden', 'cyber', 'studio'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setLightingMode(mode)}
                    className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                      lightingMode === mode
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Workshop Secondary Tabs: Dyno Specs, Customizer, Stage Tuning */}
          <div className="border-b border-slate-800 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('dyno')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'dyno'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gauge className="w-4 h-4" />
              <span>Performance Dyno &amp; Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('customizer')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'customizer'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Paint Studio &amp; Trail FX</span>
            </button>

            <button
              onClick={() => setActiveTab('tuning')}
              className={`px-4 py-2 text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === 'tuning'
                  ? 'border-amber-400 text-amber-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Stage Upgrades</span>
            </button>
          </div>

          {/* TAB 1: DYNO & TECHNICAL TELEMETRY */}
          {activeTab === 'dyno' && (
            <div className="space-y-5">
              {/* 5 Core Performance Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono-numbers">
                    <span>Top Speed</span>
                    <span className="text-white font-extrabold">{currentBike.topSpeedKmh || currentBike.topSpeed * 28} km/h</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${currentBike.topSpeed * 10}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono-numbers">
                    <span>Acceleration</span>
                    <span className="text-white font-extrabold">{currentBike.acceleration}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 rounded-full"
                      style={{ width: `${currentBike.acceleration * 10}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono-numbers">
                    <span>Agility &amp; Lean</span>
                    <span className="text-white font-extrabold">{currentBike.agility}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${currentBike.agility * 10}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono-numbers">
                    <span>Suspension</span>
                    <span className="text-white font-extrabold">{currentBike.suspension}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-400 rounded-full"
                      style={{ width: `${currentBike.suspension * 10}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono-numbers">
                    <span>Braking</span>
                    <span className="text-white font-extrabold">{currentBike.brakingPower || 7}/10</span>
                  </div>
                  <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full"
                      style={{ width: `${(currentBike.brakingPower || 7) * 10}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Comparative Telemetry vs Active Equipped Ride */}
              {!isEquipped && (
                <div className="bg-slate-950/50 border border-slate-800/80 p-3.5 rounded-xl flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                    <span className="text-slate-300">
                      Comparison vs equipped <strong className="text-white">{equippedBike.name}</strong>:
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono-numbers font-bold">
                    <span className={Number(speedDiff) >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {Number(speedDiff) >= 0 ? `+${speedDiff}` : speedDiff} km/h speed
                    </span>
                    <span className={hpDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {hpDiff >= 0 ? `+${hpDiff}` : hpDiff} HP
                    </span>
                    <span className={weightDiff <= 0 ? 'text-emerald-400' : 'text-amber-400'}>
                      {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                    </span>
                  </div>
                </div>
              )}

              {/* Detailed Technical Specs Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Engine Type</span>
                  <span className="text-slate-200 font-semibold">{currentBike.engineType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Horsepower</span>
                  <span className="text-amber-400 font-mono-numbers font-bold">{currentBike.horsepower} HP</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Curb Weight</span>
                  <span className="text-slate-200 font-mono-numbers">{currentBike.weightKg} kg</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">0-100 km/h Launch</span>
                  <span className="text-cyan-400 font-mono-numbers font-bold">{currentBike.zeroToHundred || '3.5s'}</span>
                </div>
              </div>

              {/* Machine Prose Description */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-lg border border-slate-800/60">
                {currentBike.description}
              </div>
            </div>
          )}

          {/* TAB 2: PAINT STUDIO & TRAIL FX */}
          {activeTab === 'customizer' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Primary Fairings / Chassis Paint */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Fairings &amp; Frame Paint
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => handleSelectColor(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          currentCustomization.color === c.hex
                            ? 'border-white scale-120 shadow-lg shadow-amber-500/20'
                            : 'border-transparent hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Accent Calipers & Wheel Rims */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Wheel Rim &amp; Calipers
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_ACCENTS.map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => handleSelectAccent(c.hex)}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                        className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                          currentCustomization.accentColor === c.hex
                            ? 'border-white scale-120 shadow-lg shadow-cyan-500/20'
                            : 'border-transparent hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Exhaust Particle FX */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                    Exhaust Particle Trail
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['dust', 'fire', 'neon', 'smoke'].map((trail) => (
                      <button
                        key={trail}
                        onClick={() => handleSelectTrail(trail)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg capitalize border transition-all cursor-pointer ${
                          currentCustomization.trailType === trail
                            ? 'bg-amber-400 text-black font-extrabold border-amber-400 shadow-md shadow-amber-500/20'
                            : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {trail} Plume
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Custom colors and particle exhaust trails persist into all 4 playable game tracks automatically.</span>
              </div>
            </div>
          )}

          {/* TAB 3: STAGE PERFORMANCE UPGRADES */}
          {activeTab === 'tuning' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(['engine', 'tire', 'suspension', 'nitro'] as const).map((type) => {
                  const info = UPGRADE_NAMES[type];
                  const stageKey = `${type}Stage` as keyof typeof bikeUpgrades;
                  const currentStage = bikeUpgrades[stageKey];
                  const nextCost = info.costPerStage * (currentStage + 1);
                  const isMax = currentStage >= 3;
                  const canAfford = progress.coins >= nextCost;

                  return (
                    <div
                      key={type}
                      className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-white text-sm">{info.label}</span>
                          <span className="text-xs font-mono-numbers font-bold text-amber-400">
                            Stage {currentStage} / 3
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{info.desc}</p>
                      </div>

                      {/* Stage Pip Indicators */}
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((s) => (
                          <div
                            key={s}
                            className={`flex-1 h-1.5 rounded-full ${
                              currentStage >= s ? 'bg-amber-400' : 'bg-slate-800'
                            }`}
                          />
                        ))}
                      </div>

                      <div>
                        {isMax ? (
                          <span className="text-xs text-emerald-400 font-bold block text-center py-1.5 bg-emerald-950/40 rounded border border-emerald-900/60">
                            MAX STAGE REACHED
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(type)}
                            disabled={!canAfford}
                            className={`w-full py-1.5 px-3 rounded-lg text-xs font-extrabold uppercase transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              canAfford
                                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-md shadow-amber-500/20 active:scale-95'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                            }`}
                          >
                            <span>Upgrade ({nextCost.toLocaleString()} Coins)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
