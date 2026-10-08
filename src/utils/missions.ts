import { DailyMission, PlayerProgress } from '../types/game';

export const ALL_MISSION_TEMPLATES: Omit<DailyMission, 'current' | 'completed' | 'claimed'>[] = [
  {
    id: 'mission_backflips',
    gameId: 'trials',
    title: 'Backflip Virtuoso',
    description: 'Perform 5 clean 360° backflips in Moto Trials Extreme',
    objectiveType: 'backflips',
    target: 5,
    rewardCoins: 250,
    unit: 'flips',
  },
  {
    id: 'mission_speed_trials',
    gameId: 'trials',
    title: 'Sub-30 Speedrun',
    description: 'Finish any Moto Trials track in under 30 seconds',
    objectiveType: 'finish_under_time',
    target: 30, // seconds or less
    rewardCoins: 300,
    unit: 'sec',
  },
  {
    id: 'mission_near_misses',
    gameId: 'highway',
    title: 'Lane Splitter',
    description: 'Execute 6 close near-miss passes in Highway Moto Rush',
    objectiveType: 'near_misses',
    target: 6,
    rewardCoins: 200,
    unit: 'near-misses',
  },
  {
    id: 'mission_bmx_tricks',
    gameId: 'bmx',
    title: 'Skatepark Stunt King',
    description: 'Land 5 aerial stunts (Superman, Tailwhip, or Barspin) in BMX Master',
    objectiveType: 'bmx_tricks',
    target: 5,
    rewardCoins: 250,
    unit: 'stunts',
  },
  {
    id: 'mission_cyber_rivals',
    gameId: 'cyber',
    title: 'Grid Hunter',
    description: 'De-resolve 2 rival AI cycles in Cyber Neon Grid',
    objectiveType: 'cyber_rivals',
    target: 2,
    rewardCoins: 300,
    unit: 'rivals',
  },
  {
    id: 'mission_coins_collector',
    gameId: 'any',
    title: 'Golden Hoarder',
    description: 'Collect 12 gold coins across any game mode',
    objectiveType: 'coins_collected',
    target: 12,
    rewardCoins: 200,
    unit: 'coins',
  },
];

export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function generateDailyMissions(dateStr: string): DailyMission[] {
  // Deterministic pseudo-random selection based on date string hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) % 100000;
  }

  // Always include backflips and speedrun as requested by user, plus 2 rotating missions
  const selected: DailyMission[] = [
    {
      ...ALL_MISSION_TEMPLATES[0], // backflips
      current: 0,
      completed: false,
      claimed: false,
    },
    {
      ...ALL_MISSION_TEMPLATES[1], // finish under 30 seconds
      current: 0,
      completed: false,
      claimed: false,
    },
  ];

  // Pick remaining 2 from the rest of the pool
  const pool = ALL_MISSION_TEMPLATES.slice(2);
  const rot1 = hash % pool.length;
  const rot2 = (hash + 1) % pool.length;

  selected.push({
    ...pool[rot1],
    current: 0,
    completed: false,
    claimed: false,
  });

  if (rot1 !== rot2) {
    selected.push({
      ...pool[rot2],
      current: 0,
      completed: false,
      claimed: false,
    });
  } else {
    selected.push({
      ...pool[(rot2 + 1) % pool.length],
      current: 0,
      completed: false,
      claimed: false,
    });
  }

  return selected;
}

export function ensureDailyMissions(progress: PlayerProgress): PlayerProgress {
  const todayStr = getTodayDateString();

  if (!progress.dailyMissions || progress.dailyMissionDate !== todayStr) {
    return {
      ...progress,
      dailyMissionDate: todayStr,
      dailyMissions: generateDailyMissions(todayStr),
      allMissionsBonusClaimed: false,
    };
  }

  return progress;
}

export interface ProgressResult {
  updatedProgress: PlayerProgress;
  newlyCompletedMission: DailyMission | null;
}

export function recordMissionProgress(
  progress: PlayerProgress,
  objectiveType: DailyMission['objectiveType'],
  amount: number,
  metadata?: { timeSeconds?: number }
): ProgressResult {
  const guaranteedProgress = ensureDailyMissions(progress);
  let newlyCompleted: DailyMission | null = null;

  const updatedMissions = (guaranteedProgress.dailyMissions || []).map((m) => {
    if (m.completed || m.objectiveType !== objectiveType) {
      return m;
    }

    let updatedCurrent = m.current;
    let isCompleted = false;

    if (objectiveType === 'finish_under_time') {
      const timeSec = metadata?.timeSeconds ?? amount;
      if (timeSec <= m.target && timeSec > 0) {
        updatedCurrent = 1;
        isCompleted = true;
      }
    } else {
      updatedCurrent = Math.min(m.target, m.current + amount);
      if (updatedCurrent >= m.target) {
        isCompleted = true;
      }
    }

    if (isCompleted && !m.completed) {
      newlyCompleted = { ...m, current: updatedCurrent, completed: true };
      return newlyCompleted;
    }

    return {
      ...m,
      current: updatedCurrent,
      completed: isCompleted,
    };
  });

  return {
    updatedProgress: {
      ...guaranteedProgress,
      dailyMissions: updatedMissions,
    },
    newlyCompletedMission: newlyCompleted,
  };
}

export function claimMissionReward(
  progress: PlayerProgress,
  missionId: string
): { updatedProgress: PlayerProgress; coinsAdded: number } {
  let coinsAdded = 0;

  const updatedMissions = (progress.dailyMissions || []).map((m) => {
    if (m.id === missionId && m.completed && !m.claimed) {
      coinsAdded = m.rewardCoins;
      return { ...m, claimed: true };
    }
    return m;
  });

  return {
    updatedProgress: {
      ...progress,
      coins: progress.coins + coinsAdded,
      dailyMissions: updatedMissions,
    },
    coinsAdded,
  };
}

export function claimAllMissionsBonus(
  progress: PlayerProgress
): { updatedProgress: PlayerProgress; coinsAdded: number } {
  const allCompleted = (progress.dailyMissions || []).every((m) => m.completed);
  if (!allCompleted || progress.allMissionsBonusClaimed) {
    return { updatedProgress: progress, coinsAdded: 0 };
  }

  const bonusCoins = 500;
  return {
    updatedProgress: {
      ...progress,
      coins: progress.coins + bonusCoins,
      allMissionsBonusClaimed: true,
    },
    coinsAdded: bonusCoins,
  };
}
