import React, { useState } from 'react';
import { PlayerProgress } from '../types/game';
import {
  STREAK_REWARD_TIERS,
  claimDailyStreakBonus,
  getCurrentMultiplier,
  getTierForDay,
} from '../utils/streak';
import { getTodayDateString } from '../utils/missions';
import { soundEngine } from '../utils/audio';
import { Flame, Check, Sparkles, X, Award, Zap, ArrowRight } from 'lucide-react';

interface DailyStreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
}

export const DailyStreakModal: React.FC<DailyStreakModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateProgress,
}) => {
  if (!isOpen) return null;

  const streak = progress.streak || {
    currentStreak: 1,
    highestStreak: 1,
    lastLoginDate: getTodayDateString(),
    lastClaimedDate: '',
  };

  const todayStr = getTodayDateString();
  const isClaimedToday = streak.lastClaimedDate === todayStr;
  const currentMultiplier = getCurrentMultiplier(streak);
  const currentTier = getTierForDay(streak.currentStreak);

  // Normalize day index in the 1-7 weekly cycle
  const currentCycleDay = ((streak.currentStreak - 1) % 7) + 1;

  const [justClaimedReward, setJustClaimedReward] = useState<number | null>(null);

  const handleClaim = () => {
    if (isClaimedToday) return;

    soundEngine.playVictory();
    const { updatedProgress, coinsAwarded } = claimDailyStreakBonus(progress);
    onUpdateProgress(updatedProgress);
    setJustClaimedReward(coinsAwarded);

    setTimeout(() => {
      setJustClaimedReward(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0e1422] border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="p-3.5 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl text-amber-400">
            <Flame className="w-9 h-9 fill-amber-500/30 animate-pulse" />
          </div>

          <div>
            <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
              Consecutive Rider Milestone
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-display uppercase">
              Daily Login Streak
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-1 font-mono-numbers">
              <span className="text-amber-400 font-bold">
                {streak.currentStreak} Day{streak.currentStreak > 1 ? 's' : ''} Active Streak
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-emerald-400 font-bold">
                {currentMultiplier.toFixed(1)}x Coin Multiplier Active
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400">Record: {streak.highestStreak} Days</span>
            </div>
          </div>
        </div>

        {/* Multiplier Perks Explanation Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-slate-300 leading-relaxed">
              Every consecutive day boosts your <span className="text-amber-400 font-bold">Coin Multiplier</span> up to <span className="text-amber-400 font-bold">2.5x</span> on all race finishes and stunt payouts!
            </span>
          </div>
          <div className="font-mono-numbers font-bold text-amber-400 shrink-0 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 rounded">
            CURRENT BONUS: {currentMultiplier.toFixed(1)}x
          </div>
        </div>

        {/* 7-Day Calendar Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {STREAK_REWARD_TIERS.map((tier) => {
            const isPastClaimed = tier.day < currentCycleDay || (tier.day === currentCycleDay && isClaimedToday);
            const isTodayActive = tier.day === currentCycleDay;
            const isFuture = tier.day > currentCycleDay;

            return (
              <div
                key={tier.day}
                className={`p-3 rounded-xl border flex flex-col justify-between items-center text-center transition-all ${
                  isTodayActive
                    ? isClaimedToday
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-amber-950/30 border-amber-400 shadow-md shadow-amber-500/10 scale-102'
                    : isPastClaimed
                    ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="w-full flex items-center justify-between text-[11px] font-mono-numbers mb-1">
                  <span className="text-slate-400">DAY {tier.day}</span>
                  {isPastClaimed && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <div className="my-1.5 flex flex-col items-center">
                  <div className={`p-2 rounded-lg mb-1 ${
                    tier.day === 7
                      ? 'bg-amber-500/20 text-amber-400'
                      : isTodayActive
                      ? 'bg-amber-400/10 text-amber-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tier.day === 7 ? (
                      <Award className="w-5 h-5 text-amber-400" />
                    ) : (
                      <Flame className="w-4 h-4" />
                    )}
                  </div>

                  <span className="font-bold text-white text-xs font-mono-numbers">
                    +{tier.rewardCoins}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono-numbers">
                    {tier.multiplier.toFixed(1)}x
                  </span>
                </div>

                <div className="w-full text-[10px] font-bold tracking-wider uppercase mt-1">
                  {isTodayActive ? (
                    isClaimedToday ? (
                      <span className="text-emerald-400">Claimed</span>
                    ) : (
                      <span className="text-amber-400 animate-pulse">Today!</span>
                    )
                  ) : isPastClaimed ? (
                    <span className="text-slate-500">Done</span>
                  ) : (
                    <span className="text-slate-600">Locked</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Claim Action / Feedback Bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            {isClaimedToday ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" />
                <span>Today&apos;s Day {streak.currentStreak} reward collected! Come back tomorrow for Day {streak.currentStreak + 1}.</span>
              </span>
            ) : (
              <span>
                Day {streak.currentStreak} reward ready! Claim <span className="text-amber-400 font-bold">+{currentTier.rewardCoins} Coins</span> and activate your <span className="text-amber-400 font-bold">{currentTier.multiplier.toFixed(1)}x Multiplier</span>.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isClaimedToday ? (
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer"
              >
                Hit the Tracks
              </button>
            ) : (
              <button
                onClick={handleClaim}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-extrabold text-xs uppercase tracking-wider rounded shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>Claim Day {streak.currentStreak} Reward (+{currentTier.rewardCoins} Coins)</span>
              </button>
            )}
          </div>
        </div>

        {/* Toast confirmation inside modal */}
        {justClaimedReward && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-bold animate-bounce font-mono-numbers">
            🎉 +{justClaimedReward} Coins Added to Balance! Your {currentMultiplier.toFixed(1)}x Multiplier is Active!
          </div>
        )}
      </div>
    </div>
  );
};
