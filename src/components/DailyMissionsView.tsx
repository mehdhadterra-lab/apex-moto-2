import React, { useState, useEffect } from 'react';
import { DailyMission, GameId, PlayerProgress } from '../types/game';
import { claimMissionReward, claimAllMissionsBonus } from '../utils/missions';
import { soundEngine } from '../utils/audio';
import { Check, Gift, Play, Flame, Trophy, Clock, Sparkles } from 'lucide-react';

interface DailyMissionsViewProps {
  progress: PlayerProgress;
  onUpdateProgress: (newProgress: PlayerProgress) => void;
  onLaunchGame: (gameId: GameId) => void;
}

export const DailyMissionsView: React.FC<DailyMissionsViewProps> = ({
  progress,
  onUpdateProgress,
  onLaunchGame,
}) => {
  const missions = progress.dailyMissions || [];
  const completedCount = missions.filter((m) => m.completed).length;
  const allCompleted = missions.length > 0 && completedCount === missions.length;
  const bonusClaimed = progress.allMissionsBonusClaimed;

  // Calculate time remaining until midnight
  const [timeLeftStr, setTimeLeftStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diffMs = tomorrow.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeftStr(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = (missionId: string) => {
    soundEngine.playVictory();
    const { updatedProgress } = claimMissionReward(progress, missionId);
    onUpdateProgress(updatedProgress);
  };

  const handleClaimBonusChest = () => {
    soundEngine.playStunt();
    const { updatedProgress } = claimAllMissionsBonus(progress);
    onUpdateProgress(updatedProgress);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Editorial Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
            Daily Operational Objectives
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-display uppercase">
            Daily Missions
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-2xl">
            Complete daily track challenges to earn bonus coin payouts. Missions reset every 24 hours at midnight.
          </p>
        </div>

        {/* Refresh Timer & Progress */}
        <div className="flex flex-col sm:items-end gap-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono-numbers">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Refreshes in {timeLeftStr}</span>
          </div>
          <div className="text-xs text-amber-400 font-mono-numbers">
            COMPLETED: <span className="font-bold text-white text-sm">{completedCount} / {missions.length}</span>
          </div>
        </div>
      </div>

      {/* Daily Grand Chest Card if all completed */}
      <div className={`mb-8 p-6 rounded-xl border transition-all ${
        allCompleted
          ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-500/40 shadow-lg'
          : 'bg-slate-900/40 border-slate-800/80'
      }`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-xl border ${
              allCompleted
                ? 'bg-amber-400/20 border-amber-400/40 text-amber-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-500'
            }`}>
              <Gift className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-lg text-display">Master Completion Bonus</span>
                <span className="text-xs text-amber-400 font-mono-numbers font-bold">+500 COINS</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {allCompleted
                  ? 'All 4 daily objectives completed! Collect your daily reward chest.'
                  : `Complete all ${missions.length} objectives to unlock the bonus reward chest.`}
              </p>
            </div>
          </div>

          <div>
            {bonusClaimed ? (
              <span className="text-xs font-bold text-slate-400 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>BONUS CLAIMED TODAY</span>
              </span>
            ) : (
              <button
                onClick={handleClaimBonusChest}
                disabled={!allCompleted}
                className={`px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 ${
                  allCompleted
                    ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-500/20 cursor-pointer active:scale-95'
                    : 'bg-slate-800/60 text-slate-500 border border-slate-700/60 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Claim +500 Coins</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Missions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missions.map((mission, index) => {
          const isDone = mission.completed;
          const isClaimed = mission.claimed;
          const percent = mission.objectiveType === 'finish_under_time'
            ? (isDone ? 100 : 0)
            : Math.min(100, Math.round((mission.current / mission.target) * 100));

          const gameLabel = mission.gameId === 'trials'
            ? 'Moto Trials Extreme'
            : mission.gameId === 'highway'
            ? 'Highway Moto Rush'
            : mission.gameId === 'bmx'
            ? 'BMX Trick Master'
            : mission.gameId === 'cyber'
            ? 'Cyber Neon Grid'
            : 'Any Game Mode';

          return (
            <div
              key={mission.id}
              className={`bg-slate-900/60 rounded-xl border p-6 flex flex-col justify-between transition-all ${
                isDone
                  ? 'border-emerald-500/40 bg-gradient-to-br from-emerald-950/20 via-slate-900/60 to-slate-900/60'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Unboxed natural kicker */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono-numbers">
                  <div className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-semibold">{gameLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span>+{mission.rewardCoins} Coins</span>
                  </div>
                  <span>Objective 0{index + 1}</span>
                </div>

                <h3 className="text-xl font-bold text-white text-display flex items-center justify-between">
                  <span>{mission.title}</span>
                  {isDone && (
                    <span className="text-xs font-mono-numbers text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>COMPLETE</span>
                    </span>
                  )}
                </h3>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                  {mission.description}
                </p>

                {/* Progress Bar & Value */}
                <div className="mt-5">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-mono-numbers">
                    <span>Target Progress</span>
                    <span className="text-white font-bold">
                      {mission.objectiveType === 'finish_under_time'
                        ? isDone ? 'Accomplished (<30s)' : 'Not yet accomplished'
                        : `${mission.current} / ${mission.target} ${mission.unit || ''}`}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        isDone ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                {isClaimed ? (
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 font-mono-numbers">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>REWARD CLAIMED (+{mission.rewardCoins} COINS)</span>
                  </span>
                ) : isDone ? (
                  <button
                    onClick={() => handleClaim(mission.id)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-all cursor-pointer shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Claim +{mission.rewardCoins} Coins</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-500 font-mono-numbers">
                    Progress tracked automatically during play
                  </span>
                )}

                {mission.gameId !== 'any' && (
                  <button
                    onClick={() => onLaunchGame(mission.gameId as GameId)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-black text-slate-200 text-xs font-semibold rounded border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Play Course</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
