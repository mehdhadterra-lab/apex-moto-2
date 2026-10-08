import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#080c14] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300 text-display">APEX MOTO</span>
          <span aria-hidden="true">·</span>
          <span>HTML5 Bike Games Arena</span>
          <span aria-hidden="true">·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-slate-400">Zero Plugins Required</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">Pure Canvas &amp; Web Audio</span>
          <span aria-hidden="true" className="text-slate-700">·</span>
          <span className="text-slate-400">60 FPS Physics</span>
        </div>
      </div>
    </footer>
  );
};
