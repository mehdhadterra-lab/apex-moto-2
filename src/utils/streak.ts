import { PlayerProgress, StreakData, StreakRewardTier } from '../types/game';
import { getTodayDateString } from './missions';

export const STREAK_REWARD_TIERS: StreakRewardTier[] = [
  { day: 1, rewardCoins: 100, multiplier: 1.0, title: 'Day 1 Starter' },
  { day: 2, rewardCoins: 150, multiplier: 1.2, title: 'Day 2 Spark' },
  { day: 3, rewardCoins: 200, multiplier: 1.4, title: 'Day 3 Momentum' },
  { day: 4, rewardCoins: 250, multiplier: 1.6, title: 'Day 4 Ignition' },
  { day: 5, rewardCoins: 350, multiplier: 1.8, title: 'Day 5 Blaze' },
  { day: 6, rewardCoins: 500, multiplier: 2.0, title: 'Day 6 Inferno' },
  { day: 7, rewardCoins: 1000, multiplier: 2.5, title: 'Day 7 Apex Legend' },
];

export function getYesterdayDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getTierForDay(streakDay: number): StreakRewardTier {
  const clampedDay = Math.min(Math.max(1, streakDay), 7);
  const baseTier = STREAK_REWARD_TIERS[clampedDay - 1];

  if (streakDay > 7) {
    return {
      day: streakDay,
      rewardCoins: 1000,
      multiplier: 2.5,
      title: `Day ${streakDay} Apex Streak`,
    };
  }

  return baseTier;
}

export function getCurrentMultiplier(streak?: StreakData): number {
  if (!streak || streak.currentStreak <= 0) return 1.0;
  return getTierForDay(streak.currentStreak).multiplier;
}

export function ensureStreakData(progress: PlayerProgress): {
  updatedProgress: PlayerProgress;
  canClaimToday: boolean;
  streakAdvanced: boolean;
} {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();

  let streak = progress.streak;

  if (!streak) {
    streak = {
      currentStreak: 1,
      highestStreak: 1,
      lastLoginDate: today,
      lastClaimedDate: '',
    };
    return {
      updatedProgress: {
        ...progress,
        streak,
      },
      canClaimToday: true,
      streakAdvanced: true,
    };
  }

  let streakAdvanced = false;

  if (streak.lastLoginDate === today) {
    // Already logged in today
    const canClaim = streak.lastClaimedDate !== today;
    return {
      updatedProgress: progress,
      canClaimToday: canClaim,
      streakAdvanced: false,
    };
  } else if (streak.lastLoginDate === yesterday) {
    // Consecutive day login! Advance streak
    const newStreakCount = streak.currentStreak + 1;
    const newHighest = Math.max(streak.highestStreak, newStreakCount);
    streakAdvanced = true;

    const updatedStreak: StreakData = {
      currentStreak: newStreakCount,
      highestStreak: newHighest,
      lastLoginDate: today,
      lastClaimedDate: streak.lastClaimedDate,
    };

    return {
      updatedProgress: {
        ...progress,
        streak: updatedStreak,
      },
      canClaimToday: true,
      streakAdvanced,
    };
  } else {
    // Missed a day or more: streak resets to Day 1
    const updatedStreak: StreakData = {
      currentStreak: 1,
      highestStreak: streak.highestStreak,
      lastLoginDate: today,
      lastClaimedDate: '',
    };

    return {
      updatedProgress: {
        ...progress,
        streak: updatedStreak,
      },
      canClaimToday: true,
      streakAdvanced: false,
    };
  }
}

export function claimDailyStreakBonus(progress: PlayerProgress): {
  updatedProgress: PlayerProgress;
  coinsAwarded: number;
  multiplier: number;
} {
  const today = getTodayDateString();
  const streak = progress.streak || {
    currentStreak: 1,
    highestStreak: 1,
    lastLoginDate: today,
    lastClaimedDate: '',
  };

  if (streak.lastClaimedDate === today) {
    return {
      updatedProgress: progress,
      coinsAwarded: 0,
      multiplier: getCurrentMultiplier(streak),
    };
  }

  const tier = getTierForDay(streak.currentStreak);
  const coinsAwarded = tier.rewardCoins;

  const updatedStreak: StreakData = {
    ...streak,
    lastLoginDate: today,
    lastClaimedDate: today,
  };

  return {
    updatedProgress: {
      ...progress,
      coins: progress.coins + coinsAwarded,
      streak: updatedStreak,
    },
    coinsAwarded,
    multiplier: tier.multiplier,
  };
}

/**
 * Calculates earnings with the progressive coin multiplier applied
 */
export function calculateMultipliedCoins(baseCoins: number, progress: PlayerProgress): {
  totalCoins: number;
  bonusCoins: number;
  multiplier: number;
} {
  const multiplier = getCurrentMultiplier(progress.streak);
  const totalCoins = Math.floor(baseCoins * multiplier);
  const bonusCoins = totalCoins - baseCoins;

  return {
    totalCoins,
    bonusCoins,
    multiplier,
  };
}
