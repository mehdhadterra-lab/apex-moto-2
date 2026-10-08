import React from 'react';
import { GameId } from '../types/game';

interface ControlsGuideProps {
  onPlayGame: (id: GameId) => void;
}

export const ControlsGuide: React.FC<ControlsGuideProps> = ({ onPlayGame }) => {
  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-800 pb-5">
        <div className="text-xs font-semibold tracking-wider uppercase text-amber-400 mb-1">
          Rider Manual
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white text-display uppercase">
          Controls &amp; Physics Guide
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-2xl">
          Master the physics engine, throttle modulation, mid-air balance, and scoring mechanics across every mode.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Moto Trials Extreme */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white text-display">01. Moto Trials Extreme</h3>
              <span className="text-xs text-amber-400 font-mono-numbers">Physics Sim</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
              Real 2D ragdoll suspension physics. Control throttle, rear-wheel drive traction, and rider body lean.
            </p>

            <div className="space-y-2.5 text-xs font-mono-numbers">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">W or Arrow Up</span>
                <span className="text-white font-semibold">Throttle / Accelerate</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">S or Arrow Down</span>
                <span className="text-white font-semibold">Brake / Reverse</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">A or Arrow Left</span>
                <span className="text-white font-semibold">Lean Back (Wheelie / Backflip)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">D or Arrow Right</span>
                <span className="text-white font-semibold">Lean Forward (Stoppie / Frontflip)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Spacebar</span>
                <span className="text-white font-semibold">Bunnyhop / Spring Impulse</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">R</span>
                <span className="text-white font-semibold">Instant Respawn Checkpoint</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => onPlayGame('trials')}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
            >
              Play Moto Trials
            </button>
          </div>
        </div>

        {/* Highway Moto Rush */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white text-display">02. Highway Moto Rush</h3>
              <span className="text-xs text-cyan-400 font-mono-numbers">Traffic Racer</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
              Speed through 4-lane night highway traffic. Shave inches off trucks to rack up Near-Miss multipliers!
            </p>

            <div className="space-y-2.5 text-xs font-mono-numbers">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">A / D or Left / Right</span>
                <span className="text-white font-semibold">Steer &amp; Lane Split</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">W or Up</span>
                <span className="text-white font-semibold">Full Speed (220+ km/h)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">S or Down</span>
                <span className="text-white font-semibold">Emergency Brake</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Spacebar</span>
                <span className="text-white font-semibold">Nitro Surge (320 km/h)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Near-Miss Proximity</span>
                <span className="text-amber-400 font-semibold">Pass within 14px of traffic</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => onPlayGame('highway')}
              className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
            >
              Play Highway Rush
            </button>
          </div>
        </div>

        {/* BMX Trick Master */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white text-display">03. BMX Trick Master</h3>
              <span className="text-xs text-purple-400 font-mono-numbers">Freestyle Bowl</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
              Drop into the bowl, pump transition curves to launch big air, and string technical mid-air stunt combos.
            </p>

            <div className="space-y-2.5 text-xs font-mono-numbers">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">S or Down</span>
                <span className="text-white font-semibold">Pump Transition (Boost Air)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">W or Up in Air</span>
                <span className="text-white font-semibold">Superman Trick (+350 pts)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Q in Air</span>
                <span className="text-white font-semibold">Tailwhip (+280 pts)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">E in Air</span>
                <span className="text-white font-semibold">Barspin (+220 pts)</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">A / D in Air</span>
                <span className="text-amber-400 font-semibold">Match ramp landing angle</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => onPlayGame('bmx')}
              className="w-full py-2.5 bg-purple-400 hover:bg-purple-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
            >
              Play BMX Freestyle
            </button>
          </div>
        </div>

        {/* Cyber Neon Grid */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-white text-display">04. Cyber Neon Grid</h3>
              <span className="text-xs text-emerald-400 font-mono-numbers">Arcade Arena</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
              Futuristic lightcycle battle arena. Turn sharply to trap opponents in your energy light trail wall.
            </p>

            <div className="space-y-2.5 text-xs font-mono-numbers">
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">W / A / S / D</span>
                <span className="text-white font-semibold">Directional Steer</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Arrow Keys</span>
                <span className="text-white font-semibold">Alternative Steer</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-800/60">
                <span className="text-slate-400">Spacebar</span>
                <span className="text-white font-semibold">Turbo Overdrive Boost</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Glowing Nodes</span>
                <span className="text-emerald-400 font-semibold">Energy orbs (+250 pts)</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800">
            <button
              onClick={() => onPlayGame('cyber')}
              className="w-full py-2.5 bg-emerald-400 hover:bg-emerald-300 text-black font-bold uppercase tracking-wider text-xs rounded transition-all cursor-pointer"
            >
              Play Cyber Grid
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
