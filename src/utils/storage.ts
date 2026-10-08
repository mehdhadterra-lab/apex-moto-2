import { PlayerProgress, GameId } from '../types/game';
import { ensureDailyMissions } from './missions';
import { ensureStreakData } from './streak';

const STORAGE_KEY = 'apex_moto_player_progress_v1';

export const DEFAULT_PROGRESS: PlayerProgress = {
  coins: 450,
  selectedBikeId: 'trail_scout_125',
  unlockedBikes: ['trail_scout_125'],
  bikeCustomizations: {
    trail_scout_125: {
      color: '#f59e0b',
      accentColor: '#10b981',
      trailType: 'dust',
    },
    urban_pulse_250: {
      color: '#3b82f6',
      accentColor: '#f59e0b',
      trailType: 'smoke',
    },
    kink_apex_bmx: {
      color: '#06b6d4',
      accentColor: '#a855f7',
      trailType: 'smoke',
    },
    ghost_cafe_500: {
      color: '#e2e8f0',
      accentColor: '#dc2626',
      trailType: 'smoke',
    },
    mudslinger_450_sx: {
      color: '#84cc16',
      accentColor: '#eab308',
      trailType: 'dust',
    },
    phantom_vtwin_1200: {
      color: '#475569',
      accentColor: '#f59e0b',
      trailType: 'fire',
    },
    sahara_800_rally: {
      color: '#f97316',
      accentColor: '#38bdf8',
      trailType: 'dust',
    },
    vortex_ninja_600: {
      color: '#10b981',
      accentColor: '#06b6d4',
      trailType: 'fire',
    },
    venom_panigale_v4: {
      color: '#ef4444',
      accentColor: '#facc15',
      trailType: 'fire',
    },
    apex_vektor_hyper: {
      color: '#00f0ff',
      accentColor: '#ec4899',
      trailType: 'neon',
    },
  },
  bikeUpgrades: {},
  highScores: {
    trials: 3200,
    highway: 4850,
    bmx: 5400,
    cyber: 2600,
  },
  bestTimes: {
    'trials_canyon': 34.2,
    'trials_quarry': 48.7,
    'trials_alpine': 56.4,
  },
  stuntsLanded: 28,
};

const LEGACY_BIKE_MAP: Record<string, string> = {
  apex_dirt_250: 'trail_scout_125',
  bmx_pro_street: 'kink_apex_bmx',
  viper_rr_1000: 'vortex_ninja_600',
  enduro_trail_boss: 'mudslinger_450_sx',
  ghost_cafe_650: 'ghost_cafe_500',
  phantom_vtwin_1200: 'phantom_vtwin_1200',
  dakar_rally_700: 'sahara_800_rally',
  hyperion_electric_sm: 'vortex_ninja_600',
  dune_ripper_atv: 'sahara_800_rally',
  cyber_tron_x: 'apex_vektor_hyper',
};

export function loadPlayerProgress(): PlayerProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initialized = ensureDailyMissions(DEFAULT_PROGRESS);
      return ensureStreakData(initialized).updatedProgress;
    }
    const parsed = JSON.parse(raw);
    const selectedBike = LEGACY_BIKE_MAP[parsed.selectedBikeId] || parsed.selectedBikeId || DEFAULT_PROGRESS.selectedBikeId;
    const unlocked = Array.isArray(parsed.unlockedBikes)
      ? Array.from(new Set(parsed.unlockedBikes.map((id: string) => LEGACY_BIKE_MAP[id] || id)))
      : DEFAULT_PROGRESS.unlockedBikes;

    const combined: PlayerProgress = {
      ...DEFAULT_PROGRESS,
      ...parsed,
      selectedBikeId: selectedBike,
      unlockedBikes: unlocked,
      highScores: {
        ...DEFAULT_PROGRESS.highScores,
        ...(parsed.highScores || {}),
      },
      bikeCustomizations: {
        ...DEFAULT_PROGRESS.bikeCustomizations,
        ...(parsed.bikeCustomizations || {}),
      },
      bikeUpgrades: {
        ...(DEFAULT_PROGRESS.bikeUpgrades || {}),
        ...(parsed.bikeUpgrades || {}),
      },
    };
    const withMissions = ensureDailyMissions(combined);
    return ensureStreakData(withMissions).updatedProgress;
  } catch {
    const initialized = ensureDailyMissions(DEFAULT_PROGRESS);
    return ensureStreakData(initialized).updatedProgress;
  }
}

export function savePlayerProgress(progress: PlayerProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage quota
  }
}

export function addCoins(amount: number): number {
  const current = loadPlayerProgress();
  current.coins += amount;
  savePlayerProgress(current);
  return current.coins;
}

export function updateHighScore(gameId: GameId, score: number): boolean {
  const current = loadPlayerProgress();
  const prev = current.highScores[gameId] || 0;
  if (score > prev) {
    current.highScores[gameId] = score;
    savePlayerProgress(current);
    return true;
  }
  return false;
}
