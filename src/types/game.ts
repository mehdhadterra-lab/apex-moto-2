export type GameId = 'trials' | 'highway' | 'bmx' | 'cyber';

export interface DailyMission {
  id: string;
  gameId: GameId | 'any';
  title: string;
  description: string;
  objectiveType: 'backflips' | 'finish_under_time' | 'near_misses' | 'bmx_tricks' | 'cyber_rivals' | 'coins_collected';
  target: number;
  current: number;
  rewardCoins: number;
  completed: boolean;
  claimed: boolean;
  unit?: string;
}

export interface GameMetadata {
  id: GameId;
  title: string;
  tagline: string;
  category: string;
  difficulty: 'Beginner' | 'Medium' | 'Hard' | 'Extreme';
  rating: number;
  playersCount: string;
  coverImage: string;
  description: string;
  features: string[];
  controlsList: { key: string; action: string }[];
}

export interface BikeConfig {
  id: string;
  name: string;
  category: 'Dirt Trial' | 'Superbike' | 'BMX' | 'Cyber' | 'Classic' | 'Cruiser' | 'Adventure Rally' | 'Electric' | 'ATV Quad';
  tier: number; // 1 to 10
  topSpeed: number; // 1-10
  acceleration: number; // 1-10
  agility: number; // 1-10
  suspension: number; // 1-10
  brakingPower?: number; // 1-10
  cost: number;
  unlocked: boolean;
  color: string;
  accentColor: string;
  trailType: 'dust' | 'fire' | 'neon' | 'smoke';
  engineType?: string;
  weightKg?: number;
  horsepower?: number;
  topSpeedKmh?: number;
  zeroToHundred?: string;
  soundType?: 'single_4t' | 'inline4' | 'bmx' | 'vtwin' | 'electric' | 'cyber';
  description?: string;
}

export interface StreakRewardTier {
  day: number;
  rewardCoins: number;
  multiplier: number;
  title: string;
}

export interface StreakData {
  currentStreak: number;
  highestStreak: number;
  lastLoginDate: string;
  lastClaimedDate: string;
}

export interface BikeUpgradeStages {
  engineStage: number; // 0-3
  tireStage: number;   // 0-3
  suspensionStage: number; // 0-3
  nitroStage: number;  // 0-3
}

export interface PlayerProgress {
  coins: number;
  selectedBikeId: string;
  unlockedBikes: string[];
  bikeCustomizations: Record<string, {
    color: string;
    accentColor: string;
    trailType: string;
  }>;
  bikeUpgrades?: Record<string, BikeUpgradeStages>;
  highScores: Record<GameId, number>;
  bestTimes: Record<string, number>;
  stuntsLanded: number;
  dailyMissions?: DailyMission[];
  dailyMissionDate?: string;
  allMissionsBonusClaimed?: boolean;
  streak?: StreakData;
}
