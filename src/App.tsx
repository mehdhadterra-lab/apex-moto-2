import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { GameCard } from './components/GameCard';
import { DailyMissionsView } from './components/DailyMissionsView';
import { GarageView } from './components/GarageView';
import { LeaderboardView } from './components/LeaderboardView';
import { ControlsGuide } from './components/ControlsGuide';
import { DailyStreakModal } from './components/DailyStreakModal';
import { Footer } from './components/Footer';

import { MotoTrialsGame } from './components/games/MotoTrialsGame';
import { HighwayRacerGame } from './components/games/HighwayRacerGame';
import { BMXFreestyleGame } from './components/games/BMXFreestyleGame';
import { CyberBikeGame } from './components/games/CyberBikeGame';

import { GAMES } from './data/games';
import { BIKES } from './data/bikes';
import { GameId, PlayerProgress, BikeConfig, DailyMission } from './types/game';
import { loadPlayerProgress, savePlayerProgress } from './utils/storage';
import { recordMissionProgress, getTodayDateString } from './utils/missions';
import { getCurrentMultiplier, calculateMultipliedCoins } from './utils/streak';
import { soundEngine } from './utils/audio';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'games' | 'missions' | 'garage' | 'leaderboard' | 'controls'>('games');
  const [activeGame, setActiveGame] = useState<GameId | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [progress, setProgress] = useState<PlayerProgress>(loadPlayerProgress);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isStreakModalOpen, setIsStreakModalOpen] = useState<boolean>(false);

  useEffect(() => {
    savePlayerProgress(progress);
  }, [progress]);

  // Prompt login streak reward if unclaimed today
  useEffect(() => {
    const today = getTodayDateString();
    if (progress.streak && progress.streak.lastClaimedDate !== today) {
      const timer = setTimeout(() => {
        setIsStreakModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleToggleSound = () => {
    const newState = soundEngine.toggleSound();
    setSoundEnabled(newState);
  };

  const handleLaunchGame = (id: GameId) => {
    setActiveGame(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCoinsEarned = (baseAmount: number) => {
    const { totalCoins, bonusCoins, multiplier } = calculateMultipliedCoins(baseAmount, progress);
    setProgress((prev) => ({
      ...prev,
      coins: prev.coins + totalCoins,
    }));

    if (bonusCoins > 0) {
      soundEngine.playCoin();
      setToastMessage(`🔥 STREAK BONUS (${multiplier.toFixed(1)}x): +${baseAmount} base + ${bonusCoins} bonus coins!`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4000);
    }
  };

  const handleMissionProgress = (
    type: DailyMission['objectiveType'],
    amount: number,
    metadata?: { timeSeconds?: number }
  ) => {
    setProgress((prevProgress) => {
      const { updatedProgress, newlyCompletedMission } = recordMissionProgress(
        prevProgress,
        type,
        amount,
        metadata
      );

      if (newlyCompletedMission) {
        soundEngine.playStunt();
        setToastMessage(`🎯 MISSION ACCOMPLISHED: ${newlyCompletedMission.title} (+${newlyCompletedMission.rewardCoins} COINS)`);
        setTimeout(() => {
          setToastMessage(null);
        }, 5000);
      }

      return updatedProgress;
    });
  };

  // Get active bike config with custom colors and stage upgrades applied
  const activeBikeData = BIKES.find((b) => b.id === progress.selectedBikeId) || BIKES[0];
  const activeCustom = progress.bikeCustomizations[progress.selectedBikeId] || {
    color: activeBikeData.color,
    accentColor: activeBikeData.accentColor,
    trailType: activeBikeData.trailType,
  };
  const activeUpgrades = progress.bikeUpgrades?.[progress.selectedBikeId];
  const engineBonus = (activeUpgrades?.engineStage || 0) * 0.3;
  const tireBonus = (activeUpgrades?.tireStage || 0) * 0.3;
  const suspensionBonus = (activeUpgrades?.suspensionStage || 0) * 0.3;
  const nitroBonus = (activeUpgrades?.nitroStage || 0) * 0.3;

  const activeBikeConfig: BikeConfig = {
    ...activeBikeData,
    topSpeed: Math.min(10, activeBikeData.topSpeed + engineBonus),
    agility: Math.min(10, activeBikeData.agility + tireBonus),
    suspension: Math.min(10, activeBikeData.suspension + suspensionBonus),
    acceleration: Math.min(10, activeBikeData.acceleration + nitroBonus),
    color: activeCustom.color,
    accentColor: activeCustom.accentColor,
    trailType: activeCustom.trailType as 'dust' | 'fire' | 'neon' | 'smoke',
  };

  // Count unclaimed completed daily missions for notification badge
  const unclaimedMissionsCount = (progress.dailyMissions || []).filter((m) => m.completed && !m.claimed).length;

  // Filtered games
  const filteredGames = selectedCategory === 'all'
    ? GAMES
    : GAMES.filter((g) => g.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const categories = [
    { id: 'all', label: 'All Bike Games' },
    { id: 'physics', label: 'Physics Trials' },
    { id: 'traffic', label: 'Traffic Racers' },
    { id: 'stunt', label: 'Freestyle Stunts' },
    { id: 'arcade', label: 'Arcade Survival' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col relative">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setActiveGame(null);
        }}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        coins={progress.coins}
        onQuickPlay={() => handleLaunchGame('trials')}
        unclaimedMissionsCount={unclaimedMissionsCount}
        streakDays={progress.streak?.currentStreak || 1}
        streakMultiplier={getCurrentMultiplier(progress.streak)}
        streakClaimableToday={progress.streak?.lastClaimedDate !== getTodayDateString()}
        onOpenStreakModal={() => setIsStreakModalOpen(true)}
      />

      <main className="flex-1">
        {/* If a game is actively running, show the dedicated playable game arena */}
        {activeGame ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {activeGame === 'trials' && (
              <MotoTrialsGame
                bikeConfig={activeBikeConfig}
                onExit={() => setActiveGame(null)}
                onCoinsEarned={handleCoinsEarned}
                onMissionProgress={handleMissionProgress}
              />
            )}
            {activeGame === 'highway' && (
              <HighwayRacerGame
                bikeConfig={activeBikeConfig}
                onExit={() => setActiveGame(null)}
                onCoinsEarned={handleCoinsEarned}
                onMissionProgress={handleMissionProgress}
              />
            )}
            {activeGame === 'bmx' && (
              <BMXFreestyleGame
                bikeConfig={activeBikeConfig}
                onExit={() => setActiveGame(null)}
                onCoinsEarned={handleCoinsEarned}
                onMissionProgress={handleMissionProgress}
              />
            )}
            {activeGame === 'cyber' && (
              <CyberBikeGame
                bikeConfig={activeBikeConfig}
                onExit={() => setActiveGame(null)}
                onCoinsEarned={handleCoinsEarned}
                onMissionProgress={handleMissionProgress}
              />
            )}
          </div>
        ) : (
          <>
            {/* View Switching */}
            {currentTab === 'games' && (
              <>
                <HeroBanner
                  onSelectGame={handleLaunchGame}
                  onOpenGarage={() => setCurrentTab('garage')}
                  onOpenMissions={() => setCurrentTab('missions')}
                />

                <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Category Filter Bar: Functional Segmented Control */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                      <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
                        Select Simulation
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-display uppercase">
                        Featured Bike Games
                      </h2>
                    </div>

                    {/* Segmented Filter Control */}
                    <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap cursor-pointer ${
                            selectedCategory === cat.id
                              ? 'bg-amber-400 text-black font-bold shadow-sm'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Games Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {filteredGames.map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        highScore={progress.highScores[game.id] || 0}
                        onPlay={handleLaunchGame}
                      />
                    ))}
                  </div>

                  {/* Feature Highlights Section */}
                  <div className="mt-16 pt-12 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6">
                      <div className="text-amber-400 font-bold text-display text-lg mb-2">
                        Real Physics Simulation
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Chassis suspension springs, rotational angular momentum, friction curves, and ragdoll crash boundaries respond with zero latency.
                      </p>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6">
                      <div className="text-cyan-400 font-bold text-display text-lg mb-2">
                        Synthesized Audio Engine
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Real-time Web Audio API sound synthesis generates motor throttle RPM tones, tire skids, stunt rewards, and crash impacts without external assets.
                      </p>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-6">
                      <div className="text-purple-400 font-bold text-display text-lg mb-2">
                        Cross-Platform Controls
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        Full keyboard support (WASD, Arrow Keys, Spacebar, R) alongside responsive on-screen touch pedals and tilt buttons for mobile and tablet play.
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {currentTab === 'missions' && (
              <DailyMissionsView
                progress={progress}
                onUpdateProgress={setProgress}
                onLaunchGame={handleLaunchGame}
              />
            )}

            {currentTab === 'garage' && (
              <GarageView
                progress={progress}
                onUpdateProgress={setProgress}
                onPlayGame={() => {
                  setCurrentTab('games');
                  setActiveGame('trials');
                }}
              />
            )}

            {currentTab === 'leaderboard' && (
              <LeaderboardView
                progress={progress}
                onSelectGame={handleLaunchGame}
              />
            )}

            {currentTab === 'controls' && (
              <ControlsGuide onPlayGame={handleLaunchGame} />
            )}
          </>
        )}
      </main>

      {/* Real-time In-game Mission Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-black font-extrabold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-400">
          <Sparkles className="w-5 h-5 text-black shrink-0" />
          <div className="text-xs sm:text-sm flex items-center gap-2">
            <span>{toastMessage}</span>
            <button
              onClick={() => {
                setActiveGame(null);
                setCurrentTab('missions');
                setToastMessage(null);
              }}
              className="ml-2 underline font-bold hover:text-emerald-950 cursor-pointer text-xs uppercase"
            >
              Claim Now
            </button>
          </div>
        </div>
      )}

      {/* Daily Login Streak Modal */}
      <DailyStreakModal
        isOpen={isStreakModalOpen}
        onClose={() => setIsStreakModalOpen(false)}
        progress={progress}
        onUpdateProgress={setProgress}
      />

      <Footer />
    </div>
  );
}
