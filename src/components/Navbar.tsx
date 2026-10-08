import React from 'react';
import { Volume2, VolumeX, Wrench, Trophy, Play, Flame } from 'lucide-react';

interface NavbarProps {
  currentTab: 'games' | 'missions' | 'garage' | 'leaderboard' | 'controls';
  setCurrentTab: (tab: 'games' | 'missions' | 'garage' | 'leaderboard' | 'controls') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  coins: number;
  onQuickPlay: () => void;
  unclaimedMissionsCount?: number;
  streakDays?: number;
  streakMultiplier?: number;
  streakClaimableToday?: boolean;
  onOpenStreakModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  soundEnabled,
  onToggleSound,
  coins,
  onQuickPlay,
  unclaimedMissionsCount = 0,
  streakDays = 1,
  streakMultiplier = 1.0,
  streakClaimableToday = false,
  onOpenStreakModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0b0f17]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark in display face */}
        <button
          onClick={() => setCurrentTab('games')}
          className="text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors cursor-pointer text-display flex items-center gap-2"
        >
          <span className="text-amber-500 font-extrabold tracking-wider">APEX</span>
          <span className="text-slate-100">MOTO</span>
        </button>

        {/* Zone 2: 5 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setCurrentTab('games')}
            className={`transition-colors pb-1 border-b-2 cursor-pointer ${
              currentTab === 'games'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
            }`}
          >
            Bike Games
          </button>
          <button
            onClick={() => setCurrentTab('missions')}
            className={`transition-colors pb-1 border-b-2 cursor-pointer relative flex items-center gap-1.5 ${
              currentTab === 'missions'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
            }`}
          >
            <span>Daily Missions</span>
            {unclaimedMissionsCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setCurrentTab('garage')}
            className={`transition-colors pb-1 border-b-2 cursor-pointer ${
              currentTab === 'garage'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
            }`}
          >
            Custom Garage
          </button>
          <button
            onClick={() => setCurrentTab('leaderboard')}
            className={`transition-colors pb-1 border-b-2 cursor-pointer ${
              currentTab === 'leaderboard'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
            }`}
          >
            Leaderboards
          </button>
          <button
            onClick={() => setCurrentTab('controls')}
            className={`transition-colors pb-1 border-b-2 cursor-pointer ${
              currentTab === 'controls'
                ? 'text-amber-400 border-amber-400 font-semibold'
                : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
            }`}
          >
            Controls Guide
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2.5">
          {/* Daily Streak Indicator */}
          {onOpenStreakModal && (
            <button
              onClick={onOpenStreakModal}
              className={`flex items-center gap-1.5 text-xs font-mono-numbers px-2.5 py-1 rounded border transition-all cursor-pointer ${
                streakClaimableToday
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30 shadow-sm shadow-amber-500/20 animate-pulse'
                  : 'bg-slate-850 text-slate-300 border-slate-700/80 hover:text-white hover:border-slate-600'
              }`}
              title="Daily Login Streak & Multiplier Bonus"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
              <span className="font-bold">{streakDays}D STREAK</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold">{streakMultiplier.toFixed(1)}x</span>
            </button>
          )}

          {/* Real coin currency counter - unboxed text with tabular numerals */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 font-mono-numbers px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded">
            <span className="font-semibold tracking-wide">COINS:</span>
            <span>{coins.toLocaleString()}</span>
          </div>

          <button
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded transition-colors"
            title={soundEnabled ? 'Sound is ON' : 'Sound is OFF'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <button
            onClick={onQuickPlay}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all rounded cursor-pointer whitespace-nowrap shadow-sm shadow-amber-500/20 flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Play Now</span>
          </button>
        </div>
      </div>
    </header>
  );
};
