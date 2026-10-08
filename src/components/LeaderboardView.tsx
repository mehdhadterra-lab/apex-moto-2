import React, { useState } from 'react';
import { PlayerProgress, GameId } from '../types/game';
import { Trophy, Medal, Timer, Award } from 'lucide-react';

interface LeaderboardViewProps {
  progress: PlayerProgress;
  onSelectGame: (gameId: GameId) => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  progress,
  onSelectGame,
}) => {
  const [activeTab, setActiveTab] = useState<GameId>('trials');

  const recordsData: Record<GameId, { rank: number; name: string; score: string; bike: string; date: string }[]> = {
    trials: [
      { rank: 1, name: 'Axel Blaze', score: '5,420 pts', bike: 'Apex Dirt 250', date: 'Oct 04' },
      { rank: 2, name: 'You (Player)', score: `${progress.highScores.trials.toLocaleString()} pts`, bike: 'Your Bike', date: 'Today' },
      { rank: 3, name: 'DirtKing_99', score: '3,100 pts', bike: 'TrailBoss 450 SX', date: 'Oct 01' },
      { rank: 4, name: 'SlickTorque', score: '2,890 pts', bike: 'Apex Dirt 250', date: 'Sep 29' },
      { rank: 5, name: 'RockyCliff', score: '2,450 pts', bike: 'TrailBoss 450 SX', date: 'Sep 28' },
    ],
    highway: [
      { rank: 1, name: 'SpeedDemon_X', score: '7,800 pts', bike: 'Viper RR 1000', date: 'Oct 06' },
      { rank: 2, name: 'LaneSplitter', score: '5,200 pts', bike: 'Viper RR 1000', date: 'Oct 03' },
      { rank: 3, name: 'You (Player)', score: `${progress.highScores.highway.toLocaleString()} pts`, bike: 'Your Bike', date: 'Today' },
      { rank: 4, name: 'NightRider', score: '4,150 pts', bike: 'Apex Dirt 250', date: 'Sep 30' },
      { rank: 5, name: 'AsphaltGhost', score: '3,800 pts', bike: 'Viper RR 1000', date: 'Sep 27' },
    ],
    bmx: [
      { rank: 1, name: 'AirborneTony', score: '8,900 pts', bike: 'Kink Pro Street', date: 'Oct 05' },
      { rank: 2, name: 'You (Player)', score: `${progress.highScores.bmx.toLocaleString()} pts`, bike: 'Your Bike', date: 'Today' },
      { rank: 3, name: 'BowlRipper', score: '5,100 pts', bike: 'Kink Pro Street', date: 'Oct 02' },
      { rank: 4, name: 'WhipMaster', score: '4,650 pts', bike: 'Kink Pro Street', date: 'Sep 30' },
      { rank: 5, name: 'SpinDoctor', score: '3,900 pts', bike: 'Kink Pro Street', date: 'Sep 25' },
    ],
    cyber: [
      { rank: 1, name: 'GridMaster_01', score: '4,800 pts', bike: 'Vektor Cyber-X', date: 'Oct 07' },
      { rank: 2, name: 'NeonPhantom', score: '3,450 pts', bike: 'Vektor Cyber-X', date: 'Oct 04' },
      { rank: 3, name: 'You (Player)', score: `${progress.highScores.cyber.toLocaleString()} pts`, bike: 'Your Bike', date: 'Today' },
      { rank: 4, name: 'VectorByte', score: '2,200 pts', bike: 'Vektor Cyber-X', date: 'Sep 28' },
      { rank: 5, name: 'TronEcho', score: '1,950 pts', bike: 'Vektor Cyber-X', date: 'Sep 24' },
    ],
  };

  const currentRecords = recordsData[activeTab];

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
            Global Competition
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-display uppercase">
            Leaderboard Records
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(['trials', 'highway', 'bmx', 'cyber'] as GameId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs font-semibold uppercase rounded transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'trials' ? 'Moto Trials' : tab === 'highway' ? 'Highway' : tab === 'bmx' ? 'BMX' : 'Cyber Grid'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Your Personal Best</div>
          <div className="text-2xl font-bold font-mono-numbers text-amber-400 mt-1">
            {progress.highScores[activeTab].toLocaleString()} PTS
          </div>
          <div className="text-xs text-slate-500 mt-1 font-mono-numbers">Stored in local session</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
          <div className="text-xs text-slate-400 font-medium">Global Course Record</div>
          <div className="text-2xl font-bold font-mono-numbers text-white mt-1">
            {currentRecords[0].score}
          </div>
          <div className="text-xs text-slate-500 mt-1">Held by {currentRecords[0].name}</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Challenge Record</div>
            <div className="text-sm font-semibold text-slate-200 mt-1">Beat Axel Blaze</div>
          </div>
          <button
            onClick={() => onSelectGame(activeTab)}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
          >
            Launch Track
          </button>
        </div>
      </div>

      {/* Standings Table */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Rider</th>
                <th className="py-3.5 px-6">Machine Model</th>
                <th className="py-3.5 px-6">Best Record</th>
                <th className="py-3.5 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {currentRecords.map((item) => {
                const isUser = item.name.includes('You');
                return (
                  <tr
                    key={item.rank}
                    className={`transition-colors ${
                      isUser
                        ? 'bg-amber-500/10 font-medium text-amber-200'
                        : 'text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <td className="py-4 px-6 font-mono-numbers font-bold">
                      {item.rank === 1 ? (
                        <span className="text-amber-400">#1 🏆</span>
                      ) : item.rank === 2 ? (
                        <span className="text-slate-300">#2 🥈</span>
                      ) : item.rank === 3 ? (
                        <span className="text-amber-600">#3 🥉</span>
                      ) : (
                        `#${item.rank}`
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={isUser ? 'font-bold text-amber-400' : 'text-white'}>
                        {item.name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 font-mono-numbers text-xs">
                      {item.bike}
                    </td>
                    <td className="py-4 px-6 font-mono-numbers font-bold text-white">
                      {item.score}
                    </td>
                    <td className="py-4 px-6 text-right font-mono-numbers text-xs text-slate-500">
                      {item.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
