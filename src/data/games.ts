import { GameMetadata } from '../types/game';

import trialsImage from '../assets/images/bike_trial_extreme_1791448190381.jpg';
import highwayImage from '../assets/images/bike_highway_racer_1791448202783.jpg';
import bmxImage from '../assets/images/bike_bmx_freestyle_1791448213925.jpg';
import cyberImage from '../assets/images/bike_cyber_neon_1791448224357.jpg';

export const GAMES: GameMetadata[] = [
  {
    id: 'trials',
    title: 'Moto Trials Extreme',
    tagline: 'Defy gravity over steep ramps, loop-de-loops, and brutal rocky terrain',
    category: 'Physics Trials',
    difficulty: 'Hard',
    rating: 4.9,
    playersCount: '24.8K',
    coverImage: trialsImage,
    description: 'An adrenaline-charged 2D physics trial bike simulator. Balance your rider weight, master mid-air backflips and frontflips, conquer vertical cliff faces, explosive barrels, and loop-de-loops without crashing your helmet.',
    features: [
      'Authentic ragdoll bike suspension and chassis physics',
      'Continuous 360° backflip and frontflip aerial stunt bonuses',
      '3 distinct tracks: Canyon Dunes, Industrial Quarry, and Alpine Peak',
      'Checkpoint respawn and instant retry key',
    ],
    controlsList: [
      { key: 'W / ↑', action: 'Throttle / Accelerate' },
      { key: 'S / ↓', action: 'Brake / Reverse' },
      { key: 'A / ←', action: 'Lean Back (Wheelie / Backflip)' },
      { key: 'D / →', action: 'Lean Forward (Stoppie / Frontflip)' },
      { key: 'Space', action: 'Bunny Hop' },
      { key: 'R', action: 'Quick Restart' },
    ],
  },
  {
    id: 'highway',
    title: 'Highway Moto Rush',
    tagline: 'Weave through high-speed traffic lanes with nitro surges and near-misses',
    category: 'Traffic Racer',
    difficulty: 'Medium',
    rating: 4.8,
    playersCount: '31.2K',
    coverImage: highwayImage,
    description: 'Push your superbike to 280+ km/h as you split lanes on a buzzing multi-lane expressway. Earn near-miss multipliers by shaving inches off oncoming trucks and sports cars, grab nitro canisters, and outrun the traffic gridlock.',
    features: [
      'High-octane pseudo-3D parallax highway perspective',
      'Dynamic traffic system: Semis, sedans, fuel tankers, and sports cars',
      'High-risk Near-Miss combo multiplier score engine',
      'Nitro boost gauge with camera shake effects',
    ],
    controlsList: [
      { key: 'A / ←', action: 'Steer Left' },
      { key: 'D / →', action: 'Steer Right' },
      { key: 'W / ↑', action: 'Full Throttle' },
      { key: 'S / ↓', action: 'Hard Brake' },
      { key: 'Space', action: 'Nitro Boost' },
    ],
  },
  {
    id: 'bmx',
    title: 'BMX Trick Master',
    tagline: 'Drop into massive half-pipes and chain sick combos: Tailwhip, Superman & 360',
    category: 'Stunt Freestyle',
    difficulty: 'Medium',
    rating: 4.9,
    playersCount: '19.4K',
    coverImage: bmxImage,
    description: 'Drop into the sunset concrete skatepark bowl and spine. Pump speed through the half-pipe transitions, soar 20 feet into the air, and execute technical street tricks including Supermans, Barspins, Tailwhips, and 360 rotations.',
    features: [
      'Flow physics: Pump curves to build huge vertical air',
      'Multi-trick input: Chain Superman, Tailwhip, and Barspin combos',
      'Realistic landing angle calculation (avoid bail outs!)',
      '60-second contest run mode with live crowd cheers',
    ],
    controlsList: [
      { key: 'A / D (← / →)', action: 'Pump / Lean / Air Spin' },
      { key: 'W (↑)', action: 'Superman Stunt' },
      { key: 'Q', action: 'Tailwhip' },
      { key: 'E', action: 'Barspin' },
      { key: 'Space', action: 'Bunny Hop / Launch' },
    ],
  },
  {
    id: 'cyber',
    title: 'Cyber Neon Grid',
    tagline: 'High-speed lightbike survival arena against aggressive digital rivals',
    category: 'Arcade Survival',
    difficulty: 'Extreme',
    rating: 4.7,
    playersCount: '15.6K',
    coverImage: cyberImage,
    description: 'Step into the neon grid. Command an agile light cycle laying luminous digital energy trails. Outmaneuver 3 ruthless AI grid racers, collect shield cells, and trap your opponents in high-speed tactical turns.',
    features: [
      '60 FPS dynamic light trail collision mechanics',
      'Adaptive AI opponents with aggressive trapping tactics',
      'Shield powerups and speed turbo pads',
      'Synthwave visual grid with particle shockwaves',
    ],
    controlsList: [
      { key: 'W / A / S / D', action: 'Steer Cyberbike Direction' },
      { key: 'Arrow Keys', action: 'Alternative Direction Keys' },
      { key: 'Space', action: 'Turbo Overdrive' },
    ],
  },
];
