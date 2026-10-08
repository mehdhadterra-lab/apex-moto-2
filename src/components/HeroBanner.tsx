import React from 'react';
import { Play, Flame, Wrench, ShieldCheck } from 'lucide-react';
import { GameId } from '../types/game';

interface HeroBannerProps {
  onSelectGame: (gameId: GameId) => void;
  onOpenGarage: () => void;
  onOpenMissions?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectGame, onOpenGarage, onOpenMissions }) => {
  return (
    <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0f172a] via-[#0b0f17] to-[#0b0f17] py-14 md:py-20">
      {/* Decorative motorsport grid and light beam */}
      <div className="absolute inset-0 racing-grid opacity-30 pointer-events-none" />
      <div className="absolute -top-32 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl">
          {/* Natural kicker text with dot separator, no pill box */}
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400 mb-3">
            <span>HTML5 Motor Sports</span>
            <span aria-hidden="true">·</span>
            <span>Real 2D Physics Engine</span>
            <span aria-hidden="true">·</span>
            <span>60 FPS Smooth Canvas</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5 uppercase text-display" style={{ textWrap: 'balance' }}>
            Two-Wheel Speed, Stunts &amp; Extreme Trials
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-8 max-w-2xl">
            Choose your machine and hit the track right in your browser. Conquer gravity-defying obstacle courses in Moto Trials, weave through highway traffic at 280 km/h, throw backflips in the BMX skatepark, or dominate the cyber grid.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectGame('trials')}
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold uppercase tracking-wider text-sm rounded shadow-lg shadow-amber-500/25 transition-all flex items-center gap-2.5 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play Moto Trials Extreme</span>
            </button>

            <button
              onClick={onOpenGarage}
              className="px-5 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 active:scale-95 text-slate-200 hover:text-white font-medium text-sm rounded border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Wrench className="w-4 h-4 text-amber-400" />
              <span>Customize Bikes in Garage</span>
            </button>

            {onOpenMissions && (
              <button
                onClick={onOpenMissions}
                className="px-4 py-3.5 bg-emerald-950/40 hover:bg-emerald-900/50 active:scale-95 text-emerald-300 hover:text-emerald-200 font-medium text-sm rounded border border-emerald-700/50 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Daily Missions (+Bonus Coins)</span>
              </button>
            )}
          </div>

          {/* Social Proof & Metrics Adjacency */}
          <div className="mt-10 pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-xl text-left">
            <div>
              <div className="text-2xl font-bold font-mono-numbers text-white">4</div>
              <div className="text-xs text-slate-400 mt-0.5">Playable Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-numbers text-amber-400">100%</div>
              <div className="text-xs text-slate-400 mt-0.5">Free &amp; In-Browser</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono-numbers text-white">0 ms</div>
              <div className="text-xs text-slate-400 mt-0.5">Instant Startup</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
