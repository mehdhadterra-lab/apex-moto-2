import React from 'react';
import { BikeConfig } from '../types/game';

interface BikeRendererProps {
  bike: BikeConfig;
  customColor?: string;
  customAccent?: string;
  className?: string;
  scale?: number;
  interactiveTurntableAngle?: number;
  lightingMode?: 'neon' | 'golden' | 'cyber' | 'studio';
  isRevving?: boolean;
}

export const BikeRenderer: React.FC<BikeRendererProps> = ({
  bike,
  customColor,
  customAccent,
  className = '',
  scale = 1,
  interactiveTurntableAngle = 0,
  lightingMode = 'neon',
  isRevving = false,
}) => {
  const primaryColor = customColor || bike.color;
  const accentColor = customAccent || bike.accentColor;
  const id = bike.id;

  // Visual lighting filters based on selected showroom lighting mode
  const filterLighting = {
    neon: {
      shadow: 'rgba(0, 240, 255, 0.25)',
      ambient: '#090d16',
      highlight: '#38bdf8',
    },
    golden: {
      shadow: 'rgba(245, 158, 11, 0.3)',
      ambient: '#1c1306',
      highlight: '#fbbf24',
    },
    cyber: {
      shadow: 'rgba(236, 72, 153, 0.35)',
      ambient: '#11091e',
      highlight: '#f43f5e',
    },
    studio: {
      shadow: 'rgba(255, 255, 255, 0.15)',
      ambient: '#0f172a',
      highlight: '#f8fafc',
    },
  }[lightingMode];

  return (
    <div
      className={`relative flex items-center justify-center transition-transform duration-200 select-none ${className}`}
      style={{
        transform: `scale(${scale}) rotate(${interactiveTurntableAngle * 0.12}deg)`,
      }}
    >
      <svg
        viewBox="0 0 440 260"
        className="w-full h-auto drop-shadow-2xl overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Metallic gradients */}
          <linearGradient id="metalChrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="35%" stopColor="#94a3b8" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <linearGradient id="darkAlloy" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="kashimaGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="85%" stopColor="#b45309" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>

          <linearGradient id="heatBluedExhaust" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="30%" stopColor="#a855f7" />
            <stop offset="65%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="tireRubber" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#050811" />
          </linearGradient>

          <linearGradient id="carbonWeave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          <filter id="bikeDropShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="5" />
            <feOffset dx="0" dy="8" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.55" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="turntableSpotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={filterLighting.highlight} stopOpacity="0.25" />
            <stop offset="70%" stopColor={filterLighting.shadow} stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Dynamic Studio Turntable Ground Shadow & Radial Glow */}
        <ellipse cx="220" cy="225" rx="190" ry="22" fill="url(#turntableSpotlight)" />
        <ellipse cx="220" cy="226" rx="165" ry="14" fill="#020617" opacity="0.8" />
        <ellipse cx="220" cy="226" rx="110" ry="8" fill="#000000" opacity="0.9" />

        {/* ---------------------------------------------------- */}
        {/* TIER 1: TRAIL SCOUT 125 (Lightweight Dual-Sport)     */}
        {/* ---------------------------------------------------- */}
        {id === 'trail_scout_125' && (
          <g filter="url(#bikeDropShadow)">
            {/* Rear 18" Wire Spoke Wheel */}
            <circle cx="100" cy="180" r="42" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="100" cy="180" r="32" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={100}
                y1={180}
                x2={100 + Math.cos((d * Math.PI) / 180) * 31}
                y2={180 + Math.sin((d * Math.PI) / 180) * 31}
                stroke="#94a3b8"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="100" cy="180" r="14" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="100" cy="180" r="5" fill="#f1f5f9" />

            {/* Front 21" Wire Spoke Wheel */}
            <circle cx="340" cy="176" r="46" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="340" cy="176" r="35" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((d) => (
              <line
                key={d}
                x1={340}
                y1={176}
                x2={340 + Math.cos((d * Math.PI) / 180) * 34}
                y2={176 + Math.sin((d * Math.PI) / 180) * 34}
                stroke="#94a3b8"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="340" cy="176" r="16" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="4 2" />
            <circle cx="340" cy="176" r="6" fill="#f1f5f9" />

            {/* Swingarm & Monoshock */}
            <path d="M100 180 L200 178 L190 162 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="2" />
            <line x1="170" y1="170" x2="195" y2="135" stroke="#ef4444" strokeWidth="9" strokeDasharray="3 3" />

            {/* 125cc Single Cylinder Engine Block with Cooling Fins */}
            <rect x="185" y="148" width="48" height="42" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
            {[156, 164, 172, 180].map((y) => (
              <line key={y} x1="188" y1={y} x2="228" y2={y} stroke="#94a3b8" strokeWidth="2.5" />
            ))}
            <circle cx="215" cy="178" r="10" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />

            {/* High Upswept Exhaust Header with Heat Shield */}
            <path d="M225 155 Q250 148 230 120 Q160 115 125 130" fill="none" stroke="url(#heatBluedExhaust)" strokeWidth="6" strokeLinecap="round" />
            <rect x="110" y="125" width="45" height="13" rx="4" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />

            {/* Lightweight Steel Cradle Frame */}
            <path d="M195 180 L200 130 L295 108 L235 150 Z" fill="none" stroke="#1e293b" strokeWidth="8" strokeLinejoin="round" />
            <path d="M200 130 L295 108" stroke={primaryColor} strokeWidth="6" />

            {/* Slender Dual-Sport Tank & Shrouds */}
            <path d="M215 120 L290 108 L265 142 L215 135 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1.5" />
            <line x1="230" y1="128" x2="275" y2="120" stroke={accentColor} strokeWidth="3" />

            {/* Long Ribbed Bench Seat */}
            <path d="M150 124 Q205 118 250 122 L246 132 Q205 128 150 132 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />

            {/* High Motocross Beak Fender & Tail Guard */}
            <path d="M295 110 L355 115 L335 104 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1.5" />
            <path d="M120 136 L160 126 L175 132 Z" fill={primaryColor} />

            {/* Inverted Front Forks */}
            <line x1="295" y1="102" x2="340" y2="176" stroke="url(#kashimaGold)" strokeWidth="7" strokeLinecap="round" />
            <line x1="305" y1="110" x2="340" y2="168" stroke="#334155" strokeWidth="3.5" />

            {/* Motocross Bar with Center Foam Pad */}
            <line x1="290" y1="100" x2="298" y2="72" stroke="#94a3b8" strokeWidth="4" />
            <line x1="285" y1="78" x2="312" y2="78" stroke="#0f172a" strokeWidth="3" />
            <circle cx="298" cy="78" r="4.5" fill={primaryColor} />
            <line x1="275" y1="72" x2="322" y2="72" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 2: URBAN PULSE 250 (Modern Naked Scrambler)     */}
        {/* ---------------------------------------------------- */}
        {id === 'urban_pulse_250' && (
          <g filter="url(#bikeDropShadow)">
            {/* Wheels (17" Street Slicks with Accent Rim Ring) */}
            <circle cx="105" cy="180" r="42" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="105" cy="180" r="32" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 60, 120, 180, 240, 300].map((d) => (
              <line
                key={d}
                x1={105}
                y1={180}
                x2={105 + Math.cos((d * Math.PI) / 180) * 30}
                y2={180 + Math.sin((d * Math.PI) / 180) * 30}
                stroke="#64748b"
                strokeWidth="3.5"
              />
            ))}
            <circle cx="105" cy="180" r="16" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
            <circle cx="105" cy="180" r="7" fill="#f8fafc" />

            <circle cx="335" cy="180" r="42" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="335" cy="180" r="32" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 60, 120, 180, 240, 300].map((d) => (
              <line
                key={d}
                x1={335}
                y1={180}
                x2={335 + Math.cos((d * Math.PI) / 180) * 30}
                y2={180 + Math.sin((d * Math.PI) / 180) * 30}
                stroke="#64748b"
                strokeWidth="3.5"
              />
            ))}
            {/* Wave Disc Brake with Gold Caliper */}
            <circle cx="335" cy="180" r="22" fill="none" stroke="#cbd5e1" strokeWidth="3" strokeDasharray="5 2" />
            <rect x="318" y="172" width="10" height="15" rx="2" fill="#eab308" />
            <circle cx="335" cy="180" r="7" fill="#f8fafc" />

            {/* Swingarm */}
            <path d="M105 180 L205 178 L195 160 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="2" />
            {/* Horizontal Rear Monoshock */}
            <line x1="175" y1="168" x2="215" y2="152" stroke={accentColor} strokeWidth="8" strokeDasharray="3 2" />

            {/* 250cc DOHC Liquid Cooled Engine Block */}
            <rect x="195" y="145" width="55" height="46" rx="6" fill="#0f172a" stroke="#475569" strokeWidth="2" />
            <circle cx="225" cy="168" r="14" fill="#1e293b" stroke={accentColor} strokeWidth="2" />
            {/* Underbelly Exhaust Silencer */}
            <path d="M235 185 L180 190 L160 182 L185 175 Z" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Exposed Red/Accent Trellis Tubular Frame */}
            <path d="M180 152 L225 125 L285 115 L250 155 Z" fill="none" stroke={primaryColor} strokeWidth="6" strokeLinejoin="round" />
            <line x1="180" y1="152" x2="250" y2="155" stroke={primaryColor} strokeWidth="4" />
            <line x1="225" y1="125" x2="250" y2="155" stroke={primaryColor} strokeWidth="4" />

            {/* Sculpted Angular Fuel Tank with Knee Grip Recesses */}
            <path d="M210 120 Q250 102 285 115 L275 142 L225 135 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1.5" />
            <path d="M235 118 Q260 114 270 128 Z" fill="#0f172a" />

            {/* Tuck and Roll Scrambler Saddle */}
            <path d="M145 128 Q185 122 225 125 L222 135 Q185 130 145 136 Z" fill="#334155" stroke="#1e293b" strokeWidth="1.5" />

            {/* Round Halo LED Projector Headlamp */}
            <circle cx="310" cy="115" r="12" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            <circle cx="310" cy="115" r="9" fill="none" stroke="#38bdf8" strokeWidth="2.5" />
            <circle cx="310" cy="115" r="4" fill="#ffffff" />

            {/* Inverted Black Front Forks */}
            <line x1="290" y1="110" x2="335" y2="180" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" />
            <line x1="300" y1="125" x2="335" y2="175" stroke="#cbd5e1" strokeWidth="4" />

            {/* Low-Rise Tapered Handlebar with Bar-End Weights */}
            <line x1="285" y1="105" x2="288" y2="82" stroke="#94a3b8" strokeWidth="4" />
            <line x1="268" y1="84" x2="308" y2="84" stroke="#0f172a" strokeWidth="5.5" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 3: KINK APEX BMX PRO (4130 Chromoly Freestyle)  */}
        {/* ---------------------------------------------------- */}
        {id === 'kink_apex_bmx' && (
          <g filter="url(#bikeDropShadow)">
            {/* Rear 20" Double Wall Spoke Wheel */}
            <circle cx="110" cy="180" r="36" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="5" />
            <circle cx="110" cy="180" r="26" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={110}
                y1={180}
                x2={110 + Math.cos((d * Math.PI) / 180) * 25}
                y2={180 + Math.sin((d * Math.PI) / 180) * 25}
                stroke="#cbd5e1"
                strokeWidth="1.6"
              />
            ))}
            <circle cx="110" cy="180" r="7" fill="#f8fafc" />
            {/* Rear Axle Grind Peg */}
            <rect x="98" y="177" width="12" height="6" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />

            {/* Front 20" Double Wall Spoke Wheel */}
            <circle cx="330" cy="180" r="36" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="5" />
            <circle cx="330" cy="180" r="26" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={330}
                y1={180}
                x2={330 + Math.cos((d * Math.PI) / 180) * 25}
                y2={180 + Math.sin((d * Math.PI) / 180) * 25}
                stroke="#cbd5e1"
                strokeWidth="1.6"
              />
            ))}
            <circle cx="330" cy="180" r="7" fill="#f8fafc" />
            <rect x="330" y="177" width="12" height="6" rx="2" fill="#94a3b8" stroke="#334155" strokeWidth="1" />

            {/* 4130 Chromoly Diamond Frame */}
            {/* Chainstay & Seatstay */}
            <line x1="110" y1="180" x2="190" y2="180" stroke={primaryColor} strokeWidth="5" strokeLinecap="round" />
            <line x1="110" y1="180" x2="185" y2="130" stroke={primaryColor} strokeWidth="4.5" strokeLinecap="round" />

            {/* 25T CNC Sprocket & 3-Piece Tubular Cranks */}
            <circle cx="190" cy="180" r="12" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="3 2" />
            <line x1="190" y1="180" x2="180" y2="196" stroke="#94a3b8" strokeWidth="3.5" />
            <rect x="174" y="194" width="10" height="4" rx="1" fill="#020617" />

            {/* Seat Tube & Down Tube & Top Tube */}
            <line x1="190" y1="180" x2="185" y2="130" stroke={primaryColor} strokeWidth="5.5" strokeLinecap="round" />
            <line x1="190" y1="180" x2="285" y2="115" stroke={primaryColor} strokeWidth="5.5" strokeLinecap="round" />
            <line x1="185" y1="130" x2="285" y2="115" stroke={primaryColor} strokeWidth="5.5" strokeLinecap="round" />

            {/* Headtube Gusset */}
            <polygon points="275,117 285,115 280,128" fill={primaryColor} />

            {/* Slim Pivotal Padded Saddle */}
            <line x1="185" y1="130" x2="180" y2="112" stroke="#475569" strokeWidth="4" />
            <path d="M160 112 Q185 106 205 114 Z" fill="#020617" stroke="#334155" strokeWidth="2" />

            {/* Rigid Chromoly Tapered Front Fork */}
            <line x1="285" y1="115" x2="330" y2="180" stroke={primaryColor} strokeWidth="5.5" strokeLinecap="round" />

            {/* High-Rise 2-Piece 9" Handlebars with Knurled Crossbar */}
            <line x1="285" y1="115" x2="280" y2="78" stroke="#cbd5e1" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="265" y1="88" x2="295" y2="88" stroke="#cbd5e1" strokeWidth="3.5" />
            <path d="M260 80 L275 76 L285 76 L300 80" stroke="#020617" strokeWidth="6" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 4: GHOST CAFÉ 500 (Vintage Parallel-Twin)       */}
        {/* ---------------------------------------------------- */}
        {id === 'ghost_cafe_500' && (
          <g filter="url(#bikeDropShadow)">
            {/* Spoked Wheels with High-Profile Vintage Tires */}
            <circle cx="105" cy="180" r="43" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="105" cy="180" r="32" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={105}
                y1={180}
                x2={105 + Math.cos((d * Math.PI) / 180) * 31}
                y2={180 + Math.sin((d * Math.PI) / 180) * 31}
                stroke="#94a3b8"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="105" cy="180" r="8" fill="#f8fafc" />

            <circle cx="335" cy="178" r="45" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="335" cy="178" r="34" fill="none" stroke="#cbd5e1" strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={335}
                y1={178}
                x2={335 + Math.cos((d * Math.PI) / 180) * 33}
                y2={178 + Math.sin((d * Math.PI) / 180) * 33}
                stroke="#94a3b8"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="335" cy="178" r="8" fill="#f8fafc" />

            {/* Twin Rear Shocks with Chrome Springs */}
            <line x1="120" y1="172" x2="165" y2="135" stroke="#cbd5e1" strokeWidth="8" strokeDasharray="3 2" />

            {/* Parallel-Twin 500cc Engine Block with Polished Cooling Fins */}
            <rect x="180" y="142" width="60" height="48" rx="5" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2.5" />
            {[150, 158, 166, 174, 182].map((y) => (
              <line key={y} x1="184" y1={y} x2="236" y2={y} stroke="#94a3b8" strokeWidth="2.5" />
            ))}

            {/* Dual Swept Header Pipes into Megaphone Reverse Cone Silencer */}
            <path d="M225 155 Q245 178 190 188 L100 188" fill="none" stroke="#e2e8f0" strokeWidth="5.5" strokeLinecap="round" />
            <polygon points="135,185 95,183 95,193 135,191" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />

            {/* Teardrop Vintage Gas Tank with Knee Recesses */}
            <path d="M205 125 Q250 102 290 120 Q245 145 205 135 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />
            <path d="M235 122 Q260 115 270 128 Z" fill="#0f172a" />

            {/* Brown Stitched Tuck & Roll Saddle with Café Racer Tail Hump */}
            <path d="M145 130 Q180 125 205 128 L200 138 Q180 133 145 138 Z" fill="#78350f" stroke="#451a03" strokeWidth="2" />
            <path d="M115 134 Q135 122 150 130 L145 140 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1.5" />

            {/* Circular Chrome Headlamp */}
            <circle cx="315" cy="120" r="12" fill="#fef08a" stroke="#cbd5e1" strokeWidth="3" />

            {/* Raked Front Forks with Rubber Gaiters */}
            <line x1="290" y1="115" x2="335" y2="178" stroke="#cbd5e1" strokeWidth="7" strokeLinecap="round" />
            {[135, 142, 149].map((y) => (
              <rect key={y} x={290 + (y - 115) * 0.7 - 5} y={y} width="10" height="4" rx="1" fill="#0f172a" />
            ))}

            {/* Clip-On Dropped Handlebars with Bar-End Mirrors */}
            <line x1="285" y1="110" x2="295" y2="100" stroke="#94a3b8" strokeWidth="3.5" />
            <line x1="280" y1="102" x2="310" y2="102" stroke="#020617" strokeWidth="5" strokeLinecap="round" />
            <circle cx="276" cy="102" r="4.5" fill="#cbd5e1" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 5: MUDSLINGER 450 SX (Pro Motocross & Trial)    */}
        {/* ---------------------------------------------------- */}
        {id === 'mudslinger_450_sx' && (
          <g filter="url(#bikeDropShadow)">
            {/* Knobby Motocross Tires (18" rear, 21" front) */}
            <circle cx="95" cy="180" r="44" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="95" cy="180" r="32" fill="none" stroke={accentColor} strokeWidth="3.5" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <rect
                key={d}
                x={95 + Math.cos((d * Math.PI) / 180) * 39 - 2}
                y={180 + Math.sin((d * Math.PI) / 180) * 39 - 2}
                width="5"
                height="5"
                fill="#334155"
              />
            ))}
            <circle cx="95" cy="180" r="16" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="95" cy="180" r="7" fill="#f8fafc" />

            <circle cx="345" cy="176" r="47" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="345" cy="176" r="35" fill="none" stroke={accentColor} strokeWidth="3.5" />
            {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((d) => (
              <rect
                key={d}
                x={345 + Math.cos((d * Math.PI) / 180) * 42 - 2}
                y={176 + Math.sin((d * Math.PI) / 180) * 42 - 2}
                width="5"
                height="5"
                fill="#334155"
              />
            ))}
            <circle cx="345" cy="176" r="22" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeDasharray="5 2" />
            <circle cx="345" cy="176" r="7" fill="#f8fafc" />

            {/* Aluminum Cast Swingarm with Chain Guide */}
            <path d="M95 180 L205 176 L195 158 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="2" />
            {/* WP Linkage Progressive Monoshock */}
            <line x1="165" y1="165" x2="195" y2="125" stroke={accentColor} strokeWidth="9" strokeDasharray="3 3" />

            {/* 450cc Titanium Engine Block & Skid Bash Plate */}
            <rect x="185" y="140" width="54" height="46" rx="5" fill="#1e293b" stroke="#64748b" strokeWidth="2.5" />
            <circle cx="215" cy="165" r="14" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
            <path d="M175 190 L245 190 L255 175" fill="none" stroke="#cbd5e1" strokeWidth="3.5" />

            {/* Titanium Header with PowerBomb Resonance Chamber & Upswept Canister */}
            <path d="M225 145 Q260 135 235 110 Q160 102 120 120" fill="none" stroke="url(#heatBluedExhaust)" strokeWidth="6.5" strokeLinecap="round" />
            <rect x="100" y="115" width="48" height="15" rx="4" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />

            {/* Perimeter Twin-Spar Chassis Frame */}
            <path d="M190 176 L195 125 L300 102 L240 148 Z" fill="none" stroke={primaryColor} strokeWidth="8" strokeLinejoin="round" />

            {/* Sharp Factory Radiator Shrouds & Fuel Tank */}
            <path d="M210 115 L295 102 L260 145 L205 130 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />
            <line x1="225" y1="125" x2="285" y2="115" stroke={accentColor} strokeWidth="4" />

            {/* Gripper Seat */}
            <path d="M145 120 Q195 112 245 116 L240 126 Q195 120 145 128 Z" fill="#020617" stroke="#334155" strokeWidth="2" />

            {/* High Motocross Beak Fender & Upswept Rear Guard */}
            <path d="M300 104 L365 110 L345 96 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />
            <path d="M110 132 L155 120 L170 126 Z" fill={primaryColor} />

            {/* 48mm Inverted Kashima Gold Stanchions */}
            <line x1="300" y1="96" x2="345" y2="176" stroke="url(#kashimaGold)" strokeWidth="8" strokeLinecap="round" />
            <line x1="312" y1="108" x2="345" y2="168" stroke="#1e293b" strokeWidth="4" />

            {/* Renthal FatBar with Bar Pad */}
            <line x1="295" y1="94" x2="302" y2="65" stroke="#cbd5e1" strokeWidth="4.5" />
            <line x1="290" y1="72" x2="318" y2="72" stroke="#0f172a" strokeWidth="4" />
            <circle cx="304" cy="72" r="5" fill={accentColor} />
            <line x1="278" y1="65" x2="330" y2="65" stroke="#020617" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 6: PHANTOM V-TWIN 1200 (Dark Custom Bobber)     */}
        {/* ---------------------------------------------------- */}
        {id === 'phantom_vtwin_1200' && (
          <g filter="url(#bikeDropShadow)">
            {/* Fat 16" Balloon Tires on Black Spoke Wheels */}
            <circle cx="100" cy="180" r="45" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="7" />
            <circle cx="100" cy="180" r="30" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={100}
                y1={180}
                x2={100 + Math.cos((d * Math.PI) / 180) * 29}
                y2={180 + Math.sin((d * Math.PI) / 180) * 29}
                stroke="#64748b"
                strokeWidth="2"
              />
            ))}
            <circle cx="100" cy="180" r="9" fill="#f8fafc" />

            <circle cx="340" cy="180" r="45" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="7" />
            <circle cx="340" cy="180" r="30" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={340}
                y1={180}
                x2={340 + Math.cos((d * Math.PI) / 180) * 29}
                y2={180 + Math.sin((d * Math.PI) / 180) * 29}
                stroke="#64748b"
                strokeWidth="2"
              />
            ))}
            <circle cx="340" cy="180" r="9" fill="#f8fafc" />

            {/* Massive 45° Air-Cooled V-Twin Engine Block */}
            {/* Rear Cylinder */}
            <polygon points="175,135 195,130 185,165 165,170" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            {/* Front Cylinder */}
            <polygon points="215,130 235,135 225,170 205,165" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
            {/* Crankcase Bottom */}
            <rect x="175" y="160" width="55" height="30" rx="6" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
            {/* Pushrod Chrome Tubes */}
            <line x1="182" y1="135" x2="175" y2="165" stroke="#f8fafc" strokeWidth="2.5" />
            <line x1="228" y1="135" x2="222" y2="165" stroke="#f8fafc" strokeWidth="2.5" />
            {/* Round Air Cleaner */}
            <circle cx="202" cy="148" r="10" fill="#cbd5e1" stroke="#334155" strokeWidth="2" />

            {/* Dual Staggered Matte-Black Drag Pipes */}
            <path d="M190 155 L165 186 L75 186" fill="none" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />
            <path d="M225 155 L200 194 L85 194" fill="none" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />

            {/* Peanut Teardrop Bobber Tank */}
            <path d="M210 125 Q250 105 285 120 Q245 140 210 134 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />

            {/* Solo Sprung Tractor Saddle */}
            <path d="M145 132 Q175 125 195 130 L190 138 Q170 134 145 138 Z" fill="#3f1a04" stroke="#78350f" strokeWidth="2" />
            <line x1="165" y1="138" x2="168" y2="152" stroke="#94a3b8" strokeWidth="5" strokeDasharray="2 2" />

            {/* Chopped Rear Bobber Fender */}
            <path d="M100 148 Q130 135 155 142" fill="none" stroke={primaryColor} strokeWidth="8" strokeLinecap="round" />

            {/* Deep Raked Chrome Front Forks */}
            <line x1="285" y1="115" x2="340" y2="180" stroke="#cbd5e1" strokeWidth="8" strokeLinecap="round" />
            <circle cx="310" cy="118" r="10" fill="#fef08a" stroke="#cbd5e1" strokeWidth="2.5" />

            {/* Wide Drag Handlebar */}
            <line x1="280" y1="110" x2="284" y2="88" stroke="#cbd5e1" strokeWidth="4" />
            <line x1="262" y1="90" x2="305" y2="90" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 7: SAHARA 800 DAKAR RALLY (Adventure Titan)     */}
        {/* ---------------------------------------------------- */}
        {id === 'sahara_800_rally' && (
          <g filter="url(#bikeDropShadow)">
            {/* Big 18" Rear & 21" Front Spoke Rally Wheels */}
            <circle cx="95" cy="180" r="44" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="95" cy="180" r="33" fill="none" stroke={accentColor} strokeWidth="3.5" />
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((d) => (
              <line
                key={d}
                x1={95}
                y1={180}
                x2={95 + Math.cos((d * Math.PI) / 180) * 32}
                y2={180 + Math.sin((d * Math.PI) / 180) * 32}
                stroke="#cbd5e1"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="95" cy="180" r="7" fill="#f8fafc" />

            <circle cx="345" cy="176" r="47" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="345" cy="176" r="35" fill="none" stroke={accentColor} strokeWidth="3.5" />
            {[0, 24, 48, 72, 96, 120, 144, 168, 192, 216, 240, 264, 288, 312, 336].map((d) => (
              <line
                key={d}
                x1={345}
                y1={176}
                x2={345 + Math.cos((d * Math.PI) / 180) * 34}
                y2={176 + Math.sin((d * Math.PI) / 180) * 34}
                stroke="#cbd5e1"
                strokeWidth="1.8"
              />
            ))}
            <circle cx="345" cy="176" r="7" fill="#f8fafc" />

            {/* Rally Aluminum Bash Skid Plate */}
            <polygon points="170,188 250,188 265,160 180,165" fill="#94a3b8" stroke="#334155" strokeWidth="2" />
            {/* 799cc LC8c Parallel Twin Engine */}
            <rect x="185" y="140" width="60" height="42" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="2" />

            {/* High-Level Upswept Titanium Akrapovic Silencer */}
            <path d="M230 152 Q260 145 220 120 Q150 115 110 125" fill="none" stroke="url(#heatBluedExhaust)" strokeWidth="6" strokeLinecap="round" />
            <rect x="90" y="120" width="52" height="15" rx="3" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />

            {/* Massive 24-Liter Dual Rally Fuel Cells */}
            <path d="M195 125 L295 105 L270 152 L190 145 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />

            {/* Tall Carbon Navigation Roadbook Tower with Stacked Dual LEDs */}
            <polygon points="295,105 315,50 330,50 310,105" fill="#0284c7" opacity="0.8" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="318" cy="70" r="4.5" fill="#fef08a" stroke="#ffffff" strokeWidth="1" />
            <circle cx="315" cy="85" r="4.5" fill="#fef08a" stroke="#ffffff" strokeWidth="1" />

            {/* Heavy-Duty Ergonomic Saddle & Rear Luggage Rack */}
            <path d="M140 126 Q185 120 220 124 L215 134 Q185 128 140 134 Z" fill="#020617" stroke="#334155" strokeWidth="2" />
            <line x1="105" y1="130" x2="140" y2="128" stroke="#94a3b8" strokeWidth="4" />

            {/* Long-Travel 240mm Inverted WP XPLOR White/Gold Forks */}
            <line x1="295" y1="100" x2="345" y2="176" stroke="url(#kashimaGold)" strokeWidth="8" strokeLinecap="round" />
            <line x1="305" y1="112" x2="345" y2="168" stroke="#f8fafc" strokeWidth="4" />

            {/* High Rally Handlebars with Handguards */}
            <line x1="290" y1="98" x2="295" y2="70" stroke="#cbd5e1" strokeWidth="4.5" />
            <line x1="280" y1="72" x2="320" y2="72" stroke="#0f172a" strokeWidth="6" strokeLinecap="round" />
            <rect x="312" y="66" width="10" height="12" rx="3" fill={primaryColor} />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 8: VORTEX NINJA 600 RR (Supersport Screamer)    */}
        {/* ---------------------------------------------------- */}
        {id === 'vortex_ninja_600' && (
          <g filter="url(#bikeDropShadow)">
            {/* 17" Racing Mag Wheels with Green/Accent Ring */}
            <circle cx="100" cy="180" r="42" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="5.5" />
            <circle cx="100" cy="180" r="32" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 72, 144, 216, 288].map((d) => (
              <line
                key={d}
                x1={100}
                y1={180}
                x2={100 + Math.cos((d * Math.PI) / 180) * 31}
                y2={180 + Math.sin((d * Math.PI) / 180) * 31}
                stroke="#64748b"
                strokeWidth="3.5"
              />
            ))}
            <circle cx="100" cy="180" r="8" fill="#f8fafc" />

            <circle cx="340" cy="180" r="42" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="5.5" />
            <circle cx="340" cy="180" r="32" fill="none" stroke={accentColor} strokeWidth="3" />
            {[0, 72, 144, 216, 288].map((d) => (
              <line
                key={d}
                x1={340}
                y1={180}
                x2={340 + Math.cos((d * Math.PI) / 180) * 31}
                y2={180 + Math.sin((d * Math.PI) / 180) * 31}
                stroke="#64748b"
                strokeWidth="3.5"
              />
            ))}
            {/* Dual 310mm Wave Petal Rotors with Radial Nissin Caliper */}
            <circle cx="340" cy="180" r="24" fill="none" stroke="#cbd5e1" strokeWidth="3.5" strokeDasharray="5 3" />
            <rect x="320" y="170" width="10" height="16" rx="2" fill="#eab308" />
            <circle cx="340" cy="180" r="8" fill="#f8fafc" />

            {/* Aluminum Gullwing Swingarm */}
            <path d="M100 180 L200 176 L190 156 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="2" />

            {/* Side Upswept Carbon Racing Canister */}
            <path d="M195 180 L160 170 L130 145 L150 140 Z" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />

            {/* Full Wind-Tunnel Aerodynamic Supersport Fairings */}
            <path
              d="M190 182 L275 182 L290 140 L330 115 L280 88 L210 98 L170 130 L180 170 Z"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Fairing Strakes & Ram-Air Intake */}
            <polygon points="260,135 290,132 278,148" fill="#020617" />
            <line x1="230" y1="150" x2="275" y2="150" stroke={accentColor} strokeWidth="3.5" />

            {/* Aerodynamic Bubble Windscreen */}
            <path d="M280 88 Q308 72 328 98 Z" fill="#0284c7" opacity="0.75" stroke="#ffffff" strokeWidth="1.5" />

            {/* Twin Angular Projector Headlights */}
            <polygon points="325,110 338,112 330,120" fill="#fef08a" />

            {/* Clip-On Dropped Bars */}
            <line x1="285" y1="92" x2="292" y2="80" stroke="#94a3b8" strokeWidth="3.5" />
            <line x1="282" y1="80" x2="305" y2="82" stroke="#020617" strokeWidth="4.5" strokeLinecap="round" />

            {/* Sculpted Race Tank & Solo Seat with Tail Cowl */}
            <path d="M210 98 Q250 82 280 92 L270 112 L205 112 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1.5" />
            <path d="M150 120 L205 112 L198 124 L155 126 Z" fill="#020617" stroke="#334155" strokeWidth="1.5" />
            <path d="M110 126 L160 120 L155 132 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />

            {/* Showa Big Piston USD Forks */}
            <line x1="295" y1="94" x2="340" y2="180" stroke="url(#kashimaGold)" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 9: VENOM PANIGALE 1100 V4 (Flagship Exotic)     */}
        {/* ---------------------------------------------------- */}
        {id === 'venom_panigale_v4' && (
          <g filter="url(#bikeDropShadow)">
            {/* Single-Sided Swingarm Rear Wheel (Exposed Forged Y-Spoke Rim) */}
            <circle cx="95" cy="180" r="43" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="95" cy="180" r="33" fill="none" stroke={accentColor} strokeWidth="3.5" />
            {[0, 120, 240].map((d) => (
              <g key={d}>
                <line
                  x1={95}
                  y1={180}
                  x2={95 + Math.cos((d * Math.PI) / 180) * 32}
                  y2={180 + Math.sin((d * Math.PI) / 180) * 32}
                  stroke="#cbd5e1"
                  strokeWidth="5"
                />
                <line
                  x1={95 + Math.cos((d * Math.PI) / 180) * 16}
                  y1={180 + Math.sin((d * Math.PI) / 180) * 16}
                  x2={95 + Math.cos(((d + 20) * Math.PI) / 180) * 32}
                  y2={180 + Math.sin(((d + 20) * Math.PI) / 180) * 32}
                  stroke="#cbd5e1"
                  strokeWidth="3.5"
                />
              </g>
            ))}
            <circle cx="95" cy="180" r="10" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2.5" />
            <polygon points="95,175 99,183 91,183" fill="#eab308" />

            {/* Front Wheel with Brembo Stylema Radial Monobloc Caliper */}
            <circle cx="345" cy="180" r="43" fill="url(#tireRubber)" stroke="#090d16" strokeWidth="6" />
            <circle cx="345" cy="180" r="33" fill="none" stroke={accentColor} strokeWidth="3.5" />
            {[0, 120, 240].map((d) => (
              <g key={d}>
                <line
                  x1={345}
                  y1={180}
                  x2={345 + Math.cos((d * Math.PI) / 180) * 32}
                  y2={180 + Math.sin((d * Math.PI) / 180) * 32}
                  stroke="#cbd5e1"
                  strokeWidth="5"
                />
              </g>
            ))}
            <circle cx="345" cy="180" r="26" fill="none" stroke="#cbd5e1" strokeWidth="4" strokeDasharray="6 3" />
            <rect x="322" y="168" width="12" height="18" rx="2" fill="#dc2626" />
            <circle cx="345" cy="180" r="8" fill="#f8fafc" />

            {/* Single-Sided Sculpted Aluminum Swingarm */}
            <path d="M95 180 L205 174 L190 152 Z" fill="url(#metalChrome)" stroke="#334155" strokeWidth="2.5" />

            {/* Desmosedici Stradale V4 Engine with Dry Clutch Window */}
            <rect x="195" y="145" width="60" height="42" rx="4" fill="#0f172a" stroke="#dc2626" strokeWidth="2" />
            <circle cx="230" cy="168" r="12" fill="#b45309" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 2" />

            {/* Underbelly Twin Titanium Exhaust Exits */}
            <polygon points="215,188 185,192 185,182 215,180" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />

            {/* Double Biplane Carbon Fiber Aerodynamic Winglets */}
            <polygon points="310,125 340,118 335,130 305,132" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />
            <polygon points="315,138 345,132 340,142 312,144" fill="#020617" stroke="#38bdf8" strokeWidth="1.5" />

            {/* Full Italian Red Fairings with Aggressive Cutouts */}
            <path
              d="M195 182 L285 182 L300 135 L345 105 L290 82 L215 92 L165 125 L180 168 Z"
              fill={primaryColor}
              stroke="#ffffff"
              strokeWidth="2"
            />
            {/* Air Vent Strakes */}
            <polygon points="265,135 295,128 285,145" fill="#020617" />
            <line x1="230" y1="145" x2="280" y2="145" stroke={accentColor} strokeWidth="3.5" />

            {/* Windscreen Bubble */}
            <path d="M290 82 Q320 68 342 92 Z" fill="#0284c7" opacity="0.8" stroke="#ffffff" strokeWidth="1.5" />
            {/* Twin Menacing Slit LED Headlights */}
            <polygon points="335,102 348,104 340,110" fill="#fef08a" />

            {/* Red Tubular Trellis Subframe */}
            <line x1="165" y1="125" x2="215" y2="92" stroke="#dc2626" strokeWidth="4.5" />

            {/* Sculpted Fuel Tank & Race Tail with Aero Vent Channels */}
            <path d="M215 92 Q260 76 290 86 L280 106 L210 106 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="1.5" />
            <path d="M145 116 L210 106 L202 118 L150 122 Z" fill="#020617" stroke="#334155" strokeWidth="1.5" />
            <path d="M100 120 L155 114 L150 128 Z" fill={primaryColor} stroke="#ffffff" strokeWidth="2" />
            {/* Tail Wing Aero Channel */}
            <polygon points="110,122 135,118 130,126" fill="#020617" />

            {/* Öhlins Electronic Gold USD Forks */}
            <line x1="300" y1="88" x2="345" y2="180" stroke="url(#kashimaGold)" strokeWidth="8" strokeLinecap="round" />
          </g>
        )}

        {/* ---------------------------------------------------- */}
        {/* TIER 10: APEX VEKTOR HYPER-PROTO (Apex Prototype)    */}
        {/* ---------------------------------------------------- */}
        {id === 'apex_vektor_hyper' && (
          <g filter="url(#bikeDropShadow)">
            {/* Hubless Rear Magnetic Lightwheel */}
            <circle cx="95" cy="180" r="45" fill="#030712" stroke={accentColor} strokeWidth="6" />
            <circle cx="95" cy="180" r="32" fill="#050814" stroke="#00f0ff" strokeWidth="3.5" />
            <circle cx="95" cy="180" r="20" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 3" />
            {/* Plasma Energy Core Arc */}
            <path d="M75 180 A20 20 0 0 1 115 180" fill="none" stroke="#ec4899" strokeWidth="4" />

            {/* Hubless Front Magnetic Lightwheel */}
            <circle cx="345" cy="180" r="45" fill="#030712" stroke={accentColor} strokeWidth="6" />
            <circle cx="345" cy="180" r="32" fill="#050814" stroke="#00f0ff" strokeWidth="3.5" />
            <circle cx="345" cy="180" r="20" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="6 3" />
            <path d="M325 180 A20 20 0 0 1 365 180" fill="none" stroke="#ec4899" strokeWidth="4" />

            {/* Hub-Center Steering Swingarm Assembly */}
            <line x1="95" y1="180" x2="195" y2="175" stroke="#38bdf8" strokeWidth="5" />
            <line x1="345" y1="180" x2="255" y2="175" stroke="#38bdf8" strokeWidth="5" />

            {/* Streamlined Forged-Carbon Monocoque Aerodynamic Body */}
            <path
              d="M90 178 Q130 90 210 82 Q305 76 360 148 L315 192 L150 192 Z"
              fill="#090d16"
              stroke={primaryColor}
              strokeWidth="4"
            />

            {/* Glowing Luminous Quantum Circuit Traces */}
            <path d="M140 172 L210 135 L300 135 L335 158" fill="none" stroke={accentColor} strokeWidth="3.5" strokeLinecap="round" />
            <line x1="185" y1="110" x2="270" y2="110" stroke="#00f0ff" strokeWidth="3" />
            <line x1="160" y1="145" x2="245" y2="145" stroke="#ec4899" strokeWidth="3" />

            {/* Active Aerodynamic Variable Plasma Wing Flaps */}
            <polygon points="280,125 320,118 315,130 275,132" fill="#00f0ff" opacity="0.9" />
            <polygon points="120,125 160,118 155,130 115,132" fill="#ec4899" opacity="0.9" />

            {/* Recessed Holographic HUD Canopy Screen */}
            <path d="M185 96 Q245 85 295 98 Q260 115 195 114 Z" fill="#00f0ff" opacity="0.6" stroke="#ffffff" strokeWidth="1.5" />

            {/* Laser Matrix Headlight Array */}
            <polygon points="350,140 365,142 355,152" fill="#ffffff" />
            <circle cx="358" cy="144" r="3" fill="#00f0ff" />

            {/* Plasma Reaction Exhaust Vent */}
            <polygon points="80,172 90,165 90,185" fill={accentColor} />
            {isRevving && (
              <polygon points="65,172 80,165 80,185" fill="#00f0ff" opacity="0.8" />
            )}
          </g>
        )}
      </svg>
    </div>
  );
};
