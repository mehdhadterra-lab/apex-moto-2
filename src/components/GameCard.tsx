import React, { useState } from 'react';
import { Play, Star, Users, Flame, ChevronRight } from 'lucide-react';
import { GameMetadata, GameId } from '../types/game';

interface GameCardProps {
  game: GameMetadata;
  highScore: number;
  onPlay: (id: GameId) => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, highScore, onPlay }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group bg-slate-900/60 rounded-xl border border-slate-800/80 hover:border-slate-700/80 overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1">
      {/* Visual Asset Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        {!imgError ? (
          <img
            src={game.coverImage}
            alt={game.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center">
            <span className="text-display text-lg font-bold text-amber-400">{game.title}</span>
            <span className="text-xs text-slate-400 mt-1">{game.category}</span>
          </div>
        )}

        {/* High contrast overlay gradient for readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

        {/* Hover play quick trigger */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
          <button
            onClick={() => onPlay(game.id)}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 active:scale-95 text-black font-bold uppercase tracking-wider text-xs rounded shadow-lg transition-transform flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>Play Now</span>
          </button>
        </div>

        {/* Bottom image metadata: clean unboxed text */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-200">
          <div className="flex items-center gap-1.5 font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-mono-numbers">{game.rating.toFixed(1)}</span>
            <span className="text-slate-400" aria-hidden="true">·</span>
            <span className="text-slate-300">{game.category}</span>
          </div>
          <div className="text-slate-400 text-[11px] font-mono-numbers">
            {game.playersCount} players
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Unboxed natural kicker */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5 font-mono-numbers">
            <span>Difficulty: {game.difficulty}</span>
            {highScore > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400">Best: {highScore.toLocaleString()} pts</span>
              </>
            )}
          </div>

          <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors text-display">
            {game.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {game.tagline}
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Keyboard &amp; Touch Controls
          </span>

          <button
            onClick={() => onPlay(game.id)}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Launch Game</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
